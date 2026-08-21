# ResoMap T0 V2 — 整合計畫

**目標**：把 `resomap-http-demo` 的**功能、資料模型與互動流程**移植進 `resomap-t0-demo` 的
**設計系統、首頁與導航**，產出單一產品 `resomap-t0-v2`。

**最高規則**：T0 是唯一 Source of Truth。HTTP Demo 只提供 Feature Spec / Logic / Data，
**不提供任何一行 CSS、任何一個 HTML 片段、任何一張畫面**。

---

## 1. T0 現有架構

| 層 | 內容 |
|---|---|
| Framework | React 19 · Vite 8 · TypeScript · Tailwind 4 · Leaflet（OSM raster tiles）· Web Speech API |
| Build | `tsc -b && vite build`，`base: '/resomap-t0-demo/'` → V2 改 `/resomap-t0-v2/` |
| 路由 | **無 router library**。`src/nav.ts` 定義 `Route` union + `Nav` context，`App.tsx` 持有 `stack: Route[]` 與 `tab: Tab`。`go/back/tab` 三個動作。 |
| 導航 | Bottom nav 四個 tab：**探索 / 導覽庫 / 行程 / 一起規劃**。地圖與我的**不是** tab（在 BrandBar 漢堡選單與 route 裡）。無浮動 AI 按鈕。 |
| Shell | `AppShell.tsx`：<520px 全螢幕；≥520px 畫出 393×852 手機外框（`zoom` 縮放，非 `transform: scale`）。`OverlayHost` 讓深層 `Sheet` portal 到 shell 上方。 |
| State | React `useState` in `App.tsx`（trips / overlays）+ 三個 module store（`lib/saved.ts`、`lib/track.ts`、`Expenses.tsx` 的 receipts），皆用 `useSyncExternalStore` + localStorage。**無 Redux / Zustand。** |
| i18n | 九語，**繁中原文即 key**（`t("開始今天行程")`），缺字自動 fallback。 |
| Design tokens | `src/index.css` `@theme`：`--color-bg #fff`、`surface #f6f6f5`、`surface-2 #efeeec`、`line #e7e5e2`、`ink #16150f`、`ink-2 #5c584f`、`ink-3 #918c83`、`brand #ff6210`、`brand-press #e2540a`、`brand-wash #fff1e8`、`radius-card 16px`。 |
| UI kit | `components/ui.tsx`：`Screen TopBar Section Button Card Thumb Chip Tabs Segmented Avatar Sheet Empty Row Tag Note StoryBadge Headphones`。全部預設無邊框無陰影，層級靠背景 / 間距 / 字級。 |
| 地圖 | `components/MapView.tsx` 是**全 App 唯一的地圖**。`MapPin { poi, order?, sponsored?, tone? }`，自寫 grid clustering。 |
| 卡片圖 | `components/Cover.tsx`：`Generated`（硬邊色塊海報）→ 有真照片就換 `PoiImage`，附 `PhotoCredit`（CC 授權）。 |
| 商業 | `DealCard` + `OutboundSheet`（模擬外連 → 模擬成交 → 寫入 `lib/track.ts` funnel）。 |
| 語音 | `data/stories.ts` 15 篇；`lib/speech.ts` 一句一 utterance；`components/Story.tsx` = `ArrivalSheet` + `StoryPlayer`。 |
| 資料 | `src/data/` 79 POI（真座標）、12 城市、deals、affiliateProducts、travellers、trips、coupons、coedit、expenses。 |

### T0 硬規則（V2 必須繼續遵守）
1. `button { color: inherit }` 必須待在 `@layer base`。
2. 地圖必須有自己的 stacking context（`isolation: isolate`）。
3. 卡片上的數字與時間軸來自同一個計算。
4. 距離一律由座標算出，不寫死。
5. `ticketed` 只給真的賣門票的地方。
6. 商業內容一定標示（`Tag kind="sponsored" | "demo" | "later"`）。
7. **不宣稱不存在的合作關係。**
8. 一個畫面只有一顆填色橘色按鈕。

