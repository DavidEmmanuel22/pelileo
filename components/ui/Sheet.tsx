"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useDragControls, useMotionValue } from "framer-motion";
import { useMapStore } from "@/lib/mapStore";
import { useIsDesktop } from "@/lib/hooks";

export type SheetHandle = {
  snapTo: (index: number) => void;
  scrollToTop: () => void;
  scroller: () => HTMLDivElement | null;
};

type Props = {
  /** Posiciones como fracción del alto disponible (de menor a mayor), p. ej. [0.15, 0.5, 0.92]. */
  snaps: number[];
  initial?: number;
  header?: React.ReactNode;
  children: React.ReactNode;
  label: string;
  onSnapChange?: (index: number) => void;
  /** Contenido fijo al pie (p. ej. la caja de chat de Gaia). */
  footer?: React.ReactNode;
  className?: string;
  /** Entra deslizándose desde abajo al montar. */
  enterDelay?: number;
};

/**
 * Mobile/tablet: sheet inferior arrastrable con posiciones fijas (máx. 560px de ancho en tablet).
 * Desktop (≥1024px): panel lateral izquierdo de 420px con scroll propio.
 */
export const Sheet = forwardRef<SheetHandle, Props>(function Sheet(
  { snaps, initial = 0, header, children, label, onSnapChange, footer, className = "", enterDelay = 0 },
  ref,
) {
  const desktop = useIsDesktop();
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [H, setH] = useState(0);
  const [snap, setSnap] = useState(initial);
  const y = useMotionValue(10000);
  const controls = useDragControls();
  const setSheetPx = useMapStore((s) => s.setSheetPx);
  const max = snaps[snaps.length - 1];
  const entered = useRef(false);

  const yFor = useCallback((i: number) => (max - snaps[i]) * H, [H, max, snaps]);
  // Lo que tapará el sheet en reposo (el mapa encuadra con esto; tope 62% del alto)
  const coverFor = useCallback((i: number) => Math.min(snaps[i] * H, H * 0.62), [H, snaps]);

  // Alto disponible = alto del contenedor del layout con mapa
  useLayoutEffect(() => {
    const parent = wrapRef.current?.parentElement;
    if (!parent) return;
    const measure = () => setH(parent.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  // Posición inicial / al cambiar de tamaño
  useEffect(() => {
    if (!H || desktop) return;
    setSheetPx(coverFor(snap));
    if (!entered.current) {
      entered.current = true;
      y.set(H * max + 40);
      const t = setTimeout(() => {
        animate(y, yFor(snap), { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
      }, enterDelay);
      return () => clearTimeout(t);
    }
    y.set(yFor(snap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [H, desktop]);

  const go = useCallback(
    (i: number) => {
      const idx = Math.max(0, Math.min(snaps.length - 1, i));
      setSnap(idx);
      onSnapChange?.(idx);
      if (!desktop) {
        setSheetPx(coverFor(idx));
        animate(y, yFor(idx), { duration: 0.38, ease: [0.22, 1, 0.36, 1] });
      }
    },
    [desktop, onSnapChange, snaps.length, y, yFor, coverFor, setSheetPx],
  );

  useImperativeHandle(
    ref,
    () => ({
      snapTo: go,
      scrollToTop: () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }),
      scroller: () => scrollRef.current,
    }),
    [go],
  );

  // En desktop el panel no se desplaza: limpiamos cualquier transform previo
  useLayoutEffect(() => {
    if (desktop) {
      y.set(0);
      setSheetPx(0);
    }
  }, [desktop, setSheetPx, y]);
  useEffect(() => () => setSheetPx(0), [setSheetPx]);

  const onDragEnd = (_: unknown, info: { velocity: { y: number } }) => {
    const cur = y.get();
    const projected = cur + info.velocity.y * 0.18;
    let best = 0;
    let bestD = Infinity;
    snaps.forEach((_, i) => {
      const d = Math.abs(yFor(i) - projected);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    go(best);
  };

  const atTop = snap === snaps.length - 1;

  const startDrag = (e: React.PointerEvent) => {
    if (desktop) return;
    controls.start(e);
  };

  return (
    <>
    <motion.section
      ref={wrapRef}
      aria-label={label}
      drag={desktop ? false : "y"}
      dragControls={controls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: H ? yFor(0) + 40 : 0 }}
      dragElastic={0.08}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      style={desktop ? { y } : { y, height: H ? H * max : `${max * 100}%` }}
      className={`absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-[560px] flex-col rounded-t-[var(--radius-sheet)] border border-b-0 border-line bg-surface shadow-float lg:inset-y-0 lg:left-0 lg:right-auto lg:mx-0 lg:h-auto lg:w-[var(--panel-w)] lg:max-w-none lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:shadow-none ${className}`}
    >
      {/* Asa + encabezado: siempre arrastrables en mobile */}
      <div
        onPointerDown={startDrag}
        className="panel-in shrink-0 touch-none select-none lg:touch-auto lg:select-auto"
      >
        <button
          type="button"
          aria-label={atTop ? "Bajar el panel" : "Subir el panel"}
          onClick={() => go(atTop ? Math.max(0, snaps.length - 2) : snaps.length - 1)}
          className="flex h-6 w-full items-center justify-center lg:hidden"
        >
          <span className="h-[5px] w-10 rounded-full bg-line" />
        </button>
        {header}
      </div>
      <div
        ref={scrollRef}
        id="contenido"
        tabIndex={-1}
        data-sheet-scroller
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
          if (!atTop && !desktop) startDrag(e);
        }}
        className={`panel-in thin-scrollbar min-h-0 flex-1 overscroll-contain focus:outline-none ${footer ? "pb-[88px] lg:pb-0" : ""} ${
          atTop || desktop ? "overflow-y-auto" : "overflow-hidden touch-none lg:touch-auto"
        }`}
      >
        {children}
      </div>
      {footer && desktop && <div className="shrink-0">{footer}</div>}
    </motion.section>
    {/* Mobile/tablet: el pie queda fijo abajo, visible en cualquier posición del sheet (menos la mínima) */}
    {footer && !desktop && (
      <div
        className={`absolute inset-x-0 bottom-0 z-30 mx-auto max-w-[560px] transition-[opacity,transform] duration-300 lg:hidden ${
          snap === 0 ? "pointer-events-none translate-y-3 opacity-0" : "opacity-100"
        }`}
      >
        {footer}
      </div>
    )}
    </>
  );
});

/**
 * Lleva un elemento a la vista desplazando SOLO el scroller del sheet
 * (scrollIntoView también movería el contenedor fijo del mapa).
 */
export function scrollIntoSheet(el: Element | null | undefined, block: "start" | "center" | "end" = "start", offset = 12) {
  if (!el) return;
  const sc = el.closest<HTMLElement>("[data-sheet-scroller]");
  if (!sc) return;
  const r = el.getBoundingClientRect();
  const s = sc.getBoundingClientRect();
  const rel = r.top - s.top + sc.scrollTop;
  let top = rel - offset;
  if (block === "center") top = rel - (sc.clientHeight - r.height) / 2;
  if (block === "end") top = rel + r.height - sc.clientHeight + offset;
  sc.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}
