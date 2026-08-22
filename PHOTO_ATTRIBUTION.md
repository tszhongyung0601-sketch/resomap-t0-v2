# 圖片來源與授權

Map Home 的七個景點照片全部來自 Wikimedia Commons，於開發階段下載進專案、裁切成 WebP 後隨站台一起部署。
沒有任何一張是 AI 生成、通用圖庫照，或從 Google Maps / Google 評論抓取的圖片，也沒有任何一張被重複用在兩個景點上。

處理方式：原圖 → sharp（attention crop）→ WebP。每個景點兩個尺寸：`-card.webp` 600×450（列表與預覽卡）、`-hero.webp` 1600×900（景點頁大圖）。

| 景點 | 檔案 | 攝影者 | 授權 | 來源 |
| --- | --- | --- | --- | --- |
| 裕隆城 | `yulon-city-card.webp` (51 kB)<br>`yulon-city-hero.webp` (195 kB) | Foxy1219 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:%E6%96%B0%E5%BA%97%20%E8%A3%95%E9%9A%86%E5%9F%8E%202023-11-02%20(2).jpg) |
| 白色恐怖景美紀念園區 | `jingmei-park-card.webp` (58 kB)<br>`jingmei-park-hero.webp` (250 kB) | 人人生來平等 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:%E6%99%AF%E7%BE%8E%E4%BA%BA%E6%AC%8A%E6%96%87%E5%8C%96%E5%9C%92%E5%8D%80%E8%AD%A6%E5%82%99%E7%B8%BD%E5%8F%B8%E4%BB%A4%E9%83%A8%E4%BB%81%E6%84%9B%E6%A8%93%E7%9C%8B%E5%AE%88%E6%89%80%E5%A4%96%E9%83%A8.jpg) |
| 碧潭風景區 | `bitan-card.webp` (24 kB)<br>`bitan-hero.webp` (86 kB) | Monyuan | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Bitan%20Scenic%20Area.jpg) |
| 碧潭吊橋 | `bitan-bridge-card.webp` (50 kB)<br>`bitan-bridge-hero.webp` (227 kB) | 王彥翔 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:%E6%96%B0%E5%BA%97%20%E7%A2%A7%E6%BD%AD%E5%90%8A%E6%A9%8B.JPG) |
| 和美山步道 | `hemeishan-card.webp` (74 kB)<br>`hemeishan-hero.webp` (361 kB) | Anas1712 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:View%20of%20Xindian%20skyline%20and%20Taipei%20101%20from%20Hemeishan%20top%20near%20Bitan%2020230522%20130327.jpg) |
| 新店溪河濱步道 | `xindian-riverside-card.webp` (30 kB)<br>`xindian-riverside-hero.webp` (129 kB) | C.L. Kao (eddie5150) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:%E5%AE%89%E5%9D%91%E6%A9%8B%EF%BC%8C%E6%96%B0%E5%BA%97%E6%BA%AA%E5%B7%A6%E5%B2%B8%E6%B2%B3%E6%BF%B1%E8%87%AA%E8%A1%8C%E8%BB%8A%E9%81%93%E3%80%82%20-%20panoramio.jpg) |
| 景美夜市 | `jingmei-market-card.webp` (42 kB)<br>`jingmei-market-hero.webp` (176 kB) | Alfred Twu | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Jingmei-night-market.jpg) |

## 授權條款

- **CC BY-SA 4.0 / 3.0** — 需標示原作者，衍生作品需以相同條款釋出。本專案只做裁切與轉檔，未改變內容，作者姓名如上表。
- **CC BY 4.0** — 需標示原作者。
- **CC0 1.0** — 作者已放棄著作權，無標示義務；此處仍列出作者以示尊重。

App 內也會在景點頁的照片下方顯示攝影者與授權（`RecordPhotoCredit`，資料來自 `src/data/imagePrompts.ts` 的 `credit` 欄位），不是只寫在這份文件裡。

## 重新產生

```bash
node scripts/fetch-attraction-photos.mjs
```

腳本會重新下載原圖、重新裁切，並更新 `.attraction-photos.json`。原圖不進版控，只有轉檔後的 WebP 進 `public/photos/`。
