# 司機與導遊人像 Prompt

40 位包車司機與私人導遊，一人一條 prompt。

這批圖要解決的問題很具體：原本沒有人像的服務者，卡片會去借「最近景點」的風景照，
所以七星潭附近的司機、導遊、旅館全都長成同一片空的礫石灘——三張卡、三個名字、一張圖，
而旅客要選的其實是「人」。所以規則是**一人一張、不共用**：同一張臉掛兩個名字，比借風景更糟。

## 怎麼用

1. 把下面某一條 prompt 貼進圖像模型（Negative prompt 另外貼）。
2. 存檔，**檔名就是標題裡那個 id**，例如 `p-qixingtan-guide.png`。
3. 全部丟進專案根目錄的 `.portrait-src/`（這個資料夾不進版控）。
4. 跑：

```bash
node scripts/build-portraits.mjs
```

腳本會裁成 16:9、轉成 WebP 兩個尺寸（`720×405` 卡片、`1280×720` 詳情頁），
並依照 `public/portraits/` 實際有的檔案重寫 `src/data/portraits.ts`。
沒生的那幾位會顯示字母頭像，**不會**出現破圖或 404。

## 版面規格（每條 prompt 裡都已經寫進去了）

- 16:9 橫幅，人物在中間偏右，頭在上方三分之一偏中。
- **左下角**是距離標籤（`120 m`）、**右上角**是「AI 生成」標籤——這兩個角要留背景，不能壓到臉。
- 畫面裡不要有任何文字或招牌（AI 生出來的中文招牌一定是亂碼，現有的 `p-tainan-guide` 暫用圖就是這樣）。
- 人是主角，不是風景裡的一個小人影。

## 進度

**4 / 40**　已經有圖：`p-acheng`、`p-jiufen-guide`、`p-tainan-guide`、`p-xiaofang`
（這四張是舊 Demo 沿用的生成人像，先當暫用圖，建議照下面的 prompt 重生一次。）

---

## 包車司機（20 位）

### 1. 阿誠包車旅遊

`p-acheng.png` → `.portrait-src/`　·　萬華區　·　**已有暫用圖，建議重生**

五十多歲台灣男司機在九份山腰停車處拉開七人座後門請客人下車，上午陰天平光。

```text
Documentary editorial photograph of a chartered-car driver. A stocky Han Taiwanese man in his early fifties, thick through the shoulders, short greying crop thinning at the temples, no glasses, navy short-sleeve driver polo with a soft worn collar, a cloth in his back pocket. He slides the rear door of a black seven-seat MPV open, his free hand gesturing guests out. A hillside pull-in above Jiufen, tiled roofs and sea haze below, flat bright overcast, mid-morning. Wide 16:9 frame, subject waist-up and right of centre, head in the upper-middle third, clear negative space in the lower-left road and upper-right sky. 35mm lens, f/4, natural light, muted film-like colour, real skin texture.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no legible vehicle badges or number plates, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no empty scenery without a person, no studio backdrop, no red lanterns filling the frame, no rain
```

</details>

### 2. 花蓮山海包車

`p-hualien-car.png` → `.portrait-src/`　·　花蓮市

二十多歲阿美族男司機在芭崎眺望台停車場伸手拉緊車頂行李綑帶，低頭回答旅客問題，上午高雲。

```text
Documentary editorial photograph of a chartered-van driver, an Amis Indigenous Taiwanese man in his late twenties, slight and narrow-framed, long hair tied in a short tail at the nape, a wispy moustache, a loose faded grey long-sleeve fishing shirt with the collar up and a towel round his neck, no sunglasses. He reaches up to tighten a ratchet strap over luggage on the van's roof rack, both arms raised and the shirt pulled tight across his back, face turned down toward a guest to answer a question. The Baqi lookout car park on the Hualien coastal highway, the bay curving south far below and well out of focus, mid-morning with high cloud. Wide 16:9 frame, waist-up, subject right of centre, head in the upper-middle third, van roofline and bay in the lower-left, open sky in the upper-right. 50mm lens, f/2.8, film-like colour.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no legible vehicle badges or number plates, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no heroic low angle, no white sand, no palm trees, no turquoise tropical water, no ceremonial Indigenous costume, no feather headdress, no sunglasses, no empty landscape without a person, no drone view
```

</details>

### 3. 北海岸包車

`p-yehliu-car.png` → `.portrait-src/`　·　萬里區

三十多歲台灣女司機靠在金山老街騎樓外的休旅車後視鏡旁抱胸等客，正午強光與深影。

```text
Documentary editorial photograph of a chartered-van driver, a Han Taiwanese woman in her late thirties of medium height and capable stance, shoulder-length hair clipped up off her neck, a sky-blue short-sleeve shirt, a small hand towel over one shoulder. She leans against the wing mirror of a silver eight-seat van at the kerb, arms folded, waiting for her group. The arcade entrance of Jinshan old street, low tiled shopfronts, midday hard overhead sun and deep arcade shade. Wide 16:9 frame, waist-up, subject slightly right of centre, head in the upper-middle third, pavement lower-left, arcade beam upper-right. 35mm lens, f/4.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no shop signs, no logos, no watermarks, no legible vehicle badges or number plates, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no heroic low angle, no honeycomb rock formations, no beach, no empty street without a person
```

</details>

### 4. 小芳包車旅遊

`p-xiaofang.png` → `.portrait-src/`　·　大同區　·　**已有暫用圖，建議重生**

淡水河口濱河路退潮清晨，五十出頭女司機在路邊抖動橡膠腳踏墊、一邊回頭跟客人說話，白色七人座側門敞開，平白雲光。

```text
Documentary editorial photograph of a chartered-car driver, a Han Taiwanese woman in her early fifties, sturdy and short-necked, a long grey-streaked plait pulled forward over one shoulder, sun-freckled cheeks, a magenta long-sleeve sun top under a faded canvas work apron with cable ties in the pocket. She stands at the kerb shaking out a rubber floor mat against her knee, mid-motion, mouth open mid-sentence to a guest, her plain white seven-seat van close behind her with the side door open. Riverside road at the Tamsui estuary at low tide, exposed grey-brown mudflat, Guanyin Mountain a flat unlit shape across the water, early morning under flat white cloud. Wide 16:9 frame, waist-up, subject right of centre, head in the upper-middle third, empty mudflat in the lower-left, blank pale sky in the upper-right. 50mm lens, f/2.8, background soft, muted film colour, real skin and sun lines.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no signage, no watermarks, no logos, no legible vehicle badges or number plates, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D render, no CGI, no HDR clown colour, no stock-photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no empty scenery with no person, no golden-hour glow, no tropical white sand, no palm trees, no studio backdrop
```

</details>

### 5. 阿凱代駕

`p-akai.png` → `.portrait-src/`　·　中山區

深夜中山區巷弄，二十多歲男代駕站在自用轎車駕駛座門邊，手機放低、抬頭望向巷口找客人，霓虹與路燈斜掃過臉。

