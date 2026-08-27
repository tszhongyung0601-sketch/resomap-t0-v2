import sharp from "sharp";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { QUERIES, rejectReason } from "./event-queries.mjs";

/**
 * A picture for each invented event.
 *
 * The events do not exist, so there is no photograph of any of them and there
 * never could be. What these are is the same thing the hire-car photographs
 * are: stock imagery of the *kind of thing* the record describes, marked 示意圖
 * everywhere it appears, with the photographer named.
 *
 * That the subject is fictional makes the marking more important rather than
 * less. A stock forecourt above 「iRent 花蓮」 is at worst the wrong forecourt;
 * a photograph of a real lantern festival above 「安坑水燈漂流夜」 is a picture
 * of an event that happened attached to one that will not, and a reader who
 * takes it as documentation has been given evidence for something untrue. The
 * disclosure sentence on the rail and on the detail page is the answer to that,
 * and the 示意 mark on the image itself is the answer for the screenshot that
 * loses the sentence.
 *
 *   PEXELS_KEY=... node scripts/fetch-event-photos.mjs [ids...]
 *
 * `ev-bitan-market:2` skips the first two acceptable candidates;
 * `ev-bitan-market=17078606` pins one Pexels photo outright.
 */

const KEY = process.env.PEXELS_KEY;
if (!KEY) {
  console.error("set PEXELS_KEY (https://www.pexels.com/api/) and run again");
  process.exit(1);
}

const OUT = "public/events";
const CREDITS = ".stock-events.json";
const SIZES = [
  { suffix: "card", width: 720, height: 405, quality: 78 },
  { suffix: "hero", width: 1280, height: 720, quality: 80 },
];

/* ------------------------------------------------------------------ input */

const src = await readFile("src/data/events.ts", "utf8");
const IDS = [...src.matchAll(/\n {4}id: "(ev-[^"]+)"/g)].map((m) => m[1]);
if (IDS.length === 0) throw new Error("no events parsed out of events.ts");

const missingQuery = IDS.filter((id) => !QUERIES[id]);
if (missingQuery.length) throw new Error(`no query for: ${missingQuery.join(", ")}`);

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
const wanted = args.length ? IDS.filter((id) => skips.has(id)) : IDS;

/* ----------------------------------------------------------------- pexels */

async function search(query, page = 1) {
  const url =
    "https://api.pexels.com/v1/search?" +
    new URLSearchParams({
      query,
      per_page: "80",
      page: String(page),
      /* The card slot is 16:9 and so is the hero. Portrait results would be
         cropped to a vertical strip of whatever was in the middle. */
      orientation: "landscape",
    });
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { Authorization: KEY } });
    if (res.ok) return (await res.json()).photos ?? [];
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

function pick(photos, skip = 0) {
  let seen = 0;
  for (const p of photos) {
    if (usedPhoto.has(p.id)) continue;
    if (rejectReason(p.alt ?? "")) continue;
    if (seen++ < skip) continue;
    return p;
  }
  return null;
}

/* -------------------------------------------------------------------- run */

await mkdir(OUT, { recursive: true });

const cache = new Map();
async function pageFor(query) {
  if (!cache.has(query)) cache.set(query, await search(query));
  return cache.get(query);
}

const results = [];
for (const id of wanted) {
  let chosen = null;
  if (pins.has(id)) {
    chosen = await photoById(pins.get(id));
  } else {
    for (const q of QUERIES[id]) {
      chosen = pick(await pageFor(q), skips.get(id) ?? 0);
      if (chosen) break;
    }
  }

  if (!chosen) {
    console.warn(`  ${id.padEnd(30)} no candidate`);
    continue;
  }

  usedPhoto.add(chosen.id);
  const url = chosen.src.original + "?auto=compress&cs=tinysrgb&w=2000";
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());

  for (const s of SIZES) {
    await sharp(buf)
      .resize(s.width, s.height, { fit: "cover", position: "attention" })
      .webp({ quality: s.quality })
      .toFile(join(OUT, `${id}-${s.suffix}.webp`));
  }

  results.push({
    id,
    photoId: chosen.id,
    photographer: chosen.photographer,
    photographerUrl: chosen.photographer_url,
    url: chosen.url,
    alt: chosen.alt,
  });
  console.log(`  ${id.padEnd(30)} ${String(chosen.id).padEnd(10)} ${(chosen.alt ?? "").slice(0, 52)}`);
}

