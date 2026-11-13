"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Place } from "@/data/types";
import { PLACES } from "@/lib/data";

export type MapConfig = {
  mode: "explore" | "itinerary" | "heatmap";
  places: Place[];
  selectedId: string | null;
  route: { stops: { placeId: string; order: number }[] } | null;
  focusStop: number | null;
  heatmap?: { lat: number; lng: number; weight: number }[];
  intro: boolean;
  introDelay: number;
  originLabel?: string;
  fitKey?: string | number;
  onSelect?: (id: string) => void;
  onStopSelect?: (order: number) => void;
};

type MapState = MapConfig & {
  /** Alto visible del sheet (px) en mobile: el mapa centra la cámara sobre el área libre. */
  sheetPx: number;
  topPx: number;
  set: (cfg: Partial<MapConfig>) => void;
  setSheetPx: (px: number) => void;
  setTopPx: (px: number) => void;
};

export const useMapStore = create<MapState>((set) => ({
  mode: "explore",
  places: PLACES,
  selectedId: null,
  route: null,
  focusStop: null,
  intro: false,
  introDelay: 0,
  sheetPx: 0,
  topPx: 0,
  set: (cfg) => set(cfg),
  setSheetPx: (px) => set((s) => (Math.abs(s.sheetPx - px) < 2 ? s : { sheetPx: px })),
  setTopPx: (px) => set((s) => (Math.abs(s.topPx - px) < 2 ? s : { topPx: px })),
}));

/** Cada pantalla declara cómo quiere el mapa. */
export function useMapConfig(cfg: Partial<MapConfig>, deps: unknown[]) {
  const set = useMapStore((s) => s.set);
  useEffect(() => {
    set({
      mode: "explore",
      places: PLACES,
      selectedId: null,
      route: null,
      focusStop: null,
      heatmap: undefined,
      originLabel: undefined,
      fitKey: undefined,
      onSelect: undefined,
      onStopSelect: undefined,
      intro: false,
      ...cfg,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
