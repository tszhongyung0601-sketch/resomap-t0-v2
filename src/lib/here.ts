import { useSyncExternalStore } from "react";
import { DEFAULT_DEMO_LOCATION, DEMO_ACCURACY_M } from "../data/location";
import type { Fix } from "./geolocation";

/**
 * Where the app currently thinks the traveller is.
 *
 * The map home used to hold this in component state, which was fine while it
 * was the only thing that cared. It stopped being fine the moment the section
 * directly beneath it — 有故事的地方 — started answering a different question
 * from the map: a map saying 「新店附近 · 7 個可以聽」 above a rail leading with
 * 七星潭 is one screen giving two answers about where you are.
 *
 * So the position lives here, in the same module-store shape as `saved.ts` and
 * `track.ts`, and pressing 定位 moves the map *and* re-sorts the rail under it.
 *
 * Not persisted, deliberately. A remembered position is a stale position: the
 * demo opens in 新店 every time, which is the one thing about it that should be
 * predictable, and a real fix is only ever one tap old.
 */

let state: Fix = {
  at: DEFAULT_DEMO_LOCATION,
  accuracy: DEMO_ACCURACY_M,
  real: false,
};

const watchers = new Set<() => void>();

export function setHere(fix: Fix) {
  state = fix;
  for (const fn of watchers) fn();
}

function subscribe(fn: () => void) {
  watchers.add(fn);
  return () => {
    watchers.delete(fn);
  };
}

/* The snapshot is the module object itself. Returning a fresh one would hand
   React a new reference on every call and re-render for ever. */
const snapshot = () => state;

export function useHere(): Fix {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** For callers outside React — the ranking helpers, mostly. */
export const here = () => state;

/** The demo reset puts the traveller back in 新店 with everything else. */
export const resetHere = () =>
  setHere({ at: DEFAULT_DEMO_LOCATION, accuracy: DEMO_ACCURACY_M, real: false });
