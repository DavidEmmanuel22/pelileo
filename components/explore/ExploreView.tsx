"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EXPLORE_FILTERS, FEATURED, matchesFilter, PLACES, type ExploreFilter } from "@/lib/data";
import { useDatedEvents } from "@/lib/events";
import { useIsDesktop } from "@/lib/hooks";
import { useMapConfig, useMapStore } from "@/lib/mapStore";
import { Lockup } from "@/components/brand/Brand";
import { Sheet } from "@/components/ui/Sheet";
import { Chip, FooterLinks, GaiaTeaser, SectionTitle, WeatherChip } from "@/components/ui/bits";
import { EventMini, PlaceCard, PlaceRow } from "@/components/places/cards";
import { bootDelay } from "@/components/shell/Boot";

let firstVisit = true;

export function ExploreView() {
  const router = useRouter();
  const desktop = useIsDesktop();
  const [filter, setFilter] = useState<ExploreFilter>("todo");
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const events = useDatedEvents();
  const topRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const setTopPx = useMapStore((s) => s.setTopPx);
  const [enterDelay] = useState(() => (firstVisit && typeof window !== "undefined" ? bootDelay() + 1500 : 0));

  useEffect(() => {
    firstVisit = false;
  }, []);

  const visible = useMemo(() => PLACES.filter((p) => matchesFilter(p, filter)), [filter]);
  const openPlace = useCallback((id: string) => router.push(`/lugar/${id}`), [router]);

  useMapConfig(
    {
      mode: "explore",
      places: visible,
      selectedId: hover ?? selected,
      onSelect: openPlace,
    },
    [visible, hover, selected, openPlace],
  );

  // El overlay superior (mobile) tapa parte del mapa: avisamos al mapa
  useLayoutEffect(() => {
    if (desktop) {
      setTopPx(0);
      return;
    }
    const el = topRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTopPx(el.offsetHeight));
    ro.observe(el);
    return () => {
      ro.disconnect();
      setTopPx(0);
    };
  }, [desktop, setTopPx]);

  // Carrusel: al deslizar, el mapa vuela al lugar
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCarouselScroll = () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = carouselRef.current;
      if (!el) return;
      const cards = [...el.querySelectorAll<HTMLElement>("[data-place]")];
      const left = el.scrollLeft + 20;
      let best = 0;
      let bestD = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - left);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      const id = cards[best]?.dataset.place ?? null;
      if (id && (el.scrollLeft > 8 || selected)) setSelected(id);
    }, 120);
  };

  const upcoming = events?.filter((e) => e.diff <= 7).slice(0, 3) ?? null;

  const chips = (
    <div
      className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-1 lg:flex-wrap lg:overflow-visible lg:px-5"
      role="group"
      aria-label="Filtrar por categoría"
      data-no-drag
    >
      {EXPLORE_FILTERS.map((f) => (
        <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} className="shadow-soft lg:shadow-none">
          {f.label}
        </Chip>
      ))}
    </div>
  );

  return (
    <>
      {/* Overlay superior (mobile/tablet) */}
      <div
        ref={topRef}
        className="pointer-events-none absolute inset-x-0 top-0 z-10 pt-[max(12px,env(safe-area-inset-top))] lg:hidden"
      >
        <div className="flex items-start justify-between gap-2 px-4">
          <div className="pointer-events-auto rounded-2xl border border-line bg-surface/95 px-3 py-2 shadow-soft backdrop-blur">
            <Lockup size="sm" />
          </div>
          <WeatherChip compact className="pointer-events-auto mt-1.5" />
        </div>
        <div className="pointer-events-auto mt-2.5 pb-2">{chips}</div>
      </div>

      {/* Clima sobre el mapa (desktop) */}
      <div className="pointer-events-none absolute right-4 top-4 z-10 hidden lg:block">
        <WeatherChip className="pointer-events-auto" />
      </div>

      <Sheet
        label="Imperdibles y lugares de Pelileo"
        snaps={[0.15, 0.45, 0.92]}
        initial={1}
        enterDelay={enterDelay}
        header={
          <div className="px-5 pb-3 pt-1 lg:pt-6">
            <p className="hidden text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-2 lg:block">Cantón Pelileo · Tungurahua</p>
            <h1 className="text-[21px] font-bold tracking-[-0.02em] text-ink lg:mt-1 lg:text-[26px]">Imperdibles de Pelileo</h1>
            <p className="mt-0.5 text-[13.5px] text-ink-2">La Ciudad Azul, el Nitón y la cultura Salasaka, en un mapa.</p>
          </div>
        }
      >
        <div className="hidden pb-4 lg:block">{chips}</div>

        {/* Carrusel (mobile) / grilla 2 columnas (desktop) */}
        <div
          ref={carouselRef}
          onScroll={onCarouselScroll}
          data-no-drag
          className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto scroll-smooth px-5 pb-2 lg:grid lg:snap-none lg:grid-cols-2 lg:overflow-visible"
          aria-label="Imperdibles"
        >
          {FEATURED.map((p, i) => (
            <PlaceCard
              key={p.id}
              place={p}
              priority={i < 4}
              active={(hover ?? selected) === p.id}
              onFocus={desktop ? () => setHover(p.id) : undefined}
              className="w-[72vw] max-w-[280px] shrink-0 snap-start lg:w-auto lg:max-w-none"
            />
          ))}
        </div>

        <section className="mt-7" aria-labelledby="esta-semana">
          <SectionTitle
            id="esta-semana"
            action={
              <Link href="/eventos" className="inline-flex h-10 items-center text-[13.5px] font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                Ver agenda
              </Link>
            }
          >
            Esta semana
          </SectionTitle>
          <div className="mt-1">
            {upcoming === null
              ? [0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3.5 px-5 py-2.5">
                    <span className="skeleton h-14 w-14 rounded-xl" />
                    <span className="flex-1 space-y-2">
                      <span className="skeleton block h-3.5 w-3/4 rounded" />
                      <span className="skeleton block h-3 w-1/2 rounded" />
                    </span>
                  </div>
                ))
              : upcoming.map((d) => <EventMini key={d.ev.id} d={d} />)}
          </div>
        </section>

        <div className="mt-6 px-5">
          <GaiaTeaser />
        </div>

        <section className="mt-8" aria-labelledby="todos">
          <SectionTitle id="todos" action={<span className="text-[13px] text-ink-2">{visible.length} lugares</span>}>
            {filter === "todo" ? "Todos los lugares" : EXPLORE_FILTERS.find((f) => f.id === filter)?.label}
          </SectionTitle>
          <div className="mt-2 lg:hidden">{chips}</div>
          <ul className="mt-2">
            {visible.map((p) => (
              <li key={p.id}>
                <PlaceRow place={p} onHover={desktop ? setHover : undefined} />
              </li>
            ))}
          </ul>
        </section>

        <FooterLinks />
      </Sheet>
    </>
  );
}
