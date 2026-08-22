import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Turn the source demo photographs into the two sizes the app actually asks
 * for, as WebP.
 *
 * The originals are 1254×1254 PNGs at roughly 2.3 MB each — eighteen megabytes
 * for eight pictures, which is more than the whole rest of the app. Shipping
 * them raw would have made the first paint of every list wait on a photo, on
 * exactly the phones this demo is shown on.
 *
 * Two crops, because the app has two slots:
 *   -card  720×405   the 16:9 image at the top of a list card (353 CSS px @2x)
 *   -hero 1280×720   the detail page's full-bleed header
 *
 * `attention` rather than a centre crop: four of these are portraits, and a
 * centred 16:9 slice of a square portrait cuts the face in half. sharp picks
 * the region with the most entropy, which on a person is reliably the person.
 *
 * Re-run with `node scripts/build-demo-photos.mjs` after adding a source file.
 * Output is committed, so a normal build does not need sharp at all.
 */

const SRC = process.argv[2] ?? "../resomap-http-demo/assets/content";
const OUT = "public/demo";

const SIZES = [
  { suffix: "card", width: 720, height: 405, quality: 72 },
  { suffix: "hero", width: 1280, height: 720, quality: 76 },
];

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (!files.length) {
  console.error(`no source images in ${SRC}`);
  process.exit(1);
}

for (const file of files) {
  const base = file.replace(/\.(png|jpe?g)$/i, "");
  for (const s of SIZES) {
    const out = join(OUT, `${base}-${s.suffix}.webp`);
    const info = await sharp(join(SRC, file))
      .resize(s.width, s.height, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: s.quality })
      .toFile(out);
    console.log(`${out}  ${(info.size / 1024).toFixed(0)} kB`);
  }
}
