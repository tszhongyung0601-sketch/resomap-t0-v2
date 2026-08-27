/**
 * 附近在辦什麼 — and every one of them is invented.
 *
 * This is the first data in the app that is fiction all the way down, and it is
 * worth being exact about why that is different from everything around it.
 *
 * The 68 merchants are real shops. The 22 hire counters are real companies at
 * real addresses. The affiliate offers are made-up prices attached to real
 * platforms. In every one of those cases the demo label is protecting a *number*
 * — a price, a rating, a distance — while the thing itself exists and could be
 * visited. Here the thing itself does not exist. 「碧潭河岸夏夜市集」 is not
 * happening, has never happened, and nobody is organising it.
 *
 * So the disclosure is not a small grey tag at the top of a section. It is a
 * sentence, in the reading order, on the rail and again on the detail page,
 * saying the events are made up. A traveller who books a train to 壽豐 because
 * of this screen has been actively misled, and no amount of 「Demo 資料」 in
 * 11px absolves that.
 *
 * What *is* real, deliberately:
 *
 *  - **The places.** Real districts, real coordinates. Without them the rail
 *    cannot sort by distance, and distance is the entire feature — 「附近」 is
 *    the promise, and it has to be measured against somewhere.
 *  - **The shape of the record.** Dates that run, opening times, a price or the
 *    absence of one, indoor or outdoor. This is what a real feed of this kind
 *    would carry, so the screens built on it would not have to change when one
 *    arrives.
 *
 * Names were chosen to *not* collide with real Taiwanese festivals. 平溪天燈節,
 * 鹽水蜂炮, 大甲媽祖遶境, 宜蘭童玩節 and the rest are real events with real
 * organisers, and hanging invented dates and prices off one of those names
 * would be worse than inventing a name outright: it would put false information
 * about a real thing into somebody's hands.
 *
 * Dates carry no year. `[8, 15]` is the fifteenth of August, and which August it
 * means is decided when it is read — see `lib/eventDate.ts`. A demo whose
 * festivals all expired last December is a demo that has to be re-dated by hand
 * every year, and the year would be the first thing anybody forgot.
 */

/** Month and day, no year. Resolved against today by `lib/eventDate.ts`. */
export type MonthDay = [month: number, day: number];

export type EventKind = "market" | "music" | "light" | "sport" | "temple" | "festival";

export const EVENT_KINDS: Record<EventKind, { label: string; emoji: string }> = {
  market: { label: "市集", emoji: "🧺" },
  music: { label: "音樂", emoji: "🎶" },
  light: { label: "燈會", emoji: "🏮" },
  sport: { label: "運動賽事", emoji: "🏇" },
  temple: { label: "廟會", emoji: "🎏" },
  festival: { label: "節慶", emoji: "🎊" },
};

/**
 * The one line this whole file has to keep saying.
 *
 * Exported rather than typed out on each screen, so it cannot drift into a
 * softer wording on the surface somebody actually reads.
 */
export const EVENT_DISCLOSURE = "這些活動全部是為了 Demo 編出來的，不是真實活動。";

export interface LocalEvent {
  id: string;
  name: string;
  destId: string;
  /** District or township. Real, so the second line of a card means something. */
  area: string;
  /** Real coordinates. The rail sorts on these. */
  lat: number;
  lng: number;
  kind: EventKind;
  /** First and last day it runs. Inclusive both ends. */
  from: MonthDay;
  to: MonthDay;
  /** When the gates open, on the days it runs. */
  at: string;
  /** Under a roof — which is the only reason the weather does not decide. */
  indoor?: boolean;
  /** One line on a card, before anybody opens it. */
  hook: string;
  about: string;
  /** What it costs to get in. Absent means free, and the card says 免費. */
  ticket?: string;
  /** Minutes to allow, for when it goes on an itinerary. */
  stayMin: number;
  tint: string;
}

