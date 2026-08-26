import { useRef, useState } from "react";
import { Button, Empty, Note, Screen, Sheet, TopBar } from "../components/ui";
import { demoBoardingPass } from "../lib/bcbp";
import {
  addDoc,
  docTitle,
  docWhen,
  linkDoc,
  removeDoc,
  updateDoc,
  useDocs,
  DOC_ICONS,
  DOC_LABELS,
  type DocKind,
  type TravelDoc,
} from "../lib/docs";
import { demoEsimCode } from "../lib/lpa";
import { asUrl, scanImage } from "../lib/scan";
import { applyShift, planDayShift, type DayShift } from "../lib/docPlan";
import { useNav } from "../nav";
import type { Trip } from "../types";

/**
 * 旅行文件 — the boarding passes and booking codes, on this device only.
 *
 * The row in 我的 has said 即將推出 since T0. What makes it real rather than a
 * form is that a boarding pass is genuinely readable: the barcode is IATA
 * Resolution 792, a published standard with fixed offsets, so `lib/bcbp.ts`
 * parses the passenger, the booking reference, the route, the flight and the
 * seat out of it rather than asking anybody to type them.
 *
 * A hotel QR is not readable in the same sense and this screen does not pretend
 * otherwise. There is no standard behind it — it may be a URL, a Wi-Fi
 * credential or a supplier's internal number — so what was scanned is shown
 * exactly as scanned, and the name and date are the traveller's to fill in.
 * Calling a random string 「桑母樂飯店」 would be the kind of confident invention
 * this whole project is built against.
 *
 * Nothing leaves the device, and that is a fact about the architecture rather
 * than a policy: there is no backend here for a document to be sent to.
 */
/**
 * The screen, for the 我的 → 旅行文件 shortcut.
 *
 * The same content the 行程 tab shows in its 文件 pane, wrapped in a Screen
 * and a back button. One implementation, two doors — the row in 我的 predates
 * the pane and is still the shortest way in for somebody who is not thinking
 * about a trip yet.
 */
export function Documents() {
  const nav = useNav();
  return (
    <Screen>
      <TopBar title="旅行文件" onBack={() => nav.back()} />
      <DocumentsPane />
      <div className="h-24 shrink-0" />
    </Screen>
  );
}

/**
 * Everything below the title bar.
 *
 * No Screen and no TopBar of its own, so the 行程 tab can drop it under its
 * own segmented control without two headers stacking up.
 */
