import sharp from "sharp";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { CASTING } from "./portrait-casting.mjs";
import { DOCUMENTARY, EAST_ASIAN, OFF_REGISTER, OVERRIDE, queryFor } from "./stock-queries.mjs";
import { writeManifest } from "./portrait-manifest.mjs";

/**
 * Photographs of real people, from Pexels, for the drivers and guides.
 *
 * These are model-released stock images: the people in them signed a release
 * that permits exactly this — being depicted as somebody they are not, in
 * commercial work. That is why this library and not another. A Creative Commons
 * photograph of an identifiable person on Wikimedia carries the photographer's
 * copyright licence and no release at all, so using one to front a fictional
 * business with a fabricated rating would put a real person's face behind a
 * claim they never made. Same picture, entirely different thing.
 *
 * Two rules the fetch enforces, because both failures are invisible until the
 * list is on screen:
 *
 *   **No photograph twice, and no photographer twice.** A stock search returns
 *   whole shoots — six frames of the same model against the same wall — so
 *   deduping on the photo id alone gives you the same face under two names,
 *   which is worse than the borrowed scenery this whole exercise replaced.
 *
 *   **The gender has to match the name.** Pexels' `alt` text is written by
 *   people and is reliable about this one thing, so a result whose description
 *   contradicts the casting is skipped rather than cropped and hoped over.
 *
 *   PEXELS_KEY=... node scripts/fetch-stock-portraits.mjs [ids...]
 */

const KEY = process.env.PEXELS_KEY;
if (!KEY) {
  console.error("set PEXELS_KEY (https://www.pexels.com/api/) and run again");
  process.exit(1);
}

const OUT = "public/portraits";
const CREDITS = ".stock-portraits.json";
const SIZES = [
  { suffix: "card", width: 720, height: 405, quality: 78 },
  { suffix: "hero", width: 1280, height: 720, quality: 80 },
  { suffix: "thumb", width: 320, height: 320, quality: 82 },
];

/* `p-xiaofang:2` means "skip the first two acceptable candidates". Every
   filter here is a proxy — none of them can see a face — so the last pass is a
   person looking at a contact sheet and re-rolling the ones that are wrong. */
const args = process.argv.slice(2);
/* `p-acheng:2` skips the first two acceptable candidates. `p-acheng=11563145`
   pins one Pexels photo outright — the escape hatch for the two or three slots
   where every filter passes something and a person can still see it is wrong.
   No proxy here can look at a face; the last pass is somebody who can. */
const skips = new Map();
const pins = new Map();
for (const a of args) {
  if (a.includes("=")) {
    const [id, photo] = a.split("=");
    pins.set(id, Number(photo));
    skips.set(id, 0);
  } else {
    const [id, n] = a.split(":");
    skips.set(id, Number(n) || 0);
  }
}
const wanted = args.length ? CASTING.filter((c) => skips.has(c.id)) : CASTING;

async function photoById(id) {
  const res = await fetch(`https://api.pexels.com/v1/photos/${id}`, { headers: { Authorization: KEY } });
  if (!res.ok) throw new Error(`pexels ${res.status} for photo ${id}`);
  return res.json();
}

const MALE = /\b(man|men|male|guy|gentleman|father|boy|his|he)\b/i;
const FEMALE = /\b(woman|women|female|lady|girl|mother|her|she)\b/i;
const REJECT = /\b(child|children|kid|kids|baby|toddler|infant|teen|nude|naked|couple|group of|crowd)\b/i;

async function search(query, page = 1) {
  const url =
    "https://api.pexels.com/v1/search?" +
    /* No orientation filter. Studio portraits are shot vertical, and asking
       for landscape throws away most of the library to win a crop that
       `attention` handles anyway. */
    new URLSearchParams({ query, per_page: "80", page: String(page) });
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { Authorization: KEY } });
    if (res.ok) return (await res.json()).photos ?? [];
    /* 429 is the free tier's 200-an-hour ceiling. Backing off beats losing the
       run, and losing the run means the already-written half of the set stays
       on disk mixed with the half that never arrived. */
    if (res.status !== 429) throw new Error(`pexels ${res.status} for "${query}"`);
    await new Promise((r) => setTimeout(r, 20000 * (attempt + 1)));
  }
  throw new Error(`pexels rate limit exhausted for "${query}"`);
}

/** 0-1, from Pexels' `avg_color` hex. */
function luminance(hex) {
  if (!hex) return 0.5;
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
}

/** Ids and photographers already spoken for, so nobody appears twice. */
const usedPhoto = new Set();
const usedShooter = new Set();

