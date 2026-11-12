"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CalendarX2, MapPin, Sparkles } from "lucide-react";
import type { EventItem, Place } from "@/data/types";
import { EVENT_CATEGORY_LABEL, eventImage, getPlace } from "@/lib/data";
import { GROUP_LABEL, groupOf, useDatedEvents, type DatedEvent, type EventGroup } from "@/lib/events";
import { useMapConfig } from "@/lib/mapStore";
import { useIsDesktop } from "@/lib/hooks";
import { formatLongDate } from "@/lib/time";
import { Sheet, type SheetHandle } from "@/components/ui/Sheet";
import { Chip, FooterLinks } from "@/components/ui/bits";
import { Photo } from "@/components/ui/Photo";
import { DateBlock } from "@/components/places/cards";

type Filter = "todo" | EventItem["category"];
const ORDER: EventGroup[] = ["hoy", "finde", "semana", "proximas"];

/** Pseudo-lugar para pintar el evento como pin en el mapa. */
function eventPin(d: DatedEvent): Place {
  const base = getPlace(d.ev.placeId);
  return {
    ...(base ?? ({} as Place)),
    id: d.ev.id,
    name: d.ev.title,
    lat: d.ev.lat,
    lng: d.ev.lng,
    featured: false,
  } as Place;
}

