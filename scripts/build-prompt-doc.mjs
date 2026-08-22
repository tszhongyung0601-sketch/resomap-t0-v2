import { readFile, writeFile } from "node:fs/promises";

/**
 * Turn the prompt set into the document a person actually works from.
 *
 * PORTRAIT_PROMPTS.md is not documentation of a decision — it is a worklist.
 * Somebody opens it, copies a paragraph into an image model, saves the result
 * under the filename in the heading, and runs build-portraits.mjs. Everything
 * here exists to make that loop short: the id is the filename, the Chinese line
 * is there so the list can be scanned without reading English, and the prompt
 * and its negative are in separate fenced blocks because they go into two
 * different fields.
 *
 *   node scripts/build-prompt-doc.mjs
 */

const { prompts } = JSON.parse(await readFile(".portrait-prompts.json", "utf8"));
const src = await readFile("src/data/providers.ts", "utf8");

/** kind and area per id, read from the data rather than restated here. */
const meta = new Map();
for (const block of src.split("\n  {").slice(1)) {
  const id = block.match(/\n {4}id: "(p-[^"]+)"/)?.[1];
  if (!id) continue;
  meta.set(id, {
    kind: block.match(/\n {4}kind: "([^"]+)"/)?.[1],
    area: block.match(/\n {4}area: "([^"]+)"/)?.[1],
    org: block.match(/\n {4}org: "([^"]+)"/)?.[1],
  });
}

const section = (kind, title) => {
  const rows = prompts.filter((p) => meta.get(p.id)?.kind === kind);
  let out = `\n---\n\n## ${title}（${rows.length} 位）\n`;
  rows.forEach((p, i) => {
    const m = meta.get(p.id);
    out += `\n### ${i + 1}. ${p.name}${m.org ? `（${m.org}）` : ""}\n\n`;
    out += `\`${p.id}.png\` → \`.portrait-src/\`　·　${m.area}\n\n`;
    out += `${p.zh}\n\n`;
    out += "```text\n" + p.prompt + "\n```\n\n";
    out += "<details><summary>Negative prompt</summary>\n\n```text\n" + p.negative + "\n```\n\n</details>\n";
  });
  return out;
};

