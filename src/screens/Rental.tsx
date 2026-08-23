import { useState } from "react";
import { rental as rentalById, rentalPrice, RENTAL_DISCLOSURE } from "../data/carRentals";
import { BY_DEST } from "../data/destinations";
import { MapCredit, MapView } from "../components/MapView";
import { VehicleCredit, VehiclePhoto } from "../components/Cover";
import { hasVehiclePhoto } from "../data/vehicles";
import { DemoLinkSheet, InfoButton, InfoSheet, Stars } from "../components/Trade";
import { AddToTrip } from "../components/AddToTrip";
import { SHORT_DISCLOSURE, type InfoTopic } from "../data/info";
import { Button, Note, Screen, Section } from "../components/ui";
import { openPlaceDirections } from "../lib/maps";
import { focusTrip } from "../lib/trip";
import { useNav } from "../nav";

/**
 * One hire car counter, in full.
 *
 * The page a traveller reaches from 周邊推薦 → 附近租車, and it is careful about
 * exactly one thing: this is a real company that has never heard of ResoMap.
 * The badge is on the card, on the sheet that adds it to a day, and again here
 * above the fold — three places, because a demo that shows iRent's name, price
 * and rating and mentions the relationship once in a footer is a demo somebody
 * will screenshot without the footer.
 *
 * The photograph is of the class of car, never of the counter. There is no
 * picture of iRent's 花蓮 pickup point in any stock library, and a generic
 * forecourt behind a named address would be an image pretending to be
 * documentation. What the card and this page already state is the vehicle —
 * 「Toyota Yaris · 5 人座」 — so a hatchback above that line illustrates
 * something true. It carries the 圖庫示意 mark and a credit naming the model,
 * because a picture of a specific object is the thing a reader assumes is real
 * unless told otherwise.
 *
 * The primary action is 加入行程 rather than 立即預約. Nothing here books —
 * `url` is empty for every record — and the honest thing this app can do with a
 * counter is put it in the day at the hour the traveller lands.
 */
export function Rental({ id }: { id: string }) {
  const nav = useNav();
  const [info, setInfo] = useState<InfoTopic | null>(null);
  const [demo, setDemo] = useState<{ title: string; intent: string; why: string } | null>(null);
  const [adding, setAdding] = useState(false);

  const r = rentalById(id);
  if (!r) return null;

  const city = BY_DEST[r.destId]?.name;
  const trip = focusTrip(nav.trips) ?? null;
  /* Whether there is a picture at all decides the whole header shape, so it
     is read once rather than asked twice. */
  const photo = hasVehiclePhoto(r.id);

  return (
    <Screen>
      {/* The same shape 商家 and 服務者 pages use: picture first, back button
          floating on it. The picture is of the class of car, not of the
          counter — `VehiclePhoto` marks it 圖庫示意 and the credit under it
          says which model it illustrates. */}
      {photo ? (
        <div className="relative shrink-0">
          <VehiclePhoto
            id={r.id}
            model={r.model}
            size="hero"
            height={200}
            radius={0}
            className="w-full"
            eager
          />
          <button
            onClick={() => nav.back()}
            aria-label="返回"
            className="absolute left-4 top-4 grid size-11 place-items-center rounded-full bg-bg/90 text-[19px] text-ink active:bg-bg"
          >
            ‹
          </button>
        </div>
      ) : (
        <div className="px-5 pt-2">
          <button
            onClick={() => nav.back()}
            className="-ml-1 grid size-10 place-items-center rounded-full text-[18px] text-ink active:bg-surface"
            aria-label="返回"
          >
            ‹
          </button>
        </div>
      )}

      {photo && <VehicleCredit rentalId={r.id} />}

      <div className="px-5 pt-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold leading-tight text-ink">{r.brand}</h1>
          <div className="mt-1 text-[13.5px] text-ink-3">
            {r.pickup}
            {city ? ` · ${city}` : ""}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Stars rating={r.rating} count={r.reviewCount} />
          <InfoButton topic="affiliate" label="這是什麼" onOpen={setInfo} />
          {/* Above the fold, not in the footer. */}
          <span className="inline-flex shrink-0 items-center rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">
            {RENTAL_DISCLOSURE}
          </span>
        </div>
      </div>

      <Section title="這個據點" tight>
        <div className="mx-5 divide-y divide-line rounded-2xl bg-surface">
          <Row label="車型" value={`${r.model} · ${r.seats} 人座`} />
          <Row label="價格" value={rentalPrice(r)} />
          <Row label="取車時間" value={r.hours} />
          <Row label="地區" value={r.area} />
        </div>
        <p className="mt-3 px-5 text-[14px] leading-relaxed text-ink-2">{r.note}</p>
      </Section>

      <Section title="取車地點" tight>
        <div className="relative mx-5 h-44 overflow-hidden rounded-2xl">
          <MapView
            pins={[
              {
                poi: {
                  id: r.id,
                  name: r.brand,
                  area: r.pickup,
                  lat: r.lat,
                  lng: r.lng,
                  emoji: "🚗",
                  tint: "#eef2f6",
                },
              },
            ]}
            centre={[r.lat, r.lng]}
            zoom={15}
          />
          <MapCredit />
        </div>
      </Section>

      <Note>{SHORT_DISCLOSURE.partner}</Note>
      <div className="h-8 shrink-0" />

      <div className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-line bg-bg/95 px-5 pb-5 pt-3 backdrop-blur">
        <div className="space-y-2">
          <Button
            onClick={() => {
              if (trip && trip.days.length > 0) setAdding(true);
              else nav.go({ k: "create", destId: r.destId });
            }}
          >
            加入行程
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              openPlaceDirections({
                name: `${r.brand} ${r.pickup}`,
                area: r.area,
                lat: r.lat,
                lng: r.lng,
              })
            }
          >
            導航到取車點
          </Button>
          {/* Reads the record, exactly like the affiliate buttons do. Every
              `url` is empty today, so this always explains — and the day it is
              filled in, it opens, with no code change. */}
          <Button
            variant="ghost"
            onClick={() => {
              if (r.url) window.open(r.url, "_blank", "noopener,noreferrer");
              else
                setDemo({
                  title: r.brand,
                  intent: `此處將前往 ${r.brand} 的官方網站完成預訂。`,
                  why: "ResoMap 與這家業者沒有合作，也沒有導購連結。",
                });
            }}
          >
            前往 {r.brand}
          </Button>
        </div>
      </div>

      {adding && trip && trip.days.length > 0 && (
        <AddToTrip
          target={{ kind: "rental", rentalId: r.id }}
          trip={trip}
          onClose={() => setAdding(false)}
        />
      )}

      <DemoLinkSheet link={demo} onClose={() => setDemo(null)} />
      <InfoSheet topic={info} onClose={() => setInfo(null)} />
    </Screen>
  );
}

/** A label on the left, its value on the right. Local because nothing else
    on this page needs it and the shared `Row` is a tappable navigation row. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 px-4 py-3">
      <span className="shrink-0 text-[13px] text-ink-3">{label}</span>
      <span className="ml-auto min-w-0 text-right text-[14px] font-semibold text-ink">
        {value}
      </span>
    </div>
  );
}