export const EVENTS: LocalEvent[] = [
  /* ------------------------------------------------------- 新北, 新店 first.
     The demo opens standing in 新店, so the first thing the rail can show has
     to be genuinely within walking distance of it — otherwise the section
     leads with 「附近」 above something forty minutes away on the first run. */
  {
    id: "ev-bitan-market",
    name: "碧潭河岸夏夜市集",
    destId: "newtaipei",
    area: "新店區",
    lat: 24.9556,
    lng: 121.5384,
    kind: "market",
    from: [8, 8],
    to: [8, 30],
    at: "17:00",
    hook: "吊橋下擺三十攤，賣到晚上十點",
    about:
      "沿著碧潭東岸從吊橋口擺到渡船頭，攤位以新店在地的小店為主。天黑之後對岸的和美山會打燈，是這個市集唯一的佈景。",
    stayMin: 90,
    tint: "#E4EDE6",
  },
  {
    id: "ev-anken-water-lantern",
    name: "安坑水燈漂流夜",
    destId: "newtaipei",
    area: "新店區",
    lat: 24.9615,
    lng: 121.5099,
    kind: "light",
    from: [9, 5],
    to: [9, 14],
    at: "18:30",
    hook: "一千盞紙燈順著安坑溪往下漂",
    about: "傍晚在溪畔領燈、寫字、放水，十天裡每晚一次。上游放完之後可以沿岸走到下游看它們漂過來。",
    stayMin: 75,
    tint: "#E7E4F0",
  },
  {
    id: "ev-wulai-valley-song",
    name: "烏來溪谷歌謠祭",
    destId: "newtaipei",
    area: "烏來區",
    lat: 24.8637,
    lng: 121.5507,
    kind: "music",
    from: [8, 22],
    to: [8, 24],
    at: "15:00",
    hook: "在瀑布對面的河階上唱三天",
    about: "以泰雅族傳統歌謠為主軸，下午開始，日落前後是主場。舞台搭在河階地上，觀眾席就是草地，自己帶墊子。",
    ticket: "NT$ 400 起",
    stayMin: 180,
    tint: "#DCE9E4",
  },
  {
    id: "ev-bali-kite",
    name: "八里左岸風箏賽",
    destId: "newtaipei",
    area: "八里區",
    lat: 25.15,
    lng: 121.438,
    kind: "sport",
    from: [10, 11],
    to: [10, 12],
    at: "09:00",
    hook: "河口的風一年裡最穩的那兩天",
    about: "分特技與大型軟體兩組，早上九點放到下午四點。看的人多半坐在自行車道旁的堤防上。",
    stayMin: 90,
    tint: "#E1EAF2",
  },

  /* ------------------------------------------------------------------ 台北 */
  {
    id: "ev-gongguan-books",
    name: "公館舊書攤市集",
    destId: "taipei",
    area: "中正區",
    lat: 25.0143,
    lng: 121.534,
    kind: "market",
    from: [8, 16],
    to: [8, 17],
    at: "11:00",
    hook: "二十家舊書店把庫存搬到街上",
    about: "一年一次，兩天。以絕版與二手為主，下午三點之後多數攤位會再降一次價。",
    stayMin: 60,
    tint: "#EFE7DA",
  },
  {
    id: "ev-dadaocheng-riverdance",
    name: "大稻埕河岸夜舞",
    destId: "taipei",
    area: "大同區",
    lat: 25.0561,
    lng: 121.5087,
    kind: "music",
    from: [8, 29],
    to: [8, 31],
    at: "19:00",
    hook: "碼頭邊的免費社交舞會，三個晚上",
    about: "從十九點跳到二十二點半，現場樂隊，不用報名也不用舞伴。旁邊的貨櫃酒吧照常營業。",
    stayMin: 90,
    tint: "#F3E2E2",
  },
  {
    id: "ev-beitou-sulphur-walk",
    name: "北投硫谷夜行",
    destId: "taipei",
    area: "北投區",
    lat: 25.1366,
    lng: 121.5069,
    kind: "festival",
    from: [11, 1],
    to: [11, 16],
    at: "18:00",
    hook: "地熱谷周邊的夜間導覽路線",
    about: "沿著北投溪從新北投站走到地熱谷口，沿途打微光。每晚兩梯，一梯四十人，現場排隊。",
    stayMin: 70,
    tint: "#EAE6DE",
  },
  {
    id: "ev-maokong-tea-night",
    name: "貓空秋茶夜宴",
    destId: "taipei",
    area: "文山區",
    lat: 24.9683,
    lng: 121.5893,
    kind: "festival",
    from: [10, 3],
    to: [10, 5],
    at: "16:00",
    hook: "十家茶園在同一片山坡上擺桌",
    about: "傍晚開始，一票喝十家。纜車末班是二十一點，錯過就得走下山或叫車。",
    ticket: "NT$ 250",
    stayMin: 120,
    tint: "#E5EDDD",
  },

  /* ------------------------------------------------------------------ 宜蘭 */
  {
    id: "ev-dongshan-paper-lantern",
    name: "冬山河紙燈漂流夜",
    destId: "yilan",
    area: "五結鄉",
    lat: 24.6836,
    lng: 121.813,
    kind: "light",
    from: [9, 19],
    to: [9, 21],
    at: "18:00",
    hook: "親水公園那段河面整條鋪滿燈",
    about: "三個晚上，每晚放兩批。河道兩側都可以看，東岸離停車場近，西岸人少。",
    stayMin: 90,
    tint: "#E3EAF1",
  },

  /* ------------------------------------------------------------------ 花蓮
     Two of these sit inside 8/15–8/17 on purpose: that is the demo's 花蓮 trip,
     and 「日期對得上才給加行程」 is a rule nobody can see working unless at least
     one event actually lines up with an itinerary that ships. */
  {
    id: "ev-hualien-equestrian",
    name: "縱谷馬術嘉年華",
    destId: "hualien",
    area: "壽豐鄉",
    lat: 23.8664,
    lng: 121.5088,
    kind: "sport",
    from: [8, 14],
    to: [8, 17],
    at: "09:30",
    hook: "越野、障礙、繞桶，四天賽程",
    about:
      "縱谷幾家牧場合辦，上午是分齡賽，下午開放體驗騎乘。看台不收費，體驗要另外報名，現場登記。",
    ticket: "看台免費・體驗 NT$ 300",
    stayMin: 150,
    tint: "#EDE6D9",
  },
  {
    id: "ev-qixingtan-starlight",
    name: "七星潭星空音樂會",
    destId: "hualien",
    area: "新城鄉",
    lat: 24.028,
    lng: 121.6259,
    kind: "music",
    from: [8, 16],
    to: [8, 16],
    at: "19:30",
    hook: "一個晚上，弦樂四重奏，海就在後面",
    about: "只有一場。十九點半開始，兩小時。石灘上不好坐，帶椅子的人比較多。",
    stayMin: 120,
    tint: "#DFE9EF",
  },

  /* ------------------------------------------------------------------ 台東 */
  {
    id: "ev-beinan-canoe",
    name: "卑南溪獨木舟賽",
    destId: "taitung",
    area: "台東市",
    lat: 22.7639,
    lng: 121.13,
    kind: "sport",
    from: [8, 29],
    to: [8, 30],
    at: "08:00",
    hook: "從利吉惡地一路划到出海口",
    about: "分競速與休閒兩組，八點發船，中午前後陸續抵達。終點的河濱公園有補給站。",
    stayMin: 120,
    tint: "#E2EBE3",
  },

  /* ------------------------------------------------------------------ 台中 */
  {
    id: "ev-liuchuan-brass",
    name: "綠川銅管音樂節",
    destId: "taichung",
    area: "中區",
    lat: 24.1393,
    lng: 120.6839,
    kind: "music",
    from: [9, 12],
    to: [9, 14],
    at: "18:00",
    hook: "沿著水岸擺六個小舞台，一路走一路聽",
    about: "三個晚上，六個點同時演出，各三十分鐘一輪。全程免費，站著聽。",
    stayMin: 90,
    tint: "#EDE5E9",
  },
  {
    id: "ev-gaomei-windmill-market",
    name: "高美風車市集",
    destId: "taichung",
    area: "清水區",
    lat: 24.312,
    lng: 120.549,
    kind: "market",
    from: [10, 17],
    to: [10, 19],
    at: "14:00",
    hook: "退潮才開市，收攤時間跟著潮汐走",
    about: "擺在木棧道入口外側的空地，攤位以海線的小農與小店為主。日落前一小時人最多。",
    stayMin: 90,
    tint: "#E9EDE2",
  },

  /* ------------------------------------------------------------------ 台南 */
  {
    id: "ev-anping-lantern-shadow",
    name: "安平舊港燈影節",
    destId: "tainan",
    area: "安平區",
    lat: 23.001,
    lng: 120.16,
    kind: "light",
    from: [9, 26],
    to: [10, 5],
    at: "18:00",
    hook: "運河兩岸打光，水面比岸上亮",
    about: "十天，每晚十八點到二十二點。從安平古堡走到定情碼頭大約二十分鐘，沿途都是佈展區。",
    stayMin: 80,
    tint: "#F1E5D8",
  },
  {
    id: "ev-wutiaogang-night-patrol",
    name: "五條港夜巡",
    destId: "tainan",
    area: "中西區",
    lat: 22.995,
    lng: 120.1955,
    kind: "temple",
    from: [11, 7],
    to: [11, 9],
    at: "19:00",
    hook: "陣頭走老街廓，三個晚上不同路線",
    about: "從水仙宮出發，沿著五條港的舊河道範圍繞境。路線每晚不同，廟前會貼當晚的圖。",
    stayMin: 100,
    tint: "#F0E3E0",
  },

  /* ------------------------------------------------------------------ 高雄 */
  {
    id: "ev-love-river-lightboat",
    name: "愛河夜航燈船",
    destId: "kaohsiung",
    area: "前金區",
    lat: 22.627,
    lng: 120.287,
    kind: "light",
    from: [6, 13],
    to: [6, 15],
    at: "17:00",
    hook: "三十艘裝了燈的船在河上排隊繞",
    about: "從真愛碼頭往上游繞到中正橋再折返，一輪約四十分鐘。岸邊隨處可看，橋上視角最好。",
    stayMin: 60,
    tint: "#E4E8F2",
  },
];

export const BY_EVENT: Record<string, LocalEvent> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
);

/** The record, or undefined — never a throw. A rail must survive a bad id. */
export const localEvent = (id: string): LocalEvent | undefined => BY_EVENT[id];
