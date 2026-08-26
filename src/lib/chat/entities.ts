import { BY_DEST } from "../../data/destinations";
import { POIS } from "../../data";
import { INTEREST_LABELS, type InterestId, type Poi } from "../../types";
import { TRANSPORT_LABELS, type TransportId } from "../planner";

/**
 * Pulling the useful nouns out of a sentence somebody typed.
 *
 * Everything here is exact matching against data the app already holds — the
 * nineteen destination names, the ninety-one place names, the eight interest
 * labels. There is no fuzzy matching and no edit distance, deliberately: the
 * cost of guessing wrong is a traveller watching the app confidently plan a
 * trip to the wrong city, and "I did not understand that" is a far cheaper
 * failure than that. Where a word is genuinely ambiguous the caller is told so
 * and asks, rather than picking.
 *
 * Aliases are hand-written rather than derived. 「花蓮縣」 and 「花蓮市」 both
 * mean 花蓮 to a person and neither is the string in `destinations.ts`.
 */

/* ------------------------------------------------------------ destination */

/** Extra spellings that mean a destination the data calls something shorter. */
const DEST_ALIASES: Record<string, string> = {
  台北市: "taipei",
  臺北: "taipei",
  臺北市: "taipei",
  新北市: "newtaipei",
  臺中: "taichung",
  台中市: "taichung",
  臺南: "tainan",
  台南市: "tainan",
  高雄市: "kaohsiung",
  宜蘭縣: "yilan",
  花蓮縣: "hualien",
  花蓮市: "hualien",
  台東縣: "taitung",
  臺東: "taitung",
  南投: "sunmoonlake",
  日月潭國家風景區: "sunmoonlake",
  東京都: "tokyo",
  大阪市: "osaka",
  京都市: "kyoto",
  首爾市: "seoul",
  漢城: "seoul",
};

/**
 * The destination named in a sentence, or null.
 *
 * Longest name first, so 「新北」 inside a sentence that also contains 「台北」
 * cannot be shadowed by the shorter match — and so 「日月潭國家風景區」 beats
 * 「日月潭」 to the same answer rather than racing it.
 */
export function findDest(text: string): string | null {
  const candidates: { needle: string; id: string }[] = [
    ...Object.entries(BY_DEST).map(([id, d]) => ({ needle: d.name, id })),
    ...Object.entries(DEST_ALIASES).map(([needle, id]) => ({ needle, id })),
  ].sort((a, b) => b.needle.length - a.needle.length);

  for (const c of candidates) if (text.includes(c.needle)) return c.id;
  return null;
}

/* ------------------------------------------------------------------ number */

const CN_NUM: Record<string, number> = {
  零: 0, 一: 1, 二: 2, 兩: 2, 三: 3, 四: 4, 五: 5,
  六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
};

/** 「三」 → 3, 「十」 → 10, 「十五」 → 15, 「二十」 → 20. Small numbers only. */
function cnToNumber(s: string): number | null {
  if (/^\d+$/.test(s)) return Number(s);
  if (s.length === 1) return CN_NUM[s] ?? null;
  if (s.startsWith("十")) {
    const rest = CN_NUM[s[1]];
    return rest === undefined ? 10 : 10 + rest;
  }
  if (s.includes("十")) {
    const [tens, ones] = s.split("十");
    const t = CN_NUM[tens];
    if (t === undefined) return null;
    return t * 10 + (ones ? (CN_NUM[ones] ?? 0) : 0);
  }
  return null;
}

/**
 * How many days the sentence asks for.
 *
 * 「三天兩夜」 names two numbers and means three days, so 天 wins outright
 * rather than whichever appears first. A bare 「兩夜」 means three days, which
 * is how everybody says it and is worth the special case.
 */
export function findDays(text: string): number | null {
  const day = text.match(/([0-9]+|[一二兩三四五六七八九十]+)\s*天/);
  if (day) {
    const n = cnToNumber(day[1]);
    if (n && n >= 1 && n <= 14) return n;
  }
  const night = text.match(/([0-9]+|[一二兩三四五六七八九十]+)\s*夜/);
  if (night) {
    const n = cnToNumber(night[1]);
    if (n && n >= 1 && n <= 13) return n + 1;
  }
  return null;
}

/**
 * 「第二天」 / 「Day 2」 / 「D2」 / 「今天」 / 「明天」 → a day number.
 *
 * `today` anchors the relative words. Without a live trip they mean nothing and
 * the function says so rather than assuming day one.
 */
export function findDayIndex(text: string, today?: number): number | null {
  const ordinal = text.match(/第\s*([0-9]+|[一二兩三四五六七八九十]+)\s*天/);
  if (ordinal) {
    const n = cnToNumber(ordinal[1]);
    if (n && n >= 1) return n;
  }
  const latin = text.match(/\b[Dd](?:ay)?\s*([0-9]+)\b/);
  if (latin) return Number(latin[1]);
  if (today !== undefined) {
    if (text.includes("今天")) return today;
    if (text.includes("明天")) return today + 1;
    if (text.includes("後天")) return today + 2;
  }
  return null;
}

