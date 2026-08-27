import { useState } from "react";
import { localEvent, EVENT_KINDS, EVENT_DISCLOSURE } from "../data/events";
import { BY_DEST } from "../data/destinations";
import { MapCredit, MapView } from "../components/MapView";
import { AddToTrip } from "../components/AddToTrip";
import { Button, Note, Screen, Section, TopBar } from "../components/ui";
import { EventCredit, EventImage } from "../components/Cover";
import { eventCredit } from "../data/eventCredits";
import { daysMatching, runText, statusText } from "../lib/eventDate";
import { describe, resolveDate, useDaily } from "../lib/weather";
import { openPlaceDirections } from "../lib/maps";
import { focusTrip } from "../lib/trip";
import { useNav } from "../nav";

/**
 * One event, in full — and invented from end to end.
 *
 * The page has a harder job than any other detail screen in the app, because
 * everything about its shape says "this is a real thing you could go to": a
 * title, a date, an opening time, a map with a pin on a real street. That is
 * exactly the right shape for the feature and exactly the reason the disclosure
 * cannot be a footnote. It sits directly under the title, before the dates,
 * where somebody deciding whether to go will read it before they decide.
 *
 * 加入行程 is the one control in this app that can be genuinely unavailable
 * rather than merely disabled. Everything else — a restaurant, a hire car, a
 * guide — can go on any day of any trip. A festival that runs on the 16th
 * cannot go on the 18th, and an itinerary containing a stop nobody could attend
 * is worse than no button. So when no day lines up the button is replaced by
 * the reason, which names both sides: what the event's dates are, and what the
 * trip's are.
 */
