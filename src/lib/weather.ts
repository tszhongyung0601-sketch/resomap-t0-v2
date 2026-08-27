import { useEffect, useState } from "react";
import type { LatLng } from "./geo";

/**
 * The weather, from Open-Meteo.
 *
 * The first thing in this app that reaches the network for data rather than for
 * a picture, and the reason it is allowed to is that fake weather is worse than
 * no weather. Every other number here can be demo data and lose nothing: a
 * fabricated ticket price is still a fair illustration of what a ticket price
 * looks like. Weather is the one number a person can check by turning their
 * head, so a demo showing 晴天 during a downpour is not illustrating anything —
 * it is being wrong in front of the audience.
 *
 * Open-Meteo needs no key and no account, is CORS-enabled, and is free for
 * non-commercial use — which is what lets a static page on GitHub Pages ask it
 * anything at all. There is still no backend.
 *
 * **Nothing is ever invented.** Every failure — offline, blocked, rate-limited,
 * a shape we did not expect — resolves to `null`, and every caller renders
 * nothing at all rather than a placeholder. A dash where the temperature should
 * be is a fact ("we do not know"); 25° when we do not know is a lie.
 */

const API = "https://api.open-meteo.com/v1/forecast";

/* Open-Meteo serves the nearest grid cell, so two travellers 200m apart get the
   same answer anyway. Rounding the key to ~1km stops a map drag from firing a
   request per frame, and makes the cache actually hit. */
const round = (n: number) => Math.round(n * 100) / 100;

/* ---------------------------------------------------------- WMO 4677 codes */

/**
 * What a weather code means, in the two forms a card can use.
 *
 * WMO 4677 is the published table Open-Meteo reports against, so this is a
 * translation rather than an interpretation. Codes are grouped where the
 * difference does not survive being shown at 12px: 「小雨」 and 「中雨」 are worth
 * separating, 「slight」 and 「moderate drizzle」 are not.
 */
const CODES: Record<number, { text: string; icon: string; night?: string }> = {
  0: { text: "晴", icon: "☀️", night: "🌙" },
  1: { text: "晴時多雲", icon: "🌤️", night: "🌙" },
  2: { text: "多雲", icon: "⛅", night: "☁️" },
  3: { text: "陰", icon: "☁️" },
  45: { text: "有霧", icon: "🌫️" },
  48: { text: "霧淞", icon: "🌫️" },
  51: { text: "毛毛雨", icon: "🌦️" },
  53: { text: "毛毛雨", icon: "🌦️" },
  55: { text: "毛毛雨", icon: "🌦️" },
  56: { text: "凍雨", icon: "🌧️" },
  57: { text: "凍雨", icon: "🌧️" },
  61: { text: "小雨", icon: "🌦️" },
  63: { text: "雨", icon: "🌧️" },
  65: { text: "大雨", icon: "🌧️" },
  66: { text: "凍雨", icon: "🌧️" },
  67: { text: "凍雨", icon: "🌧️" },
  71: { text: "小雪", icon: "🌨️" },
  73: { text: "雪", icon: "🌨️" },
  75: { text: "大雪", icon: "❄️" },
  77: { text: "霰", icon: "🌨️" },
  80: { text: "陣雨", icon: "🌦️" },
  81: { text: "陣雨", icon: "🌧️" },
  82: { text: "大陣雨", icon: "🌧️" },
  85: { text: "陣雪", icon: "🌨️" },
  86: { text: "大陣雪", icon: "❄️" },
  95: { text: "雷雨", icon: "⛈️" },
  96: { text: "雷雨冰雹", icon: "⛈️" },
  99: { text: "雷雨冰雹", icon: "⛈️" },
};

/** 「⛅ 多雲」, or null for a code outside the table — which we do not guess at. */
export function describe(code: number, isDay = true): { text: string; icon: string } | null {
  const c = CODES[code];
  if (!c) return null;
  return { text: c.text, icon: !isDay && c.night ? c.night : c.icon };
}

/* -------------------------------------------------------------- right now */

export interface NowWeather {
  tempC: number;
  code: number;
  isDay: boolean;
}

