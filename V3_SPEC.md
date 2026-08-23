# ResoMap V3 — 實作規格

V2 是母版。這一輪是**功能升級，不是 UI 改版**：品牌色、橘色 header、字體、手機外框、
bottom nav 四個 tab、卡片樣式、圓角、間距、既有圖片、探索頁、導覽庫 UI 全部不動。

---

## 0. 先講清楚：這份 V3 prompt 有 70% V2 已經有了

原始 prompt 是對著舊的 `resomap-http-demo`（純 HTML/JS）寫的——裡面提到
「請完整閱讀所有 HTML / CSS / JS」「`showView("library")`」「不要把程式塞進單一新 HTML」，
附的截圖也是那個 demo 的畫面（底部五個 tab）。V2 是 React + TypeScript + Vite，
有自己的 route stack。**照產品意圖做，不照 `showView()` 做。**

八個 agent 逐檔核對之後，已經存在的：

| V3 要求 | V2 現況 |
|---|---|
| Day 1/2/3 行程結構與時間軸 | `Trip`/`Day`/`Track`/`Stop` + `TripTimeline.tsx`（1352 行） |
| 上移 / 下移 / 刪除 / 改時間 | `lib/reorder.ts` |
| 加入行程的 Day 選擇 sheet | `AddToTripSheet`（Library.tsx:271），會標示「Day N 已經有這個地點」 |
| 加入後的 toast | `say()`（App.tsx:122），2200ms |
| 導覽庫卡片全部元素 | 城市/主題篩選、大圖、名稱、描述、城市·分類、★評分、播放次數、分鐘、試聽 30 秒、加入行程 |
| 點卡片進景點詳情 | Library.tsx:187（但只有上半部可點，見 §7） |
| 周邊推薦框架 | 七個分類、5km/10km、依距離排序 |
| OTA 夥伴接線 | Klook / KKday / Booking / Agoda + `DealCard` + `OutboundSheet` |
| 五步驟 wizard 外殼 | `CreateTrip.tsx`（去哪裡/什麼時候/誰一起/想做什麼/確認） |
| 八個景點裡的七個 | 真座標、真照片（Commons，附授權）、語音、各自的周邊 |
| **付費語音置頂已是資料驅動** | `featuredAudiosFor` 過濾 `kind === "merchant"`，七星潭確實不顯示 |

**所以這份規格只寫真的缺的八項。**

---

## 1. 已拍板的八個決定

| # | 決定 | 影響 |
|---|---|---|
| 1 | **完整多型 Stop** | 租車/餐廳/導遊/一日遊都是一等公民：算路線、被雨天重排、上地圖 |
| 2 | AI 產生器**真的從資料選**，時間用固定節奏 | 任何城市都能用，不算交通時間 |
| 3 | **維持現狀**：不要商業標題、不要「付費商家可置頂 2 則語音」橫幅 | §17 §12 不採用 |
| 4 | **全部存 localStorage，Demo 重置會清掉** | 行程 + 手動排序/刪除/時間 |
| 5 | AI wizard **在一起規劃蓋新的**，`CreateTrip` 不動 | 那支被四個入口共用 |
| 6 | 「儲存這份行程」**每次建新的** | 不覆寫既有行程 |
| 7 | **日月潭補齊** | 新增景點 + 照片 + 故事 + 周邊 |
| 8 | 租車**兩邊共用同一份資料** | 周邊推薦新分類 + 既有「租車・接送」畫面改讀同一份 |

未問但照 prompt 明文執行：真實租車品牌（iRent / 和運 / 格上 / Klook / KKday / Trip.com）
一律標「Demo・未正式合作」（§21 §42）。

---

## 2. 多型 Stop（最大的一項）

### 現況為什麼會爆

```ts
interface Stop { id: string; poiId: string; at: string; stayMin: number; … }
```

`poi(id)` 在 DEV 找不到會直接 throw（`data/index.ts:29`），而**約 20 個地方無條件呼叫它**：
`TripTimeline.tsx`（10 處）、`App.tsx`（3 處）、`lib/adapt.ts`（4 處）、`lib/reorder.ts`（2 處）、
`AddPoi` / `Deals` / `Explore` / `Today` / `Trips` / `Library`。
所以一個租車 stop 不是「卡片空白」，是**白畫面**。

