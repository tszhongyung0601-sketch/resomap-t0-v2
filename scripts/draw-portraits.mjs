import sharp from "sharp";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CASTING } from "./portrait-casting.mjs";
import { writeManifest } from "./portrait-manifest.mjs";

/**
 * Draw the forty drivers and guides.
 *
 * These are illustrations, not photographs, and that is a deliberate answer to
 * a real constraint rather than a compromise hidden behind one. The cards used
 * to borrow a photograph of the nearest attraction, so every person around
 * 七星潭 was the same empty beach. The honest fix is not a stock photograph of
 * somebody else's face — it is a picture that is unmistakably *of this person*
 * and unmistakably *drawn*.
 *
 * The idiom is the one T0 already ships for places (see `Generated` in
 * Cover.tsx): flat fields, a hard horizon, solid shapes, no gradients and
 * nothing soft. That rule exists because a blurred blob at card size does not
 * read as "an illustration", it reads as "a photograph that failed to load".
 * Everything here is a polygon or an ellipse with a flat fill, so the whole
 * screen looks like something somebody chose.
 *
 * Each drawing follows that person's prompt in PORTRAIT_PROMPTS.md — the same
 * age, hair, hat, garment, place and hour — so when a photograph is generated
 * later and dropped into `.portrait-src/`, it replaces the drawing and the
 * person does not change.
 *
 *   node scripts/draw-portraits.mjs
 */

const OUT = "public/portraits";

/** 16:9, in units that are easy to author. The person lives around x=104. */
const W = 160;
const H = 90;

/* ------------------------------------------------------------------ palette */

const SKIN = ["#F2CDAB", "#E8B991", "#D9A276", "#C68B5E", "#AE7449"];
/** The neck is the same person out of the light, not a different colour. */
const SHADE = ["#DCB693", "#D2A47C", "#C28C63", "#AF764C", "#98613A"];

const HAIR_COLOUR = {
  black: "#1D1A17",
  dark: "#2E241C",
  brown: "#4C3826",
  salt: "#6A625A",
  grey: "#8C8681",
  silver: "#B6B2AB",
  white: "#DAD6D0",
};

const INK = "#241F1A";

/**
 * Sky, ground and the light on them.
 *
 * `sun` is a disc; `dark` flips the face and garment towards the cool end,
 * because a night-market guide lit by stall bulbs is not a daytime portrait
 * with the background swapped.
 */
const SKIES = {
  predawn:   { sky: "#3A4463", ground: "#2E3446", sun: null,      dark: true },
  dawn:      { sky: "#F0B98C", ground: "#7A6B62", sun: "#FFE7C4", dark: false },
  morning:   { sky: "#B9D8EA", ground: "#5F7A63", sun: "#FFF3D6", dark: false },
  overcast:  { sky: "#D3DADE", ground: "#77807C", sun: null,      dark: false },
  midday:    { sky: "#A6CBE6", ground: "#63805F", sun: "#FFF6DF", dark: false },
  afternoon: { sky: "#C4DAE7", ground: "#6F7E6A", sun: null,      dark: false },
  dusk:      { sky: "#D98C63", ground: "#4B4550", sun: "#FFD9A6", dark: false },
  night:     { sky: "#1F2739", ground: "#1A1F2C", sun: null,      dark: true },
};

/* ------------------------------------------------------------------- scenes */

const el = (tag, attrs) =>
  `<${tag} ${Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ")}/>`;

const poly = (points, fill) => el("polygon", { points, fill });
const rect = (x, y, w, h, fill, rx = 0) => el("rect", { x, y, width: w, height: h, fill, rx });
const circle = (cx, cy, r, fill) => el("circle", { cx, cy, r, fill });
const ellipse = (cx, cy, rx, ry, fill) => el("ellipse", { cx, cy, rx, ry, fill });

/**
 * What is behind the person, as flat shapes on a hard horizon.
 *
 * Every one is weighted to the left: the head sits right of centre, so a scene
 * that puts its tallest shape at x=110 puts it behind somebody's ear. The
 * lower-left corner is also kept plain — the app draws a distance chip there.
 */
