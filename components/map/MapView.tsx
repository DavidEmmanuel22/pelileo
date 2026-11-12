"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { select, type Selection } from "d3-selection";
import "d3-transition";
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { easeCubicInOut } from "d3-ease";
import { CalendarDays, LocateFixed, Minus, Plus } from "lucide-react";
import type { Place } from "@/data/types";
import { getPlace } from "@/lib/data";
import { CategoryIcon } from "@/components/ui/icons";
import { MapArt } from "./MapArt";
import { MAP_LABELS } from "./labels";
import { boundsOf, KM_UNITS, MAP_SIZE, project, VIEW_CANTON, VIEW_PELILEO, type Bounds } from "./projection";

export type MapPadding = { top: number; bottom: number; left: number; right: number };

export type MapViewProps = {
  mode: "explore" | "itinerary" | "heatmap";
  places: Place[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  route?: { stops: { placeId: string; order: number }[] } | null;
  focusStop?: number | null;
  heatmap?: { lat: number; lng: number; weight: number }[];
  padding?: { top: number; bottom: number; left: number; right: number };
  intro?: boolean;
  /** Extensiones de la demo */
  onStopSelect?: (order: number) => void;
  /** Cambia este valor para volver a encuadrar (p. ej. al cambiar de día). */
  fitKey?: string | number;
  /** Marca de "origen" para Cómo llegar (modo explorar con ruta). */
  originLabel?: string;
  interactive?: boolean;
  controls?: boolean;
  className?: string;
  /** Retraso de la intro (ms), p. ej. mientras termina la pantalla de carga. */
  introDelay?: number;
};

const ZERO_PAD: MapPadding = { top: 0, bottom: 0, left: 0, right: 0 };
const MAX_K = 6;
const FLY_MS = 1500;

type Cluster = { id: string; x: number; y: number; members: Place[] };

function clusterPlaces(places: Place[], k: number, keepId?: string | null): Cluster[] {
  const R = 34 / k; // radio en unidades del lienzo
  const sorted = [...places].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  const out: Cluster[] = [];
  for (const p of sorted) {
    const [x, y] = project(p.lat, p.lng);
    if (p.id === keepId) {
      out.push({ id: p.id, x, y, members: [p] });
      continue;
    }
    let target: Cluster | null = null;
    for (const c of out) {
      if (c.members.some((m) => m.id === keepId)) continue;
      if (Math.hypot(c.x - x, c.y - y) < R) {
        target = c;
        break;
      }
    }
    if (target) {
      const n = target.members.length;
      target.x = (target.x * n + x) / (n + 1);
      target.y = (target.y * n + y) / (n + 1);
      target.members.push(p);
      target.id = `c-${target.members.map((m) => m.id).join("|")}`;
    } else out.push({ id: p.id, x, y, members: [p] });
  }
  return out;
}

/** Curva suave tipo costura entre puntos de pantalla. */
function seamPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const mx = (ax + bx) / 2,
      my = (ay + by) / 2;
    const dx = bx - ax,
      dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const bend = Math.min(60, len * 0.18) * (i % 2 ? 1 : -1);
    const cx = mx - (dy / len) * bend,
      cy = my + (dx / len) * bend;
    d += `Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
  }
  return d;
}

function kBucket(k: number) {
  return Math.round(Math.log2(k) * 4) / 4;
}

export function MapView({
  mode,
  places,
  selectedId = null,
  onSelect,
  route = null,
  focusStop = null,
  heatmap,
  padding = ZERO_PAD,
  intro = false,
  onStopSelect,
  fitKey,
  originLabel,
  interactive = true,
  controls = true,
  className = "",
  introDelay = 0,
}: MapViewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const routeUnderRef = useRef<SVGPathElement>(null);
  const routeMaskRef = useRef<SVGPathElement>(null);
  const zoomRef = useRef<ZoomBehavior<HTMLDivElement, unknown> | null>(null);
  const selRef = useRef<Selection<HTMLDivElement, unknown, null, undefined> | null>(null);
  const tRef = useRef<ZoomTransform>(zoomIdentity);
  const sizeRef = useRef({ w: 0, h: 0 });
  const padRef = useRef<MapPadding>(padding);
  const routePtsRef = useRef<[number, number][]>([]);
  const introDoneRef = useRef(!intro);
  const [bucket, setBucket] = useState(0);
  const [ready, setReady] = useState(false);
  const [tilted, setTilted] = useState(intro);
  const bucketRef = useRef(0);
  const uid = useId().replace(/:/g, "");

  padRef.current = padding;

  // ── Aplicar transform (sin re-render de React)
  const apply = useCallback((t: ZoomTransform) => {
    tRef.current = t;
    gRef.current?.setAttribute("transform", `translate(${t.x},${t.y}) scale(${t.k})`);
    const ov = overlayRef.current;
    if (ov) {
      ov.style.setProperty("--tx", String(t.x));
      ov.style.setProperty("--ty", String(t.y));
      ov.style.setProperty("--k", String(t.k));
    }
    const pts = routePtsRef.current;
    if (pts.length > 1) {
      const d = seamPath(pts.map(([x, y]) => [x * t.k + t.x, y * t.k + t.y]));
      routeRef.current?.setAttribute("d", d);
      routeUnderRef.current?.setAttribute("d", d);
      routeMaskRef.current?.setAttribute("d", d);
    }
    const b = kBucket(t.k);
    if (b !== bucketRef.current) {
      bucketRef.current = b;
      setBucket(b);
    }
  }, []);

  const transformFor = useCallback((b: Bounds, maxK = 2.4): ZoomTransform => {
    const { w, h } = sizeRef.current;
    const p = padRef.current;
    const m = Math.min(56, Math.max(24, w * 0.06)); // margen interno en px
    const aw = Math.max(80, w - p.left - p.right - m * 2);
    const ah = Math.max(80, h - p.top - p.bottom - m * 2);
    const bw = b.x1 - b.x0,
      bh = b.y1 - b.y0;
    const minK = zoomRef.current?.scaleExtent()[0] ?? 0.1;
    const k = Math.max(minK, Math.min(maxK, Math.min(aw / bw, ah / bh)));
    const cx = (b.x0 + b.x1) / 2,
      cy = (b.y0 + b.y1) / 2;
    return zoomIdentity.translate(p.left + m + aw / 2 - cx * k, p.top + m + ah / 2 - cy * k).scale(k);
  }, []);

  const centerOn = useCallback((x: number, y: number, k: number): ZoomTransform => {
    const { w, h } = sizeRef.current;
    const p = padRef.current;
    const aw = Math.max(80, w - p.left - p.right);
    const ah = Math.max(80, h - p.top - p.bottom);
    return zoomIdentity.translate(p.left + aw / 2 - x * k, p.top + ah / 2 - y * k).scale(k);
  }, []);

  const fly = useCallback((t: ZoomTransform, ms = FLY_MS) => {
    const sel = selRef.current,
      z = zoomRef.current;
    if (!sel || !z) return;
    if (ms <= 0) {
      sel.interrupt().call(z.transform, t);
      return;
    }
    sel.interrupt().transition().duration(ms).ease(easeCubicInOut).call(z.transform, t);
  }, []);

  // ── Montaje: d3-zoom + tamaño
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const sel = select(el);
    selRef.current = sel;
    const z = d3zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.1, MAX_K])
      .translateExtent([
        [-380, -380],
        [MAP_SIZE + 380, MAP_SIZE + 380],
      ])
      .filter((event: Event & { button?: number; ctrlKey?: boolean; type: string }) => {
        if (!interactive) return false;
        const target = event.target as HTMLElement | null;
        if (target?.closest?.("[data-map-ui]")) return false;
        return (!event.ctrlKey || event.type === "wheel") && !event.button;
      })
      .on("start", (e) => {
        if (e.sourceEvent) setTilted(false);
      })
      .on("zoom", (e) => apply(e.transform));
    zoomRef.current = z;
    sel.call(z).on("dblclick.zoom", null);

    const measure = () => {
      // clientWidth no se ve afectado por la inclinación (transform) de la intro
      const r = { width: el.clientWidth, height: el.clientHeight };
      sizeRef.current = { w: r.width, h: r.height };
      const fitK = Math.min(r.width, r.height) / (MAP_SIZE * 1.05);
      z.scaleExtent([Math.max(0.08, fitK), MAX_K]);
    };
    measure();
    const ro = new ResizeObserver(() => {
      const prev = sizeRef.current;
      measure();
      const cur = sizeRef.current;
      // mantener el centro al redimensionar
      if (prev.w && (prev.w !== cur.w || prev.h !== cur.h)) {
        const t = tRef.current;
        const nt = zoomIdentity.translate(t.x + (cur.w - prev.w) / 2, t.y + (cur.h - prev.h) / 2).scale(t.k);
        sel.call(z.transform, nt);
      }
    });
    ro.observe(el);

    // Vista inicial
    const initial = intro ? transformFor(VIEW_CANTON, 0.9) : transformFor(VIEW_PELILEO, 1.5);
    sel.call(z.transform, initial);
    setReady(true);

    return () => {
      ro.disconnect();
      sel.interrupt();
      sel.on(".zoom", null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Intro: vuelo suave desde el cantón hacia Pelileo
  useEffect(() => {
    if (!intro || introDoneRef.current) return;
    const t = setTimeout(() => {
      introDoneRef.current = true;
      setTilted(false);
      fly(transformFor(VIEW_PELILEO, 1.5), 1800);
    }, introDelay + 120);
    return () => clearTimeout(t);
  }, [intro, introDelay, fly, transformFor]);

  // ── Datos derivados
  const stops = useMemo(() => {
    if (!route) return [] as { placeId: string; orders: number[]; place: Place; x: number; y: number }[];
    const sorted = [...route.stops].sort((a, b) => a.order - b.order);
    const groups = new Map<string, { placeId: string; orders: number[]; place: Place; x: number; y: number }>();
    for (const s of sorted) {
      const place = getPlace(s.placeId);
      if (!place) continue;
      const g = groups.get(s.placeId);
      if (g) g.orders.push(s.order);
      else {
        const [x, y] = project(place.lat, place.lng);
        groups.set(s.placeId, { placeId: s.placeId, orders: [s.order], place, x, y });
      }
    }
    return [...groups.values()];
  }, [route]);

  const routeKey = useMemo(
    () => (route ? route.stops.map((s) => `${s.placeId}:${s.order}`).join(",") : ""),
    [route],
  );

  // puntos de la ruta (sin repetir consecutivos)
  useEffect(() => {
    const pts: [number, number][] = [];
    if (route) {
      const sorted = [...route.stops].sort((a, b) => a.order - b.order);
      let last = "";
      for (const s of sorted) {
        const p = getPlace(s.placeId);
        if (!p || s.placeId === last) continue;
        last = s.placeId;
        pts.push(project(p.lat, p.lng));
      }
    }
    routePtsRef.current = pts;
    if (pts.length < 2) {
      routeRef.current?.setAttribute("d", "");
      routeUnderRef.current?.setAttribute("d", "");
      routeMaskRef.current?.setAttribute("d", "");
    }
    apply(tRef.current);
  }, [routeKey, route, apply]);

  // ── Cámara: selección
  const prevSel = useRef<string | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (mode !== "explore") return;
    if (!selectedId) {
      prevSel.current = null;
      return;
    }
    if (prevSel.current === selectedId) return;
    prevSel.current = selectedId;
    const p = getPlace(selectedId) ?? places.find((x) => x.id === selectedId);
    if (!p) return;
    if (!introDoneRef.current) introDoneRef.current = true;
    setTilted(false);
    const [x, y] = project(p.lat, p.lng);
    if (route && route.stops.length > 1) return; // la ruta encuadra
    fly(centerOn(x, y, Math.max(1.7, Math.min(tRef.current.k, 2.6))));
  }, [selectedId, mode, ready, places, route, fly, centerOn]);

  // ── Cámara: ruta / itinerario
  useEffect(() => {
    if (!ready || !route || route.stops.length === 0) return;
    if (focusStop != null) return;
    introDoneRef.current = true;
    setTilted(false);
    const pts = stops.map((s) => [s.x, s.y] as [number, number]);
    const b = boundsOf(pts, 160);
    const padX = (b.x1 - b.x0) * 0.08,
      padY = (b.y1 - b.y0) * 0.08;
    fly(transformFor({ x0: b.x0 - padX, y0: b.y0 - padY, x1: b.x1 + padX, y1: b.y1 + padY }, 2.4), 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey, ready, fitKey]);

  useEffect(() => {
    if (!ready || focusStop == null || !route) return;
    const s = route.stops.find((x) => x.order === focusStop);
    const p = s && getPlace(s.placeId);
    if (!p) return;
    const [x, y] = project(p.lat, p.lng);
    fly(centerOn(x, y, Math.max(2.2, tRef.current.k)), 1200);
  }, [focusStop, ready, route, fly, centerOn]);

  // ── Cámara: heatmap
  useEffect(() => {
    if (!ready || mode !== "heatmap" || !heatmap?.length) return;
    const b = boundsOf(heatmap.map((h) => project(h.lat, h.lng)), 200);
    fly(transformFor({ x0: b.x0 - 120, y0: b.y0 - 120, x1: b.x1 + 120, y1: b.y1 + 120 }, 2), 1400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ready, fitKey]);

  // ── Re-encuadre suave al cambiar el padding (sheet)
  const padKey = `${padding.top}-${padding.bottom}-${padding.left}-${padding.right}`;
  const firstPad = useRef(true);
  useEffect(() => {
    if (!ready) return;
    if (firstPad.current) {
      firstPad.current = false;
      return;
    }
    if (!introDoneRef.current) return;
    if (mode === "explore" && selectedId && !(route && route.stops.length > 1)) {
      const p = getPlace(selectedId) ?? places.find((x) => x.id === selectedId);
      if (p) {
        const [x, y] = project(p.lat, p.lng);
        fly(centerOn(x, y, tRef.current.k), 600);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [padKey, ready]);

  // ── Clusters
  const clusters = useMemo(() => {
    if (mode !== "explore") return [];
    const k = Math.pow(2, bucket);
    return clusterPlaces(places, k, selectedId);
  }, [mode, places, bucket, selectedId]);

  const zoomBy = (factor: number) => {
    const sel = selRef.current,
      z = zoomRef.current;
    if (!sel || !z) return;
    setTilted(false);
    sel.interrupt().transition().duration(350).ease(easeCubicInOut).call(z.scaleBy, factor);
  };

  const recenter = () => {
    setTilted(false);
    if (route && stops.length) {
      const b = boundsOf(stops.map((s) => [s.x, s.y] as [number, number]), 160);
      fly(transformFor(b), 1000);
    } else fly(transformFor(VIEW_PELILEO, 1.5), 1000);
  };

  const showLabels = mode !== "heatmap" || true;
  const isItinerary = mode === "itinerary";

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[var(--map-paper)] ${className}`}
      style={{ perspective: 1400 }}
    >
      <div
        ref={tiltRef}
        className="absolute inset-0"
        style={{
          transformOrigin: "50% 60%",
          transform: tilted ? "rotateX(20deg) scale(1.12)" : "none",
          transition: "transform 1700ms cubic-bezier(0.65,0,0.35,1)",
        }}
      >
        <div
          ref={rootRef}
          className={`absolute inset-0 select-none ${interactive ? "cursor-grab active:cursor-grabbing" : ""}`}
          style={{ touchAction: interactive ? "none" : "auto" }}
          aria-label="Mapa ilustrado del cantón Pelileo"
          role="region"
        >
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <radialGradient id={`heat-${uid}`}>
                <stop offset="0%" stopColor="var(--pel-red)" stopOpacity={0.62} />
                <stop offset="45%" stopColor="var(--pel-red)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--pel-red)" stopOpacity={0} />
              </radialGradient>
              <filter id={`blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
            </defs>
            <g ref={gRef}>
              <MapArt />
              {mode === "heatmap" && heatmap && (
                <g filter={`url(#blur-${uid})`} style={{ mixBlendMode: "multiply" }}>
                  {heatmap.map((h, i) => {
                    const [x, y] = project(h.lat, h.lng);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={70 + h.weight * 150}
                        fill={`url(#heat-${uid})`}
                        opacity={0.35 + h.weight * 0.65}
                      />
                    );
                  })}
                </g>
              )}
            </g>
          </svg>

          {/* Capa HTML: etiquetas, ruta y pines (nítidos y accesibles) */}
          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0"
            style={{ ["--tx" as string]: "0", ["--ty" as string]: "0", ["--k" as string]: "1" }}
          >
            {showLabels &&
              MAP_LABELS.map((l) => {
                const [x, y] = project(l.lat, l.lng);
                const minB = l.kind === "town" || l.kind === "volcano" ? -10 : l.kind === "parish" ? -1.75 : -0.75;
                const visible = bucket >= minB;
                return (
                  <span
                    key={l.text}
                    className={`absolute left-0 top-0 whitespace-nowrap leading-none transition-opacity duration-300 ${
                      l.kind === "town"
                        ? "text-[12.5px] font-semibold tracking-[0.2em] text-[var(--map-label)]"
                        : l.kind === "volcano"
                          ? "text-[10.5px] font-semibold tracking-[0.16em] text-[var(--map-label)]"
                          : l.kind === "hill"
                            ? "text-[10px] font-medium italic tracking-[0.06em] text-[var(--map-label)]"
                            : l.kind === "river"
                              ? "text-[10px] font-medium italic tracking-[0.12em] text-[var(--map-water-edge)]"
                              : "text-[10px] font-semibold tracking-[0.18em] text-[var(--map-label)]"
                    } ${l.kind === "parish" || l.kind === "town" || l.kind === "volcano" ? "smallcaps" : ""}`}
                    style={{
                      transform: `translate3d(calc(var(--tx) * 1px + ${x.toFixed(1)}px * var(--k)), calc(var(--ty) * 1px + ${y.toFixed(1)}px * var(--k)), 0) translate(-50%, -50%) rotate(${l.rotate ?? 0}deg)`,
                      opacity: visible ? 1 : 0,
                      textShadow:
                        "0 0 3px var(--map-land), 0 0 3px var(--map-land), 0 0 6px var(--map-land)",
                    }}
                  >
                    {l.text}
                  </span>
                );
              })}

            {/* Ruta-costura */}
            <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
              <defs>
                <mask id={`route-${uid}`} maskUnits="userSpaceOnUse">
                  <path
                    key={routeKey}
                    ref={routeMaskRef}
                    d=""
                    fill="none"
                    stroke="white"
                    strokeWidth={14}
                    strokeLinecap="round"
                    pathLength={1}
                    className="vp-seam-draw"
                  />
                </mask>
              </defs>
              <g mask={`url(#route-${uid})`}>
                <path
                  ref={routeUnderRef}
                  d=""
                  fill="none"
                  stroke="var(--surface)"
                  strokeOpacity={0.85}
                  strokeWidth={6}
                  strokeLinecap="round"
                />
                <path
                  ref={routeRef}
                  d=""
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth={2.2}
                  strokeDasharray="6 5"
                  strokeLinecap="round"
                />
              </g>
            </svg>

            {/* Pines: explorar */}
            {mode === "explore" &&
              clusters.map((c) =>
                c.members.length > 1 ? (
                  <button
                    key={c.id}
                    type="button"
                    data-map-ui
                    aria-label={`${c.members.length} lugares: ${c.members.map((m) => m.name).join(", ")}`}
                    className="pointer-events-auto absolute left-0 top-0"
                    style={{
                      transform: `translate3d(calc(var(--tx) * 1px + ${c.x.toFixed(1)}px * var(--k)), calc(var(--ty) * 1px + ${c.y.toFixed(1)}px * var(--k)), 0)`,
                    }}
                    onClick={() => {
                      setTilted(false);
                      const b = boundsOf(
                        c.members.map((m) => project(m.lat, m.lng)),
                        60,
                      );
                      fly(transformFor({ x0: b.x0 - 30, y0: b.y0 - 30, x1: b.x1 + 30, y1: b.y1 + 30 }, MAX_K), 900);
                    }}
                  >
                    <span className="-ml-[17px] -mt-[17px] grid h-[34px] w-[34px] place-items-center rounded-full border-[1.5px] border-ink bg-surface text-[13px] font-bold text-ink shadow-[var(--shadow-pin)] transition-transform duration-200 hover:scale-110">
                      {c.members.length}
                    </span>
                  </button>
                ) : (
                  <Pin
                    key={c.id}
                    place={c.members[0]}
                    x={c.x}
                    y={c.y}
                    selected={c.members[0].id === selectedId}
                    onSelect={onSelect}
                  />
                ),
              )}

            {/* Origen de "Cómo llegar" */}
            {mode === "explore" && route && route.stops.length > 1 && (() => {
              const first = [...route.stops].sort((a, b) => a.order - b.order)[0];
              const p = getPlace(first.placeId);
              if (!p) return null;
              const [x, y] = project(p.lat, p.lng);
              return (
                <span
                  className="absolute left-0 top-0"
                  style={{
                    transform: `translate3d(calc(var(--tx) * 1px + ${x.toFixed(1)}px * var(--k)), calc(var(--ty) * 1px + ${y.toFixed(1)}px * var(--k)), 0)`,
                  }}
                >
                  <span className="-ml-[9px] -mt-[9px] grid h-[18px] w-[18px] place-items-center rounded-full bg-ink shadow-[var(--shadow-pin)]">
                    <span className="h-[7px] w-[7px] rounded-full bg-surface" />
                  </span>
                  {originLabel && (
                    <span className="absolute left-3 top-[-26px] whitespace-nowrap rounded-full bg-ink px-2 py-1 text-[11px] font-medium text-surface">
                      {originLabel}
                    </span>
                  )}
                </span>
              );
            })()}

            {/* Paradas: itinerario */}
            {isItinerary &&
              stops.map((s) => {
                const focused = focusStop != null && s.orders.includes(focusStop);
                return (
                  <button
                    key={s.placeId}
                    type="button"
                    data-map-ui
                    aria-label={`Parada ${s.orders.join(" y ")}: ${s.place.name}`}
                    onClick={() => onStopSelect?.(s.orders[0])}
                    className="pointer-events-auto absolute left-0 top-0"
                    style={{
                      transform: `translate3d(calc(var(--tx) * 1px + ${s.x.toFixed(1)}px * var(--k)), calc(var(--ty) * 1px + ${s.y.toFixed(1)}px * var(--k)), 0)`,
                      zIndex: focused ? 5 : 2,
                    }}
                  >
                    <span
                      className={`-translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border-2 border-surface bg-pel-green px-[7px] font-bold text-surface shadow-[var(--shadow-pin)] transition-all duration-300 ${
                        focused ? "h-9 min-w-9 text-[14px] ring-4 ring-[color-mix(in_srgb,var(--pel-green)_22%,transparent)]" : "h-7 min-w-7 text-[12px]"
                      }`}
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                    >
                      {s.orders.map((o) => o + 1).join("·")}
                    </span>
                    {focused && (
                      <span className="absolute left-1/2 top-[22px] -translate-x-1/2 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-[11.5px] font-semibold text-ink shadow-[var(--shadow-pin)]">
                        {s.place.name}
                      </span>
                    )}
                  </button>
                );
              })}

            {/* Pines tenues en heatmap */}
            {mode === "heatmap" &&
              places.map((p) => {
                const [x, y] = project(p.lat, p.lng);
                return (
                  <span
                    key={p.id}
                    className="absolute left-0 top-0"
                    style={{
                      transform: `translate3d(calc(var(--tx) * 1px + ${x.toFixed(1)}px * var(--k)), calc(var(--ty) * 1px + ${y.toFixed(1)}px * var(--k)), 0)`,
                    }}
                  >
                    <span className="-ml-[3.5px] -mt-[3.5px] block h-[7px] w-[7px] rounded-full border border-surface bg-ink" />
                  </span>
                );
              })}
          </div>
        </div>
      </div>

      {/* Controles */}
      {controls && interactive && (
        <div
          data-map-ui
          className="absolute right-3 z-10 flex flex-col gap-2"
          style={{ bottom: Math.max(12, padding.bottom + 12) , transition: "bottom 300ms var(--ease-out)"}}
        >
          <div className="hidden overflow-hidden rounded-xl border border-line bg-surface shadow-soft lg:flex lg:flex-col">
            <button
              type="button"
              onClick={() => zoomBy(1.6)}
              aria-label="Acercar"
              className="grid h-9 w-9 place-items-center text-ink-2 transition-colors hover:bg-bg hover:text-ink"
            >
              <Plus size={16} strokeWidth={1.8} />
            </button>
            <span className="mx-2 h-px bg-line" />
            <button
              type="button"
              onClick={() => zoomBy(1 / 1.6)}
              aria-label="Alejar"
              className="grid h-9 w-9 place-items-center text-ink-2 transition-colors hover:bg-bg hover:text-ink"
            >
              <Minus size={16} strokeWidth={1.8} />
            </button>
          </div>
          <button
            type="button"
            onClick={recenter}
            aria-label="Volver a encuadrar"
            className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface text-ink-2 shadow-soft transition-colors hover:text-ink"
          >
            <LocateFixed size={16} strokeWidth={1.8} />
          </button>
        </div>
      )}

      {/* Escala y norte */}
      {controls && (
        <div
          className="pointer-events-none absolute left-3 z-10 hidden items-end gap-3 text-[10px] font-medium text-ink-2 sm:flex"
          style={{ bottom: Math.max(12, padding.bottom + 12), transition: "bottom 300ms var(--ease-out)" }}
          aria-hidden="true"
        >
          <span className="flex flex-col items-center leading-none">
            <svg width="12" height="16" viewBox="0 0 12 16">
              <path d="M6 1 10 14 6 11 2 14Z" fill="var(--ink)" />
            </svg>
            <span className="mt-0.5">N</span>
          </span>
          <ScaleBar overlayRef={overlayRef} />
        </div>
      )}
    </div>
  );
}

