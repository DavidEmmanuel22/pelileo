"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Lightbulb, X } from "lucide-react";
import { getPlace, MUNICIPIO, PLACES } from "@/lib/data";
import { useApp } from "@/lib/store";
import { useIsDesktop } from "@/lib/hooks";
import { ClapzyWordmark, Tricolor } from "@/components/brand/Brand";
import { MapView } from "@/components/map/MapView";
import { WeeklyChart } from "./WeeklyChart";
import { PublishForm } from "./PublishForm";
import { fmtKpi, fmtNumber, fmtPct } from "./format";

const M = MUNICIPIO;
const PERIODS = ["7 días", "30 días", "90 días", "Año"] as const;

export function Dashboard() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("30 días");
  const toast = useApp((s) => s.showToast);

  return (
    <div className="min-h-dvh bg-bg">
      {/* Header */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1360px] px-4 pb-5 pt-4 sm:px-6 lg:px-8 lg:pt-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="-ml-2 inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-[13px] font-medium text-ink-2 transition-colors hover:text-ink"
            >
              <ArrowLeft size={15} aria-hidden="true" /> Volver a la app
            </Link>
            <span className="flex items-center gap-1.5 text-[12px] text-ink-2">
              by <ClapzyWordmark height={11} />
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-3.5">
              <Image src="/brand/escudo-pelileo.png" alt="Escudo de San Pedro de Pelileo" width={40} height={53} className="mt-0.5 h-[53px] w-auto shrink-0" />
              <div className="min-w-0">
                <h1 className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink sm:text-[26px]">
                  Panel de Turismo · GAD Pelileo
                </h1>
                <Tricolor className="mt-2 w-40" />
                <p className="mt-2 text-[13px] text-ink-2">
                  Cantón San Pedro de Pelileo · datos de la app Vive Pelileo · actualizado hace {M.header.updatedAgoMin} min
                </p>
              </div>
            </div>
            <div
              className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0"
              role="radiogroup"
              aria-label="Período"
            >
              <div className="flex shrink-0 rounded-full border border-line bg-bg p-1">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={period === p}
                    onClick={() => {
                      setPeriod(p);
                      if (p !== "30 días") toast("Demo: los datos muestran los últimos 30 días");
                    }}
                    className={`h-10 rounded-full px-4 text-[13px] font-semibold transition-colors ${
                      period === p ? "bg-ink text-surface" : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="contenido" className="mx-auto grid max-w-[1360px] grid-cols-1 gap-4 px-4 py-5 sm:px-6 lg:grid-cols-12 lg:gap-5 lg:px-8 lg:py-8">
        {/* KPIs */}
        <section aria-label="Indicadores clave" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:col-span-12 lg:grid-cols-6 lg:gap-4">
          {M.kpis.map((k) => (
            <div key={k.id} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
              <p className="min-h-[34px] text-[12.5px] font-medium leading-snug text-ink-2">{k.label}</p>
              <p className="mt-2 text-[24px] font-bold leading-none tracking-[-0.02em] tabular text-ink lg:text-[26px]">{fmtKpi(k.value, k.format)}</p>
              <p className="mt-2 text-[12px] text-ink-2">
                <span className={`font-semibold ${k.delta >= 0 ? "text-pel-green" : "text-pel-red"}`}>
                  {k.delta >= 0 ? "▲" : "▼"} {fmtPct(Math.abs(k.delta))}
                </span>{" "}
                vs. período anterior
              </p>
            </div>
          ))}
        </section>

        {/* Semana a semana */}
        <Card className="lg:col-span-8" title="Visitantes e itinerarios por semana" subtitle="Últimas 12 semanas">
          <WeeklyChart />
        </Card>

        <Card className="lg:col-span-4" title="Visitas por día de la semana" subtitle="% del total de visitas">
          <WeekdayBars />
        </Card>

        {/* Demanda insatisfecha (estrella) */}
        <UnmetDemand />

        {/* Mapa de calor */}
        <Card className="lg:col-span-7" title="Mapa de calor de interés" subtitle="Dónde se concentran las vistas y los planes" flush>
          <Heatmap />
        </Card>

        <div className="grid gap-4 lg:col-span-5 lg:gap-5">
          <Card title="Qué le piden a Gaia" subtitle="Intención de los itinerarios">
            <HBars items={M.gaiaIntents.map((g) => ({ label: g.label, share: g.share }))} tone="clapzy" />
          </Card>
          <Card title="De dónde vienen" subtitle="Origen declarado de los visitantes">
            <HBars items={M.origin.map((g) => ({ label: g.label, share: g.share }))} tone="ink" />
          </Card>
        </div>

        <Card className="lg:col-span-7" title="Lugares más vistos vs. agregados a itinerarios" subtitle="Los 6 con más interés">
          <TopPlaces />
        </Card>

        <Card className="lg:col-span-5" title="Embudo de conversión" subtitle="De ver un lugar a reservar">
          <Funnel />
        </Card>

        {/* Gestión */}
        <Businesses />

        <Card className="lg:col-span-7" title="Publicar evento" subtitle="Aparece en la agenda pública de la app durante esta sesión">
          <PublishForm />
        </Card>
      </main>

      <footer className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 pb-10 text-[12.5px] text-ink-2 sm:px-6 lg:px-8">
        <span>Datos simulados para la demo · Vive Pelileo by Clapzy</span>
        <Link href="/" className="inline-flex h-10 items-center font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
          Ir a la app pública →
        </Link>
      </footer>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  className = "",
  flush = false,
  id,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  flush?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={`flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface ${className}`} aria-label={title}>
      <div className={flush ? "px-5 pb-3 pt-4" : "px-5 pt-4"}>
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-2">{subtitle}</p>}
      </div>
      <div className={`flex flex-1 flex-col ${flush ? "" : "px-5 pb-5 pt-4"}`}>{children}</div>
    </section>
  );
}

function WeekdayBars() {
  const { labels, values } = M.byWeekday;
  const max = Math.max(...values);
  return (
    <div className="flex h-[236px] items-end gap-2 sm:gap-3" role="list" aria-label="Visitas por día">
      {labels.map((l, i) => {
        const peak = values[i] === max;
        return (
          <div key={l} role="listitem" className="group flex h-full flex-1 flex-col items-center justify-end" title={`${l}: ${values[i]}%`}>
            <span className={`mb-1.5 text-[12px] font-semibold tabular ${peak ? "text-ink" : "text-ink-2"}`}>{values[i]}%</span>
            <span
              className={`w-full max-w-[34px] rounded-t-[4px] transition-colors ${peak ? "bg-ink" : "bg-[color-mix(in_srgb,var(--ink)_22%,var(--surface))] group-hover:bg-[color-mix(in_srgb,var(--ink)_40%,var(--surface))]"}`}
              style={{ height: `${(values[i] / max) * 170}px` }}
            />
            <span className="mt-2 text-[12px] text-ink-2">{l}</span>
          </div>
        );
      })}
    </div>
  );
}

function HBars({ items, tone }: { items: { label: string; share: number }[]; tone: "ink" | "clapzy" }) {
  const max = Math.max(...items.map((i) => i.share));
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.label} title={`${it.label}: ${fmtPct(it.share)}`}>
          <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
            <span className="truncate text-ink">{it.label}</span>
            <span className="shrink-0 font-semibold tabular text-ink">{fmtPct(it.share)}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-bg-2">
            <div
              className={`h-full rounded-full ${tone === "clapzy" ? "bg-clapzy" : "bg-ink"}`}
              style={{ width: `${(it.share / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function UnmetDemand() {
  const items = M.unmetDemand.items;
  const max = Math.max(...items.map((i) => i.searches));
  const total = items.reduce((a, i) => a + i.searches, 0);
  return (
    <section
      className="min-w-0 overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-ink bg-surface lg:col-span-12"
      aria-labelledby="demanda"
    >
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[11.5px] font-semibold text-surface">
            <Lightbulb size={13} aria-hidden="true" /> Insight clave
          </span>
          <h2 id="demanda" className="mt-2 text-[19px] font-bold tracking-[-0.02em] text-ink">
            Demanda insatisfecha
          </h2>
          <p className="mt-0.5 max-w-[640px] text-[13.5px] text-ink-2">
            Lo que los visitantes le piden a Gaia y el cantón todavía no ofrece bien. Cada fila es una oportunidad para emprendimientos locales.
          </p>
        </div>
        <p className="shrink-0 text-[13px] text-ink-2">
          <span className="text-[22px] font-bold tabular text-ink">{fmtNumber(total)}</span> búsquedas sin buena respuesta
        </p>
      </div>
      {/* Tabla (desktop) */}
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="border-b border-line text-[12px] uppercase tracking-[0.08em] text-ink-2">
            <th className="w-[30%] px-5 py-2.5 font-semibold">Búsqueda</th>
            <th className="w-[22%] px-5 py-2.5 font-semibold">Volumen</th>
            <th className="px-5 py-2.5 font-semibold">Insight</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.query} className="border-b border-line last:border-0">
              <td className="px-5 py-3.5 align-top">
                <span className="mr-2 text-[12px] font-semibold tabular text-ink-2">{i + 1}</span>
                <span className="text-[14.5px] font-semibold text-ink">«{it.query}»</span>
              </td>
              <td className="px-5 py-3.5 align-top">
                <div className="flex items-center gap-3">
                  <span className="w-10 text-[14px] font-semibold tabular text-ink">{fmtNumber(it.searches)}</span>
                  <span className="h-2 flex-1 rounded-full bg-bg-2">
                    <span className="block h-full rounded-full bg-ink" style={{ width: `${(it.searches / max) * 100}%` }} />
                  </span>
                </div>
              </td>
              <td className="px-5 py-3.5 align-top text-[14px] leading-snug text-ink">{it.insight}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Lista (mobile) */}
      <ol className="divide-y divide-line md:hidden">
        {items.map((it, i) => (
          <li key={it.query} className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-semibold text-ink">
                <span className="mr-1.5 text-[12px] text-ink-2">{i + 1}</span>«{it.query}»
              </p>
              <span className="shrink-0 text-[13px] font-semibold tabular text-ink">{fmtNumber(it.searches)}</span>
            </div>
            <span className="mt-2 block h-1.5 rounded-full bg-bg-2">
              <span className="block h-full rounded-full bg-ink" style={{ width: `${(it.searches / max) * 100}%` }} />
            </span>
            <p className="mt-2 text-[13.5px] leading-snug text-ink-2">{it.insight}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Heatmap() {
  const desktop = useIsDesktop();
  const heat = useMemo(
    () =>
      M.heatmap.points
        .map((p) => {
          const pl = getPlace(p.placeId);
          return pl ? { lat: pl.lat, lng: pl.lng, weight: p.weight } : null;
        })
        .filter((x): x is { lat: number; lng: number; weight: number } => !!x),
    [],
  );
  const top = [...M.heatmap.points].sort((a, b) => b.weight - a.weight).slice(0, 3);
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative h-[340px] border-y border-line sm:h-[400px] lg:h-auto lg:min-h-[430px] lg:flex-1">
        <MapView mode="heatmap" places={PLACES} heatmap={heat} interactive={desktop} wheelZoom={false} />
        <div className="pointer-events-none absolute left-3 top-3 rounded-xl border border-line bg-surface/95 px-3 py-2 text-[11.5px] text-ink-2 shadow-soft backdrop-blur">
          <p className="font-semibold text-ink">Interés</p>
          <span className="mt-1.5 flex items-center gap-2">
            Bajo
            <span
              className="h-2 w-20 rounded-full"
              style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--pel-red) 12%, var(--surface)), var(--pel-red))" }}
            />
            Alto
          </span>
        </div>
      </div>
      <ul className="grid gap-2 px-5 py-4 sm:grid-cols-3">
        {top.map((t, i) => (
          <li key={t.placeId} className="text-[13px]">
            <span className="text-ink-2">{i + 1}.</span> <span className="font-semibold text-ink">{getPlace(t.placeId)?.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopPlaces() {
  const max = Math.max(...M.topPlaces.map((t) => t.views));
  return (
    <div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-ink-2" aria-hidden="true">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-[color-mix(in_srgb,var(--ink)_22%,var(--surface))]" /> Vistas
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-pel-green" /> Agregados a itinerarios
        </span>
      </div>
      <ul className="mt-4 space-y-4">
        {M.topPlaces.map((t) => {
          const p = getPlace(t.placeId);
          const conv = t.addedToItinerary / t.views;
          return (
            <li key={t.placeId}>
              <div className="flex items-baseline justify-between gap-3">
                <Link href={`/lugar/${t.placeId}`} className="truncate text-[14px] font-semibold text-ink hover:underline">
                  {p?.name ?? t.placeId}
                </Link>
                <span className="shrink-0 text-[12.5px] text-ink-2">
                  <span className="font-semibold text-ink">{fmtPct(conv)}</span> <span className="hidden sm:inline">lo agrega a su plan</span><span className="sm:hidden">lo agrega</span>
                </span>
              </div>
              <div className="mt-1.5 space-y-[3px]" title={`${fmtNumber(t.views)} vistas · ${fmtNumber(t.addedToItinerary)} agregados`}>
                <div className="flex items-center gap-2">
                  <span className="block h-2.5 rounded-r-[4px] bg-[color-mix(in_srgb,var(--ink)_22%,var(--surface))]" style={{ width: `${(t.views / max) * 78}%` }} />
                  <span className="text-[11.5px] tabular text-ink-2">{fmtNumber(t.views)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="block h-2.5 rounded-r-[4px] bg-pel-green" style={{ width: `${(t.addedToItinerary / max) * 78}%` }} />
                  <span className="text-[11.5px] tabular text-ink-2">{fmtNumber(t.addedToItinerary)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Funnel() {
  const steps = M.funnel;
  const first = steps[0].value;
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const pct = s.value / first;
        const fromPrev = i > 0 ? s.value / steps[i - 1].value : null;
        return (
          <li key={s.label}>
            {fromPrev != null && (
              <p className="mb-2 flex items-center gap-1.5 pl-1 text-[12px] text-ink-2">
                <span aria-hidden="true">↓</span> {fmtPct(fromPrev)} continúa
              </p>
            )}
            <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
              <span className="text-ink">{s.label}</span>
              <span className="shrink-0 font-semibold tabular text-ink">{fmtNumber(s.value)}</span>
            </div>
            <div className="mt-1.5 h-7 rounded-lg bg-bg-2">
              <div
                className="flex h-full items-center rounded-lg bg-ink px-2 text-[11.5px] font-semibold text-surface"
                style={{ width: `${Math.max(pct * 100, 9)}%`, opacity: 1 - i * 0.16 }}
              >
                {fmtPct(pct)}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type Decision = "aprobado" | "rechazado";

function Businesses() {
  const b = M.businesses;
  const toast = useApp((s) => s.showToast);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const approved = Object.values(decisions).filter((d) => d === "aprobado").length;
  const decided = Object.keys(decisions).length;
  const max = Math.max(...b.byCategory.map((c) => c.value));

  const decide = (name: string, d: Decision) => {
    setDecisions((x) => ({ ...x, [name]: d }));
    toast(d === "aprobado" ? `${name} aprobado: ya aparece en la app` : `${name} rechazado`);
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface lg:col-span-5" aria-labelledby="negocios">
      <div className="px-5 pt-4">
        <h2 id="negocios" className="text-[16px] font-semibold tracking-[-0.01em] text-ink">
          Negocios registrados
        </h2>
        <p className="mt-0.5 text-[12.5px] text-ink-2">Gestión y verificación</p>
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        <div className="rounded-xl bg-bg p-3.5">
          <p className="text-[12px] text-ink-2">Registrados</p>
          <p className="mt-1 text-[24px] font-bold tabular text-ink">{b.registered + approved}</p>
        </div>
        <div className="rounded-xl bg-bg p-3.5">
          <p className="text-[12px] text-ink-2">Por verificar</p>
          <p className="mt-1 text-[24px] font-bold tabular text-ink">{b.pendingVerification - decided}</p>
        </div>
      </div>
      <ul className="space-y-2 px-5 pt-4">
        {b.byCategory.map((c) => (
          <li key={c.label} className="flex items-center gap-3 text-[13px]">
            <span className="w-32 shrink-0 truncate text-ink">{c.label}</span>
            <span className="h-2 flex-1 rounded-full bg-bg-2">
              <span className="block h-full rounded-full bg-ink" style={{ width: `${(c.value / max) * 100}%` }} />
            </span>
            <span className="w-6 text-right font-semibold tabular text-ink">{c.value}</span>
          </li>
        ))}
      </ul>
      <h3 className="mt-6 border-t border-line px-5 pt-4 text-[14px] font-semibold text-ink">Pendientes de verificación</h3>
      <ul className="divide-y divide-line px-5 pb-2">
        {b.pending.map((p) => {
          const d = decisions[p.name];
          return (
            <li key={p.name} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">{p.name}</p>
                <p className="text-[12.5px] text-ink-2">
                  {p.category} · {p.parish} · {p.submitted}
                </p>
              </div>
              {d ? (
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-[12.5px] font-semibold ${
                      d === "aprobado" ? "bg-green-soft text-pel-green" : "bg-red-soft text-pel-red"
                    }`}
                  >
                    {d === "aprobado" ? <Check size={13} aria-hidden="true" /> : <X size={13} aria-hidden="true" />}
                    {d === "aprobado" ? "Aprobado" : "Rechazado"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDecisions((x) => {
                        const n = { ...x };
                        delete n[p.name];
                        return n;
                      })
                    }
                    className="inline-flex h-10 items-center rounded-full px-2 text-[12.5px] font-medium text-ink-2 underline underline-offset-4 hover:text-ink"
                  >
                    Deshacer
                  </button>
                </span>
              ) : (
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => decide(p.name, "aprobado")}
                    className="inline-flex h-10 items-center gap-1 rounded-full bg-ink px-4 text-[13px] font-semibold text-surface transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_86%,var(--surface))]"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(p.name, "rechazado")}
                    className="inline-flex h-10 items-center rounded-full border border-line px-4 text-[13px] font-semibold text-ink transition-colors hover:border-ink-3"
                  >
                    Rechazar
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="flex items-center gap-1 px-5 pb-4 pt-1 text-[12px] text-ink-2">
        <ArrowUpRight size={12} aria-hidden="true" /> Los negocios aprobados se suman al mapa de la app.
      </p>
    </section>
  );
}
