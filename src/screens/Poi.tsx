import { useEffect, useMemo, useState } from "react";
import { AFFILIATE_DISCLOSURE, POIS, dealsForPoi, poi } from "../data";
import { story } from "../data/stories";
import { AiSceneNote, PhotoCredit, PoiImage } from "../components/Cover";
import { sceneFor } from "../data/imagePrompts";
import { DealCard } from "../components/DealCard";
import { AudioRowMini } from "../components/AudioRow";
import { audiosFor, featuredAudiosFor } from "../lib/audio";
import { Button, Headphones, Note, Screen, Section, StoryBadge } from "../components/ui";
import { distance, km } from "../lib/geo";
import { dur } from "../lib/adapt";
import { openDirections } from "../lib/maps";
import { track } from "../lib/track";
import { togglePoi, useSaved } from "../lib/saved";
import { useI18n } from "../i18n";
import { useNav } from "../nav";
import { POI_KIND_LABELS, type Story } from "../types";
import { AddToTrip } from "../components/AddToTrip";

const THIS_YEAR = new Date().getFullYear();

/**
 * How far 附近 is allowed to stretch.
 *
 * Roughly a quarter of an hour's hop — far enough to be worth tacking onto the
 * same visit, near enough that the word still means what it says. Restricting
 * to the same destination was not enough on its own: 台東 has three POIs spread
 * over the county, so 台東森林公園's third 附近 row was 三仙台, 47 km away.
 * A place that fails this simply does not appear, and a POI with nothing inside
 * the radius gets no 附近 section at all.
 */
const NEARBY_RADIUS_M = 8000;

/* The guides write their dates in Chinese numerals because they go through
   speech synthesis — 一六六二年, not 1662年 — so that is what has to be read
   back out. 千 and 百 are deliberately not in the class: it keeps 三百五十多年
   and 乾隆五十三年 from being mistaken for calendar years. */
const CN_DIGIT: Record<string, string> = {
  "〇": "0",
  "○": "0",
  "零": "0",
  "一": "1",
  "二": "2",
  "三": "3",
  "四": "4",
  "五": "5",
  "六": "6",
  "七": "7",
  "八": "8",
  "九": "9",
};
const YEAR_RE = /[〇○零一二三四五六七八九]{3,4}(?=年)/g;

function earliestYear(text: string): number | null {
  let min: number | null = null;
  for (const m of text.matchAll(YEAR_RE)) {
    const n = Number([...m[0]].map((c) => CN_DIGIT[c]).join(""));
    if (!Number.isFinite(n) || n < 100 || n > THIS_YEAR) continue;
    if (min === null || n < min) min = n;
  }
  return min;
}

const HUNDREDS = ["", "一", "兩", "三", "四", "五", "六", "七", "八", "九"];

/** Whole hundreds only. The label is never allowed a figure finer than that. */
function cnHundreds(h: number): string {
  if (h < 10) return `${HUNDREDS[h]}百`;
  const rest = h % 10;
  return `${HUNDREDS[Math.floor(h / 10)]}千${rest ? `${HUNDREDS[rest]}百` : ""}`;
}

/**
 * How far back the generated scene is allowed to say it is looking.
 *
 * The number comes out of the guide's own text — every ResoMap story is written
 * with dates in it — floored to the century so the line under-claims rather
 * than over-claims: 赤崁樓's 一六五三 reads 三百, not 四百. A story whose oldest
 * date is inside the last century gets no scene at all, which is why 駁二 and
 * 松園別館 do not have one. Inventing a century for a place we cannot date is
 * exactly the kind of confident nonsense these guides were written against.
 *
 * Which is why there is no fallback. A "台南 and 淡水 are obviously old enough"
 * default used to sit here handing out 三百 to any story that happened not to
 * print a date — a figure derived from nothing, on the one image a traveller
 * cannot check, next to a label that says AI made it. The guide names a century
 * or the scene does not appear.
 */
function sceneEra(st: Story): string | null {
  const y = earliestYear(`${st.title}${st.short}${st.body}`);
  if (y === null) return null;
  const h = Math.floor((THIS_YEAR - y) / 100);
  return h >= 1 ? cnHundreds(h) : null;
}

