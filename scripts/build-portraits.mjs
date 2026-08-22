import sharp from "sharp";
import { mkdir, readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { writeManifest } from "./portrait-manifest.mjs";

/**
 * Turn generated driver and guide portraits into the two sizes the app asks for.
 *
 * Drop one image per person into `.portrait-src/`, named after their provider
 * id — `p-qixingtan-guide.png`, `p-acheng.jpg`. The prompt for each id is in
 * PORTRAIT_PROMPTS.md; the id is also the filename the app will look for, so
 * naming the download correctly is the entire integration step.
 *
 * Two crops, matching the two slots the app has:
 *   -card   720×405   the 16:9 image at the top of a list card (353 CSS px @2x)
 *   -hero  1280×720   the detail page's full-bleed header
 *
 * `attention` rather than a centre crop, because these are portraits: a centred
 * 16:9 slice of a 1:1 render cuts the face in half, and sharp's entropy pass
 * lands on the person reliably. If a particular image crops badly, re-render it
 * already at 16:9 rather than fighting the crop here.
 *
 * The script also rewrites `src/data/portraits.ts` from what is actually on
 * disk, so the app never requests a file that does not exist. That is the whole
 * reason the manifest is generated: a hand-maintained list drifts, and every
 * entry that drifts is a broken image behind somebody's name.
 *
 * Output is committed; a normal build does not need sharp.
 *
 *   node scripts/build-portraits.mjs
 */

const SRC = process.argv[2] ?? ".portrait-src";
const OUT = "public/portraits";
const PROVIDERS = "src/data/providers.ts";

const SIZES = [
  { suffix: "card", width: 720, height: 405, quality: 74 },
  { suffix: "hero", width: 1280, height: 720, quality: 76 },
];

/** Ids the data actually has, so a typo in a filename is caught here. */
const known = new Set(
  [...(await readFile(PROVIDERS, "utf8")).matchAll(/\n    id: "(p-[^"]+)"/g)].map(
    (m) => m[1],
  ),
);

await mkdir(OUT, { recursive: true });

let sources = [];
try {
  sources = (await readdir(SRC)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
} catch {
  console.log(`no ${SRC}/ directory — nothing new to convert`);
}

for (const file of sources) {
  const id = file.replace(/\.[^.]+$/, "");
  if (!known.has(id)) {
    console.error(`  skip ${file} — "${id}" is not a provider id`);
    continue;
  }
  for (const s of SIZES) {
    const out = join(OUT, `${id}-${s.suffix}.webp`);
    await sharp(join(SRC, file))
      .resize(s.width, s.height, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: s.quality })
      .toFile(out);
    const { size } = await stat(out);
    console.log(`  ${out}  ${Math.round(size / 1024)} kB`);
  }
}

const { built, missing } = await writeManifest();

console.log(`
${built.length}/${built.length + missing.length} providers have a picture`);
if (missing.length) console.log(`still to draw: ${missing.join(", ")}`);
