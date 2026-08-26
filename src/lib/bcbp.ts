/**
 * Reading a boarding pass.
 *
 * The barcode on a boarding pass is not a mystery blob — it is IATA Resolution
 * 792, the Bar Coded Boarding Pass standard, and its mandatory section is a
 * fixed-width string at fixed offsets. Every airline in the world encodes the
 * same sixty characters the same way, which is why this can be parsed properly
 * rather than guessed at, and why it is the one document in this app whose
 * contents are read rather than typed.
 *
 *   M1CHANG/TAI MR       EABC123 TPEHLNBR 0189 231Y012C0055 100
 *   ││└──── name ──────┘│└ pnr ┘└f┘└t┘└c┘└flt┘└d┘│└st┘└seq┘│
 *   │└ legs             └ e-ticket                └ cabin  └ status
 *   └ format
 *
 * Only the mandatory items are read. The conditional section that follows them
 * is optional, airline-specific and frequently absent — including, annoyingly,
 * the year. So the date is a day-of-year and is resolved against the calendar
 * rather than invented; see `dateFromJulian`.
 *
 * Nothing here is lenient. A string that is not a boarding pass returns null
 * instead of a half-filled record, because a document screen showing a
 * confidently wrong flight number is worse than one showing nothing.
 */

export interface BoardingPass {
  /** "CHANG/TAI MR" as printed, trimmed. */
  passenger: string;
  /** The booking reference. Six or seven characters. */
  pnr: string;
  /** IATA airport codes. */
  from: string;
  to: string;
  /** "BR", "CI", "JL" — the operating carrier. */
  carrier: string;
  /** Without the leading zeros the standard pads with. */
  flightNo: string;
  /** Resolved to a real date; see `dateFromJulian`. */
  date: Date;
  /** Day of year exactly as encoded, for anybody who wants to check. */
  julian: number;
  /** Y, C, F — the compartment. */
  cabin: string;
  seat: string;
  sequence: string;
  legs: number;
}

/** Mandatory section length. Anything shorter cannot be a boarding pass. */
const MIN_LENGTH = 58;

/**
 * A day-of-year, turned into a date.
 *
 * The mandatory section carries no year. Resolving to "this year" is wrong
 * every December, so the answer is the nearest occurrence: the candidate in
 * last year, this year or next year that is closest to today. A pass scanned on
 * the 30th of December for day 002 is next year's, and one scanned on the 2nd
 * of January for day 364 is last year's, which is what those two passes are.
 */
export function dateFromJulian(julian: number, now = new Date()): Date {
  const candidates = [-1, 0, 1].map((offset) => {
    const d = new Date(now.getFullYear() + offset, 0, 1);
    d.setDate(julian);
    return d;
  });
  return candidates.reduce((best, d) =>
    Math.abs(d.getTime() - now.getTime()) < Math.abs(best.getTime() - now.getTime()) ? d : best,
  );
}

const AIRPORT = /^[A-Z]{3}$/;

export function parseBoardingPass(raw: string, now = new Date()): BoardingPass | null {
  const s = raw.replace(/\r?\n/g, "").trimEnd();
  if (s.length < MIN_LENGTH) return null;
  /* 'M' is the format code for a multiple-leg pass, which is what every
     printed and mobile boarding pass uses. 'S' exists in the standard and is
     not issued. */
  if (s[0] !== "M") return null;

  const legs = Number(s[1]);
  if (!Number.isInteger(legs) || legs < 1 || legs > 9) return null;

  const from = s.slice(30, 33).trim().toUpperCase();
  const to = s.slice(33, 36).trim().toUpperCase();
  /* The cheapest real check that this is a boarding pass and not sixty
     characters of something else that happened to start with M1. */
  if (!AIRPORT.test(from) || !AIRPORT.test(to)) return null;

  const julian = Number(s.slice(44, 47));
  if (!Number.isInteger(julian) || julian < 1 || julian > 366) return null;

  const flightRaw = s.slice(39, 44).trim();
  const flightNo = flightRaw.replace(/^0+/, "") || flightRaw;

  return {
    passenger: s.slice(2, 22).trim(),
    pnr: s.slice(23, 30).trim(),
    from,
    to,
    carrier: s.slice(36, 39).trim().toUpperCase(),
    flightNo,
    julian,
    date: dateFromJulian(julian, now),
    cabin: s.slice(47, 48).trim(),
    seat: s.slice(48, 52).trim().replace(/^0+/, ""),
    sequence: s.slice(52, 57).trim().replace(/^0+/, ""),
    legs,
  };
}

/** 「BR 189」 — the way it is written on a departure board. */
export const flightLabel = (b: BoardingPass) => `${b.carrier} ${b.flightNo}`;

/** 「張泰 · BR 189 · TPE → HLN」 for a one-line summary. */
export const routeLabel = (b: BoardingPass) => `${b.from} → ${b.to}`;

/* ------------------------------------------------------------------ demo */

const pad = (s: string, n: number) => s.slice(0, n).padEnd(n, " ");
const num = (n: number | string, w: number) => String(n).padStart(w, "0");

/**
 * A boarding pass for somebody who does not exist.
 *
 * Shipped so the document screen can be demonstrated without anybody having to
 * hold up their own ticket — a real one carries a real name and a real booking
 * reference, and a demo is the worst possible place to put either.
 *
 * Built by the same field widths the parser reads, so if one of them is wrong
 * the round-trip test fails rather than the sample quietly encoding nonsense.
 */
export function demoBoardingPass(): string {
  /* Day 232 is the 20th of August, which is the day every scripted trip in
     this demo starts. */
  const julian = 232;
  return (
    "M" +
    "1" +
    pad("MICKEY/DEMO MR", 20) +
    "E" +
    pad("RM7X2QK", 7) +
    "TPE" +
    "HLN" +
    pad("BR", 3) +
    pad(num(189, 4), 5) +
    num(julian, 3) +
    "Y" +
    pad("012C", 4) +
    pad(num(55, 4), 5) +
    "1" +
    "00"
  );
}
