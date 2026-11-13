import { Cursor, Grain, MobilePill, Nav, Progress, SmoothScroll } from "@/components/ui/Chrome";
import { Refresher } from "@/components/ui/Refresher";
import { Preloader } from "@/components/scenes/S00Preloader";
import { Hero } from "@/components/scenes/S01Hero";
import { Problema } from "@/components/scenes/S02Problema";

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
        <section id="campana" data-scene="3" className="relative h-[100vh] bg-cream" />
      </main>
      <Progress />
      <MobilePill />
      <Cursor />
      <Grain />
      <Refresher />
    </>
  );
}
