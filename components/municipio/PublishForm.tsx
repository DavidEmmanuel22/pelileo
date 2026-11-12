"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { EventItem } from "@/data/types";
import { EVENT_CATEGORY_LABEL, PLACES, getPlace } from "@/lib/data";
import { useApp } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { WEEKDAYS } from "@/lib/time";

const CATS = Object.keys(EVENT_CATEGORY_LABEL) as EventItem["category"][];
const PLACE_OPTIONS = [...PLACES].filter((p) => p.real || p.category === "cultura").sort((a, b) => a.name.localeCompare(b.name, "es"));

function iso(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

type Form = {
  title: string;
  placeId: string;
  date: string;
  start: string;
  end: string;
  category: EventItem["category"];
  price: string;
  short: string;
};

const field =
  "mt-1.5 h-12 w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink transition-colors placeholder:text-ink-2 hover:border-ink-3 focus:border-ink focus:outline-none";
const label = "block text-[13px] font-semibold text-ink";

export function PublishForm() {
  const now = useNow();
  const publish = useApp((s) => s.publishEvent);
  const toast = useApp((s) => s.showToast);
  const published = useApp((s) => s.published);
  const nextSaturday = useMemo(() => {
    if (!now) return "";
    const d = new Date(now);
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
    return iso(d);
  }, [now]);

  const [f, setF] = useState<Form>({
    title: "",
    placeId: "parque-central",
    date: "",
    start: "10:00",
    end: "13:00",
    category: "cultura",
    price: "0",
    short: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [done, setDone] = useState<string | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const date = f.date || nextSaturday;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (f.title.trim().length < 4) err.title = "Escribe un título (mínimo 4 letras).";
    if (!date || (now && date < iso(now))) err.date = "Elige una fecha de hoy en adelante.";
    if (f.end <= f.start) err.end = "La hora de fin debe ser después del inicio.";
    const price = Number(f.price || 0);
    if (!Number.isFinite(price) || price < 0) err.price = "Ingresa un precio válido (0 = gratis).";
    setErrors(err);
    if (Object.keys(err).length) return;
    const place = getPlace(f.placeId)!;
    const [y, m, d] = date.split("-").map(Number);
    const wd = WEEKDAYS[new Date(y, m - 1, d).getDay()];
    const id = `pub-${Date.now().toString(36)}`;
    publish({
      id,
      title: f.title.trim(),
      placeId: place.id,
      lat: place.lat,
      lng: place.lng,
      weekday: wd,
      weeksAhead: 0,
      start: f.start,
      end: f.end,
      category: f.category,
      price,
      short: f.short.trim() || `Organiza el GAD Municipal de Pelileo en ${place.name}.`,
      imageQuery: "",
      date,
      publishedAt: Date.now(),
    });
    toast("Evento publicado en la app");
    setDone(id);
    setF((x) => ({ ...x, title: "", short: "" }));
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      {done && (
        <div className="flex items-start gap-3 rounded-xl bg-green-soft px-4 py-3 sm:col-span-2" role="status">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-pel-green" aria-hidden="true" />
          <p className="text-[14px] text-ink">
            <span className="font-semibold">Publicado.</span> Ya aparece en la agenda pública de esta sesión.{" "}
            <Link href={`/eventos#${done}`} className="font-semibold underline underline-offset-4">
              Ver en Eventos →
            </Link>
          </p>
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor="ev-title" className={label}>
          Título
        </label>
        <input
          id="ev-title"
          value={f.title}
          onChange={(e) => set("title", e.target.value.slice(0, 80))}
          placeholder="Ej.: Feria de emprendedores del cantón"
          className={field}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "ev-title-err" : undefined}
        />
        {errors.title && <p id="ev-title-err" className="mt-1 text-[12.5px] font-medium text-pel-red">{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="ev-place" className={label}>
          Lugar
        </label>
        <select id="ev-place" value={f.placeId} onChange={(e) => set("placeId", e.target.value)} className={field}>
          {PLACE_OPTIONS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="ev-cat" className={label}>
          Categoría
        </label>
        <select id="ev-cat" value={f.category} onChange={(e) => set("category", e.target.value as EventItem["category"])} className={field}>
          {CATS.map((c) => (
            <option key={c} value={c}>
              {EVENT_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="ev-date" className={label}>
          Fecha
        </label>
        <input
          id="ev-date"
          type="date"
          value={date}
          min={now ? iso(now) : undefined}
          onChange={(e) => set("date", e.target.value)}
          className={field}
          aria-invalid={!!errors.date}
        />
        {errors.date && <p className="mt-1 text-[12.5px] font-medium text-pel-red">{errors.date}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ev-start" className={label}>
            Inicio
          </label>
          <input id="ev-start" type="time" value={f.start} onChange={(e) => set("start", e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="ev-end" className={label}>
            Fin
          </label>
          <input id="ev-end" type="time" value={f.end} onChange={(e) => set("end", e.target.value)} className={field} aria-invalid={!!errors.end} />
        </div>
        {errors.end && <p className="col-span-2 -mt-1 text-[12.5px] font-medium text-pel-red">{errors.end}</p>}
      </div>
      <div>
        <label htmlFor="ev-price" className={label}>
          Precio por persona (USD)
        </label>
        <input
          id="ev-price"
          type="number"
          inputMode="decimal"
          min={0}
          value={f.price}
          onChange={(e) => set("price", e.target.value)}
          className={field}
          aria-describedby="ev-price-help"
        />
        <p id="ev-price-help" className="mt-1 text-[12.5px] text-ink-2">
          {errors.price ? <span className="font-medium text-pel-red">{errors.price}</span> : "0 = gratis"}
        </p>
      </div>
      <div>
        <span className={label}>Imagen</span>
        <p className="mt-1.5 flex h-12 items-center rounded-xl border border-dashed border-line px-3.5 text-[13.5px] text-ink-2">
          Se usa la foto del lugar elegido
        </p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="ev-short" className={label}>
          Descripción corta
        </label>
        <input
          id="ev-short"
          value={f.short}
          onChange={(e) => set("short", e.target.value.slice(0, 120))}
          placeholder="Una línea que invite a ir"
          className={field}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[15px] font-semibold text-surface transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_86%,var(--surface))]">
          Publicar evento
        </button>
        <span className="text-[12.5px] text-ink-2">
          {published.length ? `${published.length} publicado${published.length === 1 ? "" : "s"} en esta sesión` : "Aparece al instante en la app pública"}
        </span>
      </div>
    </form>
  );
}