const SCENES = {
  hills: (c, y) => [
    poly(`0,${y} 26,${y - 17} 44,${y - 8} 60,${y - 20} 82,${y}`, shift(c.ground, -18)),
    poly(`-4,${y} 18,${y - 9} 40,${y - 14} 66,${y - 4} 92,${y}`, c.ground),
  ],
  gorge: (c, y) => [
    poly(`0,0 0,${y + 6} 22,${y + 6} 30,${y - 34} 20,0`, "#9AA0A2"),
    poly(`152,0 160,0 160,${y + 6} 128,${y + 6} 136,${y - 28}`, "#8B9193"),
    poly(`14,${y + 6} 40,${y - 20} 62,${y + 6}`, "#7C8385"),
    rect(0, y, W, H - y, "#6E7476"),
  ],
  cliff: (c, y) => [
    rect(0, y - 3, W, H - y + 3, "#4E6E82"),
    poly(`0,${y - 3} 0,${y - 30} 16,${y - 34} 34,${y - 12} 44,${y - 3}`, "#5B6455"),
    poly(`-2,${y - 3} 10,${y - 20} 26,${y - 3}`, "#48513F"),
  ],
  bay: (c, y) => [
    rect(0, y - 2, W, H - y + 2, "#5F93A8"),
    poly(`0,${y - 2} 0,${y - 16} 22,${y - 22} 46,${y - 2}`, shift(c.ground, -14)),
    rect(0, y + 10, W, H - y - 10, shift(c.ground, -4)),
  ],
  pebble: (c, y) => [
    rect(0, y - 2, W, 8, "#66879B"),
    poly(`0,${y - 2} 0,${y - 21} 14,${y - 26} 30,${y - 14} 40,${y - 2}`, "#5E6B6E"),
    rect(0, y + 6, W, H - y - 6, "#9C9A94"),
    ...[[10, 80], [26, 84], [44, 79], [64, 86], [18, 88], [50, 87]].map(([x, yy]) =>
      ellipse(x, yy, 3.2, 1.6, "#8A8882"),
    ),
  ],
  coastrock: (c, y) => [
    rect(0, y - 2, W, H - y + 2, "#5C8DA0"),
    poly(`4,${H} 12,${y - 6} 24,${y - 10} 34,${H}`, "#A08B6E"),
    poly(`36,${H} 46,${y - 2} 56,${y - 6} 66,${H}`, "#8E7A5E"),
    rect(0, y + 14, W, H - y - 14, "#B8A487"),
  ],
  tidepool: (c, y) => [
    rect(0, y, W, H - y, "#3B4657"),
    poly(`0,${H} 10,${y + 2} 30,${y - 2} 44,${H}`, "#2B3341"),
    ...[[16, 82, 7], [50, 86, 9]].map(([x, yy, r]) => ellipse(x, yy, r, 2.4, "#59677E")),
  ],
  ricefield: (c, y) => [
    poly(`0,${y} 30,${y - 12} 58,${y - 6} 90,${y}`, "#7E8C7A"),
    rect(0, y, W, H - y, "#8FA84F"),
    ...[0, 1, 2, 3].map((i) => rect(0, y + 4 + i * 5, W, 1.6, "#7C9542")),
  ],
  flowerfield: (c, y) => [
    poly(`0,${y} 26,${y - 14} 54,${y - 5} 84,${y}`, "#7C8B72"),
    rect(0, y, W, H - y, "#87A24C"),
    ...[0, 1, 2].map((i) => rect(0, y + 6 + i * 7, W, 3, "#E0B233")),
  ],
  wetland: (c, y) => [
    poly(`0,${y} 24,${y - 10} 52,${y - 4} 78,${y}`, "#7A8580"),
    rect(0, y, W, H - y, "#6E8C7E"),
    ...[0, 1, 2, 3].map((i) => rect(0, y + 5 + i * 6, W * 0.62, 1.4, "#8FA89A")),
  ],
  estuary: (c, y) => [
    poly(`0,${y} 20,${y - 11} 44,${y}`, "#6E7A80"),
    rect(0, y, W, H - y, "#8C8B80"),
    ...[0, 1, 2].map((i) => rect(0, y + 7 + i * 7, W * 0.7, 1.4, "#9C9B8F")),
  ],
  city: (c, y) => [
    ...[[2, 26], [12, 40], [24, 18], [33, 52], [45, 30], [56, 44], [68, 22]].map(([x, h]) =>
      rect(x, y - h, 9, h, shift(c.ground, -10)),
    ),
    rect(0, y, W, H - y, c.ground),
  ],
  oldstreet: (c, y) => [
    rect(0, y - 26, 78, 26, "#B7906B"),
    ...[4, 22, 40, 58].map((x) => rect(x, y - 20, 12, 20, "#9A7452", 0)),
    ...[4, 22, 40, 58].map((x) => circle(x + 6, y - 20, 6, "#8A6647")),
    rect(0, y, W, H - y, "#8E7F6D"),
  ],
  temple: (c, y) => [
    poly(`0,${y - 24} 40,${y - 34} 80,${y - 24}`, "#A4463A"),
    rect(2, y - 24, 74, 24, "#BE7A4E"),
    ...[10, 30, 50, 66].map((x) => rect(x, y - 18, 6, 18, "#8E4A34")),
    rect(0, y, W, H - y, "#93826E"),
  ],
  arcade: (c, y) => [
    rect(0, y - 28, 76, 28, "#C3B199"),
    ...[3, 22, 41, 60].map((x) => rect(x, y - 22, 13, 22, "#6E6455")),
    rect(0, y, W, H - y, "#9E9385"),
  ],
  warehouse: (c, y) => [
    rect(0, y - 24, 80, 24, "#9A6A52"),
    ...[6, 26, 46, 64].map((x) => rect(x, y - 17, 10, 12, "#6F4A38")),
    rect(0, y, W, H - y, "#8A7F72"),
  ],
  market: (c, y) => [
    rect(0, 0, W, y, "#4A4038"),
    ...[6, 30, 54].map((x) => poly(`${x},${y - 26} ${x + 22},${y - 26} ${x + 18},${y - 20} ${x + 4},${y - 20}`, "#B8442F")),
    ...[14, 38, 62].map((x) => circle(x, y - 14, 2.6, "#FFD98A")),
    rect(0, y, W, H - y, "#6A5C4E"),
  ],
  nightmarket: (c, y) => [
    ...[4, 24, 44, 64].map((x) => rect(x, y - 24, 16, 10, "#3A3346")),
    ...[8, 28, 48, 68].map((x) => circle(x, y - 10, 2.8, "#FFC066")),
    ...[16, 36, 56].map((x) => circle(x, y - 17, 2.2, "#F2E0A8")),
    rect(0, y, W, H - y, "#2A2735"),
  ],
  courtyard: (c, y) => [
    rect(0, y - 30, 84, 30, "#3E3A3A"),
    ...[8, 34, 60].map((x) => circle(x + 6, y - 26, 9, "#4E5B44")),
    ...[14, 42, 68].map((x) => circle(x, y - 8, 2.4, "#FFC97A")),
    rect(0, y, W, H - y, "#332F31"),
  ],
  harbour: (c, y) => [
    rect(0, y - 2, W, H - y + 2, "#4E7488"),
    ...[8, 26, 46].map((x) => rect(x, y - 26, 1.4, 24, "#D8D3C8")),
    ...[2, 20, 40].map((x) => poly(`${x},${y - 4} ${x + 22},${y - 4} ${x + 18},${y + 3} ${x + 4},${y + 3}`, "#C7513C")),
    rect(0, y + 6, W, H - y - 6, "#6E7A80"),
  ],
  church: (c, y) => [
    poly(`10,${y} 26,${y - 30} 42,${y}`, "#D5CFC2"),
    rect(24, y - 40, 3, 12, "#D5CFC2"),
    rect(20, y - 36, 11, 3, "#D5CFC2"),
    rect(0, y, W, H - y, "#41474F"),
  ],
  railway: (c, y) => [
    poly(`0,${y} 26,${y - 14} 54,${y - 6} 84,${y}`, shift(c.ground, -16)),
    rect(0, y, W, H - y, "#6B6A60"),
    poly(`0,${H} 30,${y + 2} 40,${y + 2} 22,${H}`, "#8E8C82"),
    poly(`26,${H} 46,${y + 2} 54,${y + 2} 48,${H}`, "#8E8C82"),
  ],
  forest: (c, y) => [
    poly(`0,${y} 20,${y - 30} 40,${y}`, "#3E5442"),
    poly(`26,${y} 48,${y - 24} 70,${y}`, "#496149"),
    poly(`-6,${y} 12,${y - 20} 30,${y}`, "#35472F"),
    rect(0, y, W, H - y, "#4E5B44"),
  ],
  fort: (c, y) => [
    rect(4, y - 26, 62, 26, "#B4553F"),
    ...[10, 28, 46].map((x) => rect(x, y - 20, 10, 14, "#8C3F2E")),
    rect(0, y, W, H - y, "#7E7A66"),
  ],
  trail: (c, y) => [
    poly(`0,${y} 22,${y - 24} 46,${y - 6} 72,${y}`, "#41603F"),
    poly(`-4,${y} 14,${y - 12} 34,${y}`, "#35502F"),
    rect(0, y, W, H - y, "#557048"),
    poly(`0,${H} 24,${y + 2} 36,${y + 2} 18,${H}`, "#8C8262"),
  ],
  yinyang: (c, y) => [
    rect(0, y - 2, W * 0.62, 10, "#B79A46"),
    rect(0, y + 8, W, H - y - 8, "#4E6E7E"),
    poly(`0,${y - 2} 0,${y - 22} 22,${y - 28} 46,${y - 2}`, "#6B6250"),
  ],
};

