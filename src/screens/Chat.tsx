import { useEffect, useRef, useState } from "react";
import { Button, Screen, TopBar } from "../components/ui";
import { applyProposal } from "../lib/chat/apply";
import { classify } from "../lib/chat/intent";
import { OPENERS, respond, type ChatContext, type Proposal, type Reply } from "../lib/chat/respond";
import { useEditedTrip } from "../lib/dayEdits";
import type { PlanRequest } from "../lib/planner";
import { useNav } from "../nav";
import type { Trip } from "../types";

/**
 * 跟 AI 說你想怎麼玩.
 *
 * A conversation, and an honest one. Nothing here calls a model: every reply
 * comes from `lib/chat/` — a classifier over the words this app has
 * capabilities for, and a responder that turns them into sentences and
 * proposals. It never says 「讓我想想」 and it never shows three bouncing dots
 * pretending to think, because it is not thinking; it is matching. What it does
 * instead is tell you plainly when it did not understand, and show you three
 * sentences that work.
 *
 * The rule that matters most: **it proposes, it does not act.** Every reply
 * that would change an itinerary arrives as a card saying exactly what would
 * happen, with 套用 and 不要 underneath. A chat that edits your trip as you type
 * is a chat you have to supervise; one that waits is one you can argue with.
 *
 * Opened with a `tripId` it is scoped to that trip and can edit it. Opened
 * without one it plans new trips. The same box either way — what changes is
 * what it has to work on.
 */

interface Turn {
  id: number;
  who: "me" | "ai";
  text: string;
  detail?: string[];
  proposal?: Proposal;
  /** Set once the proposal has been acted on, so the card stops offering. */
  settled?: "applied" | "declined";
  chips?: string[];
}

