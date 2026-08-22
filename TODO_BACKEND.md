# TODO — 後端

V2 是純前端原型。這份清單是「要變成真的產品，後端必須提供什麼」，
按照**擋住上線**的順序排，不是按照技術難度。

每一項都標了現在前端是怎麼假的，以及接上之後**前端要不要改**——
多數是「不用改，換資料來源」，那是刻意設計的結果，不是巧合。

---

## P0 — 沒有這些就不能收錢也不能上線

### 1. Authentication
- 現況：沒有帳號。`lib/account.ts` 用 localStorage 假裝這台裝置是誰。
- 需要：Email / 手機 / 社群登入、session、裝置多登入、忘記密碼。
- 前端影響：`useAccount()` 換成打 API，`Account` 型別不用動。

### 2. Database
- 現況：`src/data/*.ts` 是編譯進 bundle 的常數。
- 需要：`spots`、`audio_guides`、`merchants`、`providers`、`reviews`、
  `affiliate_offers`、`subscriptions`、`users`、`itineraries`。
- 前端影響：`data/index.ts` 的同步 lookup（`poi(id)`、`merchant(id)`）要改成 async 或加一層 cache。
  這是 V2 最大的一次改動，但範圍限縮在 `data/` 與呼叫它的 `lib/`。

### 2b. Image / Media Storage
- 現況：商家與服務者的照片是 `public/demo/` 的固定檔案，或借用 T0 的 CC 授權景點照。
- 需要：商家與服務者自行上傳、裁切成 card / hero 兩種尺寸、CDN、內容審核（人臉、版權）、
  以及**每張圖的授權與來源欄位**（借用他人照片必須存得下出處）。
- 前端影響：`lib/photo.ts` 的 `shotFor()` 換資料來源；`RecordPhoto` 與 `RecordPhotoCredit` 不動。

### 3. Audio Storage + Transcoding
- 現況：**完全沒有音檔。** 所有「語音」都是瀏覽器 TTS 即時合成文字稿。
- 需要：物件儲存（S3 / R2）、轉檔成統一格式與位元率、CDN、串流播放、時長驗證（30 秒 – 5 分鐘）。
- 前端影響：`lib/speech.ts` 旁邊要多一個真的 `<audio>` player。`VoicePlayer` 介面
  （`play/pause/seekSeconds/elapsed/totalSeconds`）刻意是抽象的，換實作不用改播放器 UI。

### 4. Content Moderation
- 現況：上傳流程最後只寫一筆 localStorage draft，狀態永遠是「審核中」。
- 需要：審核佇列、審核者後台、通過 / 退件 / 退件理由、自動篩檢（音質、長度、語言偵測、
  未揭露商業內容）、申訴。
- 前端影響：`AudioDraft.status` 已經是 union，加 `"approved" | "rejected"` 即可。

### 5. Subscription Payment
- 現況：`setPlan()` 寫 localStorage，沒有金流。
- 需要：訂閱金流（藍新 / TapPay / Stripe）、發票、續訂、取消、退款、寬限期、
  **以及先決定價格**（`subscriptionPlans.ts` 的 `priceTwd` 現在全是 `null`）。
- 前端影響：`priceTwd` 從 `null` 變成數字，畫面自己會從「價格待確認」變成金額。不用改元件。

### 6. Merchant / Provider Verification
- 現況：`reviewStatus` 是寫死在資料裡的欄位。
- 需要：營業登記查驗、身分證明、旅行業或導遊執照查核（導遊）、
  職業駕照與營業車籍查核（包車）、保險證明、到期重審。
- 前端影響：**零**。`isVerifiedPartner()` 已經是推導，資料一變標章就跟著變。
  這是整個 V2 設計裡最重要的一條前後端邊界。

---

## P1 — 上線後很快就會被要求

### 7. Reviews
- 現況：`data/reviews.ts` 是固定樣本。
- 需要：只有實際完成服務的人能評、一次服務一則、不可由被評者刪除、
  檢舉與下架流程、平均分與筆數要跟明細一致。
