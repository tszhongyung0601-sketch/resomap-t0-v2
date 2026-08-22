import { readFile, writeFile } from "node:fs/promises";

/**
 * Every photograph in the app, with the licence that lets it be here.
 *
 * Read out of `imagePrompts.ts` rather than kept alongside it, because a
 * hand-maintained credits list drifts from the manifest and a drifted credit is
 * a licence breach wearing a tidy table.
 *
 *   node scripts/build-photo-attribution.mjs
 */
const manifest = await readFile("src/data/imagePrompts.ts", "utf8");

const names = {};
for (const f of ["poi.tw-north", "poi.tw-south", "poi.tw-east", "poi.overseas"]) {
  const s = await readFile(`src/data/${f}.ts`, "utf8");
  for (const b of s.split("\n  {").slice(1)) {
    const id = b.match(/\n {4}id: "([^"]+)"/)?.[1];
    if (id) names[id] = b.match(/\n {4}name: "([^"]+)"/)?.[1] ?? id;
  }
}

const rows = [];
for (const b of manifest.split("\n  {").slice(1)) {
  const id = b.match(/poiId: "([^"]+)"/)?.[1];
  if (!id || !/\n\s+src: "/.test(b)) continue;
  /* `\s*` after the colon: the long Commons URLs get wrapped onto the next
     line by the formatter, and a same-line-only match returns nothing — which
     reads as "this photo has no source" rather than as a bug in the reader. */
  const g = (k) => b.match(new RegExp(String.raw`${k}:\s*"((?:[^"\\]|\\.)*)"`))?.[1];
  const author = g("author");
  if (!author) continue;
  rows.push({
    id,
    name: names[id] ?? id,
    author: author.replace(/\\"/g, '"'),
    licence: g("licence") ?? "",
    licenceUrl: g("licenceUrl") ?? "",
    source: (g("source") ?? "").replace(/\\"/g, '"'),
    via: g("via") ?? "Wikimedia Commons",
  });
}

const byVia = {};
for (const r of rows) (byVia[r.via] ??= []).push(r);

const table = (list) =>
  [
    "| 景點 | 攝影 | 授權 | 來源 |",
    "| --- | --- | --- | --- |",
    ...list
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((r) => `| ${r.name} | ${r.author} | [${r.licence}](${r.licenceUrl}) | [原始頁面](${r.source}) |`),
  ].join("\n");

await writeFile(
  "PHOTO_ATTRIBUTION.md",
  `# 景點照片來源與授權

App 裡 ${rows.length} 張景點照片的攝影者、授權與原始頁面。全部在開發階段下載進專案、
裁切成 WebP 後隨站台部署，沒有任何一張是熱連結、AI 生成或通用圖庫的替身。

每個景點頁的照片下方也會顯示同樣的資訊（見 \`PhotoCredit\`），不是只寫在這份文件裡。

處理方式：原圖 → sharp（attention crop）→ WebP。兩個尺寸：
\`-card.webp\` 600×450（列表縮圖）、\`-hero.webp\` 1400×788（景點頁大圖）。

## 為什麼有兩個來源

**Wikimedia Commons** 是主要來源：台灣的景點在那裡幾乎都有真實照片，
而且 CC 授權要求標示出處——那是條款不是禮貌。

**Pexels** 只用在海外景點。那些地方的 Commons 覆蓋較差，而東京晴空塔、伏見稻荷、
景福宮這種世界級地標在商業圖庫裡有大量真實照片。Pexels 授權不要求標示出處，
這裡還是標了，理由跟人像那份一樣。

其中三張是「一類餐食」而不是特定店家（淺草燒肉、澀谷居酒屋、銀座拉麵），拍的是那道菜；
manifest 裡的註解會標出來。

${Object.entries(byVia)
  .map(([via, list]) => `## via ${via}（${list.length} 張）\n\n${table(list)}`)
  .join("\n\n")}

## 還沒有照片的

| 景點 | 為什麼 |
| --- | --- |
| 阿明豬心冬粉 | 特定台南店家。Commons 與 Pexels 都沒有，泛用米粉湯照片撐一家有名字的店，跟拿風景照撐一個人是同一種錯 |

它顯示 T0 的 \`Generated\` 硬邊海報圖——那是設計過的空狀態，不是破圖。

## 重新產生

\`\`\`bash
PEXELS_KEY=... node scripts/fetch-poi-photos.mjs        # 海外景點
node scripts/fetch-commons-photo.mjs <poiId> "File:…"   # 單張，指定 Commons 檔名
node scripts/apply-poi-photos.mjs                       # 寫進 imagePrompts.ts
node scripts/build-photo-attribution.mjs                # 重寫這份文件
\`\`\`
`,
  "utf8",
);
console.log(`PHOTO_ATTRIBUTION.md — ${rows.length} photos (${Object.entries(byVia).map(([k, v]) => `${k}: ${v.length}`).join(", ")})`);
