import { useMemo, useSyncExternalStore } from "react";
import { applyEdits, type DayEdits } from "./reorder";
import { clear, load, save, DAY_EDITS_KEY } from "./persist";
import type { Trip } from "../types";

/**
 * Days the traveller has rearranged by hand.
 *
 * The trip lives in App state and only App can write to it — this screen is
 * handed a `Trip` and a way to add a POI, and nothing else. So a reorder is
 * kept beside the trip and replayed over it on the way to the screen, the same
 * module-store shape lib/saved.ts and the receipts in Expenses.tsx already use,
 * and for the same reason: component state would lose the edit the moment
 * somebody tapped a stop to look at it, and an edit that survives being read is
 * the entire point of an edit.
 *
 * lib/reorder.ts does all the thinking; this is a `Record` and three lines of
 * plumbing. It is also the seam where a `nav.editDay` would land — see the
 * note in TripHome about which screens can and cannot see these edits.
 */
export const key = (tripId: string, n: number) => `${tripId}:${n}`;

/* Persisted, because the reorder is the one thing on this screen the traveller
   did themselves. Everything else on it can be rebuilt from the fixtures; a
   hand-moved stop cannot, and losing it on reload would make 編輯 a button that
   pretends. */
let edited: Record<string, DayEdits> = load<Record<string, DayEdits>>(DAY_EDITS_KEY, {});
const watchers = new Set<() => void>();

function subscribe(fn: () => void) {
  watchers.add(fn);
  return () => {
    watchers.delete(fn);
  };
}

/* The snapshot is the module object. A fresh one each call would hand React a
   new reference every render and loop forever. */
const snapshot = () => edited;

function commit(next: Record<string, DayEdits>) {
  edited = next;
  /* No edits leaves no key, the same way untouched trips leave no key. Writing
     `{}` back would be equivalent today and stop being equivalent the moment
     the stored shape changes — a demo reset should leave nothing behind. */
  if (Object.keys(next).length === 0) clear(DAY_EDITS_KEY);
  else save(DAY_EDITS_KEY, next);
  for (const fn of watchers) fn();
}

/**
 * Roll the day back to what the trip says.
 *
 * Wired into App.tsx's `reset()` alongside `resetSaved()`: a demo reset that
 * rolls the itinerary back to the fixture and leaves last run's reorder sitting
 * on top of it is not a reset — and now that the edits outlive the tab, it
 * would not even be a reset for the length of one session.
 */
export const resetDayEdits = () => commit({});

/**
 * One day's edits, read at the moment of asking.
 *
 * A getter rather than the record itself, because the record is replaced on
 * every commit — a screen that captured it once would go on editing a snapshot
 * taken before the last change and quietly undo it.
 */
export const editsFor = (id: string): DayEdits | undefined => edited[id];

export const remember = (tripId: string, n: number, e: DayEdits) =>
  commit({ ...edited, [key(tripId, n)]: e });

export const forget = (id: string) => {
  if (!edited[id]) return;
  const next = { ...edited };
  delete next[id];
  commit(next);
};

/** The trip as the traveller has left it. */
export function useEditedTrip(trip: Trip): Trip {
  const all = useSyncExternalStore(subscribe, snapshot, snapshot);

  return useMemo(() => {
    let touched = false;
    const days = trip.days.map((d) => {
      const e = all[key(trip.id, d.n)];
      /* `applyEdits` returns null when the day has moved underneath the edit —
         an AI adjustment applied, a scenario reloaded. The day the trip states
         wins, every time. */
      const next = e ? applyEdits(d, e) : null;
      if (!next) return d;
      touched = true;
      return next;
    });
    return touched ? { ...trip, days } : trip;
  }, [trip, all]);
}

