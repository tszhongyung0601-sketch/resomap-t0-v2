import type { PlanAudience, SubscriptionPlan } from "../types";

/**
 * The four things somebody can be on ResoMap, and what each one gets.
 *
 * **Every `priceTwd` is `null`, and that is deliberate.** Nothing in this
 * codebase — and nothing in the demo it came from — carries a decided
 * subscription price. A plausible NT$ 990 typed in here would become the number
 * somebody quotes in a meeting, and then the number a merchant is angry about.
 * The screen renders 「價格待確認」 for a null, so the shape of the offer can be
 * shown and reviewed while the figure is still a business decision.
 *
 * When pricing is decided, the only edit is here. No component reads a number
 * of its own — that is the whole reason this file exists.
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-member",
    audience: "member",
    name: "一般會員",
    tagline: "所有旅客都是一般會員，不用付費。",
    priceTwd: null,
    features: [
      "免費收聽所有語音導覽",
      "行程規劃、地圖與收藏",
      "上傳自己的語音導覽（送審後上架）",
      "周邊推薦與聯盟合作內容",
    ],
    note: "一般會員永久免費。以下三種是給商家與服務提供者的方案。",
  },
  {
    id: "plan-merchant",
    audience: "merchant",
    name: "商家會員",
    tagline: "把店開在旅客正在聽的那個景點旁邊。",
    priceTwd: null,
    period: "month",
    features: [
      "商家專頁（照片、營業時間、地址、優惠）",
      "多語店家資訊",
      "上傳店家語音內容",
      "景點語音頁最多 2 則「店家精選」置頂",
      "出現在該景點的「周邊推薦」清單",
      "排序加權：付費曝光 + 通過審核",
    ],
    note: "「店家精選」一律標示，每個景點最多 2 則。",
  },
  {
    id: "plan-guide",
    audience: "guide",
    name: "導遊會員",
    tagline: "旅客聽完一個地方的故事，下一步就是想找人帶。",
    priceTwd: null,
    period: "month",
    features: [
      "專業導遊個人頁（服務區域、語言、價格、時段）",
      "導覽主題與自我介紹",
      "使用者評價與服務人次",
      "出現在景點周邊的「私人導遊」清單",
      "LINE / WhatsApp / 電話 / 預約聯絡管道",
      "排序加權：付費曝光 + 通過審核",
    ],
    note: "導遊與包車一次只能啟用一種；商家會員可以同時存在。",
  },
  {
    id: "plan-driver",
    audience: "driver",
    name: "包車會員",
    tagline: "行程排好了，剩下的問題是誰來開車。",
    priceTwd: null,
    period: "month",
    features: [
      "專業司機個人頁（車型、座位數、服務區域）",
      "招牌路線與價格區間",
      "使用者評價與服務趟數",
      "出現在景點周邊的「包車司機」清單",
      "LINE / WhatsApp / 電話 / 預約聯絡管道",
      "排序加權：付費曝光 + 通過審核",
    ],
    note: "導遊與包車一次只能啟用一種；商家會員可以同時存在。",
  },
];

export const BY_PLAN: Record<string, SubscriptionPlan> = Object.fromEntries(
  SUBSCRIPTION_PLANS.map((p) => [p.id, p]),
);

export const planFor = (audience: PlanAudience): SubscriptionPlan =>
  SUBSCRIPTION_PLANS.find((p) => p.audience === audience) ?? SUBSCRIPTION_PLANS[0];

/* The 推薦夥伴 rule used to be a sentence exported from here and printed at the
   foot of five screens. It now lives in data/info.ts as two sentences behind an
   ⓘ — the rule itself is unchanged and still enforced by
   `isVerifiedPartner()` in lib/nearby.ts. */
