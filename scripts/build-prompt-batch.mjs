import { readFile, writeFile } from "node:fs/promises";

/**
 * The prompts again, as something you paste rather than read.
 *
 * PORTRAIT_PROMPTS.md is the reference — it explains, it groups, it has the
 * negatives folded away behind a disclosure. This file is the worklist you
 * actually work from: one block per person, the filename first, nothing to
 * scroll past between one prompt and the next.
 *
 * The fifteen at the top are the ones the demo script walks past. Doing only
 * those gets every screen anybody is shown in a walkthrough; the other
 * twenty-five are the ones you reach by wandering.
 *
 *   node scripts/build-prompt-batch.mjs
 */

const DEMO_PATH = [
  "p-acheng", "p-xiaofang", "p-dabear", "p-akai", "p-xiaomi",
  "p-azhe", "p-ada", "p-hualien-car", "p-hualien-city-guide", "p-qixingtan-car",
  "p-qixingtan-guide", "p-fucheng-car", "p-tainan-guide", "p-ruifang-car", "p-jiufen-guide",
];

const { prompts } = JSON.parse(await readFile(".portrait-prompts.json", "utf8"));
const by = new Map(prompts.map((p) => [p.id, p]));

const block = (p, i, total) =>
  `━━━━━━━━━━ ${i + 1} / ${total} ━━━━━━━━━━
存成：${p.id}.png
${p.zh}

${p.prompt}

Negative prompt:
${p.negative}

`;

const rest = prompts.filter((p) => !DEMO_PATH.includes(p.id));

await writeFile(
  "PORTRAIT_PROMPTS_BATCH.txt",
  `ResoMap 司機與導遊人像 — 生圖工作清單

每一段貼進圖像模型，存檔時檔名就是「存成：」那一行，全部丟進專案根目錄的
.portrait-src/，然後跑：

    node scripts/build-portraits.mjs

腳本會裁成 16:9 與 1:1、轉 WebP、更新清單。沒生的人維持現在的插畫，不會破圖。
要換就整組換：一張照片擺在一張插畫旁邊看起來是壞掉，不是混搭。

════════════════════════════════════════════════════════
第一批：demo 動線會走到的 ${DEMO_PATH.length} 位
（龍山寺 / 大稻埕 / 信義 / 九份 / 台南 / 花蓮 / 七星潭 / 東大門 一路點下去看得到的人）
════════════════════════════════════════════════════════

${DEMO_PATH.map((id, i) => block(by.get(id), i, DEMO_PATH.length)).join("")}
════════════════════════════════════════════════════════
第二批：其餘 ${rest.length} 位
════════════════════════════════════════════════════════

${rest.map((p, i) => block(p, i, rest.length)).join("")}`,
  "utf8",
);

console.log(`PORTRAIT_PROMPTS_BATCH.txt — ${DEMO_PATH.length} on the demo path, ${rest.length} beyond it`);
