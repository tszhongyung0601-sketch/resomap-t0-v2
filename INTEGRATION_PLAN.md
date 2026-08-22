# ResoMap T0 V2 — 整合計畫

**目標**：把 `resomap-http-demo` 的**功能、資料模型與互動流程**移植進 `resomap-t0-demo` 的
**設計系統、首頁與導航**，產出單一產品 `resomap-t0-v2`。

**最高原則**：T0 = 外觀，HTTP = 功能。最終要是
**T0 Design + HTTP Functionality**，不是 T0 Homepage + HTTP Pages。

---

## 1. T0 tech stack

| 項目 | 內容 |
|---|---|
| Framework | React 19 · Vite 8（Rolldown）· TypeScript · Tailwind 4 |
| 地圖 | Leaflet 1.9 + react-leaflet 5，OSM raster tiles |
| 語音 | Web Speech API（`SpeechSynthesisUtterance`），一句一 utterance |
| Build | `tsc -b && vite build`，`base: '/resomap-t0-demo/'` → V2 改 `/resomap-t0-v2/` |
| Lint | oxlint |
| 圖片 | `public/photos/` 53 張 CC 授權真照片（webp，card 600px / hero 1600px），另有 `Generated` 海報圖 fallback |
| 相依 | 只有 leaflet / react-leaflet。**沒有** router、狀態管理、UI kit、icon library |

## 2. T0 component architecture

```
components/
  AppShell.tsx   <520px 全螢幕；≥520px 畫 393×852 手機外框（zoom 縮放，非 transform）
                 OverlayHost 讓深層 Sheet portal 到 shell 上方（否則會被 tab bar 蓋住）
  ui.tsx         Screen TopBar Section Button Card Thumb Chip Tabs Segmented
                 Avatar Sheet Empty Row Tag Note StoryBadge Headphones
                 全部預設無邊框無陰影，層級靠背景 / 間距 / 字級
  MapView.tsx    全 App 唯一的地圖。MapPin { poi, order?, sponsored?, tone? }
  Cover.tsx      Generated（硬邊色塊海報）→ PoiImage（有真照片就換）→ PhotoCredit
  DealCard.tsx   商業卡片 + OutboundSheet（模擬外連 → 模擬成交）
  Story.tsx      ArrivalSheet + StoryPlayer
  BrandBar.tsx   橘色列（品牌，不是動作）+ 漢堡選單
  AdaptCard.tsx  旅途中的 Action Card
```

**規則**：新元件一律先問「T0 有沒有」。有就 reuse，沒有才抽；抽出來放 `components/`，
不改動 `ui.tsx` 既有 export 的行為（只新增）。

## 3. T0 navigation

- **無 router library**。`nav.ts` 定義 `Route` union，`App.tsx` 持有 `stack: Route[]` + `tab: Tab`。
- Bottom nav 四個 tab：**探索 / 導覽庫 / 行程 / 一起規劃**。
- **地圖與我的不是 tab**：地圖在 BrandBar 漢堡選單，我的在 BrandBar 右上頭像。
- 沒有浮動 AI 按鈕（T0 刻意移除過）。
- 螢幕之間只透過 `Nav` context 的 `go / back / tab` 溝通，screen 不認得 App.tsx。

**V2 不動這個結構。** 新功能全部掛在「地點」與「我的」底下。

## 4. T0 map flow

```
Explore 首頁地圖（380px 區塊，非全螢幕）
  無旅程 → 全台八個城市 anchor pin，pin 顏色 = 該城市有無語音故事，附 PinLegend
  有旅程 → 該城市，pin = 這趟會去的地方（白色 emoji pin，會叢集）
  → 點 pin → dest 或 poi

地圖分頁（BrandBar 選單 → 在地圖上找）
  搜尋列 + 五個 chip 篩選 + 更多篩選 Sheet
  → 點 pin → 底部選取卡 → 查看 → Poi
```

叢集是自寫 grid clustering（`lib/geo.ts`），`spread` 可關閉。
Leaflet container 帶 `isolation: isolate`，否則它的 pane（z 400–700）會蓋掉上層 UI。

## 5. T0 itinerary flow

```
行程 tab → Trips 列表 → TripHome（每日卡 + 旅費 + 共編 + 這趟需要的）
  → DayPlan（時間軸：StopRow 有「聽故事」「怎麼走」，可拖拽編輯）
  → TripRouteMap（路線圖，橘色虛線）
Today Mode（進行中的旅程專用）
AdaptCard（旅途重排）— previewAdapt() 同時產生「AI 承諾的時間」與「套用後的行程」
```

硬規則：**卡片上的數字與時間軸來自同一個計算**；已排好的行程用位移不重算；
每段步行距離由真實座標推導。

