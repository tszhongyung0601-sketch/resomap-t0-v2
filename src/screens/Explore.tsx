import { poi } from "../data";
import { BrandBar } from "../components/BrandBar";
import { MapHome } from "./MapHome";
import { PoiImage } from "../components/Cover";
import { Button, Card, Headphones, Screen, Tag } from "../components/ui";
import { toggleStory, useSaved } from "../lib/saved";
import { nearbyStoryRail, playLabel, rating } from "../lib/story";
import { distance } from "../lib/geo";
import { useHere } from "../lib/here";
import { focusTrip } from "../lib/trip";
import { useI18n } from "../i18n";
import { useNav, type Route } from "../nav";
import type { Story, Trip } from "../types";

/**
 * Home. The map leads, and everything else scrolls past it.
 *
 * The old version opened with a headline, a grey search button and two grey
 * buttons — four rows of chrome before anything about a place. What it is now
 * is the boss's own mock-up: the orange bar, the island full of pins, a search
 * field sitting on the map's lower edge, and then the two things a traveller
 * actually came back for — what there is to listen to, and the trip they are on.
 *
 * The map is a block, not a screen. It is ~380px tall and the page keeps
 * scrolling underneath it, which is the difference between "the map leads" and
 * "the app is a map".
 *
 * Orange budget: the BrandBar is brand rather than action, and the single
 * filled orange button belongs to the trip card. Nothing else on this screen is
 * allowed to be orange — which is why the preview buttons in the guide rail are
 * grey, and why 看全部導覽 is a card and not a CTA.
 */
export function Explore({ trips }: { trips: Trip[] }) {
  const trip = focusTrip(trips);

  return (
    <Screen>
      <BrandBar />
      {/* Where I am, and what is worth walking to. It replaced the island /
          trip-stops view: both of those were about somewhere else, and the first
          thing a traveller opening a travel app wants is here. Everything below
          this line is untouched. */}
      <MapHome />
      {/* Guides first, then the trip. The map answers「去哪」and the rail answers
          「有什麼好聽的」— both are about the place. The trip card is about you,
          and it reads better as the answer to those two than as their preface. */}
      <GuideRail destId={trip?.destId} />
      {trip ? <NextTrip trip={trip} /> : <NoTrip />}
      <ServiceGrid />
      {/* shrink-0 or it collapses: Screen is a flex column, and a spacer with no
          content is the first thing flexbox takes back when the page overflows. */}
      <div className="h-24 shrink-0" />
    </Screen>
  );
}

/* ------------------------------------------------- 1 · the map, and search */

/** Distinct places on the itinerary — a lunch spot visited twice is one place. */
const tripPois = (trip: Trip): string[] => [
  ...new Set(trip.days.flatMap((d) => d.tracks.flatMap((t) => t.stops)).map((s) => s.poiId)),
];

/* The map block moved to screens/MapHome.tsx when it stopped being a picture of
   somewhere else and became a picture of where you are. The island anchors, the
   看全台 chip and the two-tone pin legend went with the old behaviour — the new
   map has one kind of pin, so it needs no key. */

/* ---------------------------------------------------------- 2 · the guides */

/**
 * Places worth listening to, this trip's city first.
 *
 * The ordering is `storyRail`'s, which 導覽庫 calls too — a guide that is third
 * here and eleventh there would be two different answers to the same question.
 *
 * `Tag kind="demo"` sits once, on the section title. `plays` and `likes` are
 * invented and `rating` is derived from them, so the disclosure belongs to the
 * block that shows them; repeating it on all fifteen cards turns a disclosure
 * into wallpaper and stops anybody reading it.
 */
