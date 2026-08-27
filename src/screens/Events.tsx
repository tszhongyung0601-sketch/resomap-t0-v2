import { BY_DEST } from "../data/destinations";
import { EVENTS, EVENT_DISCLOSURE, EVENT_KINDS, type LocalEvent } from "../data/events";
import { eventCredit } from "../data/eventCredits";
import { EventImage } from "../components/Cover";
import { Note, Screen, Section, TopBar } from "../components/ui";
import { runText, statusText } from "../lib/eventDate";
import { distance, km } from "../lib/geo";
import { useHere } from "../lib/here";
import { useNav } from "../nav";

/**
 * Every event, grouped by city.
 *
 * The rail on the home screen answers 「附近」, which by design means most of
 * these are never on it: a festival in 台南 is not nearby anything the demo
 * opens on, and pretending otherwise would make the word meaningless. But a
 * feature where two thirds of the data is unreachable is a feature that only
 * exists for people standing in the right county, so the rail ends in a tile
 * that leads here — exactly as 有故事的地方 ends in 看全部導覽.
 *
 * Sorted by city, then by date within it. Not by distance: somebody who came
 * here is no longer asking 「附近」 — they got that answer already and wanted the
 * rest — and a flat 17-row list ordered by kilometres is harder to read than
 * eight cities in a fixed order.
 */
export function Events() {
  const nav = useNav();
  const fix = useHere();

  /* Cities in the order the destination list already puts them, which is the
     order the rest of the app uses. Building it from the events rather than
     from DESTINATIONS means a city with nothing on simply is not a heading. */
  const cities: { id: string; name: string; events: LocalEvent[] }[] = [];
  for (const e of EVENTS) {
    let group = cities.find((c) => c.id === e.destId);
    if (!group) {
      group = { id: e.destId, name: BY_DEST[e.destId]?.name ?? e.destId, events: [] };
      cities.push(group);
    }
    group.events.push(e);
  }
  for (const c of cities) {
    c.events.sort((a, b) => a.from[0] - b.from[0] || a.from[1] - b.from[1]);
  }

  return (
    <Screen>
      <TopBar title="活動與慶典" onBack={() => nav.back()} />

      <p className="px-5 pt-1 text-[13px] leading-relaxed text-ink-3">
        {EVENT_DISCLOSURE}
        地點與座標是真的，這樣「離你多遠」才算得出來。
      </p>

      {cities.map((c) => (
        <Section key={c.id} title={c.name} tight>
          <div className="space-y-2 px-5">
            {c.events.map((e) => (
              <EventRow key={e.id} event={e} metres={distance(fix.at, e)} />
            ))}
          </div>
        </Section>
      ))}

      <Note>
        活動內容、日期與費用都是虛構的示範資料，照片是圖庫示意圖。每一場的攝影者列在該場的頁面上。
      </Note>
      <div className="h-24 shrink-0" />
    </Screen>
  );
}

/** A wide row rather than a rail card: a list is read down, not across. */
function EventRow({ event: e, metres }: { event: LocalEvent; metres: number }) {
  const nav = useNav();
  const kind = EVENT_KINDS[e.kind];
  const status = statusText(e);

  return (
    <button
      onClick={() => nav.go({ k: "event", id: e.id })}
      className="flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left transition active:bg-surface-2"
    >
      <EventImage
        id={e.id}
        emoji={kind.emoji}
        tint={e.tint}
        alt={eventCredit(e.id)?.alt}
        height={56}
        radius={10}
        className="w-[76px] shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-bold text-ink">{e.name}</div>
        <div className="mt-0.5 truncate text-[12px] text-ink-3">
          {kind.label} · {e.area}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="num text-[12px] font-semibold text-ink-2">{runText(e)}</span>
          {status && (
            <span className="shrink-0 rounded-md bg-brand-wash px-1.5 py-0.5 text-[11px] font-semibold text-brand">
              {status}
            </span>
          )}
        </div>
      </div>
      <span className="num shrink-0 text-[11.5px] text-ink-3">{km(metres)}</span>
    </button>
  );
}
