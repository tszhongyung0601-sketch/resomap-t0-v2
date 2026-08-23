# 租車照片來源

附近租車的 22 個據點各有一張車輛照片，全部來自 Pexels。

## 這些照片拍的是什麼

**是那個車型的示意照，不是那個據點的車。**

沒有任何圖庫有 iRent 花蓮車站的照片，而在一個有名有姓的據點後面放一張泛用停車場，
就是拿風景照撐一家有名字的餐廳的同一種錯——那條規則寫在 `PHOTO_ATTRIBUTION.md`，
這一輪沒有推翻它。

那為什麼還能放？因為卡片上已經寫了一件可以被照片說明的事實：「車型 Toyota Yaris · 5 人座」。
一張小掀背車放在那一行上面，是對那一行的示意，而且是真的。
所以照片是**依每筆記錄自己的 `model` 欄位**去找的，不是依品牌，也不是依城市。

每一張都會標示：

| 位置 | 標示 |
|---|---|
| 列表卡片 96px 縮圖 | 右下角「示意」 |
| 詳情頁大圖 | 右上角「圖庫示意」 |
| 詳情頁大圖下方 | 「車輛照片為 <車型> 的圖庫示意圖，非該據點實際車輛。攝影：…」 |

商業揭露（「Demo・未正式合作」）是另一件事，位置不變，兩者不互相取代：
一個說 ResoMap 跟這家公司沒有關係，一個說這張照片不是這家公司的車。

## 授權

