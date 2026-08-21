import { useMemo, useState } from "react";
import { poi } from "../data";
import { BY_DEST } from "../data/destinations";
import { PoiImage } from "../components/Cover";
import { Note, Screen, Segmented, TopBar } from "../components/ui";
import {
  NEARBY_CATEGORIES,
  NEARBY_DISCLOSURE,
  type NearbyCat,
  type Range,
} from "../data/nearbyCategories";
import { nearbyCounts, type NearbyContext } from "../lib/nearby";
import { useNav } from "../nav";

/**
 * What is around the place you are standing in.
 *
 * This screen is the hinge of the whole business model — a guide creates the
 * need, this answers it — so the one thing it must never do is blur who is
 * recommending what. Two groups, two headings, and the second one says
 * 聯盟合作 rather than 合作夥伴, because ResoMap has no agreement with Booking,
 * Agoda, Klook or KKday and a heading is not the place to imply one.
 *
 * Every row prints its own count at the current radius. A row that opens an
 * empty list is the dead control this app keeps deleting — so a row with
 * nothing behind it says 這個範圍沒有 and does not navigate.
 *
 * 5km / 10km is a `Segmented`, which T0 reserves for two-state switches. It is
 * the only control on the screen, which is the point: everything else is a
 * consequence of it.
 */
export function Nearby({ poiId }: { poiId: string }) {
  const nav = useNav();
  const [range, setRange] = useState<Range>(5000);
  const p = poi(poiId);

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

  const counts = useMemo(() => (ctx ? nearbyCounts(ctx) : null), [ctx]);

  if (!p || !counts) return null;
  const city = BY_DEST[p.destId]?.name;

  const groups = [
    {
      id: "resomap" as const,
      title: "ResoMap 服務",
      note: "商家與專業會員，經過審核後上架。點進去不會離開 App。",
    },
    {
      id: "partner" as const,
      title: "聯盟合作",
      note: "其他平台的庫存，透過聯盟連結前往。ResoMap 與各平台皆無合作關係。",
    },
  ];

  return (
    <Screen>
      <TopBar title="周邊推薦" onBack={() => nav.back()} />

      {/* Where "nearby" is measured from. Without it a distance is a number
          with no origin, and the traveller has no way to check it. */}
      <div className="px-5">
        <button
          onClick={() => nav.go({ k: "poi", id: p.id })}
          className="flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left active:bg-surface-2"
        >
          <PoiImage poi={p} height={56} radius={12} emoji={false} className="w-[72px]" />
          <div className="min-w-0 flex-1">
            <div className="text-[12px] text-ink-3">以這個地點為中心</div>
            <div className="truncate text-[15.5px] font-bold text-ink">{p.name}</div>
            <div className="truncate text-[12.5px] text-ink-3">
              {[city, p.area].filter(Boolean).join(" · ")}
            </div>
          </div>
          <span className="shrink-0 text-[15px] text-ink-3" aria-hidden>
            ›
          </span>
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 px-5">
        <Segmented<string>
          items={[
            { id: "5000", label: "5 公里內" },
            { id: "10000", label: "10 公里內" },
          ]}
          value={String(range)}
          onChange={(v) => setRange(Number(v) as Range)}
        />
        <span className="num text-[12px] text-ink-3">
          共 {Object.values(counts).reduce((a, b) => a + b, 0)} 筆
        </span>
      </div>

      {groups.map((g) => {
        const rows = NEARBY_CATEGORIES.filter((c) => c.group === g.id);
        return (
          <section key={g.id} className="mt-7">
            <h2 className="px-5 text-[16px] font-bold text-ink">{g.title}</h2>
            <p className="mb-3 mt-1 px-5 text-[12.5px] leading-relaxed text-ink-3">{g.note}</p>

            <div className="space-y-2 px-5">
              {rows.map((c) => {
                const n = counts[c.id as NearbyCat];
                const live = n > 0;
                return (
                  <button
                    key={c.id}
                    disabled={!live}
                    onClick={() => nav.go({ k: "nearbyList", poiId, cat: c.id, range })}
                    className={`flex min-h-[64px] w-full items-center gap-3 rounded-2xl px-3.5 text-left transition ${
                      live ? "bg-surface active:bg-surface-2" : "bg-surface/60"
                    }`}
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-full text-[19px] ${
                        live ? "" : "opacity-45"
                      }`}
                      style={{ background: c.tint }}
                      aria-hidden
                    >
                      {c.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[15px] font-bold ${
                          live ? "text-ink" : "text-ink-3"
                        }`}
                      >
                        {c.label}
                      </span>
                      <span className="block truncate text-[12.5px] text-ink-3">
                        {live ? c.note : "這個範圍還沒有"}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block rounded-md bg-bg px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">
                        {c.badge}
                      </span>
                      {live && (
                        <span className="num mt-1 block text-[12.5px] font-semibold text-ink-2">
                          {n} 筆 ›
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <Note>{NEARBY_DISCLOSURE}</Note>
      <div className="h-24 shrink-0" />
    </Screen>
  );
}
