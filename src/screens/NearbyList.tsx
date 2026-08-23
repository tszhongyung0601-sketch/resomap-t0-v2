import { useMemo, useState } from "react";
import { poi } from "../data";
import { BY_DEST } from "../data/destinations";
import { partner as partnerOf } from "../data/affiliatePartners";
import { nearbyCategory, type NearbyCat, type Range } from "../data/nearbyCategories";
import { MerchantCard, OfferCard, ProviderCard, RentalCard } from "../components/NearbyCards";
import { AddToTrip } from "../components/AddToTrip";
import {
  ContactSheet,
  DemoLinkSheet,
  InfoButton,
  InfoSheet,
  type DemoLink,
} from "../components/Trade";
import { SHORT_DISCLOSURE, type InfoTopic } from "../data/info";
import { Empty, Note, Screen, Segmented, TopBar } from "../components/ui";
import {
  getNearbyCountLabel,
  nearbyMerchants,
  nearbyOffers,
  nearbyProviders,
  nearbyRentals,
  type NearbyContext,
} from "../lib/nearby";
import { tryAffiliate } from "../lib/contact";
import { toggleOffer, useSaved } from "../lib/saved";
import { openPlaceDirections } from "../lib/maps";
import { focusTrip } from "../lib/trip";
import { useNav } from "../nav";
import type { Contact, MerchantCategory, StopRef } from "../types";

/**
 * One category of what is nearby, ranked.
 *
 * The ordering is `lib/nearby.ts`'s and nobody else's. The screen labels itself
 * 推薦排序 and puts two sentences behind an ⓘ — distance, rating, relevance, and
 * that paid placement exists and is always marked. The exact weights stayed in
 * the code and left the screen: a traveller choosing dinner does not need to be
 * told that distance is worth forty per cent, and printing it made the list read
 * like an auction house rather than a recommendation.
 *
 * The radius arrives on the route and stays adjustable here. Somebody who
 * widened the search to 10 km on the previous screen meant it; somebody who
 * lands on 包車司機 and finds one of them wants to widen it without going back.
 */
