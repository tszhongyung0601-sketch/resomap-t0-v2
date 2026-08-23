import { useEffect, useMemo, useState } from "react";
import { StopImage } from "../components/Cover";
import { Button, Chip, Screen, TopBar } from "../components/ui";
import {
  generatePlan,
  plannableDests,
  TRANSPORT_LABELS,
  type Plan,
  type TransportId,
} from "../lib/planner";
import { viewsOf } from "../lib/stop";
import { track } from "../lib/track";
import { useNav } from "../nav";
import { INTEREST_LABELS, type InterestId } from "../types";

/**
 * ✨ AI 幫我排行程 — five questions and a plan.
 *
 * The plan is real. `lib/planner.ts` reads the eighty-seven places in the data,
 * scores them against the answers, groups them so a day does not cross half a
 * county and lays them on a fixed clock — so every row here is somewhere that
 * exists, at coordinates the map agrees with, and half of them have a guide
 * recorded for them.
 *
 * It is separate from `CreateTrip` on purpose. That wizard is reached from four
 * places and makes an empty trip for a city; this one makes a full itinerary
 * and is reached from one. Merging them would mean one component branching on
 * which of two products it currently is.
 *
 * Two things this screen refuses to do. It does not pretend the wait is work:
 * the pause is 1.2 seconds and the line under the spinner says what is actually
 * being computed rather than performing a thinking machine. And it does not
 * present the times as a schedule — 「時間是建議的節奏，沒有計算交通時間」 sits
 * with the plan, because a generated 11:00 that nobody can meet is the fastest
 * way to teach somebody to ignore the whole itinerary.
 */

type Step = 0 | 1 | 2 | 3 | 4;

const DAY_CHOICES = [1, 2, 3, 4, 5];

const TRANSPORTS: TransportId[] = ["transit", "drive", "charter", "walk", "unsure"];