---

## 2. HTTP Demo 功能列表（來源：`app.js` 429 行 + `CODEX_PROMPT.md` + `PRESENTATION_FLOW.md`）

| # | 功能 | 邏輯 / 資料 |
|---|---|---|
| 1 | 地圖首頁 + Spot Pin（藍＝有語音、黑＝無語音） | `mapView()`、`.pin.audio` / `.pin.empty` |
| 2 | 景點語音頁 | `scenicView()`：景點名 / 地址 / 封面 / 搜尋框 / 語音清單 / `+` |
| 3 | 付費商家置頂語音（最多 2 則，「店家精選」章） | `audioItems[].featured` |
| 4 | 多語語音（中文 / 日本語 / Filipino / Indonesia / ไทย / 한국어） | `audioItems[].lang` |
| 5 | 語音播放器（進度 / 時長 / 播放次數 / 喜歡 / 不推 / 留言 / 分享） | `playerView()` + `startPlayer()` |
| 6 | 播放完 → 探索附近 | `playerView()` 底部 `data-view="nearby"` |
| 7 | 新增語音流程 | `uploadView()` → 選檔 → 下一步 → 送審 modal |
| 8 | 周邊推薦（5km / 10km） | `nearbyView()` + `state.range` |
| 9 | ResoMap 付費服務：餐廳 / 旅館 / 土產店 / 包車 / 導遊 | `services[].kind === 'paid'` |
| 10 | 聯盟合作：Booking / Agoda 旅館、Klook / KKday Local tour | `services[].kind === 'partner'` |
| 11 | 商家列表 / 詳情 | `merchants[]`、`merchantCard()`、`merchantDetail()` |
| 12 | 商家 CTA：查看詳情 / 導航前往 / 立即聯絡 | `data-action="merchant-detail|navigate|contact"` |
| 13 | 包車司機（車型 / 座位數 / 路線 / 價格 / 時段） | `drivers[]` |
| 14 | 私人導遊（主題 / 服務類型 / 接待人數） | `guides[]` |
| 15 | ResoMap 推薦夥伴標章 | `.partner-badge` |
| 16 | LINE / 預約 / 詳情 | `data-action="line|book|provider-detail"` |
| 17 | 專業會員個人頁 + 可編輯 | `profileView()` + `editProfileModal()` |
| 18 | 專業身份**擇一**（包車 or 導遊） | `state.professionalRole` |
| 19 | 使用者評價（4.8 / 86 則） | `reviewsModal()` |
| 20 | Affiliate 導購說明 | `data-action="affiliate"` |
| 21 | 排序邏輯：距離 + 評價 + 付費曝光 + 綜合 | `reportView()` 第 5 條（**只有文字說明，沒有實作**） |
| 22 | 商業流程說明頁 | `reportView()` |

### 不移植（明確排除）
- 右側 `control-panel`：快速導覽、報告摘要、Mockup Gallery → **全部刪除**。V2 是產品，不是簡報。
- `styles.css` 全部（橘 `#f47b20` / 藍 `#2b87b9` 雙主色、`.phone-frame`、`.presentation-shell`）→ 用 T0 tokens。
- `assets/mockups/*`、`assets/current/*` → 報告用圖，產品裡沒有位置。
- `assets/content/*.png`（AI 生成的店家 / 司機 / 導遊照片）→ **不引入**。理由：T0 只出兩種圖，
  一是 CC 授權真照片（一定附 `PhotoCredit`），二是 `Generated` 海報圖。塞進來源不明的人物照
  會同時違反 T0 的視覺語言與它的誠實規則。V2 用 `Generated` 色塊圖 + `Avatar` 縮寫。

---

## 3. T0 已有的功能（不重做，只延伸）

