import { SceneCover } from "./Cover";
import { Headphones, Thumb } from "./ui";
import { clockOf } from "../lib/audio";
import { likeCount, useReactions } from "../lib/reactions";
import { merchant as merchantOf } from "../data/merchants";
import { poi } from "../data";
import { AUDIO_TOPIC_LABELS, type AudioGuide } from "../types";

/**
 * One guide, in a list.
 *
 * Three kinds share this row on purpose. A merchant's recording and a
 * traveller's upload are both「有人錄了一段關於這裡的東西」, and giving the paid
 * one its own richer layout would be the card doing the selling. What the paid
 * one gets is position — pinned to the top — and a label saying why it is
 * there. That is the whole of the difference, and it is the honest whole:
 * position is what was bought.
 *
 * The play control is a sibling of the row button rather than nested inside it.
 * A button inside a button is invalid markup and behaves differently in every
 * browser — the same reason Explore's guide cards are built this way.
 */
export function AudioRow({
  guide: a,
  onPlay,
  onOpenMerchant,
}: {
  guide: AudioGuide;
  onPlay: () => void;
  /** Only meaningful for a merchant guide; the row hides the link without it. */
  onOpenMerchant?: (merchantId: string) => void;
}) {
  const liked = useReactions().liked.includes(a.id);
  const p = poi(a.poiId);
  const shop = a.merchantId ? merchantOf(a.merchantId) : undefined;
  const featured = a.kind === "merchant";

  return (
    <div
      className={`overflow-hidden rounded-2xl ${featured ? "bg-brand-wash" : "bg-surface"}`}
    >
      {featured && (
        <div className="flex items-center gap-1.5 px-3 pt-2.5 text-[11px] font-semibold text-brand">
          <span aria-hidden>★</span>
          <span>店家精選</span>
          <span className="font-normal text-ink-3">
            · {a.topic ? AUDIO_TOPIC_LABELS[a.topic] : "商業內容"}
          </span>
          {shop && onOpenMerchant && (
            <button
              onClick={() => onOpenMerchant(shop.id)}
              className="relative ml-auto shrink-0 text-[11px] font-semibold text-ink-3 after:absolute after:inset-x-0 after:-inset-y-[14px] after:content-['']"
            >
              {shop.name} ›
            </button>
          )}
        </div>
      )}

      <button
        onClick={onPlay}
        className="flex w-full gap-3 p-3 text-left transition active:bg-surface-2"
      >
        {/* A merchant guide is about a shop, so it gets the shop's own colour
            block; everything else is about the place. Either way the picture is
            generated, so nothing loads and nothing can 404. */}
        {shop ? (
          <Thumb emoji={shop.emoji} tint={shop.tint} size={56} radius={12} />
        ) : (
          <SceneCover
            id={a.id}
            kind={p?.kind ?? "attraction"}
            emoji={p?.emoji ?? "🎧"}
            height={56}
            radius={12}
            className="w-[56px]"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-[14.5px] font-bold leading-snug text-ink">
            {a.title}
          </div>
          <div className="mt-0.5 truncate text-[12.5px] text-ink-3">{a.hook}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-3">
            <span className="shrink-0 rounded-md bg-bg px-1.5 py-0.5 text-[11px] font-semibold">
              {a.language}
            </span>
            <span className="num shrink-0">{clockOf(a)}</span>
            <span aria-hidden>·</span>
            <span className="min-w-0 truncate">{a.narrator}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-1">
          <span
            className={`grid size-9 place-items-center rounded-full text-[13px] ${
              featured ? "bg-bg text-ink" : "bg-bg text-ink"
            }`}
            aria-hidden
          >
            ▶
          </span>
          <span className="num inline-flex items-center gap-0.5 text-[11px] text-ink-3">
            <span className={liked ? "text-brand" : ""} aria-hidden>
              {liked ? "♥" : "♡"}
            </span>
            {likeCount(a.likes, liked)}
          </span>
        </div>
      </button>
    </div>
  );
}

/**
 * The compact version, for the three-row preview on a POI page.
 *
 * Same information in the same order, one line shorter, and no like count —
 * the POI page is about the place, and a column of hearts down the side of it
 * competes with 加入行程 for the reader's eye.
 */
export function AudioRowMini({
  guide: a,
  onPlay,
}: {
  guide: AudioGuide;
  onPlay: () => void;
}) {
  const shop = a.merchantId ? merchantOf(a.merchantId) : undefined;
  const featured = a.kind === "merchant";

  return (
    <button
      onClick={onPlay}
      className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition active:bg-surface-2 ${
        featured ? "bg-brand-wash" : "bg-bg"
      }`}
    >
      {shop ? (
        <Thumb emoji={shop.emoji} tint={shop.tint} size={44} radius={10} />
      ) : (
        <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-ink-2">
          <Headphones size={16} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {featured && (
            <span className="shrink-0 text-[11px] font-semibold text-brand">★ 店家精選</span>
          )}
          <span className="min-w-0 truncate text-[14px] font-semibold text-ink">
            {a.title}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-3">
          <span className="shrink-0">{a.language}</span>
          <span aria-hidden>·</span>
          <span className="num shrink-0">{clockOf(a)}</span>
          <span aria-hidden>·</span>
          <span className="min-w-0 truncate">{a.narrator}</span>
        </div>
      </div>
      <span className="shrink-0 text-[13px] text-ink-3" aria-hidden>
        ▶
      </span>
    </button>
  );
}
