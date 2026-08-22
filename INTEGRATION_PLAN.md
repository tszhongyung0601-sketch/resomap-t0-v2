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
| `state.professionalRole` 擇一 | `lib/account.ts`，由「只有一個 `plan`」結構性保證 |
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

// 3. 沒決定的價格就是 null，畫面顯示「價格待確認」
priceTwd: number | null
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

1. **「景美夜市」不新增為 POI**。HTTP Demo 的夜市內容改掛在 T0 已有的 `饒河街觀光夜市`
   （真座標），多語導覽掛在 `龍山寺` 與 `大稻埕迪化街`。理由：T0 的 79 個 POI 座標都經過驗證。
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