| 功能 | T0 現況 |
|---|---|
| 首頁 | `Explore.tsx`：BrandBar → 地圖區塊（380px）→ 導覽 rail → 行程卡 → 九宮格服務。**V2 完全不動視覺、不加 section。** |
| 地圖 | `MapTab.tsx` + `MapView.tsx`，四個篩選 + 底部清單 + 贊助 pin 虛線環 |
| 景點頁 | `Poi.tsx`：Hero / 收藏 / 描述 / 語音卡（30 秒・完整）/ AI 情境圖 / 導航 / 門票 / 在地優惠 / 附近 / 加入行程 |
| 語音 | `Story.tsx` `StoryPlayer`：語言切換、字幕高亮、seek、收藏、分享、播放次數 |
| 導覽庫 | `Library.tsx`：城市 / 主題兩排 chip + 卡片 + 加入行程 |
| 行程 | `TripTimeline.tsx`：`TripHome` / `DayPlan` / `StopRow`（聽故事・怎麼走）/ 拖拽編輯 |
| 抵達 | `ArrivalSheet` |
| Affiliate | `DealCard` + `OutboundSheet` + `lib/track.ts` funnel + `BusinessDemo.tsx` |
| 收藏 | `lib/saved.ts` |
| 評價 | 只有 `lib/story.ts` 的 `rating()`（由 likes/plays 推導），**沒有 review 清單** |
| 訂閱 | **沒有** |

---

## 4. V2 要新增的功能

| # | 功能 | 新檔案 |
|---|---|---|
| N1 | 景點語音清單頁（多則 / 多語 / 搜尋 / 置頂） | `screens/Audios.tsx` |
| N2 | 統一語音播放器（含不推 / 留言 / 播完 CTA） | 擴充 `components/Story.tsx` |
| N3 | 付費商家置頂語音（最多 2 則，「店家精選」章） | `data/audio.ts` + `lib/audio.ts` |
| N4 | 新增語音流程（6 步） | `screens/AddAudio.tsx` |
| N5 | 周邊推薦頁（5km / 10km） | `screens/Nearby.tsx` |
| N6 | 周邊分類清單（餐廳 / 旅館 / 土產 / 包車 / 導遊 / 聯盟旅館 / Local tour） | `screens/NearbyList.tsx` |
| N7 | 商家詳情 | `screens/Merchant.tsx` |
| N8 | 服務者詳情（司機 / 導遊共用） | `screens/Provider.tsx` |
| N9 | 評價頁 | `screens/Reviews.tsx` |
| N10 | 訂閱方案頁 | `screens/Subscribe.tsx` |
| N11 | 專業會員頁（身份擇一 + 編輯） | `screens/Pro.tsx` |
| N12 | 排序引擎 `rankNearby()` | `lib/nearby.ts` |
| N13 | 真實 URL 外連（LINE / WhatsApp / 電話 / 預約 / Affiliate） | `lib/contact.ts` |
| N14 | 讚 / 不推 / 留言的本地狀態 | `lib/reactions.ts` |
| N15 | 訂閱與專業身份的本地狀態 | `lib/account.ts` |
| N16 | 地圖 pin 區分有無語音（延伸到 `MapTab`） | 改 `MapView.tsx` + `MapTab.tsx` |

---

## 5. 可以 reuse 的 HTTP logic