```text
Documentary editorial photograph, environmental portrait of a slight Han Taiwanese man in his late twenties, a night-shift driver, longish brown-tinted fringe with ears showing, plain black zip hoodie over a white tee, thin crossbody strap. He stands at the open driver's door of a small sedan at the kerb, phone lowered in one hand, chin up, scanning the lane for his passenger. Back lane in Zhongshan District late at night, blurred unreadable shop-sign glow, wet asphalt, mixed neon and streetlight raking across his face. Wide 16:9 frame, waist-up, subject right of centre, head in the upper-middle third, dark wet road in the lower-left, plain shuttered wall in the upper-right. 35mm lens, f/1.8, visible grain, cool film colour.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no readable signage, no watermarks, no logos, no legible vehicle badges or number plates, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D render, no CGI, no HDR clown colour, no cyberpunk over-saturation, no stock-photo smile, no fashion retouching, no beauty filter, no heroic low angle, no empty street with no person, no daylight, no face lit only by a phone screen, no downturned head, no face hidden in shadow, no back of head
```

</details>

### 6. 淡水海線包車

`p-tamsui-car.png` → `.portrait-src/`　·　淡水區

老梅石槽海堤步道，四十出頭男司機戴漁夫帽穿釣魚背心，伸手遞傘給下方遊客，退潮綠石槽與富貴角燈塔在後。

```text
Documentary editorial photograph, environmental portrait of a solid Han Taiwanese man in his early forties, a chartered-van driver, short hair under a navy bucket hat, navy fishing vest over a quick-dry tee, cargo shorts, thick forearms. He stands on the seawall path holding a folded umbrella out toward guests below the frame. Laomei green reef at low tide, algae-covered stone ridges running into the sea, Fugueijiao lighthouse small in the distance, late afternoon sun raking low across wet reef. Wide 16:9 frame, waist-up, subject right of centre, reef and wet sand in the lower-left, pale sky in the upper-right. 35mm lens, f/4, natural colour, salt haze.
```

<details><summary>Negative prompt</summary>

```text
text, letters, signage, watermarks, logos, legible vehicle badges, likeness of a real person, children's faces, sexualised content, plastic 3D render, CGI, HDR clown colour, stock-photo smile, fashion retouching, heroic low angle, empty coastline with no person, white sand, palm trees, turquoise tropical water, drone view
```

</details>

### 7. 港都包車

`p-kaohsiung-car.png` → `.portrait-src/`　·　鹽埕區

西子灣海邊道路，六十多歲白眉男司機戴白便帽側坐在香檳金七人座駕駛座門口，膝上放著空白派車單，抬頭跟人說話，午後海面暖光。

```text
Documentary editorial photograph of a chartered-car driver, a Han Taiwanese man in his mid sixties, heavy-lidded and deeply tanned with thick white eyebrows and a short white crew cut under a soft white flat cap, a faded maroon short-sleeve shirt and dark trousers, a folded white cloth in the breast pocket. He sits sideways in the open driver's doorway of a champagne-gold seven-seat MPV, feet on the kerb, a blank paper job sheet resting on his knee and a pen in his hand, looking up mid-sentence at someone off frame. Seafront road at Sizihwan, container cranes of Kaohsiung harbour standing in the haze, late afternoon warm light off the strait. Wide 16:9 frame, waist-up, subject right of centre, head in the upper-middle third, kerb and sea in the lower-left, hazy sky in the upper-right. 50mm lens, f/2.8, soft film colour, real skin and sun lines.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no signage, no writing on the paper, no watermarks, no logos, no legible vehicle badges or number plates, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D render, no CGI, no HDR clown colour, no stock-photo smile, no fashion retouching, no wrinkle smoothing, no heroic low angle, no empty harbour view with no person, no night scene, no neon
```

</details>

### 8. 池上縱谷小巴

`p-chishang-car.png` → `.portrait-src/`　·　池上鄉

池上伯朗大道，近七十歲瘦削男司機把腳踏車立在身側捏煞車試手感、一邊跟客人說話，九人座白色小巴在肩後，平坦稻田被壓縮虛化，清晨低光。

```text
Documentary editorial photograph of a minibus driver, a small lean weathered Han Taiwanese man in his late sixties, sparse white hair under a mesh cap, deep facial creases, a long-sleeve plaid work shirt, cotton work trousers, plastic sandals. He stands holding a bicycle upright by the saddle and bars propped against his hip, one hand raised to test the brake lever, mid-sentence to a guest, his white nine-seat van close behind his shoulder. Mr Brown Avenue in Chishang, Taitung: a single farm lane running dead straight across the flat floor of the East Rift Valley, unbroken level green paddy on both sides thrown out of focus, no power poles and no wires anywhere in the sky, the low Coastal Mountain Range soft along the horizon. Early morning sun raking low across the rice. Wide 16:9 frame, waist-up and close, subject right of centre, head in the upper-middle third, handlebars and paddy edge in the lower-left, hazy mountain and sky in the upper-right. 85mm lens, f/2.8, landscape deliberately compressed and out of focus so the man reads as the subject, natural morning colour.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no signage, no watermarks, no logos, no legible vehicle badges or number plates, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D render, no CGI, no HDR clown colour, no stock-photo smile, no fashion retouching, no heroic low angle, no empty rice-field landscape with no person, no lone-tree postcard framing, no drone view, no golden autumn harvest colour, no terraced hillside paddies, no stepped rice fields, no power lines, no wires in the sky
```

</details>

### 9. 馬太鞍包車

`p-guangfu-car.png` → `.portrait-src/`　·　光復鄉

光復大農大富林道，三十出頭阿美族男司機從七人座後車廂搬出冰桶，午後樹影拉長在自行車道上。

```text
Documentary editorial photograph, environmental portrait of a tall, lean Amis Indigenous Taiwanese man in his early thirties, a chartered-van driver in ordinary 2020s work clothes, short fade, a small plain hoop earring, rust-orange t-shirt with sun sleeves, work gloves tucked into his belt. He lifts a cooler box out of the boot of a silver seven-seat van. Danongdafu forest park in Guangfu, an avenue of trees over the cycle path, flower beds beside it, late afternoon with long tree shadows across the tarmac. Wide 16:9 frame, waist-up, subject centred, path and shadow in the lower-left, tree canopy in the upper-right. 50mm lens, f/2.8, natural colour.
```

<details><summary>Negative prompt</summary>

```text
text, letters, signage, watermarks, logos, legible vehicle badges or number plates, likeness of a real person, children's faces, sexualised content, plastic 3D render, CGI, HDR clown colour, stock-photo smile, fashion retouching, heroic low angle, empty flower-field landscape with no person, ceremonial or tribal costume, feather headdress, tourism-poster styling
```

</details>

### 10. 羅東冬山包車

`p-luodong-car.png` → `.portrait-src/`　·　羅東鎮

南方澳漁港碼頭，四十多歲短髮女司機拿著板夾站在九人座車側門邊清點乘客，背後是漁船與跨港大橋。

