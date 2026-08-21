import { useMemo, useState } from "react";
import { poi } from "../data";
import { BY_DEST } from "../data/destinations";
import { AFFILIATE_DISCLOSURE, partner as partnerOf } from "../data/affiliatePartners";
import { nearbyCategory, type NearbyCat, type Range } from "../data/nearbyCategories";
import { MerchantCard, OfferCard, ProviderCard } from "../components/NearbyCards";
import { ContactSheet, DemoLinkSheet, type DemoLink } from "../components/Trade";
import { Empty, Note, Screen, Segmented, Sheet, TopBar } from "../components/ui";
import { WEIGHTS, nearbyMerchants, nearbyOffers, nearbyProviders, type NearbyContext } from "../lib/nearby";
import { tryAffiliate } from "../lib/contact";
import { openPlaceDirections } from "../lib/maps";
import { PARTNER_RULE } from "../data/subscriptionPlans";
import { useNav } from "../nav";
import type { Contact, MerchantCategory } from "../types";

/**
 * One category of what is nearby, ranked.
 *
 * The ordering is `lib/nearby.ts`'s and nobody else's, and this screen says so
 * out loud in a sheet behind 排序方式 — including the weight paid placement
 * carries. A ranked list that will not explain itself is indistinguishable from
 * an auction, and the difference matters most to exactly the people who cannot
 * see the code.
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
  const [range, setRange] = useState<Range>((initial as Range) ?? 5000);
  const [contact, setContact] = useState<{ name: string; c: Contact } | null>(null);
  const [demo, setDemo] = useState<DemoLink | null>(null);
  const [why, setWhy] = useState(false);

  const p = poi(poiId);
  const meta = nearbyCategory(cat);

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
  const offers = useMemo(
    () =>
      ctx && (cat === "aff-hotel" || cat === "aff-tour")
        ? nearbyOffers(ctx, cat === "aff-hotel" ? "hotel" : "tour")
        : [],
    [ctx, cat],
  );

  if (!p || !meta) return null;
  const total = merchants.length + providers.length + offers.length;

  return (
    <Screen>
      <TopBar
        title={meta.label}
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
            <button
              onClick={() => setWhy(true)}
              className="relative ml-auto shrink-0 text-[12.5px] font-semibold text-ink-3 after:absolute after:inset-x-0 after:-inset-y-[14px] after:content-['']"
            >
              排序方式 ›
            </button>
          </div>
        }
      />

      <p className="px-5 pb-1 text-[12.5px] leading-relaxed text-ink-3">
        以「{p.name}」為中心，{range / 1000} 公里內{total > 0 ? ` ${total} 筆` : ""}。
      </p>

      {total === 0 ? (
        <Empty
          icon={meta.icon}
          text={`這個範圍內還沒有${meta.label}。試試 10 公里。`}
          action={range === 5000 ? "改成 10 公里" : undefined}
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
              onDirections={() => openPlaceDirections(item)}
            />
          ))}

          {providers.map(({ item, metres }) => (
            <ProviderCard
              key={item.id}
              provider={item}
              metres={metres}
              onOpen={() => nav.go({ k: "provider", id: item.id })}
              onContact={() => setContact({ name: item.name, c: item.contact })}
            />
          ))}

          {offers.map(({ item, metres }) => (
            <OfferCard
              key={item.id}
              offer={item}
              metres={metres}
              onOpen={() => {
                /* Reads the record. A filled `affiliateUrl` genuinely opens;
                   an empty one — which is all of them today — explains. */
                if (!tryAffiliate(item)) {
                  setDemo({
                    title: item.name,
                    intent: `此處將前往 ${partnerOf(item.partner).name} 的商品頁完成預訂。`,
                    why: "ResoMap 目前與 Booking、Agoda、Klook、KKday 皆無合作關係，資料裡的 affiliateUrl 是空的。串上聯盟計畫之後，這顆按鈕會帶著 tracking id 直接開啟。",
                  });
                }
              }}
            />
          ))}
        </div>
      )}

      <Note>
        {meta.group === "partner"
          ? AFFILIATE_DISCLOSURE
          : `${PARTNER_RULE}距離由座標實際計算，價格與評價為 Demo 資料。`}
      </Note>
      <div className="h-24 shrink-0" />

      <ContactSheet
        name={contact?.name ?? ""}
        contact={contact?.c ?? {}}
        open={Boolean(contact)}
        onClose={() => setContact(null)}
      />
      <DemoLinkSheet link={demo} onClose={() => setDemo(null)} />

      {/* The working, shown. Every weight in this sheet is read straight off
          `WEIGHTS`, so it cannot describe a formula the app is not using. */}
      <Sheet open={why} onClose={() => setWhy(false)} title="這份清單怎麼排的">
        <div className="px-5 pb-5 pt-1">
          <p className="text-[13.5px] leading-relaxed text-ink-2">
            綜合排序，沒有 AI，也沒有隨機。同樣的輸入永遠得到同樣的順序。
          </p>
          <div className="mt-3 space-y-2">
            {[
              ["距離", WEIGHTS.distance, "越近分數越高，超出範圍直接不列入"],
              ["評價", WEIGHTS.rating, "以 4.0–5.0 這個區間換算"],
              ["付費曝光", WEIGHTS.paidExposure, "訂閱商家與專業會員，卡片上會標示"],
              ["通過審核", WEIGHTS.verified, "ResoMap 審核通過，這一項不能用買的"],
              ["相關度", WEIGHTS.relevance, "有沒有這個地點的內容、服務區域是否涵蓋"],
            ].map(([label, w, note]) => (
              <div key={label as string} className="rounded-2xl bg-surface p-3.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[14px] font-bold text-ink">{label as string}</span>
                  <span className="num ml-auto text-[13px] font-semibold text-ink-2">
                    {Math.round((w as number) * 100)}%
                  </span>
                </div>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-3">
                  {note as string}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] leading-relaxed text-ink-3">
            付費曝光的權重刻意壓在距離之下：付費可以讓一家店在同一條街上排前面，不能讓九公里外的店排在三百公尺外的店前面。
          </p>
        </div>
      </Sheet>
    </Screen>
  );
}

/** Which merchant category, if any, this list is about. */
const MERCHANT_CATS: Partial<Record<NearbyCat, MerchantCategory>> = {
  restaurant: "restaurant",
  hotel: "hotel",
  souvenir: "souvenir",
};
