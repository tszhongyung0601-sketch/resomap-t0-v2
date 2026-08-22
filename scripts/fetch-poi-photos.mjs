import sharp from "sharp";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { POI_QUERIES } from "./poi-queries.mjs";

/**
 * Photographs for the POIs that still draw the generated poster.
 *
 * The poster is a good empty state and a bad default: on a trip card that shows
 * three thumbnails side by side, two photographs and one flat graphic reads as a
 * missing image rather than as a design. Twenty-four of the eighty-seven places
 * were in that position — almost all of them overseas, because the Wikimedia
 * pass only ever covered Taiwan.
 *
 * Two sizes, matching what `PoiImage` asks for:
 *   card   600×450   4:3, the list thumbnail
 *   hero  1400×788   16:9, the POI page header
 *
 * Cropped `attention` rather than centre: a landmark is rarely in the middle of
 * the frame a photographer chose, and a centred 4:3 slice of a wide shot of
 * 澀谷十字路口 is a building on the left.
 *
 *   PEXELS_KEY=... node scripts/fetch-poi-photos.mjs [ids...]
 */

const KEY = process.env.PEXELS_KEY;
if (!KEY) {
  console.error("set PEXELS_KEY (https://www.pexels.com/api/) and run again");
  process.exit(1);
}

const OUT = "public/photos";
const CREDITS = ".poi-photos.json";
const SIZES = [
  { suffix: "card", width: 600, height: 450, quality: 78 },
  { suffix: "hero", width: 1400, height: 788, quality: 80 },
];

/* A photograph of a place should look like the place, not like a poster of it.
   Rejecting the illustrated and the abstract keeps the set photographic. */
const REJECT = new RegExp(
  String.raw`\b(illustration|drawing|painting|sketch|vector|render|3d|cartoon|anime|poster|mockup|logo|portrait of|selfie|model posing)\b`,
  "i",
);

const args = process.argv.slice(2);
const skips = new Map(
  (args.length ? args : Object.keys(POI_QUERIES)).map((a) => {
    const [id, n] = a.split(":");
    return [id, Number(n) || 0];
  }),
);

async function search(query, page) {
  const url =
    "https://api.pexels.com/v1/search?" +
    new URLSearchParams({ query, per_page: "40", page: String(page), orientation: "landscape" });
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { Authorization: KEY } });
    if (res.ok) return (await res.json()).photos ?? [];
    if (res.status !== 429) throw new Error(`pexels ${res.status} for "${query}"`);
    await new Promise((r) => setTimeout(r, 20000 * (attempt + 1)));
  }
  throw new Error(`pexels rate limit exhausted for "${query}"`);
}

const usedPhoto = new Set();
let previous = [];
try {
  previous = JSON.parse(await readFile(CREDITS, "utf8"));
  for (const c of previous) if (!skips.has(c.poiId)) usedPhoto.add(c.photoId);
} catch {
  /* first run */
}

await mkdir(OUT, { recursive: true });

const fetched = [];
const failed = [];

for (const [id, skip] of skips) {
  const entry = POI_QUERIES[id];
  if (!entry) {
    failed.push(`${id} — no query`);
    continue;
  }

  let chosen = null;
  let seen = 0;
  for (let page = 1; page <= 3 && !chosen; page++) {
    for (const p of await search(entry.q, page)) {
      if (usedPhoto.has(p.id)) continue;
      const alt = p.alt ?? "";
      if (REJECT.test(alt)) continue;
      /* Under 1400 wide and the hero is an upscale rather than a photograph. */
      if (p.width < 1400) continue;
      if (seen++ < skip) continue;
      chosen = p;
      break;
    }
  }
  if (!chosen) {
    failed.push(`${id} — nothing usable for "${entry.q}"`);
    continue;
  }

  usedPhoto.add(chosen.id);
  const buf = Buffer.from(await (await fetch(chosen.src.large2x ?? chosen.src.original)).arrayBuffer());
  for (const s of SIZES) {
    await sharp(buf)
      .resize(s.width, s.height, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: s.quality })
      .toFile(join(OUT, `${id}-${s.suffix}.webp`));
  }

  const { size } = await stat(join(OUT, `${id}-hero.webp`));
  fetched.push({
    poiId: id,
    photoId: chosen.id,
    photographer: chosen.photographer,
    photographerUrl: chosen.photographer_url,
    url: chosen.url,
    alt: chosen.alt ?? "",
    query: entry.q,
    dish: Boolean(entry.dish),
  });
  console.log(`  ${id.padEnd(18)} ${String(chosen.id).padEnd(9)} ${chosen.photographer.padEnd(22)} ${Math.round(size / 1024)} kB`);
}

/* Merged, not replaced — a re-roll names two ids and must not drop the rest. */
const merged = new Map(previous.map((c) => [c.poiId, c]));
for (const c of fetched) merged.set(c.poiId, c);
await writeFile(CREDITS, JSON.stringify([...merged.values()], null, 1), "utf8");

console.log(`\n${fetched.length} fetched · ${merged.size} POI photos on file`);
for (const f of failed) console.log(`  ! ${f}`);
