/**
 * The seven doors on 周邊推薦, split into the two groups a traveller has to be
 * able to tell apart.
 *
 * `resomap` — supply ResoMap itself holds a relationship with: merchants and
 * professional members who subscribe and have passed review. Tapping one stays
 * inside the app.
 *
 * `partner` — somebody else's inventory, reached through an affiliate link.
 * ResoMap has no agreement with any of these platforms, so the label is
 * 「聯盟合作」 and never 「官方合作」, and the outbound sheet says where you are
 * going before you go.
 *
 * Mixing the two into one list is the thing this file exists to prevent: a
 * traveller who cannot tell whose recommendation they are reading has no way to
 * weigh it.
 */

export type NearbyCat =
  | "restaurant"
  | "hotel"
  | "souvenir"
  | "driver"
  | "guide"
  | "aff-hotel"
  | "aff-tour";

export type NearbyGroup = "resomap" | "partner";

export interface NearbyCategory {
  id: NearbyCat;
  group: NearbyGroup;
  label: string;
  note: string;
  /** The short label on the right of the row. */
  badge: string;
  icon: string;
  tint: string;
}

export const NEARBY_CATEGORIES: NearbyCategory[] = [
  {
    id: "restaurant",
    group: "resomap",
    label: "附近餐廳",
    note: "在地小吃與餐館",
    badge: "ResoMap 商家",
    icon: "🍜",
    tint: "#F5E0D4",
  },
  {
    id: "hotel",
    group: "resomap",
    label: "附近旅館",
    note: "ResoMap 商家的住宿",
    badge: "ResoMap 商家",
    icon: "🛏️",
    tint: "#E3E7F0",
  },
  {
    id: "souvenir",
    group: "resomap",
    label: "附近土產店",
    note: "伴手禮與特色商品",
    badge: "ResoMap 商家",
    icon: "🛍️",
    tint: "#F4E6D6",
  },
  {
    id: "driver",
    group: "resomap",
    label: "包車司機",
    note: "機場接送、包車旅遊",
    badge: "專業會員",
    icon: "🚐",
    tint: "#E2EDE4",
  },
  {
    id: "guide",
    group: "resomap",
    label: "私人導遊",
    note: "深度導覽、客製路線",
    badge: "專業會員",
    icon: "🧭",
    tint: "#EFE7F0",
  },
  {
    id: "aff-hotel",
    group: "partner",
    label: "更多住宿",
    note: "Booking / Agoda / Trip.com",
    badge: "聯盟合作",
    icon: "🏨",
    tint: "#DFE8FA",
  },
  {
    id: "aff-tour",
    group: "partner",
    label: "Local tour",
    note: "Klook / KKday",
    badge: "聯盟合作",
    icon: "🎫",
    tint: "#E0EEFB",
  },
];

export const BY_CAT: Record<NearbyCat, NearbyCategory> = Object.fromEntries(
  NEARBY_CATEGORIES.map((c) => [c.id, c]),
) as Record<NearbyCat, NearbyCategory>;

export const nearbyCategory = (id: NearbyCat) => BY_CAT[id];

/** The two search radii the demo offers. Metres, so lib/geo can use them raw. */
export const RANGES = [5000, 10000] as const;
export type Range = (typeof RANGES)[number];

/** The line that has to sit at the bottom of every 周邊推薦 list. */
export const NEARBY_DISCLOSURE =
  "站內服務由 ResoMap 審核後上架，付費會員會有曝光加權且一律標示。聯盟合作內容由合作平台提供，ResoMap 目前與各平台皆無合作關係。";
