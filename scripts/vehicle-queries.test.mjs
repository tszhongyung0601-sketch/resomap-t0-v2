import { classOf, marqueOf, rejectReason, slugWords } from "./vehicle-queries.mjs";

/**
 * The descriptions that got through the first run, and the ones that should.
 *
 * Not a framework — `node scripts/vehicle-queries.test.mjs` and read the
 * output. Every REJECT line here is a photograph that was actually fetched and
 * actually wrong, which is the only reason these rules exist in this shape.
 */
const CASES = [
  /* --- must be rejected: all six of these shipped in the first run --- */
  ["A red Hyundai SUV parked outdoors on a snowy day", "nissan", true],
  ["A green Suzuki 4x4 parked on a sunlit urban street with art", "toyota", true],
  ["A family prepares for a picnic outdoors in Portugal, unpacking", null, true],
  ["Multiple golf carts parked in a row on a golf course under", null, true],
  ["Detailed shot of the Nissan logo on a car grille grid", "nissan", true],
  ["Toyota Yaris rally car leads a motorsport event on a forest road", "toyota", true],
  ["Close-up of a hand handing over car keys, signifying purchase", null, true],
  ["Vintage white Volkswagen Golf Mk2 parked outdoors", "toyota", true],
  ["Delivery person carrying a package from a white van", null, true],
  ["Black BMW and white Audi luxury sedans parked outdoors", "toyota", true],
  ["Close-up of a Toyota steering wheel inside a stylish car", "toyota", true],

  /* --- must be accepted --- */
  ["Modern black hatchback car parked in a spacious outdoor lot", "toyota", false],
  ["A gray Toyota Auris parked outdoors with hills and cloudy sky", "toyota", false],
  ["Silver SUV parked on a curve in the countryside", "toyota", false],
  ["Side view of a silver sedan parked in front of a red brick wall", "toyota", false],
  ["Modern silver MPV driving through a leafy urban street", "toyota", false],
  ["White SUV parked under shady trees in a sunny parking lot", "toyota", false],
  ["Overhead shot of neatly parked colorful cars in a large lot", null, false],
  ["A red Hyundai SUV parked outdoors on a snowy day", null, false],
];

let bad = 0;
for (const [alt, marque, shouldReject] of CASES) {
  const why = rejectReason(alt, marque);
  const rejected = why !== null;
  const ok = rejected === shouldReject;
  if (!ok) bad++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${rejected ? "REJECT" : "accept"} ${why ? `(${why})`.padEnd(38) : "".padEnd(38)} ${alt.slice(0, 52)}`,
  );
}

const CLASSES = [
  ["Toyota Yaris", "hatchback", "toyota"],
  ["Toyota Altis", "sedan", "toyota"],
  ["Toyota RAV4", "suv", "toyota"],
  ["Toyota Corolla Cross", "crossover", "toyota"],
  ["Nissan Kicks", "crossover", "nissan"],
  ["Toyota Sienta", "mpv", "toyota"],
  ["小型車 起", "fleet", null],
];
for (const [model, cls, marque] of CLASSES) {
  const ok = classOf(model) === cls && marqueOf(model) === marque;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"} ${model.padEnd(22)} ${classOf(model).padEnd(10)} ${marqueOf(model)}`);
}

console.log(bad === 0 ? "\nall good" : `\n${bad} FAILING`);
if (bad) process.exitCode = 1;

/* The three whose alt text was silent about the marque and whose Pexels title
   was not. Added after they shipped. */
const SLUGS = [
  ["https://www.pexels.com/photo/suzuki-subaru-outback-review-27383864/", "nissan", true],
  ["https://www.pexels.com/photo/a-red-honda-civic-hatchback-parked-12821565/", "toyota", true],
  ["https://www.pexels.com/photo/blue-vauxhall-corsa-17078606/", "toyota", true],
  ["https://www.pexels.com/photo/modern-black-hatchback-car-parked-33326195/", "toyota", false],
  ["https://www.pexels.com/photo/suzuki-subaru-outback-review-27383864/", null, false],
];
let slugBad = 0;
for (const [url, marque, shouldReject] of SLUGS) {
  const why = rejectReason("A silver SUV parked on a road", marque, null, url);
  const ok = (why !== null) === shouldReject;
  if (!ok) slugBad++;
  console.log(`${ok ? "ok  " : "FAIL"} ${(why ?? "accept").padEnd(30)} ${slugWords(url).slice(0, 44)}`);
}
if (slugBad) {
  console.log(`\n${slugBad} SLUG FAILING`);
  process.exitCode = 1;
}
