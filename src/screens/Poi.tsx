import { useEffect, useMemo, useState } from "react";
import { AFFILIATE_DISCLOSURE, POIS, dealsForPoi, poi } from "../data";
import { story } from "../data/stories";
import { PhotoCredit, PoiImage } from "../components/Cover";
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
import { POI_KIND_LABELS } from "../types";
import { AddToTrip } from "../components/AddToTrip";

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

        {/* 語音導覽庫.

            Every recording for this place, in the space the dead scene
            placeholder used to hold. It sits directly under the ResoMap guide
            card because that is the moment it answers: somebody who has just
            been shown one guide — possibly in a language they do not read —
            needs to see what else exists without scrolling or tapping.

            It used to be a section far below, under 導航 and 探索附近, which
            put the merchant recordings and six languages of community uploads
            behind two calls to action about walking somewhere else.

            The ResoMap recording itself is not repeated here — it is the card
            immediately above, with both its edits on offer. 全部 N 則 counts
            it, because that link opens the library where it does appear. */}
        {extraAudio.length > 0 && (
          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold text-ink">語音導覽庫</span>
              <button
                onClick={() => nav.go({ k: "audios", poiId: id })}
                className="num -my-2 ml-auto shrink-0 px-1 py-2 text-[12.5px] font-semibold text-ink-3"
              >
                全部 {allAudio.length} 則 ›
              </button>
            </div>

            {/* Named rather than counted. 「5 種語言」 tells somebody there is
                variety; 「日本語」 tells them whether any of it is for them,
                which is the only thing they are asking. Truncates rather than
                wraps, so six languages cannot push the first guide down. */}
            {languages.length > 0 && (
              <p className="mt-0.5 truncate text-[12.5px] text-ink-3">
                {languages.length} 種語言 · {languages.join("・")}
              </p>
            )}

            <div className="mt-2.5 space-y-2">
              {extraAudio.slice(0, 4).map((a) => (
                <AudioRowMini
                  key={a.id}
                  guide={a}
                  onPlay={() =>
                    a.kind === "resomap" ? nav.play(id, "full") : nav.playAudio(a.id)
                  }
                />
              ))}
            </div>

            {extraAudio.length > 4 && (
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
