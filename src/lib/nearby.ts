import { distance, type LatLng } from "./geo";
import { AFFILIATE_OFFERS } from "../data/affiliateOffers";
import { MERCHANTS } from "../data/merchants";
import { PROVIDERS } from "../data/providers";
import type {
  AffiliateOffer,
  Merchant,
  Provider,
  ProviderKind,
  ReviewStatus,
} from "../types";
import type { MerchantCategory } from "../types";

/**
 * What goes near a place, and in what order.
 *
 * One function decides it for merchants, drivers, guides and affiliate supply,
 * because four screens each sorting "sensibly" is four screens that eventually
 * disagree about who is first. It is deliberately arithmetic and not a
 * recommendation model: no AI, no randomness, no personalisation, no hidden
 * state. The same inputs give the same list every time, which is the only way a
 * merchant paying for exposure can be told what they are paying for.
 *
 * The weights are named constants rather than magic numbers in a sort callback,
 * so a commercial decision — "paid placement should count for more" — is a
 * one-line change in one file, and reviewable as such.
 */

export const WEIGHTS = {
  /** How close it is. The dominant term: 附近 has to mean 附近. */
  distance: 0.4,
  /** How well it is rated, normalised across the 4.0–5.0 band ratings live in. */
  rating: 0.25,
  /** Paid placement. Visible on the card, and capped so it can never outrank
      the difference between 300 m and 9 km. */
  paidExposure: 0.15,
  /** Passed ResoMap's review. Free to earn, and it is not for sale. */
  verified: 0.1,
  /** Caller-supplied fit — content about this exact place, matching area,
      language coverage. See the three `relevanceOf*` helpers below. */
  relevance: 0.1,
} as const;

/**
 * The 「ResoMap 推薦夥伴」 rule, in one place.
 *
 * Paying is not enough and being approved is not enough. Both, or no mark. It
 * is a derivation rather than a stored flag precisely so that it cannot drift:
 * there is no `isVerifiedPartner: true` anybody could set by hand in the data.
 */
export const isVerifiedPartner = (x: {
  isPaid: boolean;
  reviewStatus: ReviewStatus;
}): boolean => x.isPaid && x.reviewStatus === "approved";

/** What ranking needs to know about one candidate, whatever it actually is. */
export interface RankEntry<T> {
  item: T;
  lat: number;
  lng: number;
  /** 0–5. A 10-point platform score must be halved before it gets here. */
  rating: number;
  isPaid?: boolean;
  reviewStatus?: ReviewStatus;
  /** 0–1. The caller's own idea of fit for this place. */
  relevance?: number;
}

