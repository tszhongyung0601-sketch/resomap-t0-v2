/**
 * What to ask a stock library for, per event.
 *
 * Per event rather than per kind, because a rail of eight cards where three of
 * them are the same lantern is a rail that reads as a template. The queries are
 * written from what each record actually describes — a horse show, a river of
 * paper lanterns, brass players on a street — so the picture illustrates the
 * sentence under it rather than the category above it.
 *
 * None of these is a photograph of the event. The events do not exist, so no
 * such photograph could exist; every surface that shows one marks it 示意圖, in
 * exactly the way the hire-car photographs are marked. What the picture is
 * honestly illustrating is the *kind of evening* the text describes.
 */

export const QUERIES = {
  "ev-bitan-market": ["night market stalls lanterns", "outdoor night market food stalls"],
  "ev-anken-water-lantern": ["floating paper lanterns river night", "water lanterns river"],
  "ev-wulai-valley-song": ["outdoor folk concert crowd evening", "acoustic concert outdoor stage"],
  "ev-bali-kite": ["colourful kites flying sky beach", "kite festival sky"],
  "ev-gongguan-books": ["second hand book stall outdoor", "old books market stall"],
  "ev-dadaocheng-riverdance": ["people dancing outdoors evening", "social dancing crowd night"],
  "ev-beitou-sulphur-walk": ["hot spring steam valley", "geothermal steam rocks"],
  "ev-maokong-tea-night": ["tea plantation hills terrace", "green tea field hillside"],
  "ev-dongshan-paper-lantern": ["lanterns floating water night festival", "river lanterns glowing"],
  "ev-hualien-equestrian": ["horse show jumping competition", "equestrian horse rider arena"],
  "ev-qixingtan-starlight": ["string quartet performing outdoors", "violin concert night stage"],
  "ev-beinan-canoe": ["kayak race river paddling", "canoe paddling river"],
  "ev-liuchuan-brass": ["brass band playing street", "trumpet player street performance"],
  "ev-gaomei-windmill-market": ["wind turbines coast sunset", "coastal market stalls sunset"],
  "ev-anping-lantern-shadow": ["red lanterns hanging night street", "festival lanterns glowing night"],
  "ev-wutiaogang-night-patrol": ["temple procession lanterns night", "traditional festival procession"],
  "ev-love-river-lightboat": ["decorated boats lights river night", "illuminated boat river night"],
};

/**
 * Why a candidate is unusable, or "" when it is fine.
 *
 * Every check here is a proxy — none of them can see the picture — so this is a
 * first pass, not a verdict. The last pass is a person looking at the rail.
 *
 * An empty description is rejected rather than gambled on, for the same reason
 * the vehicle fetch rejects one: a wrong picture nobody can explain is worse
 * than one fewer picture, and the fallback here is a designed poster tile.
 */
const BANNED = [
  /* Studio product shots and mock-ups: they read as advertising, and the rail
     is meant to look like places rather than like inventory. */
  "mockup",
  "isolated on",
  "white background",
  "close up of a",
  "closeup",
  /* A picture of one object at 168px is a texture, not an event. */
  "still life",
  "flat lay",
  /* Somebody's face filling the frame is a portrait, not a crowd. */
  "portrait of a",
  "selfie",
  /* Both spellings. The first run let "Close-up of a violinist" through a
     list that only knew "close up of a", and a hyphen is not a difference
     worth losing a filter to. */
  "close-up of a",
  /* One monochrome card in a rail of colour reads as a loading error. */
  "black and white",
  "monochrome",
  /* Every event in this set is outdoors, and a description that says
     otherwise contradicts the 場地 row on the page it lands on. */
  "indoor",
];

export function rejectReason(alt) {
  const a = (alt ?? "").toLowerCase().trim();
  if (!a) return "no description";
  for (const b of BANNED) if (a.includes(b)) return b;
  return "";
}