/**
 * One place, one decision: put it in the itinerary.
 *
 * Everything below that reads in a fixed order — story, then walking there,
 * then the ticket — and each step down that list is quieter than the one above
 * it. The story is the thing only ResoMap has, so it sits directly under the
 * description with both edits on offer; the ticket is a link to somebody else's
 * checkout, so it is a compact row a long way further down. Selling louder than
 * that would mean out-shouting 加入行程, which is the only tap on this page that
 * changes the traveller's trip.
 *
 * The ticket block is gated on `ticketed` AND on the record actually being a
 * ticket — not on "are there deals attached to this place". A free temple that
 * shows a 門票 CTA is an app selling something that does not exist, and one of
 * those is enough to lose the traveller for good.
 *
 * 在地優惠 is a different promise: merchant supply nobody has signed yet. It
 * gets its own block, keeps its 即將推出 label and is never bookable, because
 * the one thing worse than not having local deals is pretending you do.
 */
export function Poi({ id }: { id: string }) {
  const nav = useNav();
  const { placeName, placeAbout } = useI18n();
  const p = poi(id);

  /**
   * Saved state comes from the shared store, and must stay keyed by POI id.
   *
   * `id` changes without this component unmounting: every 附近 row navigates to
   * another place and App renders the same <Poi> in the same position, so React
   * keeps the instance. A bare boolean therefore belonged to whichever place
   * happened to be open when it was set — save 赤崁樓, tap 神農街 in 附近, and
   * 神農街 opened with the heart already filled. An id-keyed Set fixed that but
   * still forgot on reload, which makes the heart a toggle that lies about what
   * it does. lib/saved.ts keeps both properties: keyed by id, and written
   * through, so this heart and the 收藏 screen cannot disagree.
   */
  const { pois: savedPois } = useSaved();
  const [sceneFailedId, setSceneFailedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const saved = savedPois.includes(id);

  useEffect(() => {
    track("poi_view", { poiId: id });
  }, [id]);

  /**
   * Real distances from real coordinates — the one number on this page a
   * traveller can check against the map.
   *
   * Restricted to this destination AND to a radius, because the city alone does
   * not bound anything. Sorting every POI in the dataset by distance and taking
   * three puts 東京 at 1,160 km under a heading that says 附近 in 首爾; keeping
   * to one destination shrank that to 47 km in 台東, which is the same defect
   * wearing a smaller number. "Nearby" has to mean nearby or it means nothing,
   * so the cut is on the distance, not on the count.
   */
  const nearby = useMemo(() => {
    if (!p) return [];
    return POIS.filter((o) => o.id !== p.id && o.destId === p.destId)
      .map((place) => ({ place, metres: distance(p, place) }))
      .filter((n) => n.metres <= NEARBY_RADIUS_M)
      .sort((a, b) => a.metres - b.metres)
      .slice(0, 3);
  }, [p]);

  if (!p) return null;

  const st = story(p.storyId);
  const era = st ? sceneEra(st) : null;
  /* The generated period image, and only that. Every slot in the manifest is
     still "todo" and `sceneFor` returns only finished ones, so today this is
     always undefined and the block that draws it never renders. It stays wired
     up so that filling a slot is a data change rather than a code change. */
  const scene = sceneFor(p.id);

  /* Two blocks, two promises: a ticket only where the venue genuinely sells
     admission, a local offer only ever as 即將推出. Filtering by category is
     what stops a 在地優惠 record from rendering under a heading that says
     門票. */
  /* The whole list, and the part of it the story card above does not already
     cover. Both derived here so the JSX below stays a description of layout. */
  const allAudio = audiosFor(id);
  const featuredAudio = featuredAudiosFor(id);
  const extraAudio = [
    ...featuredAudio,
    ...allAudio.filter((a) => a.kind === "community"),
  ];

  /**
   * The guides in a language other than this page's own.
   *
   * 中文 is the home language of this build, not a universal default — the
   * comparison is against the string the data actually stores, so a guide
   * recorded in Japanese is "other" here whoever is reading. It is a deliberate
   * simplification: the app has a locale, and pivoting this on it would mean a
   * Japanese reader seeing 中文 filed under 其他國家語言, which is true but
   * useless when the whole page around it is Chinese.
   */
  const HOME_LANGUAGE = "中文";
  const otherLangAudio = allAudio.filter((a) => a.language !== HOME_LANGUAGE);
  const otherLanguages = [...new Set(otherLangAudio.map((a) => a.language))];
  /* Split rather than duplicated. The section below used to carry every
     community upload including the foreign-language ones, so promoting them
     into their own block without this filter would print the same guide twice
     on one screen. */
  const homeLangAudio = extraAudio.filter((a) => a.language === HOME_LANGUAGE);

  /**
   * How many languages this place can be heard in.
   *
   * The reason to show it: the section lists three of the guides and a
   * 「全部 N 則」 link, and N tells you how much there is but not what kind. A
   * traveller who reads 日本語 and sees one Japanese row has no way to tell
   * whether that is the only one or one of six without opening the list.
   *
   * Counted across `allAudio`, which includes the ResoMap recording shown in
   * the card above — the question is what this place offers, not what this
   * particular section happens to be rendering. Order is first-appearance, so
   * 中文 leads and nothing is alphabetised into a different answer.
   */
  const languages = [...new Set(allAudio.map((a) => a.language).filter(Boolean))];

  const attached = dealsForPoi(id);
  const tickets = p.ticketed ? attached.filter((d) => d.category === "ticket") : [];
  const localOffers = attached.filter((d) => d.category === "local");

  /* nav.trips, not the TRIPS export. The export is the starting fixture: it
     still lists a 台南 trip after the demo has been reset, so this reported
     "已加入 Day 2" against a trip that no longer existed and nothing moved. */
  const mine = nav.trips.filter((t) => t.destId === p.destId);

  function addToTrip() {
    if (mine.length !== 1) {
      nav.go({ k: "create", destId: p.destId });
      return;
    }
    /* Ask which day. It used to drop the place on `today` without asking,
       which put it somewhere the traveller never chose and never saw — the
       library card has offered the choice since it was built, and the place's
       own page was the one route that skipped it. */
    setAdding(true);
  }

  return (
    <Screen>
      {/* The photograph the moment the manifest has one, the generated landscape
          until then — the swap happens inside PoiImage, so this page does not
          have to know which it got. Square corners: it runs to the edges of the
          screen, so a radius here would only cut the status bar. */}
      <div className="relative shrink-0">
        <PoiImage poi={p} height={220} radius={0} emoji large />
        <button
          onClick={() => nav.back()}
          aria-label="返回"
          className="absolute left-4 top-4 grid size-11 place-items-center rounded-full bg-bg/90 text-[19px] text-ink active:bg-bg"
        >
          ‹
        </button>
        <button
          onClick={() => togglePoi(id)}
          aria-label={saved ? "取消收藏" : "收藏"}
          aria-pressed={saved}
          className={`absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-bg/90 text-[18px] active:bg-bg ${
            saved ? "text-brand" : "text-ink-2"
          }`}
        >
          {/* U+2665 without the U+FE0F variation selector. With it the filled
              heart renders in emoji presentation — a red glyph at its own size
              that ignores `text-brand` — so the two states came out in
              different colours and sizes and the toggle read as a glitch. */}
          {saved ? "♥" : "♡"}
        </button>
      </div>

      {/* Directly under the image, because that is what the licence asks for and
          because a credit filed on some other screen is not a credit. Renders
          nothing when the cover is the generated graphic — there is nobody to
          credit for that. */}
      <PhotoCredit poi={p} />

      <div className="px-5 pt-5">
        <h1 className="text-[22px] font-bold leading-snug text-ink">{placeName(p.id, p.name)}</h1>
        <div className="mt-1.5 text-[13.5px] text-ink-3">
          {p.area} · {POI_KIND_LABELS[p.kind]} · 建議停留 {dur(p.stayMin)}
        </div>
        {p.about && (
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">
            {placeAbout(p.id, p.about)}
          </p>
        )}

        {/* Gated on the story, not on the id: a 試聽 button that opens an empty
            player is worse than no button.

            Two buttons rather than one because the choice is real. Thirty
            seconds is what somebody standing in a queue will actually play;
            three minutes is what they choose once the place has earned it.
            Making them pick inside the player, after committing, is how the
            long edit gets abandoned at sentence two. */}
        {st && (
          <div className="mt-5 rounded-2xl bg-surface p-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 text-[22px] leading-none">🎧</span>
              <div className="min-w-0 flex-1">
                {/* The title already ends with the hook — "赤崁樓・荷蘭人蓋的，
                    鄭成功接手的" — so printing both says the same thing twice.
                    The hook earns its place on cards that have no room for a
                    title; here the title is the better line. */}
                <div className="text-[15px] font-bold leading-snug text-ink">
                  {st.title}
                </div>
                <div className="mt-1.5 truncate text-[12.5px] text-ink-3">
                  {st.narrator}
                </div>
              </div>
            </div>
            <div className="mt-3.5 flex gap-2">
              <button
                onClick={() => nav.play(id, "short")}
                className="num inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-bg px-3 text-[14px] font-bold text-ink active:bg-surface-2"
              >
                30 秒
              </button>
              <button
                onClick={() => nav.play(id, "full")}
                className="num inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-bg px-3 text-[14px] font-bold text-ink active:bg-surface-2"
              >
                <Headphones size={13} />聽 {st.minutes} 分鐘
              </button>
            </div>
          </div>
        )}

        {/* What the story is describing, as a picture.

            This used to draw the same generated cover as the hero and label it
            三百年前, which made the claim self-refuting: the two images were
            pixel-identical, so the only thing the label could tell a traveller
            was that ResoMap will put a caption on anything. A period image has
            to be a different image or it is not a period image.

            So it comes from the scene manifest and nowhere else, and it renders
            only when the slot is actually filled. It never has been: all four
            scene slots are `status: "todo"`, and `sceneFor` only returns a
            finished one — so every place whose guide named a century has been
            showing a grey box reading 情境圖製作中 since the day this shipped.
            A placeholder that can never resolve is not a quiet promise, it is
            dead space in the middle of the page, and the block below is what a
            traveller standing there can actually use. */}
        {st && era && scene?.src && sceneFailedId !== id && (
          <div className="mt-5">
            {/* No spaces around `era`: it is a Chinese numeral, not a figure.
                The app spaces 建議停留 1 小時 because the numeral is Latin;
                「如果回到 三百 年前」 is the same rule misapplied, and it reads
                as a gap in the sentence. */}
            <div className="text-[13px] text-ink-3">如果回到{era}年前……</div>
            <div className="relative mt-2">
              <img
                src={scene.src}
                alt={`${p.name} ${era}年前的 AI 情境重現`}
                loading="lazy"
                decoding="async"
                /* A 404 here has to hide the block, not land on a broken-image
                   glyph wearing an ✨ AI 情境重現 badge — the badge would be
                   labelling nothing, which is the one thing this exists to
                   prevent. */
                onError={() => setSceneFailedId(id)}
                className="h-[140px] w-full rounded-[14px] object-cover"
              />
              <AiSceneNote />
            </div>
          </div>
        )}

        {/* 其他國家語言語音導覽.

            Sits directly under the Chinese guide card, in the space the dead
            scene placeholder used to hold, because this is the moment it
            answers: a traveller who has just seen a guide they cannot listen to
            needs to know, without scrolling or tapping, whether there is one
            they can.

            The languages are named rather than counted. 「4 種語言」 tells
            somebody there is variety; 「日本語」 tells them whether any of it is
            for them, which is the only thing they are asking. */}
        {otherLangAudio.length > 0 && (
          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold text-ink">其他國家語言語音導覽</span>
              <span className="num ml-auto shrink-0 text-[12.5px] text-ink-3">
                {otherLangAudio.length} 則
              </span>
            </div>
            <p className="mt-0.5 truncate text-[12.5px] text-ink-3">
              {otherLanguages.join("・")}
            </p>

            <div className="mt-2.5 space-y-2">
              {otherLangAudio.slice(0, 4).map((a) => (
                <AudioRowMini key={a.id} guide={a} onPlay={() => nav.playAudio(a.id)} />
              ))}
            </div>

            {otherLangAudio.length > 4 && (
              <button
                onClick={() => nav.go({ k: "audios", poiId: id })}
                className="mt-2 min-h-11 text-[13px] font-semibold text-ink-3"
              >
                看全部 {allAudio.length} 則 ›
              </button>
            )}
          </div>
        )}
      </div>

      {/* Genuinely hands off to the phone's map app. ResoMap owns the plan;
          turn-by-turn is a product that already exists and is better.

          探索附近 sits beside it rather than at the bottom of the page: it is
          the same class of thing — something you do while standing here — and
          both stay `secondary`, because 加入行程 in the sticky bar is still the
          only tap on this page that changes the traveller's trip. */}
      <div className="flex gap-2 px-5 pt-5">
        <Button variant="secondary" onClick={() => openDirections(null, p, "walk")}>
          導航
        </Button>
        <Button variant="secondary" onClick={() => nav.go({ k: "nearby", poiId: id })}>
          探索附近
        </Button>
      </div>

      {/* Everything else recorded here.
          The ResoMap guide is already above with both its edits, so this block
          is what that card cannot show: the merchant's pinned recordings and
          what other travellers uploaded, in six languages. It renders only when
          there is something in it — a section whose whole content is a link to
          itself is the dead control this app keeps deleting. */}
      {homeLangAudio.length > 0 && (
        <Section
          title="語音導覽"
          action={`全部 ${allAudio.length} 則`}
          onAction={() => nav.go({ k: "audios", poiId: id })}
        >
          {/* Above the rows, not beside the heading: the heading line already
              carries 全部 N 則 on its right and a third thing on it would make
              a row of three competing numbers. Truncates rather than wraps —
              a place with six languages must not push the first guide down.

              It counts every language including the ones listed in their own
              block further up, because 全部 N 則 beside it links to the whole
              library and these two numbers have to be describing the same
              thing. */}
          {languages.length > 0 && (
            <p className="-mt-1 mb-2.5 truncate px-5 text-[12.5px] text-ink-3">
              {languages.length} 種語言 · {languages.join("・")}
            </p>
          )}

          <div className="space-y-2 px-5">
            {homeLangAudio.slice(0, 3).map((a) => (
              <AudioRowMini
                key={a.id}
                guide={a}
                onPlay={() =>
                  a.kind === "resomap" ? nav.play(id, "full") : nav.playAudio(a.id)
                }
              />
            ))}
          </div>
        </Section>
      )}

      {/* Compact on purpose. This is a link to somebody else's checkout, and it
          sits below both the story and 導航 in every dimension it can. */}
      {tickets.length > 0 && (
        <Section title="門票" tight>
          <div className="space-y-2 px-5">
            {tickets.map((d) => (
              <DealCard key={d.id} deal={d} onOpen={nav.openDeal} compact />
            ))}
          </div>
        </Section>
      )}

      {localOffers.length > 0 && (
        <Section title="在地優惠" tight>
          <div className="space-y-2 px-5">
            {localOffers.map((d) => (
              <DealCard key={d.id} deal={d} onOpen={nav.openDeal} compact />
            ))}
          </div>
        </Section>
      )}

      {(tickets.length > 0 || localOffers.length > 0) && (
        <Note>{AFFILIATE_DISCLOSURE}</Note>
      )}

      {nearby.length > 0 && (
        <Section title="附近">
          <div className="px-5">
            {nearby.map(({ place, metres }) => (
              <button
                key={place.id}
                onClick={() => nav.go({ k: "poi", id: place.id })}
                className="flex w-full items-center gap-3 border-b border-line py-3 text-left last:border-0 active:bg-surface"
              >
                {/* The real photograph where the manifest has one, and the
                    drawn poster where it does not — `PoiImage` decides, the
                    same as every other list in the app. This row used to draw
                    `Thumb`, which is emoji-on-a-tint and nothing else, so three
                    places that all have credited photographs were showing as
                    three coloured squares. */}
                <PoiImage
                  poi={place}
                  height={48}
                  radius={12}
                  emoji={false}
                  className="w-12"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[14.5px] font-semibold text-ink">
                      {place.name}
                    </span>
                    {/* The headphone alone in a dense row — the label would be
                        longer than the place name it sits next to. */}
                    {place.storyId && <StoryBadge label={false} />}
                  </div>
                  <div className="mt-0.5 truncate text-[12.5px] text-ink-3">
                    {place.area} · {POI_KIND_LABELS[place.kind]}
                  </div>
                </div>
                <span className="num shrink-0 text-[12.5px] text-ink-3">
                  {km(metres)}
                </span>
                <span className="shrink-0 text-[15px] text-ink-3">›</span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* `shrink-0`, or this does nothing at all. Screen is a flex column, and a
          flex item defaults to shrink:1 with min-height:auto — an empty div's
          min-content is 0, so on any page long enough to scroll (which is every
          POI with a story) this collapsed to zero and the last 附近 row ran
          straight into the bar below. */}
      <div className="h-8 shrink-0" />

      {/* In flow as well as sticky, so the last row is never covered by it. */}
      <div className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-line bg-bg/95 px-5 pb-5 pt-3 backdrop-blur">
        <Button onClick={addToTrip}>加入行程</Button>
      </div>

      {/* Mounted only while open, so the picker's day state is fresh each time.
          The day test is repeated rather than trusted from `addToTrip`: the one
          thing standing between the sheet reading `days[0].n` and a crash
          should be the condition that actually mounts it. */}
      {adding && mine.length === 1 && mine[0].days.length > 0 && (
        <AddToTrip
          target={{ kind: "poi", poiId: id }}
          trip={mine[0]}
          onClose={() => setAdding(false)}
        />
      )}
    </Screen>
  );
}
