import { poi } from "../data";
import { photoFor, type Credit } from "../data/imagePrompts";
import { hasPortrait } from "../data/portraits";

/**
 * The picture for something that is not a POI — a shop, a driver, a guide, a
 * category card.
 *
 * Two sources, in the order the brief asks for them:
 *
 *  1. **A T0 photograph**, borrowed by POI id. These are real, CC-licensed
 *     photographs of the exact street the record sits on, and they arrive with
 *     their credit attached — which is the only way they may be used. A hotel
 *     on 神農街 showing 神農街 is a location shot, which is what it says it is.
 *  2. **A demo photograph** under `public/demo/`, built from the source demo's
 *     imagery by scripts/build-demo-photos.mjs. These are illustrative, not
 *     photographs of anything that exists, and every surface that shows one
 *     carries a 示意圖 line at block level.
 *
 * A record with neither gets `null`, and the caller falls back to the generated
 * poster cover the rest of the app uses. That is the honest empty state: no
 * photo rather than the wrong photo.
 *
 * Both sizes are declared here so no component has to know the filename shape.
 */

export interface Shot {
  /** 720×405. The image at the top of a list card. */
  card: string;
  /** 320×320. The list card's left-hand thumbnail. Only a portrait has one: a
      person is composed square, a street photograph is just cropped square. */
  thumb?: string;
  /** 1280×720. The detail page header. */
  hero: string;
  /** Present only for a borrowed T0 photograph, and then it must be shown. */
  credit?: Credit;
  /** True when this is illustrative rather than a photo of the actual place. */
  illustrative: boolean;
  /** A generated portrait of a person. Every surface that shows one marks it. */
  person?: boolean;
}

export interface HasPhoto {
  /** Base name under public/demo/, without the -card / -hero suffix. */
  photo?: string;
  /** A POI whose real, credited photograph this record borrows. */
  photoFromPoi?: string;
  /** A provider whose portrait illustrates this — for the category cards that
      are about people rather than about a place. */
  portraitOf?: string;
}

const base = import.meta.env.BASE_URL;

/**
 * The portrait of a driver or a guide, if one has been produced.
 *
 * Separate from `shotFor` because a person is not a place, and the fallback
 * chain that is right for a shop is wrong for a face. A hotel on 神農街 showing
 * a photograph of 神農街 is a location shot and says so; a guide at 七星潭 shown
 * as an empty pebble beach is a card with no person on it, which is what a
 * traveller is actually choosing between. So there is no borrowing here: a
 * portrait, or a monogram, and never scenery standing in for somebody's face.
 *
 * `PORTRAIT_IDS` is the gate, so a provider whose picture has not been made yet
 * never requests a file that is not there.
 */
export function portraitFor(providerId: string): Shot | null {
  if (!hasPortrait(providerId)) return null;
  return {
    card: `${base}portraits/${providerId}-card.webp`,
    hero: `${base}portraits/${providerId}-hero.webp`,
    thumb: `${base}portraits/${providerId}-thumb.webp`,
    illustrative: true,
    person: true,
  };
}

export function shotFor(rec: HasPhoto): Shot | null {
  /* Checked first: a card that has chosen a person to stand for it has made a
     stronger statement than one that has a street to fall back on. */
  if (rec.portraitOf) {
    const shot = portraitFor(rec.portraitOf);
    if (shot) return shot;
  }
  if (rec.photoFromPoi) {
    const p = poi(rec.photoFromPoi);
    const slot = p ? photoFor(p) : undefined;
    if (slot?.src) {
      return {
        card: `${base}${slot.src}`,
        hero: `${base}${slot.srcLarge ?? slot.src}`,
        credit: slot.credit,
        illustrative: false,
      };
    }
    /* The manifest has no shot for that place yet. Falling through to `photo`
       rather than returning a broken path — the record may carry both. */
  }
  if (rec.photo) {
    return {
      card: `${base}demo/${rec.photo}-card.webp`,
      hero: `${base}demo/${rec.photo}-hero.webp`,
      illustrative: true,
    };
  }
  return null;
}
