import type { Review } from "../types";

/**
 * Sample reviews, keyed by the merchant or provider they belong to.
 *
 * The stored `rating` and `reviewCount` on a Merchant or Provider are the full
 * history; what is in this file is the handful the screen can actually show. The
 * reviews screen says so out loud — printing four reviews under a heading that
 * claims eighty-six would be the same defect as an invented count.
 *
 * Dates are ISO so the list can sort on them. Names are display names; there is
 * no account system behind any of this.
 */
export const REVIEWS: Record<string, Review[]> = {
  /* ------------------------------------------------------------- merchants */
  "m-bangka-cake": [
    {
      id: "r-bangka-1",
      rating: 5,
      comment: "剛好碰到三點那爐出來，熱的鹹光餅跟冷掉的完全是兩種東西。",
      user: "Mei",
      date: "2026-08-02",
    },
    {
      id: "r-bangka-2",
      rating: 5,
      comment: "老闆會問你要現在吃還是帶走，然後給不一樣的包裝，很細心。",
      user: "阿德",
      date: "2026-07-19",
    },
    {
      id: "r-bangka-3",
      rating: 4,
      comment: "綠豆椪好吃，但下午四點去的時候鹹光餅已經賣完了，要早點來。",
      user: "Yuki",
      date: "2026-07-04",
    },
  ],
  "m-dihua-tea": [
    {
      id: "r-dihua-1",
      rating: 5,
      comment: "只說想喝清爽一點的，老闆就泡了三種讓我比，完全沒有推銷。",
      user: "Elena",
      date: "2026-08-11",
    },
    {
      id: "r-dihua-2",
      rating: 5,
      comment: "檜木櫃很漂亮，拍照老闆也不會擋。買了兩罐包種寄回日本。",
      user: "さとう",
      date: "2026-06-28",
    },
    {
      id: "r-dihua-3",
      rating: 4,
      comment: "價格不算便宜，但確實跟超市的不一樣。試喝這件事很加分。",
      user: "建宏",
      date: "2026-05-30",
    },
  ],
  "m-raohe-noodle": [
    {
      id: "r-raohe-1",
      rating: 5,
      comment: "排了二十分鐘，值得。焦的那面真的比較香，聽完語音才知道原因。",
      user: "Joselito",
      date: "2026-08-15",
    },
    {
      id: "r-raohe-2",
      rating: 4,
      comment: "八點半後去人少很多，但也只剩最後兩爐，要碰運氣。",
      user: "小柔",
      date: "2026-08-01",
    },
    {
      id: "r-raohe-3",
      rating: 5,
      comment: "出示 App 真的多送一顆，不用問第二次。",
      user: "Dewi",
      date: "2026-07-22",
    },
  ],
  "m-chihkan-snack": [
    {
      id: "r-chihkan-1",
      rating: 5,
      comment: "從赤崁樓出來直接過馬路就到，蝦仁飯的蝦是脆的不是粉的。",
      user: "Tom",
      date: "2026-08-09",
    },
    {
      id: "r-chihkan-2",
      rating: 4,
      comment: "位子真的很少，中午去等了十五分鐘。魚丸湯很鮮。",
      user: "怡君",
      date: "2026-07-13",
    },
  ],
  "m-qixingtan-stay": [
    {
      id: "r-qixing-1",
      rating: 5,
      comment: "面海的房間早上被浪聲叫醒，日出接送也真的有，五點就在門口等。",
      user: "Panay",
      date: "2026-08-04",
    },
    {
      id: "r-qixing-2",
      rating: 5,
      comment: "老闆會提醒不要下去水邊，還說了為什麼。住得很安心。",
      user: "中野",
      date: "2026-06-17",
    },
  ],

  /* ------------------------------------------------------------- providers */
  "p-acheng": [
    {
      id: "r-acheng-1",
      rating: 5,
      comment: "回覆很快，行程安排清楚，帶長輩也很安心。",
      user: "Mei",
      date: "2026-08-12",
    },
    {
      id: "r-acheng-2",
      rating: 5,
      comment: "早上臨時說想改去野柳，他直接重排順序，沒有加價。",
      user: "Alex",
      date: "2026-07-28",
    },
    {
      id: "r-acheng-3",
      rating: 5,
      comment: "會英文，對第一次來台灣的朋友非常友善。",
      user: "Yuki",
      date: "2026-07-05",
    },
    {
      id: "r-acheng-4",
      rating: 4,
      comment: "很熟悉在地景點，推薦的路線不會太趕。停車等待的時間有點久。",
      user: "志偉",
      date: "2026-06-11",
    },
  ],
  "p-xiaofang": [
    {
      id: "r-xiaofang-1",
      rating: 5,
      comment: "有安全座椅這件事幫了大忙，出發前還先問了小孩幾歲。",
      user: "佳玲",
      date: "2026-08-07",
    },
    {
      id: "r-xiaofang-2",
      rating: 5,
      comment: "帶爸媽去大溪，中間多停了一次休息站，很體貼。",
      user: "박세진",
      date: "2026-07-16",
    },
    {
      id: "r-xiaofang-3",
      rating: 4,
      comment: "車很新很乾淨。行程稍微趕了一點，下次會少排一個點。",
      user: "Ken",
      date: "2026-06-25",
    },
  ],
  "p-xiaomi": [
    {
      id: "r-xiaomi-1",
      rating: 5,
      comment: "青草巷那段講得太好了，自己走十次也不會知道那些事。",
      user: "Marcus",
      date: "2026-08-14",
    },
    {
      id: "r-xiaomi-2",
      rating: 5,
      comment: "兩個半小時完全沒有冷場，還帶我們吃了一攤在地人才去的。",
      user: "ゆき",
      date: "2026-07-31",
    },
    {
      id: "r-xiaomi-3",
      rating: 5,
      comment: "會依照我們走路的速度調整，長輩跟得上。",
      user: "淑芬",
      date: "2026-07-02",
    },
  ],
  "p-azhe": [
    {
      id: "r-azhe-1",
      rating: 5,
      comment: "從一本帳簿講起，比看年代表有趣一百倍。",
      user: "Elena",
      date: "2026-08-06",
    },
    {
      id: "r-azhe-2",
      rating: 5,
      comment: "走完真的知道迪化街為什麼是南北向的了。",
      user: "俊傑",
      date: "2026-06-30",
    },
  ],
  "p-tainan-guide": [
    {
      id: "r-tainan-1",
      rating: 5,
      comment: "避開整點的遊覽車這招太有用，整條神農街只有我們幾個。",
      user: "小林",
      date: "2026-08-10",
    },
    {
      id: "r-tainan-2",
      rating: 5,
      comment: "中間停下來吃的那攤是重點，自己絕對不會走進去。",
      user: "Ray",
      date: "2026-07-20",
    },
  ],
  "p-hualien-guide": [
    {
      id: "r-hualien-g-1",
      rating: 5,
      comment: "砂卡礑的植物講解很扎實，不是念解說牌。",
      user: "Sarah",
      date: "2026-08-03",
    },
    {
      id: "r-hualien-g-2",
      rating: 5,
      comment: "族語的部分聽起來很自然，小孩學了兩句記到現在。",
      user: "宗翰",
      date: "2026-07-09",
    },
  ],
  "p-hualien-car": [
    {
      id: "r-hualien-c-1",
      rating: 5,
      comment: "出發前一天就先傳了公路封閉公告給我們，行程照樣走完。",
      user: "Anna",
      date: "2026-08-08",
    },
    {
      id: "r-hualien-c-2",
      rating: 5,
      comment: "配合火車時間接送，行李也幫忙搬，很省事。",
      user: "たかし",
      date: "2026-07-12",
    },
  ],
  "p-fucheng-car": [
    {
      id: "r-fucheng-1",
      rating: 5,
      comment: "台南停車真的難，他放我們下車再去繞，省了很多時間。",
      user: "郁婷",
      date: "2026-08-05",
    },
    {
      id: "r-fucheng-2",
      rating: 4,
      comment: "行程順，但中午那段有點熱，下次會想改成傍晚出發。",
      user: "Hiroshi",
      date: "2026-06-21",
    },
  ],
};

/** Newest first. Empty when nobody has reviewed this record yet. */
export function reviewsFor(ownerId: string): Review[] {
  return [...(REVIEWS[ownerId] ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1));
}