function ScaleBar({ overlayRef }: { overlayRef: React.RefObject<HTMLDivElement | null> }) {
  const [k, setK] = useState(1);
  useEffect(() => {
    const id = setInterval(() => {
      const v = Number(overlayRef.current?.style.getPropertyValue("--k") || 1);
      setK((prev) => (Math.abs(prev - v) > 0.01 ? v : prev));
    }, 250);
    return () => clearInterval(id);
  }, [overlayRef]);
  const pxPerKm = KM_UNITS * k;
  const km = pxPerKm > 140 ? 0.5 : pxPerKm > 60 ? 1 : pxPerKm > 25 ? 2 : 5;
  return (
    <span className="flex flex-col gap-1 leading-none">
      <span>{km < 1 ? "500 m" : `${km} km`}</span>
      <span
        className="block h-[5px] border-x border-b border-ink-2"
        style={{ width: Math.round(pxPerKm * km) }}
      />
    </span>
  );
}

function Pin({
  place,
  x,
  y,
  selected,
  onSelect,
}: {
  place: Place;
  x: number;
  y: number;
  selected: boolean;
  onSelect?: (id: string) => void;
}) {
  const isEvent = place.id.startsWith("ev-");
  return (
    <button
      type="button"
      data-map-ui
      aria-label={place.name}
      aria-pressed={selected}
      onClick={() => onSelect?.(place.id)}
      className="group pointer-events-auto absolute left-0 top-0"
      style={{
        transform: `translate3d(calc(var(--tx) * 1px + ${x.toFixed(1)}px * var(--k)), calc(var(--ty) * 1px + ${y.toFixed(1)}px * var(--k)), 0)`,
        zIndex: selected ? 6 : place.featured ? 3 : 2,
      }}
    >
      <span
        className={`-translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full border shadow-[var(--shadow-pin)] transition-all duration-300 ${
          selected
            ? "h-10 w-10 border-ink bg-ink text-surface"
            : "h-[30px] w-[30px] border-line bg-surface text-ink group-hover:scale-110"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        {isEvent ? (
          <CalendarDays size={selected ? 18 : 14} strokeWidth={1.8} aria-hidden="true" />
        ) : (
          <CategoryIcon category={place.category} size={selected ? 18 : 14} strokeWidth={1.8} />
        )}
      </span>
      <span
        className={`pointer-events-none absolute left-1/2 top-[18px] -translate-x-1/2 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-[11.5px] font-semibold text-ink shadow-[var(--shadow-pin)] transition-opacity duration-200 ${
          selected ? "top-[24px] opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
      >
        {place.name}
      </span>
    </button>
  );
}
