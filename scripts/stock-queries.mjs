/**
 * How to ask Pexels for forty Taiwanese drivers and guides.
 *
 * The query shape below was found by throwing away three that did not work, and
 * all three are worth keeping because each one looks like success until the
 * pictures are on screen:
 *
 *   "asian man van driver"                 → European couriers with clipboards.
 *                                             A stock library has no supply of
 *                                             Taiwanese charter drivers, so it
 *                                             answers with the nearest job it
 *                                             does have.
 *   "east asian middle aged man portrait"  → European men. Five qualifying words
 *                                             dilute the first one until the
 *                                             index stops honouring it.
 *   "korean man portrait"                  → Korean faces, but the corpus behind
 *                                             short artistic queries is editorial
 *                                             and street: hanbok, kabuki, candid
 *                                             strangers. Right faces, wrong
 *                                             register, and no model release.
 *
 * What works is short and commercial: `asian` + one age word + man/woman + one
 * garment or manner + a background. That lands on the part of the library shot
 * for advertising — plain backdrops, polo shirts, people who look like they do
 * a job — which is both the right register for a directory listing and the part
 * where a model release actually exists.
 *
 * Five words. Every extra qualifier costs a little of the first one.
 */

/** age band → the word commercial stock is actually tagged with */
const AGE = { 20: "young", 30: "young", 40: "middle aged", 50: "middle aged", 60: "elderly" };

/* Rotated so forty near-identical queries do not return the same forty photos
   in the same order, which after deduping leaves the last twenty people with
   whatever nobody else wanted. */
const LOOK = ["polo shirt", "smiling", "businessman", "casual shirt", "friendly", "portrait"];
const BG = ["white background", "plain background", "studio background", "grey background"];

export function queryFor(casting, i) {
  const look = LOOK[(casting.sex === "m" ? i : i + 2) % LOOK.length];
  return [
    "asian",
    AGE[casting.age],
    casting.sex === "m" ? "man" : "woman",
    look === "businessman" && casting.sex === "f" ? "office" : look,
    BG[i % BG.length],
  ].join(" ");
}

/**
 * The one signal that names ethnicity, used as a preference rather than a rule.
 *
 * Requiring it rejects every photograph on every page — Pexels' alt text
 * mentions it in roughly none of eighty results. But where it is present it is
 * reliable, so the picker takes a whole pass looking only at photos whose alt
 * says so, and only falls back to the rest when that pass comes up empty.
 */
export const EAST_ASIAN = /\basian\b/i;

/**
 * "A photographer pointed a camera at a stranger going about their life."
 *
 * The one kind that must never get through. A candid subject signed nothing,
 * and this app would put their face behind a fictional business with a
 * fabricated rating on it — the same wrong that ruled out Wikimedia, only
 * harder to spot inside a stock library.
 *
 * Word boundaries are load-bearing. Without them `sign` matches "design" and
 * `field` matches "fields", which rejects almost everything and makes a broken
 * filter look like a supply problem. An earlier version shipped without them
 * and zeroed out all forty.
 */
export const DOCUMENTARY = new RegExp(
  String.raw`\b(street|market|temple|shrine|village|festival|parade|tourist|monk|nun|protest|rally|refugee|tribe|tribal|costume|vendor|beggar|candid|documentary|sidewalk|alley|kimono|hanbok|traditional attire|traditional dress)\b`,
  "i",
);

/**
 * Studio work that is still wrong for a row in a directory.
 *
 * A monochrome frame among thirty-nine colour ones reads as a mistake. A
 * fashion or beauty shot reads as an advertisement rather than somebody you are
 * about to hire. A profile, a back view or closed eyes gives a listing a subject
 * who is not looking at the reader, and two people in the frame gives it a
 * subject nobody can identify.
 *
 * `topless` is on the list because a perfectly ordinary query returned one —
 * which is the argument for having the list, not an argument for trusting the
 * query.
 */
export const OFF_REGISTER = new RegExp(
  String.raw`\b(monochrome|black and white|grayscale|greyscale|beauty|fashion|makeup|glamour|lingerie|nude|topless|shirtless|bare chest|side profile|profile view|back view|silhouette|eyes closed|looking away|taking notes|man and woman|woman and man|conversation|couple|two people|hard hat|architect)\b`,
  "i",
);

/**
 * Per-person overrides, for the bands where the generated query runs dry.
 *
 * Elderly East Asian women and middle-aged East Asian men in plain commercial
 * settings are the two thinnest parts of this library; the generated query kept
 * returning European and South Asian results for them however far the picker
 * skipped ahead. Naming the relationship rather than the age — grandmother, not
 * "elderly woman" — reaches a different and better-stocked corner of it.
 */
export const OVERRIDE = {
  /* Recast a band down, rather than take what the elderly-woman band offers.
     Everything Pexels has under "elderly asian woman" is documentary — street
     and village portraits of real people who signed nothing — so Ina is shot
     ten years younger instead. The casting exists to keep forty people
     distinct; which decade a face reads as costs nothing next to publishing
     somebody's grandmother as a fictional guide with a fabricated rating. */
  "p-chenggong-guide": "asian woman smiling studio portrait",
  "p-taroko-car": "asian man polo shirt white background",
  "p-chishang-car": "asian senior man portrait white background",
};