## 6. T0 design tokens

`src/index.css` 的 `@theme`：

| token | 值 | 用途 |
|---|---|---|
| `--color-bg` | `#ffffff` | 頁面底 |
| `--color-surface` | `#f6f6f5` | 卡片 |
| `--color-surface-2` | `#efeeec` | 卡片按下 / 次要標籤 |
| `--color-line` | `#e7e5e2` | 分隔線 |
| `--color-ink` | `#16150f` | 主文字 |
| `--color-ink-2` | `#5c584f` | 次文字 |
| `--color-ink-3` | `#918c83` | 註解 |
| `--color-brand` | `#ff6210` | 主要 CTA / 選中 / AI |
| `--color-brand-press` | `#e2540a` | 按下 |
| `--color-brand-wash` | `#fff1e8` | 極淡橘底 |
| `--color-ok` / `--color-warn` | `#0e9f6e` / `#b45309` | 狀態 |
| `--radius-card` | `16px` | 卡片圓角（`rounded-2xl`） |

字級：11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 14.5 / 15 / 15.5 / 17 / 19 / 20 / 22 / 24 px。
按鈕高度 `h-13`（52px），觸控目標 ≥44px（小 pill 用 `after:-inset-y-*` 撐開）。
**陰影只有三處**：手機外框、搜尋列、Segmented 的選中片。卡片一律無陰影。

**橘色預算**：一個畫面只能有一個填色橘色的東西。

## 7. T0 existing features

探索首頁・目的地・OSM 地圖・搜尋・建立行程・行程時間軸・拖拽編輯・加入景點・
AI 動態重排・語音導覽（15 篇，30 秒 / 完整雙版本）・導覽庫・收藏・
旅伴偏好・AI 共識・分頭行動・雲端共編模擬・記帳分帳・
Affiliate 入口 + 模擬 funnel + 營運數據・優惠頁・優惠券・九語 i18n・Demo 情境面板。

## 8. HTTP feature inventory

來源：`app.js`（429 行）+ `CODEX_PROMPT.md` + `PRESENTATION_FLOW.md`。

| # | 功能 |
|---|---|
| 1 | 地圖首頁，pin 分「有語音（藍）/ 無語音（黑）」 |
| 2 | 景點語音頁：名稱 / 地址 / 封面 / 搜尋 / 語音清單 / `+` |
| 3 | 付費商家置頂語音 2 則，「店家精選」章 |
| 4 | 多語語音（中 / 日 / Filipino / Indonesia / ไทย / 한국어） |
| 5 | 語音播放器：進度、時長、播放次數、喜歡、不推、留言、分享 |
| 6 | 播完 → 探索附近 |
| 7 | 新增語音流程（選檔 → 下一步 → 送審） |
| 8 | 周邊推薦，5km / 10km |
| 9 | ResoMap 付費服務：餐廳 / 旅館 / 土產店 / 包車 / 導遊 |
| 10 | 聯盟合作：Booking / Agoda 旅館、Klook / KKday local tour |
| 11 | 商家列表 + 詳情 Modal |
| 12 | 商家 CTA：查看詳情 / 導航前往 / 立即聯絡 |
| 13 | 包車司機（車型、座位、路線、價格、時段） |
| 14 | 私人導遊（主題、服務類型、接待人數） |
| 15 | ResoMap 推薦夥伴標章 |
| 16 | LINE / 預約 / 詳情 |
| 17 | 專業會員個人頁 + 可編輯 |
| 18 | 專業身份擇一（包車 or 導遊） |
| 19 | 使用者評價 Modal |
| 20 | Affiliate 導購說明 Modal |
| 21 | 排序邏輯（**只有文字說明，沒有實作**） |
| 22 | 商業流程說明頁 |

## 9. HTTP reusable logic

| HTTP | V2 去處 |
|---|---|
| `state.range` 5 / 10 | `Nearby` / `NearbyList` 的 `Segmented`，並帶進 route |
| `state.professionalRole` 擇一 | `lib/account.ts` 的 `professionalRole` 單一欄位，結構性保證；商家另有 `merchantMembership`，兩者互不干涉 |
| `audioItems[].featured` 置頂 | `lib/audio.ts`，上限 2 用 `.slice(0, FEATURED_CAP)` 擋在程式裡 |
| `startPlayer()` 進度模擬 | 改接 T0 既有的 `lib/speech.ts`（真的會唸） |
| `editProfileModal()` 欄位 | `Pro.tsx` 的編輯 Sheet |
| `reviewsModal()` | `Reviews.tsx`（獨立 route，不是 modal） |
| `data-action="affiliate"` | `lib/contact.ts` `tryAffiliate()`，有 URL 真的開 |
| `data-action="line/book/contact"` | `lib/contact.ts` `tryContact()` |
| 排序概念（第 21 項） | `lib/nearby.ts` **真的實作** `rankNearbyServices()` |
| `showToast()` / `showModal()` | T0 既有的 toast 與 `Sheet` |