```text
Documentary editorial photograph, environmental portrait of a strong, square-shouldered Han Taiwanese woman in her mid forties, a chartered-van driver, short cropped hair with a silver streak tucked behind the ears, navy zip fleece gilet over a white polo, keys clipped at her belt. She stands at the open sliding door of a nine-seat van with a clipboard, counting guests aboard. Quay at Nanfang'ao fishing harbour, moored fishing boats and the arch of the harbour bridge behind, early morning cold clear light off the water. Wide 16:9 frame, three-quarter body, subject right of centre, quay edge in the lower-left, bridge span in the upper-right. 50mm lens, f/2.8, cool restrained film colour.
```

<details><summary>Negative prompt</summary>

```text
text, letters, signage, boat name boards, watermarks, logos, legible vehicle badges or number plates, likeness of a real person, children's faces, sexualised content, plastic 3D render, CGI, HDR clown colour, stock-photo smile, fashion retouching, heroic low angle, empty harbour landscape with no person, sunset colour, drone view
```

</details>

### 11. 大熊旅遊包車

`p-dabear.png` → `.portrait-src/`　·　松山區

清水斷崖公路停車彎，四十多歲壯碩男司機戴深色帽、穿黑色風衣，伸臂沿斷崖線向乘客解說，身體轉向內陸讓晨光打在臉上，海霧軟化遠景。

```text
Documentary editorial photograph of a chartered-van driver, a heavy-set Han Taiwanese man in his mid forties, broad frame and big hands, buzz cut under a plain dark cap, sun-reddened neck, black nylon windbreaker half-unzipped over a faded tee. He stands at a highway lay-by on the Qingshui Cliffs, Hualien, one arm out along the cliff line, mid-sentence to passengers outside the frame, turned inland so the morning sun lights his face rather than backlighting him. Grey marble walls falling straight into the Pacific, sea haze softening the distance. Wide 16:9 frame, waist-up, subject right of centre, head in the upper-middle third, steel guardrail and open sea in the lower-left, plain sky in the upper-right. 50mm lens, f/4, muted film colour, fine grain, real skin texture and sun lines.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no logos, no watermarks, no legible brand badges on the vehicle, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no studio lighting, no heroic low angle, no empty landscape without a person, no white sand, no palm trees, no tropical resort look, no tour bus, no crowd of tourists, no backlit silhouette, no face in shadow
```

</details>

### 12. 縱谷海線包車

`p-taitung-car.png` → `.portrait-src/`　·　台東市

鹿野高台草坡，五十出頭卑南族男司機背對縱谷、雙手把草帽戴回頭上，抬下巴跟客人說話，背景壓縮虛化，上午強光。

```text
Documentary editorial photograph of a chartered-van driver, a broad barrel-chested Puyuma Indigenous Taiwanese man in his early fifties, short grey-flecked hair, sun sleeves on both arms over a faded blue short-sleeve work shirt, a canvas belt. Standing with his back to the valley, both hands raised as he settles a wide straw sun hat back onto his head, chin lifted, mid-sentence to guests out of frame. The mown grass ridge of Luye Highland above the East Rift Valley, the valley floor dropping away soft and out of focus behind him, his plain silver seven-seat van only a blur at the frame edge, mid-morning with strong valley light. Wide 16:9 frame, waist-up and close, subject right of centre, head in the upper-middle third, grass slope in the lower-left, open sky in the upper-right. 85mm lens, f/2.8, compressed background, clean natural colour, slight film grain.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no logos, no watermarks, no legible brand badges or emblems on the van, no number plate characters, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no ceremonial Indigenous costume, no feather headdress, no hot-air balloon festival crowd, no paragliders in sharp focus, no empty landscape without a person, no drone view
```

</details>

### 13. 新城海線接送

`p-qixingtan-car.png` → `.portrait-src/`　·　新城鄉

清晨四點半新城天主堂前廣場，六十多歲清瘦太魯閣族男司機戴毛帽與粗框老花眼鏡，在車尾門倒熱茶，蒸氣升起，天邊微紅、車燈亮著。

```text
Documentary editorial photograph of a shuttle driver, a Truku Indigenous Taiwanese man in his mid sixties, very lean with a long neck and hollow cheeks, white stubble, a navy knitted watch cap pulled down to the eyebrows, thick-rimmed reading glasses on a cord, a quilted navy overshirt over a thermal top. He pours hot tea from a steel thermos into a cup balanced on the open tailgate of his plain silver seven-seat van before a dawn run, steam rising past his hands, glancing sideways at a waiting passenger. The forecourt of Xincheng Catholic Church in Hualien, the boat-shaped chapel and banyan arch dark behind, half past four with the sky just pinking and the van's lights on. Wide 16:9 frame, waist-up, subject right of centre, head in the upper-middle third, dark forecourt in the lower-left, pale dawn sky in the upper-right. 50mm lens, f/2, available light, visible grain.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no logos, no watermarks, no legible brand badges or emblems on the van, no number plate characters, no crosses with lettering, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no white sand, no palm trees, no tropical beach, no ceremonial Indigenous dress, no empty sunrise seascape without a person
```

</details>

### 14. 府城包車小旅行

`p-fucheng-car.png` → `.portrait-src/`　·　中西區

台南安平樹屋外磚鋪小街，六十出頭銀髮包車司機站在車頭旁把紙本地圖拿在胸前講解，榕樹根爬過圍牆，樹冠下均勻柔和的上午光。

```text
Documentary editorial photograph of a chartered-van driver, a lean wiry Han Taiwanese man in his early sixties, slightly narrow-shouldered, silver hair side-parted, reading glasses hanging on a cord, a pale blue short-sleeve button shirt tucked into dark trousers with a cloth belt. He stands upright beside the bonnet of his silver seven-seat van holding a folded paper map at chest height, chin up, mid-sentence to a guest. The narrow brick-paved street outside the Anping Tree House compound in Tainan, the old red-brick warehouse wall and the banyan roots spilling over its coping visible beyond the low fence behind him, open shade under the banyan canopy, even soft mid-morning light with no hard dappled patches. Wide 16:9 frame, three-quarter body, subject right of centre, head in the upper-middle third, empty brick paving in the lower-left, plain shaded wall in the upper-right. 50mm lens, f/2.8, film-like colour, real skin and sun lines.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no signage, no map labels, no logos, no watermarks, no legible vehicle badges, no likeness of any real living person, no children's faces, nothing sexualised, no 3D render look, no plastic skin, no HDR clown colour, no stock-photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no studio backdrop, no empty scenery without a person, no tour-group crowd, no temple interior, no tropical resort look, no hard dappled light in the corners, no leaning over the bonnet
```

</details>

### 15. 瑞芳山線包車

`p-ruifang-car.png` → `.portrait-src/`　·　瑞芳區

新北水湳洞陰陽海展望點，五十多歲司機掀起引擎蓋、一手扶水箱蓋一手拿油布，回頭看乘客，陰天平光。

