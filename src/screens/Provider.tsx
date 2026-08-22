import { useMemo, useState } from "react";
import { provider as providerOf } from "../data/providers";
import { BY_DEST } from "../data/destinations";
import { reviewsFor } from "../data/reviews";
import {
  ContactSheet,
  InfoButton,
  InfoSheet,
  PartnerBadge,
  PendingBadge,
} from "../components/Trade";
import { SHORT_DISCLOSURE, type InfoTopic } from "../data/info";
import { Avatar, Button, Note, Screen, Section, Tag, TopBar } from "../components/ui";
import { PersonPhoto } from "../components/Cover";
import { hasPortrait } from "../data/portraits";
import { isVerifiedPartner } from "../lib/nearby";
import { CHANNEL_LABELS, availableChannels, tryContact } from "../lib/contact";
import { useNav } from "../nav";
import { PROVIDER_KIND_LABELS } from "../types";

/**
 * A driver or a guide, in full. One component for both.
 *
 * They are the same product — a person, a price, an area, a language list and a
 * way to reach them — and the only real difference is the last two rows:
 * a driver is asked what they drive, a guide is asked what they talk about.
 * Two components would have meant two answers to "where does the rating go",
 * and eventually two different answers.
 *
 * The badge and the rule that produces it appear together. 大熊 pays, has not
 * passed review, and this page says exactly that instead of quietly leaving a
 * gap where the mark would be.
 */
