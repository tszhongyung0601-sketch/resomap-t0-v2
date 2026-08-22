import sharp from "sharp";
import { mkdir, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { CASTING } from "./portrait-casting.mjs";
import { QUERIES } from "./stock-queries.mjs";
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
const SIZES = [
  { suffix: "card", width: 720, height: 405, quality: 78 },
  { suffix: "hero", width: 1280, height: 720, quality: 80 },
  { suffix: "thumb", width: 320, height: 320, quality: 82 },
];

const only = process.argv.slice(2);
const wanted = only.length ? CASTING.filter((c) => only.includes(c.id)) : CASTING;

const MALE = /\b(man|men|male|guy|gentleman|father|boy|his|he)\b/i;
const FEMALE = /\b(woman|women|female|lady|girl|mother|her|she)\b/i;
const REJECT = /\b(child|children|kid|kids|baby|toddler|infant|teen|nude|naked|couple|group of|crowd)\b/i;

async function search(query, page = 1) {
  const url =
    "https://api.pexels.com/v1/search?" +
    new URLSearchParams({ query, per_page: "40", page: String(page), orientation: "landscape" });
  const res = await fetch(url, { headers: { Authorization: KEY } });
  if (!res.ok) throw new Error(`pexels ${res.status} for "${query}"`);
  return res.json();
}

/** Ids and photographers already spoken for, so nobody appears twice. */
const usedPhoto = new Set();
const usedShooter = new Set();

function pick(photos, sex) {
  const wantsMale = sex === "m";
  for (const p of photos) {
    if (usedPhoto.has(p.id) || usedShooter.has(p.photographer_id)) continue;
    const alt = p.alt ?? "";
    if (REJECT.test(alt)) continue;
    /* An empty alt says nothing either way; a contradicting one is a real
       signal and the only cheap check available without looking at the face. */
    if (alt && (wantsMale ? FEMALE.test(alt) && !MALE.test(alt) : MALE.test(alt) && !FEMALE.test(alt))) {
      continue;
    }
    return p;
  }
  return null;
}

await mkdir(OUT, { recursive: true });

const credits = [];
const failed = [];

for (const c of wanted) {
  const query = QUERIES[c.id];
  if (!query) {
    failed.push(`${c.id} — no query`);
    continue;
  }

  let chosen = null;
  for (let page = 1; page <= 3 && !chosen; page++) {
    const { photos = [] } = await search(query, page);
    if (!photos.length) break;
    chosen = pick(photos, c.sex);
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

await writeFile(".stock-portraits.json", JSON.stringify(credits, null, 1), "utf8");
const { built, missing } = await writeManifest();

console.log(`\n${credits.length} fetched · ${built.length}/${built.length + missing.length} providers have a picture`);
for (const f of failed) console.log(`  ! ${f}`);
