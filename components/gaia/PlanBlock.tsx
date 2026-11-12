"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Bookmark, BookmarkCheck, Car, Footprints, MessageCircle, RefreshCw, Share2, X } from "lucide-react";
import type { ItineraryDay } from "@/data/types";
import { getPlace, placeImage } from "@/lib/data";
import { itineraryTotal, CONDITION_LABEL, type GaiaItinerary } from "@/lib/gaia";
import { travelLabel } from "@/lib/geo";
import { durationLabel } from "@/lib/time";
import { useApp } from "@/lib/store";
import { useGaia, type ChatMsg } from "@/lib/gaiaStore";
import { Photo } from "@/components/ui/Photo";
import { WeatherIcon } from "@/components/ui/bits";
import { GaiaMark } from "@/components/brand/Brand";

function groupLabel(g: GaiaItinerary["group"]): string {
  const a = `${g.adults} ${g.adults === 1 ? "adulto" : "adultos"}`;
  if (!g.kids) return g.type === "pareja" ? "En pareja" : g.type === "solo" ? "Solo tú" : a;
  return `${a} y ${g.kids} ${g.kids === 1 ? "niño" : "niños"}`;
}

function daysLabel(it: GaiaItinerary): string {
  if (it.days.length === 1) {
    const last = it.days[0].steps[it.days[0].steps.length - 1];
    if (it.days[0].steps.length <= 4 && last && last.time < "15:00") return "Medio día";
    return "1 día";
  }
  return `${it.days.length} días`;
}

