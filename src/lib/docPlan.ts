import { editsFor, key, remember } from "./dayEdits";
import { applyEdits, diffDay, setTime, toClock, toMinutes } from "./reorder";
import type { TravelDoc } from "./docs";
import type { Day, Trip } from "../types";

/**
 * What a document has to say about an itinerary — offered, never applied.
 *
 * A boarding pass knows something the trip does not: you are not in the city
 * until the aircraft is on the ground. A first day that starts at nine when the
 * flight lands at half past two is not a plan, it is a plan for a different
 * day. So the document offers to move it.
 *
 * Offers. Every function here returns a description; `applyShift` runs only
 * when somebody has pressed the button. That is the rule the whole feature was
 * specified around, and it matters most here: this is the one place where a
 * piece of the traveller's real life reaches into something they built.
 *
 * The one thing it will not do is guess an arrival time. The mandatory section
 * of a boarding pass carries a date and no times at all — the departure time
 * lives in the optional conditional section, and the arrival time is nowhere in
 * the barcode. So the offer is anchored to a time the traveller confirms, not
 * to a number invented from a flight code.
 */

export interface DayShift {
  tripId: string;
  day: number;
  /** Minutes every stop moves later. Always positive; a shift back is a no-op. */
  minutes: number;
  /** Where the day starts now, and where it would start. */
  from: string;
  to: string;
  /** How many stops move. */
  stops: number;
}

/** The first stop of a day, in clock order. */
function firstStop(day: Day) {
  const stops = day.tracks.flatMap((t) => t.stops);
  if (stops.length === 0) return null;
  return stops.reduce((a, b) => (toMinutes(a.at) <= toMinutes(b.at) ? a : b));
}

/**
 * Work out what shifting a day to start at `startAt` would do.
 *
 * Returns null when there is nothing to offer — no such day, an empty day, or a
 * day that already starts late enough. That last case matters: a flight landing
 * at 08:00 has nothing to say to a day that begins at 10:00, and an app that
 * offered to "adjust" it anyway would be asking for a decision it did not need.
 */
export function planDayShift(trip: Trip, dayNumber: number, startAt: string): DayShift | null {
  const day = trip.days.find((d) => d.n === dayNumber);
  if (!day) return null;
  const first = firstStop(day);
  if (!first) return null;

  const minutes = toMinutes(startAt) - toMinutes(first.at);
  if (minutes <= 0) return null;

  return {
    tripId: trip.id,
    day: dayNumber,
    minutes,
    from: first.at,
    to: startAt,
    stops: day.tracks.reduce((n, t) => n + t.stops.length, 0),
  };
}

/**
 * Push every stop on the day later by the same amount.
 *
 * Applied stop by stop through `setTime`, latest first. Latest first is not a
 * detail: `setTime` refuses to place a stop earlier than it can physically be
 * reached, so moving an early stop before its neighbours have moved would let
 * that floor clamp the later ones to the old schedule. Walking backwards means
 * every stop is moved into space that is already empty.
 *
 * The result is stored as a hand-edit, layered on whatever the traveller has
 * already done to the day — the same path the chat and 編輯 mode use.
 */
export function applyShift(shift: DayShift, trip: Trip): boolean {
  const base = trip.days.find((d) => d.n === shift.day);
  if (!base) return false;

  const stored = editsFor(key(shift.tripId, shift.day));
  let next = stored ? (applyEdits(base, stored) ?? base) : base;

  const ordered = next.tracks
    .flatMap((t) => t.stops)
    .slice()
    .sort((a, b) => toMinutes(b.at) - toMinutes(a.at));

  for (const s of ordered) {
    next = setTime(next, s.id, toClock(toMinutes(s.at) + shift.minutes));
  }

  remember(shift.tripId, shift.day, diffDay(base, next));
  return true;
}

/**
 * The sentence a document offers, if it has one.
 *
 * Only a parsed flight does. A hotel code carries no standard fields at all, so
 * it has nothing to say about a schedule and does not pretend to — the traveller
 * types its date in themselves, and that is the honest division of labour.
 */
export function offerFor(doc: TravelDoc, trip: Trip | undefined): string | null {
  if (!doc.flight || !trip) return null;
  return `${doc.flight.carrier} ${doc.flight.flightNo} 在 ${doc.flight.from} → ${doc.flight.to}。要把這趟行程的某一天改成落地之後才開始嗎？`;
}
