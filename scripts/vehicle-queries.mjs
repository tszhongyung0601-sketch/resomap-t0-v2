/**
 * What to search for, per hire car — and what to throw away.
 *
 * The card already states a fact: 「車型 Toyota Yaris · 5 人座」. So the picture
 * is keyed to that fact rather than to the company, because there is no
 * photograph of iRent's 花蓮 counter in any stock library and a generic car park
 * behind a named counter would be a picture pretending to be documentation.
 * A small hatchback above 「Toyota Yaris」 is illustrative and *true* — which is
 * the most a stock photograph can be here, and why every one of them ships with
 * the 圖庫示意 mark on the image itself.
 *
 * The rejects matter more than the queries. Searching "Toyota Sienta" returns
 * steering wheels, wet bonnets and rally cars, and searching "sedan car" returns
 * a BMW and an Audi — a luxury German saloon above the words 「Toyota Altis」 is
 * worse than the flat tint it replaced, because it contradicts the line
 * underneath it. Pexels' alt text is written by people and is reliable about
 * what is in the frame, so it can carry both checks.
 *
 * Every pattern here is built with `String.raw` and `new RegExp`. Literal
 * regex bodies in this file have twice been mangled by the tooling that edits
 * it — `\b` arrived as an actual backspace byte, which matches nothing and
 * looks exactly like a supply problem from the outside.
 */

/**
 * Vehicle classes, in the words the data uses.
 *
 * `requires` is the part that took two runs to get right. A query is a wish;
 * the corpus answers it with whatever it has, and what it had for "compact
 * minivan parked" was a night-time car park and a row of SUVs — both of which
 * are photographs of cars, pass every reject rule, and show nothing like the
 * 七人座 the card underneath them promises. So each class states what its
 * picture must actually contain, and a result that cannot prove it is skipped.
 */
export const CLASSES = {
  hatchback: {
    /* Short and plain. Long queries push the picker into the tail of the
       corpus, which is where the rally cars and the close-ups live. */
    queries: ["hatchback car parked", "small white car parked", "compact car street"],
    requires: new RegExp(
      String.raw`\b(hatchbacks?|hatch|compact cars?|small cars?|city cars?|yaris|auris|vios|fit|jazz|polo|picanto|swift)\b`,
      "i",
    ),
    label: "小型掀背車",
  },
  sedan: {
    queries: ["sedan parked street", "silver sedan car", "saloon car parked"],
    requires: new RegExp(
      String.raw`\b(sedans?|saloons?|altis|corolla|camry|civic|accord|passat|mazda3)\b`,
      "i",
    ),
    label: "四門房車",
  },
  suv: {
    queries: ["white suv parked", "suv car outdoors", "modern suv parked"],
    requires: new RegExp(String.raw`\b(suvs?|4x4|4wd|rav4|tucson|sportage|forester|cx-5)\b`, "i"),
    label: "休旅車",
  },
  crossover: {
    queries: ["compact suv parked", "crossover suv car", "small suv outdoors"],
    requires: new RegExp(
      String.raw`\b(suvs?|crossovers?|4x4|kicks|kona|juke|corolla cross|cx-3|cx-30)\b`,
      "i",
    ),
    label: "跨界休旅",
  },
  mpv: {
    /* "people carrier car" was in this list and returned a family unpacking a
       picnic hamper. The phrase describes a use rather than an object, and the
       corpus answers it with pictures of the use. */
    queries: ["mpv car parked", "minivan parked street", "silver mpv vehicle", "family van car"],
    requires: new RegExp(
      String.raw`\b(mpvs?|minivans?|vans?|people carriers?|seven[- ]seaters?|7[- ]seaters?|sienta|freed|carnival|odyssey)\b`,
      "i",
    ),
    label: "七人座 MPV",
  },
  /* The three aggregator cards do not name a vehicle — they say 「小型車 起」,
     which is a price floor and not a model. A row of cars on a forecourt is the
     honest picture of "we compare several companies for you", and it is the one
     class where a car park is the right answer rather than the wrong one. */
  fleet: {
    queries: ["rental cars parked row", "car park row of cars", "cars lined up parking lot"],
    requires: new RegExp(String.raw`\b(cars|vehicles|row|rows|line|lined|fleet|lot|parking)\b`, "i"),
    label: "多家車款比價",
  },
};