/**
 * A tiny cache, so the four screens that ask about the same place ask once.
 *
 * Keyed by rounded coordinate. Not persisted: a remembered temperature is a
 * wrong temperature, and the whole point of this module is not being wrong.
 */
const nowCache = new Map<string, NowWeather>();
/* One request per place even when four components mount together. Without
   this the three day cards on a trip all miss the cache in the same tick and
   each opens its own connection for the identical answer. */
const nowInflight = new Map<string, Promise<NowWeather | null>>();

/** The temperature where somebody is standing, or null when we cannot say. */
export function useNow(at: LatLng | null): NowWeather | null {
  /* Numbers, not the object. Callers are free to build a fresh `{lat, lng}` on
     every render, and an object in the dependency list would make that a
     request per render. */
  const lat = at ? round(at.lat) : null;
  const lng = at ? round(at.lng) : null;
  const key = lat === null ? "" : `${lat},${lng}`;
  const [data, setData] = useState<NowWeather | null>(() => nowCache.get(key) ?? null);

  useEffect(() => {
    if (lat === null || lng === null) return;
    const cached = nowCache.get(key);
    if (cached) {
      setData(cached);
      return;
    }
    /* Aborted on unmount and on a position change, so a slow answer for the old
       place cannot land on top of the new one. */
    let live = true;
    const url =
      `${API}?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,weather_code,is_day&timezone=auto`;

    let job = nowInflight.get(key);
    if (!job) {
      job = fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((x: unknown) => {
          const parsed = readNow(x);
          if (parsed) nowCache.set(key, parsed);
          return parsed;
        })
        /* Offline, blocked, rate-limited, garbage — all the same answer. The
           screen renders nothing and says nothing, which is correct: we do not
           know what the weather is. */
        .catch(() => null)
        .finally(() => nowInflight.delete(key));
      nowInflight.set(key, job);
    }
    /* Not aborted on unmount: the request is shared, so cancelling it for one
       component would cancel it for the others. `live` drops the answer
       instead, and the cache keeps the work. */
    void job.then((parsed) => {
      if (live && parsed) setData(parsed);
    });

    return () => {
      live = false;
    };
  }, [key, lat, lng]);

  return data;
}

/** Believe the response only as far as it actually type-checks. */
function readNow(j: unknown): NowWeather | null {
  if (!j || typeof j !== "object") return null;
  const cur = (j as { current?: unknown }).current;
  if (!cur || typeof cur !== "object") return null;
  const c = cur as Record<string, unknown>;
  if (typeof c.temperature_2m !== "number" || typeof c.weather_code !== "number") return null;
  return {
    tempC: c.temperature_2m,
    code: c.weather_code,
    /* Open-Meteo sends 1/0 rather than a boolean. Absent means day, because a
       missing flag should not turn a sunny card into a moon. */
    isDay: c.is_day !== 0,
  };
}

/* ------------------------------------------------------------ day by day */

export interface DayWeather {
  /** "2026-08-15" */
  date: string;
  code: number;
  maxC: number;
  minC: number;
  /** Only meaningful on a day that has not happened. */
  popPct?: number;
  /** False once the day is in the past — then these are observations. */
  forecast: boolean;
}

const dailyCache = new Map<string, Map<string, DayWeather>>();
const dailyInflight = new Map<string, Promise<Map<string, DayWeather> | null>>();

/**
 * Every day this API can speak about for one place, keyed by ISO date.
 *
 * `past_days=92` is not padding. The demo's itineraries carry a month and a day
 * and no year — 「8 月 15 日」 — so on any given afternoon they may sit a fortnight
 * behind the real calendar, and a window that only looked forward would have
 * left this feature permanently blank on exactly the trips it ships with. Asking
 * for the three months behind as well means those days come back as what they
 * genuinely are: measurements. The caller says which.
 *
 * One request per place rather than one per day: sixteen days of a five-day trip
 * is the same response, and the trip screen renders five rows from it.
 */
