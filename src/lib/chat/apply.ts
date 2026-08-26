import { editsFor, key, remember } from "../dayEdits";
import { applyEdits, diffDay, removeStop } from "../reorder";
import type { Proposal } from "./respond";
import type { Nav } from "../../nav";
import type { Day, Trip } from "../../types";

/**
 * Carrying out a proposal the traveller pressed.
 *
 * The only thing in the chat that writes anything, and it is never called
 * except from a button on a proposal card. `respond.ts` decides what would
 * happen; this makes it happen.
 *
 * Every edit goes through `lib/reorder.ts` and `lib/dayEdits.ts` — the same two
 * modules 編輯 mode uses when somebody moves a stop by hand. A second write path
 * would be a second set of bugs and, worse, the two would eventually disagree
 * about what the day says. It also means a chat edit persists, shows up in the
 * timeline immediately, and is cleared by the demo reset like any other.
 *
 * `raw` is the trip as the fixtures state it, not as the traveller has left it.
 * Both matter: an edit is stored as a diff against the fixture, but it has to be
 * computed on top of whatever hand edits are already there — otherwise asking
 * the chat to remove one stop would quietly restore another that was dragged
 * away five minutes ago.
 */

export interface ApplyResult {
  ok: boolean;
  /** What to say afterwards. Always something the traveller can go and check. */
  say: string;
}

export function applyProposal(proposal: Proposal, nav: Nav, raw?: Trip): ApplyResult {
  switch (proposal.kind) {
    case "newTrip":
      nav.saveTrip(proposal.plan.trip);
      return { ok: true, say: `已建立「${proposal.plan.trip.title}」。` };

    case "addStop":
      /* The app's one add path — it owns the appended stop, the leg, the
         analytics event and the toast, so this does not fire its own. */
      nav.addStop(proposal.tripId, proposal.day, proposal.ref);
      return { ok: true, say: `已加到 Day ${proposal.day}。` };

    case "removeStop": {
      const base = raw?.days.find((d) => d.n === proposal.day);
      if (!base) return { ok: false, say: "那一天已經不在了。" };
      const ok = editDay(proposal.tripId, base, (d) => removeStop(d, proposal.stopId));
      return ok
        ? { ok: true, say: "已經拿掉了。" }
        : { ok: false, say: "那一站已經不在了。" };
    }

    case "moveStop": {
      /* Across days this is a removal and an addition, not a reorder —
         `reorder.moveStop` shuffles within one day. The addition goes through
         nav so the new day gets a properly measured leg rather than a stop
         dropped in with the old one still attached. */
      const base = raw?.days.find((d) => d.n === proposal.from);
      const stop = base?.tracks.flatMap((t) => t.stops).find((s) => s.id === proposal.stopId);
      if (!base || !stop) return { ok: false, say: "那一站已經不在了。" };

      if (!editDay(proposal.tripId, base, (d) => removeStop(d, proposal.stopId))) {
        return { ok: false, say: "那一站已經不在了。" };
      }
      nav.addStop(proposal.tripId, proposal.to, stop.ref ?? { kind: "poi", poiId: stop.poiId });
      return { ok: true, say: `已經移到 Day ${proposal.to}。` };
    }
  }
}

/**
 * Apply a change to one day and store it as a hand-edit.
 *
 * The transform runs on the day as it currently stands — fixture plus whatever
 * is already stored — and the result is diffed back against the fixture,
 * because that is the shape `DayEdits` is defined in.
 */
function editDay(tripId: string, base: Day, change: (d: Day) => Day): boolean {
  const stored = editsFor(key(tripId, base.n));
  const current = stored ? (applyEdits(base, stored) ?? base) : base;
  const next = change(current);
  /* Nothing moved — the stop was already gone, or the change was a no-op. */
  if (next === current) return false;
  remember(tripId, base.n, diffDay(base, next));
  return true;
}