## 10. HTTP reusable mock data

| HTTP | V2 |
|---|---|
| `merchants[]` 欄位結構 | `data/merchants.ts` — **欄位保留**，值改寫成 T0 已有城市並補真座標，14 筆 |
| `drivers[]` / `guides[]` | `data/providers.ts` — 合併成 `Provider`，用 `kind` 區分，11 筆 |
| `audioItems[]` | `data/audio.ts` — 加上可朗讀的 `body`，並用各自語言撰寫 |
| `services[]` paid/partner | `data/nearbyCategories.ts` — 保留兩分，但改成五個「旅客的問題」 |
| Affiliate 商品概念 | `data/affiliateOffers.ts` — 補齊 `productId / affiliateUrl / trackingId / commissionType` |
| `assets/content/*.png` 八張 | **採用**，經 `scripts/build-demo-photos.mjs` 轉成 webp 兩尺寸（18 MB → 1.1 MB） |

## 11. HTTP UI 哪些禁止 reuse

| 禁止 | 理由 |
|---|---|
| `styles.css` 全部 | 一個專案只能有一套 design system |
| 右側 `control-panel`（快速導覽 / 報告摘要 / Mockup Gallery） | V2 是產品，不是簡報 dashboard |
| `assets/mockups/*`、`assets/current/*` | 報告用圖與截圖，產品裡沒有位置 |
| `.bottom-nav`（探索 / 導覽 / 周邊 / 我的） | T0 導航是 source of truth |
| `.phone-frame` / `.statusbar` / `.appbar` | T0 `AppShell` 已經有 |
| `.merchant-card` / `.provider-card` 一次塞滿九行 | V2 做減法：卡片答「是不是這間」，詳情答其他 |
| `.modal-backdrop` 置中 modal | 改用 T0 底部 `Sheet` |
| 「ResoMap 付費服務」當標題 | 商業模式不寫在使用者臉上，改成小灰字 |
| 直接複製 `index.html` / iframe | 明令禁止 |

## 12. V2 component plan

| 新元件 | 建在什麼上面 |
|---|---|
| `components/Trade.tsx` | `PartnerBadge` / `PendingBadge` / `Stars` / `AffiliateBadge` / `ContactSheet` / `DemoLinkSheet`，全部用 `ui.tsx` 的 `Sheet` `Tag` |
| `components/NearbyCards.tsx` | `MerchantCard` / `ProviderCard` / `OfferCard` — 圖在上、字在下，與 `Library` 的 GuideCard 同型 |
| `components/AudioRow.tsx` | `AudioRow`（清單）+ `AudioRowMini`（景點頁預覽） |
| `Cover.tsx` 新增 `SceneCover` | 讓非 POI 實體也能用 T0 的海報圖 |
| `Cover.tsx` 新增 `RecordPhoto` | 真照片優先、海報圖 fallback、`loading="lazy"` |
| `Cover.tsx` 新增 `RecordPhotoCredit` | 借用 T0 真照片時的 CC 出處（授權要求，不是裝飾） |
| `Story.tsx` 內的 `NextUp` | 播完的「接下來想做什麼？」 |
| `Trade.tsx` 的 `InfoButton` / `InfoSheet` | 商業規則的 ⓘ 入口；文案集中在 `data/info.ts` |

## 13. V2 data model

新增到 `src/types.ts`（檔案下半部，有分隔線）：

```ts
Contact          { lineUrl?, whatsappUrl?, phone?, bookingUrl? }
Review           { id, rating, comment, user, date }
Rated            { rating, reviewCount }
AudioGuide       { id, poiId, kind: resomap|merchant|community, title, hook, narrator,
                   language, minutes, clock?, plays, likes, body,
                   merchantId?, featuredOrder?: 1|2, topic? }
Merchant         { id, name, category, destId, area, lat, lng, emoji, tint,
                   photo?, photoFromPoi?, desc, promo?, hours, address, languages,
                   rating, reviewCount, isPaid, reviewStatus,
                   featuredAudioIds?, contact }
Provider         { id, kind: driver|guide, name, org?, initial, color,
                   photo?, photoFromPoi?, destId, area, lat, lng,
                   areas, languages, rating, reviewCount, servedCount, servedUnit,
                   priceFromTwd, priceToTwd, priceUnit, hours, intro, themes,
                   vehicle?, seats?, serviceType?, isPaid, reviewStatus, contact }
AffiliateOffer   { id, kind: hotel|tour, partner, name, productId, affiliateUrl,
                   trackingId, commissionType, commissionRate?, destId, lat, lng,
                   priceTwd, priceUnit, rating, ratingScale, blurb,
                   emoji, tint, photo?, photoFromPoi? }
SubscriptionPlan { id, audience, name, tagline, priceTwd: number|null,
                   period?, features, note? }
```

