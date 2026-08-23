import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CLASSES, classOf, marqueOf, rejectReason } from "./vehicle-queries.mjs";
import { writeVehicleManifest } from "./vehicle-manifest.mjs";

/**
 * A photograph of the class of car each hire counter is offering.
 *
 * Not a photograph of the counter, and it never claims to be: every one of
 * these ships with the 圖庫示意 mark burned into the corner of the component
 * that draws it, and the detail page names the photographer. The card already
 * says 「車型 Toyota Yaris · 5 人座」, so a small hatchback above that line is
 * illustrative and true at the same time — which is the most a stock library
 * can offer here, and a great deal more than a stock car park would.
 *
 * Same three disciplines as the portrait fetch next door, for the same reasons:
 *
 *   **No photograph twice.** Seeded from the credits already on file, so a
 *   re-roll naming four ids cannot hand one of them a picture the first run
 *   already gave to somebody else.
 *
 *   **Nothing that contradicts the card.** A description naming BMW cannot sit
 *   eight millimetres above the words 「Toyota Altis」. The reader believes the
 *   picture, not the caption.
 *
 *   **A whole car, parked.** Steering wheels, badges and rally cars all pass a
 *   naive "is it a car" test and all of them are useless at 96 pixels.
 *
 *   PEXELS_KEY=... node scripts/fetch-stock-vehicles.mjs [ids...]
 *
 * `r-irent-hualien:2` skips the first two acceptable candidates;
 * `r-irent-hualien=17078606` pins one Pexels photo outright. Every filter here
 * is a proxy — none of them can see the picture — so the last pass is a person
 * looking at the list and re-rolling what is wrong.
 */

const KEY = process.env.PEXELS_KEY;
if (!KEY) {
  console.error("set PEXELS_KEY (https://www.pexels.com/api/) and run again");
  process.exit(1);
}

const OUT = "public/vehicles";
const CREDITS = ".stock-vehicles.json";
const SIZES = [
  { suffix: "card", width: 720, height: 405, quality: 78 },
  { suffix: "hero", width: 1280, height: 720, quality: 80 },
  /* The 周邊推薦 card's left-hand square. Composed separately rather than
     cropped from the wide one: half of a 16:9 car is a door. */
  { suffix: "thumb", width: 320, height: 320, quality: 82 },
];

/* ------------------------------------------------------------------ input */

const src = await readFile("src/data/carRentals.ts", "utf8");
const RENTALS = [];
for (const block of src.split("\n  {").slice(1)) {
  const g = (k) => block.match(new RegExp(`${k}: "([^"]*)"`))?.[1];
  const id = g("id");
  if (!id || !id.startsWith("r-")) continue;
  const model = g("model") ?? "";
  RENTALS.push({ id, brand: g("brand"), model, cls: classOf(model), marque: marqueOf(model) });
}
if (RENTALS.length === 0) throw new Error("no rentals parsed out of carRentals.ts");

const args = process.argv.slice(2);
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
const wanted = args.length ? RENTALS.filter((r) => skips.has(r.id)) : RENTALS;

/* ------------------------------------------------------------------ pexels */

async function search(query, page = 1) {
  const url =
    "https://api.pexels.com/v1/search?" +
    /* Landscape, unlike the portraits. A car is a wide object and the card
       slot is 16:9; asking for portrait orientation here would mean cropping
       the front and back off every result. */
    new URLSearchParams({ query, per_page: "80", page: String(page), orientation: "landscape" });
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { Authorization: KEY } });
    if (res.ok) return (await res.json()).photos ?? [];
    /* 429 is the free tier's ceiling. Backing off beats losing the run and
       leaving half a set on disk. */
    if (res.status !== 429) throw new Error(`pexels ${res.status} for "${query}"`);
    await new Promise((r) => setTimeout(r, 20000 * (attempt + 1)));
  }
  throw new Error(`pexels rate limit exhausted for "${query}"`);
}

