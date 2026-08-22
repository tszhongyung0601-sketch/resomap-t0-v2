import { useState, type ReactNode } from "react";
import { photoFor } from "../data/imagePrompts";
import { shotFor, type HasPhoto } from "../lib/photo";
import type { Poi, PoiKind } from "../types";

/**
 * A place's picture, until there is a photograph of it.
 *
 * The app ships no photography, and the honest response to that is not a stock
 * image of the wrong temple — it is not pretending to have a photo at all.
 *
 * The first version of this drew soft radial gradients, which was the wrong
 * instinct: at card size a blurry blob does not read as "an illustration", it
 * reads as "a photograph that failed to load properly", and the whole product
 * looks unfinished. Everything here is now hard-edged — flat bands, a crisp
 * horizon, a solid sun, angular silhouettes. Nothing is soft, so nothing can be
 * mistaken for out of focus. It looks like a screen-printed travel poster,
 * which is a thing somebody chose.
 *
 * When a real photograph arrives in the manifest, `PoiImage` uses it instead.
 */

type Scene = {
  sky: [string, string];
  land: string;
  ridge: string;
  /** Percentage from the top. */
  horizon: number;
  sun: string | null;
};

const SCENES: Record<PoiKind, Scene> = {
  nature:     { sky: ["#A8CFE4", "#D6E9F0"], land: "#4E7C62", ridge: "#3C6650", horizon: 62, sun: "#FFF0CE" },
  attraction: { sky: ["#F4DFBE", "#F8EBD6"], land: "#B07C4E", ridge: "#8E5F38", horizon: 66, sun: "#FFE9B8" },
  food:       { sky: ["#F6D6C4", "#FAE6DA"], land: "#B25E3E", ridge: "#8E432A", horizon: 70, sun: null },
  shopping:   { sky: ["#DED0EA", "#EDE5F3"], land: "#7C6796", ridge: "#5F4A78", horizon: 64, sun: "#F6DCEA" },
  activity:   { sky: ["#BFDCE8", "#DCEDF3"], land: "#4E7F96", ridge: "#3A6377", horizon: 68, sun: null },
  stay:       { sky: ["#DCDEE6", "#EAEBF0"], land: "#6E7285", ridge: "#545869", horizon: 64, sun: null },
  transit:    { sky: ["#DCE2E8", "#EBEFF3"], land: "#6B7480", ridge: "#515963", horizon: 72, sun: null },
};

/** Stable per-id jitter, so two temples in one city do not look identical. */
function seed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function Generated({
  poi,
  radius,
  emoji,
}: {
  poi: Poi;
  radius: number;
  emoji: boolean;
}) {
  const s = SCENES[poi.kind] ?? SCENES.attraction;
  const n = seed(poi.id);
  const horizon = s.horizon + ((n % 11) - 5);
  const sunX = 20 + (n % 60);
  /* Two ridges, offset, drawn as clipped polygons rather than blurred blobs. */
  const peakA = 24 + (n % 22);
  const peakB = 58 + ((n >> 3) % 24);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        borderRadius: radius,
        /* Hard stop at the horizon: two flat fields, no gradient across the
           join. This single edge is what stops it reading as a photo. */
        background: `linear-gradient(180deg, ${s.sky[0]} 0%, ${s.sky[1]} ${horizon}%, ${s.land} ${horizon}%, ${s.land} 100%)`,
      }}
    >
      {s.sun && (
        <span
          className="absolute rounded-full"
          style={{
            width: "18%",
            aspectRatio: "1",
            left: `${sunX}%`,
            top: `${Math.max(6, horizon - 34)}%`,
            background: s.sun,
          }}
        />
      )}

      {/* Ridge line — a solid polygon sitting on the horizon. */}
      <svg
        className="absolute inset-x-0"
        style={{ top: `${horizon - 16}%`, height: "26%" }}
        viewBox="0 0 100 26"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polygon
          points={`0,26 ${peakA},4 ${(peakA + peakB) / 2},15 ${peakB},7 100,26`}
          fill={s.ridge}
        />
      </svg>

      {emoji && (
        <span
          className="absolute inset-0 grid place-items-center"
          style={{ fontSize: "34%" }}
        >
          {poi.emoji}
        </span>
      )}
    </div>
  );
}

export function Cover({
  poi,
  height = 120,
  radius = 14,
  emoji = true,
  className = "",
}: {
  poi: Poi;
  height?: number | string;
  radius?: number;
  emoji?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden ${className}`}
      style={{ height, borderRadius: radius }}
      aria-hidden
    >
      <Generated poi={poi} radius={radius} emoji={emoji} />
    </div>
  );
}

/**
 * The real photograph when the manifest has one, the generated cover when it
 * does not.
 *
 * `srcSet` is written for 1x/2x because the demo is shown on Retina laptops and
 * phones, where a 400px-wide source in a 400px slot is visibly soft. The
 * generated cover stays behind the photo rather than being replaced by it, so a
 * failed request degrades to the graphic instead of a broken-image icon — and
 * the name is always in the DOM for anybody who cannot see either.
 */
export function PoiImage({
  poi,
  height = 120,
  radius = 14,
  emoji = true,
  large = false,
  className = "",
}: {
  poi: Poi;
  height?: number | string;
  radius?: number;
  emoji?: boolean;
  /** Ask for the 1600px file. Only for slots that fill the screen width. */
  large?: boolean;
  className?: string;
}) {
  const shot = photoFor(poi);
  const [failed, setFailed] = useState(false);
  /* One base per size rather than a 1x/2x srcSet off a single file: the two files
     are cropped differently (4:3 for cards, 16:9 for heroes), so they are not the
     same image at two scales and pretending otherwise would letterbox one of them. */
  const src = large ? (shot?.srcLarge ?? shot?.src) : shot?.src;
  const showPhoto = Boolean(src) && !failed;

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${className}`}
      style={{ height, borderRadius: radius }}
    >
      <Generated poi={poi} radius={radius} emoji={emoji && !showPhoto} />

      {showPhoto && src && (
        <img
          src={`${import.meta.env.BASE_URL}${src}`}
          alt={poi.name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
          style={{ borderRadius: radius }}
        />
      )}
    </div>
  );
}