**Entity 對照**：`Spot = Poi`（沿用）、`AudioGuide`（新，`Story` 仍是 ResoMap 自製導覽的正典）、
`Merchant`、`Provider`、`Review`、`AffiliateOffer`、`SubscriptionPlan`、
`Itinerary = Trip`、`ItineraryStop = Stop`、`User = Traveller` + `lib/account.ts`。

### 三條資料層的硬規則

```ts
// 1. 推薦夥伴不能用買的 —— 這是推導，不是欄位
isVerifiedPartner = isPaid && reviewStatus === "approved"

// 2. 排序（lib/nearby.ts），無 AI、無隨機、可測
score = 0.40·distance + 0.25·rating + 0.15·paidExposure
      + 0.10·verified + 0.10·relevance
// 這組權重不印在旅客的螢幕上。畫面只說「依距離、評價與相關度綜合排序，
// 部分合作內容可能享有較高曝光並會標示」。

// 3. 沒決定的價格就是 null，畫面顯示「價格待確認」
priceTwd: number | null

// 4. 帳號：商家是 Business Account，導遊／包車是 Personal Identity
interface Account {
  membership: "free";
  professionalRole: null | "driver" | "guide";   // 單一欄位 → 天然互斥
  merchantMembership: "inactive" | "active";      // 與上面無關
  profile: ProProfile;
  drafts: AudioDraft[];
}
```

## 14. V2 routes

`nav.ts` 新增九個，既有 route 一個都不動：

```ts
| { k: "audios";     poiId }
| { k: "addAudio";   poiId? }
| { k: "nearby";     poiId }
| { k: "nearbyList"; poiId; cat: NearbyCat; range? }
| { k: "merchant";   id }
| { k: "provider";   id }
| { k: "reviews";    kind: "merchant" | "provider"; id }
| { k: "subscribe";  audience? }
| { k: "pro" }
```

`Nav` 介面新增 `playAudio(audioId)`（與既有 `play(poiId, length)` 並存）。

### 入口（不新增 bottom nav item）

1. 景點頁 → 「語音導覽」區塊 →「全部 N 則」→ `audios`
2. 景點頁 → `導航` 旁的「探索附近」→ `nearby`
3. 語音清單 → 搜尋列旁的「📍 附近」→ `nearby`
4. **播放器播完 → 「接下來想做什麼？」→ 直接進 `nearbyList` 的該分類**
5. 行程 StopRow → 「開始語音導覽」；播完後同一列變「探索附近」
6. 地圖分頁選取卡 → 第二顆「探索附近」
7. 我的 → 訂閱方案 / 專業會員 / 我上傳的語音
8. BrandBar 選單 → 訂閱方案

## 15. Responsive strategy

沿用 T0 的 `AppShell.measure()`，不另外寫斷點：

| 寬度 | 行為 |
|---|---|
| 375 / 390 / 430 | `< 520` → 全螢幕，`env(safe-area-inset-*)` 處理瀏海與 home indicator |
| 768 / 1024 / 1280 / 1440 | `≥ 520` → 393×852 手機外框置中，`zoom` 依視窗高度縮放 |

因此所有新畫面只需要在 **393px 內**排好版。硬規則：

- 橫向 rail 一律 `overflow-x-auto no-scrollbar`。
- 長字串一律 `truncate` / `line-clamp-2`，容器 `min-w-0`。
- 卡片按鈕列 `flex gap-2` + `flex-1`，不用 `grid-cols-3`（三顆中文 CTA 在 393px 會擠爆）。
- 每個可捲動畫面尾端放 `<div className="h-24 shrink-0" />`。
- Sheet 一律用 `ui.tsx` 的 `Sheet`；**播放器內的 sheet 例外**，它是 z-50 全螢幕層，
  portal 出去會被自己蓋住，所以用畫面內的 `PlayerSheet`。
- 觸控目標 ≥44px。

## 16. GitHub Pages strategy

- Repo `tszhongyung0601-sketch/resomap-t0-v2`，branch `main`。
- `vite.config.ts` → `base: '/resomap-t0-v2/'`。改 repo 名就要改這裡。
- `.github/workflows/deploy.yml`：`checkout → setup-node → npm ci → build →
  configure-pages → upload-pages-artifact → deploy-pages`。不用 `gh-pages` branch。
