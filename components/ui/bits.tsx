"use client";

import Link from "next/link";
import { Cloud, CloudSun, Sun } from "lucide-react";
import type { ItineraryDay } from "@/data/types";
import { useNow } from "@/lib/hooks";
import { weekdayOf } from "@/lib/time";
import { CONDITION_LABEL, weatherFor } from "@/lib/gaia/weather";
import { GaiaMark } from "@/components/brand/Brand";

export function WeatherIcon({ condition, size = 15 }: { condition: ItineraryDay["weather"]["condition"]; size?: number }) {
  const Icon = condition === "soleado" ? Sun : condition === "parcial" ? CloudSun : Cloud;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}

/** Chip de clima discreto ("18° · Parcialmente nublado"), simulado por día de la semana. */
export function WeatherChip({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const now = useNow();
  if (!now) return <span className={`skeleton inline-block h-9 ${compact ? "w-20 sm:w-44" : "w-44"} rounded-full ${className}`} aria-hidden="true" />;
  const w = weatherFor(weekdayOf(now));
  return (
    <span
      className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface/95 px-3 text-[12.5px] font-medium text-ink shadow-soft backdrop-blur ${className}`}
      aria-label={`Clima hoy en Pelileo: ${w.tempC} grados, ${CONDITION_LABEL[w.condition]}`}
    >
      <WeatherIcon condition={w.condition} />
      <span className="tabular">{w.tempC}°</span>
      <span className={`text-ink-2 ${compact ? "hidden sm:inline" : ""}`}>· {CONDITION_LABEL[w.condition]}</span>
    </span>
  );
}

export function Chip({
  active,
  onClick,
  children,
  gaia = false,
  className = "",
  ...rest
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  gaia?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = gaia
    ? active
      ? "border-clapzy bg-clapzy text-surface"
      : "border-[color-mix(in_srgb,var(--clapzy)_35%,var(--line))] bg-clapzy-soft text-clapzy-ink hover:border-clapzy"
    : active
      ? "border-ink bg-ink text-surface"
      : "border-line bg-surface text-ink hover:border-ink-3";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[13.5px] font-medium transition-colors duration-200 ${base} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children, action, id }: { children: React.ReactNode; action?: React.ReactNode; id?: string }) {
  return (
    <div className="flex items-end justify-between gap-3 px-5">
      <h2 id={id} className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
        {children}
      </h2>
      {action}
    </div>
  );
}

/** Tarjeta discreta que sugiere Gaia (en la portada Gaia no aparece de otra forma). */
export function GaiaTeaser({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/gaia"
      className={`group flex items-center gap-3.5 rounded-[var(--radius-card)] border border-line bg-surface p-4 transition-colors duration-200 hover:border-[color-mix(in_srgb,var(--clapzy)_45%,var(--line))] ${className}`}
    >
      <GaiaMark size={40} />
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold text-ink">¿No sabes por dónde empezar?</span>
        <span className="mt-0.5 block text-[13.5px] text-ink-2">
          Arma tu plan con <span className="font-semibold text-clapzy-ink">Gaia</span>
          <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </span>
      </span>
    </Link>
  );
}

export function Stars({ rating, reviews }: { rating?: number; reviews?: number }) {
  if (!rating) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[13px] text-ink" aria-label={`${rating} de 5, ${reviews ?? 0} reseñas`}>
      <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8Z"
          fill="var(--ink)"
        />
      </svg>
      <span className="font-semibold tabular">{rating.toFixed(1)}</span>
      {reviews != null && <span className="text-ink-2">({reviews})</span>}
    </span>
  );
}

export function FooterLinks() {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 pb-8 pt-5 text-[12.5px] text-ink-2">
      <span>Demo de Vive Pelileo · contenido ilustrativo</span>
      <Link
        href="/municipio"
        className="inline-flex h-10 items-center rounded-full px-1 font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
      >
        Vista municipio →
      </Link>
    </div>
  );
}
