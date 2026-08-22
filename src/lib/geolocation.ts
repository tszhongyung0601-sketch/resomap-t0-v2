import type { LatLng } from "./geo";

/**
 * The browser's own position, asked for only when somebody asks for it.
 *
 * `getCurrentPosition` is never called on mount. A permission prompt that
 * appears the instant an app opens is the prompt everybody denies, and on the
 * laptop a demo is shown from it is a prompt that can hang for as long as the
 * timeout allows with the first screen of the product behind it. The map opens
 * on `DEFAULT_DEMO_LOCATION` and the locate button is what asks.
 *
 * Every failure resolves rather than throws. A caller that has to wrap this in
 * try/catch to keep a map on screen will eventually forget to, and the failure
 * mode of a location feature must never be a blank page.
 */

export interface Fix {
  at: LatLng;
  /** Metres, from `coords.accuracy`. The circle on the map is drawn from it. */
  accuracy: number;
  /** True for a real browser fix, false for the demo position. */
  real: boolean;
}

export type LocateFailure =
  | "unsupported"
  | "denied"
  | "unavailable"
  | "timeout";

export type LocateResult = { ok: true; fix: Fix } | { ok: false; reason: LocateFailure };

/**
 * Sensible for a person standing still with a phone in their hand.
 *
 * `timeout` is finite on purpose: an indoor fix can take longer than anybody
 * will wait, and a button that spins forever is worse than one that says it
 * could not find you. `maximumAge` accepts a fix from the last half minute,
 * because pressing the button twice in ten seconds should not re-run the radio.
 */
const OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 30000,
};

/** What went wrong, in the traveller's terms. One sentence, no error codes. */
export const FAILURE_MESSAGE: Record<LocateFailure, string> = {
  unsupported: "這個瀏覽器不支援定位，已顯示預設位置附近景點。",
  denied: "目前無法取得定位，已顯示預設位置附近景點。",
  unavailable: "目前無法取得定位，已顯示預設位置附近景點。",
  timeout: "定位花的時間太久，已顯示預設位置附近景點。",
};

export function locate(): Promise<LocateResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: "unsupported" });
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          ok: true,
          fix: {
            at: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            /* Chrome reports accuracy in metres and always sets it, but the
               spec allows a large number and some desktops return one in the
               kilometres. Clamped, because a 5 km circle drawn over 新店 hides
               every pin underneath it. */
            accuracy: Math.min(Math.max(pos.coords.accuracy || 30, 8), 500),
            real: true,
          },
        }),
      (err) =>
        resolve({
          ok: false,
          reason:
            err.code === err.PERMISSION_DENIED
              ? "denied"
              : err.code === err.TIMEOUT
                ? "timeout"
                : "unavailable",
        }),
      OPTIONS,
    );
  });
}