- Pages source 設為 GitHub Actions（`gh api -X POST .../pages -f build_type=workflow`）。
- **SPA refresh 404**：這個 App 沒有 URL router，route stack 全在記憶體，網址永遠是 base，
  所以不存在深層網址 404。仍附 `public/404.html`（導回 base）與 `public/.nojekyll` 保險。
  未來若導入 `react-router`，`404.html` 要改成保留 pathname 的轉址版，或改 hash routing。
- **Asset path**：執行期資產一律 `import.meta.env.BASE_URL + path`（`PoiImage`、`RecordPhoto`
  都這樣做）。絕不寫 `/photos/...`。

## 17. Implementation order

1. 複製 T0 → V2，改 `base` 與 package name，加 `.nojekyll` / `404.html`
2. `types.ts` 新增七個 entity
3. `data/` 七個新檔（merchants / providers / audio / reviews / affiliateOffers /
   subscriptionPlans / nearbyCategories）
4. `lib/` 五個新檔（audio / nearby / contact / reactions / account / photo）
5. `components/`（Trade / NearbyCards / AudioRow / Cover 擴充 / Story 擴充）
6. `screens/` 九個新畫面
7. `nav.ts` + `App.tsx` 接線
8. 既有畫面的入口（Poi / MapTab / MapView / TripTimeline / Profile / BrandBar）
9. 圖片管線（`scripts/build-demo-photos.mjs`）與資料掛圖
10. Performance（chunk splitting + `lazy()` + `loading="lazy"`）
11. 文件、commit 分段、push、Pages、線上驗證

## 18. QA checklist

**建置**
- [x] `npx tsc -b` 零錯誤
- [x] `npm run build` 成功
- [x] `npm run lint` 零 error
- [x] 初始 bundle 由單一 916 kB 切成 entry 250 kB + react 174 kB + leaflet 159 kB + 40 個按需 chunk

**T0 保真**
- [x] 原 repo `resomap-t0-demo` 未被改動
- [x] 首頁 `Explore.tsx` 不在任何 diff 裡 — section 數量、順序、視覺完全一致
- [x] Bottom nav 仍是 探索 / 導覽庫 / 行程 / 一起規劃
- [x] T0 既有 15 個 screen 全部仍可到達
- [x] 沒有第二套 CSS / design token

**新功能**
- [x] 語音清單：店家精選最多 2 則且永遠置頂；搜尋可用；多語
- [x] 播放器：播放 / 暫停 / 進度 / 時長 / 標題 / 景點 / 作者 / 讚 / 不推 / 留言 / 分享
- [x] 播放完成 → 「接下來想做什麼？」五個選項，直接進該分類清單
- [x] 周邊推薦：五個「旅客的問題」+ 圖片型 Category Card，5km / 10km 真的改變清單
- [x] 排序：`rankNearbyServices()` 有可驗證輸出，並在「排序方式」攤開權重
- [x] 商家 / 司機 / 導遊卡片皆為大圖 + 精簡資訊 + 兩顆 CTA
- [x] 推薦夥伴章只出現在 `isPaid && approved`
- [x] 聯絡：有 URL 真的開，沒有出 Demo Sheet
- [x] Affiliate：讀 `affiliateUrl`，目前全空 → Demo Sheet
- [x] 評價頁可從「4.9（128 則評價）」進入
- [x] 訂閱頁四種身份可操作；包車 / 導遊互斥
- [x] 行程 stop → 語音 → 附近 全串通
- [x] Empty state：No Audio / No Merchant / No Driver / No Guide / No Affiliate / No Review
- [x] 沒有 fake dead button

**圖片**
- [x] 商家 / 司機 / 導遊 / 分類卡皆為照片，非 emoji placeholder
- [x] 借用 T0 真照片的一律顯示 CC 出處
- [x] 來源圖 18 MB → 1.1 MB（webp，card 720px / hero 1280px）
- [x] 全部 `loading="lazy"`，載入失敗降級成海報圖

**Responsive**
- [x] 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 皆 `scrollWidth === innerWidth`
- [x] 無按鈕被截、無文字溢出、無 sheet 超出螢幕

**執行期**
- [x] Console 無 error
- [x] 無 broken image
- [x] 無 broken route（40 個 route 宣告 = 40 個處理，每個 `nav.go` 目標都存在）

**部署**
- [x] `main` 已 push，commit 分段
- [x] GitHub Actions deploy 成功
- [x] `https://tszhongyung0601-sketch.github.io/resomap-t0-v2/` 回 200
- [x] 行動版與桌機版主要流程皆可操作

---