function GuideRail({ destId }: { destId?: string }) {
  const nav = useNav();
  const { t } = useI18n();
  /* The same position the map above is drawing, from the same store — so
     pressing 定位 re-sorts this rail as well as moving the blue dot. */
  const fix = useHere();
  const rail = nearbyStoryRail(fix.at, destId);
  const nearest = poi(rail[0]?.poiId ?? "");
  const isNear = nearest ? distance(fix.at, nearest) <= 12000 : false;
  if (!rail.length) return null;

  return (
    <section className="mt-7">
      <div className="flex items-center gap-1.5 px-5 text-ink">
        <Headphones size={15} />
        <h2 className="text-[17px] font-bold">{t("有故事的地方")}</h2>
        <Tag kind="demo" />
      </div>
      <p className="mb-3 mt-1 px-5 text-[12.5px] text-ink-3">
        {/* Says which question the order is answering. Without it a rail that
            silently reorders when somebody presses 定位 looks like a bug. */}
        {isNear
          ? `${t("從近到遠。")}${t("語音導覽免費，可以先試聽 30 秒。")}`
          : t("語音導覽免費，可以先試聽 30 秒。")}
      </p>

      <div className="snap-rail flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
        {rail.map((s) => (
          <GuideCard key={s.id} story={s} />
        ))}

        {/* The end of the rail, not a heading action. Somebody who has scrolled
            fifteen cards is the person asking for the rest of them. */}
        <button
          onClick={() => nav.tab("library")}
          className="flex w-[112px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-surface px-3 text-[13.5px] font-bold text-ink-2 active:bg-surface-2"
        >
          <span>{t("看全部導覽")}</span>
          <span className="text-[16px]" aria-hidden>
            ›
          </span>
        </button>
      </div>
    </section>
  );
}

/**
 * One guide.
 *
 * Two targets rather than one: the card opens the place, the pill plays the 30
 * 秒 edit without leaving home — the whole point of a short cut is that you can
 * hear it while deciding. They are siblings rather than nested, because a
 * button inside a button is invalid markup and behaves differently in every
 * browser.
 *
 * No price, ever. The guides are free, and a card that shows a figure teaches
 * the opposite in one glance.
 */