```text
Documentary editorial photograph of a chartered-van driver, a weathered Han Taiwanese man in his mid fifties, medium build with a slight stoop, short salt-and-pepper hair, aviator sunglasses, a grey polo under a padded driver's gilet, keys clipped at the hip. The bonnet of his silver seven-seat van is propped open and he stands behind it with one hand on the coolant cap and an oily rag in the other, glancing back over his shoulder at his passengers. The Yin-Yang Sea overlook above Shuinandong in New Taipei, the yellow-and-blue bay far below, overcast midday, silver flat light. Wide 16:9 frame, waist-up, subject right of centre, head in the upper-middle third, the bay open and empty in the lower-left, grey sky in the upper-right. 50mm lens, f/2.8, shallow depth of field, restrained film colour.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no legible vehicle badges, no likeness of any real person, no children's faces, nothing sexualised, no 3D render look, no plastic skin, no HDR clown colour, no stock photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no studio backdrop, no empty landscape without a person, no blue sky, no sunset colour, no red lanterns, no sky lanterns, no white sand beach, no engine bay filling the frame
```

</details>

### 16. 台中山海線包車

`p-taichung-car.png` → `.portrait-src/`　·　西屯區

清晨台中和平區谷關大甲溪畔停靠處，五十多歲壯碩司機把偏光眼鏡推到額頭，拿抹布擦前擋風玻璃，兩側森林稜線與河谷冷霧。

```text
Documentary editorial photograph of a chartered-van driver, a broad thickset Han Taiwanese man in his late fifties with a short neck, grey short back and sides, dark polarised glasses pushed up on his forehead so his eyes are clearly visible, a white uniform-style short-sleeve shirt with plain epaulettes and dark trousers. He wipes the windscreen of his black eight-seat van with a folded cloth at a roadside pull-in above the Dajia River at Guguan, Heping District, Taichung: steep dark forested ridges closing in on both sides, pale boulders in the riverbed, cold mist lying along the water, early morning before the sun clears the ridge. Wide 16:9 frame, three-quarter body, subject right of centre, head in the upper-middle third, empty tarmac and guardrail in the lower-left, blank white sky in the upper-right. 50mm lens, f/4, cool muted film colour.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no legible vehicle badges, no epaulette insignia, no likeness of any real person, no children's faces, nothing sexualised, no 3D render look, no plastic skin, no HDR clown colour, no stock photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no studio backdrop, no empty river scenery without a person, no golden sunset light, no lake, no boats, no Sun Moon Lake, no eyes hidden behind dark lenses
```

</details>

### 17. 蘭陽平原包車

`p-jiaoxi-car.png` → `.portrait-src/`　·　礁溪鄉

宜蘭太平山林道髮夾彎，四十多歲短鬚司機穿芥黃刷毛上衣，站在車頭前戴上白棉手套並拉緊袖口，抬頭看路，杉林起霧的清晨。

```text
Documentary editorial photograph of a chartered-van driver, an upright Han Taiwanese man in his mid forties of medium athletic build, close-cropped hair going grey at the front, a neat short beard, a mustard fleece pullover with the zip half down. He stands at the front bumper of his nine-seat van pulling on a pair of white cotton driving gloves, tugging the cuff of one tight, head lifted to look up the road. A hairpin bend on the Taipingshan forest road in Yilan, cypress trunks and drifting mist around him, wet tarmac underfoot, cool diffuse morning light. Wide 16:9 frame, waist-up, subject slightly right of centre, head in the upper-middle third, wet road in the lower-left, misted trees in the upper-right. 50mm lens, f/2.8, low-contrast film colour, honest skin.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no legible vehicle badges, no phone screen, no likeness of any real person, no children's faces, nothing sexualised, no 3D render look, no plastic skin, no HDR clown colour, no stock photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no studio backdrop, no empty forest scenery without a person, no tropical palms, no bright hard sunshine
```

</details>

### 18. 東海岸包車

`p-chenggong-car.png` → `.portrait-src/`　·　成功鎮

台東長濱金剛大道，四十多歲阿美族司機一手撐在車頭側翼，被客人的話逗笑，背後筆直農路與太平洋被壓縮虛化，上午硬光。

```text
Documentary editorial photograph of an Amis Indigenous Taiwanese chartered-van driver, a stocky man in his mid forties with strong arms and a thick neck, short spiky hair with sun-bleached tips, sunglasses on, a navy short-sleeve shirt worn open over a plain tee, quick-dry shorts, sweat at the collar. He stands close to camera at his van's front wing, one hand braced on the wing, caught in an unposed laugh at something a guest said. Jingang Boulevard, the ridge farm road in Changbin, Taitung, the straight road and the Pacific horizon thrown well out of focus behind him. Mid-morning high hard sun. Wide 16:9 frame, waist-up and close, subject right of centre, head in the upper-middle third, road surface in the lower-left, sea and sky in the upper-right. 85mm lens, f/2.8, the landscape compressed and soft so the man clearly reads as the subject.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no legible vehicle badges, no likeness of any real person, no children's faces, nothing sexualised, no 3D render look, no plastic skin, no HDR clown colour, no stock photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no studio backdrop, no empty road landscape without a person, no drone or aerial view, no ceremonial dress, no palm-lined tropical beach, no sharp postcard vista
```

</details>

### 19. 太魯閣峽谷接駁

`p-taroko-car.png` → `.portrait-src/`　·　秀林鄉

花蓮太魯閣燕子口大理岩峽谷路邊，五十多歲太魯閣族接駁司機從箱子裡發白色安全帽給旅客，正午強光。

```text
Documentary editorial photograph of a Truku Indigenous Taiwanese shuttle driver, a tough man in his late fifties with slightly bowed shoulders, short grey hair and a weathered face, no glasses, wearing a beige work shirt with the sleeves rolled, a plain lanyard and canvas trousers. He hands out plain white safety helmets from a crate beside his nine-seat van on the Swallow Grotto road in Taroko Gorge, Hualien, pitted marble cliff walls and a tunnel mouth behind him, midday sun burning the cliff top while the gorge floor stays in deep shade. Wide 16:9 frame, waist-up right of centre, road and crate lower-left, lit cliff upper-right. 50mm lens.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no helmet branding, no legible vehicle badges, no likeness of any real person, no children's faces, nothing sexualised, no 3D render look, no plastic skin, no HDR clown colour, no stock photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no studio backdrop, no empty gorge scenery without a person, no green jungle canyon, no waterfall centrepiece, no ceremonial dress
```

</details>

### 20. 台中海線包車

`p-qingshui-car.png` → `.portrait-src/`　·　清水區

台中梧棲漁港碼頭，三十多歲司機提著保麗龍魚箱走向停在後方的七人座，午後濕地面反光。

```text
Documentary editorial photograph of a Taiwanese chartered-van driver, a compact man in his mid thirties with strong shoulders, short damp hair, no hat and no glasses, a charcoal polo with a hand towel tucked at the collar, rubber boots. He carries a polystyrene fish box toward his silver seven-seat van parked beyond, walking the quay at Wuqi fishing harbour in Taichung, moored boats and stacked ice trays around him, early afternoon glare bouncing off wet concrete. Wide 16:9 frame, waist-up centred, wet quay in the lower-left, masts and sky upper-right. 35mm lens, f/2.8, honest film colour, sweat and sun on the skin.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no boat name lettering, no logos, no watermarks, no legible vehicle badges, no likeness of any real person, no children's faces, nothing sexualised, no 3D render look, no plastic skin, no HDR clown colour, no stock photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no studio backdrop, no empty harbour scenery without a person, no sunset colour, no gory fish close-up, no market crowd
```