async function photoById(id) {
  const res = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
    headers: { Authorization: KEY },
  });
  if (!res.ok) throw new Error(`pexels ${res.status} for photo ${id}`);
  return res.json();
}

/** 0–1, from Pexels' `avg_color` hex. */
function luminance(hex) {
  if (!hex) return 0.5;
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
}

/* ------------------------------------------------------------------ dedupe */

const usedPhoto = new Set();
let prior = [];
try {
  prior = JSON.parse(await readFile(CREDITS, "utf8"));
  for (const c of prior) {
    if (skips.has(c.id)) continue; /* being replaced */
    usedPhoto.add(c.photoId);
  }
} catch {
  /* first run */
}

/* ------------------------------------------------------------------- pick */

function pick(photos, marque, cls, skip = 0) {
  let seen = 0;
  for (const p of photos) {
    if (usedPhoto.has(p.id)) continue;
    /* One predicate, unit-tested in vehicle-queries.test.mjs against the eleven
       descriptions that got through the first run. An empty description is
       rejected rather than gambled on: an unfixable wrong picture is worse than
       one fewer picture. */
    if (rejectReason(p.alt ?? "", marque, cls, p.url)) continue;
    /* Twenty-two pictures in one product have to look like one set. The very
       dark and the blown-out ones read as somebody else's photography. */
    const lum = luminance(p.avg_color);
    if (lum < 0.3 || lum > 0.9) continue;
    if (seen++ < skip) continue;
    return p;
  }
  return null;
}

/* ------------------------------------------------------------------- main */

await mkdir(OUT, { recursive: true });

const cache = new Map();
async function pageFor(query) {
  if (!cache.has(query)) cache.set(query, await search(query));
  return cache.get(query);
}

const results = [];
for (const r of wanted) {
  const spec = CLASSES[r.cls];
  let chosen = null;

  if (pins.has(r.id)) {
    chosen = await photoById(pins.get(r.id));
  } else {
    /* Each class has three phrasings. The first that yields something the
       filters accept wins; running all three would spend the rate limit to
       pick between candidates no proxy here can rank. */
    for (const q of spec.queries) {
      const photos = await pageFor(q);
      chosen = pick(photos, r.marque, r.cls, skips.get(r.id) ?? 0);
      if (chosen) break;
    }
  }

  if (!chosen) {
    console.warn(`  ${r.id.padEnd(26)} no candidate (${r.cls})`);
    continue;
  }

  usedPhoto.add(chosen.id);
  const src = chosen.src.original + "?auto=compress&cs=tinysrgb&w=2000";
  const buf = Buffer.from(await (await fetch(src)).arrayBuffer());

  for (const s of SIZES) {
    await sharp(buf)
      .resize(s.width, s.height, { fit: "cover", position: "attention" })
      .webp({ quality: s.quality })
      .toFile(join(OUT, `${r.id}-${s.suffix}.webp`));
  }

  results.push({
    id: r.id,
    photoId: chosen.id,
    photographer: chosen.photographer,
    photographerUrl: chosen.photographer_url,
    url: chosen.url,
    alt: chosen.alt,
    cls: r.cls,
    model: r.model,
  });
  console.log(`  ${r.id.padEnd(26)} ${String(chosen.id).padEnd(10)} ${(chosen.alt ?? "").slice(0, 58)}`);
}

/* Merged, never replaced. A re-roll of four ids that overwrote this file would
   throw away the credits for the eighteen it never touched — and the credits
   are the only record of who took each photograph. */
const merged = [...prior.filter((c) => !results.some((r) => r.id === c.id)), ...results].sort(
  (a, b) => a.id.localeCompare(b.id),
);
await writeFile(CREDITS, JSON.stringify(merged, null, 2), "utf8");

const { built, missing } = await writeVehicleManifest();
console.log(
  `\n${results.length} fetched · ${built.length} on disk${missing.length ? ` · missing: ${missing.join(", ")}` : ""}`,
);
