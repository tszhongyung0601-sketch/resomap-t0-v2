import { useState } from "react";
import { poi } from "../data";
import { BrandBar } from "../components/BrandBar";
import { useNav } from "../nav";
import { Button, Card, Empty, Row, Screen, Segmented, StoryBadge, Thumb } from "../components/ui";
import { DocumentsPane } from "./Documents";
import { TogetherPane } from "./Together";
import type { Trip } from "../types";
import { poiOf } from "../lib/stop";

/**
 * The 行程 tab, and deliberately the dullest screen in the app.
 *
 * A traveller opening this has one question — "which trip?" — so the list gives
 * a title, when it is, where it starts, and nothing else. Progress bars, budget
 * totals and completion counts all belong to somebody who is not standing in a
 * station trying to find their itinerary.
 */
/**
 * Three things that are all about a trip, under one tab.
 *
 * 一起規劃 used to be a tab of its own, which put "the trip" and "deciding the
 * trip with other people" two taps apart at the bottom of the screen. They are
 * the same subject. So this tab now holds the itineraries, the documents that
 * belong to them, and the room where a group argues about them.
 *
 * The list stays the default and stays first, unchanged. Somebody opening 行程
 * came to look at their itinerary, and a tab that greets them with a control
 * they have to read before they can see it has charged them for a feature they
 * did not ask for.
 */
type Pane = "trips" | "docs" | "together";

const PANES: { id: Pane; label: string }[] = [
  { id: "trips", label: "行程" },
  { id: "docs", label: "文件" },
  { id: "together", label: "一起規劃" },
];

export function Trips({ trips }: { trips: Trip[] }) {
  const nav = useNav();
  const [pane, setPane] = useState<Pane>("trips");

  return (
    <Screen>
      <BrandBar title="行程" />

      <div className="px-5 pb-3 pt-1">
        <Segmented<Pane> items={PANES} value={pane} onChange={setPane} />
      </div>

      {pane === "docs" && <DocumentsPane />}
      {pane === "together" && <TogetherPane />}

      {pane === "trips" && (
        <>
      {/* The one entry the conversation needs. It sits above the list because
          somebody with no trip yet has nothing below it to look at. */}
      <div className="px-5 pb-3">
        <Row
          icon="💬"
          label="跟 AI 說你想怎麼玩"
          value="用打字的"
          onClick={() => nav.go({ k: "chat" })}
        />
      </div>

      {trips.length === 0 ? (
        <Empty
          icon="🧳"
          text="還沒有旅程"
          action="建立旅程"
          onAction={() => nav.go({ k: "create" })}
        />
      ) : (
        <>
          <div className="space-y-3 px-5 pt-1">
            {trips.map((t) => (
              <TripRow key={t.id} trip={t} />
            ))}
          </div>
          <div className="px-5 pt-4">
            <Button variant="ghost" onClick={() => nav.go({ k: "create" })}>
              建立新旅程
            </Button>
          </div>
        </>
      )}
        </>
      )}

      <div className="h-24 shrink-0" />
    </Screen>
  );
}

function TripRow({ trip }: { trip: Trip }) {
  const nav = useNav();
  const phase = phasePill(trip);
  const thumbs = firstDayPois(trip);

  return (
    <Card onClick={() => nav.go({ k: "trip", id: trip.id })} className="p-4">
      <div className="flex items-center gap-2">
        <span className="truncate text-[16px] font-bold text-ink">{trip.title}</span>
        {hasStory(trip) && <StoryBadge label={false} />}
        <span
          className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
            phase.live ? "bg-brand-wash text-brand" : "bg-surface-2 text-ink-3"
          }`}
        >
          {phase.text}
        </span>
      </div>

      <div className="num mt-1 text-[13px] text-ink-3">{trip.dates}</div>

      {thumbs.length > 0 && (
        <div className="mt-3 flex gap-2">
          {thumbs.map((id) => {
            const p = poi(id);
            return <Thumb key={id} emoji={p.emoji} tint={p.tint} size={52} radius={12} />;
          })}
        </div>
      )}
    </Card>
  );
}

/**
 * One badge per trip, not one per place: the row is answering "which trip?", and
 * the itinerary itself is where the individual stops earn their own mark.
 */
function hasStory(trip: Trip): boolean {
  return trip.days.some((d) =>
    /* Only a place has a recorded guide, so anything that is not one simply
       does not count towards the badge — rather than throwing on its empty
       `poiId` and taking the whole trip list with it. */
    d.tracks.some((t) => t.stops.some((s) => Boolean(poiOf(s)?.storyId))),
  );
}

/** Day 1 is what a trip looks like in someone's head before they leave. */
function firstDayPois(trip: Trip): string[] {
  const day = trip.days[0];
  if (!day) return [];
  const ids = day.tracks.flatMap((t) => t.stops.flatMap((s) => poiOf(s)?.id ?? []));
  return [...new Set(ids)].slice(0, 4);
}

function phasePill(trip: Trip): { text: string; live: boolean } {
  if (trip.phase === "ongoing") return { text: "進行中", live: true };
  if (trip.phase === "soon") {
    return { text: trip.daysUntil ? `還有 ${trip.daysUntil} 天` : "即將出發", live: false };
  }
  return { text: "規劃中", live: false };
}