## 19. 已知取捨（寫在這裡，不藏起來）

1. **「景美夜市」原本不新增為 POI**。HTTP Demo 的夜市內容掛在 T0 已有的 `饒河街觀光夜市`
   （真座標），多語導覽掛在 `龍山寺` 與 `大稻埕迪化街`。理由：T0 的 79 個 POI 座標都經過驗證。
   第三輪首頁地圖需要新店 / 景美一帶的景點，才補上七個 POI——**同樣是查 OSM 拿到的真座標**，
   來源元素 id 寫在 `poi.tw-north.ts` 的註解裡（見第 20 節）。
2. **訂閱價格一律 `null` → 顯示「價格待確認」**。codebase 沒有正式訂閱價，不自行發明。
3. **行程 stop 的語音按鈕叫「開始語音導覽」**（T0 原為「聽故事」）。需求明確指定字樣，
   功能相同；其餘畫面維持 T0 用語（30 秒 / 試聽 30 秒）。
4. **`MapTab` 的「更多篩選」四項維持「即將推出」**。那是**地圖圖層**篩選，V2 沒有做商家 pin
   圖層；商家改由「探索附近」進入。點亮一個點不出東西的按鈕比留著誠實的標籤更糟。
5. **首頁地圖 pin 用 `hasStory`，地圖分頁用 `hasAudio`**。首頁視覺 100% 保留是最高規則，
   兩張地圖的圖例文字因此不同（「有語音故事」vs「有語音導覽」），兩句話都為真。
6. **人物照片是示意圖**。四張人像是生成影像，不是真實人物；服務者頁與清單底部都標示，
   借用 T0 真照片的則一律附 CC 出處。**沒有任何電話號碼**：假資料裡放一個看起來合理的
   手機號碼，響的是別人的電話。

---

## 20. 首頁地圖：位置感知（第三輪）

### 20.1 為什麼改

探索頁最上面那塊地圖原本畫的是**別的地方**——不是整個台灣的城市錨點，就是你已經排好的行程。
兩種都在回答「等一下要去哪裡」。真正站在街上的人問的是另一個問題：**我現在在哪，附近有什麼可以聽。**

### 20.2 三條原則

1. **打開不跟人要東西。** `getCurrentPosition` 絕不在 mount 時呼叫。第一個畫面就跳權限視窗＝
   被拒絕的權限視窗；在沒有 GPS 的展示筆電上更可能整整卡到 timeout，而使用者看著空白地圖。
   `DEFAULT_DEMO_LOCATION` 在第一幀就在畫面上，真實定位是一顆按鈕。
2. **每個 pin 意思一樣。** 七個景點全部有語音導覽，所以只有一種 pin 語言，因此**不需要圖例**。
   地圖一旦需要一把鑰匙才讀得懂，那把鑰匙就是在替 pin 做它自己該做的事。
3. **它不是另一個 demo。** 點進去落在全站共用的那個景點頁，那條路徑才會把旅客帶進導覽，
   再從導覽結尾帶進周邊推薦。**沒有第二套 player，沒有第二套景點頁。**

### 20.3 檔案切分

| 檔案 | 職責 | 失敗時 |
|---|---|---|
| `data/location.ts` | `DEFAULT_DEMO_LOCATION` / `DEMO_ACCURACY_M` / `DEFAULT_AREA_LABEL` | — |
| `data/nearbyAttractions.ts` | 七個景點，只存 POI id | 解析不到的 id 直接濾掉 |
| `lib/geolocation.ts` | `locate()` | 永不 throw，回 `{ ok: false, reason }` |
| `lib/overpass.ts` | `nearbyOsmPlaces()` | 永不 throw，回 `[]` |
| `lib/geo.ts` | `distance()` / `km()`（既有，未改） | — |
| `screens/MapHome.tsx` | 畫面與狀態 | — |
| `components/MapView.tsx` | `audioIcon` / `context` dot / `MeMarker` / `FlyTo` | — |

`nearbyAttractions.ts` 刻意只存 id：名稱、座標、照片、描述、語音全都已經在
`poi.tw-north.ts` / `imagePrompts.ts` / `stories.ts` 裡，多存一份名字或一組座標，
兩份遲早會不一樣。

### 20.4 座標怎麼來的

開發階段用 Overpass bbox + name regex 查 OpenStreetMap 實際元素，寫進 `poi.tw-north.ts`
並在註解裡留下元素 id（例如碧潭吊橋 `way/1004055340`、白色恐怖景美紀念園區 `relation/6613336`、
裕隆城 `way/1197004281`）。**Runtime 不做 geocoding**：Nominatim 對中文地名的自由文字查詢並不可靠，
而且一個 demo 不該把「地圖上有沒有東西」交給別人的伺服器決定。