export function Event({ id }: { id: string }) {
  const nav = useNav();
  const [adding, setAdding] = useState(false);

  const e = localEvent(id);
  if (!e) return null;

  const kind = EVENT_KINDS[e.kind];
  const city = BY_DEST[e.destId]?.name;
  const trip = focusTrip(nav.trips) ?? null;
  /* Which days of the current trip this could go on. Empty is a real answer
     the page prints, not a state to hide behind a greyed-out control. */
  const fits = trip ? daysMatching(e, trip.days) : [];
  const status = statusText(e);

  return (
    <Screen>
      <TopBar title={kind.label} onBack={() => nav.back()} />

      <EventImage
        id={e.id}
        emoji={kind.emoji}
        tint={e.tint}
        alt={eventCredit(e.id)?.alt}
        size="hero"
        height={180}
        radius={0}
        className="w-full"
      />
      <EventCredit eventId={e.id} />

      <div className="px-5 pt-3">
        <h1 className="text-[21px] font-bold leading-tight text-ink">{e.name}</h1>
        <div className="mt-1 text-[13.5px] text-ink-3">
          {e.area}
          {city ? ` · ${city}` : ""}
        </div>

        {/* Before the dates, not after the map. Somebody scrolling this page is
            deciding whether to go; the one thing they must know first is that
            there is nothing to go to. */}
        <p className="mt-3 rounded-2xl bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-ink-2">
          {EVENT_DISCLOSURE}
          <br />
          地點與座標是真的，活動不是。
        </p>

        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{e.hook}</p>
      </div>

      <Section title="時間與費用" tight>
        <div className="mx-5 divide-y divide-line rounded-2xl bg-surface">
          <Fact label="日期" value={runText(e)} note={status ?? undefined} />
          <Fact label="開始" value={e.at} />
          {/* No price field, no 「請洽主辦」 — free is a fact worth printing,
              and printing it is what keeps the field from reading as missing. */}
          <Fact label="費用" value={e.ticket ?? "免費"} />
          <Fact label="建議停留" value={`${e.stayMin} 分鐘`} />
          <Fact label="場地" value={e.indoor ? "室內" : "戶外"} />
        </div>

        <p className="mt-3 px-5 text-[14px] leading-relaxed text-ink-2">{e.about}</p>

        {/* Only outdoors, and only when there is a real answer. An indoor
            market does not care what the sky is doing, and a forecast printed
            beside it is a number taking up room without changing a decision. */}
        {!e.indoor && <OutdoorSky lat={e.lat} lng={e.lng} from={e.from} />}
      </Section>

      <Section title="地點" tight>
        <div className="relative mx-5 h-44 overflow-hidden rounded-2xl">
          <MapView
            pins={[
              {
                poi: {
                  id: e.id,
                  name: e.name,
                  area: e.area,
                  lat: e.lat,
                  lng: e.lng,
                  emoji: kind.emoji,
                  tint: e.tint,
                },
              },
            ]}
            centre={[e.lat, e.lng]}
            zoom={14}
          />
          <MapCredit />
        </div>
      </Section>

      <Note>
        活動內容、日期與費用都是虛構的示範資料。真實座標只是為了讓「附近」這件事在
        Demo 裡能真的算距離。
      </Note>
      <div className="h-8 shrink-0" />

      <div className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-line bg-bg/95 px-5 pb-5 pt-3 backdrop-blur">
        <div className="space-y-2">
          {/* Said, not enforced. The rule the traveller asked for is about
              dates, and a 新店 market genuinely can go on a day of a 花蓮 trip
              if that is what somebody wants — they may be flying home that
              evening. But an itinerary that quietly puts two cities in one
              afternoon is the kind of plan that only reveals itself at the
              station, so the mismatch is printed before the button rather
              than discovered after it. */}
          {trip && fits.length > 0 && e.destId !== trip.destId && (
            <p className="rounded-2xl bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-ink-2">
              日期對得上，但這場在{city}，而「{trip.title}」是{BY_DEST[trip.destId]?.name ?? "別的地方"}的行程。
            </p>
          )}

          {trip && fits.length > 0 && (
            <Button onClick={() => setAdding(true)}>加入行程</Button>
          )}

          {/* The reason, not a dead button. It names both sets of dates,
              because 「加不進去」 without them is an accusation the traveller
              cannot check. */}
          {trip && fits.length === 0 && (
            <p className="rounded-2xl bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-ink-2">
              這場是 {runText(e)}，「{trip.title}」是 {trip.dates}，日期對不上，
              所以沒辦法排進去。
            </p>
          )}

          {!trip && (
            <Button variant="secondary" onClick={() => nav.go({ k: "create", destId: e.destId })}>
              先建立一趟行程
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() =>
              openPlaceDirections({ name: e.name, area: e.area, lat: e.lat, lng: e.lng })
            }
          >
            導航到活動地點
          </Button>
        </div>
      </div>

      {adding && trip && (
        <AddToTrip
          target={{ kind: "event", eventId: e.id }}
          trip={trip}
          days={fits.map((d) => d.n)}
          onClose={() => setAdding(false)}
        />
      )}
    </Screen>
  );
}

/**
 * What the sky is actually doing on the first day of an outdoor event.
 *
 * The one true number on a page of invented ones, and it is worth having for
 * exactly that reason: whether to go and stand in a field for two hours is a
 * real decision, and it is the one thing here the app can answer honestly.
 *
 * Renders nothing when the date is outside what the API covers, which for a
 * festival eleven months out is most of the time. That is the correct empty
 * state — 「我們不知道」 said by not saying anything.
 */
function OutdoorSky({
  lat,
  lng,
  from,
}: {
  lat: number;
  lng: number;
  from: [number, number];
}) {
  const daily = useDaily({ lat, lng });
  const iso = resolveDate(`${from[0]} 月 ${from[1]} 日`);
  const sky = daily && iso ? daily.get(iso) : null;
  const look = sky ? describe(sky.code) : null;
  if (!sky || !look) return null;

  return (
    <div className="mx-5 mt-3 flex items-center gap-2 rounded-2xl bg-surface px-3.5 py-3">
      <span className="text-[18px]" aria-hidden>
        {look.icon}
      </span>
      <span className="text-[13.5px] text-ink-2">
        {from[0]}/{from[1]} 這天{look.text}，
        <span className="num">
          {Math.round(sky.maxC)}° / {Math.round(sky.minC)}°
        </span>
        {sky.popPct !== undefined && <span className="num">・降雨 {sky.popPct}%</span>}
      </span>
      <span className="ml-auto shrink-0 rounded bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-3">
        {sky.forecast ? "預報" : "實測"}
      </span>
    </div>
  );
}

/** A label on the left, its value on the right. Local, like Rental's. */
function Fact({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-baseline gap-3 px-4 py-3">
      <span className="shrink-0 text-[13px] text-ink-3">{label}</span>
      <span className="ml-auto min-w-0 text-right text-[14px] font-semibold text-ink">
        <span className="num">{value}</span>
        {note && <span className="ml-1.5 text-[12px] font-semibold text-brand">{note}</span>}
      </span>
    </div>
  );
}