- 前端影響：`reviewsFor()` 換資料來源；`Reviews.tsx` 已經誠實區分「總則數」與「顯示 N 則」。

### 8. Booking
- 現況：`contact.bookingUrl` 全空，按下去只說明會發生什麼事。
- 需要：詢價 / 報價 / 確認 / 取消、可用時段行事曆、訂金、爭議處理。
- 前端影響：填 `bookingUrl` 就會直接開；要做站內預約則需要新畫面。

### 9. Affiliate Tracking
- 現況：`affiliateUrl` 全空、`trackingId` 是固定字串 `resomap-demo`。
  **ResoMap 目前與各平台皆無合作關係。**
- 需要：先簽聯盟計畫（Klook / KKday / Booking / Agoda / Trip.com），
  拿到 affiliate id、deep link 規則、postback / S2S 回傳、對帳、分潤入帳。
- 前端影響：`lib/contact.ts` 的 `tryAffiliate()` 已經會組 query string，填資料即可。

### 10. Analytics
- 現況：`lib/track.ts` 寫 localStorage，`BusinessDemo.tsx` 讀它畫 funnel。
- 需要：事件送到真的分析後端、跨裝置 user id、留存 / 漏斗 / 分群、
  商家後台看得到自己的曝光與點擊。
- 前端影響：`track()` 換成同時送 API。`EventName` union 已經定義好了。

### 11. Geolocation
- 現況：**從來不呼叫 `navigator.geolocation`。** 所有距離都以「使用者正在看的景點」為圓心。
- 需要：定位權限、真的「附近」、抵達偵測（觸發 `ArrivalSheet`）、
  背景定位的電力與隱私處理。
- 前端影響：`NearbyContext.at` 換成使用者座標即可，`rankNearbyServices()` 不用改。

---

## P2 — 規模化才需要

### 12. Push Notification
- 現況：`我的 → 通知` 是「即將推出」。
- 需要：APNs / FCM、抵達提醒、審核結果、預約通知、商家訊息、退訂管理。

### 13. Backend API
- 現況：沒有。
- 需要：REST 或 GraphQL、rate limit、快取、圖片與音檔 CDN、
  多語內容協商（`Accept-Language` 對應 `AudioGuide.language`）。

### 14. Search
- 現況：`searchAudios()` 是前端 `includes()`。
- 需要：全文檢索、中文斷詞、拼音 / 羅馬字、跨語言查詢、地理範圍查詢。

### 15. i18n content pipeline
- 現況：九個字典是機器翻譯，畫面上有標示。
- 需要：翻譯管理、人工校對流程、POI 與語音內容的多語版本管理。

### 16. Merchant / Provider 後台
- 現況：`Pro.tsx` 只編輯一組個人資料，商家沒有自己的後台。
- 需要：店家資料維護、營業時間、優惠上下架、店家精選語音的上傳與排序、
  曝光與點擊報表、帳單。

---

## 前端已經先做好的邊界（接後端時不用重寫）

| 邊界 | 在哪裡 | 接上之後 |
|---|---|---|
| 推薦夥伴標章 | `lib/nearby.ts` `isVerifiedPartner()` | 資料換來源即可，規則不動 |
| 排序權重 | `lib/nearby.ts` `WEIGHTS` | 商業條件改了改一個物件；畫面上的說明會自動跟著改 |
| 聯絡行為 | `lib/contact.ts` | 填 URL 就會開，不用改元件 |
| 訂閱價格 | `data/subscriptionPlans.ts` `priceTwd` | `null` 換成數字，畫面自動從「價格待確認」變金額 |
| 播放器 | `lib/speech.ts` `VoicePlayer` 介面 | 換成真的 `<audio>` 實作，播放器 UI 不動 |
| 店家精選上限 | `lib/audio.ts` `FEATURED_CAP` | 業務要調整，改一個常數，且擋在程式裡不是靠資料乖 |
| 事件 | `src/types.ts` `EventName` | union 已定義，`track()` 加一個 API 送出 |
| 圖片 | `lib/photo.ts` `shotFor()` + `Shot` | 兩種尺寸與授權欄位已經是介面的一部分 |