const doc = `# 司機與導遊人像 Prompt

40 位包車司機與私人導遊，一人一條。**這份是升級用的，不是缺圖用的。**

App 裡 40 位現在全部都有圖：\`scripts/draw-portraits.mjs\` 依照下面每一條 prompt 的
年齡、髮型、帽子、衣著、場景與時辰，畫出 40 張平面插畫，用的是 T0 本來就在用的絹印海報
語言（硬邊、平塗、沒有漸層，見 \`Cover.tsx\` 的 \`Generated\`）。那是設計過的圖，不是佔位符。

這份文件存在，是為了哪天你想把整組換成**照片**。

## 為什麼一人一張、不共用

原本沒有人像的服務者，卡片會去借「最近景點」的風景照，所以七星潭附近的司機、導遊、旅館
全都長成同一片空的礫石灘——三張卡、三個名字、一張圖，而旅客要選的其實是「人」。
同一張臉掛兩個名字比借風景更糟，所以一人一張。

## 要換就 40 張一起換

一張照片擺在一張插畫旁邊，看起來不是「混搭」，是「壞掉」。
要嘛全部插畫（現況），要嘛 40 張照片一次到位。

## 怎麼用

1. 把某一條 prompt 貼進圖像模型（Negative prompt 另外貼）。
2. 存檔，**檔名就是標題裡那個 id**，例如 \`p-qixingtan-guide.png\`。
3. 全部丟進專案根目錄的 \`.portrait-src/\`（不進版控）。
4. 跑：

\`\`\`bash
node scripts/build-portraits.mjs
\`\`\`

會裁成 16:9、轉成 WebP 兩個尺寸（\`720×405\` 卡片、\`1280×720\` 詳情頁），
並依照 \`public/portraits/\` 實際有的檔案重寫 \`src/data/portraits.ts\`。
照片會蓋掉同一個人的插畫，而且之後再跑 \`draw-portraits.mjs\` 會自動跳過已經有照片的人。

## 版面規格（每條 prompt 裡都已經寫進去了）

- 16:9 橫幅，人物在中間偏右，頭在上方三分之一偏中。
- **左下角**是距離標籤（\`120 m\`）、**右上角**是「AI 生成」標籤——這兩個角要留背景，不能壓到臉。
- 畫面裡不要有任何文字或招牌（AI 生出來的中文招牌一定是亂碼）。
- 人是主角，不是風景裡的一個小人影。
${section("driver", "包車司機")}${section("guide", "私人導遊")}
---

## 這 40 條是怎麼寫出來的

不是各寫各的。先產生一份**全域選角表**——40 個人的性別、年齡、族群、體型、髮型、
衣著、場景、時間、動作、取景一次決定，因為「不要 40 個人長得像同一個人」這件事
只有同時看到 40 個人的時候才管得住。然後才分頭把每一列展開成 prompt，
最後由三個互相獨立的面向各自挑錯，再合併：

- **撞臉**：兩條 prompt 會不會生出同一個人、同一個姿勢、同一件衣服、同一個背景？
  有沒有哪一條其實會生出「一片風景裡有個小人」——那正是這次要修掉的 bug。
- **台灣真實性**：那個鄉鎮、那個時辰的地形、植被、建築、光線對不對？
  花蓮台東的人看到會不會認得自己的地方？原住民導覽員是**工作中的人**，
  不是穿族服的觀光海報？車款對不對？
- **可用性**：版面規則有沒有真的寫進去？有沒有自相矛盾（兩個光源、兩個季節、
  兩種取景）會被模型平均成一團糊？negative 有沒有擋到這張圖特有的失敗？

三個面向一共提了 30 個問題，最後採用了 24 條修改。

實際結果（以最終 40 條 prompt 核對過，不是選角表的草稿）：

- **性別** 24 男 / 16 女。司機偏男（17/20）但不是全男；導遊 7 男 13 女。
  名字有性別的照名字（美玲、淑玲、怡君、佩瑜、郁婷、秀蘭、雅萍、秀珠 為女；
  阿哲、阿源、宗翰、文彥、建良、俊宏 為男）。
- **年齡** 從二十多歲到六十多歲，13 個級距，沒有集中在四十歲男性。
  真的有六十幾歲的（府城司機、阿源、港都、Ina、池上小巴），也真的有二十幾歲的。
- **族群** 30 位漢人、10 位原住民，而且地理上站得住腳：秀林／新城是太魯閣族，
  花蓮市／光復馬太鞍／成功比西里岸是阿美族，台東市／卑南是卑南族。
  全部是 2020 年代的工作服，**40 條 prompt 裡沒有出現過一次族服**。
- **場景** 40 個不同的地方，全部取自那個人自己的服務主題與所在地。
  東北角拆成四處、北海岸三處、太魯閣三處、縱谷五處。
  **七星潭只用一次**，是美玲的，而且是灰色礫石灘配清水斷崖，不是白沙椰子樹。
- **光線** 對得上服務時段：04:30 出班的是天未亮，06:00 前後是晨霧，
  夕陽場是日落，夜市場是攤位燈光。40 張裡有 9 張是暗的，不是 40 個大晴天中午。
- **動作** 全部在做事——開門、擦玻璃、檢查胎壓、卸腳踏車、扛魚箱、倒茶、
  發安全帽、攤地圖、撥蘆葦、提竹籠、舉起一顆石頭。**沒有一個人只是對著鏡頭笑**。

## 現在的插畫是怎麼畫的

\`scripts/portrait-casting.mjs\` 把上面每一條 prompt 讀成一列參數（年齡、膚色、髮型、
髮色、帽子、眼鏡、鬍子、體型、上衣、場景、光線），\`scripts/draw-portraits.mjs\` 把那一列
畫成 SVG 再轉成 WebP。頭骨寬高、眼距、眼睛大小、眉毛粗細與角度、鼻長、嘴寬、嘴角弧度
都由 id 決定並固定不變——40 張用同一組常數畫出來的，就是同一顆頭換 40 頂帽子。

\`\`\`bash
node scripts/draw-portraits.mjs
\`\`\`
`;

await writeFile("PORTRAIT_PROMPTS.md", doc, "utf8");
console.log(`PORTRAIT_PROMPTS.md — ${prompts.length} prompts`);