function pick(photos, sex, skip = 0, namedOnly = false) {
  const wantsMale = sex === "m";
  let seen = 0;
  for (const p of photos) {
    if (usedPhoto.has(p.id) || usedShooter.has(p.photographer_id)) continue;
    const alt = p.alt ?? "";
    if (REJECT.test(alt)) continue;

    /* The release check, as far as an alt string can carry one. A studio cue
       means somebody set up a light for a model; a documentary cue means a
       photographer pointed a camera at a stranger in a market. Only the first
       kind may front a fictional business with a fabricated rating on it.
       An empty alt is not good enough here — it is skipped rather than
       gambled on, because the failure is unfixable once it is published.

       Ethnicity cannot be required — Pexels' alt text names it in roughly none
       of eighty results, and demanding the word rejected every photograph on
       every page. So it is a preference instead: `namedOnly` runs a whole pass
       over the page taking only photos whose alt says so, and the caller falls
       back to a second pass without it. The query carries the rest of that job,
       which is why it is five words long and why its shape is documented next
       door. */
    if (!alt) continue;
    if (namedOnly && !EAST_ASIAN.test(alt)) continue;
    if (DOCUMENTARY.test(alt)) continue;
    if (OFF_REGISTER.test(alt)) continue;

    /* Forty photographs in one list have to look like one set. Pexels publishes
       an average colour per photo, which is a crude but effective proxy for how
       the frame is lit: reject the near-black dramatic ones and the blown-out
       white ones and what is left sits in the same register. */
    const lum = luminance(p.avg_color);
    if (lum < 0.34 || lum > 0.88) continue;

    /* A contradicting description is a real signal and the only cheap check
       available without looking at the face. */
    if (wantsMale ? FEMALE.test(alt) && !MALE.test(alt) : MALE.test(alt) && !FEMALE.test(alt)) {
      continue;
    }
    if (seen++ < skip) continue;
    return p;
  }
  return null;
}

await mkdir(OUT, { recursive: true });

const credits = [];
const failed = [];

for (const c of wanted) {
  const query = OVERRIDE[c.id] ?? queryFor(c, CASTING.indexOf(c));

  /* Two passes over the same pages: everything whose alt actually says "Asian"
     first, then everything else. Reversing that order is how a demo about
     Taiwan ends up fronted by a senior gentleman in Sanford, Florida. */
  if (pins.has(c.id)) {
    const p = await photoById(pins.get(c.id));
    usedPhoto.add(p.id);
    usedShooter.add(p.photographer_id);
    const b = Buffer.from(await (await fetch(p.src.large2x ?? p.src.original)).arrayBuffer());
    for (const s of SIZES) {
      await sharp(b)
        .resize(s.width, s.height, { fit: "cover", position: sharp.strategy.attention })
        .webp({ quality: s.quality })
        .toFile(join(OUT, `${c.id}-${s.suffix}.webp`));
    }
    credits.push({
      id: c.id, photoId: p.id, photographer: p.photographer,
      photographerUrl: p.photographer_url, url: p.url, alt: p.alt ?? "", query: "pinned",
    });
    console.log(`  ${c.id.padEnd(22)} ${String(p.id).padEnd(9)} ${p.photographer} (pinned)`);
    continue;
  }

  const skip = skips.get(c.id) ?? 0;
  /* One page at a time, both passes on it before asking for the next. Fetching
     four pages up front is 160 requests for forty people and the free tier
     allows 200 an hour, so the greedy version dies two thirds of the way
     through — with the first two thirds already written to disk. */
  const pages = [];
  let chosen = null;
  for (let page = 1; page <= 3 && !chosen; page++) {
    const photos = await search(query, page);
    if (!photos.length) break;
    pages.push(photos);
    for (const namedOnly of [true, false]) {
      for (const got of pages) {
        chosen = pick(got, c.sex, skip, namedOnly);
        if (chosen) break;
      }
      if (chosen) break;
    }
  }
  if (!chosen) {
    failed.push(`${c.id} — nothing usable for "${query}"`);
    continue;
  }

  usedPhoto.add(chosen.id);
  usedShooter.add(chosen.photographer_id);

  const img = await fetch(chosen.src.large2x ?? chosen.src.original);
  const buf = Buffer.from(await img.arrayBuffer());

  for (const s of SIZES) {
    await sharp(buf)
      /* `attention` rather than a centre crop: a 16:9 slice out of the middle
         of a standing portrait is a torso, and the face is the point. */
      .resize(s.width, s.height, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: s.quality })
      .toFile(join(OUT, `${c.id}-${s.suffix}.webp`));
  }

  const { size } = await stat(join(OUT, `${c.id}-hero.webp`));
  credits.push({
    id: c.id,
    photoId: chosen.id,
    photographer: chosen.photographer,
    photographerUrl: chosen.photographer_url,
    url: chosen.url,
    alt: chosen.alt ?? "",
    query,
  });
  console.log(`  ${c.id.padEnd(22)} ${String(chosen.id).padEnd(9)} ${chosen.photographer.padEnd(22)} ${Math.round(size / 1024)} kB`);
}

/* Merged, not replaced. A re-roll names four ids on the command line; writing
   only those four would throw away the credits for the other thirty-six, and a
   credit that is not recorded is a photographer who does not get named. */
let previous = [];
try {
  previous = JSON.parse(await readFile(CREDITS, "utf8"));
} catch {
  /* first run */
}
const merged = new Map(previous.map((c) => [c.id, c]));
for (const c of credits) merged.set(c.id, c);
const ordered = CASTING.map((c) => merged.get(c.id)).filter(Boolean);
await writeFile(CREDITS, JSON.stringify(ordered, null, 1), "utf8");
const { built, missing } = await writeManifest();

console.log(`\n${credits.length} fetched · ${built.length}/${built.length + missing.length} providers have a picture`);
for (const f of failed) console.log(`  ! ${f}`);