| HTTP Demo | V2 去處 | 備註 |
|---|---|---|
| `merchants[]`（名稱 / 距離 / 評分 / 簡介 / 優惠 / 營業時間 / 地址 / 語言） | `data/merchants.ts` | **欄位結構保留**，值改寫成 T0 已有城市（台北 / 台南 / 花蓮）並補**真座標** |
| `drivers[]` / `guides[]` | `data/providers.ts` | 合併成單一 `Provider`，用 `kind` 區分 |
| `audioItems[]`（featured / lang / duration / likes） | `data/audio.ts` | 加上 `body`（可朗讀句子）以接 T0 `lib/speech.ts` |
| `services[]`（paid / partner 分組） | `data/nearbyCategories.ts` | 保留 paid / partner 二分 |
| `state.range` 5 / 10 | `Nearby.tsx` 的 `Segmented` | T0 已有 `Segmented` 元件 |
| `state.professionalRole` 擇一 | `lib/account.ts` | 由 plan 結構性保證擇一 |
| `editProfileModal()` 欄位 | `Pro.tsx` 的編輯 Sheet | 用 T0 `Sheet` |
| `reviewsModal()` | `Reviews.tsx` + `data/reviews.ts` | 變成一個 route，不是 modal |
| `affiliate` 導購說明 | `lib/contact.ts` + `OutboundSheet` 風格 | 有 URL 就真的開，沒有就 Demo Modal |
| 排序概念（第 21 項） | `lib/nearby.ts` **實作** | HTTP Demo 只有文字，V2 真的算 |
| `showToast()` | `App.tsx` 已有 `say()` toast | 直接用 T0 的 |
| `showModal()` | T0 `Sheet` | 底部 sheet，不是置中 modal |

---

## 6. 必須重做的 UI（一行 HTTP CSS 都不留）

| HTTP Demo 元件 | V2 做法 |
|---|---|
| `.phone-frame` / `.statusbar` / `.appbar` | 已有 `AppShell` + `StatusBar` + `TopBar` / `BrandBar` |
| `.bottom-nav`（探索/導覽/周邊/我的） | **不採用**。維持 T0 四 tab |
| `.audio-card` / `.feature-badge` | `AudioRow` — `Thumb` + T0 字級 + `Tag` |
| `.merchant-card`（一次塞滿所有資訊） | `MerchantCard` — 圖 / 名稱 / 距離 / 星等 / 分類 / 一行簡介 / 優惠 / 語音章 + 兩顆 CTA。**其餘進 detail** |
| `.provider-card`（一次塞滿所有資訊） | `ProviderCard` — 頭像 / 名稱 / 推薦夥伴章 / 評分 / 語言 / 起價 / 服務區 or 主題 + LINE + 查看詳情 |
| `.service-row` | T0 `Row` / `Card` |
| `.range-toggle` | T0 `Segmented` |
| `.modal-backdrop` / `.modal` | T0 `Sheet` |
| `.toast` | T0 `App.tsx` toast |
| `.progress` / `.player-controls` | T0 `StoryPlayer` 既有的進度條與控制列 |
| `.form-grid` / `.role-options` | T0 `Sheet` + `Chip` + 原生 input（沿用 `CreateTrip.tsx` 的輸入樣式） |
| 右側 `control-panel` | **刪除** |

---

## 7. Data model

新增到 `src/types.ts`：

```ts
/* 聯絡管道 —— 有 URL 就真的開，沒有就 Demo Sheet */
interface Contact { lineUrl?: string; whatsappUrl?: string; phone?: string; bookingUrl?: string }

interface Review { id; rating: number; comment: string; user: string; date: string }

type AudioKind = "resomap" | "merchant" | "community";
interface AudioGuide {
  id; poiId; kind: AudioKind;
  title; hook; narrator; language;      // "中文" 才會真的出聲
  minutes; seconds; plays; likes;
  body;                                  // 句子用 "|" 串，接 lib/speech.ts
  merchantId?; featuredOrder?: 1 | 2;    // 只有 kind === "merchant"
  topic?: "intro" | "product" | "founder" | "promo";
}

type MerchantCategory = "restaurant" | "hotel" | "souvenir";
interface Merchant {
  id; name; category; destId; area; lat; lng; emoji; tint;
  desc; promo?; hours; address; languages: string[];
  rating; reviewCount; isPaid; reviewStatus: "approved" | "pending";
  featuredAudioIds?: string[];           // 最多 2
  contact: Contact;
}

type ProviderKind = "driver" | "guide";
interface Provider {
  id; kind; name; org?; initial; color; destId; area; lat; lng;
  areas: string[]; languages: string[];
  rating; reviewCount; servedCount; servedUnit;
  priceFromTwd; priceToTwd; priceUnit; hours; intro;
  themes: string[];                      // 司機＝路線，導遊＝主題
  vehicle?; seats?;                      // 司機
  serviceType?;                          // 導遊
  isPaid; reviewStatus: "approved" | "pending" | "rejected";
  contact: Contact;
}

interface AffiliateOffer {
  id; kind: "hotel" | "tour"; partner: PartnerId;
  name; productId; affiliateUrl; trackingId;
  commissionType: "percentage" | "fixed"; commissionRate?;
  destId; lat; lng; priceTwd; priceUnit;
  rating; ratingScale: 5 | 10; blurb; emoji; tint;
}

type PlanAudience = "member" | "merchant" | "guide" | "driver";
interface SubscriptionPlan {
  id; audience; name; tagline;
  priceTwd: number | null;               // null ＝ 價格待確認，絕不自行編價
  period?: "month" | "year";
  features: string[]; note?;
}
```