export function EventsView() {
  const events = useDatedEvents();
  const desktop = useIsDesktop();
  const sheetRef = useRef<SheetHandle>(null);
  const [filter, setFilter] = useState<Filter>("todo");
  const [selected, setSelected] = useState<string | null>(null);

  const list = useMemo(() => (events ?? []).filter((d) => filter === "todo" || d.ev.category === filter), [events, filter]);
  const cats = useMemo(() => {
    const present = new Set((events ?? []).map((d) => d.ev.category));
    return (Object.keys(EVENT_CATEGORY_LABEL) as EventItem["category"][]).filter((c) => present.has(c));
  }, [events]);
  const pins = useMemo(() => list.map(eventPin), [list]);

  const scrollToCard = useCallback((id: string) => {
    const el = document.getElementById(`card-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const onPin = useCallback(
    (id: string) => {
      setSelected(id);
      sheetRef.current?.snapTo(desktop ? 1 : 2);
      setTimeout(() => scrollToCard(id), 380);
    },
    [desktop, scrollToCard],
  );

  useMapConfig({ mode: "explore", places: pins, selectedId: selected, onSelect: onPin }, [pins, selected, onPin]);

  // /eventos#ev-id → resalta ese evento
  useEffect(() => {
    if (!events) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || !events.some((d) => d.ev.id === id)) return;
    const t = setTimeout(() => {
      setSelected(id);
      sheetRef.current?.snapTo(2);
      setTimeout(() => scrollToCard(id), 420);
    }, 0);
    return () => clearTimeout(t);
  }, [events, scrollToCard]);

  const showOnMap = (id: string) => {
    setSelected(id);
    if (!desktop) sheetRef.current?.snapTo(0);
  };

  const grouped = ORDER.map((g) => ({ g, items: list.filter((d) => groupOf(d) === g) })).filter((x) => x.items.length);

  const chips = (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1 lg:flex-wrap lg:overflow-visible" role="group" aria-label="Filtrar eventos" data-no-drag>
      <Chip active={filter === "todo"} onClick={() => setFilter("todo")}>
        Todos
      </Chip>
      {cats.map((c) => (
        <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
          {EVENT_CATEGORY_LABEL[c]}
        </Chip>
      ))}
    </div>
  );

  return (
    <Sheet
      ref={sheetRef}
      label="Agenda de eventos"
      snaps={[0.15, 0.55, 0.92]}
      initial={1}
      header={
        <div className="pb-3 pt-1 lg:pt-6">
          <div className="px-5">
            <p className="hidden text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-2 lg:block">Agenda</p>
            <h1 className="text-[21px] font-bold tracking-[-0.02em] text-ink lg:mt-1 lg:text-[26px]">Qué pasa en Pelileo</h1>
            <p className="mt-0.5 text-[13.5px] text-ink-2">Ferias, música y tradiciones de las próximas semanas.</p>
          </div>
          <div className="mt-3">{chips}</div>
        </div>
      }
    >
      {events === null ? (
        <div className="space-y-3 px-5 pt-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-[132px] rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="mx-5 mt-4 flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line px-6 py-10 text-center">
          <CalendarX2 size={28} className="text-ink-3" aria-hidden="true" />
          <p className="mt-3 text-[15px] font-semibold text-ink">No hay eventos de este tipo por ahora</p>
          <p className="mt-1 text-[13.5px] text-ink-2">Prueba con otra categoría o mira toda la agenda.</p>
          <button
            type="button"
            onClick={() => setFilter("todo")}
            className="mt-4 inline-flex h-11 items-center rounded-full border border-line px-5 text-[14px] font-semibold text-ink hover:border-ink-3"
          >
            Ver todos los eventos
          </button>
        </div>
      ) : (
        grouped.map(({ g, items }) => (
          <section key={g} className="mt-3 first:mt-1" aria-labelledby={`g-${g}`}>
            <h2 id={`g-${g}`} className="flex items-baseline gap-2 px-5 pb-2 pt-3 text-[17px] font-semibold tracking-[-0.01em] text-ink">
              {GROUP_LABEL[g]}
              <span className="text-[13px] font-medium text-ink-2">{items.length}</span>
            </h2>
            <ul className="space-y-3 px-5">
              {items.map((d) => (
                <li key={d.ev.id}>
                  <EventCard d={d} active={selected === d.ev.id} onMap={() => showOnMap(d.ev.id)} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      <FooterLinks />
    </Sheet>
  );
}

function EventCard({ d, active, onMap }: { d: DatedEvent; active: boolean; onMap: () => void }) {
  const { ev } = d;
  return (
    <article
      id={`card-${ev.id}`}
      className={`scroll-mt-24 overflow-hidden rounded-[var(--radius-card)] border bg-surface transition-[border-color,box-shadow] duration-300 ${
        active ? "border-ink shadow-soft" : "border-line"
      }`}
    >
      <div className="flex gap-3.5 p-3.5">
        <DateBlock date={d.date} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-ink-2">
            <span>{EVENT_CATEGORY_LABEL[ev.category]}</span>
            {ev.published && (
              <span className="rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-semibold text-pel-green">Nuevo · Municipio</span>
            )}
          </div>
          <h3 className="mt-0.5 text-[15.5px] font-semibold leading-snug tracking-[-0.01em] text-ink">{ev.title}</h3>
          <p className="mt-1 text-[13px] text-ink-2">
            <span className="sr-only">{formatLongDate(d.date)}, </span>
            {ev.start}–{ev.end} · {d.placeName}
          </p>
          <p className="mt-1 text-[13.5px] font-semibold text-ink">{ev.price ? `$${ev.price} por persona` : "Gratis"}</p>
        </div>
        <Photo
          src={eventImage(ev)}
          alt=""
          category="evento"
          className="hidden h-[76px] w-[76px] shrink-0 rounded-xl min-[380px]:block"
          sizes="76px"
          iconSize={18}
        />
      </div>
      {ev.short && <p className="-mt-1 px-3.5 pb-3 text-[13.5px] leading-snug text-ink-2">{ev.short}</p>}
      <div className="flex gap-2 border-t border-line px-3.5 py-2.5">
        <Link
          href={`/gaia?add=${ev.placeId ?? ""}&ev=${ev.id}`}
          className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border border-[color-mix(in_srgb,var(--clapzy)_40%,var(--line))] bg-clapzy-soft px-3.5 text-[13.5px] font-semibold text-clapzy-ink transition-colors hover:border-clapzy"
        >
          <Sparkles size={14} aria-hidden="true" />
          Agregar a mi plan
        </Link>
        <button
          type="button"
          onClick={onMap}
          className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13.5px] font-semibold text-ink transition-colors hover:bg-bg"
        >
          <MapPin size={15} aria-hidden="true" />
          Ver en el mapa
        </button>
      </div>
    </article>
  );
}