### 20.5 Overpass 是加分項，不是相依

成功就合併最多三個、離既有景點 180 m 以上、離藍點 150 m 以上的地點，畫成**小灰點**；
灰點的卡片只說「這個地點還沒有 ResoMap 的語音導覽」＋導航，不做假的 CTA。
超時 / 離線 / 被限流 / CORS / JSON 壞掉——全部同一個答案：空陣列，地圖維持那七個。

### 20.6 z 軸順序

選取中的 pin（1200）> 藍點（1000）> 一般景點 pin（400）> 灰點（0）。
Leaflet 預設用緯度排 marker，所以北邊的 pin 會壓在藍點上面——這幾個數字就是為了推翻那個預設。

### 20.7 fitBounds 與 flyTo 誰說了算

初次進站 `fitBounds` 把七個框進畫面。**只要飛過一次**（定位 / 選取 / 搜尋），
`fit` 就交出控制權——否則 Overpass 回來造成 pin 陣列改變時會再 fit 一次，
把使用者剛剛移到的畫面彈回去。

### 20.8 這一輪沒有動到的

首頁其他 section（導覽 rail / 下一段行程 / 九宮格）、bottom nav、播放器、周邊推薦、
訂閱與專業會員、行程、`resomap-t0-demo`、`resomap-http-demo`。
唯一一處跨區改動：播放器頁首從「色塊 + emoji」改成 `PoiImage`——有照片的景點顯示照片，
沒照片的仍舊落回原本的色塊 emoji，所以其他景點的畫面沒有變。

---

## 21. 周邊卡片改版：目錄式列表（第四輪）

### 21.1 為什麼

原本的卡片是「16:9 大圖 + 三行字」。單張看很好，一列看就不行——圖佔掉每張卡的上三分之一，
一個螢幕塞得下兩張，要比較四位司機就得記得前兩位長什麼樣。

新的骨架是目錄式：左邊 96px 方形照片，右邊是做決定要用的事實，下面一排規格，
底下三顆動作。這個形狀在手機出現以前就存在，因為它就是拿來比較的。

完整規格與每一條取捨：[CARD_SPEC.md](../CARD_SPEC.md)。

### 21.2 規格表不補洞

三格是依 kind 決定的，而且**沒有資料就不出現那一格**：

| | 三格 |
|---|---|
| 包車司機 | 價格區間 / 服務時段 / 車型 |
| 私人導遊 | 價格區間 / 服務時段 / 服務類型 |
| 商家 | 分類 / 營業時間 / 語言 |
| Local tour・旅館 | 價格 / 評分 / 平台 |

商家資料裡沒有價格，所以商家沒有價格格。寫「—」是佔了位置卻什麼都沒說，
編一個價格比那更糟。129 家裡只有 24 家有優惠，所以優惠也不當第三格。

### 21.3 標籤帶單位，數值只放數字

`價格區間 / 半日` 配 `NT$ 2,500–6,500`，而不是把 `/ 半日` 也塞進數值。
兩個都放進數值時，93px 的格子會斷成三行，三格就一起變成 77px 高，
整張卡多 16px 而資訊沒有變多。`車型 · 7 人座` 配 `TOYOTA Alphard` 同理。

推薦夥伴徽章在卡片上省掉「ResoMap」四個字也是同一件事：375px 下完整字樣
讓名字只剩 69px，「阿誠包車旅遊」被截成「阿誠包…」——徽章贏了一場它不該參加的爭論。
詳情頁維持完整字樣，ⓘ 兩邊都開得到規則。

### 21.4 這一輪推翻了兩條自己定的規則

1. **卡片減法**（第三輪定的）。現在資訊量往回加：三格規格、自我介紹、主題 chips。
2. **一個畫面只能有一顆實心橘按鈕**（T0 原本的硬規則）。現在一列五張卡就是五顆橘按鈕。

兩條都是看過版面截圖之後拍板的。代價寫在 CARD_SPEC.md 第 3 節：往下滾時橘色一直出現、
畫面焦點會散；要收回來最小的改動是把中間那顆改成橘色描邊。

沒有跟著改的是**顏色**：截圖的藍色標題與藍色人名不採用，標題與人名都是 T0 的 `ink` 黑字。
V2 只有一套色系，加藍會跟橘色 header、橘色按鈕、橘色 tab 打架。
「LINE 聯絡」也不用 LINE 綠，理由一致——Klook 與 Booking 在這個 app 裡也是純文字。

### 21.5 三顆 CTA 背後都要有東西