**Entity 對照**：`Spot = Poi`（沿用）、`AudioGuide`（新，`Story` 依舊是 ResoMap 自製導覽的正典）、
`Merchant`、`Provider`、`Review`、`AffiliateOffer`（新，與既有的 `AffiliateProduct` 門票模型並存）、
`SubscriptionPlan`、`Itinerary = Trip`（沿用）、`ItineraryStop = Stop`（沿用）、`User = Traveller` + `lib/account.ts`。

### ResoMap 推薦夥伴（唯一判準）
```ts
const isVerifiedPartner = (p: { isPaid: boolean; reviewStatus: string }) =>
  p.isPaid && p.reviewStatus === "approved";
```
是**推導**，不是欄位。付費但未過審 → 不掛章。資料集裡刻意放一位 `pending` 的司機，證明規則會生效。

### 排序（`lib/nearby.ts`）
```
score = 0.40 · distanceScore   // 1 - d/radius
      + 0.25 · ratingScore     // (rating - 4) / 1
      + 0.15 · paidExposure    // isPaid ? 1 : 0
      + 0.10 · verifiedScore   // isVerifiedPartner ? 1 : 0
      + 0.10 · relevanceScore  // 語言 / 分類吻合
```
純函式、可測、無 AI、無隨機。權重是具名常數，商業條件改了只改一個地方。

---

## 8. Component plan

| 新元件 | 建在 T0 的什麼上面 |
|---|---|
| `components/AudioRow.tsx` | `Thumb` + `Tag` + `Headphones` |
| `components/MerchantCard.tsx` | `Card` + `Cover.Generated`（透過 `TintCover`）+ `Tag` |
| `components/ProviderCard.tsx` | `Card` + `Avatar` + `Tag` |
| `components/PartnerBadge.tsx` | `Tag` 的同族（`bg-surface-2 text-ink-3`，**不是橘色**） |
| `components/AffiliateCard.tsx` | 沿用 `DealCard` 的排版與 `AFFILIATE_DISCLOSURE` |
| `components/Stars.tsx` | 純文字 ★ + `num`，不畫 SVG 星星陣列 |
| `components/TintCover.tsx` | 直接 export `Cover.tsx` 既有的 `Generated`，讓非 POI 實體也能有海報圖 |
| `components/Field.tsx` | 表單列，沿用 `CreateTrip.tsx` 的輸入樣式 |

**新元件一律先問「T0 有沒有」**。有就 reuse，沒有才抽。抽出來的一律放 `components/`，
並且不改動 `ui.tsx` 既有 export 的行為（只新增）。

---

## 9. Route plan（`nav.ts` 新增，既有 route 一個都不動）

