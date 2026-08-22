/**
 * What to search Pexels for, per POI that has no photograph.
 *
 * Two kinds of entry, and the difference matters:
 *
 *   **A named place** — 澀谷十字路口, 伏見稻荷大社, 大阪城 — where a stock library
 *   genuinely holds a photograph *of that place*. The query is the landmark's
 *   English name and the result is the real thing, the same as the Wikimedia
 *   photographs everywhere else in the app.
 *
 *   **A category standing in for a place** — 淺草 燒肉, 澀谷 居酒屋 — where the POI
 *   is not a specific restaurant but a kind of meal in a district. A photograph
 *   of yakiniku is then accurate rather than approximate.
 *
 * `dish: true` marks the second kind. It changes nothing about the fetch; it is
 * there so the next person can see at a glance which photographs are of the
 * place named on the card and which are of the food it serves.
 *
 * What is deliberately absent: 阿明豬心冬粉 and 府城牛肉湯 are named Tainan shops,
 * and 花蓮縣石雕博物館 is one specific municipal museum. No stock library has
 * those, and a generic bowl of noodles under a shop's name is the same wrong as
 * a generic beach under a guide's name. They keep the generated poster, which is
 * the honest answer to "there is no photograph of this".
 */
export const POI_QUERIES = {
  /* ------------------------------------------------------------ 東京 */
  nakamise: { q: "Nakamise shopping street Asakusa Tokyo" },
  skytree: { q: "Tokyo Skytree tower" },
  "asakusa-dinner": { q: "yakiniku grilled beef japanese restaurant", dish: true },
  harajuku: { q: "Takeshita street Harajuku Tokyo" },
  shibuya: { q: "Shibuya crossing Tokyo" },
  "shibuya-dinner": { q: "izakaya japanese restaurant interior", dish: true },
  disney: { q: "Tokyo Disneyland castle" },
  tsukiji: { q: "Tsukiji fish market Tokyo" },
  ginza: { q: "Ginza Tokyo street night" },
  kagari: { q: "ramen bowl japanese noodles", dish: true },
  shinjuku: { q: "Shinjuku Tokyo neon night" },
  ueno: { q: "Ueno park Tokyo" },
  tnm: { q: "Tokyo National Museum Ueno building" },
  ameyoko: { q: "Ameyoko market Ueno Tokyo" },
  teamlab: { q: "digital art immersive light installation" },

  /* ------------------------------------------------------------ 大阪 */
  dotonbori: { q: "Dotonbori Osaka canal night" },
  "osaka-castle": { q: "Osaka castle" },
  usj: { q: "Universal Studios Japan Osaka" },

  /* ------------------------------------------------------------ 京都 */
  fushimi: { q: "Fushimi Inari torii gates Kyoto" },
  kiyomizu: { q: "Kiyomizu dera temple Kyoto" },
  arashiyama: { q: "Arashiyama bamboo grove Kyoto" },

  /* ------------------------------------------------------------ 首爾 */
  gyeongbok: { q: "Gyeongbokgung palace Seoul" },
  myeongdong: { q: "Myeongdong Seoul street" },
  bukchon: { q: "Bukchon Hanok village Seoul" },
};

/**
 * The three that keep the poster, and why — so nobody "fixes" them later by
 * dropping in a stock photograph of somebody else's noodles.
 */
export const NO_STOCK_PHOTO = {
  "tainan-beef": "府城牛肉湯是特定店家，圖庫只有泛用牛肉湯",
  shuijiao: "阿明豬心冬粉是特定店家，圖庫只有泛用米粉湯",
  "stone-museum": "花蓮縣石雕博物館是特定市立館舍，圖庫沒有",
};