/** Which class each rental record belongs to. Read off its own `model` field. */
export function classOf(model) {
  const m = (model ?? "").toLowerCase();
  if (m.includes("yaris")) return "hatchback";
  if (m.includes("corolla cross")) return "crossover";
  if (m.includes("altis") || m.includes("corolla")) return "sedan";
  if (m.includes("rav4")) return "suv";
  if (m.includes("kicks")) return "crossover";
  if (m.includes("sienta")) return "mpv";
  /* 「小型車 起」 and anything else unrecognised. */
  return "fleet";
}

/**
 * The marque the card commits to, read off the record's own `model`.
 *
 * This was a property of the CLASS in the first version, which was simply
 * wrong: 「Nissan Kicks」 and 「Toyota Corolla Cross」 are both crossovers, and a
 * class cannot be both marques. That run put a red Hyundai above 「Nissan
 * Kicks」 and a green Suzuki above 「Toyota Corolla Cross」 — the exact
 * contradiction this check exists to prevent, waved through because it was
 * asking the wrong object which marque it was.
 *
 * Null when the record names no model, which is the three aggregator cards.
 */
export function marqueOf(model) {
  const m = (model ?? "").toLowerCase();
  for (const k of ["toyota", "nissan", "honda", "mazda", "mitsubishi", "hyundai", "kia", "ford"]) {
    if (m.includes(k)) return k;
  }
  /* Bare model names, in case a record ever carries one without its marque. */
  if (/yaris|altis|corolla|rav4|sienta|camry|vios/.test(m)) return "toyota";
  if (/kicks|sentra|x-trail/.test(m)) return "nissan";
  return null;
}

/**
 * Not a car, or not a whole car.
 *
 * Interiors and detail shots are the single biggest source of noise: a steering
 * wheel at 96px is an unreadable smear, and a Toyota badge in close-up is a
 * photograph of a logo rather than of a car you could drive away.
 */
export const NOT_A_CAR = new RegExp(
  String.raw`\b(steering wheel|dashboard|interior|inside|cockpit|close[- ]?up|closeup|logo|emblem|badge|grille|grill|taillight|tail light|headlight|bonnet|hood|tyre|tire|rim|engine|seats|mirror|door handle|speedometer|odometer|keychain|keyring)\b`,
  "i",
);

/** Somebody else's sport, and somebody else's job. */
export const WRONG_JOB = new RegExp(
  String.raw`\b(rally|racing|race|racetrack|motorsport|drift|drifting|nascar|formula|delivery|cargo|freight|package|packages|parcel|ambulance|police|taxi|fire truck|tow truck|garbage|bus|lorry|truck|tractor|forklift)\b`,
  "i",
);

/**
 * Not the kind of vehicle anybody hires at a station counter.
 *
 * `golf cart` earned its place: "cars lined up parking lot" returned a row of
 * them on a golf course, and at 96 pixels a row of golf carts and a row of hire
 * cars are the same silhouette to a filter and obviously different to a person.
 */
export const WRONG_VEHICLE = new RegExp(
  /* `s?` on every noun. `\b(golf cart)\b` does not match "golf carts", because
     the boundary after "cart" needs a non-word character and "s" is one of the
     word characters — so the row of golf carts sailed through a rule written
     specifically to stop it. */
  String.raw`\b(golf carts?|golf buggys?|go[- ]?karts?|karts?|atvs?|quad bikes?|motorcycles?|motorbikes?|scooters?|bicycles?|bikes?|caravans?|campers?|limousines?|hearses?|toy cars?|model cars?|miniature)\b`,
  "i",
);

/**
 * Must actually contain a car.
 *
 * A positive requirement rather than another blacklist. The picnic photograph
 * that got through the first run described people and a hamper and mentioned no
 * vehicle at all — no list of rejects would have caught it, because there was
 * nothing wrong in it to name.
 */
export const IS_A_CAR = new RegExp(
  String.raw`\b(cars?|suvs?|sedans?|saloons?|hatchbacks?|hatch|vans?|minivans?|mpvs?|crossovers?|wagons?|estates?|coupes?|vehicles?|automobiles?|4x4|4wd|awd)\b`,
  "i",
);

/** A museum piece is not something you hire for the weekend. */
export const WRONG_ERA = new RegExp(
  String.raw`\b(vintage|classic|antique|retro|old[- ]fashioned|rusty|rusted|abandoned|wreck|wrecked|crashed|junkyard|scrap|1950s|1960s|1970s|oldtimer)\b`,
  "i",
);

