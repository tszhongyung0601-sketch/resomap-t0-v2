import { demoEsimCode, looksLikeEsim, parseEsim } from "./lpa";

/** `npm run test:esim`. Real-shaped activation codes, and things that are not. */

let failed = 0;
const check = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${label.padEnd(30)} ${ok ? "" : `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`,
  );
};

const demo = parseEsim(demoEsimCode());
check("demo parses", Boolean(demo), true);
check("demo server", demo?.server, "rsp.example.com");
check("demo token", demo?.matchingId, "QR-G-5C-1LC-1S6TG6N");
check("demo no confirm", demo?.needsConfirmation, false);

/* Plenty of carriers encode the payload without the scheme. */
check("no LPA: prefix", parseEsim("1$rsp.truphone.com$ABC-123")?.server, "rsp.truphone.com");
check("lowercase lpa:", parseEsim("lpa:1$rsp.truphone.com$ABC-123")?.matchingId, "ABC-123");

/* The two optional trailing fields. */
const full = parseEsim("LPA:1$rsp.example.com$TOKEN-9$1.2.3.4$1");
check("oid", full?.oid, "1.2.3.4");
check("needs confirmation", full?.needsConfirmation, true);
check("confirm flag 0", parseEsim("LPA:1$rsp.example.com$T$$0")?.needsConfirmation, false);

/* --------------------------------------------------------------- rejects */

check("empty", parseEsim(""), null);
check("too few fields", parseEsim("LPA:1$rsp.example.com"), null);
check("wrong version", parseEsim("LPA:2$rsp.example.com$T"), null);
check("empty token", parseEsim("LPA:1$rsp.example.com$"), null);
/* A hotel QR is a URL, and a URL has no dollar signs in the right places. */
check("a url", parseEsim("https://hotel.example.com/checkin?ref=RM7X2QK"), null);
/* Right shape, but the server is not a host — this is the check that keeps
   arbitrary dollar-separated text out. */
check("not a host", parseEsim("LPA:1$not a server$TOKEN"), null);
check("host without tld", parseEsim("LPA:1$localhost$TOKEN"), null);

check("looksLike yes", looksLikeEsim("LPA:1$a.example.com$T"), true);
check("looksLike bare", looksLikeEsim("1$a.example.com$T"), true);
check("looksLike no", looksLikeEsim("https://example.com"), false);
/* A boarding pass must not be mistaken for one. */
check("looksLike not bcbp", looksLikeEsim("M1MICKEY/DEMO MR      E"), false);

console.log(failed === 0 ? "\nall good" : `\n${failed} FAILING`);
if (failed) process.exitCode = 1;
