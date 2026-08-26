import { useRef, useState } from "react";
import { Button, Empty, Note, Screen, Sheet, TopBar } from "../components/ui";
import { demoBoardingPass } from "../lib/bcbp";
import { addDoc, docTitle, docWhen, removeDoc, updateDoc, useDocs, type TravelDoc } from "../lib/docs";
import { asUrl, scanImage } from "../lib/scan";
import { applyShift, planDayShift, type DayShift } from "../lib/docPlan";
import { focusTrip } from "../lib/trip";
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
export function Documents() {
  const nav = useNav();
  const list = useDocs();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [editing, setEditing] = useState<TravelDoc | null>(null);
  /* A flight that has offered to move a day, and is waiting to be told. */
  const [aligning, setAligning] = useState<TravelDoc | null>(null);
  const trip = focusTrip(nav.trips) ?? undefined;
  const fileRef = useRef<HTMLInputElement>(null);

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
    const doc = addDoc(result.text, { format: result.format });
    /* A hotel code carries nothing anybody can read, so the sheet opens
       straight away rather than leaving a row labelled 「文件」. */
    if (!doc.flight) setEditing(doc);
  }

  return (
    <Screen>
      <TopBar title="旅行文件" onBack={() => nav.back()} />

      <div className="px-5 pt-1">
        <p className="text-[13.5px] leading-relaxed text-ink-3">
          登機證的條碼是國際標準（IATA BCBP），可以直接讀出航班與座位。
          飯店的 QR 沒有統一格式，讀到什麼就顯示什麼，名稱和日期請自己補。
        </p>

        <div className="mt-4 space-y-2">
          <Button onClick={() => fileRef.current?.click()}>
            {busy ? "讀取中…" : "掃描登機證 / QR Code"}
          </Button>
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
          <Button
            variant="secondary"
            onClick={() => {
              setProblem(null);
              addDoc(demoBoardingPass(), { format: "PDF417" });
            }}
          >
            載入範例登機證
          </Button>
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
              canAlign={Boolean(d.flight && trip)}
              onEdit={() => setEditing(d)}
              onAlign={() => setAligning(d)}
              onRemove={() => removeDoc(d.id)}
            />
          ))}
        </div>
      )}

      <Note>文件只存在這台裝置。這個 Demo 沒有後端，沒有地方可以上傳。</Note>
      <div className="h-24 shrink-0" />

      {aligning?.flight && trip && (
        <AlignSheet
          doc={aligning}
          trip={trip}
          onClose={() => setAligning(null)}
        />
      )}

      {editing && (
        <ManualSheet
          doc={editing}
          onClose={() => setEditing(null)}
          onSave={(m) => {
            updateDoc(editing.id, m);
            setEditing(null);
          }}
        />
      )}
    </Screen>
  );
}

/* ------------------------------------------------------------------- card */

function DocCard({
  doc: d,
  canAlign,
  onEdit,
  onAlign,
  onRemove,
}: {
  doc: TravelDoc;
  /** Only a parsed flight has anything to say about a schedule. */
  canAlign: boolean;
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
          {d.kind === "flight" ? "✈️" : d.kind === "hotel" ? "🏨" : "🎫"}
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

      {!d.flight && (
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

      {canAlign && (
        <button
          onClick={onAlign}
          className="mt-3 min-h-11 w-full rounded-full bg-brand-wash text-[13px] font-bold text-brand transition active:bg-brand-wash/70"
        >
          對到行程</button>
      )}

      <div className="mt-2 flex gap-2">
        <button
          onClick={onEdit}
          className="min-h-11 flex-1 rounded-full bg-bg text-[13px] font-bold text-ink transition active:bg-surface-2"
        >
          {d.flight ? "加註記" : "補資料"}
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
  onSave: (m: NonNullable<TravelDoc["manual"]>) => void;
}) {
  const [title, setTitle] = useState(d.manual?.title ?? "");
  const [date, setDate] = useState(d.manual?.date ?? "");
  const [note, setNote] = useState(d.manual?.note ?? "");

  const input =
    "h-12 w-full rounded-2xl bg-bg px-4 text-[15px] text-ink outline-none placeholder:text-ink-3";

  return (
    <Sheet open onClose={onClose} title={d.flight ? "加註記" : "補上資料"}>
      <div className="space-y-2 px-5 pb-5 pt-1">
        {!d.flight && (
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="名稱，例如 桑母樂飯店"
              className={input}
            />
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="日期，例如 8/20 入住"
              className={input}
            />
          </>
        )}
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="備註"
          className={input}
        />
        <div className="pt-1">
          <Button onClick={() => onSave({ title, date, note })}>儲存</Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------- align sheet */

/** Landing times somebody might pick. Offered, because the barcode has none. */
const ARRIVALS = ["10:00", "12:00", "14:30", "17:00", "20:00"];

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
function AlignSheet({
  doc: d,
  trip,
  onClose,
}: {
  doc: TravelDoc;
  trip: Trip;
  onClose: () => void;
}) {
  const [day, setDay] = useState(trip.days[0]?.n ?? 1);
  const [at, setAt] = useState(ARRIVALS[2]);
  const [done, setDone] = useState<string | null>(null);

  const shift: DayShift | null = planDayShift(trip, day, at);

  const chip = (on: boolean) =>
    `min-h-11 rounded-full px-3.5 text-[13px] font-semibold transition ${
      on ? "bg-brand text-white" : "bg-bg text-ink-2 active:bg-surface-2"
    }`;

  return (
    <Sheet open onClose={onClose} title="對到行程">
      <div className="px-5 pb-5 pt-1">
        <div className="rounded-2xl bg-surface p-3.5">
          <div className="text-[13.5px] leading-relaxed text-ink-2">
            {d.flight?.carrier} {d.flight?.flightNo}・{d.flight?.from} → {d.flight?.to}
            <span className="num"> · {docWhen(d)}</span>
          </div>
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
                ? `Day ${shift.day} 的 ${shift.stops} 個行程會往後 ${Math.floor(shift.minutes / 60)} 小時 ${shift.minutes % 60} 分，從 ${shift.from} 變成 ${shift.to}。`
                : `Day ${day} 本來就在 ${at} 之後才開始，不用調整。`)}
          </div>

          <div className="mt-3">
            <Button
              disabled={!shift || Boolean(done)}
              onClick={() => {
                if (!shift) return;
                applyShift(shift, trip);
                setDone(`✓ Day ${shift.day} 已經往後 ${shift.minutes} 分鐘。`);
              }}
            >
              套用
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
