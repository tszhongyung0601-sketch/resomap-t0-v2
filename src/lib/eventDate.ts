import type { LocalEvent, MonthDay } from "../data/events";

/**
 * When a year-less date actually is.
 *
 * The events carry `[8, 15]` and no year, which is what keeps the demo from
 * expiring — but a card saying 「還有 12 天」 needs a real date, and a rail that
 * sorts by "soonest" needs to know that 「1 月 3 日」 in December is next week
 * rather than eleven months ago.
 *
 * Two different questions are answered here, and keeping them apart is the
 * whole design:
 *
 *  - **Which occurrence is this?** Needs a year, and picks the next run that has
 *    not finished yet. Used for 還有 N 天 and for ordering the rail.
 *  - **Does this day fall inside the run?** Needs no year at all, and must not
 *    invent one. A trip day is 「8 月 16 日」 with no year either, so comparing
 *    them as month-and-day is not a shortcut — it is the only comparison that
 *    is actually well defined. Resolving both sides to years first would let
 *    one land in 2026 and the other in 2027 and report no overlap between two
 *    dates that plainly overlap.
 */

const DAY = 86_400_000;

/** Midnight local, so every comparison here is between whole days. */
export function startOfDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** A real date for month/day in `year`, or null when there is no such day. */
function on(year: number, [month, day]: MonthDay): Date | null {
  const d = new Date(year, month - 1, day);
  /* 2 月 30 日 rolls forward to 3 月 2 日, which is a different date. There is no
     such day, and saying so beats silently moving the festival. */
  if (d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

export interface Run {
  start: Date;
  end: Date;
}

/**
 * The next run of this event that has not already finished.
 *
 * Looks back a year as well as forward, because an event that started in
 * December and ends in January is running *now* while its start date sits in the
 * previous year. Returns the earliest run whose end is still ahead of today — so
 * something in its third day of five comes back as the current run, not as next
 * year's.
 *
 * Forward four years rather than one, for the single date that does not happen
 * annually: 2 月 29 日 exists in one year out of four, and a window of ±1 would
 * have returned null — and therefore no card at all — for the three years in
 * between. Four extra iterations of arithmetic is a cheaper answer than a
 * feature that vanishes.
 */
export function nextRun(e: LocalEvent, now = startOfDay()): Run | null {
  const y = now.getFullYear();
  let best: Run | null = null;

  for (const year of [y - 1, y, y + 1, y + 2, y + 3, y + 4]) {
    const start = on(year, e.from);
    if (!start) continue;
    /* The run ends in the following year when the end date sits earlier in the
       calendar than the start — 12/28 → 1/3 is six days, not minus 359. */
    const endYear = cmp(e.to, e.from) < 0 ? year + 1 : year;
    const end = on(endYear, e.to);
    if (!end) continue;
    if (+end < +now) continue;
    if (!best || +start < +best.start) best = { start, end };
  }
  return best;
}

/** Month/day ordering, ignoring the year. */
function cmp(a: MonthDay, b: MonthDay): number {
  return a[0] - b[0] || a[1] - b[1];
}

export type EventStatus =
  | { kind: "on"; endsInDays: number }
  | { kind: "soon"; inDays: number }
  | { kind: "unknown" };

/**
 * 「進行中」 / 「還有 3 天」, from the run rather than from a stored flag.
 *
 * A stored 「進行中」 is wrong by definition the day after it is written, which
 * is the reason this is computed on every read.
 */
export function statusOf(e: LocalEvent, now = startOfDay()): EventStatus {
  const run = nextRun(e, now);
  if (!run) return { kind: "unknown" };
  const inDays = Math.round((+run.start - +now) / DAY);
  if (inDays <= 0) {
    return { kind: "on", endsInDays: Math.round((+run.end - +now) / DAY) };
  }
  return { kind: "soon", inDays };
}

/** 「8/14 – 8/17」, or 「8/16」 when it is one day. */
export function runText(e: LocalEvent): string {
  const [fm, fd] = e.from;
  const [tm, td] = e.to;
  if (fm === tm && fd === td) return `${fm}/${fd}`;
  return `${fm}/${fd} – ${tm}/${td}`;
}

/** 「還有 3 天」 / 「今天到 8/17」 / 「最後一天」 — one short line for a card. */
export function statusText(e: LocalEvent, now = startOfDay()): string | null {
  const s = statusOf(e, now);
  if (s.kind === "unknown") return null;
  if (s.kind === "soon") return s.inDays === 1 ? "明天開始" : `還有 ${s.inDays} 天`;
  if (s.endsInDays === 0) return "今天最後一天";
  return "進行中";
}

/* ------------------------------------------------------- does a day fall in */

/** 「8 月 16 日」 → [8, 16]. Null for anything that is not one. */
export function parseMonthDay(text: string): MonthDay | null {
  const m = /(\d{1,2})\s*月\s*(\d{1,2})\s*日/.exec(text);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return [month, day];
}

/**
 * Is this month/day inside the run?
 *
 * Year-free on both sides, deliberately — see the note at the top. The
 * wrap-around case is the only thing that needs care: a run from 12/28 to 1/3
 * contains both 12/30 and 1/2, and a naive `from <= x && x <= to` says neither.
 */
export function runCovers(e: LocalEvent, md: MonthDay): boolean {
  const wraps = cmp(e.to, e.from) < 0;
  const afterStart = cmp(md, e.from) >= 0;
  const beforeEnd = cmp(md, e.to) <= 0;
  return wraps ? afterStart || beforeEnd : afterStart && beforeEnd;
}

/**
 * Which days of a trip this event could actually go on.
 *
 * The gate behind 加入行程. An empty array is not a failure to be papered over
 * with a disabled button — it is the answer 「這趟沒有那幾天」, and the screen
 * says that instead of offering a control that cannot do anything.
 */
export function daysMatching(
  e: LocalEvent,
  days: { n: number; date: string }[],
): { n: number; date: string }[] {
  return days.filter((d) => {
    const md = parseMonthDay(d.date);
    return md ? runCovers(e, md) : false;
  });
}
