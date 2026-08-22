import type { ReactNode } from "react";
import { PersonPhoto, RecordPhoto } from "./Cover";
import { AffiliateBadge, PartnerBadge, PendingBadge, Stars } from "./Trade";
import { Avatar, Headphones } from "./ui";
import { km } from "../lib/geo";
import { isVerifiedPartner } from "../lib/nearby";
import { partner as partnerOf } from "../data/affiliatePartners";
import {
  MERCHANT_CATEGORY_LABELS,
  PROVIDER_KIND_LABELS,
  type AffiliateOffer,
  type Merchant,
  type PoiKind,
  type Provider,
} from "../types";

/**
 * The周邊推薦 list card: a shop, a person, somebody else's listing.
 *
 * One skeleton, three fillings. A square picture on the left, the facts that
 * decide the choice on the right, a row of specifications under them, and three
 * actions along the bottom — the shape a directory listing has had since before
 * any of this was on a phone, and the shape a traveller comparing four drivers
 * can actually scan.
 *
 * It replaces a card that led with a 16:9 photograph and three lines of text.
 * That one looked better in isolation and worse in a list: the picture took the
 * top third of every card, so two cards filled the screen and comparing four
 * meant remembering the first two.
 *
 * What goes in the specification row is decided per kind and never padded. A
 * driver has a price, hours and a vehicle; a shop has a category, opening hours
 * and languages and **no price at all**, because the data has none. An empty
 * cell reading 「—」 is a cell that took up space to say nothing, and a made-up
 * price is worse than that.
 */

/* The generated poster palettes are keyed by POI kind; a shop is one of three
   of them. Mapping rather than inventing new palettes keeps one street the same
   colour on every screen it appears on. */
const MERCHANT_SCENE: Record<Merchant["category"], PoiKind> = {
  restaurant: "food",
  hotel: "stay",
  souvenir: "shopping",
};

/* ------------------------------------------------------------- the skeleton */

interface Fact {
  label: string;
  value: string;
}

interface Action {
  label: string;
  onClick: () => void;
  /** Exactly one per card. The filled orange one. */
  primary?: boolean;
}

/**
 * The card, without knowing what is in it.
 *
 * The whole upper block is one button and the actions are its siblings — a
 * `<button>` inside a `<button>` is invalid markup that behaves differently in
 * every browser, and this card has four tappable regions, so the rule matters
 * here more than anywhere else in the app.
 */