```ts
| { k: "audios"; poiId: string }                       // 景點語音清單
| { k: "addAudio"; poiId?: string }                    // 新增語音
| { k: "nearby"; poiId: string }                       // 周邊推薦
| { k: "nearbyList"; poiId: string; cat: NearbyCat }   // 分類清單
| { k: "merchant"; id: string }                        // 商家詳情
| { k: "provider"; id: string }                        // 司機 / 導遊詳情
| { k: "reviews"; kind: "merchant" | "provider"; id: string }
| { k: "subscribe"; audience?: PlanAudience }          // 訂閱方案
| { k: "pro" }                                         // 專業會員
```

`Nav` 介面新增一個 overlay 動作：`playAudio(audioId: string)`（與既有 `play(poiId, length)` 並存）。

### 入口（**不新增 bottom nav item**）
1. **景點頁 `Poi.tsx`** → 新增「語音導覽」區塊（列出前 3 則，含店家精選置頂）+「全部語音」→ `audios`
2. **景點頁 `Poi.tsx`** → `導航` 旁新增次要 CTA「探索附近」→ `nearby`
3. **語音清單頁** → `周邊推薦` pill → `nearby`
4. **播放器播完** → CTA「探索附近」→ `nearby`
5. **行程 `StopRow`** → 有語音的 stop 顯示「開始語音導覽」；播完後同一列出現「探索附近」
6. **地圖 `MapTab`** 選取景點卡 → 第二顆按鈕「探索附近」
7. **我的 `Profile.tsx`** → 新增三列：`訂閱方案` / `專業會員` / `我的語音`（T0 既有的 drawer pattern）
8. **BrandBar 漢堡選單** → 新增 `訂閱方案`

---

## 10. Responsive strategy

沿用 T0 的 `AppShell.measure()`，不另外寫斷點：

| 寬度 | 行為 |
|---|---|
| 375 / 390 / 430 | `< 520` → 全螢幕手機版，`env(safe-area-inset-*)` 處理瀏海與 home indicator |
| 768 / 1024 / 1280 / 1440 | `≥ 520` → 393×852 手機外框置中，`zoom` 依視窗高度縮放 |

因此**所有新畫面只需要在 393px 內排好版**。硬規則：

- 任何橫向 rail 一律 `overflow-x-auto no-scrollbar`，不用固定寬 grid。
- 長字串一律 `truncate` 或 `line-clamp-2`，容器 `min-w-0`。
- 卡片按鈕列用 `flex gap-2` + `flex-1`，不用 `grid-cols-3`（三顆中文 CTA 在 393px 會擠爆）。
- 每個可捲動畫面尾端放 `<div className="h-24 shrink-0" />`。
- Sheet 一律用 `ui.tsx` 的 `Sheet`（`max-h-[86%]` + portal 到 `OverlayHost`），不自己寫 modal。
- 觸控目標 ≥44px：小 pill 用 `after:absolute after:-inset-y-*` 撐開，不把視覺撐胖。

---

## 11. Deployment strategy

- 新 repo：`tszhongyung0601-sketch/resomap-t0-v2`，branch `main`。
- `vite.config.ts` → `base: '/resomap-t0-v2/'`。
- `.github/workflows/deploy.yml`：`actions/checkout` → `actions/setup-node` → `npm ci` →
  `npm run build` → `actions/configure-pages` → `actions/upload-pages-artifact` → `actions/deploy-pages`。
  （**不用** `peaceiris/gh-pages` 或 `gh-pages` branch 這種舊法。）
- Pages source 設為 GitHub Actions（`gh api -X POST repos/.../pages -f build_type=workflow`）。
- **SPA 路由**：T0 沒有 URL router（route stack 全在記憶體），所以沒有 deep-link 404 問題。
  仍附 `public/404.html` 導回 base、`public/.nojekyll`，避免 Pages 端的意外。
- **Asset path**：所有 runtime 資產一律 `import.meta.env.BASE_URL + path`（`PoiImage` 已經這樣做）。
  絕不寫 `/assets/...` 絕對路徑。

---

## 12. QA checklist

