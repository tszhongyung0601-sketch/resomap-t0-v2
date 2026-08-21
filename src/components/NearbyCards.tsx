import { SceneCover } from "./Cover";
import { AffiliateBadge, PartnerBadge, PendingBadge, Stars } from "./Trade";
import { Avatar, Headphones, Tag } from "./ui";
import { km } from "../lib/geo";
import { isVerifiedPartner } from "../lib/nearby";
import { partner as partnerOf } from "../data/affiliatePartners";
import {
  MERCHANT_CATEGORY_LABELS,
  type AffiliateOffer,
  type Merchant,
  type PoiKind,
  type Provider,
} from "../types";

/**
 * The three list cards: a shop, a person, somebody else's listing.
 *
 * All three follow one rule that the source demo did not: **a card carries what
 * you need to decide whether to tap it, and nothing else.** The demo these came
 * from printed opening hours, full address, language list, review count, promo
 * and three CTAs on every row — nine lines of small grey text that all look
 * equally important, which is the same as none of them being important.
 *
 * So: picture, name, distance, rating, one line of description, one commercial
 * label if there is one, and at most two actions. Everything else is on the
 * detail page, which is what a detail page is for.
 */

/* The generated cover palettes are keyed by POI kind; a shop is one of three of
   them. Mapping rather than inventing new palettes keeps one street the same
   colour on every screen it appears on. */
const MERCHANT_SCENE: Record<Merchant["category"], PoiKind> = {
  restaurant: "food",
  hotel: "stay",
  souvenir: "shopping",
};

