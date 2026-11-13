import { Cursor, Grain, MobilePill, Nav, Progress, SmoothScroll } from "@/components/ui/Chrome";
import { Refresher } from "@/components/ui/Refresher";
import { Preloader } from "@/components/scenes/S00Preloader";
import { Hero } from "@/components/scenes/S01Hero";
import { Problema } from "@/components/scenes/S02Problema";
import { Campana } from "@/components/scenes/S03Campana";
import { Ganadores } from "@/components/scenes/S04Ganadores";
import { SieteDias } from "@/components/scenes/S05SieteDias";
import { Gaia } from "@/components/scenes/S06Gaia";

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
        <section id="reservas" data-scene="7" className="relative h-[100vh] bg-night-2" />
      </main>
      <Progress />
      <MobilePill />
      <Cursor />
      <Grain />
      <Refresher />
    </>
  );
}
