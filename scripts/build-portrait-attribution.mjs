import { readFile, writeFile, stat } from "node:fs/promises";

/**
 * The photographers, in a file rather than only in the app.
 *
 * Pexels does not require attribution. This exists because forty photographers'
 * work fronts this product, because naming them costs one table, and because
 * the promise to credit them was made at the moment the API key was asked for.
 */
const credits = JSON.parse(await readFile(".stock-portraits.json", "utf8"));
const src = await readFile("src/data/providers.ts", "utf8");

const of = (id, field) => {
  const i = src.indexOf(`id: "${id}"`);
  if (i < 0) return "";
  const m = src.slice(i, i + 500).match(new RegExp(`${field}: "([^"]+)"`));
  return m ? m[1] : "";
};
const kb = async (f) => {
  try {
    return `${Math.round((await stat(`public/portraits/${f}`)).size / 1024)} kB`;
  } catch {
    return "—";
  }
};

const rows = [];
for (const c of credits) {
  rows.push(
    `| ${of(c.id, "name")} | \`${c.id}\` | ${await kb(`${c.id}-thumb.webp`)} / ${await kb(`${c.id}-hero.webp`)} | [${c.photographer}](${c.photographerUrl}) | [Pexels](${c.url}) |`,
  );
}

await writeFile(
  "PORTRAIT_ATTRIBUTION.md",
  `# 人物照片來源

司機與導遊的 ${credits.length} 張人像全部來自 [Pexels](https://www.pexels.com/)，
於開發階段透過 API 取得、裁切成 WebP 後隨站台部署。

## 這些是誰

**不是實際的服務者。** 是圖庫模特兒的照片，他們簽過肖像授權，
授權內容正是「被用來扮演不是自己的人」——這也是為什麼用這個來源，
而不是 Wikimedia：CC 授權給的是攝影師的著作權，不包含肖像權，
拿一張紀實街拍去撐一個虛構商號與虛構評價，是把真人放在他沒說過的話後面。

App 裡兩個地方說了這件事：卡片圖角落的「示意」標記，以及每個清單頁尾的
「人物照片為圖庫示意圖，非實際服務者本人」。服務者詳情頁另外顯示攝影師姓名與原始連結。

## 授權

[Pexels 授權](https://www.pexels.com/license/)：可免費商用、可修改、無需標示出處。
標示出處不是義務，是選擇——見上。

## 名單

| 服務者 | id | 縮圖 / 大圖 | 攝影 | 原始頁面 |
| --- | --- | --- | --- | --- |
${rows.join("\n")}

## 重新產生

\`\`\`bash
PEXELS_KEY=... node scripts/fetch-stock-portraits.mjs
node scripts/build-portrait-credits.mjs
node scripts/build-portrait-attribution.mjs
\`\`\`

單獨換掉某一位：\`... fetch-stock-portraits.mjs p-acheng:3\`（跳過前三個候選）
或 \`... p-acheng=11563145\`（指定某張 Pexels 照片）。
`,
  "utf8",
);
console.log(`PORTRAIT_ATTRIBUTION.md — ${credits.length} photographers`);