/**
 * Photographer and licence, under the image.
 *
 * Every CC licence except CC0 requires attribution, so this is a licence term
 * rather than a caption — a photo shipped without it is a breach. CC0 waives the
 * requirement, but the line still names the photographer: they gave the work
 * away and saying who they were costs nothing.
 */
export function PhotoCredit({ poi }: { poi: Poi }) {
  const shot = photoFor(poi);
  const c = shot?.credit;
  if (!c) return null;
  return (
    <p className="px-5 pt-1.5 text-[11px] leading-relaxed text-ink-3">
      照片：
      <a href={c.source} target="_blank" rel="noopener noreferrer" className="underline">
        {c.author}
      </a>
      {" / "}
      <a href={c.licenceUrl} target="_blank" rel="noopener noreferrer" className="underline">
        {c.licence}
      </a>
      {" · via Wikimedia Commons"}
    </p>
  );
}

/**
 * The label that has to sit on any generated historical scene.
 *
 * An illustration of what a place looked like three centuries ago is the one
 * image a traveller cannot check for themselves, which is exactly why it says
 * so on the image rather than in a footnote nobody scrolls to.
 */
export function AiSceneNote() {
  return (
    <span className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">
      ✨ AI 情境重現
    </span>
  );
}

/**
 * The same generated poster, for something that is not a POI.
 *
 * Merchants, hotels and tours need a picture and there is no photograph of any
 * of them — they are demo records. Rather than ship a stock image of somebody
 * else's shop, or leave a grey rectangle, they get exactly the graphic every
 * place in this app already uses, keyed by their own id so two souvenir shops
 * in one district do not come out identical.
 *
 * `kind` picks the palette. It is a `PoiKind` because the palettes are already
 * written against it and inventing a second, parallel set of scene colours for
 * merchants would mean the same street could be two different colours on two
 * screens.
 */
export function SceneCover({
  id,
  kind,
  emoji,
  height = 120,
  radius = 14,
  showEmoji = true,
  className = "",
}: {
  id: string;
  kind: PoiKind;
  emoji: string;
  height?: number | string;
  radius?: number;
  showEmoji?: boolean;
  className?: string;
}) {
  /* Generated only reads id, kind and emoji off the record, so a stand-in with
     those three fields is the whole contract — and keeping it local means the
     component keeps taking a real Poi everywhere else. */
  const stand = { id, kind, emoji } as Poi;
  return (
    <div
      className={`relative shrink-0 overflow-hidden ${className}`}
      style={{ height, borderRadius: radius }}
      aria-hidden
    >
      <Generated poi={stand} radius={radius} emoji={showEmoji} />
    </div>
  );
}

/**
 * The picture for a merchant, a provider, an affiliate listing or a category
 * card — a real photograph when the record has one, the generated poster when
 * it has not.
 *
 * Same contract as `PoiImage`: the poster is drawn underneath and the photo on
 * top, so a failed request degrades to the graphic rather than to a broken-image
 * glyph. `loading="lazy"` is not optional here — a 周邊推薦 list can hold a
 * dozen of these and none of them is above the fold.
 *
 * `size` picks which file: cards ask for the 720px crop, headers for the 1280px
 * one. Asking for the hero in a 353px slot is most of the payload for none of
 * the sharpness, which is the same reason PoiImage keeps two bases.
 */
export function RecordPhoto({
  record,
  fallbackId,
  fallbackKind,
  emoji,
  height = 160,
  radius = 16,
  size = "card",
  className = "",
  children,
}: {
  record: HasPhoto;
  /** Seeds the poster's jitter, so two shops do not draw the same graphic. */
  fallbackId: string;
  fallbackKind: PoiKind;
  emoji: string;
  height?: number | string;
  radius?: number;
  size?: "card" | "hero";
  className?: string;
  /** Overlaid on the image — a badge, a label. */
  children?: ReactNode;
}) {
  const shot = shotFor(record);
  const [failed, setFailed] = useState(false);
  const src = shot ? (size === "hero" ? shot.hero : shot.card) : undefined;
  const show = Boolean(src) && !failed;

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${className}`}
      style={{ height, borderRadius: radius }}
    >
      <Generated
        poi={{ id: fallbackId, kind: fallbackKind, emoji } as Poi}
        radius={radius}
        emoji={!show}
      />
      {show && src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
          style={{ borderRadius: radius }}
        />
      )}
      {children}
    </div>
  );
}

/**
 * Photographer and licence for a borrowed T0 photograph.
 *
 * Only a real photograph carries a credit, and when it does the licence
 * requires it to be shown — so this renders nothing for an illustrative demo
 * image and everything for a CC one. The 示意圖 line for the demo images sits
 * at block level with the rest of the disclosures, not on every card.
 */
export function RecordPhotoCredit({ record }: { record: HasPhoto }) {
  const c = shotFor(record)?.credit;
  if (!c) return null;
  return (
    <p className="px-5 pt-1.5 text-[11px] leading-relaxed text-ink-3">
      周邊實景照片：
      <a href={c.source} target="_blank" rel="noopener noreferrer" className="underline">
        {c.author}
      </a>
      {" / "}
      <a href={c.licenceUrl} target="_blank" rel="noopener noreferrer" className="underline">
        {c.licence}
      </a>
      {" · via Wikimedia Commons"}
    </p>
  );
}
