import { useSyncExternalStore } from "react";
import { clear, load, save } from "./persist";
import { parseBoardingPass, type BoardingPass } from "./bcbp";
import { looksLikeFlight } from "./scan";

/**
 * The traveller's documents.
 *
 * Boarding passes and hotel codes, kept on the device and nowhere else. That is
 * not a promise about a privacy policy — this app has no backend, so there is
 * no server for a document to reach. The screen says so plainly, because a
 * scanned boarding pass carries a real name and a real booking reference and
 * somebody is entitled to know where it went.
 *
 * `raw` is always kept, even when parsing succeeded. A parser can be wrong, and
 * the string it was wrong about is the only way anybody could tell.
 */

export const DOCS_KEY = "resomap_docs";

export type DocKind = "flight" | "hotel" | "other";

export interface TravelDoc {
  id: string;
  kind: DocKind;
  addedAt: number;
  /** Exactly what was scanned or pasted. Never discarded. */
  raw: string;
  /** Only when `raw` genuinely parsed as a boarding pass. */
  flight?: BoardingPass;
  /** What the traveller typed, for everything a standard cannot supply. */
  manual?: { title?: string; date?: string; note?: string };
  /** The barcode's own format, when it came from a scan. */
  format?: string;
}

/* --------------------------------------------------------------- the store */

/** Dates do not survive JSON; the flight is re-derived from `raw` on read. */
type Stored = Omit<TravelDoc, "flight">;

function hydrate(d: Stored): TravelDoc {
  const flight = d.kind === "flight" ? (parseBoardingPass(d.raw) ?? undefined) : undefined;
  return { ...d, flight };
}

let state: TravelDoc[] = load<Stored[]>(DOCS_KEY, []).map(hydrate);
const watchers = new Set<() => void>();

function commit(next: TravelDoc[]) {
  state = next;
  /* The parsed flight is derived, so only the raw string and what the
     traveller typed are written. Storing a Date would give back a string on
     the next load and every consumer would have to know that. */
  const stored: Stored[] = next.map(({ flight, ...rest }) => {
    void flight;
    return rest;
  });
  if (stored.length === 0) clear(DOCS_KEY);
  else save(DOCS_KEY, stored);
  for (const fn of watchers) fn();
}

function subscribe(fn: () => void) {
  watchers.add(fn);
  return () => {
    watchers.delete(fn);
  };
}

const snapshot = () => state;

export function useDocs(): TravelDoc[] {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export const docs = () => state;

/** The demo reset clears these with everything else. */
export const resetDocs = () => commit([]);

export function removeDoc(id: string) {
  commit(state.filter((d) => d.id !== id));
}

export function updateDoc(id: string, manual: TravelDoc["manual"]) {
  commit(state.map((d) => (d.id === id ? { ...d, manual: { ...d.manual, ...manual } } : d)));
}

/**
 * File a scanned or pasted string.
 *
 * The kind is decided by what the string actually is, not by which button was
 * pressed: a boarding pass scanned under 「飯店」 is still a boarding pass, and
 * telling the traveller otherwise would be the app insisting it knows better
 * than the document in front of it.
 */
export function addDoc(raw: string, opts: { format?: string; kind?: DocKind } = {}): TravelDoc {
  const flight = looksLikeFlight(raw) ? parseBoardingPass(raw) : null;
  const kind: DocKind = flight ? "flight" : (opts.kind ?? "other");

  const doc: TravelDoc = {
    id: `doc-${Date.now()}-${state.length}`,
    kind,
    addedAt: Date.now(),
    raw,
    flight: flight ?? undefined,
    format: opts.format,
  };
  commit([doc, ...state]);
  return doc;
}

/** 「BR 189・TPE → HLN」 or whatever the traveller called it. */
export function docTitle(d: TravelDoc): string {
  if (d.flight) return `${d.flight.carrier} ${d.flight.flightNo}・${d.flight.from} → ${d.flight.to}`;
  if (d.manual?.title) return d.manual.title;
  if (d.kind === "hotel") return "住宿憑證";
  return "文件";
}

const PAD = (n: number) => String(n).padStart(2, "0");

/** 「8/20（三）14:35」 style, but only what is genuinely known. */
export function docWhen(d: TravelDoc): string | null {
  if (d.flight) {
    const t = d.flight.date;
    return `${t.getMonth() + 1}/${PAD(t.getDate())}`;
  }
  return d.manual?.date ?? null;
}
