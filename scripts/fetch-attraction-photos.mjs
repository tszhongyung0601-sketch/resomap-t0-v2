import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

/**
 * Fetch the seven Xindian / Jingmei attraction photographs from Wikimedia
 * Commons and cut them to the two sizes this app renders.
 *
 * Run once, by hand: `node scripts/fetch-attraction-photos.mjs`. The output is
 * committed, so a normal build never touches the network and never needs sharp.
 *
 * Every file below is a real photograph of the actual place under a free
 * licence — CC0, CC BY, CC BY-SA or public domain. No generated imagery, no
 * stock, and no file used for two different attractions. The credit travels
 * with the file into data/imagePrompts.ts, where `PhotoCredit` prints it under
 * the picture, because on CC BY and CC BY-SA that is a licence term rather than
 * a courtesy.
 *
 * Sizes match what the rest of the app already ships: a 4:3 card at 600px for
 * lists and a 16:9 hero at 1600px for anything that fills the screen width.
 */

const UA =
  "ResoMapT0V2-dev/1.0 (https://github.com/tszhongyung0601-sketch/resomap-t0-v2)";

const PHOTOS = [
  {
    id: "yulon-city",
    file: "新店 裕隆城 2023-11-02 (2).jpg",
    author: "Foxy1219",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "jingmei-park",
    file: "景美人權文化園區警備總司令部仁愛樓看守所外部.jpg",
    author: "人人生來平等",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "bitan",
    file: "Bitan Scenic Area.jpg",
    author: "Monyuan",
    licence: "CC0 1.0",
    licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  {
    id: "bitan-bridge",
    file: "新店 碧潭吊橋.JPG",
    author: "王彥翔",
    licence: "CC BY-SA 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  {
    id: "hemeishan",
    file: "View of Xindian skyline and Taipei 101 from Hemeishan top near Bitan 20230522 130327.jpg",
    author: "Anas1712",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    id: "xindian-riverside",
    file: "安坑橋，新店溪左岸河濱自行車道。 - panoramio.jpg",
    author: "C.L. Kao (eddie5150)",
    licence: "CC BY-SA 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  {
    id: "jingmei-market",
    file: "Jingmei-night-market.jpg",
    author: "Alfred Twu",
    licence: "CC0 1.0",
    licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
];

const API = "https://commons.wikimedia.org/w/api.php";

async function originalUrl(file) {
  const p = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url",
    titles: `File:${file}`,
  });
  const res = await fetch(`${API}?${p}`, { headers: { "User-Agent": UA } });
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  const url = page?.imageinfo?.[0]?.url;
  if (!url) throw new Error(`no imageinfo for ${file}`);
  /* Commons appends analytics params to the url it hands back; upload.wikimedia
     serves the file fine without them and the shorter url is what belongs in a
     log. */
  return url.split("?")[0];
}

await mkdir("public/photos", { recursive: true });

const manifest = [];

for (const p of PHOTOS) {
  const url = await originalUrl(p.file);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());

  /* `attention` rather than a centre crop: several of these are portrait or
     panoramic, and a centred slice of a 4000×1800 panorama is sky. */
  const cut = async (w, h, q, suffix) => {
    const out = `public/photos/${p.id}-${suffix}.webp`;
    const info = await sharp(buf)
      .resize(w, h, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: q })
      .toFile(out);
    return { out, kb: Math.round(info.size / 1024) };
  };

  const card = await cut(600, 450, 74, "card");
  const hero = await cut(1600, 900, 72, "hero");

  manifest.push({ ...p, sourceUrl: url, commons: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(p.file)}` });
  console.log(`${p.id}  card ${card.kb}kB  hero ${hero.kb}kB`);
}

await writeFile(
  ".attraction-photos.json",
  JSON.stringify(manifest, null, 2),
  "utf8",
);
console.log("\nmanifest written to .attraction-photos.json");
