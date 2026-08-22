import { poi } from ".";
import { audiosFor } from "../lib/audio";
import type { Poi } from "../types";

/**
 * The seven places the map home opens on.
 *
 * This is a curated list, and it is deliberately a *list of POI ids* rather than
 * a parallel copy of their data. Everything a card needs — name, coordinates,
 * photograph, description, guides — already lives in `data/poi.tw-north.ts`,
 * `data/imagePrompts.ts` and `data/stories.ts`, and the moment this file holds a
 * second copy of a name or a coordinate the two will disagree.
 *
 * It also means the map home is not a demo bolted onto the side: tapping a pin
 * lands on the same POI screen every other surface in the app links to, which is
 * what carries the traveller on into the guide, and from the end of the guide
 * into 周邊推薦.
 *
 * Coordinates came from OpenStreetMap at development time (see the comment in
 * poi.tw-north.ts for the element ids). `lib/overpass.ts` can add more places
 * around wherever the traveller actually is, but this list is what guarantees
 * there is something on the map when it cannot.
 */
export const NEARBY_ATTRACTION_IDS = [
  "yulon-city",
  "xindian-riverside",
  "bitan",
  "bitan-bridge",
  "hemeishan",
  "jingmei-park",
  "jingmei-market",
] as const;

export interface Attraction {
  id: string;
  poi: Poi;
  /** How many guides this place has. Every one of the seven has at least one. */
  audioCount: number;
  /** True for all seven — the map home's orange headphone means exactly this. */
  hasAudio: boolean;
}

/**
 * The list, resolved.
 *
 * Computed once at module load: the POI set is static, and recomputing it on
 * every render would re-derive seven audio lists for a map that has not moved.
 */
export const NEARBY_ATTRACTIONS: Attraction[] = NEARBY_ATTRACTION_IDS.map((id) => {
  const p = poi(id);
  const audioCount = audiosFor(id).length;
  return { id, poi: p, audioCount, hasAudio: audioCount > 0 };
}).filter((a) => Boolean(a.poi));

export const isNearbyAttraction = (poiId: string) =>
  NEARBY_ATTRACTION_IDS.includes(poiId as (typeof NEARBY_ATTRACTION_IDS)[number]);

/**
 * One line under the name on the preview card.
 *
 * Taken from the POI's own `about` and cut at the first full stop, because the
 * card has room for a sentence and the POI page has room for the paragraph.
 * Deriving it beats authoring a second description that will drift.
 */
export function oneLine(p: Poi): string {
  const text = p.about ?? "";
  const cut = text.indexOf("。");
  return cut > 0 ? text.slice(0, cut + 1) : text;
}
