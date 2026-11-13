"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MUNICIPIO } from "@/lib/data";
import { useMounted } from "@/lib/hooks";
import { fmtNumber } from "./format";

const W = MUNICIPIO.visitorsWeekly;
const DATA = W.labels.map((l, i) => ({ semana: l, visitantes: W.visitantes[i], itinerarios: W.itinerarios[i] }));

const SERIES = [
  { key: "visitantes", label: "Visitantes", color: "var(--ink)", dash: undefined },
  { key: "itinerarios", label: "Itinerarios con Gaia", color: "var(--pel-green)", dash: undefined },
] as const;

type TipProps = { active?: boolean; label?: string; payload?: { dataKey: string; value: number }[] };
function Tip({ active, label, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const idx = W.labels.indexOf(label ?? "");
  return (
    <div className="min-w-[180px] rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[12.5px] shadow-float">
      <p className="font-semibold text-ink">
        {label === W.labels[W.labels.length - 1] ? "Esta semana" : `Semana ${idx + 1}`}
      </p>
      <ul className="mt-1.5 space-y-1">
        {SERIES.map((s) => {
          const v = payload.find((p) => p.dataKey === s.key)?.value;
          return (
            <li key={s.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-ink-2">
                <span className="h-[3px] w-3 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="font-semibold tabular text-ink">{v != null ? fmtNumber(v) : "—"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Etiqueta directa al final de cada línea. */
function EndLabel(props: { x?: number; y?: number; index?: number; value?: number; label: string }) {
  const { x, y, index, value, label } = props;
  if (index !== DATA.length - 1 || x == null || y == null) return null;
  return (
    <g>
      <text x={x - 8} y={y - 12} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--ink)">
        {fmtNumber(value ?? 0)}
      </text>
      <text x={x - 8} y={y - 26} textAnchor="end" fontSize={11} fill="var(--ink-2)">
        {label}
      </text>
    </g>
  );
}

export function WeeklyChart() {
  const mounted = useMounted();
  return (
    <div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-ink-2" aria-hidden="true">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-2">
            <span className="h-[3px] w-4 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="mt-3 h-[240px] lg:h-[260px]" role="img" aria-label="Visitantes e itinerarios por semana, últimas 12 semanas: ambos crecen de forma sostenida.">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATA} margin={{ top: 34, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="0" />
              <XAxis
                dataKey="semana"
                tickLine={false}
                axisLine={{ stroke: "var(--line)" }}
                tick={{ fontSize: 11, fill: "var(--ink-2)" }}
                interval="preserveStartEnd"
                tickFormatter={(v: string, i: number) => (i === DATA.length - 1 ? "Hoy" : v)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--ink-2)" }}
                tickFormatter={(v: number) => fmtNumber(v)}
                width={56}
              />
              <Tooltip content={<Tip />} cursor={{ stroke: "var(--ink-3)", strokeWidth: 1 }} isAnimationActive={false} />
              {SERIES.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2, fill: s.color }}
                  isAnimationActive
                  animationDuration={900}
                  label={(p: { x?: number | string; y?: number | string; index?: number; value?: unknown }) => (
                    <EndLabel x={Number(p.x)} y={Number(p.y)} index={p.index} value={Number(p.value)} label={s.label} />
                  )}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="skeleton h-full w-full rounded-xl" />
        )}
      </div>
      <details className="mt-3 text-[12.5px] text-ink-2">
        <summary className="inline-flex h-9 cursor-pointer items-center font-medium text-ink underline decoration-line underline-offset-4">
          Ver datos en tabla
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left tabular">
            <thead>
              <tr className="border-b border-line text-ink-2">
                <th className="py-1.5 pr-3 font-medium">Semana</th>
                <th className="py-1.5 pr-3 font-medium">Visitantes</th>
                <th className="py-1.5 font-medium">Itinerarios</th>
              </tr>
            </thead>
            <tbody>
              {DATA.map((d) => (
                <tr key={d.semana} className="border-b border-line/60 text-ink">
                  <td className="py-1.5 pr-3">{d.semana}</td>
                  <td className="py-1.5 pr-3">{fmtNumber(d.visitantes)}</td>
                  <td className="py-1.5">{fmtNumber(d.itinerarios)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
