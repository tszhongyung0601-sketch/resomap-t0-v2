import { dateFromJulian, demoBoardingPass, parseBoardingPass } from "./bcbp";

/**
 * Boarding passes, real-shaped and malformed.
 *
 * `npm run test:bcbp`. The offsets are the whole of this module, so the
 * round-trip against the demo builder is the test that matters most: if a field
 * width is wrong in either place, the parse comes back shifted and every
 * assertion below moves at once.
 */

let failed = 0;
const check = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${label.padEnd(30)} ${ok ? "" : `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`,
  );
};

/* --------------------------------------------------------- the round trip */

const demo = demoBoardingPass();
check("demo length", demo.length, 60);
const p = parseBoardingPass(demo);
check("demo parses", Boolean(p), true);
check("passenger", p?.passenger, "MICKEY/DEMO MR");
check("pnr", p?.pnr, "RM7X2QK");
check("from", p?.from, "TPE");
check("to", p?.to, "HLN");
check("carrier", p?.carrier, "BR");
check("flightNo", p?.flightNo, "189");
check("cabin", p?.cabin, "Y");
check("seat", p?.seat, "12C");
check("sequence", p?.sequence, "55");
check("legs", p?.legs, 1);
check("julian", p?.julian, 232);

/* ------------------------------------------------------ a real-shaped one */

/* Padded exactly to the standard's field widths — a different airline, a
   different route, two legs, business class. */
const other =
  "M2" +
  "CHANG/TAI MR".padEnd(20) +
  "E" +
  "ABC123 " +
  "HND" +
  "TPE" +
  "JL ".padEnd(3) +
  "0099 " +
  "005" +
  "C" +
  "003A" +
  "0012 " +
  "1" +
  "00";
const o = parseBoardingPass(other);
check("other parses", Boolean(o), true);
check("other passenger", o?.passenger, "CHANG/TAI MR");
check("other route", `${o?.from}→${o?.to}`, "HND→TPE");
check("other carrier", o?.carrier, "JL");
check("other flight", o?.flightNo, "99");
check("other cabin", o?.cabin, "C");
check("other seat", o?.seat, "3A");
check("other legs", o?.legs, 2);

/* ------------------------------------------------------------- rejections */

check("empty", parseBoardingPass(""), null);
check("too short", parseBoardingPass("M1CHANG/TAI"), null);
/* A QR code from a hotel is a URL, and a URL is not a boarding pass however
   long it is. */
check("a url", parseBoardingPass("https://hotel.example.com/checkin?ref=99887766554433221100"), null);
/* Right length, right leading M1, but the airport fields are digits — this is
   the check that stops sixty characters of anything being read as a flight. */
check(
  "not airports",
  parseBoardingPass("M1" + "X".repeat(20) + "E" + "1234567" + "111" + "222" + "AA " + "0001 " + "100" + "Y" + "001A" + "0001 " + "1" + "00"),
  null,
);
check("wrong format code", parseBoardingPass("S1" + "X".repeat(56) + "00"), null);
/* Day 400 does not exist. */
check(
  "bad julian",
  parseBoardingPass("M1" + "X".repeat(20) + "E" + "1234567" + "TPE" + "HLN" + "BR " + "0189 " + "400" + "Y" + "012C" + "0055 " + "1" + "00"),
  null,
);

/* ------------------------------------------------------------------ dates */

/* No year is encoded, so the answer is the nearest occurrence. Scanned two
   days before new year, day 002 belongs to next year — not to the one that is
   about to end. */
const dec30 = new Date(2026, 11, 30);
check("julian 2 near new year", dateFromJulian(2, dec30).getFullYear(), 2027);
/* And the mirror: scanned on the 2nd of January, day 364 was last month. */
const jan2 = new Date(2027, 0, 2);
check("julian 364 near new year", dateFromJulian(364, jan2).getFullYear(), 2026);
/* Mid-year is unambiguous. */
const jun = new Date(2026, 5, 1);
check("julian 232 mid year", dateFromJulian(232, jun).getFullYear(), 2026);
check("julian 232 is 20 Aug", dateFromJulian(232, jun).getMonth() + 1, 8);
check("julian 232 day", dateFromJulian(232, jun).getDate(), 20);

console.log(failed === 0 ? "\nall good" : `\n${failed} FAILING`);
if (failed) process.exitCode = 1;
