import { useMemo } from "react";
import { merchant as merchantOf } from "../data/merchants";
import { provider as providerOf } from "../data/providers";
import { reviewsFor } from "../data/reviews";
import { Empty, Note, Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

/**
 * What people said.
 *
 * The header prints the stored average and the full count; the list prints the
 * handful that exist. A screen that shows four reviews under a heading claiming
 * eighty-six is the same defect as an invented number, so the line between the
 * two says which is which rather than hoping nobody counts.
 *
 * The bar chart is derived from the reviews actually shown, and it is labelled
 * that way — deriving it from the stored average would mean drawing a
 * distribution nobody can check.
 */
export function Reviews({ kind, id }: { kind: "merchant" | "provider"; id: string }) {
  const nav = useNav();
  const owner = kind === "merchant" ? merchantOf(id) : providerOf(id);
  const list = useMemo(() => reviewsFor(id), [id]);

  if (!owner) return null;

  /* Five buckets, from the sample. `sample` is what the bars are about, and the
     caption says so — it is not a picture of all 86. */
  const buckets = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: list.filter((r) => Math.round(r.rating) === n).length,
  }));
  const most = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <Screen>
      <TopBar title="評價" onBack={() => nav.back()} />

      <div className="px-5">
        <div className="truncate text-[15px] font-bold text-ink">{owner.name}</div>

        <div className="mt-3 flex items-center gap-5 rounded-2xl bg-surface p-4">
          <div className="shrink-0 text-center">
            <div className="num text-[34px] font-bold leading-none text-ink">
              {owner.rating.toFixed(1)}
            </div>
            <div className="mt-1 text-[13px] text-ink-3" aria-hidden>
              {"★".repeat(Math.round(owner.rating))}
            </div>
            <div className="num mt-1 text-[11.5px] text-ink-3">
              {owner.reviewCount} 則評價
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            {buckets.map((b) => (
              <div key={b.n} className="flex items-center gap-2">
                <span className="num w-3 shrink-0 text-[11.5px] text-ink-3">{b.n}</span>
                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className="block h-full rounded-full bg-brand"
                    style={{ width: `${(b.count / most) * 100}%` }}
                  />
                </span>
                <span className="num w-4 shrink-0 text-right text-[11.5px] text-ink-3">
                  {b.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <Empty icon="💬" text="這位服務提供者還沒有可以顯示的評價。" />
      ) : (
        <>
          <div className="px-5 pb-2 pt-6">
            <span className="num text-[13px] font-semibold text-ink-2">
              最近 {list.length} 則
            </span>
            <span className="ml-2 text-[12.5px] text-ink-3">
              · 上面的長條圖統計的是這 {list.length} 則
            </span>
          </div>

          <div className="space-y-2 px-5">
            {list.map((r) => (
              <div key={r.id} className="rounded-2xl bg-surface p-4">
                <div className="flex items-center gap-2">
                  <span className="num text-[13px] font-bold text-ink" aria-hidden>
                    {"★".repeat(Math.round(r.rating))}
                  </span>
                  <span className="num text-[12.5px] font-semibold text-ink-2">
                    {r.rating.toFixed(1)}
                  </span>
                  <span className="num ml-auto shrink-0 text-[12px] text-ink-3">{r.date}</span>
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{r.comment}</p>
                <div className="mt-2 truncate text-[12px] text-ink-3">— {r.user}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <Note>
        評價為 Demo 資料。正式版的評價只有實際完成服務的旅客才能填寫，且不可由服務提供者自行刪除。
      </Note>
      <div className="h-24 shrink-0" />
    </Screen>
  );
}