/** A flat tone shifted towards black (negative) or white (positive). */
function shift(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(v + amount))),
  );
  return `#${ch.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/* ------------------------------------------------------------------ person */

const CX = 106;
/** Head centre. Upper-middle third of the frame, per the composition rule. */
const CY = 33;
const HR = 12.4;
const HRY = 14;

const BUILD = { slim: 22, medium: 25.5, broad: 29 };

/** Stable per-id jitter, the same trick `Generated` uses for places. */
function seed(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * The measurements that make one face not another.
 *
 * Forty portraits built from one set of constants are forty copies of the same
 * head with different hats, and on a list that is exactly what it looks like.
 * Skull width and height, how far apart the eyes sit, how big they are, brow
 * weight, nose length, mouth width — all small numbers, all derived from the id
 * so they never move, and together enough that no two of the forty read as the
 * same person.
 */
function metrics(c) {
  const n = seed(c.id);
  const wide = c.build === "broad" ? 1.05 : c.build === "slim" ? 0.95 : 1;
  return {
    hr: HR * wide * (0.95 + ((n % 7) / 60)),
    hry: HRY * (0.95 + (((n >> 3) % 7) / 62)),
    eyeW: 3.1 + ((n >> 6) % 5) * 0.28,
    eyeGap: 5.8 + ((n >> 9) % 5) * 0.45,
    eyeH: 1.7 + ((n >> 12) % 3) * 0.22,
    browT: 1.25 + ((n >> 15) % 3) * 0.3,
    browTilt: (((n >> 17) % 3) - 1) * 0.55,
    noseL: 3.2 + ((n >> 19) % 4) * 0.42,
    mouthW: 5 + ((n >> 21) % 4) * 0.75,
    earY: 2.2 + ((n >> 23) % 3) * 0.5,
    /** 0 is a straight line; anything else is a shallow curve, up or down. */
    smile: [0, 1.5, 2.4, 0, -1.1, 1.9][(n >> 25) % 6],
  };
}

function torso(c) {
  const half = BUILD[c.build];
  const shoulderY = 56;
  /* Under a night sky the person is lit by whatever is next to them — a stall
     bulb, a street lamp, their own headlights. Without this the night cards are
     a dark garment on a dark ground and the person disappears into the
     background the whole exercise was meant to get them out of. */
  const lift = SKIES[c.light].dark ? 34 : 0;
  const t = lift
    ? { ...c.top, colour: shift(c.top.colour, lift), accent: shift(c.top.accent, lift) }
    : c.top;
  const out = [];

  /* A hard darker edge, not a soft one. Without it a white polo at dawn and a
     charcoal jacket at night both dissolve into their own background, and the
     one thing this picture has to do is separate a person from a place. */
  out.push(
    el("path", {
      d: `M${CX - half - 3},${H} L${CX - half + 1},${shoulderY + 6}
          Q${CX - half + 3},${shoulderY - 2} ${CX - 9},${shoulderY - 3}
          L${CX + 9},${shoulderY - 3}
          Q${CX + half - 3},${shoulderY - 2} ${CX + half - 1},${shoulderY + 6}
          L${CX + half + 3},${H} Z`.replace(/\s+/g, " "),
      fill: t.colour,
      stroke: shift(t.colour, -30),
      "stroke-width": 0.7,
    }),
  );

  /* The collar is what tells a polo from a windbreaker at 150px tall. */
  switch (t.kind) {
    case "polo":
    case "uniform":
    case "check":
    case "plaid":
      out.push(poly(`${CX - 6},${shoulderY - 3} ${CX},${shoulderY + 6} ${CX + 6},${shoulderY - 3}`, shift(t.colour, -22)));
      out.push(poly(`${CX - 6.5},${shoulderY - 3} ${CX - 1.4},${shoulderY + 4} ${CX - 7},${shoulderY + 5.5}`, t.accent));
      out.push(poly(`${CX + 6.5},${shoulderY - 3} ${CX + 1.4},${shoulderY + 4} ${CX + 7},${shoulderY + 5.5}`, t.accent));
      break;
    case "button":
    case "shirt":
    case "blouse":
    case "field":
    case "stripe":
    case "denim":
    case "canvas":
    case "workjacket":
      out.push(poly(`${CX - 6},${shoulderY - 3} ${CX},${shoulderY + 6} ${CX + 6},${shoulderY - 3}`, shift(t.colour, -24)));
      out.push(poly(`${CX - 6.5},${shoulderY - 3} ${CX - 1},${shoulderY + 5} ${CX - 7.5},${shoulderY + 7}`, t.accent));
      out.push(poly(`${CX + 6.5},${shoulderY - 3} ${CX + 1},${shoulderY + 5} ${CX + 7.5},${shoulderY + 7}`, t.accent));
      out.push(rect(CX - 0.8, shoulderY + 6, 1.6, H - shoulderY - 6, shift(t.colour, -18)));
      break;
    case "windbreaker":
    case "softshell":
    case "quilted":
    case "fleece":
      out.push(rect(CX - 1.2, shoulderY - 2, 2.4, H - shoulderY + 2, t.accent));
      out.push(poly(`${CX - 8},${shoulderY - 3} ${CX},${shoulderY + 4} ${CX + 8},${shoulderY - 3}`, shift(t.colour, -16)));
      break;
    case "gilet":
    case "vest":
      out.push(rect(CX - 11, shoulderY - 1, 22, H - shoulderY + 1, t.colour));
      out.push(rect(CX - 4, shoulderY + 12, 8, 5, t.accent, 1));
      break;
    case "hoodie":
      out.push(poly(`${CX - 12},${shoulderY - 2} ${CX},${shoulderY + 8} ${CX + 12},${shoulderY - 2}`, t.accent));
      break;
    case "waders":
      out.push(rect(CX - 12, shoulderY - 4, 24, 8, t.accent));
      out.push(rect(CX - 9, shoulderY + 2, 3, 14, shift(t.colour, 20)));
      out.push(rect(CX + 6, shoulderY + 2, 3, 14, shift(t.colour, 20)));
      break;
    case "apron":
      out.push(rect(CX - 12, shoulderY + 4, 24, H - shoulderY - 4, t.accent));
      out.push(poly(`${CX - 8},${shoulderY - 3} ${CX},${shoulderY + 8} ${CX + 8},${shoulderY - 3}`, shift(t.colour, -20)));
      break;
    case "sunsleeve":
      out.push(rect(CX - half - 2, shoulderY + 8, 7, H - shoulderY - 8, t.accent));
      out.push(rect(CX + half - 5, shoulderY + 8, 7, H - shoulderY - 8, t.accent));
      break;
    case "sunshirt":
    case "henley":
    case "tee":
      out.push(poly(`${CX - 6},${shoulderY - 3} ${CX},${shoulderY + 5} ${CX + 6},${shoulderY - 3}`, t.accent));
      break;
    default:
      break;
  }

  if (t.kind === "stripe") {
    for (let i = 0; i < 5; i++) {
      out.push(rect(CX - half - 2, shoulderY + 4 + i * 6, half * 2 + 4, 2.4, t.accent));
    }
  }
  if (t.kind === "check" || t.kind === "plaid") {
    const line = shift(t.colour, t.kind === "check" ? 30 : -24);
    for (let i = 0; i < 4; i++) out.push(rect(CX - half - 2, shoulderY + 7 + i * 9, half * 2 + 4, 0.8, line));
    for (let i = 0; i < 3; i++) out.push(rect(CX - half + 7 + i * 15, shoulderY - 2, 0.8, H - shoulderY + 2, line));
  }

  return out;
}

const HAIR = {
  crop: (h, m) => [el("path", { d: cap(m, 1), fill: h })],
  "crop-thin": (h, m) => [el("path", { d: cap(m, 0.86), fill: h })],
  receding: (h, m) => [
    el("path", { d: cap(m, 0.72), fill: h }),
    rect(CX - m.hr, CY - 6, 3.4, 7, h),
    rect(CX + m.hr - 3.4, CY - 6, 3.4, 7, h),
  ],
  buzz: (h, m) => [el("path", { d: cap(m, 0.94, 0.82), fill: h })],
  fade: (h, m) => [el("path", { d: cap(m, 1.02, 0.72), fill: h })],
  sidepart: (h, m) => [
    el("path", { d: cap(m, 1.04), fill: h }),
    poly(`${CX - m.hr},${CY - 8} ${CX + 3},${CY - m.hry - 1} ${CX + m.hr},${CY - 7} ${CX + m.hr},${CY - 3} ${CX - m.hr},${CY - 3}`, shift(h, 10)),
  ],
  spiky: (h, m) => [
    el("path", { d: cap(m, 1), fill: h }),
    ...[-8, -4, 0, 4, 8].map((dx) =>
      poly(`${CX + dx - 2},${CY - m.hry + 1} ${CX + dx},${CY - m.hry - 4} ${CX + dx + 2},${CY - m.hry + 1}`, h),
    ),
  ],
  curly: (h, m) => [
    el("path", { d: cap(m, 1.02), fill: h }),
    ...[[-9, -11], [-4, -14], [2, -15], [8, -13], [11, -8]].map(([dx, dy]) =>
      circle(CX + dx, CY + dy, 3.6, h),
    ),
  ],
  curls: (h, m) => [
    el("path", { d: cap(m, 1.06), fill: h }),
    ...[[-12, -6], [-10, -12], [-4, -15], [3, -16], [10, -12], [12, -5]].map(([dx, dy]) =>
      circle(CX + dx, CY + dy, 4.2, h),
    ),
  ],
  fringe: (h, m) => [
    el("path", { d: cap(m, 1.04), fill: h }),
    poly(`${CX - m.hr - 0.5},${CY - 6} ${CX - 2},${CY - 1} ${CX + m.hr + 0.5},${CY - 7} ${CX + m.hr + 0.5},${CY - 12} ${CX - m.hr - 0.5},${CY - 12}`, h),
  ],
  bob: (h, m) => [
    el("path", { d: cap(m, 1.06), fill: h }),
    el("path", {
      d: `M${CX - m.hr - 1.6},${CY - 4} L${CX - m.hr - 2.4},${CY + 13} L${CX - m.hr + 3},${CY + 13} L${CX - m.hr + 2},${CY - 4} Z`,
      fill: h,
    }),
    el("path", {
      d: `M${CX + m.hr + 1.6},${CY - 4} L${CX + m.hr + 2.4},${CY + 13} L${CX + m.hr - 3},${CY + 13} L${CX + m.hr - 2},${CY - 4} Z`,
      fill: h,
    }),
    poly(`${CX - m.hr},${CY - 7} ${CX + 1},${CY - 2} ${CX + m.hr},${CY - 8} ${CX + m.hr},${CY - 13} ${CX - m.hr},${CY - 13}`, h),
  ],
  "long-loose": (h, m) => [
    el("path", { d: cap(m, 1.08), fill: h }),
    el("path", { d: `M${CX - m.hr - 2},${CY - 6} L${CX - m.hr - 5},${CY + 26} L${CX - m.hr + 4},${CY + 26} L${CX - m.hr + 2},${CY - 6} Z`, fill: h }),
    el("path", { d: `M${CX + m.hr + 2},${CY - 6} L${CX + m.hr + 5},${CY + 26} L${CX + m.hr - 4},${CY + 26} L${CX + m.hr - 2},${CY - 6} Z`, fill: h }),
    poly(`${CX - m.hr},${CY - 6} ${CX + 2},${CY - 3} ${CX + m.hr},${CY - 9} ${CX + m.hr},${CY - 13} ${CX - m.hr},${CY - 13}`, h),
  ],
  "clipped-up": (h, m) => [
    el("path", { d: cap(m, 1.06), fill: h }),
    ellipse(CX + 1, CY - m.hry - 2.5, 7, 4.4, h),
    el("path", { d: `M${CX - m.hr - 1},${CY - 4} L${CX - m.hr - 2},${CY + 8} L${CX - m.hr + 3},${CY + 8} Z`, fill: h }),
  ],
  "bun-low": (h, m) => [
    el("path", { d: cap(m, 1.06), fill: h }),
    circle(CX - m.hr - 2.5, CY + 9, 5.2, h),
    poly(`${CX - m.hr},${CY - 6} ${CX + 2},${CY - 2} ${CX + m.hr},${CY - 8} ${CX + m.hr},${CY - 13} ${CX - m.hr},${CY - 13}`, h),
  ],
  ponytail: (h, m) => [
    el("path", { d: cap(m, 1.04), fill: h }),
    el("path", { d: `M${CX - m.hr - 1},${CY - 8} L${CX - m.hr - 7},${CY + 14} L${CX - m.hr - 1},${CY + 15} L${CX - m.hr + 4},${CY - 6} Z`, fill: h }),
    poly(`${CX - m.hr},${CY - 7} ${CX + 2},${CY - 3} ${CX + m.hr},${CY - 9} ${CX + m.hr},${CY - 13} ${CX - m.hr},${CY - 13}`, h),
  ],
  braid: (h, m) => [
    el("path", { d: cap(m, 1.06), fill: h }),
    ...[0, 1, 2, 3].map((i) => ellipse(CX + m.hr + 1.5, CY + 4 + i * 5.4, 3.4, 3, h)),
    poly(`${CX - m.hr},${CY - 7} ${CX + 2},${CY - 3} ${CX + m.hr},${CY - 9} ${CX + m.hr},${CY - 13} ${CX - m.hr},${CY - 13}`, h),
  ],
  "plait-front": (h, m) => [
    el("path", { d: cap(m, 1.06), fill: h }),
    ...[0, 1, 2, 3].map((i) => ellipse(CX - m.hr - 1.5, CY + 4 + i * 5.4, 3.6, 3.1, h)),
    poly(`${CX - m.hr},${CY - 6} ${CX + 2},${CY - 2} ${CX + m.hr},${CY - 8} ${CX + m.hr},${CY - 13} ${CX - m.hr},${CY - 13}`, h),
  ],
  "tail-nape": (h, m) => [
    el("path", { d: cap(m, 1.02), fill: h }),
    el("path", { d: `M${CX - m.hr + 1},${CY + 4} L${CX - m.hr - 4},${CY + 16} L${CX - m.hr + 1},${CY + 16} L${CX - m.hr + 5},${CY + 4} Z`, fill: h }),
  ],
};

/** The skull cap the hair sits on. `w` widens it, `t` sets how low it comes. */
function cap(m, w = 1, t = 1) {
  const rx = m.hr * w + 0.8;
  const ry = m.hry * t + 0.6;
  return `M${CX - rx},${CY - 1} A${rx},${ry} 0 0 1 ${CX + rx},${CY - 1} L${CX + rx},${CY - 4} L${CX - rx},${CY - 4} Z`;
}

const HATS = {
  cap: (c, m) => [
    el("path", { d: `M${CX - m.hr - 1.5},${CY - 5} A${m.hr + 1.5},${m.hry + 1} 0 0 1 ${CX + m.hr + 1.5},${CY - 5} Z`, fill: c }),
    el("path", { d: `M${CX - 5},${CY - 5.5} L${CX + m.hr + 12},${CY - 4} L${CX + m.hr + 12},${CY - 1.5} L${CX - 5},${CY - 2.5} Z`, fill: shift(c, -18) }),
  ],
  meshcap: (c, m) => [
    el("path", { d: `M${CX - m.hr - 1.5},${CY - 5} A${m.hr + 1.5},${m.hry + 1} 0 0 1 ${CX + m.hr + 1.5},${CY - 5} Z`, fill: c }),
    rect(CX - m.hr - 1.5, CY - 10, m.hr + 1.5, 5, shift(c, 26)),
    el("path", { d: `M${CX - 5},${CY - 5.5} L${CX + m.hr + 12},${CY - 4} L${CX + m.hr + 12},${CY - 1.5} L${CX - 5},${CY - 2.5} Z`, fill: shift(c, -18) }),
  ],
  suncap: (c, m) => [
    el("path", { d: `M${CX - m.hr - 1},${CY - 5} A${m.hr + 1},${m.hry} 0 0 1 ${CX + m.hr + 1},${CY - 5} Z`, fill: c }),
    el("path", { d: `M${CX - 6},${CY - 5.5} L${CX + m.hr + 14},${CY - 6} L${CX + m.hr + 14},${CY - 3} L${CX - 6},${CY - 2.5} Z`, fill: shift(c, -14) }),
  ],
  flatcap: (c, m) => [
    el("path", { d: `M${CX - m.hr - 2},${CY - 4} A${m.hr + 2},${m.hry - 2} 0 0 1 ${CX + m.hr + 3},${CY - 6} Z`, fill: c }),
    el("path", { d: `M${CX - 2},${CY - 4.5} L${CX + m.hr + 11},${CY - 6.5} L${CX + m.hr + 11},${CY - 4} L${CX - 2},${CY - 2} Z`, fill: shift(c, -16) }),
  ],
  bucket: (c, m) => [
    el("path", { d: `M${CX - m.hr - 2},${CY - 6} A${m.hr + 2},${m.hry} 0 0 1 ${CX + m.hr + 2},${CY - 6} Z`, fill: c }),
    rect(CX - m.hr - 8, CY - 6.5, (m.hr + 8) * 2, 3.2, shift(c, -12), 1.4),
  ],
  widebrim: (c, m) => [
    el("path", { d: `M${CX - m.hr - 1},${CY - 7} A${m.hr + 1},${m.hry - 1} 0 0 1 ${CX + m.hr + 1},${CY - 7} Z`, fill: c }),
    ellipse(CX, CY - 6.5, m.hr + 11, 3.4, shift(c, -14)),
  ],
  visor: (c, m) => [
    rect(CX - m.hr - 1, CY - 8, (m.hr + 1) * 2, 3.4, c, 1.4),
    el("path", { d: `M${CX - 4},${CY - 7} L${CX + m.hr + 12},${CY - 7.5} L${CX + m.hr + 12},${CY - 4.5} L${CX - 4},${CY - 4} Z`, fill: shift(c, -14) }),
  ],
  beanie: (c, m) => [
    el("path", { d: `M${CX - m.hr - 1.5},${CY - 3} A${m.hr + 1.5},${m.hry + 2} 0 0 1 ${CX + m.hr + 1.5},${CY - 3} Z`, fill: c }),
    rect(CX - m.hr - 1.5, CY - 5.5, (m.hr + 1.5) * 2, 3.6, shift(c, -16)),
  ],
  watchcap: (c, m) => [
    el("path", { d: `M${CX - m.hr - 1.5},${CY - 1} A${m.hr + 1.5},${m.hry + 3} 0 0 1 ${CX + m.hr + 1.5},${CY - 1} Z`, fill: c }),
    rect(CX - m.hr - 1.5, CY - 4, (m.hr + 1.5) * 2, 3.6, shift(c, -18)),
  ],
  headscarf: (c, m) => [
    el("path", { d: `M${CX - m.hr - 2},${CY - 1} A${m.hr + 2},${m.hry + 1} 0 0 1 ${CX + m.hr + 2},${CY - 1} Z`, fill: c }),
    poly(`${CX - m.hr - 2},${CY - 1} ${CX - m.hr - 6},${CY + 12} ${CX - m.hr + 2},${CY + 6}`, c),
  ],
  headcloth: (c, m) => [
    el("path", { d: `M${CX - m.hr - 2},${CY - 2} A${m.hr + 2},${m.hry + 1} 0 0 1 ${CX + m.hr + 2},${CY - 2} Z`, fill: c }),
    ...[0, 1, 2].map((i) => rect(CX - m.hr - 2 + i * 8.6, CY - m.hry - 1, 3.2, 10, shift(c, -22))),
  ],
  "shades-up": (c, m) => [
    rect(CX - m.hr + 0.5, CY - m.hry + 1.5, 10, 2.6, c, 1),
    rect(CX + 1.5, CY - m.hry + 1.5, 10, 2.6, c, 1),
  ],
};

const HAT_COLOUR = {
  cap: "#33383F",
  meshcap: "#5C6470",
  suncap: "#B9B39F",
  flatcap: "#EFEDE6",
  bucket: "#2E3E55",
  widebrim: "#B7A87E",
  visor: "#D8D3C6",
  beanie: "#8C8C8C",
  watchcap: "#2B3550",
  headscarf: "#3E4A72",
  headcloth: "#C2725A",
  "shades-up": "#2A2A2E",
};

function face(c, m) {
  const dark = SKIES[c.light].dark;
  const skin = dark ? shift(SKIN[c.skin], 18) : SKIN[c.skin];
  const shade = dark ? shift(SHADE[c.skin], 18) : SHADE[c.skin];
  const out = [];

  out.push(rect(CX - 4.6, CY + m.hry - 6, 9.2, 10, shade, 1.5));
  out.push(ellipse(CX, CY, m.hr, m.hry, skin));
  out.push(ellipse(CX - m.hr - 0.6, CY + m.earY, 1.8, 2.6, shade));
  out.push(ellipse(CX + m.hr + 0.6, CY + m.earY, 1.8, 2.6, shade));

  if (c.face === "stubble") {
    out.push(
      el("path", {
        d: `M${CX - m.hr + 1},${CY + 4} Q${CX},${CY + m.hry + 1.5} ${CX + m.hr - 1},${CY + 4} L${CX + m.hr - 1},${CY + 8} Q${CX},${CY + m.hry + 3} ${CX - m.hr + 1},${CY + 8} Z`,
        fill: shift(skin, -34),
      }),
    );
  }

  /* Eyes, brows, nose, mouth: six marks, no more. Any additional detail at this
     size stops reading as a face and starts reading as a smudge. */
  const eyeY = CY + 0.5;
  const inner = m.eyeGap / 2;
  out.push(rect(CX - inner - m.eyeW, eyeY, m.eyeW, m.eyeH, INK, 0.9));
  out.push(rect(CX + inner, eyeY, m.eyeW, m.eyeH, INK, 0.9));

  /* Brows carry more of the expression than anything else here, so they get
     the tilt: outer end up reads open, outer end down reads set. */
  const browY = eyeY - (c.age >= 60 ? 4.6 : 4);
  const browCol = c.age >= 60 ? shift(HAIR_COLOUR[c.hairCol], 14) : HAIR_COLOUR[c.hairCol];
  const bw = m.eyeW + 1.3;
  out.push(
    el("polygon", {
      points: `${CX - inner - bw},${browY + m.browTilt} ${CX - inner + 0.4},${browY} ${CX - inner + 0.4},${browY + m.browT} ${CX - inner - bw},${browY + m.browTilt + m.browT}`,
      fill: browCol,
    }),
  );
  out.push(
    el("polygon", {
      points: `${CX + inner + bw},${browY + m.browTilt} ${CX + inner - 0.4},${browY} ${CX + inner - 0.4},${browY + m.browT} ${CX + inner + bw},${browY + m.browTilt + m.browT}`,
      fill: browCol,
    }),
  );

  out.push(rect(CX - 0.7, CY + 3.2, 1.6, m.noseL, shift(skin, -26), 0.7));

  const mouthY = CY + m.hry * 0.6;
  const lip = shift(skin, -46);
  /* Some of them are mid-sentence and some are waiting. A flat line on all
     forty is a row of passport photographs. */
  const mouth =
    m.smile === 0
      ? rect(CX - m.mouthW / 2, mouthY, m.mouthW, 1.5, lip, 0.7)
      : el("path", {
          d: `M${CX - m.mouthW / 2},${mouthY} Q${CX},${mouthY + m.smile} ${CX + m.mouthW / 2},${mouthY}`,
          fill: "none",
          stroke: lip,
          "stroke-width": 1.5,
          "stroke-linecap": "round",
        });
  if (c.face === "moustache") {
    out.push(rect(CX - m.mouthW / 2 - 1, mouthY - 2.4, m.mouthW + 2, 1.8, HAIR_COLOUR[c.hairCol], 0.8));
  }
  out.push(mouth);

  /* A line at each eye corner, from squinting at a road or a coastline for
     thirty years. Only for the people the casting says are that old. */
  if (c.age >= 50) {
    out.push(rect(CX - inner - m.eyeW - 3, eyeY + 0.7, 2.4, 0.9, shift(skin, -22), 0.4));
    out.push(rect(CX + inner + m.eyeW + 0.6, eyeY + 0.7, 2.4, 0.9, shift(skin, -22), 0.4));
  }

  return out;
}

function glasses(kind, m) {
  if (!kind) return [];
  const y = CY - 0.4;
  if (kind === "up") {
    return [
      rect(CX - 10, CY - m.hry + 2, 9, 2.6, "#2A2A2E", 1),
      rect(CX + 1, CY - m.hry + 2, 9, 2.6, "#2A2A2E", 1),
      rect(CX - 1.4, CY - m.hry + 2.6, 3, 1.2, "#2A2A2E"),
    ];
  }
  const heavy = kind === "thick";
  const stroke = heavy ? 1.5 : 0.9;
  const col = heavy ? "#2B2B2F" : "#6E6A63";
  const lensW = m.eyeW + 4.6;
  const x0 = CX - m.eyeGap / 2 - m.eyeW - 1.4;
  return [
    el("rect", { x: x0, y: y - 3, width: lensW, height: 6.4, rx: heavy ? 1 : 3.2, fill: "none", stroke: col, "stroke-width": stroke }),
    el("rect", { x: CX + m.eyeGap / 2 - 1.4, y: y - 3, width: lensW, height: 6.4, rx: heavy ? 1 : 3.2, fill: "none", stroke: col, "stroke-width": stroke }),
    rect(CX - 1.4, y - 0.6, 2.8, stroke, col),
    rect(x0 - 3.2, y - 1.4, 3.2, stroke, col),
    rect(CX + m.eyeGap / 2 - 1.4 + lensW, y - 1.4, 3.2, stroke, col),
  ];
}

/* -------------------------------------------------------------------- draw */

/**
 * One person, either 16:9 or square.
 *
 * The list card puts a 96px square thumbnail on the left, and a square cut out
 * of a 16:9 composition is a person shoved against one edge. So the square is
 * composed rather than cropped: the same drawing, moved so the head is centred,
 * with the place slid along behind it. At 96px the scene is colour and one
 * silhouette — which is all it can be, and all it needs to be for 花蓮 at dawn
 * to look different from 台北 at night.
 */
function svg(c, square = false) {
  const m = metrics(c);
  const sky = SKIES[c.light];
  const horizon = 58;
  const scene = SCENES[c.scene] ?? SCENES.hills;
  const w = square ? 90 : W;

  /* Sky, haze, sun, then the place — and the ground laid down before the scene
     so a silhouette that only reaches x=90 does not leave bare canvas behind
     the person's shoulder. Every scene may paint over it; none has to. */
  const behind = [
    rect(0, 0, w, horizon, sky.sky),
    rect(0, horizon - 9, w, 9, shift(sky.sky, sky.dark ? 14 : 8)),
    sky.sun ? circle(square ? 15 : 30, horizon - 26, 7.5, sky.sun) : "",
    rect(0, horizon, w, H - horizon, sky.ground),
    /* The scene is authored 160 wide. For the square it slides along rather
       than being squashed — a compressed mountain is a different mountain. */
    square
      ? `<g transform="translate(-30,0)">${scene(sky, horizon).join("\n")}</g>`
      : scene(sky, horizon).join("\n"),
  ];

  /* Under a night sky the background goes down, not the person. A wash over the
     whole frame is how the 04:30 and night-market cards ended up as a dark
     rectangle with a name under it. */
  if (sky.dark) {
    behind.push(el("rect", { x: 0, y: 0, width: w, height: H, fill: "#141A29", opacity: 0.26 }));
  }

  const person = [
    ...torso(c),
    ...face(c, m),
    ...(HAIR[c.hair] ?? HAIR.crop)(HAIR_COLOUR[c.hairCol], m),
    ...(c.hat ? (HATS[c.hat] ?? (() => []))(HAT_COLOUR[c.hat] ?? "#444", m) : []),
    ...glasses(c.glasses, m),
  ].join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${H}" width="${square ? 900 : 1600}" height="900" shape-rendering="geometricPrecision">
${behind.filter(Boolean).join("\n")}
${square ? `<g transform="translate(${45 - CX},0)">${person}</g>` : person}
</svg>`;
}