export function useDaily(at: LatLng | null): Map<string, DayWeather> | null {
  const lat = at ? round(at.lat) : null;
  const lng = at ? round(at.lng) : null;
  const key = lat === null ? "" : `${lat},${lng}`;
  const [data, setData] = useState<Map<string, DayWeather> | null>(
    () => dailyCache.get(key) ?? null,
  );

  useEffect(() => {
    if (lat === null || lng === null) return;
    const cached = dailyCache.get(key);
    if (cached) {
      setData(cached);
      return;
    }
    let live = true;
    const url =
      `${API}?latitude=${lat}&longitude=${lng}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&past_days=92&forecast_days=16&timezone=auto`;

    let job = dailyInflight.get(key);
    if (!job) {
      job = fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((x: unknown) => {
          const parsed = readDaily(x);
          if (parsed) dailyCache.set(key, parsed);
          return parsed;
        })
        .catch(() => null)
        .finally(() => dailyInflight.delete(key));
      dailyInflight.set(key, job);
    }
    void job.then((parsed) => {
      if (live && parsed) setData(parsed);
    });

    return () => {
      live = false;
    };
  }, [key, lat, lng]);

  return data;
}

function readDaily(j: unknown): Map<string, DayWeather> | null {
  if (!j || typeof j !== "object") return null;
  const d = (j as { daily?: unknown }).daily;
  if (!d || typeof d !== "object") return null;
  const o = d as Record<string, unknown>;
  const time = o.time;
  const code = o.weather_code;
  const max = o.temperature_2m_max;
  const min = o.temperature_2m_min;
  if (!Array.isArray(time) || !Array.isArray(code) || !Array.isArray(max) || !Array.isArray(min)) {
    return null;
  }
  const pop = Array.isArray(o.precipitation_probability_max) ? o.precipitation_probability_max : [];

  /* Today in the venue's own timezone, which is what `timezone=auto` already
     aligned the series to. Comparing ISO date strings is enough — they sort and
     compare lexicographically, and no timezone maths can go wrong in a string
     equality test. */
  const today = isoToday();

  const out = new Map<string, DayWeather>();
  for (let i = 0; i < time.length; i++) {
    const day = time[i];
    if (typeof day !== "string") continue;
    if (typeof code[i] !== "number" || typeof max[i] !== "number" || typeof min[i] !== "number") {
      continue;
    }
    const forecast = day >= today;
    out.set(day, {
      date: day,
      code: code[i] as number,
      maxC: max[i] as number,
      minC: min[i] as number,
      /* A probability attached to a day that already happened is not a
         probability. Dropped rather than shown as 100%. */
      popPct: forecast && typeof pop[i] === "number" ? (pop[i] as number) : undefined,
      forecast,
    });
  }
  return out.size > 0 ? out : null;
}

/** Local calendar date as "YYYY-MM-DD". */
export function isoToday(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * 「8 月 20 日」 → the nearest 20 August there is.
 *
 * The fixtures carry a month and a day and no year, which is right for a demo
 * that has to still make sense next spring — but the weather API deals in real
 * dates. Nearest rather than next, because the trips ship dated a fortnight ago
 * and the honest answer for those days is a measurement, not next year's blank.
 *
 * Returns null for anything that is not a date, rather than a guess.
 */
export function resolveDate(text: string, now = new Date()): string | null {
  const m = /(\d{1,2})\s*月\s*(\d{1,2})\s*日/.exec(text);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return nearestOccurrence(month, day, now);
}

/** The occurrence of month/day closest to `now`, looking one year each way. */
export function nearestOccurrence(month: number, day: number, now = new Date()): string | null {
  const y = now.getFullYear();
  let best: Date | null = null;
  for (const year of [y - 1, y, y + 1]) {
    const d = new Date(year, month - 1, day);
    /* Rolled over — 2 月 30 日 becomes 3 月 2 日 — so this is not that date at
       all, and the right answer is that there is no such day. */
    if (d.getMonth() !== month - 1 || d.getDate() !== day) continue;
    if (!best || Math.abs(+d - +now) < Math.abs(+best - +now)) best = d;
  }
  return best ? isoToday(best) : null;
}