/**
 * Marques that would contradict the model printed on the card.
 *
 * Only applied when the record actually names a marque. A photograph whose
 * description says BMW cannot sit above 「Toyota Altis」 — the two are on the
 * same card, eight millimetres apart, and the reader will believe the picture.
 */
const MARQUES = [
  "toyota", "lexus", "nissan", "honda", "mazda", "mitsubishi", "subaru", "suzuki",
  "bmw", "audi", "mercedes", "benz", "porsche", "volkswagen", "vw", "volvo",
  "ford", "chevrolet", "chevy", "dodge", "jeep", "tesla", "hyundai", "kia",
  "peugeot", "renault", "citroen", "fiat", "skoda", "opel", "vauxhall",
  "infiniti", "acura", "datsun", "saab", "alfa romeo", "lancia", "dacia",
  "ferrari", "lamborghini", "maserati", "bentley", "rolls", "jaguar",
  "land rover", "range rover", "cadillac", "buick", "chrysler", "genesis",
];

/**
 * Does this description name a marque other than the one the card claims?
 *
 * `wanted` is null for the aggregator cards, which name no model at all — those
 * may show any car, because the card is not making a claim about one.
 */
export function marqueConflict(alt, wanted) {
  if (!wanted) return false;
  for (const m of MARQUES) {
    if (m === wanted) continue;
    /* Word boundaries. Without them "seat" matches "seats" and "mini" matches
       "minivan", and the picker rejects the entire corpus while looking exactly
       like a supply problem. That failure has already cost this project one
       afternoon — see the note in stock-queries.mjs. `seat` and `mini` are out
       of the list above for the same reason: as marques they are rare, and as
       substrings they are everywhere. */
    if (new RegExp(String.raw`\b` + m.replace(/\s/g, String.raw`\s`) + String.raw`\b`, "i").test(alt)) {
      return true;
    }
  }
  return false;
}

/** Model names that identify a car without using the word "car". */
const MODELS =
  /\b(yaris|auris|corolla|altis|camry|vios|rav4|sienta|prius|kicks|sentra|juke|civic|accord|fit|jazz|mazda3|cx-5|golf|polo|passat|focus|fiesta|picanto|swift|vitara|kona|tucson|santa fe|sportage|sorento|outlander|asx|forester|impreza|xv)\b/i;

/**
 * Why this photograph cannot be used — or null when it can.
 *
 * One predicate rather than six checks copied into the picker, so the rules can
 * be unit-tested against the descriptions that actually got through the first
 * run. Every one of those is in scripts/vehicle-queries.test.mjs.
 */
/**
 * Pexels' own slug for a photo, as words.
 *
 * A second, independent description of the same frame — and often a better one
 * about marque, because the uploader wrote it. Three photographs passed every
 * check on their alt text ("A silver SUV parked on a foggy countryside road")
 * and were titled `suzuki-subaru-outback-review`, `a-red-honda-civic-hatchback`
 * and `blue-vauxhall-corsa`. The alt was not wrong, just silent.
 */
export function slugWords(url) {
  return (url ?? "")
    .replace("https://www.pexels.com/photo/", "")
    .replace(/-?\d*\/?$/, "")
    .replace(/-/g, " ");
}

export function rejectReason(alt, marque, cls, url) {
  if (!alt) return "no description";
  if (marqueConflict(slugWords(url), marque)) return "title contradicts the model";
  /* The positive check accepts either the word for the object or the name of a
     model. "A gray Toyota Auris parked outdoors" contains neither "car" nor
     "hatchback" and is a perfectly good photograph of one. */
  if (!IS_A_CAR.test(alt) && !MODELS.test(alt)) return "no vehicle in the description";
  if (NOT_A_CAR.test(alt)) return "detail or interior";
  if (WRONG_JOB.test(alt)) return "wrong job";
  if (WRONG_VEHICLE.test(alt)) return "wrong kind of vehicle";
  if (WRONG_ERA.test(alt)) return "wrong era";
  if (marqueConflict(alt, marque)) return "contradicts the model on the card";
  /* Last, because it is the most specific and the most expensive to reason
     about: does the frame actually contain the KIND of car the card promises?
     A night-time car park is a photograph of cars, passes every rule above,
     and shows nothing like the 七人座 printed underneath it. */
  const need = cls ? CLASSES[cls]?.requires : null;
  if (need && !need.test(alt)) return `not a ${cls}`;
  return null;
}
