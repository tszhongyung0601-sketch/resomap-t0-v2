/**
 * Which drivers and guides have a picture on disk.
 *
 * GENERATED — by `node scripts/draw-portraits.mjs` (the illustrations that ship
 * today) or `node scripts/build-portraits.mjs` (photographs, once somebody has
 * generated them from PORTRAIT_PROMPTS.md). Do not hand-edit: an id in here
 * without a file behind it is a broken image on a card.
 *
 * A manifest rather than a field on each `Provider`: the record describes the
 * person, and whether a picture has been produced yet is a fact about the
 * repository. It also means the app never requests a file that is not there,
 * which is the difference between a designed placeholder and a 404.
 *
 * None of these is a photograph of anybody, which is why `PersonPhoto` puts a
 * mark on the image itself rather than a line at the bottom of the page. A face
 * is the one thing in this demo a viewer would otherwise assume is real.
 */
export const PORTRAIT_IDS: ReadonlySet<string> = new Set([
  "p-acheng",
  "p-ada",
  "p-akai",
  "p-azhe",
  "p-chenggong-car",
  "p-chenggong-guide",
  "p-chishang-car",
  "p-chishang-guide",
  "p-dabear",
  "p-fucheng-car",
  "p-gaomei-guide",
  "p-guangfu-car",
  "p-guangfu-guide",
  "p-hualien-car",
  "p-hualien-city-guide",
  "p-hualien-guide",
  "p-jiaoxi-car",
  "p-jiaoxi-guide",
  "p-jiufen-guide",
  "p-kaohsiung-car",
  "p-kaohsiung-guide",
  "p-luodong-car",
  "p-luodong-guide",
  "p-pingxi-guide",
  "p-qingshui-car",
  "p-qixingtan-car",
  "p-qixingtan-guide",
  "p-ruifang-car",
  "p-taichung-car",
  "p-taichung-guide",
  "p-tainan-guide",
  "p-taitung-car",
  "p-taitung-guide",
  "p-tamsui-car",
  "p-tamsui-guide",
  "p-taroko-car",
  "p-xiaofang",
  "p-xiaomi",
  "p-yehliu-car",
  "p-yehliu-guide",
]);

export const hasPortrait = (providerId: string) => PORTRAIT_IDS.has(providerId);