export interface Ranked<T> {
  item: T;
  /** Metres from the place the traveller is standing at. */
  metres: number;
  /** 0–1. Exposed so a debug view — or a merchant — can be shown the working. */
  score: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Ratings in this dataset sit between 4.0 and 5.0, the way they do on every
 * consumer marketplace. Normalising across 0–5 would make the whole term nearly
 * constant and quietly delete it from the ranking; normalising across the band
 * that is actually used keeps 4.4 and 4.9 meaningfully apart.
 */
const ratingScore = (r: number) => clamp01((r - 4) / 1);

/**
 * Rank candidates by distance, rating, paid exposure, verification and fit.
 *
 * Anything outside the radius is dropped rather than sorted to the bottom — a
 * list called 5km that ends with something 40 km away is not a list, it is a
 * label nobody can trust. Ties break on distance, so the order is total and
 * stable.
 */
export function rankNearbyServices<T>(
  entries: RankEntry<T>[],
  from: LatLng,
  radiusM: number,
): Ranked<T>[] {
  return entries
    .map((e) => {
      const metres = distance(from, { lat: e.lat, lng: e.lng });
      const score =
        WEIGHTS.distance * clamp01(1 - metres / radiusM) +
        WEIGHTS.rating * ratingScore(e.rating) +
        WEIGHTS.paidExposure * (e.isPaid ? 1 : 0) +
        WEIGHTS.verified *
          (e.isPaid !== undefined && e.reviewStatus !== undefined
            ? isVerifiedPartner({ isPaid: e.isPaid, reviewStatus: e.reviewStatus })
              ? 1
              : 0
            : 0) +
        WEIGHTS.relevance * clamp01(e.relevance ?? 0);
      return { item: e.item, metres, score };
    })
    .filter((r) => r.metres <= radiusM)
    .sort((a, b) => b.score - a.score || a.metres - b.metres);
}

/* ------------------------------------------------------------- relevance --

   Three small, explainable rules. Each returns 0–1 and each can be read aloud
   to the merchant it affects, which is the bar for anything that moves a paid
   listing up or down.                                                       */

/** Published a guide about this exact place, and sits in the same district. */
export function relevanceOfMerchant(m: Merchant, poiArea: string): number {
  return (m.featuredAudioIds?.length ? 0.6 : 0) + (m.area === poiArea ? 0.4 : 0);
}

/** Covers this area by their own account, and can work in three languages. */
export function relevanceOfProvider(p: Provider, destName: string, poiArea: string): number {
  const covers = p.areas.some((a) => a.includes(destName) || a.includes(poiArea));
  return (covers ? 0.6 : 0) + (p.languages.length >= 3 ? 0.4 : 0);
}

/** Listed under the city the traveller is in. */
export function relevanceOfOffer(o: AffiliateOffer, destId: string): number {
  return o.destId === destId ? 1 : 0;
}

/* -------------------------------------------------------------- adapters --

   Each of these builds RankEntry rows and hands them to the one ranker. They
   exist so a screen never has to know that Booking scores out of ten and Klook
   scores out of five.                                                        */

export interface NearbyContext {
  /** Where the traveller is — a POI's own coordinates. */
  at: LatLng;
  /** Used by the relevance rules, never by the distance. */
  destId: string;
  destName: string;
  poiArea: string;
  radiusM: number;
}

export function nearbyMerchants(
  ctx: NearbyContext,
  category?: MerchantCategory,
): Ranked<Merchant>[] {
  const pool = category ? MERCHANTS.filter((m) => m.category === category) : MERCHANTS;
  return rankNearbyServices(
    pool
      /* Rejected records never surface. `pending` still appears — it is a real
         listing awaiting review — but without the badge or the verified
         weight, which is the difference the rule is there to make. */
      .filter((m) => m.reviewStatus !== "rejected")
      .map((m) => ({
        item: m,
        lat: m.lat,
        lng: m.lng,
        rating: m.rating,
        isPaid: m.isPaid,
        reviewStatus: m.reviewStatus,
        relevance: relevanceOfMerchant(m, ctx.poiArea),
      })),
    ctx.at,
    ctx.radiusM,
  );
}

export function nearbyProviders(
  ctx: NearbyContext,
  kind: ProviderKind,
): Ranked<Provider>[] {
  return rankNearbyServices(
    PROVIDERS.filter((p) => p.kind === kind && p.reviewStatus !== "rejected").map((p) => ({
      item: p,
      lat: p.lat,
      lng: p.lng,
      rating: p.rating,
      isPaid: p.isPaid,
      reviewStatus: p.reviewStatus,
      relevance: relevanceOfProvider(p, ctx.destName, ctx.poiArea),
    })),
    ctx.at,
    ctx.radiusM,
  );
}

export function nearbyOffers(
  ctx: NearbyContext,
  kind: AffiliateOffer["kind"],
): Ranked<AffiliateOffer>[] {
  return rankNearbyServices(
    AFFILIATE_OFFERS.filter((o) => o.kind === kind).map((o) => ({
      item: o,
      lat: o.lat,
      lng: o.lng,
      /* Booking and Agoda publish out of ten. Feeding a 8.8 into a 0–5 scorer
         would rank every hotel above every tour for no reason at all. */
      rating: o.ratingScale === 10 ? o.rating / 2 : o.rating,
      /* Affiliate supply is nobody's subscriber and nobody ResoMap has
         reviewed, so both terms stay out of its score rather than being
         faked as false — which would be the same number with a worse meaning. */
      relevance: relevanceOfOffer(o, ctx.destId),
    })),
    ctx.at,
    ctx.radiusM,
  );
}

/**
 * The measure word, per category.
 *
 * 「3 家餐廳」 and 「2 位私人導遊」 and 「5 個行程」. Chinese counts people,
 * shops, rooms and itineraries with different words, and using 家 for all of
 * them is the kind of thing that reads as a translation rather than a product.
 * One table, so a screen can never pick a different one than its neighbour.
 */
const COUNT_UNIT: Record<string, string> = {
  restaurant: "家",
  souvenir: "家",
  hotel: "間",
  "aff-hotel": "間",
  driver: "位",
  guide: "位",
  "aff-tour": "個行程",
};

/** What a category is called when it follows a number. */
const COUNT_NOUN: Record<string, string> = {
  restaurant: "餐廳",
  souvenir: "伴手禮店",
  hotel: "住宿",
  "aff-hotel": "住宿",
  driver: "包車司機",
  guide: "私人導遊",
  "aff-tour": "",
};

/** 「家」/「位」/「個行程」 — for a badge with no room for the noun. */
export const getNearbyCountUnit = (category: string) => COUNT_UNIT[category] ?? "個";

/** 「3 家餐廳」/「2 位私人導遊」/「5 個行程」 — for a line that has the room. */
export function getNearbyCountLabel(category: string, count: number): string {
  return `${count} ${getNearbyCountUnit(category)}${COUNT_NOUN[category] ?? ""}`.trim();
}

/**
 * How many things of each kind sit inside the radius.
 *
 * The 周邊推薦 rows print this, so a traveller can see 「5km 內 3 家」 before
 * tapping into a list — and so a row with nothing behind it says so instead of
 * opening an empty screen.
 */
export function nearbyCounts(ctx: NearbyContext) {
  return {
    restaurant: nearbyMerchants(ctx, "restaurant").length,
    hotel: nearbyMerchants(ctx, "hotel").length,
    souvenir: nearbyMerchants(ctx, "souvenir").length,
    driver: nearbyProviders(ctx, "driver").length,
    guide: nearbyProviders(ctx, "guide").length,
    "aff-hotel": nearbyOffers(ctx, "hotel").length,
    "aff-tour": nearbyOffers(ctx, "tour").length,
  };
}
