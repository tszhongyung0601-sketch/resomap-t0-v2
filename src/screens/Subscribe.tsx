import { useState } from "react";
import { PARTNER_RULE, SUBSCRIPTION_PLANS } from "../data/subscriptionPlans";
import { Button, Note, Screen, Sheet, Tabs, Tag, TopBar } from "../components/ui";
import { setPlan, useAccount } from "../lib/account";
import { useNav } from "../nav";
import { PLAN_AUDIENCE_LABELS, type PlanAudience, type SubscriptionPlan } from "../types";

/**
 * The four things you can be on ResoMap.
 *
 * **No plan on this screen shows a price, because no price has been decided.**
 * `priceTwd` is `null` on every record in data/subscriptionPlans.ts and this
 * renders 價格待確認 for it. Typing a plausible NT$ 990 in would have made the
 * screen look finished and made the figure real: it would be the number quoted
 * back in a meeting, and then the number a merchant is angry about. The shape of
 * the offer is reviewable without it.
 *
 * 包車 and 導遊 are mutually exclusive, and the exclusivity is structural rather
 * than validated: lib/account.ts holds one `plan`, so switching is one
 * assignment and there is no state in which somebody is both. The confirmation
 * sheet says which identity is being replaced, because silently swapping
 * somebody's professional identity is not a thing to do quietly.
 */