/* Merged, never replaced — the credits are the only record of who took each
   photograph, and a re-roll of three ids must not discard the other fourteen. */
const merged = [...prior.filter((c) => !results.some((r) => r.id === c.id)), ...results].sort(
  (a, b) => a.id.localeCompare(b.id),
);
await writeFile(CREDITS, JSON.stringify(merged, null, 2), "utf8");

await writeManifest();
await writeCredits(merged);

console.log(`\n${results.length} fetched · ${merged.length} on file`);

/* -------------------------------------------------------------- generated */

/** A reading of the directory, never a list somebody maintains. */
async function writeManifest() {
  const known = new Set(IDS);
  let files = [];
  try {
    files = await readdir(OUT);
  } catch {
    /* nothing fetched yet */
  }
  const built = files
    .filter((f) => f.endsWith("-card.webp"))
    .map((f) => f.replace(/-card\.webp$/, ""))
    .filter((id) => known.has(id))
    .sort();

  await writeFile(
    "src/data/eventPhotos.ts",
    `/**
 * Which events have a picture on disk.
 *
 * GENERATED by \`node scripts/fetch-event-photos.mjs\`. Do not hand-edit: an id
 * in here without a file behind it is a broken image on a card.
 *
 * None of these is a photograph of the event it sits on — the events are
 * invented, so no such photograph exists. They are stock images of the kind of
 * evening each record describes, which is why \`EventImage\` puts the 示意 mark
 * on the picture itself rather than trusting a line at the foot of the page.
 */
export const EVENT_PHOTO_IDS: ReadonlySet<string> = new Set([
${built.map((id) => `  ${JSON.stringify(id)},`).join("\n")}
]);

export const hasEventPhoto = (id: string) => EVENT_PHOTO_IDS.has(id);
`,
    "utf8",
  );
}

/** Who took each one. The Pexels licence does not require this; we do. */
async function writeCredits(all) {
  const name = (id) => {
    const i = src.indexOf(`id: "${id}"`);
    return i < 0 ? "" : (src.slice(i, i + 400).match(/name: "([^"]+)"/)?.[1] ?? "");
  };
  await writeFile(
    "src/data/eventCredits.ts",
    `/**
 * Who photographed each event card.
 *
 * GENERATED by \`node scripts/fetch-event-photos.mjs\`.
 *
 * The Pexels licence does not require attribution. This is here for the same
 * reason the portrait and vehicle credits are: the alternative is a set of
 * photographers whose work fronts a product and who are named nowhere in it.
 *
 * \`alt\` is the photographer's own description, kept verbatim. It is what the
 * picture actually shows — which, on a screen full of invented events, is the
 * only caption on the page that is true of the image.
 */
export interface EventCredit {
  photographer: string;
  photographerUrl: string;
  url: string;
  alt: string;
  /** The invented event this illustrates. */
  event: string;
}

export const EVENT_CREDITS: Record<string, EventCredit> = {
${all
  .map(
    (c) => `  ${JSON.stringify(c.id)}: {
    photographer: ${JSON.stringify(c.photographer ?? "")},
    photographerUrl: ${JSON.stringify(c.photographerUrl ?? "")},
    url: ${JSON.stringify(c.url ?? "")},
    alt: ${JSON.stringify(c.alt ?? "")},
    event: ${JSON.stringify(name(c.id))},
  },`,
  )
  .join("\n")}
};

export const eventCredit = (id: string): EventCredit | undefined => EVENT_CREDITS[id];
`,
    "utf8",
  );
}