/* ---------------------------------------------------------------- interest */

/** The words people actually use, mapped onto the eight ids the planner takes. */
const INTEREST_WORDS: Record<InterestId, string[]> = {
  food: ["美食", "吃", "小吃", "餐廳", "夜市", "好吃"],
  culture: ["文化", "古蹟", "歷史", "廟", "博物館", "老街"],
  nature: ["自然", "風景", "山", "海", "步道", "戶外", "大自然"],
  shopping: ["購物", "逛街", "買", "伴手禮"],
  photo: ["拍照", "打卡", "拍", "美景", "網美"],
  family: ["親子", "小孩", "孩子", "帶長輩", "老人家"],
  nightlife: ["夜生活", "酒吧", "晚上"],
  themepark: ["樂園", "遊樂園", "主題樂園"],
};

export function findInterests(text: string): InterestId[] {
  const out: InterestId[] = [];
  for (const id of Object.keys(INTEREST_WORDS) as InterestId[]) {
    if (INTEREST_WORDS[id].some((w) => text.includes(w))) out.push(id);
  }
  /* The label itself always counts — somebody who taps a chip and then types
     the same word should not get a different answer. */
  for (const id of Object.keys(INTEREST_LABELS) as InterestId[]) {
    if (text.includes(INTEREST_LABELS[id]) && !out.includes(id)) out.push(id);
  }
  return out;
}

/* --------------------------------------------------------------- transport */

const TRANSPORT_WORDS: Record<TransportId, string[]> = {
  transit: ["大眾運輸", "捷運", "公車", "火車", "高鐵", "搭車"],
  drive: ["租車", "自駕", "開車", "自己開"],
  charter: ["包車", "司機"],
  walk: ["走路", "步行", "散步"],
  unsure: ["還不知道", "不確定", "還沒決定"],
};

export function findTransport(text: string): TransportId | null {
  for (const id of Object.keys(TRANSPORT_WORDS) as TransportId[]) {
    if (TRANSPORT_WORDS[id].some((w) => text.includes(w))) return id;
  }
  for (const id of Object.keys(TRANSPORT_LABELS) as TransportId[]) {
    if (text.includes(TRANSPORT_LABELS[id])) return id;
  }
  return null;
}

/* -------------------------------------------------------------------- poi */

export interface PoiMatch {
  /** Exactly one place matched. */
  poi?: Poi;
  /** More than one did — the caller must ask rather than choose. */
  ambiguous?: Poi[];
}

/**
 * The place named in a sentence.
 *
 * Longest name first again, so 「碧潭吊橋」 is not answered with 「碧潭風景區」
 * merely because that record comes first in the file. Two places of the same
 * length both matching is a real ambiguity — 碧潭 alone genuinely means either
 * — and it is returned as one rather than resolved by array order.
 */
/**
 * Words at the end of a place name that nobody says out loud.
 *
 * People type 太魯閣, and the record is called 太魯閣國家公園. That is not a
 * case for fuzzy matching — it is a case for knowing that 國家公園 is a
 * category, not part of what anybody calls the place. Trimming the category
 * gives a second needle to match on, still by exact containment.
 *
 * Longest first, so 國家風景區 is not half-eaten by 風景區.
 */
const GENERIC_TAIL = [
  "國家風景區", "國家公園", "文化園區", "觀光夜市", "紀念園區", "遊客中心",
  "風景區", "紀念館", "博物館", "美術館", "文化館", "紀念堂",
  "夜市", "老街", "步道", "園區", "商圈", "碼頭", "車站", "公園", "別館", "古堡",
];

/** The names one place can be called, longest first. */
function needlesFor(p: Poi): string[] {
  const out = [p.name];
  for (const tail of GENERIC_TAIL) {
    if (p.name.endsWith(tail) && p.name.length - tail.length >= 2) {
      out.push(p.name.slice(0, -tail.length));
      break;
    }
  }
  return out;
}

export function findPoi(text: string, destId?: string): PoiMatch {
  const pool = destId ? POIS.filter((p) => p.destId === destId) : POIS;

  /* Every place scored by the longest of its names that appears in the text,
     so 「碧潭吊橋」 beats 「碧潭風景區」 matching on its trimmed 碧潭, while a
     bare 「碧潭」 leaves both on 2 and is reported as the tie it is. */
  const hits: { p: Poi; len: number }[] = [];
  for (const p of pool) {
    const lens = needlesFor(p)
      .filter((n) => text.includes(n))
      .map((n) => n.length);
    if (lens.length) hits.push({ p, len: Math.max(...lens) });
  }
  if (hits.length === 0) return {};

  hits.sort((a, b) => b.len - a.len);
  const top = hits.filter((h) => h.len === hits[0].len).map((h) => h.p);
  return top.length === 1 ? { poi: top[0] } : { ambiguous: top };
}
