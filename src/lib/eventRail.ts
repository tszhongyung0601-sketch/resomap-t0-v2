import { EVENTS, type LocalEvent } from "../data/events";
import { distance } from "./geo";
import { nextRun, startOfDay } from "./eventDate";
import type { LatLng } from "./geo";

/**
 * Which events belong on the home screen, and in what order.
 *
 * 「附近」 is two questions wearing one word. A festival forty minutes away this
 * weekend is nearby; the same festival three hundred days out is not, and
 * sorting on distance alone puts it first anyway. So both are scored, and the
 * ordering is the sum.
 *
 * The weights are not tuned to anything clever. A day of waiting costs about as
 * much as a kilometre of travelling, which is roughly how somebody talks about
 * it — 「太遠了」 and 「太久了」 rule things out at similar rates — and the effect
 * that matters is only that neither axis can win outright. Something 2km away
 * next March must not beat something 30km away tomorrow, and something on the
 * far side of the island tonight must not beat the market under the bridge.
 *
 * Nothing is filtered out for being far. A traveller in 高雄 still gets a rail,
 * because a section that empties itself in most of the country is worse than one
 * that is honest about the distance — and every card prints how far it is.
 */

/** Beyond this, 「附近」 stops being a true word for the heading. */
export const NEAR_M = 25_000;

export interface RailEvent {
  event: LocalEvent;
  /** Metres from where the traveller is standing. */
  metres: number;
  /** Negative while it is running. */
  inDays: number;
}

/**
 * The rail, closest-and-soonest first.
 *
 * `destId` is the trip's destination, and it only breaks ties: somebody with a
 * 花蓮 trip standing in 台北 should still be shown 台北's events first — they
 * are the ones they can walk to today — but between two equally scored events
 * the one belonging to the trip wins.
 */
export function eventRail(at: LatLng, destId?: string, limit = 8): RailEvent[] {
  const now = startOfDay();

  const scored = EVENTS.flatMap((event) => {
    const run = nextRun(event, now);
    /* No resolvable run means no card. There is nothing honest to print in the
       place where the date goes. */
    if (!run) return [];
    const metres = distance(at, event);
    const inDays = Math.round((+run.start - +now) / 86_400_000);
    return [{ event, metres, inDays }];
  });

  return scored
    .sort((a, b) => score(a, destId) - score(b, destId))
    .slice(0, limit);
}

/** Lower is better. Kilometres plus days, with the trip's city as a tiebreak. */
function score(r: RailEvent, destId?: string): number {
  const km = r.metres / 1000;
  /* Already running counts as today rather than as negative days — an event on
     its fourth day is not more urgent than one starting tomorrow, and letting
     the number go negative made long festivals dominate the whole rail. */
  const days = Math.max(0, r.inDays);
  const home = destId && r.event.destId === destId ? -0.5 : 0;
  return km + days + home;
}

/** True when the heading may say 附近 — the nearest one genuinely is. */
export const railIsNear = (rail: RailEvent[]) =>
  rail.length > 0 && rail[0].metres <= NEAR_M;