/* ------------------------------------------------------------------- build */

const SIZES = [
  { suffix: "card", width: 720, height: 405, quality: 82 },
  { suffix: "hero", width: 1280, height: 720, quality: 84 },
  /* The list card's left-hand thumbnail, drawn square rather than cropped. */
  { suffix: "thumb", width: 320, height: 320, quality: 84, square: true },
];

await mkdir(OUT, { recursive: true });

/* A photograph, once somebody has generated one from PORTRAIT_PROMPTS.md and
   run build-portraits.mjs, outranks a drawing of the same person. Skipping
   those ids here means the two generators can both be run, in any order,
   without one undoing the other.

   Worth saying out loud: a photographic portrait next to a drawn one looks like
   a bug, not like a mix. If you are going photographic, go all forty. */
let photographed = [];
try {
  photographed = (await readdir(".portrait-src"))
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .map((f) => f.replace(/\.[^.]+$/, ""));
} catch {
  /* no source directory */
}
try {
  /* Stock photographs count too. Without this, running the drawer once after a
     fetch silently replaces forty photographs with forty drawings. */
  const stock = JSON.parse(await readFile(".stock-portraits.json", "utf8"));
  photographed = [...photographed, ...stock.map((c) => c.id)];
} catch {
  /* nothing fetched yet — every one of the forty is drawn */
}