</details>

---

## 私人導遊（20 位）

### 1. Ada（漫遊台灣）（漫遊台灣）

`p-ada.png` → `.portrait-src/`　·　信義區

四十多歲短銀髮台灣女導遊在信義區空橋上按著領口導覽麥克風、回頭清點團員，午後硬光在甲板上打出條狀陰影。

```text
Documentary editorial photograph of a city walking guide, a tall spare Han Taiwanese woman in her mid forties, upright and angular, hair cropped short and mostly silver, no eyewear at all, a plain black soft-shell jacket over a grey tee, a small radio-guide transmitter clipped to her collar. One hand is raised to the collar mic, the other flat on the walkway rail, head turned back along the deck as she counts her group in. An elevated pedestrian walkway in Taipei's Xinyi district, the shoulder of a tall tower soft behind her, late afternoon with hard bars of shadow from the canopy falling across the deck and her sleeve. Wide 16:9 frame, waist-up, subject centred, head in the upper-middle third, walkway deck in the lower-left, plain out-of-focus sky in the upper-right. 50mm lens, f/2.8, restrained film colour.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no signage, no logos, no watermarks, no legible building or brand names, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no glamour lighting, no heroic low angle, no empty cityscape without a person, no lens flare, no golden-hour backlit glow, no sunglasses pushed up on the head
```

</details>

### 2. 阿源（山城腳步）（山城腳步）

`p-jiufen-guide.png` → `.portrait-src/`　·　瑞芳區　·　**已有暫用圖，建議重生**

六十出頭的台灣男導覽員在金瓜石日式礦工宿舍間的石階上回身向坡上講解，黃昏只有門口燈泡與一盞路燈。

```text
Documentary editorial photograph of a local history guide, a thin slightly stooped Han Taiwanese man in his early sixties with bony hands, white cropped hair, deep sun lines, thin wire glasses, a worn brown canvas jacket over a checked shirt, a cotton cap held in one hand. He pauses on a step and half-turns back to talk uphill. Stone steps between the old Japanese-era miners' quarters at Jinguashi, Ruifang, New Taipei: mossy concrete retaining walls, weathered timber boarding, black-tar and corrugated roofs stepping down the hillside, one bare bulb over a doorway and a single street lamp just coming on. Dusk, the hillside gone deep blue. Wide 16:9 frame, three-quarter body, subject centred, head in the upper-middle third, steps falling away in the lower-left, dim hillside in the upper-right. 35mm lens, f/2, film-like colour, grain.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no tourist crowds, no red lanterns, no paper lanterns, no hanging festival lanterns, no neon, no empty street without a person
```

</details>

### 3. 宗翰（中區走走）（中區走走）

`p-taichung-guide.png` → `.portrait-src/`　·　西區

二十多歲台灣男導覽員在台中第二市場清晨攤前掀開竹蒸籠蓋，蒸氣從臉旁升起，燈泡暖光。

```text
Documentary editorial photograph of a market walking guide, a tall lanky Han Taiwanese man in his late twenties with narrow shoulders, medium curly hair, thick black-framed glasses fogged along the lower edge, a short-sleeve check shirt open over a plain tee, a cotton tote on his shoulder. At a stall counter he lifts the lid off a stacked bamboo steamer with both hands, steam rolling up past his face, eyebrows up mid-sentence to the group. The morning arcade of Taichung Second Market, produce stalls and hanging bare bulbs, early morning warm bulb light against grey daylight. Wide 16:9 frame, waist-up, subject right of centre, head in the upper-middle third, wet market floor in the lower-left, dim ceiling in the upper-right. 35mm lens, f/2, film-like colour, visible grain.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no shop signs, no price tags, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no heroic low angle, no empty market interior without a person, no raw meat close-up, no oversaturated food styling, no face hidden by steam
```

</details>

### 4. 文彥（礁溪走讀）（礁溪走讀）

`p-jiaoxi-guide.png` → `.portrait-src/`　·　礁溪鄉

三十多歲台灣男導遊在礁溪五峰旗步道濕石階上扶欄回身講解，樹蔭斑駁上午光。

```text
Documentary editorial photograph of a trail guide, a slim wiry Han Taiwanese man in his mid thirties, short hair damp with sweat under a soft sun cap, an orange quick-dry long-sleeve top, trekking poles in one hand. He pauses on the steps with his other hand on the rail, half-turned to talk downhill. The Wufengqi waterfall trail in Jiaoxi, wet stone steps, a tier of the waterfall visible through the trees behind, mid-morning dappled light through the canopy. Wide 16:9 frame, three-quarter body, subject right of centre, head in the upper-middle third, wet steps lower-left, dark foliage upper-right. 35mm lens, f/2.8.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no heroic low angle, no technical alpine climbing gear, no rope or helmet, no tropical jungle, no empty waterfall scenery without a person
```

</details>

### 5. 郁婷（花蓮市走讀）（花蓮市走讀）

`p-hualien-city-guide.png` → `.portrait-src/`　·　花蓮市

三十出頭的台灣女導覽員在花蓮舊鐵道行人徒步區倒退著走並向團員解說，臉朝鏡頭左側清楚可見，藍調時分路燈初亮。

```text
Documentary editorial photograph of a city walking guide, a slim Han Taiwanese woman in her early thirties of medium height, long hair in a single braid over one shoulder, a mint green oversized shirt with sleeves rolled, a canvas tote. She walks backwards while talking to her group, face turned toward camera-left and clearly visible, never a back view. The old railway pedestrian street in Hualien city, old rail markers set into the paving, low shopfronts, blue hour with the street lamps just switched on. Wide 16:9 frame, three-quarter body, subject slightly right of centre, head in the upper-middle third, empty paving in the lower-left, dim sky in the upper-right. 35mm lens, f/2, film-like colour, slight grain.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no shop signs, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no heroic low angle, no back of head, no face turned away, no face hidden in shadow, no neon night-market saturation, no empty street without a person
```

</details>

### 6. Ina（比西里岸）（比西里岸）

`p-chenggong-guide.png` → `.portrait-src/`　·　成功鎮

清晨四點半天未亮的三仙台潮間帶，六十多歲阿美族女導覽員站直身把貝殼舉到臉旁講解，頭燈照亮臉，八拱橋只是遠處剪影。

