# 景點照片來源與授權

App 裡 86 張景點照片的攝影者、授權與原始頁面。全部在開發階段下載進專案、
裁切成 WebP 後隨站台部署，沒有任何一張是熱連結、AI 生成或通用圖庫的替身。

每個景點頁的照片下方也會顯示同樣的資訊（見 `PhotoCredit`），不是只寫在這份文件裡。

處理方式：原圖 → sharp（attention crop）→ WebP。兩個尺寸：
`-card.webp` 600×450（列表縮圖）、`-hero.webp` 1400×788（景點頁大圖）。

## 為什麼有兩個來源

**Wikimedia Commons** 是主要來源：台灣的景點在那裡幾乎都有真實照片，
而且 CC 授權要求標示出處——那是條款不是禮貌。

**Pexels** 只用在海外景點。那些地方的 Commons 覆蓋較差，而東京晴空塔、伏見稻荷、
景福宮這種世界級地標在商業圖庫裡有大量真實照片。Pexels 授權不要求標示出處，
這裡還是標了，理由跟人像那份一樣。

其中三張是「一類餐食」而不是特定店家（淺草燒肉、澀谷居酒屋、銀座拉麵），拍的是那道菜；
manifest 裡的註解會標出來。

## via Wikimedia Commons（62 張）

