"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { drawCity, type CityState } from "@/lib/city";

/** Canvas del mapa nocturno. El estado (ref mutable) lo mueve GSAP; dibuja solo cuando está en pantalla. */
export function CityCanvas({ state, className = "" }: { state: React.MutableRefObject<CityState>; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d", { alpha: true })!;
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
    let w = 0;
    let h = 0;
    const size = () => {
      const r = cv.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = (t: number) => drawCity(ctx, w, h, dpr, state.current, reduce ? 0 : t);
    let on = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) {
        on = true;
        gsap.ticker.add(tick);
      } else if (!e.isIntersecting && on) {
        on = false;
        gsap.ticker.remove(tick);
      }
    });
    io.observe(cv);
    return () => {
      io.disconnect();
      ro.disconnect();
      gsap.ticker.remove(tick);
    };
  }, [state]);
  return <canvas ref={ref} className={`block h-full w-full ${className}`} aria-hidden="true" />;
}
