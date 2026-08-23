import { useState } from "react";
import { affiliateOffer } from "../data/affiliateOffers";
import { partner as partnerOf } from "../data/affiliatePartners";
import { BY_DEST } from "../data/destinations";
import { RecordPhoto, RecordPhotoCredit } from "../components/Cover";
import { MapCredit, MapView } from "../components/MapView";
import { AffiliateBadge, DemoLinkSheet, InfoButton, InfoSheet, Stars } from "../components/Trade";
import { SHORT_DISCLOSURE, type InfoTopic } from "../data/info";
import { Button, Note, Screen, Section } from "../components/ui";
import { tryAffiliate } from "../lib/contact";
import { openPlaceDirections } from "../lib/maps";
import { isOfferSaved, toggleOffer, useSaved } from "../lib/saved";
import { useNav } from "../nav";

/**
 * One listing on somebody else's platform, in full.
 *
 * Shops and drivers had a page and hotels and tours did not, which meant the
 * only thing a traveller could do with a Klook listing was leave the app — and
 * the only thing they could do with a card they were not ready to book was
 * forget about it. Both of those were the missing page rather than a decision.
 *
 * What this page will not do is dress up somebody else's product as ours. The
 * price, the score and the scale are the platform's own figures and are labelled
 * as such; Booking and Agoda publish out of ten, so the score says so instead of
 * being rescaled into stars that would read as better than they are.
 *
 * `affiliateUrl` is empty for every listing in the demo, and the button reads
 * the field rather than pretending: filled, it opens; empty, it explains what
 * would happen. Signing a programme is then a data change, not a code change.
 */
export function Offer({ id }: { id: string }) {
  const nav = useNav();
  const saved = useSaved();
  const [info, setInfo] = useState<InfoTopic | null>(null);
  const [demo, setDemo] = useState<{ title: string; intent: string; why: string } | null>(null);
  const o = affiliateOffer(id);

  if (!o) return null;
  const brand = partnerOf(o.partner);
  const city = BY_DEST[o.destId]?.name;
  const kept = isOfferSaved(o.id);
  void saved;

  function go() {
    if (!o) return;
    if (!tryAffiliate(o)) {
      setDemo({
        title: o.name,
        intent: `此處將前往 ${brand.name} 的商品頁完成預訂。`,
        why: "合作平台的預訂連結尚未開通。",
      });
    }
  }

  return (
    <Screen>
      <div className="relative shrink-0">
        <RecordPhoto
          record={o}
          fallbackId={o.id}
          fallbackKind={o.kind === "hotel" ? "stay" : "activity"}
          emoji={o.emoji}
          height={200}
          radius={0}
          size="hero"
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
          {o.kind === "hotel" ? "住宿" : "一日遊・體驗"}
        </span>
      </div>

      <RecordPhotoCredit record={o} />

      <div className="px-5 pb-1 pt-4">
        <h1 className="text-[21px] font-bold leading-snug text-ink">{o.name}</h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Stars rating={o.rating} scale={o.ratingScale} />
          <span className="text-[12.5px] text-ink-3">
            {city ? `${city} · ` : ""}
            {brand.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-5 pt-3">
        <Fact label="價格" value={`NT$ ${o.priceTwd.toLocaleString()} 起`} />
        <Fact label="計價單位" value={`/ ${o.priceUnit}`} />
        <Fact label="出團平台" value={brand.name} />
      </div>

      <p className="px-5 pt-4 text-[14px] leading-relaxed text-ink-2">{o.blurb}</p>

      <Section title="這筆訂單發生在哪裡" tight>
        <div className="px-5">
          {/* The traveller books on the platform, not here. Saying so on the
              page is the difference between a listing and a pretend checkout. */}
          <p className="text-[13.5px] leading-relaxed text-ink-2">
            預訂、付款與退改都在 {brand.name} 完成，ResoMap 不經手金流，也不持有訂單。
          </p>
          <div className="mt-2 flex items-center gap-2">
            <AffiliateBadge partner={brand.name} />
            <InfoButton topic="affiliate" label="合作說明" onOpen={setInfo} />
          </div>
        </div>
      </Section>

      <Section title="位置" tight>
        <div className="relative mx-5 h-44 overflow-hidden rounded-2xl">
          <MapView
            pins={[
              {
                /* An offer is not a POI, and now it no longer has to pretend
                   to be one to get a pin drawn. */
                poi: {
                  id: o.id,
                  name: o.name,
                  area: city ?? "",
                  lat: o.lat,
                  lng: o.lng,
                  emoji: o.emoji,
                  tint: o.tint,
                },
              },
            ]}
            centre={[o.lat, o.lng]}
            zoom={15}
          />
        </div>
        <MapCredit />
        <div className="px-5 pt-2">
          <Button
            variant="secondary"
            onClick={() =>
              openPlaceDirections({ name: o.name, area: city ?? "", lat: o.lat, lng: o.lng })
            }
          >
            導航前往
          </Button>
        </div>
      </Section>

      <Note>{SHORT_DISCLOSURE.partner}</Note>
      <div className="h-28 shrink-0" />

      {/* One filled button on the page, and it is the one that leaves for the
          platform. 收藏 sits beside it as an outline: keeping something is not
          the action this screen is for. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex gap-2 bg-gradient-to-t from-bg via-bg to-transparent px-5 pb-5 pt-6">
        <button
          onClick={() => toggleOffer(o.id)}
          className="pointer-events-auto inline-flex h-13 shrink-0 items-center justify-center rounded-full bg-surface px-5 text-[15px] font-bold text-ink transition active:bg-surface-2"
        >
          {kept ? "已收藏" : "收藏"}
        </button>
        <div className="pointer-events-auto min-w-0 flex-1">
          <Button onClick={go}>前往 {brand.name}</Button>
        </div>
      </div>

      <DemoLinkSheet link={demo} onClose={() => setDemo(null)} />
      <InfoSheet topic={info} onClose={() => setInfo(null)} />
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface px-3 py-2">
      <div className="truncate text-[11px] text-ink-3">{label}</div>
      <div className="num mt-0.5 break-words text-[13.5px] font-bold leading-tight text-ink">
        {value}
      </div>
    </div>
  );
}
