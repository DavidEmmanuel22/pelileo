"use client";

import { useMemo, useState } from "react";
import { MapView } from "@/components/map/MapView";
import { getPlace, MUNICIPIO, PLACES, SCENARIOS } from "@/lib/data";

type Mode = "explore" | "itinerary" | "heatmap";

export default function DevMapa() {
  const [mode, setMode] = useState<Mode>("explore");
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [day, setDay] = useState(0);

  const route = useMemo(() => {
    const it = SCENARIOS[0].itinerary;
    return { stops: it.days[day].steps.map((s, i) => ({ placeId: s.placeId, order: i })) };
  }, [day]);

  const heat = useMemo(
    () =>
      MUNICIPIO.heatmap.points
        .map((p) => {
          const pl = getPlace(p.placeId);
          return pl ? { lat: pl.lat, lng: pl.lng, weight: p.weight } : null;
        })
        .filter(Boolean) as { lat: number; lng: number; weight: number }[],
    [],
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-bg">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-3">
        <span className="mr-2 text-[13px] font-semibold">/dev/mapa</span>
        {(["explore", "itinerary", "heatmap"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setFocus(null);
            }}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-medium ${
              mode === m ? "border-ink bg-ink text-surface" : "border-line bg-surface text-ink-2"
            }`}
          >
            {m === "explore" ? "Explorar" : m === "itinerary" ? "Itinerario" : "Heatmap"}
          </button>
        ))}
        {mode === "itinerary" && (
          <>
            <button
              type="button"
              className="rounded-full border border-line px-3 py-1.5 text-[13px]"
              onClick={() => {
                setDay((d) => (d + 1) % 2);
                setFocus(null);
              }}
            >
              Día {day + 1}
            </button>
            <button
              type="button"
              className="rounded-full border border-line px-3 py-1.5 text-[13px]"
              onClick={() => setFocus((f) => (f == null ? 0 : (f + 1) % route.stops.length))}
            >
              Siguiente parada
            </button>
          </>
        )}
      </div>
      <div className="relative flex-1">
        <MapView
          mode={mode}
          places={PLACES}
          selectedId={selected}
          onSelect={setSelected}
          route={mode === "itinerary" ? route : null}
          focusStop={focus}
          onStopSelect={setFocus}
          heatmap={heat}
          fitKey={`${mode}-${day}`}
          intro={mode === "explore"}
        />
      </div>
    </div>
  );
}
