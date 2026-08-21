import { useMemo, useState } from "react";
import { poi } from "../data";
import { merchant as merchantOf } from "../data/merchants";
import { BY_DEST } from "../data/destinations";
import { PARTNER_RULE } from "../data/subscriptionPlans";
import { SceneCover } from "../components/Cover";
import { MapCredit, MapView } from "../components/MapView";
import { AudioRowMini } from "../components/AudioRow";
import { ContactSheet, PartnerBadge, PendingBadge, Stars } from "../components/Trade";
import { Button, Note, Screen, Section, Tag } from "../components/ui";
import { ALL_AUDIO } from "../lib/audio";
import { isVerifiedPartner } from "../lib/nearby";
import { openPlaceDirections } from "../lib/maps";
import { reviewsFor } from "../data/reviews";
import { useNav } from "../nav";
import { MERCHANT_CATEGORY_LABELS, type Poi, type PoiKind } from "../types";

/** A place's name, for the one sentence that needs it. */
const poiName = (poiId: string) => poi(poiId)?.name ?? "";

const SCENE: Record<string, PoiKind> = {
  restaurant: "food",
  hotel: "stay",
  souvenir: "shopping",
};

/**
 * One shop, in full.
 *
 * This is where everything the card left out finally goes — hours, address,
 * languages, the whole promotion, the recordings, the reviews and a map. The
 * split is the point: a list where every row carries nine lines is a list
 * nobody reads, and a detail page that repeats the card is a page nobody
 * scrolls.
 *
 * The 推薦夥伴 mark and the rule that produces it sit on the same screen. A
 * badge whose criteria are invisible is a badge that looks purchasable — and
 * this one is half purchasable, so saying which half is the honest version.
 */
export function Merchant({ id }: { id: string }) {
  const nav = useNav();
  const [contact, setContact] = useState(false);
  const m = merchantOf(id);

  const featured = useMemo(
    () => ALL_AUDIO.filter((a) => a.merchantId === id).slice(0, 2),
    [id],
  );
  const reviews = useMemo(() => reviewsFor(id), [id]);

  if (!m) return null;
  const city = BY_DEST[m.destId]?.name;
  const verified = isVerifiedPartner(m);

  /* MapView takes a Poi and a merchant is not one. It reads id, lat, lng and
     emoji off the record and nothing else, so a stand-in carrying those is the
     whole contract — cheaper and safer than widening the app's only map. */
  const pin = {
    id: m.id,
    name: m.name,
    destId: m.destId,
    area: m.area,
    kind: (SCENE[m.category] ?? "shopping") as PoiKind,
    lat: m.lat,
    lng: m.lng,
    emoji: m.emoji,
    tint: m.tint,
    stayMin: 30,
  } as Poi;

  return (
    <Screen>
      <div className="relative shrink-0">
        <SceneCover
          id={m.id}
          kind={SCENE[m.category] ?? "shopping"}
          emoji={m.emoji}
          height={190}
          radius={0}
          className="w-full"
        />
        <button
          onClick={() => nav.back()}
          aria-label="返回"
          className="absolute left-4 top-4 grid size-11 place-items-center rounded-full bg-bg/90 text-[19px] text-ink active:bg-bg"
        >
          ‹
        </button>
      </div>

      <div className="px-5 pt-5">
        <h1 className="text-[22px] font-bold leading-snug text-ink">{m.name}</h1>
        <div className="mt-1.5 text-[13.5px] text-ink-3">
          {[MERCHANT_CATEGORY_LABELS[m.category], city, m.area].filter(Boolean).join(" · ")}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Stars
            rating={m.rating}
            count={m.reviewCount}
            onClick={
              reviews.length
                ? () => nav.go({ k: "reviews", kind: "merchant", id: m.id })
                : undefined
            }
          />
        </div>

        {/* 推薦夥伴 already means paid and reviewed, and 會員狀態 below spells
            it out in words. 贊助 is for the case the mark cannot cover: paid,
            not yet approved, and still ranked with the paid weight. */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {verified ? (
            <PartnerBadge />
          ) : (
            <>
              {m.reviewStatus === "pending" && <PendingBadge />}
              {m.isPaid && <Tag kind="sponsored" />}
            </>
          )}
        </div>

        <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">{m.desc}</p>

        {m.promo && (
          <div className="mt-4 rounded-2xl bg-brand-wash p-4">
            <div className="text-[12px] font-semibold text-brand">目前的優惠</div>
            <div className="mt-0.5 text-[14.5px] font-bold leading-snug text-ink">
              {m.promo}
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-3">
              優惠內容由商家自行提供與維護，Demo 版本不驗證。
            </p>
          </div>
        )}
      </div>

      {/* The two things somebody standing outside actually needs. */}
      <div className="mt-5 flex gap-2 px-5">
        <Button variant="secondary" onClick={() => openPlaceDirections(m)}>
          導航前往
        </Button>
        <Button onClick={() => setContact(true)}>立即聯絡</Button>
      </div>

      <Section title="店家資訊" tight>
        <div className="px-5">
          <InfoRow icon="🕘" label="營業時間" value={m.hours} />
          <InfoRow icon="📍" label="地址" value={m.address} />
          <InfoRow icon="🌐" label="服務語言" value={m.languages.join("、")} />
          <InfoRow
            icon="🏷️"
            label="會員狀態"
            value={
              m.isPaid
                ? m.reviewStatus === "approved"
                  ? "付費商家・已通過審核"
                  : "付費商家・審核中"
                : "尚未訂閱"
            }
          />
        </div>
      </Section>

      {featured.length > 0 && (
        <Section title="店家語音" tight>
          <p className="px-5 pb-2.5 text-[12.5px] leading-relaxed text-ink-3">
            這些是商家自己錄的內容，會置頂在「{featured[0] ? poiName(featured[0].poiId) : ""}
            」的語音清單最上面，每個景點最多兩則。
          </p>
          <div className="space-y-2 px-5">
            {featured.map((a) => (
              <AudioRowMini key={a.id} guide={a} onPlay={() => nav.playAudio(a.id)} />
            ))}
          </div>
        </Section>
      )}

      {reviews.length > 0 && (
        <Section
          title="評價"
          action="全部"
          onAction={() => nav.go({ k: "reviews", kind: "merchant", id: m.id })}
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

      <Section title="位置" tight>
        <div className="relative mx-5 h-[180px] overflow-hidden rounded-2xl">
          <MapView pins={[{ poi: pin }]} centre={[m.lat, m.lng]} zoom={16} />
          <MapCredit />
        </div>
      </Section>

      <Note>
        {PARTNER_RULE} 店家資訊、優惠與評價皆為 Demo 資料，由商家自行提供，ResoMap
        與本店無實際合作關係。
      </Note>
      <div className="h-24 shrink-0" />

      <ContactSheet
        name={m.name}
        contact={m.contact}
        open={contact}
        onClose={() => setContact(false)}
      />
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 border-b border-line py-3 last:border-0">
      <span className="w-6 shrink-0 text-center text-[15px]" aria-hidden>
        {icon}
      </span>
      <span className="w-[72px] shrink-0 text-[13px] text-ink-3">{label}</span>
      <span className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-ink">{value}</span>
    </div>
  );
}
