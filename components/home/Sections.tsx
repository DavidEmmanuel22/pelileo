"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, MapPin, Sparkles, Star } from "lucide-react";
import { GaiaMark, Lockup } from "@/components/brand/Brand";
import { MapArt } from "@/components/map/MapArt";
import { project, VIEW_CANTON } from "@/components/map/projection";
import { EVENTS, PLACES, eventImage, placeImage, priceLabel } from "@/lib/data";
import { useDatedEvents } from "@/lib/events";
import { formatShortDate, monthShort } from "@/lib/time";
import type { HomeMedia } from "@/lib/media";
import { GaiaBox, HERO_CHIPS } from "./Hero";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`smallcaps flex items-center gap-2 text-[12.5px] font-semibold ${light ? "text-on-photo/75" : "text-clapzy-ink"}`}>
      <span className={`h-px w-6 ${light ? "bg-on-photo/50" : "bg-clapzy"}`} aria-hidden="true" />
      {children}
    </p>
  );
}

function Heading({ children, light = false, className = "" }: { children: React.ReactNode; light?: boolean; className?: string }) {
  return (
    <h2
      className={`mt-3 font-display text-[clamp(36px,5.4vw,68px)] font-medium leading-[0.98] tracking-[-0.025em] ${
        light ? "text-on-photo" : "text-ink"
      } ${className}`}
    >
      {children}
    </h2>
  );
}

const count = (cats: string[]) => PLACES.filter((p) => cats.includes(p.category)).length;

