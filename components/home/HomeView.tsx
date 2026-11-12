"use client";

import { useCallback, useState } from "react";
import type { HomeMedia } from "@/lib/media";
import { GaiaDemo } from "./GaiaDemo";
import { Hero } from "./Hero";
import { Valley } from "./Valley";
import { EventsStrip, Experiences, FinalCta, FlightBand, Food, GaiaBand, Intro, MapTeaser, Stay } from "./Sections";

/** Portada: vitrina del destino. Gaia es la llamada principal; el resto muestra lo que hay para vivir. */
export function HomeView({ media }: { media: HomeMedia }) {
  const [ask, setAsk] = useState<string | null>(null);
  const onAsk = useCallback((p: string) => setAsk(p), []);
  const onClose = useCallback(() => setAsk(null), []);
  return (
    <main id="contenido" className="bg-bg">
      <Hero image={media.hero} video={media.heroVideo} videoMobile={media.heroVideoMobile} onAsk={onAsk} />
      <Valley />
      <Intro />
      <Experiences media={media} />
      <GaiaBand onAsk={onAsk} />
      <Food />
      <FlightBand image={media.vuelo} video={media.vueloVideo} />
      <EventsStrip />
      <Stay />
      <MapTeaser />
      <FinalCta image={media.cierre} video={media.cierreVideo} onAsk={onAsk} />
      <GaiaDemo prompt={ask} onClose={onClose} />
    </main>
  );
}
