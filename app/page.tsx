import { Cursor, Grain, MobilePill, Nav, Progress, SmoothScroll } from "@/components/ui/Chrome";
import { Refresher } from "@/components/ui/Refresher";
import { Preloader } from "@/components/scenes/S00Preloader";
import { Hero } from "@/components/scenes/S01Hero";
import { Problema } from "@/components/scenes/S02Problema";
import { Campana } from "@/components/scenes/S03Campana";
import { Ganadores } from "@/components/scenes/S04Ganadores";
import { SieteDias } from "@/components/scenes/S05SieteDias";
import { Gaia } from "@/components/scenes/S06Gaia";
import { Reservas } from "@/components/scenes/S07Reservas";
import { Datos } from "@/components/scenes/S08Datos";
import { Contenido } from "@/components/scenes/S09Contenido";
import { AntesDespues } from "@/components/scenes/S10AntesDespues";
import { Respaldo } from "@/components/scenes/S11Respaldo";
import { Entregables } from "@/components/scenes/S12Entregables";
import { Preguntas } from "@/components/scenes/S13Preguntas";
import { respaldo } from "@/content/site";
import { existsSync } from "node:fs";
import path from "node:path";

// Los logos reales se usan apenas existan en public/logos con el nombre esperado
const logosOk = Object.fromEntries(respaldo.logos.map((l) => [l.archivo, existsSync(path.join(process.cwd(), "public", "logos", l.archivo))]));

export default function Page() {
  return (
    <>
      <a href="#campana" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-coral focus:px-5 focus:py-3 focus:font-bold focus:text-white">
        Saltar al contenido
      </a>
      <SmoothScroll />
      <Preloader />
      <Nav />
      <main>
        <Hero />
        <Problema />
        <Campana />
        <Ganadores />
        <SieteDias />
        <Gaia />
        <Reservas />
        <Datos />
        <Contenido />
        <AntesDespues />
        <Respaldo logosOk={logosOk} />
        <Entregables />
        <Preguntas />
        <section id="cierre" data-scene="14" className="relative h-[100vh] bg-night">
          <div id="agendar" />
        </section>
      </main>
      <Progress />
      <MobilePill />
      <Cursor />
      <Grain />
      <Refresher />
    </>
  );
}
