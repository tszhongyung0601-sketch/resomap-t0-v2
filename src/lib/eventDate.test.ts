import assert from "node:assert/strict";
import {
  daysMatching,
  nextRun,
  parseMonthDay,
  runCovers,
  runText,
  startOfDay,
  statusOf,
  statusText,
} from "./eventDate";
import { EVENTS, type LocalEvent } from "../data/events";

/**
 * The date maths, which is the only part of the events feature that can be
 * silently wrong.
 *
 * Everything else about this feature fails loudly — a missing photo is a
 * fallback you can see, a bad coordinate is a card in the wrong order. A run
 * that resolves to the wrong year shows a plausible 「還有 340 天」 on something
 * happening this weekend, and nobody reviewing a screenshot would catch it.
 *
 * Run with `npm run test:events`.
 */

let pass = 0;
const fail: string[] = [];

function check(name: string, fn: () => void) {
  try {
    fn();
    pass++;
  } catch (e) {
    fail.push(`${name}: ${(e as Error).message}`);
  }
}

/** A fixture, so the tests do not move when the data does. */
const ev = (from: [number, number], to: [number, number]): LocalEvent => ({
  id: "t",
  name: "t",
  destId: "taipei",
  area: "t",
  lat: 25,
  lng: 121,
  kind: "market",
  from,
  to,
  at: "10:00",
  hook: "t",
  about: "t",
  stayMin: 60,
  tint: "#fff",
});

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

/* ------------------------------------------------------------- parseMonthDay */

check("parses the itinerary's own date format", () => {
  assert.deepEqual(parseMonthDay("8 月 16 日"), [8, 16]);
  assert.deepEqual(parseMonthDay("12 月 3 日"), [12, 3]);
});

check("tolerates the spacing the fixtures actually use", () => {
  assert.deepEqual(parseMonthDay("8月16日"), [8, 16]);
});

check("refuses anything that is not a date", () => {
  assert.equal(parseMonthDay("下星期"), null);
  assert.equal(parseMonthDay(""), null);
  assert.equal(parseMonthDay("13 月 1 日"), null);
  assert.equal(parseMonthDay("8 月 32 日"), null);
});

/* -------------------------------------------------------------- runCovers */

check("covers both ends of the run, inclusive", () => {
  const e = ev([8, 14], [8, 17]);
  assert.equal(runCovers(e, [8, 14]), true);
  assert.equal(runCovers(e, [8, 17]), true);
  assert.equal(runCovers(e, [8, 16]), true);
  assert.equal(runCovers(e, [8, 13]), false);
  assert.equal(runCovers(e, [8, 18]), false);
});

check("a one-day event covers exactly one day", () => {
  const e = ev([8, 16], [8, 16]);
  assert.equal(runCovers(e, [8, 16]), true);
  assert.equal(runCovers(e, [8, 15]), false);
  assert.equal(runCovers(e, [8, 17]), false);
});

check("a run across new year covers both sides of it", () => {
  const e = ev([12, 28], [1, 3]);
  assert.equal(runCovers(e, [12, 30]), true);
  assert.equal(runCovers(e, [1, 2]), true);
  assert.equal(runCovers(e, [12, 27]), false);
  assert.equal(runCovers(e, [1, 4]), false);
  assert.equal(runCovers(e, [6, 1]), false);
});

check("a run spanning months covers the month boundary", () => {
  const e = ev([9, 26], [10, 5]);
  assert.equal(runCovers(e, [9, 30]), true);
  assert.equal(runCovers(e, [10, 1]), true);
  assert.equal(runCovers(e, [9, 25]), false);
});

/* ---------------------------------------------------------------- nextRun */

check("picks this year when the run is still ahead", () => {
  const r = nextRun(ev([9, 5], [9, 14]), day(2026, 8, 27));
  assert.ok(r);
  assert.equal(r.start.getFullYear(), 2026);
  assert.equal(r.start.getMonth(), 8);
  assert.equal(r.start.getDate(), 5);
});

check("rolls to next year once this year's run has finished", () => {
  const r = nextRun(ev([6, 13], [6, 15]), day(2026, 8, 27));
  assert.ok(r);
  assert.equal(r.start.getFullYear(), 2027);
});

check("an event running right now returns the run it is in", () => {
  /* Started three days ago, ends in four. The next *start* is next year, so a
     naive "next start" would report 362 days on something happening today. */
  const r = nextRun(ev([8, 24], [8, 31]), day(2026, 8, 27));
  assert.ok(r);
  assert.equal(r.start.getFullYear(), 2026);
  assert.equal(r.start.getDate(), 24);
});