| 景點 | 攝影 | 授權 | 來源 |
| --- | --- | --- | --- |
| 安平古堡 | Mk2010 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AFort%20Zeelandia%2C%20Anping%20District%2C%20Tainan%20City%20(Taiwan).jpg) |
| 安平樹屋 | Sun Taro | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A2015-05-01%20Anping%20Tree%20House.jpg) |
| 北投溫泉 | 小三可 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A%E5%8F%B0%E5%8C%97%E5%8C%97%E6%8A%95%E6%BA%AB%E6%B3%89%E5%8D%9A%E7%89%A9%E9%A4%A8.jpg) |
| 碧潭風景區 | Monyuan | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [原始頁面](https://commons.wikimedia.org/wiki/File:Bitan%20Scenic%20Area.jpg) |
| 碧潭吊橋 | 王彥翔 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File:%E6%96%B0%E5%BA%97%20%E7%A2%A7%E6%BD%AD%E5%90%8A%E6%A9%8B.JPG) |
| 藍晒圖文創園區 | YU, CHIA-LII | [Public domain](https://commons.wikimedia.org/wiki/Template:PD-self) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AFrontalansicht.JPG) |
| 伯朗大道 | lienyuan lee | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A%E4%BC%AF%E6%9C%97%E5%A4%A7%E9%81%93%20Mr%20Brown%20Coffee%20Avenue%20-%20panoramio.jpg) |
| 赤崁樓 | arurakufuyuki | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AFort%20Provintia%2004.jpg) |
| 奇美博物館 | lienyuan lee | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A%E5%A5%87%E7%BE%8E%E5%8D%9A%E7%89%A9%E9%A4%A8%20Qimei%20Museum%20-%20panoramio.jpg) |
| 旗津海岸公園 | ironypoisoning | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ACijin%20Beach%2020150725.jpg) |
| 中正紀念堂 | Benlisquare | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AChiang%20Kai-shek%20Memorial%20Hall%20viewed%20from%20Liberty%20Square.jpg) |
| 大稻埕迪化街 | Peellden | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ABuildings%20along%20Dihua%20Street%2007.23%20(10).jpg) |
| 東大門夜市 | Sinchen.Lin | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A39-%E8%8A%B1%E8%93%AE%E6%9D%B1%E5%A4%A7%E9%96%80%E5%A4%9C%E5%B8%82%EF%BC%8C%E6%88%91%E6%9C%80%E5%A4%AF%E7%86%B1%E7%82%92%20(28896724823).jpg) |
| 象山步道 | Felix Filnkoessl | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A2017-07-16%20View%20of%20Taipei%20101%2C%20taken%20from%20Elephant%20Mountain.jpg) |
| 逢甲夜市 | Chensiyuan | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A1%20fengjia%20night%20market%202019.jpg) |
| 淡水紅毛城 | Adam Jones | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AFort%20Santo%20Domingo%20with%20ROC%20national%20flag%2020190518.jpg) |
| 府中街商圈 | Chainwit. | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AP%C3%A0n%20G%C5%8Dng%20Sh%C3%AD%20F%C4%81ng%20Tainan%20%E6%B3%AE%E5%AE%AE%E7%9F%B3%E5%9D%8A%20(2026)%20-%20IMG%2001.jpg) |
| 高美濕地 | 潘麗峰 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AGaomei%20Wetland%20sunset%20DSC%205441-2.jpg) |
| 國華街 | Andrzej Otrębski | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ATainan%20Guohua%20St%201.jpg) |
| 林百貨 | WEI, WAN-CHEN（魏琬臻） | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A%E5%8E%9F%E6%9E%97%E7%99%BE%E8%B2%A8%E5%BA%97-1.jpg) |
| 和美山步道 | Anas1712 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File:View%20of%20Xindian%20skyline%20and%20Taipei%20101%20from%20Hemeishan%20top%20near%20Bitan%2020230522%20130327.jpg) |
| 花蓮文化創意產業園區 | lienyuan lee | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A%E8%8A%B1%E8%93%AE%E6%96%87%E5%89%B5%E7%94%A2%E6%A5%AD%E5%9C%92%E5%8D%80%20Hualian%20Cultural%20and%20Creative%20Industries%20Park%20-%20panoramio.jpg) |
| 光復糖廠 | Fred Hsu | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ATaiwan%202009%20GuangFu%20Sugar%20Factory%20Historical%20Train%20Exhibition%20FRD%206170.jpg) |
| 礁溪溫泉 | Yu tptw | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A%E6%B9%AF%E5%9C%8D%E6%BA%9D%E6%99%AF%E8%A7%80%E6%B1%A0.jpg) |
| 景美夜市 | Alfred Twu | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [原始頁面](https://commons.wikimedia.org/wiki/File:Jingmei-night-market.jpg) |
| 白色恐怖景美紀念園區 | 人人生來平等 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File:%E6%99%AF%E7%BE%8E%E4%BA%BA%E6%AC%8A%E6%96%87%E5%8C%96%E5%9C%92%E5%8D%80%E8%AD%A6%E5%82%99%E7%B8%BD%E5%8F%B8%E4%BB%A4%E9%83%A8%E4%BB%81%E6%84%9B%E6%A8%93%E7%9C%8B%E5%AE%88%E6%89%80%E5%A4%96%E9%83%A8.jpg) |
| 九份老街 | bizmac | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A2008-03-08%20Jiufen%20Old%20Street%2003.jpg) |
| 六合夜市 | Zairon | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AKaohsiung%20Liuhe%20Night%20Street%20Market%204.jpg) |
| 龍山寺 | Ray Terrill | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A2012-07-04%20Bangka%20Lungshan%20Temple.jpg) |
| 蓮池潭 | CEphoto, Uwe Aranas | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AKaohsiung%20Taiwan%20Dragon-and-Tiger-Pagodas-01.jpg) |
| 羅東夜市 | tomscoffin | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A2014-01-29%20Luodong%20Night%20Market%2001.jpg) |
| 貓空纜車 | 玄史生 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AMaokong%20Gondola%20between%20Taipei%20Zoo%20South%20and%20Zhinan%20Temple%2020131002.jpg) |
| 明治神宮 | Zairon | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AMeiji-jingu%20Haupthalle%202.jpg) |
| 國立故宮博物院 | Jason Zhang | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ANational%20Palace%20Museum%2C%20Taipei.jpg) |
| 臺中國家歌劇院 | Ralff Nestor Nacor | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ANational%20Taichung%20Theater%2C%20Nov%202024%20(5).jpg) |
| 駁二藝術特區 | ABOVE THE SKY | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ALiveWarehouse%20Kaohsiung.jpg) |
| 松園別館 | 王嘉新 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A%E8%8A%B1%E8%93%AE%E6%9D%BE%E5%9C%92%E5%88%A5%E9%A4%A8.jpg) |
| 七星潭 | Artemas Liu | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AQixingtan%20Beach%2C%20Taiwan.jpg) |
| 彩虹眷村 | allanlau2000 | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ARainbow%20village%20Taichung.jpg) |
| 饒河街觀光夜市 | Ji Soo Song | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ARaohe%20Night%20Market%202022.jpg) |
| 三仙台 | CEphoto, Uwe Aranas | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ATaitung-County%20Taiwan%20Sansiantai-Bridge-01.jpg) |
| 淺草寺 | Dick Thomas Johnson | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ASensoji%20(52480540067).jpg) |
| 砂卡礑步道 | lienyuan lee | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A%E7%A0%82%E5%8D%A1%E7%A4%91%E6%AD%A5%E9%81%93%20Shakadang%20Trail%20-%20panoramio%20(2).jpg) |
| 審計新村 | Fcuk1203 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A%E5%AF%A9%E8%A8%88%E6%96%B0%E6%9D%91%E6%96%87%E5%89%B5%E8%81%9A%E8%90%BD.jpg) |
| 神農街 | Andrzej Otrębski | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ATainan%20Shennong%20St%201.jpg) |
| 十分老街 | Chainwit. | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ANew%20Taipei%20-%20Shifen%20Old%20Street%20%E5%8D%81%E5%88%86%E8%80%81%E8%A1%97%20(2025)%20-%20IMG%2006.jpg) |
| 花蓮縣石雕博物館 | Flodur1209 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File:Roland_Mayer_TREE_OF_LIFE_Hualien_Taiwan_2007.jpg) |
| 臺南市美術館 2 館 | Adece033090 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A%E8%87%BA%E5%8D%97%E5%B8%82%E7%BE%8E%E8%A1%93%E9%A4%A82%E9%A4%A8%E5%BB%BA%E7%AF%89.jpg) |
| 府城牛肉湯 | Sinchen.Lin | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File:16-%E5%8F%B0%E5%8D%97%E6%97%A9%E9%A4%90%E5%9C%8B%E8%8F%AF%E8%A1%97%E9%98%BF%E6%9D%91%E7%89%9B%E8%82%89%E6%B9%AF%EF%BC%8C%E5%8F%B0%E5%8D%97%E7%9C%9F%E5%A5%BD_(29484622036).jpg) |
| 台南孔廟 | Felix Filnkoessl | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ATainan%20Confucius%20Temple%20in%20the%20afternoon%20on%208th%20August%202019.jpg) |
| 台北101 | CEphoto, Uwe Aranas | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ATaipei%20Taiwan%20Taipei-101-Tower-01.jpg) |
| 台東森林公園 | Moran Tsai | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ASky%20above%20Pipa%20Lake.jpg) |
| 淡水老街 | susan curry | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ATamsui%20%E6%B7%A1%E6%B0%B4%E8%80%81%E8%A1%97%20-%20panoramio%20(36).jpg) |
| 太魯閣國家公園 | Balon Greyjoy | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A20190417%20Taroko%20Gorge-13.jpg) |
| 鐵花村音樂聚落 | 總統府 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A06.30%20%E7%B8%BD%E7%B5%B1%E5%8F%83%E8%A8%AA%E9%90%B5%E8%8A%B1%E6%9D%91%20(48160081556).jpg) |
| 國立傳統藝術中心 | 徐月春 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A268%2C%20Taiwan%2C%20%E5%AE%9C%E8%98%AD%E7%B8%A3%E4%BA%94%E7%B5%90%E9%84%89%E5%AD%A3%E6%96%B0%E6%9D%91%20-%20panoramio%20(12).jpg) |
| 衛武營國家藝術文化中心 | yunlin2003 | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A%E6%88%B6%E5%A4%96%E5%8A%87%E5%A0%B4%20Outdoor%20Theater%20(46812104541).jpg) |
| 五峰旗瀑布 | Wl02460852 | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [原始頁面](https://commons.wikimedia.org/wiki/File%3AYilan%20Wufengqi%20Waterfall-%E5%AE%9C%E8%98%AD-%E4%BA%94%E5%B3%B0%E6%97%97%E7%80%91%E5%B8%83.jpg) |
| 新店溪河濱步道 | C.L. Kao (eddie5150) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [原始頁面](https://commons.wikimedia.org/wiki/File:%E5%AE%89%E5%9D%91%E6%A9%8B%EF%BC%8C%E6%96%B0%E5%BA%97%E6%BA%AA%E5%B7%A6%E5%B2%B8%E6%B2%B3%E6%BF%B1%E8%87%AA%E8%A1%8C%E8%BB%8A%E9%81%93%E3%80%82%20-%20panoramio.jpg) |
| 野柳地質公園 | Ding Kezhong | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3ADSC09559%E9%87%8E%E6%9F%B3%E6%99%AF%E8%A7%82%E4%B8%80%E8%A7%92.jpg) |
| 永康街 | Sun Taro | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [原始頁面](https://commons.wikimedia.org/wiki/File%3A2015-05-02%20a%20baobing%20restaurant%20at%20Yongkang%20Street%2C%20Taipei.jpg) |
| 裕隆城 | Foxy1219 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [原始頁面](https://commons.wikimedia.org/wiki/File:%E6%96%B0%E5%BA%97%20%E8%A3%95%E9%9A%86%E5%9F%8E%202023-11-02%20(2).jpg) |

## via Pexels（24 張）

| 景點 | 攝影 | 授權 | 來源 |
| --- | --- | --- | --- |
| 阿美橫町 | AXP Photography | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/an-asian-shopping-promenade-18848544/) |
| 嵐山竹林 | Huu Huynh | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/entrance-to-the-park-with-bamboo-trees-in-kyoto-japan-16761540/) |
| 淺草 燒肉 | Kris Li | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/japanese-yakiniku-with-grilled-meat-and-side-dishes-31325739/) |
| 北村韓屋村 | Line Knipst | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/crowd-of-tourists-on-the-walkway-in-bukchon-hanok-village-20325769/) |
| 東京迪士尼樂園 | Onai Leonardo | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/disneyland-tokyo-mickey-and-castle-view-35644024/) |
| 道頓堀 | Tamjeed A | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/vibrant-nightlife-at-dotonbori-canal-osaka-31184555/) |
| 伏見稻荷大社 | G N | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/vibrant-torii-gates-pathway-in-fushimi-inari-kyoto-29537651/) |
| 銀座 | Fernando B M | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/evening-street-view-of-ginza-tokyo-s-shopping-district-33901684/) |
| 景福宮 | Saksham Vikram | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/historic-gyeongbokgung-palace-entrance-in-seoul-33019230/) |
| 原宿 竹下通 | Colin S. | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/takeshitadori-2-27945361/) |
| 銀座 篝 拉麵 | Luis C. Tavera | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/fingers-holding-food-in-chopsticks-16671603/) |
| 清水寺 | Irina Senti | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/scenic-view-of-kiyomizu-dera-temple-in-kyoto-36717832/) |
| 明洞 | Saksham Vikram | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/vibrant-nightlife-in-seoul-s-myeongdong-district-33019190/) |
| 仲見世通 | Satoshi Hirayama | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/crowd-walking-in-city-13598678/) |
| 大阪城 | Dmitry Romanoff | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/traditional-pagoda-of-asian-temple-21821256/) |
| 澀谷十字路口 | Margo Evardson | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/vibrant-nightlife-at-shibuya-crossing-tokyo-35827257/) |
| 澀谷 居酒屋 | Iban Lopez Luna | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/authentic-tokyo-izakaya-scene-with-lanterns-37919989/) |
| 新宿 | Julias  Torten und Törtchen | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/vibrant-neon-cityscape-of-tokyo-at-night-30933060/) |
| 東京晴空塔 | Rin Gakusho | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/cityscape-of-tokyo-in-japan-20378132/) |
| teamLab Planets | Ayşin S. | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/back-view-of-women-facing-a-wall-art-12353408/) |
| 東京國立博物館 | Mauricio Ortiz | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/a-woman-and-a-child-are-walking-in-a-park-27595761/) |
| 築地場外市場 | AXP Photography | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/people-at-tsukiji-market-at-night-tokyo-japan-18848579/) |
| 上野公園 | Iban Lopez Luna | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/scenic-view-of-bentendo-temple-in-ueno-park-37416701/) |
| 日本環球影城 | Jugdeep Gill | [Pexels License](https://www.pexels.com/license/) | [原始頁面](https://www.pexels.com/photo/hogwarts-castle-at-universal-studios-japan-31288143/) |

## 還沒有照片的

| 景點 | 為什麼 |
| --- | --- |
| 阿明豬心冬粉 | 特定台南店家。Commons 與 Pexels 都沒有，泛用米粉湯照片撐一家有名字的店，跟拿風景照撐一個人是同一種錯 |

它顯示 T0 的 `Generated` 硬邊海報圖——那是設計過的空狀態，不是破圖。

## 重新產生

```bash
PEXELS_KEY=... node scripts/fetch-poi-photos.mjs        # 海外景點
node scripts/fetch-commons-photo.mjs <poiId> "File:…"   # 單張，指定 Commons 檔名
node scripts/apply-poi-photos.mjs                       # 寫進 imagePrompts.ts
node scripts/build-photo-attribution.mjs                # 重寫這份文件
```