`立即預約` 與 `前往 Klook` 對應的 URL 欄位全是空的，所以它們讀欄位、開既有的說明 sheet，
講清楚接上之後會發生什麼。這是 V2 從第一輪就定的作法，不是新的妥協。

`加入行程` **沒有做**。行程的 `Stop` 只認 `poiId`，要讓它存一日遊會動到時間軸、
路線計算、地圖 pin 與分帳——那是資料模型改，不是版面改。那一顆換成 `收藏`，
而收藏能收 offer 是這一輪真的加的（`lib/saved.ts` 從兩個集合變三個）。

平台商品也因此第一次有了自己的詳情頁：商家與服務者本來就有，只有它沒有。

---

## 22. 人像：從插畫換成圖庫真人照（第五輪）

### 22.1 為什麼不是 Wikimedia

Commons 上有真人照片，也有 CC 授權。但 **CC 授權給的是攝影師的著作權，不是被拍者的肖像權**。
一張紀實街拍的主角沒有簽過任何東西，把他的臉掛在「阿誠包車旅遊 ★4.9（128 則評價）」上，
就是讓一個真實存在的人替一門虛構生意背書——而卡片被截圖傳出去時，頁尾那句免責不在畫面裡。

圖庫模特兒不一樣：他們簽的授權內容**正是**「被用來扮演不是自己的人」。
所以這一輪用 Pexels，不用 Commons。

### 22.2 查詢句型是試出來的，三種失敗都留著

| 查詢 | 回來的東西 |
|---|---|
| `asian man van driver` | 歐洲快遞員。圖庫沒有「台灣包車司機」這種庫存，它會回答最接近的職業 |
| `east asian middle aged man portrait` | 歐洲男性。五個修飾詞會稀釋掉第一個詞，索引就不理它了 |
| `korean man portrait` | 韓國臉，但短的藝術類查詢背後是編輯與街拍：韓服、歌舞伎、路人。臉對了，語域錯了，肖像授權問題又回來了 |
| **`asian + 年齡 + man/woman + 服裝 + 背景`** | **對的**。這落在圖庫「拍給廣告用」的那一塊：素色背景、polo 衫、看起來在做一份工作的人 |

五個字，多一個修飾詞就少一分第一個詞的效力。

### 22.3 API 驗不了的事，跟驗得了的事

**驗不了族群。** Pexels 的 alt 文字八十筆裡大概零筆會寫 "asian"，
所以「alt 必須包含 asian」這條規則一開始把四十張全部濾掉。改成偏好：
先跑一趟只看有寫的，沒有才退回全部。剩下的交給查詢句型。

**驗得了的**：性別（alt 會寫，且可靠）、紀實街拍（`street`／`market`／`monk`／`costume` 等詞，
**要加字界**——沒加的話 `sign` 會吃掉 design、`field` 吃掉 fields，一樣把四十張全濾掉）、
語域（黑白、時尚、側臉、閉眼、兩個人、裸上身）、亮度（`avg_color` 推算，
擋掉全黑戲劇光與過曝，四十張才會像同一組）。

**去重要兩層**：照片 id 與**攝影師 id**。圖庫搜尋會一次回傳整組拍攝——同一個模特兒、
同一面牆的六張——只去重照片 id 的話，同一張臉會掛兩個名字，比原本借風景更糟。

### 22.4 最後一關是人在看

以上全部是代理指標，沒有一個看得見臉。所以流程留了兩個逃生口：

- `p-acheng:3` — 跳過前三個通過過濾的候選
- `p-acheng=11563145` — 直接指定某一張 Pexels 照片

實際跑起來是四十張抓完 → 併成一張聯絡表 → 用眼睛看 → 重抽或指定。
從第一版到可用大概四輪，主要修掉的是族群漂移（南亞、歐洲）與語域漂移（西裝、時尚、街拍）。

### 22.5 兩格改了選角

`p-chenggong-guide`（Ina，六十幾歲阿美族）與 `p-taroko-car` 卡在圖庫最薄的兩個帶：
**長者東亞女性在商業棚拍裡幾乎不存在**，該關鍵字下整批是紀實街拍。
與其取用沒有授權的紀實照，不如把年齡帶往下調——選角本來就是為了讓四十個人不一樣，
一張臉讀起來是幾歲，跟「把別人的阿嬤發佈成虛構導遊」比起來不值一提。

### 22.6 插畫沒有刪

`scripts/draw-portraits.mjs` 還在，而且會自動跳過已經有照片的人。
它給的是圖庫換不到的東西：對的人在對的地方——七星潭的礫石灘、太魯閣的大理石峽谷、
四點半的天色。真人照給的是對的人在隨便哪裡。兩個都留著，因為這是一組真實的取捨，
不是一個被淘汰的版本。
