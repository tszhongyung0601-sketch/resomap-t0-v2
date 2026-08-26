import { BrandBar } from "../components/BrandBar";
import { Note, Row, Screen, Section } from "../components/ui";
import { PartnerBadge } from "../components/Trade";
import { PARTNERS } from "../data/affiliatePartners";
import { AFFILIATE_OFFERS } from "../data/affiliateOffers";
import { CAR_RENTALS, RENTAL_DISCLOSURE } from "../data/carRentals";
import { MERCHANTS } from "../data/merchants";
import { PROVIDERS } from "../data/providers";
import { isVerifiedPartner } from "../lib/nearby";
import { useNav } from "../nav";
import type { MerchantCategory } from "../types";

/**
 * 更多優惠 — everything bookable, grouped by whose it is.
 *
 * The fourth tab. It replaced 一起規劃, which did not disappear: planning with
 * other people is something you do to a trip, so it moved next to the trip. What
 * took the slot was the half of this product that had no home at all — sixty-eight
 * merchants, forty-two drivers and guides, five affiliate platforms and
 * twenty-two hire counters, reachable only by scrolling to the bottom of the home
 * screen and tapping one of nine small icons.
 *
 * **Grouped by source before category, and that is the whole design.** These two
 * groups are not the same kind of thing and a traveller has a right to know
 * which they are reading. ResoMap's own merchants are reviewed, can earn the
 * 推薦夥伴 mark, and are the supply this company is responsible for. The
 * platforms are somebody else's inventory that ResoMap has no agreement with,
 * whose every `affiliateUrl` is empty. Sorting them together by category —
 * 住宿 next to 住宿 — would have merged those two facts into one list and quietly
 * borrowed the credibility of the reviewed half for the other.
 *
 * Nothing here is new. Every number on this screen is counted from data that
 * already shipped, and every row opens a screen that already existed.
 */
export function DealsHub() {
  const nav = useNav();

  const merchantsBy = (c: MerchantCategory) =>
    MERCHANTS.filter((m) => m.category === c && m.reviewStatus !== "rejected").length;
  const verified = MERCHANTS.filter(isVerifiedPartner).length;
  const drivers = PROVIDERS.filter((p) => p.kind === "driver").length;
  const guides = PROVIDERS.filter((p) => p.kind === "guide").length;

  const offersBy = (k: "hotel" | "tour") => AFFILIATE_OFFERS.filter((o) => o.kind === k).length;

  return (
    <Screen>
      <BrandBar title="更多優惠" />

      {/* ------------------------------------------------ ResoMap's own supply */}
      <Section title="ResoMap 合作商家" tight>
        {/* The badge on its own line rather than mid-sentence: inline, it broke
           the paragraph across it and left 「要付費」 stranded at the end of a
           line from 「並通過審核」. */}
        <p className="px-5 pb-2 text-[12.5px] leading-relaxed text-ink-3">
          ResoMap 自己收的商家與服務者，經過審核。
        </p>
        <p className="flex flex-wrap items-center gap-1.5 px-5 pb-3 text-[12.5px] leading-relaxed text-ink-3">
          <PartnerBadge short />
          <span>要付費並通過審核，兩個都要——付費本身不夠。</span>
        </p>

        {/* Counts, not links.

            These five were rows a moment ago, and every one of them opened the
            優惠 screen — which lists deals, not merchants. There is no global
            merchant browser in this app and inventing five buttons that land
            somewhere unrelated would be the dead control this project keeps
            deleting. The way in is genuinely from a place, because the ranking
            is by distance from where you are standing, and the line below says
            exactly that instead of pretending otherwise. */}
        <div className="grid grid-cols-3 gap-2 px-5">
          <Stat label="餐廳" value={merchantsBy("restaurant")} unit="家" />
          <Stat label="伴手禮" value={merchantsBy("souvenir")} unit="家" />
          <Stat label="住宿" value={merchantsBy("hotel")} unit="間" />
          <Stat label="包車司機" value={drivers} unit="位" />
          <Stat label="私人導遊" value={guides} unit="位" />
          <Stat label="推薦夥伴" value={verified} unit="家" />
        </div>

        <p className="px-5 pt-3 text-[12.5px] leading-relaxed text-ink-3">
          {MERCHANTS.length} 家商家裡有 {verified} 家掛著推薦夥伴標章。
          要看它們，從任何一個景點的「探索附近」進去——那份清單依你站的位置
          由近到遠排，所以它需要先知道你在哪裡。
        </p>

        <div className="px-5 pt-3">
          <Row
            icon="🏪"
            label="在地優惠"
            value="商家自己給的折扣"
            onClick={() => nav.go({ k: "deals", tab: "reco" })}
          />
        </div>
      </Section>

      {/* ------------------------------------------------------ somebody else's */}
      <Section title="聯盟合作平台" tight>
        <p className="px-5 pb-3 text-[12.5px] leading-relaxed text-ink-3">
          {PARTNERS.map((x) => x.name).join("・")}。
          這些是別人的庫存，ResoMap 目前與各平台都沒有合作關係，
          所有導購連結都是空的——按下去會說明串接之後會發生什麼。
        </p>

        <Row icon="🎟️" label="門票・體驗" value="Klook / KKday" onClick={() => nav.go({ k: "tickets" })} />
        <Row icon="🏨" label="住宿" value={`${offersBy("hotel")} 間・Booking / Agoda`} onClick={() => nav.go({ k: "stay" })} />
        <Row icon="🚄" label="交通" value="高鐵 / 台鐵 / 機場交通" onClick={() => nav.go({ k: "transport" })} />
        <Row icon="✈️" label="機票" value="比價後前往訂票平台" onClick={() => nav.go({ k: "service", id: "flight" })} />
        <Row icon="🎫" label="一日遊・體驗" value={`${offersBy("tour")} 個行程`} onClick={() => nav.go({ k: "deals", tab: "ticket" })} />
        <Row icon="📶" label="eSIM" value="落地即可上網" onClick={() => nav.go({ k: "service", id: "esim" })} />
        <Row icon="🛡️" label="旅平險" value="單次投保" onClick={() => nav.go({ k: "service", id: "insurance" })} />
      </Section>

      {/* ------------------------------------------------------------- rentals */}
      <Section title="租車" tight>
        <p className="px-5 pb-3 text-[12.5px] leading-relaxed text-ink-3">
          真的公司、真的據點、真的座標，而且 ResoMap 跟它們每一家都沒有關係——
          所以每一張卡上都寫著「{RENTAL_DISCLOSURE}」。
        </p>
        <Row
          icon="🚗"
          label="租車・接送"
          value={`${CAR_RENTALS.length} 個據點`}
          onClick={() => nav.go({ k: "carrental" })}
        />
      </Section>

      <Section title="其他" tight>

        <Row icon="🏷️" label="我的折扣碼" onClick={() => nav.go({ k: "coupons" })} />
        <Row icon="👑" label="訂閱方案" onClick={() => nav.go({ k: "subscribe" })} />
      </Section>

      <Note>
        價格與供應狀況皆為 Demo 示意資料，非即時報價。ResoMap
        目前與 Klook、KKday、Booking、Agoda、Trip.com 及各租車業者皆無合作關係。
      </Note>

      <div className="h-24 shrink-0" />
    </Screen>
  );
}

/** A number and what it counts. Not tappable, because there is nowhere to go. */
function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2.5">
      <div className="text-[11.5px] text-ink-3">{label}</div>
      <div className="num mt-0.5 text-[15px] font-bold text-ink">
        {value} <span className="text-[12px] font-semibold text-ink-3">{unit}</span>
      </div>
    </div>
  );
}