function GuideCard({ story }: { story: Story }) {
  const nav = useNav();
  const { t, placeName } = useI18n();
  const p = poi(story.poiId);
  const saved = useSaved().stories.includes(story.id);

  return (
    <div className="w-[184px] shrink-0">
      {/* The heart sits over the cover but outside the card button: a button
          inside a button is invalid markup and behaves differently in every
          browser. Absolute positioning is what lets them overlap while staying
          siblings. */}
      <div className="relative">
        <button onClick={() => nav.go({ k: "poi", id: story.poiId })} className="w-full text-left">
          <PoiImage poi={p} height={112} radius={16} className="w-full" />
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            <Headphones size={10} />
            <span className="num">{story.minutes} 分鐘</span>
          </span>
        </button>

        <button
          onClick={() => toggleStory(story.id)}
          aria-label={saved ? "取消收藏" : "收藏"}
          aria-pressed={saved}
          className="absolute right-1 top-1 grid size-11 place-items-center text-[19px] drop-shadow-[0_1px_3px_rgba(0,0,0,.5)]"
        >
          {/* U+2665 without U+FE0F: with the selector the filled heart renders in
              emoji presentation, at its own size and colour, so the two states
              came out different sizes and the toggle read as a glitch. */}
          <span className={saved ? "text-brand" : "text-white"}>{saved ? "♥" : "♡"}</span>
        </button>
      </div>

      <button onClick={() => nav.go({ k: "poi", id: story.poiId })} className="w-full text-left">
        <div className="mt-2 truncate text-[14.5px] font-bold text-ink">
          {placeName(p.id, p.name)}
        </div>
        <div className="truncate text-[12.5px] text-ink-3">{story.hook}</div>

        {/* The rating is `likes / plays`, and both of its inputs are printed
            next to it — a reader who doubts the 4.7 can check the arithmetic
            rather than take it on faith. */}
        <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-ink-3">
          <span className="num font-semibold text-ink-2">★ {rating(story).toFixed(1)}</span>
          <span aria-hidden>·</span>
          <span className="num">{playLabel(story.plays)}</span>
        </div>
      </button>

      <button
        onClick={() => nav.play(story.poiId, "short")}
        className="mt-2 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-surface text-[13px] font-bold text-ink active:bg-surface-2"
      >
        <PlayIcon />
        {t("試聽 30 秒")}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------ 3 · the trip */

function when(trip: Trip): string {
  if (trip.phase === "ongoing") return `今天是第 ${trip.today} 天`;
  if (trip.daysUntil === undefined) return trip.dates;
  if (trip.daysUntil === 0) return "今天出發";
  if (trip.daysUntil === 1) return "明天出發";
  return `還有 ${trip.daysUntil} 天出發`;
}

function NextTrip({ trip }: { trip: Trip }) {
  const nav = useNav();
  const { t } = useI18n();
  /* Only an ongoing trip has a "today" to start. `today` is a required field, so
     every planned trip carries a 1 and the button typechecked happily — the
     demo opens with no ongoing trip at all, which put 開始今天行程 on a trip
     leaving in two days, directly under the line saying so. */
  const started = trip.phase === "ongoing";
  const places = tripPois(trip);
  const withStory = places.filter((id) => poi(id).storyId).length;
  const day1 = trip.days.find((d) => d.n === 1) ?? trip.days[0];
  const first = (day1?.tracks.flatMap((t) => t.stops) ?? []).slice(0, 4);

  return (
    <div className="mt-7 px-5">
      <Card className="p-4">
        {/* A trip you are on day 2 of is not your "next" trip. The eyebrow read
            推薦行程 directly above 今天是第 2 天, which is the card
            contradicting itself — reachable the moment the demo starts the
            Tainan trip, since focusTrip prefers an ongoing one. */}
        <div className="text-[12.5px] font-semibold text-ink-3">
          {started ? t("行程進行中") : t("推薦行程")}
        </div>
        <div className="mt-1 truncate text-[20px] font-bold leading-tight text-ink">
          {trip.title}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] text-ink-3">
          <span className="num">{when(trip)}</span>
          <span aria-hidden>·</span>
          <span className="num">{places.length} 個景點</span>
          {withStory > 0 && (
            <>
              <span aria-hidden>·</span>
              <span className="num inline-flex items-center gap-1">
                <Headphones size={11} />
                {withStory} 個有語音故事
              </span>
            </>
          )}
        </div>

        {/* PoiImage, not Cover. Cover only ever draws the generated graphic, so
            this strip was the one place on the screen that would keep drawing
            the stand-in after a real photograph landed in the manifest — the
            same place rendering as a photo in the story rail and as a poster
            here, two sections apart. */}
        {first.length > 0 && (
          <div className="mt-3.5 flex gap-2">
            {first.map((s) => (
              <PoiImage
                key={s.id}
                poi={poi(s.poiId)}
                height={56}
                radius={12}
                emoji={false}
                className="flex-1"
              />
            ))}
          </div>
        )}

        {/* The one filled orange button on the screen. The BrandBar above is a
            field, not a control, and nothing in the guide rail is orange, so
            this is the only thing on the page asking to be pressed. */}
        <div className="mt-4">
          {started ? (
            /* Today Mode, not the day timetable. 開始今天行程 sent the traveller
               to the full DayPlan — which is what 完整行程 is for — and left
               screens/Today.tsx unreachable: nothing in the app navigated to
               { k: "today" } at all. The screen exists, App renders it, and this
               is its one door. */
            <Button onClick={() => nav.go({ k: "today", tripId: trip.id })}>
              開始今天行程
            </Button>
          ) : (
            <Button onClick={() => nav.go({ k: "trip", id: trip.id })}>查看完整行程</Button>
          )}
        </div>
        {started && (
          <div className="mt-1">
            <Button variant="ghost" onClick={() => nav.go({ k: "trip", id: trip.id })}>
              查看完整行程
            </Button>
          </div>
        )}
      </Card>

    </div>
  );
}

/* -------------------------------------------------------- 4 · 旅程服務宮格 */

/**
 * The nine services, as a grid.
 *
 * This is MODEL A stated plainly (see BusinessDemo.tsx): everybody who opens the
 * app sees the same nine doors, regardless of where they are going. So it renders
 * with or without a trip — scoping it to a trip would make it MODEL B, which is
 * what the deal cards inside a trip already are.
 *
 * The tints are deliberately not nine orange discs. The orange BrandBar is at the
 * top of this page and 開始今天行程 is its one filled orange call to action; nine
 * saturated circles here would be nine adverts arguing with it. Each category gets
 * a pale wash instead, which separates them without any of them shouting.
 */
const SERVICES: { label: string; icon: string; tint: string; go: Route }[] = [
  { label: "門票・體驗", icon: "🎟", tint: "bg-brand-wash", go: { k: "tickets" } },
  { label: "住宿", icon: "🏨", tint: "bg-surface-2", go: { k: "stay" } },
  { label: "交通", icon: "🚆", tint: "bg-surface-2", go: { k: "transport" } },
  { label: "租車・接送", icon: "🚗", tint: "bg-surface-2", go: { k: "carrental" } },
  /* 機票 has no inventory of its own — dealsForService("flight") returns nothing
     on purpose. It goes to 交通, which really does hold 高鐵 and 台鐵, rather than
     to an empty screen or a 即將推出 stamp on a tile nobody can use. */
  { label: "機票", icon: "✈️", tint: "bg-surface-2", go: { k: "transport" } },
  { label: "eSIM", icon: "📶", tint: "bg-surface-2", go: { k: "service", id: "esim" } },
  { label: "旅平險", icon: "🛡️", tint: "bg-surface-2", go: { k: "service", id: "insurance" } },
  /* 在地優惠 lands on 更多, which is where the local-merchant deals actually are.
     Those four are all comingLater, so the tile leads to a real state rather than
     a real product — which is the honest version, not an empty door. */
  { label: "在地優惠", icon: "🏪", tint: "bg-surface-2", go: { k: "deals", tab: "more" } },
  /* 更多優惠 goes to the coupon page, which is what a traveller means by it;
     在地優惠 above still opens the six-tab deals screen on its 更多 tab. */
  { label: "更多優惠", icon: "％", tint: "bg-brand-wash", go: { k: "coupons" } },
];

function ServiceGrid() {
  const nav = useNav();
  const { t } = useI18n();
  return (
    <section className="mt-8">
      {/* 旅程服務, not 你的旅行還缺什麼. The heading names the shelf; it does not
          count what the traveller has failed to book. */}
      <h2 className="px-5 text-[17px] font-bold text-ink">{t("旅程服務")}</h2>
      <p className="mt-1 px-5 text-[12.5px] leading-relaxed text-ink-3">
        {t("門票、住宿、交通，需要的時候從這裡出發。")}
      </p>

      {/* Five then four. grid-cols-5 with the last row left-aligned reads as an
          unfinished row, so the ninth tile is given its own centred slot by
          spanning the middle column. */}
      <div className="mt-4 grid grid-cols-5 gap-x-1 gap-y-4 px-3">
        {SERVICES.map((sv, i) => (
          <button
            key={sv.label}
            onClick={() => nav.go(sv.go)}
            /* min-h-[76px] and a 46px disc put the whole tile past 44px without
               an ::after, because here the tile *is* the target, not a pill
               sitting inside a bigger row. */
            className={`flex min-h-[76px] flex-col items-center gap-1.5 rounded-xl px-0.5 py-1 transition active:bg-surface ${
              i === 8 ? "col-start-3" : ""
            }`}
          >
            <span
              className={`grid size-[46px] shrink-0 place-items-center rounded-full text-[20px] ${sv.tint}`}
              aria-hidden
            >
              {sv.icon}
            </span>
            <span className="text-center text-[11.5px] font-semibold leading-tight text-ink-2">
              {t(sv.label)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * No trip, and no sales pitch about it. One row that says what the empty space
 * means and opens the planner — not a list of what the traveller has not booked
 * yet.
 */
function NoTrip() {
  const nav = useNav();
  return (
    <div className="mt-7 px-5">
      <Card onClick={() => nav.go({ k: "create" })} className="flex items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold text-ink">還沒有旅程</div>
          <div className="mt-0.5 text-[13px] text-ink-3">讓 AI 幫你排一趟</div>
        </div>
        <span className="shrink-0 text-[15px] text-ink-3">›</span>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ icons */


function PlayIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M3 1.6 10 6l-7 4.4z" />
    </svg>
  );
}