const contact = [];
for (const c of CASTING) {
  if (photographed.includes(c.id)) {
    console.log(`  ${c.id} — skipped, a photograph is in .portrait-src/`);
    continue;
  }
  const wide = Buffer.from(svg(c));
  const square = Buffer.from(svg(c, true));
  for (const s of SIZES) {
    await sharp(s.square ? square : wide, { density: 300 })
      .resize(s.width, s.height)
      .webp({ quality: s.quality })
      .toFile(join(OUT, `${c.id}-${s.suffix}.webp`));
  }
  contact.push(svg(c, true));
  console.log(`  ${c.id}`);
}

/* One sheet of all forty, so "no two of them look like the same person" is a
   thing somebody can check by looking rather than by reading the casting. */
await writeFile(
  ".portrait-contact-sheet.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="${8 * 180}" height="${5 * 180}" viewBox="0 0 ${8 * 90} ${5 * H}">
${CASTING.map((c, i) => `<g transform="translate(${(i % 8) * 90},${Math.floor(i / 8) * H})">${svg(c, true).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</g>`).join("\n")}
</svg>`,
  "utf8",
);

const { built, missing } = await writeManifest();
console.log(
  `\n${contact.length} drawn · ${built.length}/${built.length + missing.length} providers have a picture`,
);
if (missing.length) console.log(`no picture: ${missing.join(", ")}`);
