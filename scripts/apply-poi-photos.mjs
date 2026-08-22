import { readFile, writeFile } from "node:fs/promises";

/**
 * Fold the fetched POI photographs into the image manifest.
 *
 * Appends one `ImageSlot` per photograph rather than editing the existing
 * entries, because the ones already there are Wikimedia work with a different
 * licence and a different provenance line. Re-running is safe: an id already in
 * the manifest is skipped, so this can be run after every re-roll.
 *
 *   node scripts/apply-poi-photos.mjs
 */
const MANIFEST = "src/data/imagePrompts.ts";
const credits = JSON.parse(await readFile(".poi-photos.json", "utf8"));
let src = await readFile(MANIFEST, "utf8");

const names = {};
for (const f of ["poi.tw-north", "poi.tw-south", "poi.tw-east", "poi.overseas"]) {
  const s = await readFile(`src/data/${f}.ts`, "utf8");
  for (const b of s.split("\n  {").slice(1)) {
    const id = b.match(/\n {4}id: "([^"]+)"/)?.[1];
    const n = b.match(/\n {4}name: "([^"]+)"/)?.[1];
    if (id) names[id] = n ?? id;
  }
}

const already = new Set(
  [...src.matchAll(/poiId: "([^"]+)",\n\s+kind: "photo"/g)].map((m) => m[1]),
);

const fresh = credits.filter((c) => !already.has(c.poiId));
if (!fresh.length) {
  console.log("manifest already has every fetched photo");
  process.exit(0);
}

const entries = fresh
  .map(
    (c) => `  {
    poiId: ${JSON.stringify(c.poiId)},
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* ${c.dish ? "這個 POI 是一類餐食而不是一家店，所以拍的是那道菜。" : c.via === "Wikimedia Commons" ? "圖庫沒有，Commons 有。" : "圖庫裡真的有這個地方的照片。"} */
    prompt: ${JSON.stringify(`${names[c.poiId] ?? c.poiId}。${c.alt || c.query}`)},
    status: "done",
    src: ${JSON.stringify(`photos/${c.poiId}-card.webp`)},
    srcLarge: ${JSON.stringify(`photos/${c.poiId}-hero.webp`)},
    credit: {
      author: ${JSON.stringify(c.photographer)},
      licence: ${JSON.stringify(c.licence ?? "Pexels License")},
      licenceUrl: ${JSON.stringify(c.licenceUrl ?? "https://www.pexels.com/license/")},
      source: ${JSON.stringify(c.url)},
      via: ${JSON.stringify(c.via ?? "Pexels")},
    },
  },`,
  )
  .join("\n");

/* Inserted before the closing bracket of IMAGE_SLOTS rather than appended to
   the file, which would put them after the helper functions. */
/* Tolerating \r, because this repository is checked out with CRLF endings and
   an exact "\n];\n" match finds nothing in it. */
const open = src.indexOf("export const IMAGE_SLOTS");
const close = /\r?\n\];/.exec(src.slice(open));
if (open < 0 || !close) throw new Error("could not find the end of IMAGE_SLOTS");
const at = open + close.index;
src = src.slice(0, at) + "\n" + entries + src.slice(at);

await writeFile(MANIFEST, src, "utf8");
console.log(`${fresh.length} slots appended (${credits.length - fresh.length} already present)`);