export function NearbyList({
  poiId,
  cat,
  range: initial,
}: {
  poiId: string;
  cat: NearbyCat;
  range?: number;
}) {
  const nav = useNav();
  const saved = useSaved();
  const [range, setRange] = useState<Range>((initial as Range) ?? 5000);
  const [contact, setContact] = useState<{ name: string; c: Contact } | null>(null);
  const [demo, setDemo] = useState<DemoLink | null>(null);
  const [info, setInfo] = useState<InfoTopic | null>(null);
  const [adding, setAdding] = useState<StopRef | null>(null);

  const p = poi(poiId);
  const meta = nearbyCategory(cat);
  /* The same rule every other add path uses, so 加入行程 here and 加入行程 in
     the library never disagree about which trip they mean. */
  const trip = focusTrip(nav.trips) ?? null;

  const ctx: NearbyContext | null = useMemo(() => {
    if (!p) return null;
    return {
      at: { lat: p.lat, lng: p.lng },
      destId: p.destId,
      destName: BY_DEST[p.destId]?.name ?? "",
      poiArea: p.area,
      radiusM: range,
    };
  }, [p, range]);

  const merchants = useMemo(
    () =>
      ctx && MERCHANT_CATS[cat] ? nearbyMerchants(ctx, MERCHANT_CATS[cat]!) : [],
    [ctx, cat],
  );
  const providers = useMemo(
    () =>
      ctx && (cat === "driver" || cat === "guide")
        ? nearbyProviders(ctx, cat === "driver" ? "driver" : "guide")
        : [],
    [ctx, cat],
  );
  const rentals = useMemo(() => (ctx && cat === "rental" ? nearbyRentals(ctx) : []), [ctx, cat]);
  const offers = useMemo(
    () =>
      ctx && (cat === "aff-hotel" || cat === "aff-tour")
        ? nearbyOffers(ctx, cat === "aff-hotel" ? "hotel" : "tour")
        : [],
    [ctx, cat],
  );

  if (!p || !meta) return null;
  const total = merchants.length + providers.length + offers.length + rentals.length;
  /* ResoMap's merchant and provider supply is Taiwan-only today. Saying so is
     more useful than an empty list that looks like a loading failure. */
  const overseas = BY_DEST[p.destId]?.country !== "tw";

  return (
    <Screen>
      <TopBar
        title={meta.title}
        onBack={() => nav.back()}
        below={
          <div className="flex items-center gap-2 px-5 pb-3">
            <Segmented<string>
              items={[
                { id: "5000", label: "5 公里內" },
                { id: "10000", label: "10 公里內" },
              ]}
              value={String(range)}
              onChange={(v) => setRange(Number(v) as Range)}
            />
            <span className="ml-auto">
              <InfoButton topic="ranking" label="推薦排序" onOpen={setInfo} />
            </span>
          </div>
        }
      />

      <p className="px-5 pb-1 text-[12.5px] leading-relaxed text-ink-3">
        {p.name} {range / 1000} 公里內
        {total > 0 ? `，${getNearbyCountLabel(cat, total)}` : ""}
      </p>

      {total === 0 ? (
        /* Two different empty states, because they are two different facts.
           Inside Taiwan the supply exists and simply is not on this street, so
           the offer is to look further. Overseas there is no ResoMap supply at
           all yet, and pretending a wider radius would find some would send
           somebody looking for nothing. */
        <Empty
          icon={meta.emoji}
          text={
            overseas
              ? `ResoMap 的${meta.title}目前只在台灣。這個城市的內容還在準備。`
              : range === 5000
                ? `${p.name} 5 公里內還沒有${meta.title}。`
                : `${p.name} 10 公里內還沒有${meta.title}。`
          }
          action={!overseas && range === 5000 ? "看 10 公里內" : undefined}
          onAction={() => setRange(10000)}
        />
      ) : (
        <div className="mt-2 space-y-3 px-5">
          {merchants.map(({ item, metres }) => (
            <MerchantCard
              key={item.id}
              merchant={item}
              metres={metres}
              hasAudio={Boolean(item.featuredAudioIds?.length)}
              onOpen={() => nav.go({ k: "merchant", id: item.id })}
              onContact={() => setContact({ name: item.name, c: item.contact })}
              onDirections={() => openPlaceDirections(item)}
            />
          ))}

          {providers.map(({ item, metres }, i) => (
            <ProviderCard
              key={item.id}
              provider={item}
              metres={metres}
              first={i === 0 && merchants.length === 0}
              onOpen={() => nav.go({ k: "provider", id: item.id })}
              onContact={() => setContact({ name: item.name, c: item.contact })}
              /* Nobody has a booking link yet, so the button reads the field and
                 explains rather than doing nothing. Same behaviour the detail
                 page has always had — the card just reaches it one tap sooner. */
              onBook={() =>
                setDemo({
                  title: item.name,
                  intent: "此處將開啟線上預約表單，送出後由服務者確認。",
                  why: "這位服務者的預約連結尚未設定。",
                })
              }
            />
          ))}

          {rentals.map(({ item, metres }) => (
            <RentalCard
              key={item.id}
              rental={item}
              metres={metres}
              onOpen={() => nav.go({ k: "rental", id: item.id })}
              onAdd={() => setAdding({ kind: "rental", rentalId: item.id })}
              onDirections={() =>
                openPlaceDirections({
                  name: `${item.brand} ${item.pickup}`,
                  area: item.area,
                  lat: item.lat,
                  lng: item.lng,
                })
              }
            />
          ))}

          {offers.map(({ item, metres }) => (
            <OfferCard
              key={item.id}
              offer={item}
              metres={metres}
              saved={saved.offers.includes(item.id)}
              onOpen={() => nav.go({ k: "offer", id: item.id })}
              onSave={() => toggleOffer(item.id)}
              onGo={() => {
                /* Reads the record. A filled `affiliateUrl` genuinely opens;
                   an empty one — which is all of them today — explains. */
                if (!tryAffiliate(item)) {
                  setDemo({
                    title: item.name,
                    intent: `此處將前往 ${partnerOf(item.partner).name} 的商品頁完成預訂。`,
                    why: "合作平台的預訂連結尚未開通。",
                  });
                }
              }}
            />
          ))}
        </div>
      )}

      <Note>
        {meta.source === "partner" ? SHORT_DISCLOSURE.partner : SHORT_DISCLOSURE.resomap}
      </Note>
      <div className="h-24 shrink-0" />

      <ContactSheet
        name={contact?.name ?? ""}
        contact={contact?.c ?? {}}
        open={Boolean(contact)}
        onClose={() => setContact(null)}
      />
      <DemoLinkSheet link={demo} onClose={() => setDemo(null)} />

      <InfoSheet topic={info} onClose={() => setInfo(null)} />

      {/* The same day picker the library card and the place page use. A hire
          car counter is a stop like any other once it is in the day. */}
      {adding && trip && trip.days.length > 0 && (
        <AddToTrip target={adding} trip={trip} onClose={() => setAdding(null)} />
      )}

    </Screen>
  );
}

/** Which merchant category, if any, this list is about. */
const MERCHANT_CATS: Partial<Record<NearbyCat, MerchantCategory>> = {
  restaurant: "restaurant",
  hotel: "hotel",
  souvenir: "souvenir",
};