export function Subscribe({ audience }: { audience?: PlanAudience }) {
  const nav = useNav();
  const account = useAccount();
  const [tab, setTab] = useState<PlanAudience>(audience ?? account.plan);
  const [confirm, setConfirm] = useState<SubscriptionPlan | null>(null);

  const plan = SUBSCRIPTION_PLANS.find((p) => p.audience === tab) ?? SUBSCRIPTION_PLANS[0];
  const active = account.plan === plan.audience;
  /* Switching between the two professional identities is a replacement, not an
     addition, and the button has to say so before it is pressed. */
  const replacing =
    (plan.audience === "driver" && account.plan === "guide") ||
    (plan.audience === "guide" && account.plan === "driver");

  return (
    <Screen>
      <TopBar
        title="訂閱方案"
        onBack={() => nav.back()}
        below={
          <div className="border-b border-line pb-0">
            <Tabs<PlanAudience>
              items={SUBSCRIPTION_PLANS.map((p) => ({
                id: p.audience,
                label: PLAN_AUDIENCE_LABELS[p.audience],
              }))}
              value={tab}
              onChange={setTab}
            />
          </div>
        }
      />

      <div className="px-5 pt-5">
        <div className="flex items-start gap-2">
          <h1 className="min-w-0 flex-1 text-[24px] font-bold leading-tight text-ink">
            {plan.name}
          </h1>
          {active && (
            <span className="mt-1 shrink-0 rounded-md bg-brand-wash px-2 py-1 text-[11.5px] font-semibold text-brand">
              目前方案
            </span>
          )}
        </div>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{plan.tagline}</p>

        {/* The price, or the honest absence of one. */}
        <div className="mt-4 rounded-2xl bg-surface p-4">
          {plan.priceTwd === null ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[19px] font-bold text-ink">
                  {plan.audience === "member" ? "免費" : "價格待確認"}
                </span>
                {plan.audience !== "member" && <Tag kind="demo" />}
              </div>
              {plan.audience !== "member" && (
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">
                  這個 Demo 沒有訂閱定價。方案內容可以先看，金額決定之後只會改一個檔案，畫面不用動。
                </p>
              )}
            </>
          ) : (
            <div className="num text-[19px] font-bold text-ink">
              NT$ {plan.priceTwd.toLocaleString()}
              {plan.period === "month" ? " / 月" : plan.period === "year" ? " / 年" : ""}
            </div>
          )}
        </div>

        <ul className="mt-5 space-y-2.5">
          {plan.features.map((f) => (
            <li key={f} className="flex gap-2.5">
              <span className="mt-0.5 shrink-0 text-[13px] text-brand" aria-hidden>
                ✓
              </span>
              <span className="text-[14px] leading-relaxed text-ink-2">{f}</span>
            </li>
          ))}
        </ul>

        {plan.note && (
          <p className="mt-4 rounded-2xl bg-surface p-3.5 text-[12.5px] leading-relaxed text-ink-3">
            {plan.note}
          </p>
        )}
      </div>

      {/* Where each plan actually shows up, so a subscription is not an abstract
          promise. Every row here is a real screen in this build. */}
      <div className="mt-6 px-5">
        <h2 className="text-[15px] font-bold text-ink">訂閱之後會出現在哪裡</h2>
        <div className="mt-2 space-y-2">
          {WHERE[plan.audience].map((w) => (
            <div key={w} className="rounded-2xl bg-surface px-4 py-3 text-[13.5px] text-ink-2">
              {w}
            </div>
          ))}
        </div>
      </div>

      <Note>
        {PARTNER_RULE} Demo 版本沒有金流，切換方案只會存在這台裝置上，不會產生任何費用。
      </Note>
      <div className="h-4 shrink-0" />

      <div className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-line bg-bg/95 px-5 pb-5 pt-3 backdrop-blur">
        {active ? (
          /* 一般會員 has no professional profile to manage, so the button that
             would say 管理我的一般會員資料 points at the thing somebody on the
             free plan might actually want next. */
          plan.audience === "member" ? (
            <Button variant="secondary" onClick={() => setTab("merchant")}>
              我是商家或服務提供者
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => nav.go({ k: "pro" })}>
              管理我的{plan.name}資料
            </Button>
          )
        ) : (
          <Button onClick={() => setConfirm(plan)}>
            {plan.audience === "member" ? "改回一般會員" : `切換為${plan.name}`}
          </Button>
        )}
      </div>

      <Sheet open={Boolean(confirm)} onClose={() => setConfirm(null)} title="切換方案">
        {confirm && (
          <div className="px-5 pb-5 pt-1">
            <div className="rounded-2xl bg-surface p-4">
              <div className="text-[14.5px] leading-relaxed text-ink">
                將把目前的「{PLAN_AUDIENCE_LABELS[account.plan]}」切換為「{confirm.name}」。
              </div>
              {replacing && (
                <p className="mt-2 text-[13px] leading-relaxed text-brand">
                  專業身份只能擇一：切換之後，原本的
                  {PLAN_AUDIENCE_LABELS[account.plan]}身份會停用。
                </p>
              )}
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">
                Demo 版本不會產生費用，也不會送出任何資料。
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => setConfirm(null)}>
                取消
              </Button>
              <Button
                onClick={() => {
                  setPlan(confirm.audience);
                  setConfirm(null);
                  if (confirm.audience !== "member") nav.go({ k: "pro" });
                }}
              >
                確定切換
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </Screen>
  );
}

/** Where a plan is visible in this build. Named screens, not promises. */
const WHERE: Record<PlanAudience, string[]> = {
  member: [
    "任何景點的「語音導覽」清單 — 免費收聽",
    "「＋ 新增語音導覽」 — 上傳後送審",
    "景點頁與語音頁的「探索附近」",
  ],
  merchant: [
    "景點語音頁最上方的「店家精選」（最多 2 則）",
    "周邊推薦 → 附近餐廳 / 旅館 / 土產店",
    "商家詳情頁：營業時間、地址、語言、優惠、評價、地圖",
  ],
  guide: [
    "周邊推薦 → 私人導遊",
    "導遊詳情頁：導覽主題、服務區域、價格區間、評價",
    "通過審核後顯示「ResoMap 推薦夥伴」",
  ],
  driver: [
    "周邊推薦 → 包車司機",
    "司機詳情頁：車型、座位數、招牌路線、價格區間、評價",
    "通過審核後顯示「ResoMap 推薦夥伴」",
  ],
};
