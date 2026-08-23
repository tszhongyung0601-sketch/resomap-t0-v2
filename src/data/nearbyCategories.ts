/**
 * 周邊推薦, as five questions a traveller actually has.
 *
 * The source demo organised this as seven rows in two groups labelled
 * 「ResoMap 付費服務」 and 「聯盟合作服務」 — which is the business model printed
 * on the traveller's screen. Nobody standing outside 龍山寺 at six in the evening
 * is thinking "I would like to browse ResoMap's paid inventory"; they are
 * thinking 吃什麼.
 *
 * So the headings are the questions, the pictures do the choosing, and where the
 * supply comes from is one quiet line at the bottom of a card — visible, because
 * a traveller has a right to know whose recommendation they are reading, but
 * never the loudest thing on it. The full disclosure sits once at the foot of
 * the screen, which is where a disclosure belongs.
 */

export type NearbyCat =
  | "restaurant"
  | "hotel"
  | "souvenir"
  | "driver"
  | "guide"
  | "aff-hotel"
  | "aff-tour"
  | "rental";

/** Who the supply belongs to. Drives one small grey label, and nothing else. */
export type NearbySource = "resomap" | "partner";

export interface NearbyCard {
  cat: NearbyCat;
  /** Which two sentences the ⓘ on this card opens. */
  info: "partner" | "affiliate";
  /** The card's own line — what you get, not what it is called internally. */
  title: string;
  sub: string;
  source: NearbySource;
  /** The quiet label. Named platforms only where a platform is involved. */
  label: string;
  emoji: string;
  /** Illustrative photo under public/demo/. */
  photo?: string;
  /** A real, credited T0 photograph that reads as this category. */
  photoFromPoi?: string;
  /** A provider whose portrait illustrates this category. For 私人導遊 and
      包車司機, where the thing being offered is a person and a photograph of a
      street would answer a different question. */
  portraitOf?: string;
  /** Half-width. Two of these sit side by side in one section. */
  half?: boolean;
}

export interface NearbySection {
  id: string;
  question: string;
  cards: NearbyCard[];
}

export const NEARBY_SECTIONS: NearbySection[] = [
  {
    id: "eat",
    question: "吃什麼？",
    cards: [
      {
        cat: "restaurant",
        title: "附近推薦餐廳",
        sub: "在地小吃與餐館",
        source: "resomap",
        label: "ResoMap 精選",
        info: "partner",
        emoji: "🍜",
        photo: "jingmei-snack",
      },
    ],
  },
  {
    id: "take-home",
    question: "帶什麼回家？",
    cards: [
      {
        cat: "souvenir",
        title: "附近伴手禮",
        sub: "老舖、名產與可以只買一小包的店",
        source: "resomap",
        label: "ResoMap 精選",
        info: "partner",
        emoji: "🛍️",
        photo: "souvenir-shop-1",
      },
    ],
  },
  {
    id: "with-you",
    question: "需要人帶你玩？",
    cards: [
      {
        cat: "guide",
        title: "私人導遊",
        sub: "深度導覽、客製路線",
        source: "resomap",
        label: "ResoMap 精選",
        info: "partner",
        emoji: "🧭",
        portraitOf: "p-tainan-guide",
        half: true,
      },
      {
        cat: "driver",
        title: "包車司機",
        sub: "機場接送、包車旅遊",
        source: "resomap",
        label: "ResoMap 精選",
        info: "partner",
        emoji: "🚐",
        portraitOf: "p-acheng",
        half: true,
      },
    ],
  },
  {
    id: "get-around",
    question: "要自己開嗎？",
    cards: [
      {
        cat: "rental",
        title: "附近租車",
        sub: "車站與市區的取車點",
        /* Neither ResoMap's own supply nor an affiliate programme: real
           companies with no relationship to either. The label says so, and
           every card in the list repeats it. */
        source: "partner",
        label: "Demo・未正式合作",
        info: "affiliate",
        emoji: "🚗",
      },
    ],
  },
  {
    id: "experience",
    question: "更多旅遊體驗",
    cards: [
      {
        cat: "aff-tour",
        title: "Local tour",
        sub: "一日遊、體驗行程，由合作平台出團",
        source: "partner",
        label: "聯盟合作 · Klook / KKday",
        info: "affiliate",
        emoji: "🎫",
        photoFromPoi: "jiufen",
      },
    ],
  },
  {
    id: "stay",
    question: "今晚住哪？",
    cards: [
      {
        cat: "hotel",
        title: "附近旅館",
        sub: "ResoMap 商家的住宿",
        source: "resomap",
        label: "ResoMap 精選",
        info: "partner",
        emoji: "🛏️",
        photoFromPoi: "jiaoxi",
        half: true,
      },
      {
        cat: "aff-hotel",
        title: "更多住宿",
        sub: "更多房型與即時房況",
        source: "partner",
        label: "聯盟合作 · Booking / Agoda",
        info: "affiliate",
        emoji: "🏨",
        photoFromPoi: "beitou",
        half: true,
      },
    ],
  },
];

/** Flat lookup — NearbyList takes a `cat` off the route and needs its labels. */
export const ALL_NEARBY_CARDS: NearbyCard[] = NEARBY_SECTIONS.flatMap((s) => s.cards);

const BY_CAT: Record<NearbyCat, NearbyCard> = Object.fromEntries(
  ALL_NEARBY_CARDS.map((c) => [c.cat, c]),
) as Record<NearbyCat, NearbyCard>;

export const nearbyCategory = (id: NearbyCat) => BY_CAT[id];

/** The two search radii the demo offers. Metres, so lib/geo can use them raw. */
export const RANGES = [5000, 10000] as const;
export type Range = (typeof RANGES)[number];

/**
 * The line at the foot of 周邊推薦.
 *
 * One sentence. It used to be four, spelling out review, paid weighting and
 * every platform ResoMap has no agreement with — all true, none of it what
 * somebody deciding where to eat came for. The detail moved behind the ⓘ on
 * each card and into 我的 → 關於這個 Demo.
 */
export const NEARBY_DISCLOSURE_SHORT = "商家與服務者資料由提供者自行填寫，皆為示意資料。";
