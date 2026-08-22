import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * One Commons file → the two sizes a POI needs, plus its credit.
 *
 * The bulk Wikimedia pass covered Taiwan and the Pexels pass covered the
 * overseas landmarks; this is for the handful left over, where the right
 * photograph exists on Commons but only under a name no query would guess.
 *
 *   node scripts/fetch-commons-photo.mjs <poiId> "<File:Name.jpg>"
 */
const [poiId, fileTitle] = process.argv.slice(2);
if (!poiId || !fileTitle) {
  console.error('usage: node scripts/fetch-commons-photo.mjs <poiId> "File:Name.jpg"');
  process.exit(1);
}

const api = async (params) => {
  const r = await fetch(
    "https://commons.wikimedia.org/w/api.php?format=json&" + new URLSearchParams(params),
    { headers: { "User-Agent": "resomap-demo/0.1 (poi photo sourcing)" } },
  );
  return r.json();
};

const info = await api({
  action: "query",
  titles: fileTitle,
  prop: "imageinfo",
  iiprop: "url|extmetadata",
  iiurlwidth: "2000",
});
const page = Object.values(info.query?.pages ?? {})[0];
const ii = page?.imageinfo?.[0];
if (!ii) throw new Error(`no image info for ${fileTitle}`);

const meta = ii.extmetadata ?? {};
const strip = (html) => (html ?? "").replace(/<[^>]*>/g, "").trim();

const buf = Buffer.from(await (await fetch(ii.thumburl ?? ii.url)).arrayBuffer());
await mkdir("public/photos", { recursive: true });
for (const s of [
  { suffix: "card", width: 600, height: 450, quality: 78 },
  { suffix: "hero", width: 1400, height: 788, quality: 80 },
]) {
  await sharp(buf)
    .resize(s.width, s.height, { fit: "cover", position: sharp.strategy.attention })
    .webp({ quality: s.quality })
    .toFile(join("public/photos", `${poiId}-${s.suffix}.webp`));
}

const CREDITS = ".poi-photos.json";
let all = [];
try {
  all = JSON.parse(await readFile(CREDITS, "utf8"));
} catch {
  /* first run */
}
const entry = {
  poiId,
  photoId: page.pageid,
  photographer: strip(meta.Artist?.value) || "Unknown",
  photographerUrl: ii.descriptionurl,
  url: ii.descriptionurl,
  alt: strip(meta.ImageDescription?.value).slice(0, 160),
  query: fileTitle,
  licence: strip(meta.LicenseShortName?.value) || "CC",
  licenceUrl: meta.LicenseUrl?.value ?? "https://commons.wikimedia.org/wiki/Commons:Licensing",
  via: "Wikimedia Commons",
};
await writeFile(
  CREDITS,
  JSON.stringify([...all.filter((c) => c.poiId !== poiId), entry], null, 1),
  "utf8",
);
console.log(`${poiId}  ${entry.photographer}  ${entry.licence}`);