function ServiceCard({
  thumb,
  name,
  badge,
  sub,
  chips,
  stars,
  facts,
  introLabel,
  intro,
  themes,
  marks,
  actions,
  onOpen,
}: {
  thumb: ReactNode;
  name: string;
  badge?: ReactNode;
  sub: string;
  chips?: string[];
  stars: ReactNode;
  facts: Fact[];
  introLabel?: string;
  intro?: string;
  themes?: string[];
  marks?: ReactNode;
  actions: Action[];
  onOpen: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl bg-surface">
      <button
        onClick={onOpen}
        className="block w-full px-4 pt-4 text-left transition active:bg-surface-2"
      >
        <div className="flex gap-3">
          {thumb}

          <div className="min-w-0 flex-1">
            {/* Wraps rather than truncates. With a fixed badge beside it, a
                truncating name had 69px on a 375px screen and 阿誠包車旅遊
                rendered as 阿誠包… — the badge won an argument it should never
                have been in. A long name now takes a second line and the badge
                follows it down. */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span className="text-[16px] font-bold leading-tight text-ink">{name}</span>
              {badge}
            </div>

            <div className="mt-1 truncate text-[12.5px] text-ink-3">{sub}</div>

            {chips && chips.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-2"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-1.5">{stars}</div>
          </div>
        </div>

        {facts.length > 0 && (
          <div
            className="mt-3 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))` }}
          >
            {facts.map((f) => (
              <div key={f.label} className="min-w-0 rounded-[10px] bg-surface-2 px-2 py-1.5">
                <div className="truncate text-[10.5px] text-ink-3">{f.label}</div>
                <div className="num mt-0.5 break-words text-[12.5px] font-semibold leading-tight text-ink">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {intro && (
          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-2">
            {introLabel && <span className="font-bold text-ink">{introLabel}：</span>}
            {intro}
          </p>
        )}

        {themes && themes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {themes.map((t) => (
              <span
                key={t}
                className="rounded-md bg-brand-wash px-1.5 py-0.5 text-[11px] font-semibold text-brand"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {marks}
      </button>

      <div className="flex gap-2 px-4 pb-4 pt-3">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-2 text-[13.5px] font-bold transition ${
              a.primary
                ? "bg-brand text-white active:bg-brand-press"
                : "bg-bg text-ink active:bg-surface-2"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </article>
  );
}

/** The 96px square on the left. Shops and listings crop; people are drawn square. */
function Thumb({ children }: { children: ReactNode }) {
  return <div className="size-24 shrink-0 overflow-hidden rounded-xl">{children}</div>;
}

/* ------------------------------------------------------------------- shops */

export function MerchantCard({
  merchant: m,
  metres,
  hasAudio,
  onOpen,
  onContact,
  onDirections,
}: {
  merchant: Merchant;
  metres: number;
  hasAudio: boolean;
  onOpen: () => void;
  onContact: () => void;
  onDirections: () => void;
}) {
  const verified = isVerifiedPartner(m);
  const facts: Fact[] = [
    { label: "分類", value: MERCHANT_CATEGORY_LABELS[m.category] },
    { label: "營業時間", value: m.hours },
  ];
  /* Only when there is something to say. A shop with no language list gets two
     cells, not three with a blank one. */
  if (m.languages.length) facts.push({ label: "語言", value: m.languages.join("・") });

  return (
    <ServiceCard
      thumb={
        <Thumb>
          <RecordPhoto
            record={m}
            fallbackId={m.id}
            fallbackKind={MERCHANT_SCENE[m.category]}
            emoji={m.emoji}
            height="100%"
            radius={12}
          />
        </Thumb>
      }
      name={m.name}
      badge={verified ? <PartnerBadge short /> : undefined}
      sub={`${MERCHANT_CATEGORY_LABELS[m.category]} · ${m.area} · ${km(metres)}`}
      stars={<Stars rating={m.rating} count={m.reviewCount} />}
      facts={facts}
      marks={
        <Marks
          verified={false}
          pending={m.reviewStatus === "pending"}
          paid={m.isPaid && !verified}
          promo={m.promo}
          audio={hasAudio}
        />
      }
      actions={[
        { label: "LINE 聯絡", onClick: onContact },
        { label: "導航", onClick: onDirections, primary: true },
        { label: "查看詳情", onClick: onOpen },
      ]}
      onOpen={onOpen}
    />
  );
}

/* ----------------------------------------------------------------- people */

export function ProviderCard({
  provider: p,
  metres,
  first = false,
  onOpen,
  onContact,
  onBook,
}: {
  provider: Provider;
  metres: number;
  /** The one card above the fold, whose portrait loads eagerly. */
  first?: boolean;
  onOpen: () => void;
  onContact: () => void;
  onBook: () => void;
}) {
  const verified = isVerifiedPartner(p);
  const isDriver = p.kind === "driver";

  return (
    <ServiceCard
      thumb={
        <Thumb>
          <PersonPhoto
            id={p.id}
            name={p.name}
            color={p.color}
            initial={p.initial}
            height="100%"
            radius={12}
            size="thumb"
            eager={first}
          />
        </Thumb>
      }
      name={p.name}
      badge={verified ? <PartnerBadge short /> : undefined}
      /* A driver is chosen on where they will take you and a guide on who they
         are — so the line under the name is the service area for one and the
         studio for the other. Same slot, different question. */
      sub={`${isDriver ? p.areas.join("、") : (p.org ?? PROVIDER_KIND_LABELS[p.kind])} · ${km(metres)}`}
      chips={p.languages}
      stars={
        <Stars
          rating={p.rating}
          count={p.reviewCount}
          extra={`${p.servedCount.toLocaleString()} ${p.servedUnit}`}
        />
      }
      /* The qualifier lives in the label and the figure lives in the value. Put
         "/ 半日" and "· 7 人座" in the value instead and a 93px cell wraps to
         three lines, which makes three cells 77px tall for no extra meaning. */
      facts={[
        {
          label: `價格區間 / ${p.priceUnit}`,
          value: `NT$ ${p.priceFromTwd.toLocaleString()}–${p.priceToTwd.toLocaleString()}`,
        },
        { label: "服務時段", value: p.hours },
        isDriver
          ? { label: p.seats ? `車型 · ${p.seats} 人座` : "車型", value: p.vehicle ?? "—" }
          : { label: "服務類型", value: p.serviceType ?? "—" },
      ]}
      introLabel="自我介紹"
      intro={p.intro}
      themes={p.themes.slice(0, 4)}
      marks={
        <Marks
          verified={false}
          pending={p.reviewStatus === "pending"}
          paid={p.isPaid && !verified}
        />
      }
      actions={[
        { label: "LINE 聯絡", onClick: onContact },
        { label: "立即預約", onClick: onBook, primary: true },
        { label: "查看詳情", onClick: onOpen },
      ]}
      onOpen={onOpen}
    />
  );
}

/* --------------------------------------------------- somebody else's listing */

export function OfferCard({
  offer: o,
  metres,
  saved,
  onOpen,
  onSave,
  onGo,
}: {
  offer: AffiliateOffer;
  metres: number;
  saved: boolean;
  onOpen: () => void;
  onSave: () => void;
  onGo: () => void;
}) {
  const brand = partnerOf(o.partner);

  return (
    <ServiceCard
      thumb={
        <Thumb>
          <RecordPhoto
            record={o}
            fallbackId={o.id}
            fallbackKind={o.kind === "hotel" ? "stay" : "activity"}
            emoji={o.emoji}
            height="100%"
            radius={12}
          />
        </Thumb>
      }
      name={o.name}
      sub={`${brand.name} · ${km(metres)}`}
      stars={<Stars rating={o.rating} scale={o.ratingScale} />}
      facts={[
        { label: `價格 / ${o.priceUnit}`, value: `NT$ ${o.priceTwd.toLocaleString()} 起` },
        { label: "評分", value: `${o.rating.toFixed(1)}${o.ratingScale === 10 ? " / 10" : ""}` },
        { label: "平台", value: brand.name },
      ]}
      intro={o.blurb}
      marks={
        <div className="mt-2">
          <AffiliateBadge partner={brand.name} />
        </div>
      }
      actions={[
        { label: saved ? "已收藏" : "收藏", onClick: onSave },
        { label: `前往 ${brand.name}`, onClick: onGo, primary: true },
        { label: "查看詳情", onClick: onOpen },
      ]}
      onOpen={onOpen}
    />
  );
}

/**
 * The marks row, and the rule that keeps it short.
 *
 * 推薦夥伴 already means paid *and* reviewed — the rule is printed at the foot
 * of every list — so stacking 贊助 next to it says the same thing twice. A paid
 * listing that has not passed review still has to disclose the paid part, and
 * that is exactly when 贊助 appears.
 *
 * The verified badge itself moved up beside the name with this layout, which is
 * where the screenshots put it and where a badge belongs: attached to the thing
 * it vouches for.
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
  const anything = verified || pending || paid || promo || audio;
  if (!anything) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {verified && <PartnerBadge />}
      {pending && <PendingBadge />}
      {paid && (
        <span className="inline-block shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">
          贊助
        </span>
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

export { Avatar };