**建置**
- [ ] `npx tsc -b` 零錯誤
- [ ] `npm run build` 成功
- [ ] `npm run lint`（oxlint）零 error

**T0 保真**
- [ ] `resomap-t0-demo` 原 repo 未被改動（V2 是獨立目錄 + 獨立 repo）
- [ ] 首頁 `Explore.tsx` 的 section 數量、順序、視覺與 T0 完全一致（只允許改 button 目的地）
- [ ] Bottom nav 仍是探索 / 導覽庫 / 行程 / 一起規劃
- [ ] T0 既有 15 個 screen 全部仍可到達
- [ ] 沒有第二套 CSS / design token

**新功能**
- [ ] 語音清單：店家精選最多 2 則且永遠置頂；搜尋可用
- [ ] 播放器：播放 / 暫停 / 進度 / 時長 / 標題 / 景點 / 作者 / 讚 / 不推 / 留言 / 分享全可操作
- [ ] 播放完成出現「探索附近」
- [ ] 周邊推薦：5km / 10km 切換會真的改變清單
- [ ] 排序：`rankNearby()` 有單元可驗證的輸出
- [ ] 商家卡片精簡（≤2 顆 CTA），詳情才展開全部資訊
- [ ] 司機 / 導遊卡片精簡，詳情才展開全部資訊
- [ ] 推薦夥伴章只出現在 `isPaid && approved`
- [ ] 聯絡：有 URL 真的 `window.open`，沒有 URL 出 Demo Sheet
- [ ] Affiliate：有 `affiliateUrl` 真的開，沒有出 Demo Sheet
- [ ] 評價頁可從「4.8（86 則評價）」進入
- [ ] 訂閱頁四種身份皆可操作；包車 / 導遊互斥
- [ ] 行程 stop → 語音 → 附近 全串通
- [ ] **沒有任何 fake dead button**

**Responsive**
- [ ] 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 皆無橫向捲軸
- [ ] 無按鈕被截、無文字溢出、無 sheet 超出螢幕

**執行期**
- [ ] Console 無 error
- [ ] 無 broken image（新實體不使用外部圖檔）
- [ ] 無 broken route（每個 `nav.go` 的目標在 `App.tsx` 都有對應 screen）

**部署**
- [ ] `main` 已 push，commit 分段合理
- [ ] GitHub Actions deploy 成功
- [ ] `https://tszhongyung0601-sketch.github.io/resomap-t0-v2/` 回 200
- [ ] 該網址在行動版與桌機版都能操作主要流程

---

## 13. 已知取捨（寫在這裡，不藏起來）

1. **不引入 HTTP Demo 的 `assets/content/*.png`**。理由見 §2。商家與服務者用 `Generated` 海報圖與
   `Avatar` 縮寫，與 T0 「不放來源不明照片」的規則一致。
2. **`景美夜市` 不新增為 POI**。HTTP Demo 的夜市內容改掛在 T0 已有的 `饒河街觀光夜市`（真座標），
   多語導覽掛在 `龍山寺` 與 `大稻埕迪化街`。理由：T0 的 79 個 POI 座標都經過驗證，
   為了搬一段 demo 文案而新增一個未驗證的點，會破壞 T0「座標全部是真的」這條規則。
3. **訂閱價格一律 `null` → 顯示「價格待確認」**。Codebase 裡沒有任何正式訂閱價，不自行發明。
4. **行程 stop 的語音按鈕改叫「開始語音導覽」**（原 T0 是「聽故事」）。這是需求明確指定的字樣，
   功能與目標完全相同，其餘畫面（景點頁 30 秒 / 導覽庫 試聽 30 秒）維持 T0 用語。
5. **`MapTab` 的「更多篩選」四項維持 `即將推出`**。那是**地圖圖層**篩選，V2 沒有做商家 pin 圖層；
   商家改由「探索附近」進入。把它點亮但點不出東西才是假按鈕。