/* ────────────────────────────── Intro con cifras */
export function Intro() {
  const stats = [
    { n: PLACES.length, label: "lugares para visitar" },
    { n: EVENTS.length, label: "eventos este mes" },
    { n: count(["comer", "beber"]), label: "sabores para probar" },
    { n: 1, label: "guía con IA que arma tu plan" },
  ];
  return (
    <section className="bg-bg px-5 pb-20 pt-10 sm:px-8 lg:pb-28 lg:pt-6">
      <div className="mx-auto max-w-[1240px]">
        <Reveal>
          <p className="max-w-[1000px] font-display text-[clamp(28px,4.2vw,54px)] font-normal leading-[1.12] tracking-[-0.02em] text-ink">
            En Pelileo el jean se cose a mano, los telares de Salasaca cuentan historias y el Tungurahua{" "}
            <em className="text-clapzy-ink">vigila todo desde arriba</em>. Ven un fin de semana; te quedarás con ganas de volver.
          </p>
        </Reveal>
        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={0.08 * i}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="tabular block font-display text-[clamp(44px,5vw,64px)] font-medium leading-none tracking-[-0.03em] text-ink">
                  {s.n}
                </span>
                <span className="mt-2 block text-[14.5px] text-ink-2">{s.label}</span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ────────────────────────────── Qué vivir (mosaico) */
export function Experiences({ media }: { media: HomeMedia }) {
  const tiles = [
    { key: "aventura", title: "Aventura", sub: "Parapente en el Nitón, cabalgatas y senderos", n: count(["aventura", "experiencia"]), img: media.exp.aventura, cls: "col-span-2 row-span-2 h-[420px] lg:h-auto" },
    { key: "cultura", title: "Cultura Salasaka", sub: "Telares, tejidos y la Plaza del Arte", n: count(["cultura"]), img: media.exp.cultura, cls: "h-[260px] lg:h-auto" },
    { key: "jean", title: "Ciudad del Jean", sub: "Talleres y almacenes de jean en El Tambo", n: count(["compras"]), img: media.exp.jean, cls: "h-[260px] lg:h-auto" },
    { key: "sabores", title: "Sabores", sub: "Fritada, trucha, empanadas de tiesto", n: count(["comer", "beber"]), img: media.exp.sabores, cls: "h-[260px] lg:h-auto" },
    { key: "naturaleza", title: "Naturaleza", sub: "Cascadas, miradores y aguas de Cotaló", n: count(["naturaleza"]), img: media.exp.naturaleza, cls: "h-[260px] lg:h-auto" },
  ];
  return (
    <section className="bg-bg px-5 pb-24 sm:px-8 lg:pb-32" aria-labelledby="que-vivir">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <Eyebrow>Qué vivir</Eyebrow>
            <Heading>
              <span id="que-vivir">Cinco maneras de</span> <em className="font-normal">enamorarte</em>
            </Heading>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/explorar" className="group inline-flex h-12 items-center gap-2 rounded-full border border-ink px-5 text-[14.5px] font-semibold text-ink transition-colors hover:bg-ink hover:text-surface">
              Ver todo en el mapa <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:h-[640px] lg:grid-cols-4 lg:grid-rows-2">
          {tiles.map((t, i) => (
            <Reveal key={t.key} delay={0.06 * i} className={`${t.cls} ${i > 0 ? "col-span-2 sm:col-span-1" : ""}`}>
              <Link href="/explorar" className="group relative block h-full overflow-hidden rounded-[22px] bg-night">
                <Image
                  src={t.img}
                  alt=""
                  fill
                  sizes={i === 0 ? "(max-width: 1024px) 100vw, 620px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 310px"}
                  className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,color-mix(in_srgb,var(--night)_85%,transparent))]" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-on-photo lg:p-6">
                  <div>
                    <p className="text-[12.5px] font-medium text-on-photo/75">{t.n} lugares</p>
                    <p className={`font-display font-medium leading-[1.02] tracking-[-0.02em] ${i === 0 ? "text-[clamp(34px,4vw,52px)]" : "text-[28px]"}`}>
                      {t.title}
                    </p>
                    <p className="mt-1 text-[14px] text-on-photo/85">{t.sub}</p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-on-photo/15 backdrop-blur-md transition-colors group-hover:bg-clapzy">
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────── Gaia (franja oscura) */
const SCENARIO_ART_BY_LABEL: Record<string, string> = {
  "Fin de semana en familia": "/images/places/e-cosecha.jpg",
  "Aventura en pareja": "/images/places/e-parapente.jpg",
  "Jean y artesanías": "/images/places/tambo-ruta-jean.jpg",
};

export function GaiaBand({ onAsk }: { onAsk: (p: string) => void }) {
  return (
    <section className="relative overflow-hidden bg-night px-5 py-24 text-on-photo sm:px-8 lg:py-32" aria-labelledby="gaia-band">
      <div className="gaia-aura pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <Reveal>
          <Eyebrow light>Conoce a Gaia</Eyebrow>
          <Heading light>
            <span id="gaia-band">Dile qué te gusta.</span> <em className="font-normal text-dawn">Ella arma el viaje.</em>
          </Heading>
          <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-on-photo/80">
            Gaia es la guía de viaje con inteligencia artificial de Clapzy. Conoce los horarios, los precios y las distancias del
            cantón, y te propone un itinerario hora por hora que puedes ajustar conversando: «más barato», «sin cuy», «agrega
            parapente».
          </p>
          <div className="mt-8 max-w-[600px]">
            <GaiaBox onAsk={onAsk} tone="dark" autoType={false} />
          </div>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-1">
          {HERO_CHIPS.map((c, i) => (
            <Reveal key={c.label} delay={0.1 * i}>
              <button
                type="button"
                onClick={() => onAsk(c.prompt)}
                className="group flex w-full items-center gap-4 rounded-[22px] bg-night-2 p-3 text-left ring-1 ring-on-photo/10 transition-[background-color,box-shadow] hover:ring-on-photo/30 sm:flex-col sm:items-stretch lg:flex-row lg:items-center"
              >
                <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[16px] sm:h-36 sm:w-full lg:h-24 lg:w-32">
                  <Image src={SCENARIO_ART_BY_LABEL[c.label]} alt="" fill sizes="(max-width: 1024px) 40vw, 130px" className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                </span>
                <span className="min-w-0 flex-1 pr-2">
                  <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-dawn">
                    <Sparkles size={13} aria-hidden="true" /> Pídeselo a Gaia
                  </span>
                  <span className="mt-1 block font-display text-[24px] leading-tight">{c.label}</span>
                  <span className="mt-1 line-clamp-2 block text-[13.5px] leading-snug text-on-photo/70">«{c.prompt}»</span>
                </span>
                <ArrowRight size={18} className="hidden shrink-0 text-on-photo/60 transition-transform group-hover:translate-x-1 lg:block" aria-hidden="true" />
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────── Vuelo (foto a sangre con parallax) */
export function FlightBand({ image }: { image: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-14%", "14%"]);
  return (
    <section ref={ref} className="relative h-[86svh] min-h-[560px] overflow-hidden bg-night text-on-photo" aria-labelledby="vuelo">
      <motion.div className="absolute inset-[-16%_0] will-change-transform" style={{ y }}>
        <Image src={image} alt="Parapente sobre el valle de Pelileo" fill sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--night)_78%,transparent)_0%,transparent_70%)]" />
      <div className="relative mx-auto flex h-full max-w-[1240px] flex-col justify-end px-5 pb-16 sm:px-8 lg:justify-center lg:pb-0">
        <Reveal className="max-w-[560px]">
          <Eyebrow light>Cerro Nitón · Parapente biplaza</Eyebrow>
          <h2 id="vuelo" className="mt-3 font-display text-[clamp(44px,7vw,96px)] font-medium leading-[0.92] tracking-[-0.03em]">
            Vuela sobre <em className="font-normal">el valle</em>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-on-photo/85">
            Despega en biplaza con un piloto certificado y mira el Tungurahua de frente. Unos minutos en el aire que vas a contar toda la vida.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/lugar/e-parapente" className="inline-flex h-12 items-center gap-2 rounded-full bg-on-photo px-6 text-[15px] font-semibold text-ink">
              Reservar mi vuelo <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/lugar/niton-mirador" className="inline-flex h-12 items-center gap-2 rounded-full border border-on-photo/50 px-6 text-[15px] font-semibold text-on-photo backdrop-blur-sm hover:border-on-photo">
              Ver el mirador
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ────────────────────────────── Carrusel genérico con flechas */
function Rail({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 760), behavior: "smooth" });
  };
  return (
    <div className="relative">
      <div className="absolute -top-[76px] right-0 hidden gap-2 lg:flex">
        <button type="button" onClick={() => go(-1)} aria-label={`Anterior: ${label}`} className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink">
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => go(1)} aria-label={`Siguiente: ${label}`} className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink">
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div
        ref={ref}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:scroll-px-0 lg:px-0"
        role="list"
        aria-label={label}
      >
        {children}
      </div>
    </div>
  );
}

/* ────────────────────────────── Dónde comer */
export function Food() {
  const list = PLACES.filter((p) => p.category === "comer" || p.category === "beber");
  return (
    <section className="bg-bg px-5 py-24 sm:px-8 lg:py-32" aria-labelledby="comer">
      <div className="mx-auto max-w-[1240px]">
        <Reveal>
          <Eyebrow>Dónde comer</Eyebrow>
          <Heading className="max-w-[760px]">
            <span id="comer">Cocina de leña,</span> <em className="font-normal">sabor de valle</em>
          </Heading>
        </Reveal>
        <div className="mt-10">
          <Rail label="Restaurantes">
            {list.map((p, i) => {
              const img = placeImage(p);
              return (
                <Reveal key={p.id} delay={Math.min(i, 4) * 0.06} className="w-[78vw] shrink-0 snap-start sm:w-[340px]">
                  <Link href={`/lugar/${p.id}`} role="listitem" className="group block">
                    <span className="relative block h-[300px] overflow-hidden rounded-[22px] bg-bg-2 sm:h-[360px]">
                      {img && <Image src={img} alt="" fill sizes="(max-width: 640px) 78vw, 340px" className="object-cover transition-transform duration-[1.1s] ease-[var(--ease-out)] group-hover:scale-[1.05]" />}
                      {p.rating && (
                        <span className="absolute left-3 top-3 inline-flex h-8 items-center gap-1 rounded-full bg-surface/95 px-3 text-[13px] font-semibold text-ink">
                          <Star size={13} className="fill-current text-clapzy" aria-hidden="true" /> {p.rating.toFixed(1)}
                        </span>
                      )}
                    </span>
                    <span className="mt-4 block font-display text-[26px] leading-tight tracking-[-0.01em] text-ink">{p.name}</span>
                    <span className="mt-1 line-clamp-2 block text-[14.5px] leading-snug text-ink-2">{p.short}</span>
                    <span className="mt-2 flex items-center gap-2 text-[13px] text-ink-2">
                      <span className="font-semibold text-ink">{priceLabel(p)}</span>
                      <span aria-hidden="true">·</span>
                      <MapPin size={13} aria-hidden="true" /> {p.parish}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </Rail>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────── Esta semana */
export function EventsStrip() {
  const events = useDatedEvents();
  const list = (events ?? []).filter((e) => e.diff >= 0).slice(0, 4);
  return (
    <section className="bg-surface px-5 py-24 sm:px-8 lg:py-32" aria-labelledby="eventos-home">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <Eyebrow>Agenda</Eyebrow>
            <Heading>
              <span id="eventos-home">Pasa esta semana</span> <em className="font-normal">en Pelileo</em>
            </Heading>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/eventos" className="group inline-flex h-12 items-center gap-2 rounded-full border border-ink px-5 text-[14.5px] font-semibold text-ink transition-colors hover:bg-ink hover:text-surface">
              <CalendarDays size={16} aria-hidden="true" /> Toda la agenda
            </Link>
          </Reveal>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {events === null
            ? Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-[380px] rounded-[22px]" aria-hidden="true" />)
            : list.map(({ ev, date, placeName }, i) => {
                const img = eventImage(ev);
                return (
                  <Reveal key={ev.id} delay={0.07 * i}>
                    <div className="h-full">
                      <Link href="/eventos" className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-bg">
                        <span className="relative block h-[200px] overflow-hidden bg-bg-2">
                          {img && <Image src={img} alt="" fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />}
                          <span className="absolute left-3 top-3 grid min-w-[56px] place-items-center rounded-[14px] bg-surface px-2 py-1.5 text-center leading-none text-ink shadow-[var(--shadow-soft)]">
                            <span className="tabular font-display text-[24px] font-medium">{date.getDate()}</span>
                            <span className="smallcaps mt-0.5 text-[11px] font-semibold text-clapzy-ink">{monthShort(date)}</span>
                          </span>
                        </span>
                        <span className="flex flex-1 flex-col p-5">
                          <span className="text-[12.5px] font-medium text-ink-2">
                            {formatShortDate(date)} · {ev.start}
                          </span>
                          <span className="mt-1.5 block text-[17px] font-semibold leading-snug text-ink">{ev.title}</span>
                          <span className="mt-1 line-clamp-2 block text-[13.5px] leading-snug text-ink-2">{ev.short}</span>
                          <span className="mt-auto flex items-center justify-between pt-4 text-[13px]">
                            <span className="truncate text-ink-2">{placeName}</span>
                            <span className="shrink-0 font-semibold text-ink">{ev.price ? `$${ev.price}` : "Gratis"}</span>
                          </span>
                        </span>
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────── Dónde dormir */
export function Stay() {
  const list = PLACES.filter((p) => p.category === "dormir");
  return (
    <section className="bg-bg px-5 py-24 sm:px-8 lg:py-32" aria-labelledby="dormir">
      <div className="mx-auto max-w-[1240px]">
        <Reveal>
          <Eyebrow>Dónde dormir</Eyebrow>
          <Heading>
            <span id="dormir">Despierta frente</span> <em className="font-normal">al volcán</em>
          </Heading>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p, i) => {
            const img = placeImage(p);
            return (
              <Reveal key={p.id} delay={0.07 * i}>
                <Link href={`/lugar/${p.id}`} className="group relative block h-[340px] overflow-hidden rounded-[22px] bg-night lg:h-[420px]">
                  {img && <Image src={img} alt="" fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover transition-transform duration-[1.1s] group-hover:scale-[1.06]" />}
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,color-mix(in_srgb,var(--night)_85%,transparent))]" />
                  <span className="absolute inset-x-0 bottom-0 p-5 text-on-photo">
                    <span className="block text-[12.5px] text-on-photo/75">{p.parish}</span>
                    <span className="mt-0.5 block font-display text-[26px] leading-tight">{p.name}</span>
                    <span className="mt-1 block text-[13.5px] font-medium text-on-photo/90">{priceLabel(p)}</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────── Mapa (adelanto de Explorar) */
const PIN_CAT_COLOR: Record<string, string> = {
  comer: "var(--clapzy)",
  beber: "var(--clapzy)",
  dormir: "var(--ink)",
  aventura: "var(--pel-red)",
  experiencia: "var(--pel-red)",
  cultura: "var(--pel-green)",
  compras: "var(--ink-2)",
  naturaleza: "var(--pel-green)",
};

export function MapTeaser() {
  const v = VIEW_CANTON;
  const pad = 40;
  const r = (v.x1 - v.x0) / 110; // pines proporcionales a la vista
  return (
    <section className="bg-bg px-5 pb-24 sm:px-8 lg:pb-32" aria-labelledby="mapa-home">
      <div className="mx-auto grid max-w-[1240px] overflow-hidden rounded-[28px] border border-line bg-surface lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <Reveal>
            <Eyebrow>Mapa del cantón</Eyebrow>
            <Heading className="text-[clamp(32px,4vw,52px)]">
              <span id="mapa-home">Todo Pelileo</span> <em className="font-normal">en un mapa</em>
            </Heading>
            <p className="mt-5 max-w-[440px] text-[16px] leading-relaxed text-ink-2">
              Mira qué está abierto ahora, cuánto tardas en llegar y qué tienes cerca. Toca un lugar y Gaia lo suma a tu plan.
            </p>
            <Link href="/explorar" className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-surface">
              Abrir el mapa <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
        <Link href="/explorar" aria-label="Abrir el mapa" className="relative block h-[360px] overflow-hidden bg-[var(--map-land)] sm:h-[460px] lg:h-[560px]">
          <svg
            viewBox={`${v.x0 - pad} ${v.y0 - pad} ${v.x1 - v.x0 + pad * 2} ${v.y1 - v.y0 + pad * 2}`}
            preserveAspectRatio="xMidYMid slice"
            className="map-drift h-full w-full"
            aria-hidden="true"
          >
            <MapArt />
            {PLACES.map((p, i) => {
              const [x, y] = project(p.lat, p.lng);
              return (
                <g key={p.id} transform={`translate(${x} ${y})`}>
                  <circle r={r * 1.45} fill="var(--surface)" />
                  <circle r={r} fill={PIN_CAT_COLOR[p.category]} className="pin-pop" style={{ animationDelay: `${(i % 12) * 120}ms` }} />
                </g>
              );
            })}
          </svg>
        </Link>
      </div>
    </section>
  );
}

/* ────────────────────────────── Cierre */
export function FinalCta({ image, onAsk }: { image: string; onAsk: (p: string) => void }) {
  return (
    <section className="relative overflow-hidden bg-night px-5 pb-[calc(var(--tabbar-h)+64px)] pt-28 text-on-photo sm:px-8 lg:pb-24 lg:pt-36" aria-labelledby="cierre">
      <Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-45" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--night)_40%,transparent),var(--night))]" />
      <div className="relative mx-auto max-w-[900px] text-center">
        <Reveal>
          <span className="mx-auto inline-flex">
            <GaiaMark size={56} />
          </span>
          <h2 id="cierre" className="mt-6 font-display text-[clamp(44px,7vw,92px)] font-medium leading-[0.95] tracking-[-0.03em]">
            ¿Listo para <em className="font-normal text-dawn">vivir Pelileo</em>?
          </h2>
          <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-relaxed text-on-photo/80">
            Cuéntale a Gaia con quién vienes, cuántos días tienes y qué te gusta. Lo demás corre por su cuenta.
          </p>
          <div className="mx-auto mt-9 max-w-[680px] text-left">
            <GaiaBox onAsk={onAsk} autoType={false} />
          </div>
        </Reveal>
      </div>
      <footer className="relative mx-auto mt-24 flex max-w-[1240px] flex-col gap-6 border-t border-on-photo/15 pt-8 text-[13.5px] text-on-photo/70 sm:flex-row sm:items-center sm:justify-between">
        <Lockup size="sm" inverted />
        <nav aria-label="Enlaces" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/explorar" className="hover:text-on-photo">Explorar</Link>
          <Link href="/eventos" className="hover:text-on-photo">Eventos</Link>
          <Link href="/gaia" className="hover:text-on-photo">Gaia</Link>
          <Link href="/municipio" className="hover:text-on-photo">Panel del municipio</Link>
        </nav>
        <p>GAD Municipal de San Pedro de Pelileo · Demo de Clapzy</p>
      </footer>
    </section>
  );
}
