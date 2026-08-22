import type { LatLng } from "../lib/geo";

/**
 * Where the map home opens before anybody has been asked for permission.
 *
 * A demo cannot depend on `navigator.geolocation`. The laptop it is shown on may
 * have no GPS, the room may have no signal, the browser may be set to deny, and
 * the request can simply time out — and any one of those turns the first screen
 * of the product into a spinner in front of the person you are showing it to.
 *
 * So the map opens here, immediately, with no permission prompt. Real location
 * is a button the traveller presses, and pressing it is what asks the browser.
 *
 * One constant, in one file. Scattering the pair of numbers into a component is
 * how a demo ends up centred on two different places on two different screens.
 */
export const DEFAULT_DEMO_LOCATION: LatLng = {
  lat: 24.9714202,
  lng: 121.5420377,
};

/**
 * The radius drawn around the dot when the position is the demo one.
 *
 * A real fix reports `coords.accuracy` and the circle is drawn from it. This is
 * not a real fix, so the circle is a visual hint at a plausible urban GPS
 * accuracy and nothing on screen ever claims a figure — printing 「精準至 1 公尺」
 * over a hard-coded coordinate would be the one number on the map that is a lie.
 */
export const DEMO_ACCURACY_M = 45;

/** What the chip above the map says when the position is the demo one. */
export const DEFAULT_AREA_LABEL = "新店附近";
