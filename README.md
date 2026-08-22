# ResoMap T0 V2

**ResoMap 是旅途中會即時幫你調整的 AI 旅行助手。**

V2 在 T0 之上多了一整條變現動線：**景點語音 → 周邊推薦 → 商家 / 包車 / 導遊 / 聯盟 → 訂閱**。
純前端、假資料、可點擊的手機原型。沒有後端，沒有 API key，沒有登入，沒有金流。

線上版：https://tszhongyung0601-sketch.github.io/resomap-t0-v2/

原版 T0（未更動）：https://tszhongyung0601-sketch.github.io/resomap-t0-demo/

---

## 這一版做了什麼

V2 = **T0 的設計系統、首頁與導航** ＋ **`resomap-http-demo` 的功能、資料模型與互動流程**。

不是兩個網站拼起來。HTTP Demo 只提供 feature spec、business logic 與 mock data；
**一行 CSS、一個 HTML 片段、一張畫面都沒有搬過來**，所有 UI 都用 T0 既有的元件重做。

- 首頁 `Explore.tsx` 一個 section 都沒動、沒加、沒改視覺。
- Bottom nav 仍然是 **探索 / 導覽庫 / 行程 / 一起規劃**，沒有新增 tab。
- T0 原有的 15 個畫面全部保留，行為不變。

完整對照表：[FEATURE_MATRIX.md](FEATURE_MATRIX.md)・整合決策：[INTEGRATION_PLAN.md](INTEGRATION_PLAN.md)

---

## 怎麼跑

```bash
npm install
npm run dev      # http://localhost:5173/resomap-t0-v2/
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

視窗 520px 以上會顯示手機外框（393×852），以下全螢幕。
**簡報前確認喇叭有聲音** — 語音導覽會真的出聲。

---

## Demo 腳本（V2 新增的部分）

**內容 → 需求 → 交易**

1. 探索 → 導覽卡「龍山寺」→ 景點頁
2. 景點頁 →「語音導覽」區塊：最上面兩則是 **★ 店家精選**（付費商家買的位置）
3. 「全部 7 則」→ 語音清單：中文 / English / 日本語 / 한국어 / ไทย，可搜尋
4. 播任一則 → 播放器：進度、±10 秒、讚 / 不推 / 留言 / 分享
5. **播完 → 「接下來想做什麼？」** 五個選項（看附近美食 / 找伴手禮 / 找包車 /
   找私人導遊 / 找 Local tour），各自帶 5km 內的筆數，點下去直接進那份清單
6. 或按「全部周邊推薦」→ 五個問題的圖片型分類頁 → 切 5km / 10km，數字會真的變（11 → 19）
7. 包車司機 → 三位：兩位掛 **ResoMap 推薦夥伴**，一位掛 **審核中**
   （付費 ✚ 通過審核才有標章，付費本身不夠）
8. 右上「推薦排序 ⓘ」→「依距離、評價與相關度綜合排序。部分合作內容可能享有較高曝光，並會清楚標示。」
9. 任一位 →「立即聯絡」→ LINE / WhatsApp 真的會開，電話 / 預約沒填就說明會發生什麼事
10. 評價「4.9（128 則評價）」→ 評價頁
11. 周邊推薦 → Local tour →「前往 Klook」→ 說明 affiliate 串接後這顆按鈕會怎麼運作

**商家與專業會員**

12. 我的 → 訂閱方案 → 四種身份，價格一律「價格待確認」（codebase 沒有定價，不自行發明）
13. 啟用「導遊會員」→ 專業會員頁 → 再啟用「商家會員」→ **兩個同時存在**；
    切「包車司機」→ 提示原本的導遊會停用、**商家不受影響**
14. 語音清單右上「＋」→ 六步上傳流程 → 送 ResoMap 審核 → 我的上傳清單

**行程串通**

15. 行程 → 花蓮 3 天 2 夜 → Day 2 → 七星潭 / 東大門夜市 都有「開始語音導覽」
16. 播完 → 那一列出現「探索附近」

T0 原有的腳本（台南延後、花蓮下雨、抵達赤崁樓、營運數據）在「我的 → Demo 情境」，全部照舊。

---

## Information Architecture

```
探索 Explore    情境感知首頁。沒旅程＝找靈感；快出發＝那趟旅程優先；旅行中＝只剩今天的事
導覽庫 Library   全部語音導覽，城市 / 主題兩排篩選
行程 Trips      旅程列表 → 總覽 → 每日時間軸 → 路線地圖 →（V2）每站可直接聽 / 探索附近
一起規劃 Together 旅伴偏好、投票、AI 共識