export function AiPlanner() {
  const nav = useNav();
  const [step, setStep] = useState<Step>(0);
  const [destId, setDestId] = useState<string | null>(null);
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState<InterestId[]>([]);
  const [transport, setTransport] = useState<TransportId | null>(null);
  const [working, setWorking] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);

  const dests = useMemo(() => plannableDests(), []);

  useEffect(() => {
    if (!working) return;
    const t = window.setTimeout(() => {
      setPlan(
        generatePlan(
          { destId: destId!, days, interests, transport: transport ?? "unsure" },
          nav.trips.map((x) => x.id),
        ),
      );
      setWorking(false);
    }, 1200);
    return () => window.clearTimeout(t);
  }, [working, destId, days, interests, transport, nav.trips]);

  const toggle = (id: InterestId) =>
    setInterests((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  /* ------------------------------------------------------------- working */

  if (working) {
    return (
      <Screen>
        <TopBar title="AI 排行程" onBack={() => setWorking(false)} />
        <div className="flex flex-1 flex-col items-center justify-center px-10 pb-24">
          <div className="size-10 animate-spin rounded-full border-[3px] border-line border-t-brand" />
          <p className="mt-5 text-center text-[14px] leading-relaxed text-ink-3">
            正在分析景點距離、旅遊偏好與時間…
          </p>
        </div>
      </Screen>
    );
  }

  /* -------------------------------------------------------------- result */

  if (plan) {
    return (
      <Result
        plan={plan}
        onRedo={() => {
          setPlan(null);
          setStep(0);
        }}
        onSave={() => {
          track("ai_plan_saved");
          /* A new trip every time. Somebody who generates a second plan for the
             same city asked for a second plan, not for their first one to be
             quietly replaced. */
          nav.saveTrip(plan.trip);
        }}
      />
    );
  }

  /* ------------------------------------------------------------- wizard */

  const canNext =
    (step === 0 && destId) ||
    step === 1 ||
    step === 2 ||
    (step === 3 && transport) ||
    step === 4;

  return (
    <Screen>
      <TopBar
        title="AI 排行程"
        onBack={() => (step === 0 ? nav.back() : setStep((s) => (s - 1) as Step))}
      />

      {/* Five dashes rather than 「第 3 步，共 5 步」: the position is the only
          part anybody reads, and it reads faster as a shape. */}
      <div className="flex gap-1.5 px-5 pt-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-surface-2"}`}
          />
        ))}
      </div>

      <div className="flex-1 px-5 pt-5">
        {step === 0 && (
          <Question title="你想去哪裡？" note="這些是目前有內容的城市。">
            <div className="flex flex-wrap gap-2">
              {dests.map((d) => (
                <Chip key={d.id} active={destId === d.id} onClick={() => setDestId(d.id)}>
                  {d.name}
                </Chip>
              ))}
            </div>
          </Question>
        )}

        {step === 1 && (
          <Question title="玩幾天？">
            <div className="flex flex-wrap gap-2">
              {DAY_CHOICES.map((n) => (
                <Chip key={n} active={days === n} onClick={() => setDays(n)}>
                  {n} 天
                </Chip>
              ))}
            </div>
          </Question>
        )}

        {step === 2 && (
          <Question title="你喜歡什麼？" note="可以複選，也可以都不選。">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(INTEREST_LABELS) as InterestId[]).map((id) => (
                <Chip key={id} active={interests.includes(id)} onClick={() => toggle(id)}>
                  {INTEREST_LABELS[id]}
                </Chip>
              ))}
            </div>
          </Question>
        )}

        {step === 3 && (
          <Question title="怎麼移動？" note="選租車自駕的話，第一天會先安排取車。">
            <div className="flex flex-wrap gap-2">
              {TRANSPORTS.map((id) => (
                <Chip key={id} active={transport === id} onClick={() => setTransport(id)}>
                  {TRANSPORT_LABELS[id]}
                </Chip>
              ))}
            </div>
          </Question>
        )}

        {step === 4 && (
          <Question title="這樣對嗎？">
            <div className="space-y-0.5 rounded-2xl bg-surface p-4">
              <Line label="城市" value={dests.find((d) => d.id === destId)?.name ?? ""} />
              <Line label="天數" value={`${days} 天`} />
              <Line
                label="偏好"
                value={
                  interests.length
                    ? interests.map((i) => INTEREST_LABELS[i]).join("、")
                    : "沒有特別偏好"
                }
              />
              <Line label="交通" value={transport ? TRANSPORT_LABELS[transport] : ""} />
            </div>
          </Question>
        )}
      </div>

      <div className="sticky bottom-0 shrink-0 bg-bg px-5 pb-24 pt-3">
        {step === 4 ? (
          <Button onClick={() => setWorking(true)}>✨ AI 幫我排行程</Button>
        ) : (
          <Button disabled={!canNext} onClick={() => setStep((s) => (s + 1) as Step)}>
            下一步
          </Button>
        )}
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ result */

function Result({
  plan,
  onSave,
  onRedo,
}: {
  plan: Plan;
  onSave: () => void;
  onRedo: () => void;
}) {
  const nav = useNav();
  const { trip, reasons } = plan;

  return (
    <Screen>
      <TopBar title="AI 排的行程" onBack={() => nav.back()} />

      <div className="px-5 pt-1">
        <div className="text-[20px] font-bold text-ink">{trip.title}</div>
        <div className="num mt-0.5 text-[13px] text-ink-3">{trip.dates}</div>

        {/* Why it looks like this, checkable against the days below it. A
            generated plan that arrives with no account of itself is asking to
            be trusted on the strength of the word AI. */}
        <ul className="mt-3 space-y-1.5 rounded-2xl bg-surface p-4">
          {reasons.map((r) => (
            <li key={r} className="flex gap-2 text-[13px] leading-relaxed text-ink-2">
              <span className="shrink-0 text-ink-3">·</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {trip.days.map((d) => {
        const stops = d.tracks.flatMap((t) => t.stops);
        const views = viewsOf(stops);
        return (
          <section key={d.n} className="mt-5 px-5">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold text-ink">Day {d.n}</span>
              <span className="text-[12.5px] text-ink-3">
                {d.date} {d.weekday}
              </span>
              <span className="num ml-auto text-[12.5px] text-ink-3">
                {views.length} 個行程
              </span>
            </div>

            <div className="mt-2 space-y-2">
              {views.map((v) => {
                const stop = stops.find((s) => s.id === v.id);
                return (
                  <div key={v.id} className="flex items-center gap-3">
                    <span className="num w-11 shrink-0 text-[13px] font-semibold text-ink-3">
                      {stop?.at}
                    </span>
                    <StopImage view={v} height={44} radius={10} className="w-11" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-semibold text-ink">
                        {v.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-ink-3">
                        {v.subtitle}
                        {stop?.meal === "lunch" ? " · 午餐" : ""}
                        {v.disclosure ? ` · ${v.disclosure}` : ""}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="h-8 shrink-0" />

      <div className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-line bg-bg/95 px-5 pb-24 pt-3 backdrop-blur">
        <div className="space-y-2">
          <Button onClick={onSave}>儲存這份行程</Button>
          <Button variant="secondary" onClick={onRedo}>
            重新排一次
          </Button>
        </div>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------- bits */

function Question({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-[21px] font-bold leading-snug text-ink">{title}</h2>
      {note && <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">{note}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5">
      <span className="shrink-0 text-[13px] text-ink-3">{label}</span>
      <span className="ml-auto min-w-0 text-right text-[14px] font-semibold text-ink">
        {value}
      </span>
    </div>
  );
}