export function Chat({ tripId }: { tripId?: string }) {
  const nav = useNav();
  const raw = tripId ? nav.trips.find((t) => t.id === tripId) : undefined;
  /* What the traveller sees, not what the fixture says: a stop they deleted by
     hand must not be findable by the chat. `applyProposal` gets the raw trip
     separately, because an edit is stored as a diff against the fixture. */
  const trip = useEditedTrip(raw ?? EMPTY_TRIP);
  const scoped = raw ? trip : undefined;

  const [turns, setTurns] = useState<Turn[]>(() => [
    {
      id: 0,
      who: "ai",
      text: raw
        ? `在。這是「${raw.title}」，想改哪裡？`
        : "在。想去哪裡，玩幾天？",
      chips: raw ? OPENERS.trip : OPENERS.fresh,
    },
  ]);
  const [draft, setDraft] = useState("");
  /* What the last plan was built from, so 「多一點美食」 has something to edit
     rather than starting from nothing. */
  const [last, setLast] = useState<PlanRequest | undefined>();

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);

  const nextId = useRef(1);

  function send(text: string) {
    const said = text.trim();
    if (!said) return;
    setDraft("");

    const ctx: ChatContext = {
      trip: scoped,
      last,
      existingTripIds: nav.trips.map((t) => t.id),
    };
    const intent = classify(said, { today: scoped?.today, destId: scoped?.destId });
    const reply: Reply = respond(intent, ctx);

    if (reply.proposal?.kind === "newTrip") {
      const p = reply.proposal.plan.trip;
      setLast({
        destId: p.destId,
        days: p.days.length,
        interests: intent.interests ?? last?.interests ?? [],
        transport: intent.transport ?? last?.transport ?? "unsure",
      });
    }

    setTurns((t) => [
      ...t,
      { id: nextId.current++, who: "me", text: said },
      {
        id: nextId.current++,
        who: "ai",
        text: reply.text,
        detail: reply.detail,
        proposal: reply.proposal,
        chips: reply.chips,
      },
    ]);
  }

  function decide(turnId: number, proposal: Proposal, yes: boolean) {
    setTurns((t) =>
      t.map((x) => (x.id === turnId ? { ...x, settled: yes ? "applied" : "declined" } : x)),
    );
    if (!yes) {
      setTurns((t) => [
        ...t,
        { id: nextId.current++, who: "ai", text: "好，那就不動。", chips: scoped ? OPENERS.trip : OPENERS.fresh },
      ]);
      return;
    }
    const result = applyProposal(proposal, nav, raw);
    setTurns((t) => [
      ...t,
      {
        id: nextId.current++,
        who: "ai",
        text: result.say,
        chips: result.ok && proposal.kind === "newTrip" ? undefined : (scoped ? OPENERS.trip : OPENERS.fresh),
      },
    ]);
  }

  return (
    <Screen>
      <TopBar title={raw ? "跟 AI 改行程" : "跟 AI 排行程"} onBack={() => nav.back()} />

      <div className="flex-1 space-y-3 px-5 pt-2">
        {turns.map((t) =>
          t.who === "me" ? (
            <div key={t.id} className="flex justify-end">
              <p className="max-w-[78%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-[14.5px] leading-relaxed text-white">
                {t.text}
              </p>
            </div>
          ) : (
            <div key={t.id} className="space-y-2">
              <div className="max-w-[86%] rounded-2xl rounded-bl-md bg-surface px-3.5 py-2.5">
                <p className="text-[14.5px] leading-relaxed text-ink">{t.text}</p>
                {t.detail && t.detail.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {t.detail.map((d) => (
                      <li key={d} className="flex gap-1.5 text-[12.5px] leading-relaxed text-ink-3">
                        <span aria-hidden className="shrink-0">
                          ·
                        </span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {t.proposal && (
                <ProposalCard
                  proposal={t.proposal}
                  settled={t.settled}
                  onDecide={(yes) => decide(t.id, t.proposal!, yes)}
                />
              )}

              {t.chips && !t.proposal && (
                <div className="flex flex-wrap gap-1.5">
                  {t.chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => send(c)}
                      className="min-h-9 rounded-full bg-surface-2 px-3 text-[13px] font-semibold text-ink-2 transition active:bg-line"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 shrink-0 border-t border-line bg-bg/95 px-5 pb-24 pt-3 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={raw ? "第二天加一個夜市…" : "花蓮三天兩夜…"}
            className="h-12 min-w-0 flex-1 rounded-full bg-surface px-4 text-[15px] text-ink outline-none placeholder:text-ink-3"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="送出"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-[17px] text-white transition disabled:bg-surface-2 disabled:text-ink-3 active:bg-brand-press"
          >
            ↑
          </button>
        </form>

        {/* Said once, at the bottom, where a disclosure belongs — and said
            plainly, because 「AI」 on the button implies something this does not
            do. */}
        <p className="mt-2 text-center text-[11px] leading-relaxed text-ink-3">
          這個對話看得懂固定幾種說法，不會連網也不會呼叫模型。
        </p>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------- card */

/**
 * What would happen, and two buttons.
 *
 * It stays on screen after a decision rather than disappearing, with the
 * outcome written on it. A card that vanishes takes the record of what you
 * agreed to with it, and this conversation is the only place that record
 * exists.
 */
function ProposalCard({
  proposal,
  settled,
  onDecide,
}: {
  proposal: Proposal;
  settled?: "applied" | "declined";
  onDecide: (yes: boolean) => void;
}) {
  const label =
    proposal.kind === "newTrip"
      ? `${proposal.plan.trip.title}・${proposal.plan.trip.days.length} 天`
      : proposal.label;

  return (
    <div className="rounded-2xl border border-line bg-bg p-3.5">
      <div className="text-[12px] font-semibold text-ink-3">
        {proposal.kind === "newTrip" ? "建立新行程" : "調整行程"}
      </div>
      <div className="mt-1 text-[14.5px] font-bold text-ink">{label}</div>

      {settled ? (
        <div className="mt-2 text-[12.5px] font-semibold text-ink-3">
          {settled === "applied" ? "✓ 已套用" : "已略過"}
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onDecide(false)}
            className="min-h-11 flex-1 rounded-full bg-surface text-[13.5px] font-bold text-ink transition active:bg-surface-2"
          >
            不要
          </button>
          <span className="flex-1">
            <Button onClick={() => onDecide(true)}>套用</Button>
          </span>
        </div>
      )}
    </div>
  );
}

/* `useEditedTrip` is a hook and cannot be called conditionally, so a chat with
   no trip hands it this and ignores the result. */
const EMPTY_TRIP: Trip = {
  id: "",
  destId: "",
  title: "",
  dates: "",
  nights: 0,
  phase: "upcoming",
  today: 1,
  travellers: [],
  days: [],
};