```text
Documentary editorial photograph of a coastal foraging guide, a short stout Amis Indigenous Taiwanese woman in her mid sixties with thick working hands, grey hair wrapped in a plain printed headcloth, a faded long-sleeve work shirt, rubber boots, a small head torch on a cord round her neck, a woven collecting basket at her hip. She stands upright at the edge of a tide pool and holds a limpet up beside her own face to show the group, half turned toward them, the tilted head torch throwing light across her face so it reads clearly. The intertidal rock shelf at Sanxiantai in Chenggong, Taitung: dark pitted rock and shallow pools, the eight-arch footbridge only a small soft silhouette far behind. Half past four in the morning, true pre-dawn twilight, the sun still below the sea, one faint warm band on the eastern horizon, cool blue light on wet rock. Wide 16:9 frame, waist-up and close, camera at her own eye level and never below it, subject right of centre, head in the upper-middle third, wet rock in the lower-left, pale twilight sky in the upper-right. 85mm lens, f/2.8, background compressed and out of focus, visible grain.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no heroic low angle, no ceremonial Indigenous dress or headdress, no white sand, no palm trees, no tropical resort water, no empty seascape without a person, no sun disc above the horizon, no golden sunburst, no silhouette-only figure, no face hidden in shadow, no crouching or bent-over pose
```

</details>

### 7. 雅萍（海線濕地）（海線濕地）

`p-gaomei-guide.png` → `.portrait-src/`　·　清水區

四十出頭的台灣女導覽在高美濕地木棧道欄杆邊放下望遠鏡指向潮間帶，夕陽映在淺水上。

```text
Documentary editorial photograph of a wetland ecology guide, a Han Taiwanese woman in her early forties of medium build with tanned forearms, a low ponytail pulled through a wide visor cap, a pale lilac long-sleeve sun shirt, binoculars on a strap, mud on the hem. At the boardwalk rail she lowers the binoculars and points across the mudflat. The Gaomei wetland boardwalk over tidal flats, wind turbines on the skyline, sunset with orange sky mirrored in shallow water. Wide 16:9 frame, waist-up, subject right of centre, head in the upper-middle third, boardwalk planks lower-left, open sky upper-right. 50mm lens, f/2.8.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no heroic low angle, no silhouette-only figure, no crowd of tourists, no purple-magenta sky, no empty sunset landscape without a person
```

</details>

### 8. 秀珠・府城巷弄導覽（府城巷弄導覽）

`p-tainan-guide.png` → `.portrait-src/`　·　中西區　·　**已有暫用圖，建議重生**

台南中西區廟埕，五十多歲女導覽員一手撐在門枕石上、半轉身講解，另一手在腰際比劃，香煙在上午光線中飄散。

```text
Documentary editorial photograph of a walking-tour guide, a short sturdy Han Taiwanese woman in her late fifties, short permed curls greying at the roots, a floral short-sleeve blouse, a cloth crossbody bag, a folded paper fan tucked under one arm. She rests a palm flat on the worn stone door-drum at the temple threshold with her weight on that arm, half-turned back and mid-sentence, her other hand gesturing low at her hip. A temple forecourt in Tainan West Central District, incense smoke drifting, old carved brackets and swept stone paving, mid-morning shafts of light through the smoke. Wide 16:9 frame, waist-up, subject slightly right of centre, head in the upper-middle third, empty swept stone in the lower-left, smoke haze in the upper-right. 50mm lens, f/2.5, warm restrained film colour, real skin.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no readable temple plaques or couplets, no watermarks, no logos, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D render, no CGI, no HDR clown colour, no stock-photo smile, no fashion retouching, no glamour lighting, no heroic low angle, no empty temple with no person, no ceremonial costume, no tourist crowds filling the frame, no upward pointing gesture
```

</details>

### 9. 佩瑜・羅東散策（羅東散策）

`p-luodong-guide.png` → `.portrait-src/`　·　羅東鎮

羅東夜市走道，二十多歲女導覽回頭把一碗小吃遞向團員，攤位燈光與蒸氣在夜色中。

```text
Documentary editorial photograph, environmental portrait of a small, slight Han Taiwanese woman in her late twenties, a night-market guide, high ponytail with a blunt fringe, black tee under an open denim shirt, small crossbody bag. She turns back toward her group, holding out a paper bowl of food. Aisle of Luodong night market, stall lights and steam rising, blurred unreadable signage and hanging bulbs, warm stall lighting on her face at night. Wide 16:9 frame, waist-up, subject right of centre, dark aisle floor in the lower-left, dim canopy in the upper-right. 35mm lens, f/1.8, slight motion blur in the crowd, warm grainy film colour.
```

<details><summary>Negative prompt</summary>

```text
text, letters, readable stall signs or menus, watermarks, logos, likeness of a real person, children's faces, sexualised content, plastic 3D render, CGI, HDR clown colour, stock-photo smile, fashion retouching, beauty filter, influencer posing, heroic low angle, empty market alley with no person, daylight, lanterns as decoration cliché
```

</details>

### 10. 建良・野柳地質走讀（野柳地質走讀）

`p-yehliu-guide.png` → `.portrait-src/`　·　萬里區

新北萬里野柳蜂窩岩平台，四十多歲男地質導覽站在紅色圍繩內，手掌懸空不碰岩石，在空中比出蕈狀岩頸部的風化線，清晨低光掃過岩面。

```text
Documentary editorial photograph, environmental portrait of a medium-broad Han Taiwanese man in his late forties, thick through the middle, a geology walking guide, short hair under a khaki wide-brim sun hat, greying sideburns, khaki field vest with many pockets, a hand lens on a cord. He stands behind the low rope line on the marked visitor path, one open palm held a hand's width clear of a mushroom rock without touching it, tracing the wind-cut neck in the air as he explains the erosion. Yehliu Geopark platform in Wanli, New Taipei: honeycomb-pitted sandstone underfoot, more mushroom rocks and the open sea behind, early morning sun raking low across the stone. Wide 16:9 frame, waist-up, subject right of centre, head in the upper-middle third, pitted rock floor in the lower-left, sea and sky in the upper-right. 35mm lens, f/4, natural colour.
```

<details><summary>Negative prompt</summary>

```text
text, letters, signage, watermarks, logos, likeness of a real person, children's faces, sexualised content, plastic 3D render, CGI, HDR clown colour, stock-photo smile, fashion retouching, heroic low angle, empty rock landscape with no person, Queen's Head postcard framing, tourist queues, drone view, sunset orange sky, hand touching the rock, desert hoodoo landscape
```

</details>

### 11. 小米（在地文化工作室）

`p-xiaomi.png` → `.portrait-src/`　·　萬華區

萬華剝皮寮紅磚騎樓，三十出頭短髮女導覽員雙手推動老式木摺門示範舊店面怎麼開門，回頭邊說邊使力，午前深騎樓陰影。

```text
Documentary editorial photograph of a walking guide, a petite Han Taiwanese woman in her early thirties, small shoulders, a short bob tucked behind one ear, no glasses, a mustard linen shirt over a plain tee, a flat hip pouch and no shoulder bag. Both hands on the timber, she draws an old wooden folding shopfront shutter half closed to show her group how the shop used to open, leaning her weight into it, face turned back over her shoulder mid-sentence. The red-brick arcade of Bopiliao Historic Block in Wanhua, Taipei, late morning, deep arcade shade against a bright street beyond the arches. Wide 16:9 frame, waist-up, subject right of centre, head in the upper-middle third, worn arcade floor in the lower-left, arch shadow in the upper-right. 35mm lens, f/2.8, soft falloff, restrained film colour, natural skin.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no signage lettering, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no studio backdrop, no traditional costume or qipao, no lanterns as props, no empty street without a person, no back of head
```