check("the last day of a run still counts as running", () => {
  const r = nextRun(ev([8, 20], [8, 27]), day(2026, 8, 27));
  assert.ok(r);
  assert.equal(r.start.getDate(), 20);
});

check("a run that ended yesterday rolls forward", () => {
  const r = nextRun(ev([8, 20], [8, 26]), day(2026, 8, 27));
  assert.ok(r);
  assert.equal(r.start.getFullYear(), 2027);
});

check("a new-year run is found from the January side", () => {
  /* On 2 January the run started last December — the year before the one being
     searched from. */
  const r = nextRun(ev([12, 28], [1, 3]), day(2026, 1, 2));
  assert.ok(r);
  assert.equal(r.start.getFullYear(), 2025);
  assert.equal(r.end.getFullYear(), 2026);
});

check("29 February resolves only to a leap year", () => {
  const r = nextRun(ev([2, 29], [2, 29]), day(2026, 3, 1));
  assert.ok(r);
  assert.equal(r.start.getFullYear(), 2028);
});

/* ----------------------------------------------------------------- status */

check("counts the days to something ahead", () => {
  const s = statusOf(ev([9, 5], [9, 14]), day(2026, 8, 27));
  assert.equal(s.kind, "soon");
  assert.equal(s.kind === "soon" && s.inDays, 9);
});

check("says 進行中 while it is on", () => {
  const s = statusOf(ev([8, 24], [8, 31]), day(2026, 8, 27));
  assert.equal(s.kind, "on");
  assert.equal(s.kind === "on" && s.endsInDays, 4);
});

check("names the last day as the last day", () => {
  assert.equal(statusText(ev([8, 20], [8, 27]), day(2026, 8, 27)), "今天最後一天");
});

check("tomorrow is not 還有 1 天", () => {
  assert.equal(statusText(ev([8, 28], [8, 29]), day(2026, 8, 27)), "明天開始");
});

/* --------------------------------------------------------------- runText */

check("prints a range as a range and a day as a day", () => {
  assert.equal(runText(ev([8, 14], [8, 17])), "8/14 – 8/17");
  assert.equal(runText(ev([8, 16], [8, 16])), "8/16");
});

/* ------------------------------------------------------------ daysMatching */

check("matches only the itinerary days inside the run", () => {
  const days = [
    { n: 1, date: "8 月 15 日" },
    { n: 2, date: "8 月 16 日" },
    { n: 3, date: "8 月 17 日" },
  ];
  assert.deepEqual(
    daysMatching(ev([8, 16], [8, 16]), days).map((d) => d.n),
    [2],
  );
  assert.deepEqual(
    daysMatching(ev([8, 14], [8, 17]), days).map((d) => d.n),
    [1, 2, 3],
  );
  assert.deepEqual(daysMatching(ev([9, 1], [9, 4]), days), []);
});

check("a day whose date cannot be read matches nothing", () => {
  assert.deepEqual(daysMatching(ev([8, 1], [12, 31]), [{ n: 1, date: "第一天" }]), []);
});

/* ------------------------------------------------------------ the fixtures */

check("every shipped event has a resolvable run", () => {
  for (const e of EVENTS) {
    assert.ok(nextRun(e), `${e.id} has no run`);
  }
});

check("no shipped event ends before it starts", () => {
  for (const e of EVENTS) {
    const r = nextRun(e);
    assert.ok(r && +r.end >= +r.start, `${e.id} ends before it starts`);
  }
});

check("event ids are unique", () => {
  const ids = new Set(EVENTS.map((e) => e.id));
  assert.equal(ids.size, EVENTS.length);
});

check("something lines up with the 花蓮 trip, or the add path is undemonstrable", () => {
  const days = [
    { n: 1, date: "8 月 15 日" },
    { n: 2, date: "8 月 16 日" },
    { n: 3, date: "8 月 17 日" },
  ];
  const hits = EVENTS.filter((e) => e.destId === "hualien" && daysMatching(e, days).length > 0);
  assert.ok(hits.length > 0, "no 花蓮 event falls inside 8/15–8/17");
});

check("startOfDay drops the clock", () => {
  const d = startOfDay(new Date(2026, 7, 27, 23, 59, 59));
  assert.equal(d.getHours(), 0);
  assert.equal(d.getDate(), 27);
});

/* ------------------------------------------------------------------ report */

if (fail.length > 0) {
  console.error(`${fail.length} failed, ${pass} passed`);
  for (const f of fail) console.error("  ✗ " + f);
  process.exit(1);
}
console.log(`all good — ${pass} checks`);