export function Provider({ id }: { id: string }) {
  const nav = useNav();
  const [contact, setContact] = useState(false);
  const [info, setInfo] = useState<InfoTopic | null>(null);
  const p = providerOf(id);
  const reviews = useMemo(() => reviewsFor(id), [id]);

  if (!p) return null;
  const city = BY_DEST[p.destId]?.name;
  const verified = isVerifiedPartner(p);
  const isDriver = p.kind === "driver";
  const channels = availableChannels(p.contact);
  const portrait = hasPortrait(p.id);

  return (
    <Screen>
      {/* A picture, then the person. A charter driver is chosen the way a hotel
          is: you look first.

          When there is no portrait yet there is no header either — an ordinary
          top bar instead. The card can show a monogram in its image slot because
          the name below it is 22px; here the avatar beside the name is already
          44px, so a second copy of the same initial at 76px directly above it is
          the same circle drawn twice and reads as a mistake. Better to have no
          picture than a slot pretending to be one. */}
      {portrait ? (
        <div className="relative shrink-0">
          <PersonPhoto
            id={p.id}
            name={p.name}
            color={p.color}
            initial={p.initial}
            height={200}
            size="hero"
            eager
            className="w-full"
          />
          <button
            onClick={() => nav.back()}
            aria-label="返回"
            className="absolute left-4 top-4 grid size-11 place-items-center rounded-full bg-bg/90 text-[19px] text-ink active:bg-bg"
          >
            ‹
          </button>
          <span className="absolute bottom-3 left-4 rounded-md bg-bg/85 px-2 py-1 text-[12px] font-semibold text-ink-2">
            {PROVIDER_KIND_LABELS[p.kind]}
          </span>
        </div>
      ) : (
        <TopBar title={PROVIDER_KIND_LABELS[p.kind]} onBack={() => nav.back()} />
      )}

      <div className="flex items-start gap-3 px-5 pb-1 pt-4">
        <Avatar name={p.name} color={p.color} initial={p.initial} size={44} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[21px] font-bold text-ink">{p.name}</h1>
          {p.org && <div className="mt-0.5 truncate text-[13px] text-ink-3">{p.org}</div>}
          {/* One mark, with its explanation one tap away rather than printed
              in full at the foot of every page. */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {verified ? (
              <>
                <PartnerBadge />
                <InfoButton topic="partner" onOpen={setInfo} />
              </>
            ) : (
              <>
                {p.reviewStatus === "pending" && <PendingBadge />}
                {p.isPaid && <Tag kind="sponsored" />}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Three figures, side by side, because they are read together: how good,
          how experienced, how much. Any one of them alone is unanswerable. */}
      <div className="mt-4 flex gap-2 px-5">
        <Stat
          label="評價"
          value={p.rating.toFixed(1)}
          note={`${p.reviewCount} 則`}
          onClick={
            reviews.length
              ? () => nav.go({ k: "reviews", kind: "provider", id: p.id })
              : undefined
          }
        />
        <Stat
          label={isDriver ? "服務趟數" : "服務人次"}
          value={p.servedCount.toLocaleString()}
          note={p.servedUnit}
        />
        <Stat
          label="起價"
          value={`$${(p.priceFromTwd / 1000).toFixed(1)}k`}
          note={`/ ${p.priceUnit}`}
        />
      </div>

      <div className="px-5 pt-5">
        <p className="text-[14.5px] leading-relaxed text-ink-2">{p.intro}</p>
      </div>

      <Section title="服務內容" tight>
        <div className="px-5">
          <InfoRow label="服務區域" value={p.areas.join("、")} />
          <InfoRow label="語言" value={p.languages.join("、")} />
          <InfoRow label="服務時段" value={p.hours} />
          <InfoRow
            label="價格區間"
            value={`NT$ ${p.priceFromTwd.toLocaleString()} – ${p.priceToTwd.toLocaleString()} / ${p.priceUnit}`}
          />
          {isDriver ? (
            <>
              <InfoRow label="車型" value={p.vehicle ?? "—"} />
              <InfoRow label="座位數" value={p.seats ? `${p.seats} 人座` : "—"} />
            </>
          ) : (
            <InfoRow label="服務類型" value={p.serviceType ?? "—"} />
          )}
          <InfoRow label="所在地" value={[city, p.area].filter(Boolean).join(" · ")} />
        </div>
      </Section>

      <Section title={isDriver ? "招牌路線" : "導覽主題"} tight>
        <div className="flex flex-wrap gap-1.5 px-5">
          {p.themes.map((t) => (
            <span
              key={t}
              className="rounded-full bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-ink-2"
            >
              {t}
            </span>
          ))}
        </div>
      </Section>

      {reviews.length > 0 && (
        <Section
          title="評價"
          action="全部"
          onAction={() => nav.go({ k: "reviews", kind: "provider", id: p.id })}
        >
          <div className="space-y-2 px-5">
            {reviews.slice(0, 2).map((r) => (
              <div key={r.id} className="rounded-2xl bg-surface p-3.5">
                <div className="num flex items-center gap-1.5 text-[12.5px] text-ink-3">
                  <span aria-hidden>★</span>
                  <span className="font-semibold text-ink-2">{r.rating.toFixed(1)}</span>
                  <span aria-hidden>·</span>
                  <span className="truncate">{r.user}</span>
                  <span className="ml-auto shrink-0">{r.date}</span>
                </div>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{r.comment}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="聯絡與預約" tight>
        {/* One row per channel this person actually offers, opened for real.
            The sheet behind 其他聯絡方式 covers the rest and explains them. */}
        <div className="space-y-2 px-5">
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => tryContact(p.contact, ch)}
              className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl bg-surface px-4 text-left active:bg-surface-2"
            >
              <span className="flex-1 text-[15px] font-semibold text-ink">
                {CHANNEL_LABELS[ch]}
              </span>
              <span className="shrink-0 text-[13px] text-ink-3">開啟 ›</span>
            </button>
          ))}
          <button
            onClick={() => setContact(true)}
            className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl bg-surface/60 px-4 text-left active:bg-surface"
          >
            <span className="flex-1 text-[15px] font-semibold text-ink-3">其他聯絡方式</span>
            <span className="shrink-0 text-[13px] text-ink-3">›</span>
          </button>
        </div>
      </Section>

      <Note>{SHORT_DISCLOSURE.resomap}</Note>
      <div className="h-4 shrink-0" />

      <div className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-line bg-bg/95 px-5 pb-5 pt-3 backdrop-blur">
        <Button onClick={() => setContact(true)}>立即預約</Button>
      </div>

      <ContactSheet
        name={p.name}
        contact={p.contact}
        open={contact}
        onClose={() => setContact(false)}
      />
      <InfoSheet topic={info} onClose={() => setInfo(null)} />
    </Screen>
  );
}

function Stat({
  label,
  value,
  note,
  onClick,
}: {
  label: string;
  value: string;
  note?: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <div className="text-[11.5px] text-ink-3">{label}</div>
      <div className="num mt-0.5 text-[19px] font-bold leading-none text-ink">{value}</div>
      {note && <div className="num mt-1 truncate text-[11.5px] text-ink-3">{note}</div>}
    </>
  );
  const cls = "min-w-0 flex-1 rounded-2xl bg-surface px-3 py-3 text-center";
  return onClick ? (
    <button onClick={onClick} className={`${cls} active:bg-surface-2`}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 border-b border-line py-3 last:border-0">
      <span className="w-[72px] shrink-0 text-[13px] text-ink-3">{label}</span>
      <span className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-ink">{value}</span>
    </div>
  );
}