[Pexels License](https://www.pexels.com/license/)——可商用、可修改、不要求標示出處。
這裡還是標了，理由跟人像那份一樣：22 位攝影師的作品撐著一個產品的畫面，
而他們的名字不出現在裡面任何地方，這件事本身不對。

## 怎麼挑的

`scripts/vehicle-queries.mjs` 的規則，全部有單元測試（`vehicle-queries.test.mjs`），
測資就是前兩輪真的抓錯的那幾張：

- **必須是一整台車**——方向盤、儀表板、車標特寫在 96px 是一團看不懂的東西
- **必須是這個類別**——「compact minivan parked」回過一張夜間停車場，
  它是車、通過所有黑名單，但跟卡片寫的七人座沒有關係
- **不能跟卡片矛盾**——描述裡出現 BMW 就不能放在「Toyota Altis」上面，
  兩行字距離八毫米，讀的人會相信照片
- **不能是別人的工作或別人的運動**——賽車、貨車、警車、高爾夫球車

過不了的就跳過。最後一關是人看 contact sheet：四張在第一輪通過了所有規則
（描述沒提到品牌，但照片裡的車一看就是 Hyundai / BMW / Infiniti），
用 `:n` 重抽掉了。

## 名單

| 據點 | id | 車型 | 縮圖 / 大圖 | 攝影 | 原始頁面 |
| --- | --- | --- | --- | --- | --- |
| 格上租車 板橋車站營業所 | `r-carplus-banqiao` | Toyota Corolla Cross | 39 kB / 112 kB | FurtherMore Studio | [原始頁面](https://www.pexels.com/photo/blue-compact-suv-parked-on-urban-street-31501638/) |
| 格上租車 花蓮車站 國聯五路營業所 | `r-carplus-hualien` | Toyota Sienta | 20 kB / 50 kB | Yazid N | [原始頁面](https://www.pexels.com/photo/white-minivan-parked-at-modern-airport-terminal-39075475/) |
| 格上租車 台南車站前營業所 | `r-carplus-tainan` | Nissan Kicks | 37 kB / 101 kB | Erik Mclean | [原始頁面](https://www.pexels.com/photo/a-side-view-of-a-parked-red-vehicle-13767773/) |
| 格上租車 信義區 松仁路營業所 | `r-carplus-taipei-xinyi` | Nissan Kicks | 43 kB / 111 kB | FurtherMore Studio | [原始頁面](https://www.pexels.com/photo/blue-compact-suv-parked-outdoors-for-lifestyle-use-32462525/) |
| 格上租車 宜蘭車站營業所 | `r-carplus-yilan` | Toyota Corolla Cross | 31 kB / 70 kB | Stephen Andrews | [原始頁面](https://www.pexels.com/photo/a-blue-toyota-rav4-9615358/) |
| 和運租車 花蓮車站營業所 | `r-easyrent-hualien` | Toyota Altis | 50 kB / 138 kB | Kadir Akman | [原始頁面](https://www.pexels.com/photo/silver-sedan-parked-beside-brown-brick-wall-11501948/) |
| 和運租車 高雄車站營業所 | `r-easyrent-kaohsiung` | Toyota RAV4 | 56 kB / 156 kB | Erik Mclean | [原始頁面](https://www.pexels.com/photo/the-white-2020-toyota-highlander-parked-in-front-of-a-brick-wall-27497572/) |
| 和運租車 水社遊客中心旁 中山路 | `r-easyrent-sunmoonlake` | Toyota Altis | 43 kB / 137 kB | dumitru B | [原始頁面](https://www.pexels.com/photo/silver-sedan-parked-by-coastal-road-28884174/) |
| 和運租車 台中車站營業所 | `r-easyrent-taichung` | Toyota Corolla Cross | 72 kB / 195 kB | Siddant Kanthi | [原始頁面](https://www.pexels.com/photo/white-suv-parked-under-trees-in-sunny-lot-29477633/) |
| 和運租車 台北車站 館前路營業所 | `r-easyrent-taipei-main` | Toyota RAV4 | 20 kB / 61 kB | Andrey Andname | [原始頁面](https://www.pexels.com/photo/side-view-of-a-parked-white-suv-4909544/) |
| 和運租車 台東車站營業所 | `r-easyrent-taitung` | Toyota Altis | 44 kB / 137 kB | Oli Liao | [原始頁面](https://www.pexels.com/photo/sleek-black-sedan-parked-in-urban-setting-35628774/) |
| iRent 花蓮車站前 國聯一路 | `r-irent-hualien` | Toyota Yaris | 36 kB / 82 kB | Kostiantyn Zavhorodnii | [原始頁面](https://www.pexels.com/photo/sleek-black-hatchback-car-in-parking-lot-33326195/) |
| iRent 高雄車站 南華路停車場 | `r-irent-kaohsiung` | Toyota Sienta | 23 kB / 51 kB | CAMCAT Christopher Michael | [原始頁面](https://www.pexels.com/photo/time-lapse-photo-of-a-minivan-11336600/) |
| iRent 台中車站 建國路停車場 | `r-irent-taichung` | Toyota Yaris | 48 kB / 121 kB | İsmail ERTAN | [原始頁面](https://www.pexels.com/photo/gray-toyota-auris-in-scenic-outdoor-setting-35016609/) |
| iRent 台南車站 北門路停車場 | `r-irent-tainan` | Toyota Yaris | 42 kB / 120 kB | Erik Mclean | [原始頁面](https://www.pexels.com/photo/blue-car-parked-near-wall-5199497/) |
| iRent 台北車站 北平西路停車場 | `r-irent-taipei-main` | Toyota Yaris | 59 kB / 161 kB | Mike Bird | [原始頁面](https://www.pexels.com/photo/a-red-car-parked-on-dirt-road-7744713/) |
| iRent 新店中正路 路邊租還點 | `r-irent-xindian` | Toyota Sienta | 49 kB / 111 kB | Thang Nguyen | [原始頁面](https://www.pexels.com/photo/silver-mpv-driving-down-tree-lined-urban-street-37029578/) |
| iRent 礁溪車站前 溫泉路 | `r-irent-yilan` | Toyota Yaris | 66 kB / 177 kB | Mike Bird | [原始頁面](https://www.pexels.com/photo/a-car-parked-outdoors-20303898/) |
| KKday 租車 花蓮車站周邊多家門市 | `r-kkday-hualien` | 小型車 起 | 87 kB / 236 kB | Tom Fisk | [原始頁面](https://www.pexels.com/photo/rows-of-parked-cars-3856436/) |
| Klook 租車 台北車站周邊多家門市 | `r-klook-taipei` | 小型車 起 | 80 kB / 194 kB | Renato Rocca | [原始頁面](https://www.pexels.com/photo/colorful-parked-cars-5800943/) |
| Klook 租車 台東車站周邊多家門市 | `r-klook-taitung` | 小型車 起 | 47 kB / 117 kB | Luke Miller | [原始頁面](https://www.pexels.com/photo/row-of-cars-parked-in-an-urban-parking-lot-29566909/) |
| Trip.com 租車 水社碼頭周邊門市 | `r-trip-sunmoonlake` | 小型車 起 | 47 kB / 124 kB | Pixabay | [原始頁面](https://www.pexels.com/photo/mercedes-benz-parked-in-a-row-164634/) |

## 重新產生

```bash
PEXELS_KEY=... node scripts/fetch-stock-vehicles.mjs
node scripts/build-vehicle-credits.mjs
node scripts/build-vehicle-attribution.mjs
```

單獨重抽某幾筆：`r-irent-hualien:2` 跳過前兩個合格候選，
`r-irent-hualien=17078606` 直接指定一張 Pexels 照片。
重抽不會覆蓋沒動到的那幾筆的出處。