export function MerchantCard({
  merchant: m,
  metres,
  hasAudio,
  onOpen,
  onDirections,
}: {
  merchant: Merchant;
  metres: number;
  /** Whether this merchant has a guide pinned to the place being viewed. */
  hasAudio?: boolean;
  onOpen: () => void;
  onDirections: () => void;
}) {
  const verified = isVerifiedPartner(m);

  return (
    <div className="overflow-hidden rounded-2xl bg-surface">
      <button onClick={onOpen} className="flex w-full gap-3 p-3 text-left active:bg-surface-2">
        <SceneCover
          id={m.id}
          kind={MERCHANT_SCENE[m.category]}
          emoji={m.emoji}
          height={76}
          radius={12}
          className="w-[92px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-ink">
              {m.name}
            </span>
            <span className="num shrink-0 text-[12.5px] text-ink-3">{km(metres)}</span>
          </div>

          <div className="mt-0.5 flex items-center gap-1.5">
            <Stars rating={m.rating} count={m.reviewCount} />
          </div>

          <div className="mt-0.5 truncate text-[12.5px] text-ink-3">
            {MERCHANT_CATEGORY_LABELS[m.category]} · {m.area}
          </div>

          <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-ink-2">{m.desc}</p>

          {/* One row of marks, and only the ones that are true. */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {/* One commercial mark, never two. 推薦夥伴 already means paid
                *and* reviewed — the rule is printed at the foot of every list —
                so stacking 贊助 next to it says the same thing twice. A paid
                listing that has not passed review still has to disclose the
                paid part, and that is exactly when 贊助 appears. */}
            {verified ? (
              <PartnerBadge compact />
            ) : (
              <>
                {m.reviewStatus === "pending" && <PendingBadge />}
                {m.isPaid && <Tag kind="sponsored" />}
              </>
            )}
            {hasAudio && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">
                <Headphones size={11} />
                店家語音
              </span>
            )}
            {m.promo && (
              <span className="truncate rounded-md bg-brand-wash px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                {m.promo}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Two actions, both page-white on the surface card — `onCard`'s reason.
          A third one would not fit at 393px without truncating a Chinese label,
          and 立即聯絡 is one tap further in, on the detail page, where the
          contact sheet can show every channel rather than guess one. */}
      <div className="flex gap-2 px-3 pb-3">
        <CardAction onClick={onOpen}>查看詳情</CardAction>
        <CardAction onClick={onDirections}>導航前往</CardAction>
      </div>
    </div>
  );
}

export function ProviderCard({
  provider: p,
  metres,
  onOpen,
  onContact,
}: {
  provider: Provider;
  metres: number;
  onOpen: () => void;
  onContact: () => void;
}) {
  const verified = isVerifiedPartner(p);

  return (
    <div className="overflow-hidden rounded-2xl bg-surface">
      <button onClick={onOpen} className="flex w-full gap-3 p-3 text-left active:bg-surface-2">
        {/* An initial on a colour, which is how this app draws every person.
            A stock portrait of somebody who does not exist would be the one
            picture on the screen a traveller could mistake for a real face. */}
        <Avatar name={p.name} color={p.color} initial={p.initial} size={56} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-ink">
              {p.name}
            </span>
            <span className="num shrink-0 text-[12.5px] text-ink-3">{km(metres)}</span>
          </div>

          {/* Same rule as the merchant card: 推薦夥伴, or the paid-but-not-yet
              -approved pair. Never both. */}
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {verified ? (
              <PartnerBadge />
            ) : (
              <>
                {p.reviewStatus === "pending" && <PendingBadge />}
                {p.isPaid && <Tag kind="sponsored" />}
              </>
            )}
          </div>

          <div className="mt-1">
            <Stars rating={p.rating} count={p.reviewCount} />
          </div>

          <div className="mt-0.5 truncate text-[12.5px] text-ink-3">
            {p.languages.join("・")}
          </div>

          <div className="num mt-0.5 truncate text-[12.5px] font-semibold text-ink-2">
            NT$ {p.priceFromTwd.toLocaleString()} 起 / {p.priceUnit}
          </div>

          {/* A driver is judged on where they will go; a guide on what they
              talk about. Same slot, different question. */}
          <div className="mt-0.5 truncate text-[12px] text-ink-3">
            {p.kind === "driver" ? p.areas.join("・") : p.themes.slice(0, 2).join("・")}
          </div>
        </div>
      </button>

      <div className="flex gap-2 px-3 pb-3">
        <CardAction onClick={onContact}>立即聯絡</CardAction>
        <CardAction onClick={onOpen}>查看詳情</CardAction>
      </div>
    </div>
  );
}

export function OfferCard({
  offer: o,
  metres,
  onOpen,
}: {
  offer: AffiliateOffer;
  metres: number;
  onOpen: () => void;
}) {
  const brand = partnerOf(o.partner);

  return (
    <div className="overflow-hidden rounded-2xl bg-surface">
      <button onClick={onOpen} className="flex w-full gap-3 p-3 text-left active:bg-surface-2">
        <SceneCover
          id={o.id}
          kind={o.kind === "hotel" ? "stay" : "activity"}
          emoji={o.emoji}
          height={76}
          radius={12}
          className="w-[92px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-ink">
              {o.name}
            </span>
            <span className="num shrink-0 text-[12.5px] text-ink-3">{km(metres)}</span>
          </div>

          <div className="mt-0.5">
            <Stars rating={o.rating} scale={o.ratingScale} />
          </div>

          <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-ink-2">{o.blurb}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <AffiliateBadge partner={brand.name} />
            <span className="num text-[12.5px] font-semibold text-ink-2">
              NT$ {o.priceTwd.toLocaleString()} 起 / {o.priceUnit}
            </span>
          </div>
        </div>
      </button>

      <div className="flex gap-2 px-3 pb-3">
        <CardAction onClick={onOpen}>前往 {brand.name}</CardAction>
      </div>
    </div>
  );
}

/**
 * The action pill used by all three cards.
 *
 * `bg-bg` rather than `bg-brand`: these sit inside a `bg-surface` card, so page
 * white is the fill that stays visible without shouting — the same argument
 * `Button variant="onCard"` makes in ui.tsx. A list of twelve orange buttons is
 * a list where nothing is the primary action.
 */
function CardAction({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-bg px-3 text-[13.5px] font-bold text-ink transition active:bg-surface-2"
    >
      {children}
    </button>
  );
}
