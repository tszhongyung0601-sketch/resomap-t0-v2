import { readFile, writeFile, stat } from "node:fs/promises";

/**
 * Every hire car photograph, with the photographer and what it is a picture of.
 *
 *   node scripts/build-vehicle-attribution.mjs
 */
const credits = JSON.parse(await readFile(".stock-vehicles.json", "utf8"));
const src = await readFile("src/data/carRentals.ts", "utf8");

const field = (id, key) => {
  const i = src.indexOf(`id: "${id}"`);
  if (i < 0) return "";
  return src.slice(i, i + 600).match(new RegExp(`${key}: "([^"]+)"`))?.[1] ?? "";
};

const kb = async (p) => {
  try {
    return `${Math.round((await stat(p)).size / 1024)} kB`;
  } catch {
    return "—";
  }
};

const rows = await Promise.all(
  [...credits]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(async (c) => {
      const card = await kb(`public/vehicles/${c.id}-card.webp`);
      const hero = await kb(`public/vehicles/${c.id}-hero.webp`);
      return `| ${field(c.id, "brand")} ${field(c.id, "pickup")} | \`${c.id}\` | ${c.model} | ${card} / ${hero} | ${c.photographer} | [原始頁面](${c.url}) |`;
    }),
);

await writeFile(
  "VEHICLE_ATTRIBUTION.md",
  `# 租車照片來源

附近租車的 ${credits.length} 個據點各有一張車輛照片，全部來自 Pexels。

## 這些照片拍的是什麼

**是那個車型的示意照，不是那個據點的車。**

沒有任何圖庫有 iRent 花蓮車站的照片，而在一個有名有姓的據點後面放一張泛用停車場，
就是拿風景照撐一家有名字的餐廳的同一種錯——那條規則寫在 \`PHOTO_ATTRIBUTION.md\`，
這一輪沒有推翻它。

那為什麼還能放？因為卡片上已經寫了一件可以被照片說明的事實：「車型 Toyota Yaris · 5 人座」。
一張小掀背車放在那一行上面，是對那一行的示意，而且是真的。
所以照片是**依每筆記錄自己的 \`model\` 欄位**去找的，不是依品牌，也不是依城市。

每一張都會標示：

| 位置 | 標示 |
|---|---|
| 列表卡片 96px 縮圖 | 右下角「示意」 |
| 詳情頁大圖 | 右上角「圖庫示意」 |
| 詳情頁大圖下方 | 「車輛照片為 <車型> 的圖庫示意圖，非該據點實際車輛。攝影：…」 |

商業揭露（「Demo・未正式合作」）是另一件事，位置不變，兩者不互相取代：
一個說 ResoMap 跟這家公司沒有關係，一個說這張照片不是這家公司的車。

## 授權

[Pexels License](https://www.pexels.com/license/)——可商用、可修改、不要求標示出處。
這裡還是標了，理由跟人像那份一樣：${credits.length} 位攝影師的作品撐著一個產品的畫面，
而他們的名字不出現在裡面任何地方，這件事本身不對。

## 怎麼挑的

\`scripts/vehicle-queries.mjs\` 的規則，全部有單元測試（\`vehicle-queries.test.mjs\`），
測資就是前兩輪真的抓錯的那幾張：

- **必須是一整台車**——方向盤、儀表板、車標特寫在 96px 是一團看不懂的東西
- **必須是這個類別**——「compact minivan parked」回過一張夜間停車場，
  它是車、通過所有黑名單，但跟卡片寫的七人座沒有關係
- **不能跟卡片矛盾**——描述裡出現 BMW 就不能放在「Toyota Altis」上面，
  兩行字距離八毫米，讀的人會相信照片
- **不能是別人的工作或別人的運動**——賽車、貨車、警車、高爾夫球車

過不了的就跳過。最後一關是人看 contact sheet：四張在第一輪通過了所有規則
（描述沒提到品牌，但照片裡的車一看就是 Hyundai / BMW / Infiniti），
用 \`:n\` 重抽掉了。

## 名單

| 據點 | id | 車型 | 縮圖 / 大圖 | 攝影 | 原始頁面 |
| --- | --- | --- | --- | --- | --- |
${rows.join("\n")}

## 重新產生

\`\`\`bash
PEXELS_KEY=... node scripts/fetch-stock-vehicles.mjs
node scripts/build-vehicle-credits.mjs
node scripts/build-vehicle-attribution.mjs
\`\`\`

單獨重抽某幾筆：\`r-irent-hualien:2\` 跳過前兩個合格候選，
\`r-irent-hualien=17078606\` 直接指定一張 Pexels 照片。
重抽不會覆蓋沒動到的那幾筆的出處。
`,
  "utf8",
);
console.log(`VEHICLE_ATTRIBUTION.md — ${credits.length} photos`);
