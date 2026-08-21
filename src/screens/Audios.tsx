import { useMemo, useState } from "react";
import { poi } from "../data";
import { BY_DEST } from "../data/destinations";
import { PoiImage } from "../components/Cover";
import { AudioRow } from "../components/AudioRow";
import { Empty, Headphones, Note, Screen, Tag, TopBar } from "../components/ui";
import {
  FEATURED_CAP,
  audiosFor,
  featuredAudiosFor,
  languagesFor,
  ordinaryAudiosFor,
  searchAudios,
} from "../lib/audio";
import { useNav } from "../nav";
import { POI_KIND_LABELS } from "../types";

/**
 * Everything you can listen to at one place.
 *
 * The order is the product, and it is stated once in lib/audio.ts rather than
 * re-derived here: 店家精選 first and capped at two, then ResoMap's own guide,
 * then what other travellers uploaded, most-played first.
 *
 * The pinned block is separated by a heading rather than by being made prettier
 * than the rest. A merchant buys **position**, and position is the entire thing
 * they get — a gold border and a bigger photo would be the app selling on their
 * behalf, and would teach a traveller to distrust every row underneath.
 *
 * 周邊推薦 sits at the top of the list rather than at the bottom of the page.
 * Somebody who has already played something will not scroll back up past
 * fourteen rows to find it, and somebody who has not played anything yet is
 * exactly the person a shortcut to shops should not be shouting at — so it is a
 * quiet pill in the header row, not a call to action.
 */
export function Audios({ poiId }: { poiId: string }) {
  const nav = useNav();
  const [q, setQ] = useState("");
  const p = poi(poiId);

  const featured = useMemo(() => featuredAudiosFor(poiId), [poiId]);
  const ordinary = useMemo(() => ordinaryAudiosFor(poiId), [poiId]);
  const langs = useMemo(() => languagesFor(poiId), [poiId]);

  /* Search runs across the whole list and then splits again, so a query that
     matches a pinned guide still shows it pinned — and a query that matches
     nothing pinned does not leave an empty 店家精選 heading behind. */
  const hits = useMemo(() => new Set(searchAudios(audiosFor(poiId), q).map((a) => a.id)), [poiId, q]);
  const shownFeatured = featured.filter((a) => hits.has(a.id));
  const shownOrdinary = ordinary.filter((a) => hits.has(a.id));
  const nothing = shownFeatured.length + shownOrdinary.length === 0;

  if (!p) return null;
  const city = BY_DEST[p.destId]?.name;

  const play = (kind: string, id: string) => {
    /* ResoMap's own guides go through the story path, so the traveller keeps
       the 快速聽 / 完整故事 toggle they get everywhere else in the app. */
    if (kind === "resomap") nav.play(poiId, "full");
    else nav.playAudio(id);
  };

  return (
    <Screen>
      <TopBar
        title="語音導覽"
        onBack={() => nav.back()}
        right={
          <button
            onClick={() => nav.go({ k: "addAudio", poiId })}
            aria-label="新增語音導覽"
            className="grid size-11 place-items-center rounded-full text-[22px] font-bold text-brand active:bg-surface"
          >
            ＋
          </button>
        }
      />

      {/* The place, so a list of eight titles in six languages still says what
          it is a list about. */}
      <div className="px-5">
        <PoiImage poi={p} height={150} radius={16} emoji={false} className="w-full" />
        <h1 className="mt-3 text-[20px] font-bold leading-snug text-ink">{p.name}</h1>
        <div className="mt-1 text-[13px] text-ink-3">
          {[city, p.area, POI_KIND_LABELS[p.kind]].filter(Boolean).join(" · ")}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-surface px-1.5 py-0.5 font-semibold">
            <Headphones size={11} />
            <span className="num">{featured.length + ordinary.length} 則</span>
          </span>
          {langs.map((l) => (
            <span key={l} className="rounded-md bg-surface px-1.5 py-0.5 font-semibold">
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Search and the way out to 周邊推薦, on one line. */}
      <div className="mt-4 flex items-center gap-2 px-5">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-surface px-3.5">
          <SearchIcon />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋標題、語言或錄音的人"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="清除搜尋"
              className="shrink-0 text-[15px] text-ink-3"
            >
              ×
            </button>
          )}
        </label>
        <button
          onClick={() => nav.go({ k: "nearby", poiId })}
          className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-surface px-3.5 text-[13px] font-bold text-ink active:bg-surface-2"
        >
          <span aria-hidden>📍</span>
          附近
        </button>
      </div>

      {nothing ? (
        <Empty
          icon="🎧"
          text={`「${q}」找不到符合的導覽`}
          action="清除搜尋"
          onAction={() => setQ("")}
        />
      ) : (
        <>
          {shownFeatured.length > 0 && (
            <section className="mt-6">
              <div className="flex items-baseline gap-2 px-5">
                <h2 className="text-[15px] font-bold text-ink">店家精選</h2>
                <span className="text-[12px] text-ink-3">商業內容</span>
                <span className="num ml-auto text-[11.5px] text-ink-3">
                  最多 {FEATURED_CAP} 則
                </span>
              </div>
              <p className="mb-2.5 mt-1 px-5 text-[12px] leading-relaxed text-ink-3">
                付費商家可以在自己所在的景點置頂最多兩則語音，位置是買來的，內容由商家自己錄。
              </p>
              <div className="space-y-2.5 px-5">
                {shownFeatured.map((a) => (
                  <AudioRow
                    key={a.id}
                    guide={a}
                    onPlay={() => play(a.kind, a.id)}
                    onOpenMerchant={(id) => nav.go({ k: "merchant", id })}
                  />
                ))}
              </div>
            </section>
          )}

          {shownOrdinary.length > 0 && (
            <section className="mt-7">
              <div className="flex items-center gap-2 px-5 pb-2.5">
                <h2 className="text-[15px] font-bold text-ink">導覽語音</h2>
                <span className="text-[12.5px] text-ink-3">· 免費收聽</span>
                <span className="ml-auto shrink-0">
                  <Tag kind="demo" />
                </span>
              </div>
              <div className="space-y-2.5 px-5">
                {shownOrdinary.map((a) => (
                  <AudioRow key={a.id} guide={a} onPlay={() => play(a.kind, a.id)} />
                ))}
              </div>
            </section>
          )}

          <Note>
            播放次數與喜歡數皆為 Demo 資料。旅人上傳的語音在正式版需經 ResoMap
            審核後才會上架；目前沒有後端，這裡的清單是固定資料。
          </Note>
        </>
      )}

      {/* In flow as well as sticky, so the last row is never covered by it. */}
      <div className="h-4 shrink-0" />
      <div className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-line bg-bg/95 px-5 pb-5 pt-3 backdrop-blur">
        <button
          onClick={() => nav.go({ k: "addAudio", poiId })}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-surface text-[15px] font-bold text-ink active:bg-surface-2"
        >
          <span aria-hidden>＋</span>
          新增這裡的語音導覽
        </button>
      </div>
    </Screen>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="shrink-0 text-ink-3"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" strokeLinecap="round" />
    </svg>
  );
}