</details>

### 12. Panay（太魯閣自然導覽）

`p-hualien-guide.png` → `.portrait-src/`　·　秀林鄉

太魯閣砂卡礑步道，四十出頭阿美族女導覽員盤髮、穿橄欖綠工作衫，扶著欄杆指認岩壁蕨類，清晨峽谷冷光與清澈溪水。

```text
Documentary editorial photograph, three-quarter body environmental portrait of an Amis Indigenous Taiwanese woman in her early forties, compact and strong with sun-darkened forearms, long black hair in a low working bun, faded olive field shirt, trail trousers, small daypack, no jewellery. One hand rests on the walkway rail, the other points at a fern growing out of the rock face as she explains it. Shakadang Trail in Taroko Gorge, Hualien: a narrow walkway blasted into grey-and-white banded marble, the clear blue-green Shakadang stream running over pale marble boulders below, early morning, cool gorge shade against the bright water. Wide 16:9 frame, subject right of centre, head in the upper-middle third, stream and rail in the lower-left, dark marble wall in the upper-right. 35mm lens, f/4, natural contrast, film-like colour.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no ceremonial or tribal costume, no feathered headdress, no facial tattoo, no studio lighting, no turquoise tropical lagoon colour, no empty gorge landscape without a person
```

</details>

### 13. 怡君（河口散步）

`p-tamsui-guide.png` → `.portrait-src/`　·　淡水區

淡水紅毛城砲台平臺，三十多歲長髮女導覽員捧著護貝老地圖解說，河口夕陽與觀音山在後。

```text
Documentary editorial photograph, waist-up environmental portrait of a Han Taiwanese woman in her mid-thirties, average build, long straight hair worn loose with sunglasses pushed up on her head, navy-and-white striped long-sleeve top, small shoulder bag. She holds a laminated old map at chest height, mid-sentence to a small group outside the frame. Setting is the red brick wall and cannon terrace of Fort San Domingo in Tamsui, the river mouth and Guanyin Mountain behind, golden hour with the sun low over the water. Wide 16:9 frame, subject slightly right of centre, terrace stonework in the lower-left, warm sky in the upper-right. 50mm lens, f/2.8, gentle backlight, film-like colour.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no readable map labels, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no studio backdrop, no lens flare stars, no empty sunset landscape without a person
```

</details>

### 14. 淑玲（鹽埕漫步）

`p-kaohsiung-guide.png` → `.portrait-src/`　·　鹽埕區

高雄鹽埕夜間老街，五十出頭短髮女導覽員穿珊瑚色polo衫，用手電筒照老磁磚牆面向團員解說，暖色店光。

```text
Documentary editorial photograph, waist-up environmental portrait of a sturdy Han Taiwanese woman in her early fifties, short practical hair dyed dark brown, reading glasses pushed up on her head, coral polo shirt, bum bag at the waist, a small torch on a wrist strap. She aims the torch beam at old tilework while her other hand gestures back to her group. A night lane in Yancheng, Kaohsiung, outside an old tiled shopfront, warm shop light spilling onto the pavement after dark, mixed street colour. Wide 16:9 frame, subject waist-up centred, dark road surface in the lower-left, shuttered upper storey in the upper-right. 35mm lens, f/2, available light, grain in the shadows.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no shop signage lettering, no neon words, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no studio flash look, no cyberpunk colour grade, no empty night street without a person
```

</details>

### 15. 秀蘭（縱谷田間）

`p-chishang-guide.png` → `.portrait-src/`　·　池上鄉

台東池上大坡池旁田埂，五十多歲女導覽員包著靛藍頭巾，攤開手心的稻穀用拇指搓開穀粒講解，上午亮而均勻的陰天光。

```text
Documentary editorial photograph of a rural walking guide, a small sinewy Han Taiwanese woman in her mid fifties with strong cracked hands, greying hair under a plain indigo headscarf knotted under the chin, a grey long-sleeve work shirt buttoned at the wrist, mud dried on her knees. She holds a loose handful of unhusked rice grains in one open palm and rubs a grain apart with her thumb, head tilted down over her hands but her face still readable in three-quarter profile, mid-sentence. A paddy bund beside Dapo Pond at Chishang, Taitung, green rice running away behind her and the Coastal Range flat and hazy above it, late morning under bright even overcast. Wide 16:9 frame, waist-up, subject centred, head in the upper-middle third, bund grass in the lower-left, pale sky in the upper-right. 85mm lens, f/2.8, cool restrained colour, soft film grain.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no studio lighting, no conical bamboo hat cliché, no wide-brim sun hat, no binoculars, no lotus-pond postcard look, no empty misty landscape without a person, no terraced hillside paddies
```

</details>

### 16. Lisin（馬太鞍濕地）

`p-guangfu-guide.png` → `.portrait-src/`　·　光復鄉

花蓮光復馬太鞍濕地，三十多歲阿美族女導覽員穿墨綠青蛙裝站在水中，提起巴拉告的中空竹筒。

```text
Documentary editorial photograph, three-quarter body environmental portrait of an Amis Indigenous Taiwanese woman in her late thirties, medium sturdy build with a broad back, hair in a bun held by a plain cloth band, dark green rubber waders over a t-shirt with the sleeves pushed up. She stands knee-deep in the water, lifting a dripping bundle of hollow bamboo from a palakaw fish trap. Mataian Wetland in Guangfu, Hualien: a shallow channel, stacked hollow-bamboo traps, water lettuce on the surface, mid-morning under bright overcast. Wide 16:9 frame, subject right of centre, open water in the lower-left, reed bank in the upper-right. 35mm lens, f/4, flat soft light, natural colour.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no logos, no watermarks, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no ceremonial Amis costume, no beaded headdress, no festival dance pose, no studio lighting, no empty wetland scenery without a person
```

</details>

### 17. 俊宏（平溪線走讀）

`p-pingxi-guide.png` → `.portrait-src/`　·　平溪區

平溪單軌鐵道旁，五十多歲戴帽男導覽員穿深藍鐵道式工作外套，沿著鐵軌指向列車來向，午後斜光。

```text
Documentary editorial photograph, three-quarter body environmental portrait of a medium-slim, upright Han Taiwanese man in his mid-fifties, greying short hair under a plain cap, trimmed moustache, dark blue railway-style work jacket with no insignia over a shirt. He stands beside the track and points along the rails to where the train will appear, mid-sentence. Pingxi, New Taipei: a single-track railway running between green hills, a level crossing beside weathered shophouses, late afternoon with warm light coming down the rails. Wide 16:9 frame, subject right of centre, ballast and rails in the lower-left, hillside in the upper-right. 50mm lens, f/4, warm film colour, soft grain.
```

<details><summary>Negative prompt</summary>

```text
no text, no letters, no station name boards, no logos, no watermarks, no railway company insignia, no likeness of any real living person, no children's faces, nothing sexualised, no plastic 3D-render look, no HDR clown colour, no stock-photo smile, no fashion retouching, no sky lanterns filling the sky, no crowds of tourists on the tracks, no empty railway scene without a person
```