地圖 / 我的      不在 tab bar。地圖在橘色列的選單裡，我的在右上頭像

V2 新增的都掛在「地點」底下，不佔導航：
  景點 → 語音導覽 → 播放器 →（播完）探索附近 → 分類清單 → 商家 / 服務者詳情 → 評價
  我的 → 訂閱方案 / 專業會員 / 我上傳的語音
```

---

## 架構

```
src/
  App.tsx           整合層：route stack、所有 overlay、demo 情境
  nav.ts            Route / Nav 契約 — 每個 screen 只認得這個
  types.ts          全部型別（V2 的型別在檔案下半部，有分隔線）
  data/
    ── T0 ──
    destinations.ts / poi.*.ts / stories.ts / deals.ts / trips.ts / travellers.ts
    services.ts / affiliatePartners.ts / affiliateProducts.ts / coupons.ts …
    ── V2 ──
    audio.ts            店家精選與旅人上傳的語音（ResoMap 自己的 15 篇仍在 stories.ts）
    merchants.ts        14 家商家，真座標
    providers.ts        11 位包車 / 導遊，含 1 位審核中、1 位未通過
    affiliateOffers.ts  Booking / Agoda / Trip.com / Klook / KKday 的商品，affiliateUrl 全空
    reviews.ts          評價樣本
    subscriptionPlans.ts 四種方案，價格全為 null
    nearbyCategories.ts  周邊推薦的五個問題與七張分類卡
    info.ts              ⓘ 後面的兩句話：推薦夥伴、推薦排序、店家精選、聯盟合作、關於 Demo
  lib/
    ── T0 ──
    adapt.ts / geo.ts / speech.ts / track.ts / saved.ts / maps.ts / trip.ts / story.ts …
    ── V2 ──
    audio.ts       一個地點的語音清單與排序（店家精選上限 2 在這裡強制）
    nearby.ts      rankNearbyServices() ＋ isVerifiedPartner()
    contact.ts     有 URL 就真的開，沒有就回 false 讓畫面說明
    reactions.ts   讚 / 不推 / 留言（localStorage）
    account.ts     會員狀態：professionalRole（導遊／包車互斥）＋ merchantMembership（獨立）
    photo.ts       商家 / 服務者 / 分類卡的照片：T0 真照片（附授權）優先，Demo 圖次之
  components/
    ── T0 ──
    AppShell / ui.tsx / MapView / Cover / DealCard / AdaptCard / Story / BrandBar
    ── V2 ──
    Trade.tsx        推薦夥伴章、星等、聯絡 Sheet、Demo 連結 Sheet
    NearbyCards.tsx  商家卡、服務者卡、聯盟卡（大圖在上，資訊做減法）
    AudioRow.tsx     語音列（完整版與精簡版）
  scripts/
    build-demo-photos.mjs  來源圖 → webp card 720 / hero 1280（18 MB → 1.1 MB）
  screens/          T0 的 15 個 ＋ V2 的 9 個