### 改法

`Stop` 加一個 discriminated union。**`poiId` 保留**——44 筆既有 stop 一行都不用改：

```ts
type StopRef =
  | { kind: "poi"; poiId: string }
  | { kind: "merchant"; merchantId: string }
  | { kind: "provider"; providerId: string }
  | { kind: "offer"; offerId: string }
  | { kind: "rental"; rentalId: string };

interface Stop {
  id: string;
  /** 保留。`kind: "poi"` 時等於 `ref.poiId`，其餘型別為空字串。 */
  poiId: string;
  ref: StopRef;
  …
}
```

再加一個 `lib/stop.ts`，把「這一站叫什麼、在哪、圖是什麼、停多久」收成一個地方：

```ts
export interface StopView {
  id: string; title: string; subtitle: string;
  lat: number; lng: number; emoji: string; tint: string;
  kind: StopRef["kind"];
  poi?: Poi;            // 只有景點有
}
export function viewOf(stop: Stop): StopView | null
```

**每一個 `poi(s.poiId)` 呼叫點改成 `viewOf(s)`**，回 `null` 就跳過那一站而不是 throw。

要重驗的既有功能（因為它們都吃 stop）：
雨天改行程、AI 重排、路線 leg 計算、行程地圖 pin、抵達偵測、今天分頁、分帳。
分帳安全——它只認 tripId/day。

---

## 3. localStorage

現在行程是 `useState<Trip[]>(INITIAL)`（App.tsx:95），而且**排序/刪除/時間另外存在
第二個記憶體 store**（`let edited = {}`，TripTimeline.tsx:78）。只存前者，refresh 後
排序照樣消失。

兩個都存：

| key | 內容 |
|---|---|
| `resomap_trips` | `Trip[]` 全量 |
| `resomap_day_edits` | `Record<string, DayEdits>` |

既有 keys 不動：`resomap_saved` / `_events` / `_reactions` / `_account` / `_locale`。

「我的 → Demo 情境 → 重置」與其他四個情境按鈕（台南延後、花蓮下雨、營運數據、抵達）
**都要一併寫回 storage**，否則按了重置、refresh 之後舊資料會復活。

---

## 4. 租車

新增 `data/carRentals.ts`：

```ts
interface CarRental {
  id: string; brand: string; kind: "brand" | "ota";
  destId: string; pickup: string; lat: number; lng: number;
  model: string; priceTwd: number; priceUnit: string;
  rating: number; note: string;
  url: string;          // 空字串 → 走既有的說明 sheet
}
```

品牌：iRent / 和運租車 / 格上租車（`kind: "brand"`）、
Klook 租車 / KKday 租車 / Trip.com 租車（`kind: "ota"`）。
每一張卡都掛一個新的 `Tag kind="demo-partner"` → **「Demo・未正式合作」**。
`affiliateOffers.ts:9` 已經寫明沒有任何合作關係，這個標籤是同一條紀律的延伸。

兩個入口共用這份資料：
1. 周邊推薦新增 `NearbyCat` = `"rental"`，卡片問題句照既有語氣（不是「租車平台」而是
   「要自己開嗎？」），連鎖修改：`NEARBY_LABELS`、`Record<NearbyCat, NearbyCard>`、
   `NearbyList` 分支、`getNearbyCountUnit`（單位＝「家」）。
2. 既有「租車・接送」畫面（`Services.tsx:450`）改讀同一份。注意它跟交通共用 `ModeFlow`，
   且 `MODE_MATCH` 在 `Services.tsx` 與 `Deals.tsx` 各有一份，兩邊要同步。

租車卡的「加入行程」寫入 `ref: { kind: "rental", rentalId }`，時間軸顯示
`09:00 🚗 花蓮車站取車 / iRent（Demo）`。

---

## 5. 日月潭

新增 3–4 個景點（座標開發階段從 OSM 實查，元素 id 寫進註解）：
日月潭（水社碼頭）、文武廟、伊達邵、向山遊客中心。

