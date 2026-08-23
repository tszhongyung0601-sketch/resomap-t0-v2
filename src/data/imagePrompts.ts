import type { Poi } from "../types";

/**
 * The image manifest.
 *
 * ResoMap ships no photography. That is a licensing decision, not an oversight:
 * a stock photo of the wrong temple is worse than an honest graphic, and an AI
 * image of a real place presented as a photograph is worse than both. So the
 * app draws generated covers, and this file is the queue of what should replace
 * them and with what.
 *
 * Two kinds of slot, and the distinction is the whole point:
 *
 *   "photo"  — what the place looks like now. Must be a real photograph. AI is
 *              not an acceptable substitute here at any quality, because a
 *              traveller uses this image to recognise the building when they
 *              arrive.
 *
 * There was a second kind — "scene", a generated view of a period nobody
 * photographed, rendered under an ✨ AI 情境重現 label. Four slots were
 * written and none was ever produced, so for as long as it existed the only
 * thing it put on a traveller's screen was a grey box reading 情境圖製作中.
 * The kind is gone rather than left waiting: a manifest that describes images
 * nobody is making is a to-do list pretending to be data.
 */

export type ImageKind = "photo";
export type ImageStatus = "todo" | "queued" | "done";

/**
 * Who took it and under what licence.
 *
 * Not a nicety: every CC licence except CC0 *requires* attribution, so a photo
 * shipped without this is a licence breach rather than an untidy caption. The
 * POI page prints it under the image.
 */
export interface Credit {
  /** The photographer, as Commons names them. */
  author: string;
  /** "CC BY-SA 4.0" — printed verbatim, never paraphrased. */
  licence: string;
  /** The licence deed, so the claim is checkable. */
  licenceUrl: string;
  /** The file's source page, which carries the full provenance. */
  source: string;
  /** Where it came from. Omitted means Wikimedia Commons, which is where every
      photograph in this manifest came from until the overseas gaps were filled
      from a stock library with a different licence and a different line. */
  via?: string;
}

export interface ImageSlot {
  poiId: string;
  kind: ImageKind;
  /** 16:9 for heroes and destinations, 4:3 for POI and story cards. */
  aspectRatio: "16:9" | "4:3" | "1:1";
  /** Long edge, in px, before compression. Sized for 2x on a 430px phone. */
  minLongEdge: number;
  /** What the shot must show. */
  prompt: string;
  status: ImageStatus;
  /**
   * The card-size file (600x450). Small on purpose: the home rail shows it at
   * ~184px and 導覽庫 at ~128px, and shipping a 1600px file into a 184px slot is
   * most of the payload for none of the sharpness.
   */
  src?: string;
  /** The POI hero (1600x900). Only the screen that fills the width asks for it. */
  srcLarge?: string;
  credit?: Credit;
}

/**
 * Tainan first, because it is the demo city. Eight photo slots is roughly one
 * afternoon of shooting — a deliberately finishable list rather than eighty
 * aspirational ones.
 */