```

---

## 圖片

優先順序照著「T0 既有 → HTTP Demo 實拍 → 生成海報圖」：

- **景點**：T0 既有的 53 張 CC 授權真照片，附出處。
- **商家（旅館與部分餐廳）**：借用該店所在街道的那一張 T0 真照片，詳情頁顯示
  「周邊實景照片：作者 / 授權」——CC 授權要求出處，這是條款不是裝飾。
- **土產店、部分餐廳、司機、導遊、分類卡**：HTTP Demo 的實拍素材，
  經 `scripts/build-demo-photos.mjs` 轉成 webp 兩尺寸。人像是生成影像，畫面上標示示意。
- **都沒有的時候**：T0 的 `Generated` 硬邊海報圖。不是 emoji placeholder，是設計過的圖，
  而且它永遠墊在照片底下，所以載入失敗會降級成海報而不是破圖。

全部 `loading="lazy"`。

## Performance

| | 前 | 後 |
|---|---|---|
| 初始 JS | 單一 chunk 916 kB | entry 250 kB + react 174 kB + leaflet 159 kB |
| 其餘畫面 | 全部打包在一起 | 40 個按需 chunk，點到才載 |
| 圖片 | — | webp、兩種尺寸、全部 lazy |
| runtime 相依 | leaflet / react-leaflet | **沒有新增任何一個** |

## V2 的硬規則

在 T0 那八條之外，這一版又多了六條：

- **「ResoMap 推薦夥伴」不能用買的。**
  `isVerifiedPartner = isPaid && reviewStatus === "approved"`，是推導不是欄位。
  資料集裡刻意留了一位付費但審核中的司機，證明規則會生效。
- **店家精選上限 2，在程式裡擋，不是靠資料乖。**
  `lib/audio.ts` 的 `.slice(0, FEATURED_CAP)`。買版位的人一定會想買更多。
- **付費曝光的權重壓在距離之下。**
  付費可以讓一家店在同一條街上排前面，不能讓九公里外的店排在三百公尺外的店前面。
- **按鈕的行為來自資料，不是來自按鈕。**
  `contact.lineUrl` 有值就真的開 LINE；沒有值就出 Sheet 說明會發生什麼事。
  所以簽下一個 LINE 官方帳號之後，是改資料，不是改程式。
- **商業模式不寫在使用者臉上。**
  周邊推薦的標題是「吃什麼？」「今晚住哪？」，不是「ResoMap 付費服務」。
  來源是每張卡底部一行 11px 灰字；規則本身收在 ⓘ 後面兩句話，
  工程與定價的細節收在這份 README 與 `INTEGRATION_PLAN.md`。
  排序權重仍然在 `lib/nearby.ts` 的 `WEIGHTS` 裡，只是不印在旅客的螢幕上。
- **商家是帳號，導遊 / 包車是個人身份。**
  `lib/account.ts` 分成 `professionalRole` 與 `merchantMembership` 兩個欄位。
  導遊與包車互斥（因為是同一個欄位），商家與它們無關 —— 一家咖啡店也可以帶步行導覽。
- **沒有決定的價格就不要寫。**
  `subscriptionPlans.ts` 的 `priceTwd` 全部是 `null`，畫面顯示「價格待確認」。
  寫一個看起來合理的 NT$ 990 進去，它就會變成會議上被引用的數字。

---

## 已知範圍界線

- 全部假資料。POI 與商家座標為真，價格為市場行情估值。
- **ResoMap 目前與 Klook、KKday、Booking.com、Agoda、Trip.com 皆無合作關係。**
  `affiliateOffers.ts` 裡每一筆的 `affiliateUrl` 都是空字串，這是誠實的狀態，不是待辦。
- 商家、司機、導遊全部是虛構的。名字是編的，座標是真的街道，人像是生成影像。
- 聯絡方式只放 LINE / WhatsApp 的通用入口（不指向任何帳號）。電話與預約一律留空 —
  假資料裡放一個看起來合理的手機號碼，響的是別人的電話。
- 沒有帳號、沒有付款、沒有後端。訂閱、身份、讚、留言、上傳記錄都只存在瀏覽器 localStorage。
- 語音是瀏覽器 TTS 即時合成。裝置有裝該語言的語音就會唸，沒有就自動降級字幕模式。
- 地圖圖磚即時取自 OpenStreetMap（© OpenStreetMap contributors），需要網路。

---

## 技術

React 19 · Vite 8 · TypeScript · Tailwind 4 · Leaflet（OSM raster tiles）· Web Speech API

沒有 router library（route stack 在 `App.tsx` 的 `useState` 裡）、沒有狀態管理套件
（module store ＋ `useSyncExternalStore`）、地圖叢集是自己寫的 grid clustering。

---

## 部署

GitHub Actions → GitHub Pages。`vite.config.ts` 的 `base` 是 `/resomap-t0-v2/`。
細節見 [DEPLOYMENT.md](DEPLOYMENT.md)。

未來要接後端的清單見 [TODO_BACKEND.md](TODO_BACKEND.md)。