每個要有：真照片（Commons 優先，缺的用 Pexels，出處寫進 `imagePrompts.ts`）、
至少一篇 `Story`、以及 5 公里內的餐廳/旅館/土產/司機/導遊/一日遊/租車，
否則 `lib/nearby.ts` 會把它們濾掉、周邊推薦全是「尚無」。

純新增，不動既有資料。

---

## 6. AI 行程產生器

`一起規劃` 新增一個 wizard sub-route（`CreateTrip` 完全不碰）。

五步：
1. 你想去哪裡？（台北/新北/台中/台南/高雄/花蓮/南投/其他）
2. 玩幾天？（1/2/3/4+）
3. 你喜歡什麼？（多選：自然/美食/文化/購物/拍照/親子/放鬆/深度導覽）
4. 交通方式？（大眾運輸/租車自駕/包車/走路為主/還不知道）
5. `✨ AI 幫我排行程`

按下去 → 1.2 秒 loading（「正在分析景點距離、旅遊偏好與時間…」）→ 結果。

`lib/planner.ts` 真的產生：

- 依 `destId` 取出該地所有景點
- 依興趣對 `poi.kind` 加權（自然→nature、美食→food、文化→attraction…）
- 依 `lat/lng` 分群成 N 天，讓同一天的點彼此靠近（不算交通時間，只讓同一天不要跨半個縣）
- 時間用固定節奏：09:00 / 11:00 / 13:00 / 15:00 / 17:00
- 交通選「租車自駕」時，Day 1 第一站自動插一個 `kind: "rental"` 取車站
- 每天塞一個 `kind: "merchant"` 的餐廳當午餐（如果 5 公里內有）

`儲存這份行程` → **建立新 trip**（`trip-${destId}-${序號}`，不覆寫）→ 自動切到「行程」分頁。

---

## 7. 四個小項

1. **導覽庫整張卡可點**：handler 移到外層 `<article>`，`試聽 30 秒` 與 `加入行程`
   加 `stopPropagation`。注意不能變成 button-in-button。
2. **景點頁的加入行程要有 Day 選擇**：現在直接塞 `mine[0].today`。把 `AddToTripSheet`
   從 `Library.tsx` 抽成共用元件（`AddPoi.tsx` 已經有第二份複製品，一併收斂）。
3. **Toast 帶名字**：`已加入 Day 2` → `✓ 七星潭已加入 Day 2`。
4. **台北 101 補一篇中文語音**：它是七個既有景點裡唯一沒有母語導覽的。

---

## 8. 明確不做

- 不改品牌色、logo、字體、bottom nav、導覽庫卡片樣式、手機尺寸、header
- 不加第五個 tab、不加「我的」到 tab bar（它在右上角頭像，本來就有）
- 不採用 §17 的「👑 ResoMap 付費服務」標題、不採用 §12 的置頂橫幅
- 不動 `CreateTrip`
- 不做 drag & drop（上下移動在手機上更穩，這點原 prompt 也同意）
- 不為了重構而重構

---

## 9. 驗收（原 prompt 的 Flow A–F）

| Flow | 路徑 |
|---|---|
| A | 導覽庫 → 七星潭 → 詳情 → 返回 → 導覽庫 |
| B | 導覽庫 → 七星潭 → 周邊推薦 → 返回 → 七星潭 |
| C | 導覽庫 → 七星潭 → 加入行程 → Day 1 → 行程 → 確認存在 |
| D | 七星潭 → 周邊推薦 → 附近租車 → iRent → 加入 Day 1 → 行程 → 確認存在 |
| E | 行程 → 上移 → 下移 → 刪除 → refresh → 確認 localStorage |
| F | 一起規劃 → 花蓮 → 3天 → 自然+美食 → 租車 → AI 排行程 → 儲存 → 行程 |

加上八個景點各自跑一次「點擊 → 詳情 → 語音 → 周邊 → 加入行程」，
以及既有功能回歸：雨天改行程、AI 重排、抵達偵測、今天分頁、分帳。

375 / 390 / 430 無 overflow，無 console error，無破圖。