export const IMAGE_SLOTS: ImageSlot[] = [

  /* ---------------------------------------------------------- 台南 photos */
  {
    poiId: "chihkan",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1600,
    prompt:
      "赤崁樓正面全景，文昌閣與海神廟的紅瓦飛簷完整入鏡，前景可見蓬壺書院。午後斜光，不要遊客入鏡。",
    status: "done",
    src: "photos/chihkan-card.webp",
    srcLarge: "photos/chihkan-hero.webp",
    credit: {
      author: "arurakufuyuki",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3AFort%20Provintia%2004.jpg",
    },
  },
  {
    poiId: "anping-fort",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1600,
    prompt: "安平古堡外側被榕樹根抓住的紅磚殘牆，牆面質地清楚可辨，不要只拍白色瞭望塔。",
    status: "done",
    src: "photos/anping-fort-card.webp",
    srcLarge: "photos/anping-fort-hero.webp",
    credit: {
      author: "Mk2010",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3AFort%20Zeelandia%2C%20Anping%20District%2C%20Tainan%20City%20(Taiwan).jpg",
    },
  },
  {
    poiId: "jiufen",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1600,
    prompt:
      "九份老街覆蓋式巷道，兩側紅燈籠與店家招牌，有人潮、有縱深。",
    status: "done",
    src: "photos/jiufen-card.webp",
    srcLarge: "photos/jiufen-hero.webp",
    credit: {
      author: "bizmac",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A2008-03-08%20Jiufen%20Old%20Street%2003.jpg",
    },
  },
  {
    poiId: "taroko",
    kind: "photo",
    aspectRatio: "16:9",
    minLongEdge: 1920,
    prompt:
      "太魯閣峽谷大理岩峭壁夾出的 V 形，霧氣纏在稜線上。",
    status: "done",
    src: "photos/taroko-card.webp",
    srcLarge: "photos/taroko-hero.webp",
    credit: {
      author: "Balon Greyjoy",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File%3A20190417%20Taroko%20Gorge-13.jpg",
    },
  },
  {
    poiId: "shennong",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "神農街白天街景，兩側木造街屋二樓立面清楚，燈籠與盆栽，街道有縱深。",
    status: "done",
    src: "photos/shennong-card.webp",
    srcLarge: "photos/shennong-hero.webp",
    credit: {
      author: "Andrzej Otrębski",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ATainan%20Shennong%20St%201.jpg",
    },
  },
  {
    poiId: "longshan",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "龍山寺前殿正面全貌，飛簷剪黏、紅燈籠、廟前石階，藍天。",
    status: "done",
    src: "photos/longshan-card.webp",
    srcLarge: "photos/longshan-hero.webp",
    credit: {
      author: "Ray Terrill",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A2012-07-04%20Bangka%20Lungshan%20Temple.jpg",
    },
  },
  {
    poiId: "dadaocheng",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "迪化街連續街屋立面，一個畫面裡看得到三種年代的門面。",
    status: "done",
    src: "photos/dadaocheng-card.webp",
    srcLarge: "photos/dadaocheng-hero.webp",
    credit: {
      author: "Peellden",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ABuildings%20along%20Dihua%20Street%2007.23%20(10).jpg",
    },
  },
  {
    poiId: "opera-house",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "臺中國家歌劇院全棟外觀，曲面洞口與玻璃反射，藍天。",
    status: "done",
    src: "photos/opera-house-card.webp",
    srcLarge: "photos/opera-house-hero.webp",
    credit: {
      author: "Ralff Nestor Nacor",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ANational%20Taichung%20Theater%2C%20Nov%202024%20(5).jpg",
    },
  },
  {
    poiId: "pier2",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "駁二倉庫本體，裸露紅磚與 LIVE WAREHOUSE 字樣。",
    status: "done",
    src: "photos/pier2-card.webp",
    srcLarge: "photos/pier2-hero.webp",
    credit: {
      author: "ABOVE THE SKY",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ALiveWarehouse%20Kaohsiung.jpg",
    },
  },
  {
    poiId: "qixingtan",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "七星潭礫石灘與turquoise海面，後方中央山脈與棕櫚。",
    status: "done",
    src: "photos/qixingtan-card.webp",
    srcLarge: "photos/qixingtan-hero.webp",
    credit: {
      author: "Artemas Liu",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3AQixingtan%20Beach%2C%20Taiwan.jpg",
    },
  },
  {
    poiId: "pine-garden",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "松園別館爬藤拱廊二層建築，前景老松與草地。",
    status: "done",
    src: "photos/pine-garden-card.webp",
    srcLarge: "photos/pine-garden-hero.webp",
    credit: {
      author: "王嘉新",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A%E8%8A%B1%E8%93%AE%E6%9D%BE%E5%9C%92%E5%88%A5%E9%A4%A8.jpg",
    },
  },
  {
    poiId: "traditional-arts",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "傳藝中心文昌街，紅磚街屋兩側掛紅燈籠。",
    status: "done",
    src: "photos/traditional-arts-card.webp",
    srcLarge: "photos/traditional-arts-hero.webp",
    credit: {
      author: "徐月春",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A268%2C%20Taiwan%2C%20%E5%AE%9C%E8%98%AD%E7%B8%A3%E4%BA%94%E7%B5%90%E9%84%89%E5%AD%A3%E6%96%B0%E6%9D%91%20-%20panoramio%20(12).jpg",
    },
  },
  {
    poiId: "tiehua",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "鐵花村木造建築前的街頭藝人表演，紅色遮陽傘。",
    status: "done",
    src: "photos/tiehua-card.webp",
    srcLarge: "photos/tiehua-hero.webp",
    credit: {
      author: "總統府",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A06.30%20%E7%B8%BD%E7%B5%B1%E5%8F%83%E8%A8%AA%E9%90%B5%E8%8A%B1%E6%9D%91%20(48160081556).jpg",
    },
  },
  {
    poiId: "sensoji",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "淺草寺雷門正面，大紅燈籠與金龍山匾額。",
    status: "done",
    src: "photos/sensoji-card.webp",
    srcLarge: "photos/sensoji-hero.webp",
    credit: {
      author: "Dick Thomas Johnson",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ASensoji%20(52480540067).jpg",
    },
  },
  {
    poiId: "meiji",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "明治神宮正殿，兩側大樟樹framing，前庭廣場。",
    status: "done",
    src: "photos/meiji-card.webp",
    srcLarge: "photos/meiji-hero.webp",
    credit: {
      author: "Zairon",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3AMeiji-jingu%20Haupthalle%202.jpg",
    },
  },
  {
    poiId: "hualien-cultural",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "花蓮文創園區的兩層木造與洗石子建築，前景草地與檳榔樹，藍天。",
    status: "done",
    src: "photos/hualien-cultural-card.webp",
    srcLarge: "photos/hualien-cultural-hero.webp",
    credit: {
      author: "lienyuan lee",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A%E8%8A%B1%E8%93%AE%E6%96%87%E5%89%B5%E7%94%A2%E6%A5%AD%E5%9C%92%E5%8D%80%20Hualian%20Cultural%20and%20Creative%20Industries%20Park%20-%20panoramio.jpg",
    },
  },
  {
    poiId: "dongdamen",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "東大門夜市熱炒攤門面，菜單牌、攤商與客人。",
    status: "done",
    src: "photos/dongdamen-card.webp",
    srcLarge: "photos/dongdamen-hero.webp",
    credit: {
      author: "Sinchen.Lin",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A39-%E8%8A%B1%E8%93%AE%E6%9D%B1%E5%A4%A7%E9%96%80%E5%A4%9C%E5%B8%82%EF%BC%8C%E6%88%91%E6%9C%80%E5%A4%AF%E7%86%B1%E7%82%92%20(28896724823).jpg",
    },
  },
  {
    poiId: "shakadang",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "砂卡礑步道的大理岩溪床與切在崖壁上的步道，兩側綠壁。",
    status: "done",
    src: "photos/shakadang-card.webp",
    srcLarge: "photos/shakadang-hero.webp",
    credit: {
      author: "lienyuan lee",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A%E7%A0%82%E5%8D%A1%E7%A4%91%E6%AD%A5%E9%81%93%20Shakadang%20Trail%20-%20panoramio%20(2).jpg",
    },
  },
  {
    poiId: "hualien-sugar",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "光復糖廠保存的黑色糖鐵貨車廂，後方山稜與藍天。",
    status: "done",
    src: "photos/hualien-sugar-card.webp",
    srcLarge: "photos/hualien-sugar-hero.webp",
    credit: {
      author: "Fred Hsu",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ATaiwan%202009%20GuangFu%20Sugar%20Factory%20Historical%20Train%20Exhibition%20FRD%206170.jpg",
    },
  },
  {
    poiId: "taipei-101",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "黃昏時從山邊俯瞰信義區，台北101整支塔身完整入鏡，前景是象山系的樹林，遠處觀音山稜線。",
    status: "done",
    src: "photos/taipei-101-card.webp",
    srcLarge: "photos/taipei-101-hero.webp",
    credit: {
      author: "CEphoto, Uwe Aranas",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ATaipei%20Taiwan%20Taipei-101-Tower-01.jpg",
    },
  },
  {
    poiId: "cks-memorial",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "從自由廣場正對中正紀念堂的全景：白色主體、藍色八角攢尖頂、正面大階梯與兩側白石欄杆，晴天。",
    status: "done",
    src: "photos/cks-memorial-card.webp",
    srcLarge: "photos/cks-memorial-hero.webp",
    credit: {
      author: "Benlisquare",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3AChiang%20Kai-shek%20Memorial%20Hall%20viewed%20from%20Liberty%20Square.jpg",
    },
  },
  {
    poiId: "npm",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "故宮正館正面：米黃牆體與綠琉璃瓦歇山頂、白石欄杆雙向階梯與一樓入口，背後是士林的樹林山坡，藍天。",
    status: "done",
    src: "photos/npm-card.webp",
    srcLarge: "photos/npm-hero.webp",
    credit: {
      author: "Jason Zhang",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File%3ANational%20Palace%20Museum%2C%20Taipei.jpg",
    },
  },
  {
    poiId: "raohe",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "饒河街夜市街心夜景，遠端是亮著燈泡的「饒河街觀光夜市」牌樓，兩側攤棚、霓虹招牌與逛街人潮。",
    status: "done",
    src: "photos/raohe-card.webp",
    srcLarge: "photos/raohe-hero.webp",
    credit: {
      author: "Ji Soo Song",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ARaohe%20Night%20Market%202022.jpg",
    },
  },
  {
    poiId: "yongkang",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "永康街口的黃色芒果冰名店「思慕昔」轉角店面，招牌掛滿雪花冰照片，門口排著一長列人。",
    status: "done",
    src: "photos/yongkang-card.webp",
    srcLarge: "photos/yongkang-hero.webp",
    credit: {
      author: "Sun Taro",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A2015-05-02%20a%20baobing%20restaurant%20at%20Yongkang%20Street%2C%20Taipei.jpg",
    },
  },
  {
    poiId: "beitou",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "北投溫泉博物館：紅磚配深色木造的日治時期公共浴場，二樓拱廊掛紅燈籠，前方草坪與行人，藍天。",
    status: "done",
    src: "photos/beitou-card.webp",
    srcLarge: "photos/beitou-hero.webp",
    credit: {
      author: "小三可",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A%E5%8F%B0%E5%8C%97%E5%8C%97%E6%8A%95%E6%BA%AB%E6%B3%89%E5%8D%9A%E7%89%A9%E9%A4%A8.jpg",
    },
  },
  {
    poiId: "maokong",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "貓空纜車一整排車廂懸在纜索上跨過翠綠山谷，左側可見支撐塔柱，晴天白雲。",
    status: "done",
    src: "photos/maokong-card.webp",
    srcLarge: "photos/maokong-hero.webp",
    credit: {
      author: "玄史生",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3AMaokong%20Gondola%20between%20Taipei%20Zoo%20South%20and%20Zhinan%20Temple%2020131002.jpg",
    },
  },
  {
    poiId: "elephant-mtn",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "象山六巨石上坐滿等日落的人與攝影者，剪影後方是台北101與整片市區，太陽壓在天際線上。",
    status: "done",
    src: "photos/elephant-mtn-card.webp",
    srcLarge: "photos/elephant-mtn-hero.webp",
    credit: {
      author: "Felix Filnkoessl",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A2017-07-16%20View%20of%20Taipei%20101%2C%20taken%20from%20Elephant%20Mountain.jpg",
    },
  },
  {
    poiId: "tamsui",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "淡水老街中正路的行人街景，兩側店家招牌（阿英海石花、淡水阿給、炸蝦捲）與遮雨棚，街上滿是逛街人潮。",
    status: "done",
    src: "photos/tamsui-card.webp",
    srcLarge: "photos/tamsui-hero.webp",
    credit: {
      author: "susan curry",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ATamsui%20%E6%B7%A1%E6%B0%B4%E8%80%81%E8%A1%97%20-%20panoramio%20(36).jpg",
    },
  },
  {
    poiId: "yehliu",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "野柳地質公園蕈狀岩區的高處全景，黃色岩層上散布數十顆蕈狀岩、遊客與木棧道，後方是海岸與野柳岬防波堤。",
    status: "done",
    src: "photos/yehliu-card.webp",
    srcLarge: "photos/yehliu-hero.webp",
    credit: {
      author: "Ding Kezhong",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ADSC09559%E9%87%8E%E6%9F%B3%E6%99%AF%E8%A7%82%E4%B8%80%E8%A7%92.jpg",
    },
  },
  {
    poiId: "shifen",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "十分老街的平溪線鐵軌上，一對遊客攤開橘色天燈準備施放，鐵軌兩側是老街店家與圍觀人群。",
    status: "done",
    src: "photos/shifen-card.webp",
    srcLarge: "photos/shifen-hero.webp",
    credit: {
      author: "Chainwit.",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ANew%20Taipei%20-%20Shifen%20Old%20Street%20%E5%8D%81%E5%88%86%E8%80%81%E8%A1%97%20(2025)%20-%20IMG%2006.jpg",
    },
  },
  {
    poiId: "fort-domingo",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "紅毛城朱紅色方形主堡與屋頂旗桿上的國旗，右側接英國領事官邸紅磚拱廊，牆下掛著九面歷代管理國旗幟，遊客沿石階上行。",
    status: "done",
    src: "photos/fort-domingo-card.webp",
    srcLarge: "photos/fort-domingo-hero.webp",
    credit: {
      author: "Adam Jones",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3AFort%20Santo%20Domingo%20with%20ROC%20national%20flag%2020190518.jpg",
    },
  },
  {
    poiId: "shenji",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "審計新村兩層樓日式宿舍改造的文創聚落，紅瓦屋頂、掛在牆上的自行車、三角旗與白色market傘下的市集攤位與人潮。",
    status: "done",
    src: "photos/shenji-card.webp",
    srcLarge: "photos/shenji-hero.webp",
    credit: {
      author: "Fcuk1203",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A%E5%AF%A9%E8%A8%88%E6%96%B0%E6%9D%91%E6%96%87%E5%89%B5%E8%81%9A%E8%90%BD.jpg",
    },
  },
  {
    poiId: "gaomei",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "高美濕地的弧形木棧道在夕陽下延伸入潮間帶，棧道上遊客剪影，天空整片橘紅雲彩並倒映在泥灘水面。",
    status: "done",
    src: "photos/gaomei-card.webp",
    srcLarge: "photos/gaomei-hero.webp",
    credit: {
      author: "潘麗峰",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3AGaomei%20Wetland%20sunset%20DSC%205441-2.jpg",
    },
  },
  {
    poiId: "rainbow-village",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "彩虹眷村一棟畫滿彩繪的老平房山牆，藍底與紅底上寫著「知足」「保庇」「忠義肝膽」，貓、鴨與人物圖案，屋簷下掛彩繪燈籠，藍天白雲。",
    status: "done",
    src: "photos/rainbow-village-card.webp",
    srcLarge: "photos/rainbow-village-hero.webp",
    credit: {
      author: "allanlau2000",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File%3ARainbow%20village%20Taichung.jpg",
    },
  },
  {
    poiId: "fengjia",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "逢甲夜市入口的「逢甲國際觀光夜市 Feng Chia Night Market」燈飾拱門，兩側整排霓虹招牌，夜間街道擠滿人潮。",
    status: "done",
    src: "photos/fengjia-card.webp",
    srcLarge: "photos/fengjia-hero.webp",
    credit: {
      author: "Chensiyuan",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A1%20fengjia%20night%20market%202019.jpg",
    },
  },
  {
    poiId: "tainan-confucius",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "大成殿正面全景，重簷歇山頂與屋脊青龍剪黏完整入鏡，前方紅色欄杆與磚砌庭院，藍天白雲。",
    status: "done",
    src: "photos/tainan-confucius-card.webp",
    srcLarge: "photos/tainan-confucius-hero.webp",
    credit: {
      author: "Felix Filnkoessl",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ATainan%20Confucius%20Temple%20in%20the%20afternoon%20on%208th%20August%202019.jpg",
    },
  },
  {
    poiId: "fuzhong",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "泮宮石坊整座石牌坊，穿過拱門可見府中街石板路兩側店家與遮陽棚。",
    status: "done",
    src: "photos/fuzhong-card.webp",
    srcLarge: "photos/fuzhong-hero.webp",
    credit: {
      author: "Chainwit.",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3AP%C3%A0n%20G%C5%8Dng%20Sh%C3%AD%20F%C4%81ng%20Tainan%20%E6%B3%AE%E5%AE%AE%E7%9F%B3%E5%9D%8A%20(2026)%20-%20IMG%2001.jpg",
    },
  },
  {
    poiId: "guohua",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "國華街街景，左側連棟騎樓小吃攤與招牌、右側水果攤與紅色矮凳，路面往前延伸。",
    status: "done",
    src: "photos/guohua-card.webp",
    srcLarge: "photos/guohua-hero.webp",
    credit: {
      author: "Andrzej Otrębski",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ATainan%20Guohua%20St%201.jpg",
    },
  },
  {
    poiId: "hayashi",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "林百貨白天外觀全景，轉角圓弧塔樓、圓窗與頂樓旗桿完整入鏡，路口斑馬線與車流。",
    status: "done",
    src: "photos/hayashi-card.webp",
    srcLarge: "photos/hayashi-hero.webp",
    credit: {
      author: "WEI, WAN-CHEN（魏琬臻）",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A%E5%8E%9F%E6%9E%97%E7%99%BE%E8%B2%A8%E5%BA%97-1.jpg",
    },
  },
  {
    poiId: "anping-tree",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "安平樹屋的榕樹氣根像瀑布一樣覆蓋磚牆與門洞，遊客正從門口進出。",
    status: "done",
    src: "photos/anping-tree-card.webp",
    srcLarge: "photos/anping-tree-hero.webp",
    credit: {
      author: "Sun Taro",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A2015-05-01%20Anping%20Tree%20House.jpg",
    },
  },
  {
    poiId: "chimei",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "奇美博物館主館正面，圓頂與希臘式列柱完整入鏡，前方大草坪與遊客。",
    status: "done",
    src: "photos/chimei-card.webp",
    srcLarge: "photos/chimei-hero.webp",
    credit: {
      author: "lienyuan lee",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A%E5%A5%87%E7%BE%8E%E5%8D%9A%E7%89%A9%E9%A4%A8%20Qimei%20Museum%20-%20panoramio.jpg",
    },
  },
  {
    poiId: "tainan-art",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "臺南市美術館 2 館白色量體與碎形金屬屋頂全景，入口與斜立展覽旗幟入鏡。",
    status: "done",
    src: "photos/tainan-art-card.webp",
    srcLarge: "photos/tainan-art-hero.webp",
    credit: {
      author: "Adece033090",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A%E8%87%BA%E5%8D%97%E5%B8%82%E7%BE%8E%E8%A1%93%E9%A4%A82%E9%A4%A8%E5%BB%BA%E7%AF%89.jpg",
    },
  },
  {
    poiId: "blueprint",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "藍晒圖文創園區入口的白線鋼構屋架，後方藍色打光牆面浮出白色房間線稿，左側老榕樹被藍光打亮。",
    status: "done",
    src: "photos/blueprint-card.webp",
    srcLarge: "photos/blueprint-hero.webp",
    credit: {
      author: "YU, CHIA-LII",
      licence: "Public domain",
      licenceUrl: "https://commons.wikimedia.org/wiki/Template:PD-self",
      source:
        "https://commons.wikimedia.org/wiki/File%3AFrontalansicht.JPG",
    },
  },
  {
    poiId: "cijin",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "旗津海水浴場的黑沙灘全景，沙灘上人群與遮陽傘、右側浪花，遠處是高雄港天際線。",
    status: "done",
    src: "photos/cijin-card.webp",
    srcLarge: "photos/cijin-hero.webp",
    credit: {
      author: "ironypoisoning",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ACijin%20Beach%2020150725.jpg",
    },
  },
  {
    poiId: "lotus-pond",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "蓮池潭龍虎塔的兩座七層寶塔，前景是潭面荷葉與拱橋，魚鱗狀藍天。",
    status: "done",
    src: "photos/lotus-pond-card.webp",
    srcLarge: "photos/lotus-pond-hero.webp",
    credit: {
      author: "CEphoto, Uwe Aranas",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3AKaohsiung%20Taiwan%20Dragon-and-Tiger-Pagodas-01.jpg",
    },
  },
  {
    poiId: "weiwuying",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "衛武營戶外劇場：白色曲面量體與覆草屋頂、階梯看台，藍天。",
    status: "done",
    src: "photos/weiwuying-card.webp",
    srcLarge: "photos/weiwuying-hero.webp",
    credit: {
      author: "yunlin2003",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A%E6%88%B6%E5%A4%96%E5%8A%87%E5%A0%B4%20Outdoor%20Theater%20(46812104541).jpg",
    },
  },
  {
    poiId: "liuhe",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "六合夜市入夜後的霓虹街廓，兩側招牌（六合觀光夜市、九福 HOTEL）與滿街人潮。",
    status: "done",
    src: "photos/liuhe-card.webp",
    srcLarge: "photos/liuhe-hero.webp",
    credit: {
      author: "Zairon",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3AKaohsiung%20Liuhe%20Night%20Street%20Market%204.jpg",
    },
  },
  {
    poiId: "jiaoxi",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "礁溪湯圍溝溫泉公園的木棧道與溫泉水道，遊客沿池邊站，背後是礁溪的山稜與黃昏天色。",
    status: "done",
    src: "photos/jiaoxi-card.webp",
    srcLarge: "photos/jiaoxi-hero.webp",
    credit: {
      author: "Yu tptw",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A%E6%B9%AF%E5%9C%8D%E6%BA%9D%E6%99%AF%E8%A7%80%E6%B1%A0.jpg",
    },
  },
  {
    poiId: "luodong-night",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "羅東夜市傍晚的攤販街，兩側亮起的招牌與棚架、街中人潮。",
    status: "done",
    src: "photos/luodong-night-card.webp",
    srcLarge: "photos/luodong-night-hero.webp",
    credit: {
      author: "tomscoffin",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A2014-01-29%20Luodong%20Night%20Market%2001.jpg",
    },
  },
  {
    poiId: "wufengchi",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "五峰旗瀑布主瀑：高崖上兩段落差的白色水流，兩側是長滿蕨類與苔的岩壁，底下青苔巨石。",
    status: "done",
    src: "photos/wufengchi-card.webp",
    srcLarge: "photos/wufengchi-hero.webp",
    credit: {
      author: "Wl02460852",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File%3AYilan%20Wufengqi%20Waterfall-%E5%AE%9C%E8%98%AD-%E4%BA%94%E5%B3%B0%E6%97%97%E7%80%91%E5%B8%83.jpg",
    },
  },
  {
    poiId: "sanxiantai",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "跨海八拱橋整條橫過畫面，橋上有遊客，左側是三仙台島的三塊礁岩，前景翻白的湧浪打上礁岩海岸，白天藍天多雲。",
    status: "done",
    src: "photos/sanxiantai-card.webp",
    srcLarge: "photos/sanxiantai-hero.webp",
    credit: {
      author: "CEphoto, Uwe Aranas",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3ATaitung-County%20Taiwan%20Sansiantai-Bridge-01.jpg",
    },
  },
  {
    poiId: "brown-blvd",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "站在路面中央拍的伯朗大道：筆直柏油路帶著黃色分向線直伸到地平線，兩側整片無電線桿的稻田，正前方是中央山脈，深藍天。",
    status: "done",
    src: "photos/brown-blvd-card.webp",
    srcLarge: "photos/brown-blvd-hero.webp",
    credit: {
      author: "lienyuan lee",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File%3A%E4%BC%AF%E6%9C%97%E5%A4%A7%E9%81%93%20Mr%20Brown%20Coffee%20Avenue%20-%20panoramio.jpg",
    },
  },
  {
    poiId: "taitung-forest",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    prompt: "台東森林公園的琵琶湖，無風湖面把木麻黃防風林與藍天白雲整片倒映出來，右後方看得到沿湖的木棧橋與步道。",
    status: "done",
    src: "photos/taitung-forest-card.webp",
    srcLarge: "photos/taitung-forest-hero.webp",
    credit: {
      author: "Moran Tsai",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File%3ASky%20above%20Pipa%20Lake.jpg",
    },
  },

  /* ------------------------------------------- 新店・景美（地圖首頁的七個點）

     Fetched from Wikimedia Commons by scripts/fetch-attraction-photos.mjs and
     committed, so the build never touches the network. Every one is a real
     photograph of that exact place under a free licence, and no file is used
     twice — the credit below is what `PhotoCredit` prints under the image,
     which on CC BY and CC BY-SA is a licence term rather than a courtesy. */
  {
    poiId: "yulon-city",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1600,
    prompt:
      "裕隆城外觀全景，看得出是一整棟商場而不是街景。",
    status: "done",
    src: "photos/yulon-city-card.webp",
    srcLarge: "photos/yulon-city-hero.webp",
    credit: {
      author: "Foxy1219",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:%E6%96%B0%E5%BA%97%20%E8%A3%95%E9%9A%86%E5%9F%8E%202023-11-02%20(2).jpg",
    },
  },
  {
    poiId: "jingmei-park",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1600,
    prompt:
      "仁愛樓看守所外部，牆上的字與上方的刺絲網要入鏡。",
    status: "done",
    src: "photos/jingmei-park-card.webp",
    srcLarge: "photos/jingmei-park-hero.webp",
    credit: {
      author: "人人生來平等",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:%E6%99%AF%E7%BE%8E%E4%BA%BA%E6%AC%8A%E6%96%87%E5%8C%96%E5%9C%92%E5%8D%80%E8%AD%A6%E5%82%99%E7%B8%BD%E5%8F%B8%E4%BB%A4%E9%83%A8%E4%BB%81%E6%84%9B%E6%A8%93%E7%9C%8B%E5%AE%88%E6%89%80%E5%A4%96%E9%83%A8.jpg",
    },
  },
  {
    poiId: "bitan",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1600,
    prompt:
      "碧潭水面與兩岸，天鵝船入鏡，不要只拍吊橋。",
    status: "done",
    src: "photos/bitan-card.webp",
    srcLarge: "photos/bitan-hero.webp",
    credit: {
      author: "Monyuan",
      licence: "CC0 1.0",
      licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Bitan%20Scenic%20Area.jpg",
    },
  },
  {
    poiId: "bitan-bridge",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1600,
    prompt:
      "碧潭吊橋側面全景，主纜錨進岩壁的那一端要看得到。",
    status: "done",
    src: "photos/bitan-bridge-card.webp",
    srcLarge: "photos/bitan-bridge-hero.webp",
    credit: {
      author: "王彥翔",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File:%E6%96%B0%E5%BA%97%20%E7%A2%A7%E6%BD%AD%E5%90%8A%E6%A9%8B.JPG",
    },
  },
  {
    poiId: "hemeishan",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1600,
    prompt:
      "和美山頂往北看新店市區與新店溪的彎，天氣好時帶到台北一〇一。",
    status: "done",
    src: "photos/hemeishan-card.webp",
    srcLarge: "photos/hemeishan-hero.webp",
    credit: {
      author: "Anas1712",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:View%20of%20Xindian%20skyline%20and%20Taipei%20101%20from%20Hemeishan%20top%20near%20Bitan%2020230522%20130327.jpg",
    },
  },
  {
    poiId: "xindian-riverside",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1600,
    prompt:
      "新店溪右岸自行車道，河堤與河面同時入鏡。",
    status: "done",
    src: "photos/xindian-riverside-card.webp",
    srcLarge: "photos/xindian-riverside-hero.webp",
    credit: {
      author: "C.L. Kao (eddie5150)",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File:%E5%AE%89%E5%9D%91%E6%A9%8B%EF%BC%8C%E6%96%B0%E5%BA%97%E6%BA%AA%E5%B7%A6%E5%B2%B8%E6%B2%B3%E6%BF%B1%E8%87%AA%E8%A1%8C%E8%BB%8A%E9%81%93%E3%80%82%20-%20panoramio.jpg",
    },
  },
  {
    poiId: "jingmei-market",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1600,
    prompt:
      "景美夜市街景，攤位沿街排開，晚上的燈色。",
    status: "done",
    src: "photos/jingmei-market-card.webp",
    srcLarge: "photos/jingmei-market-hero.webp",
    credit: {
      author: "Alfred Twu",
      licence: "CC0 1.0",
      licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Jingmei-night-market.jpg",
    },
  },
  {
    poiId: "nakamise",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "仲見世通。A bustling crowd in Nakamise Street, leading to Senso-ji Temple in Tokyo, Japan.",
    status: "done",
    src: "photos/nakamise-card.webp",
    srcLarge: "photos/nakamise-hero.webp",
    credit: {
      author: "Satoshi Hirayama",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/crowd-walking-in-city-13598678/",
      via: "Pexels",
    },
  },
  {
    poiId: "skytree",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "東京晴空塔。Aerial view of Tokyo skyline, featuring the iconic Tokyo Skytree under a clear blue sky.",
    status: "done",
    src: "photos/skytree-card.webp",
    srcLarge: "photos/skytree-hero.webp",
    credit: {
      author: "Rin Gakusho",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/cityscape-of-tokyo-in-japan-20378132/",
      via: "Pexels",
    },
  },
  {
    poiId: "asakusa-dinner",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 這個 POI 是一類餐食而不是一家店，所以拍的是那道菜。 */
    prompt: "淺草 燒肉。Close-up of a Japanese yakiniku meal with grilled meat and various side dishes, perfect for a food-themed stock photo.",
    status: "done",
    src: "photos/asakusa-dinner-card.webp",
    srcLarge: "photos/asakusa-dinner-hero.webp",
    credit: {
      author: "Kris Li",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/japanese-yakiniku-with-grilled-meat-and-side-dishes-31325739/",
      via: "Pexels",
    },
  },
  {
    poiId: "harajuku",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "原宿 竹下通。Bustling nightlife on Takeshita Street, Tokyo, showcasing vibrant neon signs and a lively crowd.",
    status: "done",
    src: "photos/harajuku-card.webp",
    srcLarge: "photos/harajuku-hero.webp",
    credit: {
      author: "Colin S.",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/takeshitadori-2-27945361/",
      via: "Pexels",
    },
  },
  {
    poiId: "shibuya",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "澀谷十字路口。Experience the vibrant energy of Shibuya Crossing in Tokyo at night, with bustling crowds and colorful neon lights.",
    status: "done",
    src: "photos/shibuya-card.webp",
    srcLarge: "photos/shibuya-hero.webp",
    credit: {
      author: "Margo Evardson",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/vibrant-nightlife-at-shibuya-crossing-tokyo-35827257/",
      via: "Pexels",
    },
  },
  {
    poiId: "shibuya-dinner",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 這個 POI 是一類餐食而不是一家店，所以拍的是那道菜。 */
    prompt: "澀谷 居酒屋。Cozy Tokyo izakaya with traditional lanterns and a customer enjoying a meal.",
    status: "done",
    src: "photos/shibuya-dinner-card.webp",
    srcLarge: "photos/shibuya-dinner-hero.webp",
    credit: {
      author: "Iban Lopez Luna",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/authentic-tokyo-izakaya-scene-with-lanterns-37919989/",
      via: "Pexels",
    },
  },
  {
    poiId: "disney",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "東京迪士尼樂園。Statue of Walt Disney and Mickey Mouse in front of Cinderella Castle, Tokyo Disneyland.",
    status: "done",
    src: "photos/disney-card.webp",
    srcLarge: "photos/disney-hero.webp",
    credit: {
      author: "Onai Leonardo",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/disneyland-tokyo-mickey-and-castle-view-35644024/",
      via: "Pexels",
    },
  },
  {
    poiId: "tsukiji",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "築地場外市場。A vibrant scene of vendors and shoppers at Tsukiji fish market in Tokyo during nighttime.",
    status: "done",
    src: "photos/tsukiji-card.webp",
    srcLarge: "photos/tsukiji-hero.webp",
    credit: {
      author: "AXP Photography",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/people-at-tsukiji-market-at-night-tokyo-japan-18848579/",
      via: "Pexels",
    },
  },
  {
    poiId: "ginza",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "銀座。A bustling evening view of the famous Ginza district in Tokyo, showcasing vibrant city life and architecture.",
    status: "done",
    src: "photos/ginza-card.webp",
    srcLarge: "photos/ginza-hero.webp",
    credit: {
      author: "Fernando B M",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/evening-street-view-of-ginza-tokyo-s-shopping-district-33901684/",
      via: "Pexels",
    },
  },
  {
    poiId: "kagari",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 這個 POI 是一類餐食而不是一家店，所以拍的是那道菜。 */
    prompt: "銀座 篝 拉麵。Close-up of authentic ramen noodles with boiled egg and chopsticks. Perfect for food enthusiasts.",
    status: "done",
    src: "photos/kagari-card.webp",
    srcLarge: "photos/kagari-hero.webp",
    credit: {
      author: "Luis C. Tavera",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/fingers-holding-food-in-chopsticks-16671603/",
      via: "Pexels",
    },
  },
  {
    poiId: "shinjuku",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "新宿。Night scene of Tokyo with illuminated skyscrapers and bustling street life, showcasing vibrant city energy.",
    status: "done",
    src: "photos/shinjuku-card.webp",
    srcLarge: "photos/shinjuku-hero.webp",
    credit: {
      author: "Julias  Torten und Törtchen",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/vibrant-neon-cityscape-of-tokyo-at-night-30933060/",
      via: "Pexels",
    },
  },
  {
    poiId: "ueno",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "上野公園。A serene view of Bentendo Temple in Tokyo, with lush greenery and a tranquil pond in the foreground.",
    status: "done",
    src: "photos/ueno-card.webp",
    srcLarge: "photos/ueno-hero.webp",
    credit: {
      author: "Iban Lopez Luna",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/scenic-view-of-bentendo-temple-in-ueno-park-37416701/",
      via: "Pexels",
    },
  },
  {
    poiId: "tnm",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "東京國立博物館。A family walks through Ueno Park in front of the Tokyo National Museum.",
    status: "done",
    src: "photos/tnm-card.webp",
    srcLarge: "photos/tnm-hero.webp",
    credit: {
      author: "Mauricio Ortiz",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/a-woman-and-a-child-are-walking-in-a-park-27595761/",
      via: "Pexels",
    },
  },
  {
    poiId: "ameyoko",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "阿美橫町。Vibrant street market scene in Japan with colorful signage and busy atmosphere.",
    status: "done",
    src: "photos/ameyoko-card.webp",
    srcLarge: "photos/ameyoko-hero.webp",
    credit: {
      author: "AXP Photography",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/an-asian-shopping-promenade-18848544/",
      via: "Pexels",
    },
  },
  {
    poiId: "teamlab",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "teamLab Planets。Two women with backpacks viewing vibrant digital art in a museum setting.",
    status: "done",
    src: "photos/teamlab-card.webp",
    srcLarge: "photos/teamlab-hero.webp",
    credit: {
      author: "Ayşin S.",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/back-view-of-women-facing-a-wall-art-12353408/",
      via: "Pexels",
    },
  },
  {
    poiId: "dotonbori",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "道頓堀。Nighttime view of Dotonbori Canal in Osaka, Japan, with bustling crowds and neon lights.",
    status: "done",
    src: "photos/dotonbori-card.webp",
    srcLarge: "photos/dotonbori-hero.webp",
    credit: {
      author: "Tamjeed A",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/vibrant-nightlife-at-dotonbori-canal-osaka-31184555/",
      via: "Pexels",
    },
  },
  {
    poiId: "osaka-castle",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "大阪城。Stunning view of Osaka Castle showcasing its traditional Japanese pagoda-style architecture.",
    status: "done",
    src: "photos/osaka-castle-card.webp",
    srcLarge: "photos/osaka-castle-hero.webp",
    credit: {
      author: "Dmitry Romanoff",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/traditional-pagoda-of-asian-temple-21821256/",
      via: "Pexels",
    },
  },
  {
    poiId: "usj",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "日本環球影城。Stunning view of the Hogwarts Castle replica at Universal Studios Japan in Osaka.",
    status: "done",
    src: "photos/usj-card.webp",
    srcLarge: "photos/usj-hero.webp",
    credit: {
      author: "Jugdeep Gill",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/hogwarts-castle-at-universal-studios-japan-31288143/",
      via: "Pexels",
    },
  },
  {
    poiId: "fushimi",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "伏見稻荷大社。Explore the iconic red torii gates of Fushimi Inari Shrine in Kyoto, Japan, featuring traditional architecture.",
    status: "done",
    src: "photos/fushimi-card.webp",
    srcLarge: "photos/fushimi-hero.webp",
    credit: {
      author: "G N",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/vibrant-torii-gates-pathway-in-fushimi-inari-kyoto-29537651/",
      via: "Pexels",
    },
  },
  {
    poiId: "kiyomizu",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "清水寺。Kiyomizu-dera Temple in Kyoto during winter, showcasing traditional Japanese architecture with a misty backdrop.",
    status: "done",
    src: "photos/kiyomizu-card.webp",
    srcLarge: "photos/kiyomizu-hero.webp",
    credit: {
      author: "Irina Senti",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/scenic-view-of-kiyomizu-dera-temple-in-kyoto-36717832/",
      via: "Pexels",
    },
  },
  {
    poiId: "arashiyama",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "嵐山竹林。Explore the tranquil bamboo grove entry in Kyoto, Japan, perfect for a nature retreat.",
    status: "done",
    src: "photos/arashiyama-card.webp",
    srcLarge: "photos/arashiyama-hero.webp",
    credit: {
      author: "Huu Huynh",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/entrance-to-the-park-with-bamboo-trees-in-kyoto-japan-16761540/",
      via: "Pexels",
    },
  },
  {
    poiId: "gyeongbok",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "景福宮。Explore the ornate architecture of Gyeongbokgung Palace in Seoul, showcasing traditional Korean design elements.",
    status: "done",
    src: "photos/gyeongbok-card.webp",
    srcLarge: "photos/gyeongbok-hero.webp",
    credit: {
      author: "Saksham Vikram",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/historic-gyeongbokgung-palace-entrance-in-seoul-33019230/",
      via: "Pexels",
    },
  },
  {
    poiId: "myeongdong",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "明洞。A bustling night scene in Myeongdong, Seoul, showcasing vibrant signs and street activity.",
    status: "done",
    src: "photos/myeongdong-card.webp",
    srcLarge: "photos/myeongdong-hero.webp",
    credit: {
      author: "Saksham Vikram",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/vibrant-nightlife-in-seoul-s-myeongdong-district-33019190/",
      via: "Pexels",
    },
  },
  {
    poiId: "bukchon",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫裡真的有這個地方的照片。 */
    prompt: "北村韓屋村。Explore the vibrant atmosphere of Bukchon Hanok Village in Seoul as tourists stroll past traditional Korean architecture.",
    status: "done",
    src: "photos/bukchon-card.webp",
    srcLarge: "photos/bukchon-hero.webp",
    credit: {
      author: "Line Knipst",
      licence: "Pexels License",
      licenceUrl: "https://www.pexels.com/license/",
      source: "https://www.pexels.com/photo/crowd-of-tourists-on-the-walkway-in-bukchon-hanok-village-20325769/",
      via: "Pexels",
    },
  },
  {
    poiId: "stone-museum",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫沒有，Commons 有。 */
    prompt: "花蓮縣石雕博物館。Roland Mayer Skulptur „Baum des Lebens“ (生命之樹) Int. Stone Sculpture Art Season, Hualien/Taiwan 2007, Maße: 27*25*60 Material: Granit",
    status: "done",
    src: "photos/stone-museum-card.webp",
    srcLarge: "photos/stone-museum-hero.webp",
    credit: {
      author: "Flodur1209",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Roland_Mayer_TREE_OF_LIFE_Hualien_Taiwan_2007.jpg",
      via: "Wikimedia Commons",
    },
  },
  {
    poiId: "tainan-beef",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫沒有，Commons 有。 */
    prompt: "府城牛肉湯。16-台南早餐國華街阿村牛肉湯，台南真好",
    status: "done",
    src: "photos/tainan-beef-card.webp",
    srcLarge: "photos/tainan-beef-hero.webp",
    credit: {
      author: "Sinchen.Lin",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
      source: "https://commons.wikimedia.org/wiki/File:16-%E5%8F%B0%E5%8D%97%E6%97%A9%E9%A4%90%E5%9C%8B%E8%8F%AF%E8%A1%97%E9%98%BF%E6%9D%91%E7%89%9B%E8%82%89%E6%B9%AF%EF%BC%8C%E5%8F%B0%E5%8D%97%E7%9C%9F%E5%A5%BD_(29484622036).jpg",
      via: "Wikimedia Commons",
    },
  },
  {
    poiId: "shuishe-pier",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫沒有，Commons 有。 */
    prompt: "水社碼頭。Sun Moon Lake Shuishe Pier is the transshipment hub with a spacious parking lot. You can board the yacht to go on a lake tour from here.",
    status: "done",
    src: "photos/shuishe-pier-card.webp",
    srcLarge: "photos/shuishe-pier-hero.webp",
    credit: {
      author: "LowensteinYang",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:%E6%97%A5%E6%9C%88%E6%BD%AD%E6%B0%B4%E7%A4%BE%E7%A2%BC%E9%A0%AD_View_of_Shuishe_Pier_from_Sun_Moon_Lake_20151213.jpg",
      via: "Wikimedia Commons",
    },
  },
  {
    poiId: "wenwu-temple",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫沒有，Commons 有。 */
    prompt: "文武廟。Wenwu Temple, Sun &amp; Moon Lake, Taiwan - 文武廟, 日月潭, 台湾",
    status: "done",
    src: "photos/wenwu-temple-card.webp",
    srcLarge: "photos/wenwu-temple-hero.webp",
    credit: {
      author: "Romain Pontida",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source: "https://commons.wikimedia.org/wiki/File:Wenwu_Temple,_Sun_%26_Moon_Lake,_Taiwan_-_%E6%96%87%E6%AD%A6%E5%BB%9F,_%E6%97%A5%E6%9C%88%E6%BD%AD,_%E5%8F%B0%E6%B9%BE_(11353543594).jpg",
      via: "Wikimedia Commons",
    },
  },
  {
    poiId: "ita-thao",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫沒有，Commons 有。 */
    prompt: "伊達邵。Our first stop after Taichung is three days at Sun Moon Lake. We visited two years ago, but this is a longer, quieter and more satisfying trip to hike, walk, an",
    status: "done",
    src: "photos/ita-thao-card.webp",
    srcLarge: "photos/ita-thao-hero.webp",
    credit: {
      author: "ironypoisoning",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source: "https://commons.wikimedia.org/wiki/File:View_of_Ita_Thao_from_a_ferry_on_Sun_Moon_Lake_20150719.jpg",
      via: "Wikimedia Commons",
    },
  },
  {
    poiId: "xiangshan-centre",
    kind: "photo",
    aspectRatio: "4:3",
    minLongEdge: 1400,
    /* 圖庫沒有，Commons 有。 */
    prompt: "向山遊客中心。向山遊客中心  Xiangshan Visitor Center",
    status: "done",
    src: "photos/xiangshan-centre-card.webp",
    srcLarge: "photos/xiangshan-centre-hero.webp",
    credit: {
      author: "lienyuan lee",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0",
      source: "https://commons.wikimedia.org/wiki/File:%E5%90%91%E5%B1%B1%E9%81%8A%E5%AE%A2%E4%B8%AD%E5%BF%83_Xiangshan_Visitor_Center_-_panoramio_(1).jpg",
      via: "Wikimedia Commons",
    },
  },
];

export const slotsFor = (poiId: string) => IMAGE_SLOTS.filter((s) => s.poiId === poiId);

export const photoFor = (poi: Poi): ImageSlot | undefined =>
  IMAGE_SLOTS.find((s) => s.poiId === poi.id && s.kind === "photo" && s.status === "done");


/** How much of the manifest is actually shot. Shown on the business demo. */
export const imageProgress = () => ({
  total: IMAGE_SLOTS.length,
  done: IMAGE_SLOTS.filter((s) => s.status === "done").length,
});
