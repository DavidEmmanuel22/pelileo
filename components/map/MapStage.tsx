"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useMapStore } from "@/lib/mapStore";
import { useIsDesktop } from "@/lib/hooks";
import { bootDelay } from "@/components/shell/Boot";
import { MapView } from "./MapView";

let introPlayed = false;

/** Mapa persistente del layout público. Lee la configuración que declara cada pantalla. */
export function MapStage() {
  const s = useMapStore();
  const desktop = useIsDesktop();
  const path = usePathname();
  // La intro de cámara solo se ve al entrar por la portada, una vez por carga.
  const [intro] = useState(() => typeof window !== "undefined" && path === "/" && !introPlayed);
  useEffect(() => {
    introPlayed = true;
  }, []);
  const [delay] = useState(() => bootDelay());
  const padding = desktop
    ? { top: s.topPx, bottom: 0, left: 0, right: 0 }
    : { top: s.topPx, bottom: s.sheetPx, left: 0, right: 0 };
  return (
    <MapView
      mode={s.mode}
      places={s.places}
      selectedId={s.selectedId}
      onSelect={s.onSelect}
      route={s.route}
      focusStop={s.focusStop}
      onStopSelect={s.onStopSelect}
      heatmap={s.heatmap}
      padding={padding}
      intro={intro}
      introDelay={delay}
      originLabel={s.originLabel}
      fitKey={s.fitKey}
    />
  );
}
