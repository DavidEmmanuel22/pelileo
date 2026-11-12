"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, BookmarkCheck, Clock, MapPin, Navigation, Sparkles, Tag, Wallet, X } from "lucide-react";
import type { Place } from "@/data/types";
import { CATEGORY_LABEL, getPlace, nearestPlaces, PLACES, placeImage, priceLabel, TAG_LABEL } from "@/lib/data";
import { creditFor } from "@/lib/credits";
import { travelBetween, travelLabel } from "@/lib/geo";
import { durationLabel, hoursSummary } from "@/lib/time";
import { useMapConfig } from "@/lib/mapStore";
import { useApp } from "@/lib/store";
import { useMounted } from "@/lib/hooks";
import { useDatedEvents } from "@/lib/events";
import { Sheet, type SheetHandle } from "@/components/ui/Sheet";
import { Photo } from "@/components/ui/Photo";
import { Stars } from "@/components/ui/bits";
import { CategoryIcon } from "@/components/ui/icons";
import { EventMini, OpenBadge, PlaceRow } from "@/components/places/cards";

const ORIGIN_DEFAULT = "parque-central";
const ORIGIN_ALT = "tambo-ruta-jean";

export function PlaceView({ id }: { id: string }) {
  const place = getPlace(id) as Place;
  const router = useRouter();
  const sheetRef = useRef<SheetHandle>(null);
  const [routeOn, setRouteOn] = useState(false);
  const mounted = useMounted();
  const saved = useApp((s) => s.savedPlaces.includes(id));
  const toggleSaved = useApp((s) => s.toggleSavedPlace);
  const events = useDatedEvents();

  const originId = id === ORIGIN_DEFAULT ? ORIGIN_ALT : ORIGIN_DEFAULT;
  const origin = getPlace(originId)!;
  const originName = id === ORIGIN_DEFAULT ? "El Tambo" : "Parque Central";
  const trip = useMemo(() => travelBetween(origin, place), [origin, place]);
  const near = useMemo(() => nearestPlaces(place, 3), [place]);
  const hereEvents = events?.filter((e) => e.ev.placeId === id).slice(0, 2) ?? [];

  // Al cambiar de lugar, se apaga la ruta y el panel vuelve arriba
  useEffect(() => {
    setRouteOn(false);
    sheetRef.current?.scrollToTop();
  }, [id]);

  const onSelect = useCallback((pid: string) => router.push(`/lugar/${pid}`), [router]);

  useMapConfig(
    {
      mode: "explore",
      places: routeOn ? [place] : PLACES,
      selectedId: id,
      onSelect,
      route: routeOn
        ? {
            stops: [
              { placeId: originId, order: 0 },
              { placeId: id, order: 1 },
            ],
          }
        : null,
      originLabel: routeOn ? originName : undefined,
    },
    [id, routeOn, onSelect],
  );

  const credit = creditFor(id);
  const img = placeImage(place);

  const header = (
    <div className="relative px-5 pb-3 pt-1 lg:pt-5">
      <div className="mb-3 hidden lg:block">
        <Link
          href="/"
          className="-ml-2 inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-[13.5px] font-medium text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Explorar
        </Link>
      </div>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-2">
            <CategoryIcon category={place.category} size={14} />
            <span>{CATEGORY_LABEL[place.category]}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{place.parish}</span>
          </p>
          <h1 className="mt-1 text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink lg:text-[26px]">{place.name}</h1>
        </div>
        <Link
          href="/"
          aria-label="Cerrar y volver a Explorar"
          className="-mr-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink-3 lg:hidden"
        >
          <X size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );

  return (
    <Sheet ref={sheetRef} label={`Detalle de ${place.name}`} snaps={[0.15, 0.55, 0.92]} initial={1} header={header}>
      <div className="px-5">
        {/* Foto */}
        <figure>
          <Photo
            src={img}
            alt={place.name}
            category={place.category}
            className="aspect-[16/10] w-full rounded-[var(--radius-card)]"
            sizes="(max-width: 1023px) 92vw, 380px"
            priority
            iconSize={36}
          />
          {credit && (
            <figcaption className="mt-1.5 truncate text-[11.5px] text-ink-2">
              Foto referencial: {credit.author} · {credit.license} ·{" "}
              <a href={credit.source} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-2 hover:text-ink-2">
                Wikimedia Commons
              </a>
            </figcaption>
          )}
        </figure>

        {/* Datos clave */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <OpenBadge place={place} />
          {place.rating && <Stars rating={place.rating} reviews={place.reviews} />}
        </div>

        {/* Acciones */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              const next = !routeOn;
              setRouteOn(next);
            }}
            aria-pressed={routeOn}
            className={`col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors duration-200 ${
              routeOn ? "border border-ink bg-surface text-ink" : "bg-ink text-surface hover:bg-[color-mix(in_srgb,var(--ink)_88%,var(--surface))]"
            }`}
          >
            <Navigation size={17} aria-hidden="true" />
            {routeOn ? "Ocultar ruta" : "Cómo llegar"}
          </button>
          <button
            type="button"
            onClick={() => toggleSaved(id)}
            aria-pressed={mounted ? saved : false}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface text-[14.5px] font-semibold text-ink transition-colors duration-200 hover:border-ink-3"
          >
            {mounted && saved ? <BookmarkCheck size={17} aria-hidden="true" /> : <Bookmark size={17} aria-hidden="true" />}
            {mounted && saved ? "Guardado" : "Guardar"}
          </button>
          <Link
            href={`/gaia?add=${id}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--clapzy)_40%,var(--line))] bg-clapzy-soft text-[14.5px] font-semibold text-clapzy-ink transition-colors duration-200 hover:border-clapzy"
          >
            <Sparkles size={16} aria-hidden="true" />
            Agregar a mi plan
          </Link>
        </div>

        {routeOn && (
          <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-bg px-4 py-3 text-[13.5px] text-ink" role="status">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-surface">
              <span className="h-2.5 w-2.5 rounded-full bg-surface" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">{travelLabel(trip.minutes, trip.mode)}</span>
              <span className="block text-ink-2">
                desde {id === ORIGIN_DEFAULT ? "El Tambo" : "el Parque Central"} · {trip.km.toFixed(1).replace(".", ",")} km aprox.
              </span>
            </span>
          </div>
        )}

        {/* Descripción */}
        <p className="mt-6 text-[15px] leading-relaxed text-ink">{place.description}</p>

        {/* Ficha */}
        <dl className="mt-5 grid grid-cols-2 rounded-[var(--radius-card)] border border-line [&>div:nth-child(-n+2)]:border-b [&>div:nth-child(-n+2)]:border-line [&>div:nth-child(odd)]:border-r [&>div:nth-child(odd)]:border-line">
          <Fact icon={<Clock size={16} />} label="Horario" value={hoursSummary(place.hours)} />
          <Fact icon={<Wallet size={16} />} label="Precio" value={priceLabel(place)} />
          <Fact icon={<Sparkles size={16} />} label="Tiempo sugerido" value={durationLabel(place.durationMin)} />
          <Fact icon={<MapPin size={16} />} label="Parroquia" value={place.parish} />
        </dl>

        {/* Tags */}
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Ideal para">
          {place.tags.map((t) => (
            <li key={t} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-bg-2 px-3 text-[12.5px] font-medium text-ink-2">
              <Tag size={12} aria-hidden="true" />
              {TAG_LABEL[t]}
            </li>
          ))}
        </ul>
      </div>

      {hereEvents.length > 0 && (
        <section className="mt-8" aria-labelledby="eventos-aqui">
          <h2 id="eventos-aqui" className="px-5 text-[17px] font-semibold tracking-[-0.01em] text-ink">
            Próximos eventos aquí
          </h2>
          <div className="mt-1">
            {hereEvents.map((d) => (
              <EventMini key={d.ev.id} d={d} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 pb-10" aria-labelledby="cerca">
        <h2 id="cerca" className="px-5 text-[17px] font-semibold tracking-[-0.01em] text-ink">
          Cerca de aquí
        </h2>
        <ul className="mt-1">
          {near.map((p) => (
            <li key={p.id}>
              <PlaceRow place={p} />
            </li>
          ))}
        </ul>
      </section>
    </Sheet>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 text-ink-2" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[12.5px] text-ink-2">{label}</dt>
        <dd className="mt-0.5 text-[14.5px] font-medium text-ink">{value}</dd>
      </div>
    </div>
  );
}
