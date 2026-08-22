import type { ReactNode } from "react";
import { RecordPhoto } from "./Cover";
import { AffiliateBadge, PartnerBadge, PendingBadge, Stars } from "./Trade";
import { Avatar, Headphones } from "./ui";
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
 * A photograph across the top and the facts underneath — the same shape
 * 導覽庫's guide card already uses, so a traveller who has scrolled that list
 * recognises this one. The picture is doing real work: choosing between three
 * souvenir shops on a phone is a visual decision, and a row of grey text with an
 * emoji in it is not a travel product.
 *
 * What is deliberately *not* on the card: opening hours, full address, language
 * list, review breakdown, three CTAs. The demo these came from printed all of
 * it on every row — nine lines of small grey text that all look equally
 * important, which is the same as none of them being important. Card answers
 * "is this the one"; detail page answers everything else.
 */

/* The generated poster palettes are keyed by POI kind; a shop is one of three
   of them. Mapping rather than inventing new palettes keeps one street the same
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
    <article className="overflow-hidden rounded-2xl bg-surface">
      <button onClick={onOpen} className="block w-full text-left active:bg-surface-2">
        <RecordPhoto
          record={m}
          fallbackId={m.id}
          fallbackKind={MERCHANT_SCENE[m.category]}
          emoji={m.emoji}
          height={150}
          radius={0}
        >
          {/* Distance rides on the picture rather than taking a line of its
              own — it is the one number read at a glance, and the card has four
              other lines that want the width. */}
          <span className="num absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11.5px] font-semibold text-white">
            {km(metres)}
          </span>
        </RecordPhoto>

        <div className="px-4 pt-3">
          <div className="truncate text-[15.5px] font-bold text-ink">{m.name}</div>

          <div className="mt-1 flex items-center gap-2">
            <Stars rating={m.rating} count={m.reviewCount} />
          </div>

          <div className="mt-0.5 truncate text-[12.5px] text-ink-3">
            {MERCHANT_CATEGORY_LABELS[m.category]} · {m.area}
          </div>

          <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink-2">{m.desc}</p>

          <Marks
            verified={verified}
            pending={m.reviewStatus === "pending"}
            paid={m.isPaid}
            promo={m.promo}
            audio={hasAudio}
          />
        </div>
      </button>

      {/* Two actions, both page-white on the surface card — `onCard`'s reason.
          立即聯絡 is one tap further in, on the detail page, where the contact
          sheet can show every channel rather than guess one. */}
      <div className="flex gap-2 px-4 pb-4 pt-2.5">
        <CardAction onClick={onOpen}>查看詳情</CardAction>
        <CardAction onClick={onDirections}>導航</CardAction>
      </div>
    </article>
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
  const isDriver = p.kind === "driver";

  return (
    <article className="overflow-hidden rounded-2xl bg-surface">
      <button onClick={onOpen} className="block w-full text-left active:bg-surface-2">
        <RecordPhoto
          record={p}
          fallbackId={p.id}
          fallbackKind={isDriver ? "transit" : "attraction"}
          emoji={isDriver ? "🚐" : "🧭"}
          height={150}
          radius={0}
        >
          <span className="num absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11.5px] font-semibold text-white">
            {km(metres)}
          </span>
        </RecordPhoto>

        <div className="px-4 pt-3">
          <div className="flex items-center gap-2">
            {/* The initial stays, small, beside the name. It is how this app has
                drawn people everywhere else, and it survives a photo that fails
                to load. */}
            <Avatar name={p.name} color={p.color} initial={p.initial} size={22} />
            <span className="min-w-0 flex-1 truncate text-[15.5px] font-bold text-ink">
              {p.name}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <Stars rating={p.rating} count={p.reviewCount} />
          </div>

          <div className="mt-0.5 truncate text-[12.5px] text-ink-3">
            {p.languages.join(" · ")}
          </div>

          {/* A driver is chosen on where they will go; a guide on what they
              talk about. Same slot, different question. */}
          <div className="mt-0.5 truncate text-[12.5px] text-ink-3">
            {isDriver ? p.areas.join(" · ") : p.themes.slice(0, 2).join(" · ")}
          </div>

          <div className="num mt-1 truncate text-[13.5px] font-bold text-ink">
            NT$ {p.priceFromTwd.toLocaleString()} 起
            <span className="text-[12px] font-semibold text-ink-3"> / {p.priceUnit}</span>
          </div>

          <Marks
            verified={verified}
            pending={p.reviewStatus === "pending"}
            paid={p.isPaid}
          />
        </div>
      </button>

      <div className="flex gap-2 px-4 pb-4 pt-2.5">
        <CardAction onClick={onContact}>聯絡</CardAction>
        <CardAction onClick={onOpen}>查看詳情</CardAction>
      </div>
    </article>
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
    <article className="overflow-hidden rounded-2xl bg-surface">
      <button onClick={onOpen} className="block w-full text-left active:bg-surface-2">
        <RecordPhoto
          record={o}
          fallbackId={o.id}
          fallbackKind={o.kind === "hotel" ? "stay" : "activity"}
          emoji={o.emoji}
          height={150}
          radius={0}
        >
          <span className="num absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11.5px] font-semibold text-white">
            {km(metres)}
          </span>
        </RecordPhoto>

        <div className="px-4 pt-3">
          <div className="truncate text-[15.5px] font-bold text-ink">{o.name}</div>

          <div className="mt-1">
            <Stars rating={o.rating} scale={o.ratingScale} />
          </div>

          <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink-2">{o.blurb}</p>

          <div className="num mt-1.5 truncate text-[13.5px] font-bold text-ink">
            NT$ {o.priceTwd.toLocaleString()} 起
            <span className="text-[12px] font-semibold text-ink-3"> / {o.priceUnit}</span>
          </div>

          {/* One quiet line, at the bottom, where a price footnote goes. The
              traveller is choosing a tour, not a business model. */}
          <div className="mt-1.5">
            <AffiliateBadge partner={brand.name} />
          </div>
        </div>
      </button>

      <div className="flex gap-2 px-4 pb-4 pt-2.5">
        <CardAction onClick={onOpen}>查看方案</CardAction>
      </div>
    </article>
  );
}

/**
 * The marks row, and the rule that keeps it short.
 *
 * 推薦夥伴 already means paid *and* reviewed — the rule is printed at the foot
 * of every list — so stacking 贊助 next to it says the same thing twice. A paid
 * listing that has not passed review still has to disclose the paid part, and
 * that is exactly when 贊助 appears.
 */
function Marks({
  verified,
  pending,
  paid,
  promo,
  audio,
}: {
  verified: boolean;
  pending: boolean;
  paid: boolean;
  promo?: string;
  audio?: boolean;
}) {
  const anything = verified || pending || (paid && !verified) || promo || audio;
  if (!anything) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {verified ? (
        <PartnerBadge />
      ) : (
        <>
          {pending && <PendingBadge />}
          {paid && (
            <span className="inline-block shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">
              贊助
            </span>
          )}
        </>
      )}
      {audio && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">
          <Headphones size={11} />
          有語音
        </span>
      )}
      {promo && (
        <span className="min-w-0 truncate rounded-md bg-brand-wash px-1.5 py-0.5 text-[11px] font-semibold text-brand">
          {promo}
        </span>
      )}
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
function CardAction({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-bg px-3 text-[13.5px] font-bold text-ink transition active:bg-surface-2"
    >
      {children}
    </button>
  );
}