export function DocumentsPane() {
  const nav = useNav();
  const list = useDocs();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [editing, setEditing] = useState<TravelDoc | null>(null);
  /* The document whose 對到行程 sheet is open — by id, not by value. The
     sheet writes to the store, so a captured object would keep showing the
     trip the document was attached to before the tap. */
  const [aligningId, setAligningId] = useState<string | null>(null);
  const trips = nav.trips;
  const aligning = list.find((d) => d.id === aligningId) ?? null;
  const fileRef = useRef<HTMLInputElement>(null);
  /* Which of the three buttons opened the picker. A hint, and nothing
     stronger — see `addDoc`. */
  const want = useRef<DocKind>("other");

  function pick(kind: DocKind) {
    want.current = kind;
    setProblem(null);
    fileRef.current?.click();
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setProblem(null);
    setBusy(true);
    const result = await scanImage(file);
    setBusy(false);
    if (!result.ok) {
      setProblem(result.reason);
      return;
    }
    const doc = addDoc(result.text, { format: result.format, kind: want.current });
    /* Only for the ones nothing could be read from. A boarding pass and an
       eSIM code both arrive fully described by their own standard, and
       opening a form over them would be asking for something already known. */
    if (!doc.flight && !doc.esim) setEditing(doc);
  }

  return (
    <>
      <div className="px-5 pt-1">
        <p className="text-[13.5px] leading-relaxed text-ink-3">
          登機證（IATA BCBP）與 eSIM 啟用碼（GSMA SGP.22）都有國際標準，
          可以直接讀出來。住宿的 QR 沒有統一格式，讀到什麼就顯示什麼，
          名稱與日期請自己補。
        </p>

        {/* One scanner, three doors.

            Every kind gets its own button because a traveller arrives holding
            one particular thing, and a single 「掃描 QR Code」 left them to work
            out for themselves whether this app wanted that one. The kind
            travels as a hint and stays a hint: `addDoc` still decides from
            what the string actually is, so a boarding pass scanned under 住宿
            is filed as a boarding pass. What the hint buys is the case where
            nothing parses — a hotel QR that is only a URL now lands already
            labelled 住宿 instead of 其他, with the right fields waiting. */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <ScanTile kind="flight" label="掃機票" busy={busy} onClick={() => pick("flight")} />
          <ScanTile kind="esim" label="掃 eSIM" busy={busy} onClick={() => pick("esim")} />
          <ScanTile kind="hotel" label="掃住宿" busy={busy} onClick={() => pick("hotel")} />
        </div>

        <div className="mt-2 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              /* Cleared, or picking the same file twice fires nothing. */
              e.target.value = "";
            }}
          />
          {/* Three fabricated samples, so all three paths can be shown without
              anybody holding up a real ticket, a real booking or — worst of
              the three — a live eSIM activation code. */}
          <div className="flex gap-2">
            <Sample
              label="範例登機證"
              onClick={() => {
                setProblem(null);
                addDoc(demoBoardingPass(), { format: "PDF417" });
              }}
            />
            <Sample
              label="範例 eSIM"
              onClick={() => {
                setProblem(null);
                addDoc(demoEsimCode(), { format: "QRCode" });
              }}
            />
            <Sample
              label="範例住宿"
              onClick={() => {
                setProblem(null);
                const d = addDoc(DEMO_HOTEL_QR, { format: "QRCode", kind: "hotel" });
                updateDoc(d.id, {
                  title: "花蓮湖畔飯店",
                  date: "8/20",
                  until: "8/22",
                  ref: "HL-88213",
                });
              }}
            />
          </div>
        </div>

        {problem && (
          <p className="mt-3 rounded-2xl bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-ink-2">
            {problem}
          </p>
        )}
      </div>

      {list.length === 0 ? (
        <Empty icon="🛂" text="還沒有文件。掃一張登機證，或先載入範例看看。" />
      ) : (
        <div className="mt-5 space-y-2 px-5">
          {list.map((d) => (
            <DocCard
              key={d.id}
              doc={d}
              canAlign={trips.length > 0}
              linkedTo={trips.find((t) => t.id === d.tripId)?.title ?? null}
              onEdit={() => setEditing(d)}
              onAlign={() => setAligningId(d.id)}
              onRemove={() => removeDoc(d.id)}
            />
          ))}
        </div>
      )}

      <Note>文件只存在這台裝置。這個 Demo 沒有後端，沒有地方可以上傳。</Note>

      {aligning && trips.length > 0 && (
        <AlignSheet doc={aligning} trips={trips} onClose={() => setAligningId(null)} />
      )}

      {editing && (
        <ManualSheet
          /* Keyed by document.

             Without this, opening one document's sheet and then another's
             reuses the same component instance — and every useState below
             initialises on first mount only, so the second document opened
             showing the first one's name, dates and kind. Somebody would have
             saved that over the record they were actually looking at. */
          key={editing.id}
          doc={editing}
          onClose={() => setEditing(null)}
          onSave={(m, kind) => {
            updateDoc(editing.id, m, kind);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------- card */

function DocCard({
  doc: d,
  canAlign,
  linkedTo,
  onEdit,
  onAlign,
  onRemove,
}: {
  doc: TravelDoc;
  /** Only when there is a trip to file it under. */
  canAlign: boolean;
  /** The trip it already belongs to, if somebody has said. */
  linkedTo: string | null;
  onEdit: () => void;
  onAlign: () => void;
  onRemove: () => void;
}) {
  const when = docWhen(d);
  const url = asUrl(d.raw);

  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="text-[22px]" aria-hidden>
          {DOC_ICONS[d.kind]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15.5px] font-bold text-ink">{docTitle(d)}</div>
          {when && <div className="num mt-0.5 text-[12.5px] text-ink-3">{when}</div>}
        </div>
      </div>

      {d.flight && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Fact label="旅客" value={d.flight.passenger} />
          <Fact label="訂位代號" value={d.flight.pnr} />
          <Fact label="座位" value={`${d.flight.seat}・${d.flight.cabin}`} />
        </div>
      )}

      {d.esim && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Fact label="供應商" value={d.esim.server} />
          <Fact label="啟用碼" value={d.esim.matchingId} />
        </div>
      )}

      {d.esim?.needsConfirmation && (
        <p className="mt-2 text-[12px] leading-relaxed text-ink-2">
          這張還需要電信商另外給的確認碼才能啟用。
        </p>
      )}

      {/* The dates are already the line under the title, so only the
         reference is repeated here — a card that printed 退房 twice would be
         spending its width saying one thing. */}
      {d.kind === "hotel" && d.manual?.ref && (
        <div className="mt-3">
          <Fact label="訂房代號" value={d.manual.ref} />
        </div>
      )}

      {!d.flight && !d.esim && (
        <div className="mt-3">
          <div className="text-[11px] font-semibold text-ink-3">掃到的內容</div>
          {/* Shown exactly as scanned. Breaking anywhere, because a booking
              reference is not a word and must not push the card wide. */}
          <p className="mt-1 break-all rounded-xl bg-bg px-2.5 py-2 text-[12px] leading-relaxed text-ink-2">
            {d.raw.slice(0, 200)}
            {d.raw.length > 200 ? "…" : ""}
          </p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block text-[12.5px] font-semibold text-brand underline"
            >
              開啟連結
            </a>
          )}
        </div>
      )}

      {d.manual?.note && (
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{d.manual.note}</p>
      )}

      {/* Which trip it belongs to, on the card rather than only inside the
         sheet — the whole point of attaching it is that the answer is visible
         while scanning the list. In words rather than an icon: a small compass
         beside a trip name read as a status glyph nobody could name. */}
      {linkedTo && (
        <div className="mt-3 truncate text-[12.5px] font-semibold text-brand">
          已對到 · {linkedTo}
        </div>
      )}

      {canAlign && (
        <button
          onClick={onAlign}
          className={`min-h-11 w-full rounded-full bg-brand-wash text-[13px] font-bold text-brand transition active:bg-brand-wash/70 ${linkedTo ? "mt-2" : "mt-3"}`}
        >
          對到行程
        </button>
      )}

      <div className="mt-2 flex gap-2">
        <button
          onClick={onEdit}
          className="min-h-11 flex-1 rounded-full bg-bg text-[13px] font-bold text-ink transition active:bg-surface-2"
        >
          {d.flight || d.esim ? "加註記" : "補資料"}
        </button>
        <button
          onClick={onRemove}
          className="min-h-11 flex-1 rounded-full bg-bg text-[13px] font-bold text-ink-3 transition active:bg-surface-2"
        >
          刪除
        </button>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg px-2.5 py-2">
      <div className="text-[11px] text-ink-3">{label}</div>
      <div className="num mt-0.5 truncate text-[13px] font-semibold text-ink">{value || "—"}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ sheet */

function ManualSheet({
  doc: d,
  onClose,
  onSave,
}: {
  doc: TravelDoc;
  onClose: () => void;
  onSave: (m: NonNullable<TravelDoc["manual"]>, kind: DocKind) => void;
}) {
  const [title, setTitle] = useState(d.manual?.title ?? "");
  const [date, setDate] = useState(d.manual?.date ?? "");
  const [until, setUntil] = useState(d.manual?.until ?? "");
  const [ref, setRef] = useState(d.manual?.ref ?? "");
  const [note, setNote] = useState(d.manual?.note ?? "");
  const [kind, setKind] = useState<DocKind>(d.kind);

  const input =
    "h-12 w-full rounded-2xl bg-bg px-4 text-[15px] text-ink outline-none placeholder:text-ink-3";

  return (
    <Sheet open onClose={onClose} title={d.flight ? "加註記" : "補上資料"}>
      <div className="space-y-2 px-5 pb-5 pt-1">
        {/* Only where the app could not tell. A boarding pass and an eSIM code
           both announce themselves through a published standard, and offering
           to re-label them would be inviting somebody to be wrong about a
           thing the app already knows. */}
        {!d.flight && !d.esim && (
          <>
            <div className="pb-1 text-[13px] font-semibold text-ink-2">這是什麼？</div>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {(["hotel", "esim", "other"] as DocKind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`min-h-11 rounded-full px-3.5 text-[13px] font-semibold transition ${
                    k === kind ? "bg-brand text-white" : "bg-bg text-ink-2 active:bg-surface-2"
                  }`}
                >
                  {DOC_ICONS[k]} {DOC_LABELS[k]}
                </button>
              ))}
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kind === "hotel" ? "飯店名稱" : "名稱"}
              className={input}
            />
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder={kind === "hotel" ? "入住，例如 8/20" : "日期，例如 8/20"}
              className={input}
            />
            {kind === "hotel" && (
              <>
                <input
                  value={until}
                  onChange={(e) => setUntil(e.target.value)}
                  placeholder="退房，例如 8/22"
                  className={input}
                />
                <input
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="訂房代號"
                  className={input}
                />
              </>
            )}
          </>
        )}
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="備註"
          className={input}
        />
        <div className="pt-1">
          <Button onClick={() => onSave({ title, date, until, ref, note }, kind)}>儲存</Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------- align sheet */

/** Landing times somebody might pick. Offered, because the barcode has none. */
const ARRIVALS = ["10:00", "12:00", "14:30", "17:00", "20:00"];

/** 「1 小時 30 分」, 「30 分」, 「2 小時」 — never 「0 小時 30 分」. */
function spell(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return m + " 分";
  return m ? h + " 小時 " + m + " 分" : h + " 小時";
}

const chip = (on: boolean) =>
  `min-h-11 rounded-full px-3.5 text-[13px] font-semibold transition ${
    on ? "bg-brand text-white" : "bg-bg text-ink-2 active:bg-surface-2"
  }`;

/**
 * 對到行程 — which trip this belongs to, and, for a boarding pass, which day
 * it lands on.
 *
 * Two different things under one word, stacked rather than merged. Filing a
 * document under a trip is the half that means something for all three kinds:
 * it is what lets 旅行文件 answer 「這趟的東西在哪」 instead of being one undated
 * pile, and it is what puts the count on the trip's own page. That half writes
 * immediately, because the selected chip is the feedback and tapping it again
 * undoes it.
 *
 * Moving a day is offered only by a parsed boarding pass, and that asymmetry is
 * deliberate. A flight has a date and a route, so 「Day 2 從 09:00 變成 16:30」
 * is derived from the document. A hotel booking and an eSIM code have nothing
 * to say about when a morning should start, and giving them the same button
 * would be a control with nothing behind it — the kind this project keeps
 * deleting rather than filling with a guess. That half still proposes and
 * waits, like everything else here that rewrites an itinerary.
 */
function AlignSheet({
  doc: d,
  trips,
  onClose,
}: {
  doc: TravelDoc;
  trips: Trip[];
  onClose: () => void;
}) {
  const linked = trips.find((t) => t.id === d.tripId) ?? null;
  const when = docWhen(d);

  return (
    <Sheet open onClose={onClose} title="對到行程">
      <div className="space-y-3 px-5 pb-5 pt-1">
        <div className="rounded-2xl bg-surface p-3.5">
          <div className="truncate text-[14.5px] font-bold text-ink">{docTitle(d)}</div>
          {when && <div className="num mt-0.5 text-[12.5px] text-ink-3">{when}</div>}

          <div className="mt-3.5 text-[13px] font-semibold text-ink-2">這是哪一趟的？</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {trips.map((t) => (
              <button
                key={t.id}
                /* The same tap both ways. Nothing is destroyed by getting
                   this wrong, so a second confirmation would be ceremony. */
                onClick={() => linkDoc(d.id, t.id === d.tripId ? null : t.id)}
                className={chip(t.id === d.tripId)}
              >
                {t.title}
              </button>
            ))}
          </div>

          <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-3">
            {linked
              ? `會出現在「${linked.title}」的行程頁上。再按一次就取消。`
              : "選一趟，這份文件就會出現在那趟的行程頁上。"}
          </p>
        </div>

        {/* Keyed by trip: the day picker below defaults to that trip's Day 1,
           and switching trips with the state still mounted would leave it
           pointing at a day number the new itinerary may not have. */}
        {d.flight && linked && <FlightShift key={linked.id} trip={linked} />}

        {d.flight && !linked && (
          <p className="px-1 text-[12.5px] leading-relaxed text-ink-3">
            選好行程之後，這張登機證還可以把落地那天整個往後移。
          </p>
        )}
      </div>
    </Sheet>
  );
}

/**
 * 「要把哪一天改成落地之後才開始？」
 *
 * Two questions, because the boarding pass can only answer one of them. It
 * knows the route and the date; it does not know when the aircraft is on the
 * stand — the mandatory section of BCBP carries no times at all, and inventing
 * one from a flight number would be exactly the confident guess this feature
 * was built to avoid. So the traveller picks the hour, and the document
 * supplies everything else.
 *
 * Nothing is written until 套用.
 */
function FlightShift({ trip }: { trip: Trip }) {
  const [day, setDay] = useState(trip.days[0]?.n ?? 1);
  const [at, setAt] = useState(ARRIVALS[2]);
  const [done, setDone] = useState<string | null>(null);

  const shift: DayShift | null = planDayShift(trip, day, at);

  return (
    <div className="rounded-2xl bg-surface p-3.5">
      <div className="text-[13.5px] font-bold text-ink">把落地那天往後移</div>
      <div className="mt-1 text-[12.5px] leading-relaxed text-ink-3">
        {/* Said plainly, because the traveller is about to supply it. */}
        登機證上沒有抵達時間，請選一個大概的落地時間。
      </div>

      <div className="mt-3.5 text-[13px] font-semibold text-ink-2">哪一天？</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {trip.days.map((x) => (
          <button key={x.n} onClick={() => setDay(x.n)} className={chip(x.n === day)}>
            Day {x.n}
          </button>
        ))}
      </div>

      <div className="mt-3.5 text-[13px] font-semibold text-ink-2">大概幾點落地？</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ARRIVALS.map((t) => (
          <button key={t} onClick={() => setAt(t)} className={`num ${chip(t === at)}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3.5 rounded-xl bg-bg px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-2">
        {done ??
          (shift
            ? `Day ${shift.day} 的 ${shift.stops} 個行程會往後 ${spell(shift.minutes)}，從 ${shift.from} 變成 ${shift.to}。`
            : `Day ${day} 本來就在 ${at} 之後才開始，不用調整。`)}
      </div>

      <div className="mt-3">
        <Button
          disabled={!shift || Boolean(done)}
          onClick={() => {
            if (!shift) return;
            applyShift(shift, trip);
            setDone(`✓ Day ${shift.day} 已經往後 ${spell(shift.minutes)}。`);
          }}
        >
          套用
        </Button>
      </div>
    </div>
  );
}

/** One kind, one door. Wearing the same icon its card will. */
function ScanTile({
  kind,
  label,
  busy,
  onClick,
}: {
  kind: DocKind;
  label: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="rounded-2xl bg-surface px-2 py-3 text-center transition active:bg-surface-2 disabled:opacity-50"
    >
      <div className="text-[20px]" aria-hidden>
        {DOC_ICONS[kind]}
      </div>
      <div className="mt-1 text-[12.5px] font-bold text-ink">{busy ? "讀取中…" : label}</div>
    </button>
  );
}

/** A fabricated example. Narrow, because three of them share one row. */
function Sample({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="min-h-11 flex-1 rounded-full bg-surface px-2 text-[12.5px] font-bold text-ink transition active:bg-surface-2"
    >
      {label}
    </button>
  );
}

/* What a hotel QR usually is: a link with a reference in it. Not a standard —
   which is the point. example.com is reserved by RFC 2606 so documentation can
   name a host without naming somebody's server. */
const DEMO_HOTEL_QR = "https://booking.example.com/checkin?ref=HL-88213";
