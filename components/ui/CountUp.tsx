"use client";
import { useEffect, useRef, useState } from "react";
import { miles } from "@/lib/format";

/** Número que cuenta al entrar en pantalla. El valor final está en el HTML desde el inicio (accesible y sin JS). */
export function CountUp({ to, prefix = "", suffix = "", duration = 1.8, className = "" }: { to: number; prefix?: string; suffix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let started = false;
    setVal(0);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started) return;
        started = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / (duration * 1000));
          const eased = 1 - Math.pow(1 - p, 4);
          setVal(to * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);
  return (
    <span ref={ref} className={`tabular ${className}`}>
      <span aria-hidden="true">
        {prefix}
        {miles(val)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {miles(to)}
        {suffix}
      </span>
    </span>
  );
}
