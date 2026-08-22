import { useState } from "react";
import { SUBSCRIPTION_PLANS } from "../data/subscriptionPlans";
import { Button, Note, Screen, Sheet, Tabs, TopBar } from "../components/ui";
import { InfoButton, InfoSheet } from "../components/Trade";
import type { InfoTopic } from "../data/info";
import {
  isMerchant,
  setMerchantMembership,
  setProfessionalRole,
  useAccount,
} from "../lib/account";
import { useNav } from "../nav";
import { PLAN_AUDIENCE_LABELS, type PlanAudience, type ProviderKind } from "../types";

/**
 * The four things you can be on ResoMap.
 *
 * The tabs are a way of *browsing* the four offers; they are not four slots one
 * account has to choose between. A café that also runs walking tours is an
 * ordinary business, and the account model says so: 商家 is a business
 * membership, 導遊 / 包車 is a personal professional identity, and only the
 * second pair is exclusive. Activating a shop no longer switches off a guide.
 *
 * **No plan shows a price, because no price has been decided.** One line says
 * so and moves on. What the plan gets you, and where it shows up, is the part
 * worth reading.
 */
export function Subscribe({ audience }: { audience?: PlanAudience }) {
  const nav = useNav();
  const account = useAccount();
  const [tab, setTab] = useState<PlanAudience>(audience ?? "member");
  const [confirm, setConfirm] = useState<PlanAudience | null>(null);
  const [info, setInfo] = useState<InfoTopic | null>(null);

  const plan = SUBSCRIPTION_PLANS.find((p) => p.audience === tab) ?? SUBSCRIPTION_PLANS[0];

  /* Everybody is a traveller member; the other two are independent switches. */
  const active =
    plan.audience === "member"
      ? true
      : plan.audience === "merchant"
        ? isMerchant(account)
        : account.professionalRole === plan.audience;

  /* Only the two professional identities replace each other. */
  const replacing =
    (plan.audience === "driver" || plan.audience === "guide") &&
    account.professionalRole !== null &&
    account.professionalRole !== plan.audience;

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
              使用中
            </span>
          )}
        </div>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{plan.tagline}</p>

        {/* The price, or the honest absence of one — in one line, not three. */}
        <div className="mt-4 rounded-2xl bg-surface p-4">
          <div className="text-[19px] font-bold text-ink">
            {plan.audience === "member"
              ? "免費"
              : plan.priceTwd === null
                ? "價格待確認"
                : `NT$ ${plan.priceTwd.toLocaleString()}${
                    plan.period === "month" ? " / 月" : plan.period === "year" ? " / 年" : ""
                  }`}
          </div>
          {plan.audience !== "member" && plan.priceTwd === null && (
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">
              正式方案與價格將於合作開放時公布。
            </p>
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
      </div>

      {/* Where the plan actually shows up. Every line is a screen in this app,
          which is what keeps a subscription page from being a wish list. */}
      <div className="mt-6 px-5">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[15px] font-bold text-ink">會出現在哪裡</h2>
          {plan.audience !== "member" && (
            <span className="ml-auto">
              <InfoButton topic="partner" label="推薦夥伴" onOpen={setInfo} />
            </span>
          )}
        </div>
        <div className="mt-2 space-y-2">
          {WHERE[plan.audience].map((w) => (
            <div key={w} className="rounded-2xl bg-surface px-4 py-3 text-[13.5px] text-ink-2">
              {w}
            </div>
          ))}
        </div>
      </div>

      <Note>方案內容為規劃中的示意，實際權益以正式公布為準。</Note>
      <div className="h-4 shrink-0" />

      <div className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-line bg-bg/95 px-5 pb-5 pt-3 backdrop-blur">
        {plan.audience === "member" ? (
          /* Everybody already has this one, so the button points at what
             somebody on the free plan might actually want next. */
          <Button variant="secondary" onClick={() => setTab("merchant")}>
            我是商家或服務提供者
          </Button>
        ) : active ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setConfirm(plan.audience)}>
              停用
            </Button>
            <Button onClick={() => nav.go({ k: "pro" })}>管理我的資料</Button>
          </div>
        ) : (
          <Button onClick={() => setConfirm(plan.audience)}>啟用{plan.name}</Button>
        )}
      </div>

      <Sheet
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={active ? "停用方案" : "啟用方案"}
      >
        {confirm && (
          <div className="px-5 pb-5 pt-1">
            <div className="rounded-2xl bg-surface p-4">
              <div className="text-[14.5px] leading-relaxed text-ink">
                {active
                  ? `將停用「${plan.name}」。`
                  : `將啟用「${plan.name}」。`}
              </div>
              {/* Only shown when something is genuinely being replaced — and a
                  merchant membership never replaces a professional identity. */}
              {!active && replacing && account.professionalRole && (
                <p className="mt-2 text-[13px] leading-relaxed text-brand">
                  專業身份只能擇一，原本的
                  {PLAN_AUDIENCE_LABELS[account.professionalRole]}會同時停用。
                </p>
              )}
              {!active && confirm === "merchant" && account.professionalRole && (
                <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
                  商家會員與你的{PLAN_AUDIENCE_LABELS[account.professionalRole]}身份可以同時存在。
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => setConfirm(null)}>
                取消
              </Button>
              <Button
                onClick={() => {
                  if (confirm === "merchant") {
                    setMerchantMembership(!active);
                  } else {
                    setProfessionalRole(active ? null : (confirm as ProviderKind));
                  }
                  setConfirm(null);
                  if (!active) nav.go({ k: "pro" });
                }}
              >
                {active ? "確定停用" : "確定啟用"}
              </Button>
            </div>
          </div>
        )}
      </Sheet>

      <InfoSheet topic={info} onClose={() => setInfo(null)} />
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
    "周邊推薦 → 附近餐廳 / 伴手禮 / 住宿",
    "商家頁：營業時間、地址、語言、優惠、評價、地圖",
  ],
  guide: [
    "周邊推薦 → 私人導遊",
    "導遊頁：導覽主題、服務區域、價格區間、評價",
    "通過審核後顯示「ResoMap 推薦夥伴」",
  ],
  driver: [
    "周邊推薦 → 包車司機",
    "司機頁：車型、座位數、招牌路線、價格區間、評價",
    "通過審核後顯示「ResoMap 推薦夥伴」",
  ],
};