</details>

### 18. 阿哲（哲行文化導覽）

`p-azhe.png` → `.portrait-src/`　·　大同區

台北大稻埕迪化街老屋立面前，四十多歲戴圓框眼鏡的導覽員舉著舊照片對照建築細節，午後反射光。

```text
Documentary editorial photograph of a Taiwanese cultural walking guide, a man in his late forties with a receding hairline, grey at the temples, round wire glasses, a slight paunch, wearing an olive utility gilet over a rolled-sleeve shirt with a notebook in the chest pocket. He holds an old photographic print up against a baroque shophouse facade on Dihua Street in Dadaocheng, Taipei, comparing the ironwork and plaster mouldings, awnings above the pavement, afternoon light reflecting warm off the street. Wide 16:9 frame, three-quarter body right of centre, empty pavement lower-left and plain plaster wall upper-right. 35mm lens, f/2.8, muted film colour.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no legible shop signs, no logos, no watermarks, no likeness of any real person, no children's faces, nothing sexualised, no 3D render look, no plastic skin, no HDR clown colour, no stock photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no studio backdrop, no empty street without a person, no red lanterns strung across the frame, no dense crowd, no traditional costume
```

</details>

### 19. Sawagu（海岸走讀）

`p-taitung-guide.png` → `.portrait-src/`　·　台東市

台東鐵花村榕樹廣場黃昏，四十出頭的卑南族導覽員靠著矮牆講解，腳邊放吉他盒，燈籠暖光。

```text
Documentary editorial photograph of a Puyuma Indigenous Taiwanese guide, a wiry man in his early forties, hair tied in a short knot at the nape, stubble beard, wearing a charcoal henley and a plain woven wrist band, everyday 2020s field clothing. He leans on a low wall in the banyan courtyard of Tiehua Village in Taitung City, a guitar case at his feet, mid-sentence talking to guests, paper lanterns strung overhead at dusk, warm lantern light against a deep blue sky. Wide 16:9 frame, waist-up centred, dark ground lower-left, lantern bokeh upper-right. 50mm lens, f/1.8, grainy available-light film colour.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no legible posters, no logos, no watermarks, no likeness of any real person, no children's faces, nothing sexualised, no 3D render look, no plastic skin, no HDR clown colour, no stock photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no studio backdrop, no empty venue without a person, no ceremonial dress, no feather headdress, no tribal costume, no stage performance shot
```

</details>

### 20. 美玲（七星潭海岸）

`p-qixingtan-guide.png` → `.portrait-src/`　·　新城鄉

花蓮七星潭礫石灘日出，四十多歲台灣女導覽員戴毛帽穿紅風衣，伸手攔住團員避開湧浪並回頭說話，側光打亮臉，北方是清水斷崖。

```text
Documentary editorial photograph of a coastal guide at Qixingtan, Hualien. A compact sturdy Han Taiwanese woman in her late forties, hair tied back under a knitted beanie against the cold, a red windbreaker over a fleece, a head torch round her neck, wet boots. She stands square on the shifting grey pebbles with one arm held out flat and low, holding her group back from an incoming surge of surf, head turned to speak to them and side-on to the low sun so her face is lit rather than backlit, loose hair whipped across her cheek by the onshore wind. The grey pebble bank of Qixingtan, the Qingshui Cliffs headland running north behind her, dawn light, cold blue shadow between the stones. Wide 16:9 frame, waist-up and close, subject slightly right of centre, head in the upper-middle third, empty pebbles and surf in the lower-left, plain sky and headland in the upper-right. 50mm lens, f/2.8, background soft, the woman unmistakably the subject.
```

<details><summary>Negative prompt</summary>

```text
no text, no lettering, no logos, no watermarks, no likeness of any real person, no children's faces, nothing sexualised, no 3D render look, no plastic skin, no HDR clown colour, no stock photo smile, no fashion retouching, no perfect teeth, no heroic low angle, no studio backdrop, no empty beach without a person, no white sand, no palm trees, no turquoise tropical water, no beach umbrellas, no ceremonial dress, no crouching pose, no silhouette, no face in shadow, no small figure lost in a landscape
```

</details>

---

## 這 40 條是怎麼寫出來的

不是各寫各的。先產生一份**全域選角表**——40 個人的性別、年齡、族群、體型、髮型、
衣著、場景、時間、動作、取景一次決定，因為「不要 40 個人長得像同一個人」這件事
只有同時看到 40 個人的時候才管得住。然後才分頭把每一列展開成 prompt，
最後由三個互相獨立的面向各自挑錯，再合併：

- **撞臉**：兩條 prompt 會不會生出同一個人、同一個姿勢、同一件衣服、同一個背景？
  有沒有哪一條其實會生出「一片風景裡有個小人」——那正是這次要修掉的 bug。
- **台灣真實性**：那個鄉鎮、那個時辰的地形、植被、建築、光線對不對？
  花蓮台東的人看到會不會認得自己的地方？原住民導覽員是**工作中的人**，
  不是穿族服的觀光海報？車款對不對？
- **可用性**：版面規則有沒有真的寫進去？有沒有自相矛盾（兩個光源、兩個季節、
  兩種取景）會被模型平均成一團糊？negative 有沒有擋到這張圖特有的失敗？

三個面向一共提了 30 個問題，最後採用了 24 條修改。

實際結果：

- **性別** 24 男 / 16 女。司機偏男（17/20）但不是全男；導遊 7 男 13 女。
  名字有性別的照名字（美玲、淑玲、怡君、佩瑜、郁婷、秀蘭、雅萍、秀珠 為女；
  阿哲、阿源、宗翰、文彥、建良、俊宏 為男）。
- **年齡** 從二十多歲到六十多歲，13 個級距，沒有集中在四十歲男性。
  真的有六十幾歲的（府城司機、阿源、港都、Ina、池上小巴），也真的有二十幾歲的。
- **族群** 30 位漢人、10 位原住民，而且地理上站得住腳：秀林／新城是太魯閣族，
  花蓮市／光復馬太鞍／成功比西里岸是阿美族，台東市／卑南是卑南族。
  全部是 2020 年代的工作服，**40 條 prompt 裡沒有出現過一次族服**。
- **場景** 40 個不同的地方，全部取自那個人自己的服務主題與所在地。
  東北角拆成四處、北海岸三處、太魯閣三處、縱谷五處。
  **七星潭只用一次**，是美玲的，而且是灰色礫石灘配清水斷崖，不是白沙椰子樹。
- **光線** 對得上服務時段：04:30 出班的是天未亮，06:00 前後是晨霧，
  夕陽場是日落，夜市場是攤位燈光。40 張裡有 9 張是暗的，不是 40 個大晴天中午。
- **動作** 全部在做事——開門、擦玻璃、檢查胎壓、卸腳踏車、扛魚箱、倒茶、
  發安全帽、攤地圖、撥蘆葦、提竹籠、舉起一顆石頭。**沒有一個人只是對著鏡頭笑**。