export function PlanBlock({
  it,
  dayIdx,
  focusStop,
  busy,
  update,
  updateQ,
  onAdjust,
}: {
  it: GaiaItinerary;
  dayIdx: number;
  focusStop: number | null;
  busy: boolean;
  update?: ChatMsg;
  updateQ?: string;
  onAdjust: () => void;
}) {
  const total = itineraryTotal(it);
  const left = it.budget - total;
  const ok = left >= 0;
  const pct = Math.min(100, Math.round((total / Math.max(1, it.budget)) * 100));
  const day = it.days[dayIdx];
  const prompt = useGaia((s) => s.prompt);
  const setDay = useGaia((s) => s.setDay);
  const saved = useApp((s) => s.savedPlans.some((p) => p.id === it.id && JSON.stringify(p.itinerary.days) === JSON.stringify(it.days)));
  const savePlan = useApp((s) => s.savePlan);
  const toast = useApp((s) => s.showToast);

  const share = async () => {
    const url = `${window.location.origin}/gaia?q=${encodeURIComponent(prompt || it.title)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${it.title} · Vive Pelileo`, text: "Mira el plan que me armó Gaia para Pelileo", url });
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copiado. Compártelo donde quieras");
    } catch {
      toast("No pude copiar el link");
    }
  };

  return (
    <section className="mt-5" aria-label={`Plan: ${it.title}`}>
      {/* Último ajuste */}
      {update && <UpdateNote m={update} q={updateQ} />}

      {/* Resumen */}
      <div className="mx-5 rounded-[var(--radius-card)] border border-line bg-surface p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-2">Tu plan</p>
        <h2 className="mt-1 text-[19px] font-bold leading-tight tracking-[-0.02em] text-ink">{it.title}</h2>
        <p className="mt-1 text-[13.5px] text-ink-2">
          {daysLabel(it)} · {groupLabel(it.group)} · Presupuesto ${it.budget}
        </p>
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-[13.5px]">
            <span className="text-ink">
              <span className="font-bold tabular">${total}</span> <span className="text-ink-2">de ${it.budget}</span>
            </span>
            <span className={`font-semibold ${ok ? "text-pel-green" : "text-pel-red"}`}>
              {ok ? (left === 0 ? "Justo en tu presupuesto" : `Te sobran $${left}`) : `Te pasas por $${-left}`}
            </span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-bg-2"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={it.budget}
            aria-valuenow={total}
            aria-label="Presupuesto usado"
          >
            <motion.div
              className={`h-full rounded-full ${ok ? "bg-pel-green" : "bg-pel-red"}`}
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <ActionBtn onClick={() => savePlan(it)} pressed={saved} label={saved ? "Guardado" : "Guardar plan"}>
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </ActionBtn>
          <ActionBtn onClick={share} label="Compartir">
            <Share2 size={16} />
          </ActionBtn>
          <ActionBtn onClick={onAdjust} label="Ajustar">
            <MessageCircle size={16} />
          </ActionBtn>
        </div>
      </div>


      {/* Tabs por día */}
      {it.days.length > 1 && (
        <div className="sticky top-0 z-10 mt-4 border-b border-line bg-surface px-5" role="tablist" aria-label="Días del plan">
          <div className="no-scrollbar flex gap-1 overflow-x-auto" data-no-drag>
            {it.days.map((d, i) => (
              <button
                key={`${d.weekday}-${i}`}
                role="tab"
                type="button"
                aria-selected={i === dayIdx}
                onClick={() => setDay(i)}
                className={`relative flex h-12 shrink-0 items-center gap-2 px-3 text-[14px] font-semibold transition-colors ${
                  i === dayIdx ? "text-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                <span>
                  Día {i + 1} · {d.label}
                </span>
                <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-2">
                  <WeatherIcon condition={d.weather.condition} size={14} />
                  {d.weather.tempC}°
                </span>
                {i === dayIdx && <motion.span layoutId="day-tab" className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-ink" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <DayView key={`${dayIdx}-${it.id}`} day={day} dayIdx={dayIdx} focusStop={focusStop} busy={busy} single={it.days.length === 1} />
    </section>
  );
}

function ActionBtn({ children, label, onClick, pressed }: { children: React.ReactNode; label: string; onClick: () => void; pressed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className="flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl border border-line text-[12px] font-semibold text-ink transition-colors hover:border-ink-3 [&_svg]:shrink-0"
    >
      <span aria-hidden="true">{children}</span>
      {label}
    </button>
  );
}

function UpdateNote({ m, q }: { m: ChatMsg; q?: string }) {
  const streamId = useGaia((s) => s.streamId);
  const words = useGaia((s) => s.streamWords);
  const text = streamId === m.id ? m.text.split(/\s+/).slice(0, words).join(" ") : m.text;
  return (
    <motion.div
      key={m.id}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-5 mb-3 flex gap-2.5 rounded-[var(--radius-card)] bg-clapzy-soft px-4 py-3"
      role="status"
    >
      <GaiaMark size={24} />
      <div className="min-w-0 flex-1">
        {q && <p className="text-[12.5px] text-ink-2">Pediste: «{q}»</p>}
        <p className="text-[14px] leading-snug text-ink">{text}</p>
      </div>
    </motion.div>
  );
}

function DayView({
  day,
  dayIdx,
  focusStop,
  busy,
  single,
}: {
  day: ItineraryDay;
  dayIdx: number;
  focusStop: number | null;
  busy: boolean;
  single: boolean;
}) {
  const swap = useGaia((s) => s.swap);
  const remove = useGaia((s) => s.remove);
  const setFocus = useGaia((s) => s.setFocus);
  const dayTotal = useMemo(() => day.steps.reduce((a, s) => a + s.cost, 0), [day]);

  return (
    <div className="px-5 pt-4">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-bg px-3.5 py-2.5 text-[13px]">
        <span className="flex items-center gap-2 text-ink">
          <WeatherIcon condition={day.weather.condition} size={16} />
          <span className="font-semibold">
            {single ? day.label : `${day.label}`} · {day.weather.tempC}° {CONDITION_LABEL[day.weather.condition].toLowerCase()}
          </span>
        </span>
        <span className="shrink-0 text-ink-2">${dayTotal} este día</span>
      </div>
      {day.weather.tip && <p className="mt-2 px-1 text-[12.5px] text-ink-2">{day.weather.tip}</p>}

      <ol className="mt-4">
        {day.steps.map((s, i) => {
          const p = getPlace(s.placeId);
          const focused = focusStop === i;
          const travel = travelLabel(s.travelFromPrevMin, s.travelMode);
          const TravelIcon = s.travelMode === "a pie" ? Footprints : Car;
          return (
            <Fragment key={`${s.placeId}-${s.time}-${i}`}>
              {i > 0 && (
                <li aria-hidden={!travel} className="flex min-h-7 items-center gap-3 py-1 pl-[60px]">
                  <span className="ml-[13px] h-full w-px self-stretch border-l-[1.5px] border-dashed border-line" />
                  {travel && (
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink-2">
                      <TravelIcon size={13} aria-hidden="true" />
                      {travel}
                    </span>
                  )}
                </li>
              )}
              <motion.li
                id={`step-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="scroll-mt-16"
              >
                <div className="flex gap-3">
                  <div className="w-12 shrink-0 pt-3 text-right">
                    <span className="text-[13.5px] font-bold tabular text-ink">{s.time}</span>
                  </div>
                  <div className="flex flex-col items-center pt-2.5">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full text-[12px] font-bold text-surface transition-all duration-300 ${
                        focused ? "scale-110 bg-pel-green ring-4 ring-[color-mix(in_srgb,var(--pel-green)_20%,transparent)]" : "bg-pel-green"
                      }`}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                  </div>
                  <div
                    className={`min-w-0 flex-1 rounded-[var(--radius-card)] border bg-surface transition-[border-color,box-shadow] duration-300 ${
                      focused ? "border-ink shadow-soft" : "border-line"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setFocus(focused ? null : i)}
                      aria-label={`Parada ${i + 1}: ${s.title}, ${s.time}. Ver en el mapa`}
                      className="flex w-full gap-3 p-3 text-left"
                    >
                      <Photo
                        src={p ? placeImage(p) : null}
                        alt=""
                        category={p?.category}
                        className="h-14 w-14 shrink-0 rounded-xl"
                        sizes="56px"
                        iconSize={18}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold leading-snug text-ink">{s.title}</span>
                        <span className="mt-0.5 block text-[12.5px] text-ink-2">
                          {durationLabel(s.durationMin)} · <span className="font-semibold text-ink">{s.cost ? `$${s.cost}` : "Gratis"}</span>
                          {s.optional && " · opcional"}
                        </span>
                      </span>
                    </button>
                    {s.note && (
                      <p className="px-3 pb-2 text-[13px] leading-snug text-ink-2">
                        <span className="font-semibold text-clapzy-ink">Por qué lo elegí: </span>
                        {s.note}
                      </p>
                    )}
                    <div className="flex items-center gap-1 border-t border-line px-1.5 py-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => swap(dayIdx, i)}
                        className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-bg disabled:opacity-40"
                      >
                        <RefreshCw size={14} aria-hidden="true" />
                        Cambiar por otra
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => remove(dayIdx, i)}
                        aria-label={`Quitar ${s.title}`}
                        className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-bg hover:text-ink disabled:opacity-40"
                      >
                        <X size={14} aria-hidden="true" />
                        Quitar
                      </button>
                      {p && (
                        <Link
                          href={`/lugar/${p.id}`}
                          aria-label={`Ver ${p.name}`}
                          title="Ver lugar"
                          className="ml-auto grid h-10 w-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-bg hover:text-ink"
                        >
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.li>
            </Fragment>
          );
        })}
      </ol>
      {day.steps.length === 0 && (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line px-4 py-6 text-center text-[14px] text-ink-2">
          Este día quedó vacío. Pídele a Gaia que lo llene: «agrega algo de aventura».
        </p>
      )}
    </div>
  );
}
