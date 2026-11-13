"use client";
import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { track } from "@/lib/analytics";
import { config, escenas, nav } from "@/content/site";
import { Lockup } from "./Lockup";
import { Magnetic } from "./Magnetic";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/* ── Scroll suave (Lenis) sincronizado con ScrollTrigger ─────────── */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 3.2) });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // Enlaces internos (#agendar, #gaia…): desplazamiento suave y foco en el destino
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      scrollToId(id);
      history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  // Lleva el foco al destino (sin saltar) para que el teclado y los lectores de pantalla sigan ahí
  const focus = () => {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };
  if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.6, onComplete: focus });
  else {
    el.scrollIntoView({ behavior: "smooth" });
    focus();
  }
}

/* ── Navegación superior ─────────────────────────────────────────── */
export function Nav() {
  const ref = useRef<HTMLElement>(null);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let hidden = false;
    const on = () => {
      const y = window.scrollY;
      setSolid(y > window.innerHeight * 0.6);
      const down = y > last + 4;
      const up = y < last - 4;
      if (down && y > 200 && !hidden) {
        hidden = true;
        gsap.to(ref.current, { yPercent: -120, duration: 0.5, ease: "power3.out" });
      } else if (up && hidden) {
        hidden = false;
        gsap.to(ref.current, { yPercent: 0, duration: 0.5, ease: "power3.out" });
      }
      last = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 px-[var(--gutter)] pt-[max(12px,env(safe-area-inset-top))]"
      data-nav
    >
      <div
        className={`mx-auto flex h-[60px] max-w-[1600px] items-center justify-between rounded-full pl-4 pr-2 transition-[background-color,border-color,backdrop-filter] duration-500 md:h-[64px] md:pl-6 ${
          solid ? "glass" : "border border-transparent"
        }`}
      >
        <a href="#inicio" aria-label="Vive by clapzy, volver al inicio" className="rounded-full">
          <Lockup size="sm" />
        </a>
        <nav aria-label="Secciones" className="hidden items-center gap-1 lg:flex">
          {nav.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-[15px] font-semibold text-fg/80 transition-colors hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <Magnetic strength={0.2}>
          <a
            href={config.DEMO_URL}
            target="_blank"
            rel="noopener"
            className="btn btn-primary !min-h-[44px] !px-5 !text-[15px]"
            data-cursor="ver"
            onClick={() => track("cta_ver_demo", { lugar: "nav" })}
          >
            {nav.verDemo}
          </a>
        </Magnetic>
      </div>
    </header>
  );
}

/* ── Barra de progreso + contador de escena (escritorio) ─────────── */
export function Progress() {
  const bar = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(1);
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => gsap.set(bar.current, { scaleX: s.progress }),
    });
    const seen = new Set<number>();
    const triggers = gsap.utils.toArray<HTMLElement>("[data-scene]").map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (s) => {
          if (!s.isActive) return;
          const n = Number(el.dataset.scene);
          setScene(n);
          if (!seen.has(n)) {
            seen.add(n);
            track("escena_vista", { escena: n });
          }
        },
      }),
    );
    // Las animaciones CSS infinitas (pulsos, ondas, cursores) se pausan fuera de pantalla:
    // así no recalculan estilo ni pintan en cada cuadro mientras otra escena se anima.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.toggleAttribute("data-off", !e.isIntersecting)),
      { rootMargin: "20% 0px" },
    );
    document.querySelectorAll("[data-scene]").forEach((el) => io.observe(el));
    return () => {
      st.kill();
      triggers.forEach((t) => t.kill());
      io.disconnect();
    };
  }, []);
  const total = escenas.length;
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]" aria-hidden="true">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-[image:var(--grad-coral)]" />
      </div>
      <div
        className={`pointer-events-none fixed bottom-5 right-[var(--gutter)] z-40 hidden items-center gap-3 rounded-full bg-[rgba(13,9,7,.62)] px-4 py-2 text-[12px] font-bold tracking-[0.14em] text-fg shadow-[inset_0_0_0_1px_rgba(255,236,214,.08)] transition-opacity duration-500 md:flex ${scene === 1 ? "opacity-0" : "opacity-100"}`}
        aria-hidden="true"
      >
        <span className="uppercase opacity-60">{escenas[scene - 1]}</span>
        <span className="h-px w-8 bg-current opacity-50" />
        <span className="tabular">{String(scene).padStart(2, "0")}</span>
        <span className="opacity-50">/</span>
        <span className="tabular opacity-60">{String(total).padStart(2, "0")}</span>
      </div>
    </>
  );
}

/* ── Píldora flotante en celular ─────────────────────────────────── */
export function MobilePill() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { yPercent: 160, autoAlpha: 0 });
    const hero = document.getElementById("inicio");
    const cierre = document.getElementById("cierre");
    let shown = false;
    const show = (v: boolean) => {
      if (v === shown) return;
      shown = v;
      gsap.to(el, { yPercent: v ? 0 : 160, autoAlpha: v ? 1 : 0, duration: 0.6, ease: "power3.out" });
    };
    const a = ScrollTrigger.create({
      trigger: hero,
      start: "bottom 30%",
      endTrigger: cierre ?? undefined,
      end: cierre ? "top 70%" : "max",
      onToggle: (s) => show(s.isActive),
    });
    return () => a.kill();
  }, []);
  return (
    <div
      ref={ref}
      className="fixed inset-x-0 bottom-[max(14px,env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:hidden"
    >
      <div className="glass flex items-center gap-1.5 rounded-full p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,.8)]">
        <a
          href={config.DEMO_URL}
          target="_blank"
          rel="noopener"
          className="btn btn-primary !min-h-[44px] !px-5 !text-[15px]"
          onClick={() => track("cta_ver_demo", { lugar: "pildora" })}
        >
          {nav.verDemo}
        </a>
        <a
          href="#agendar"
          className="btn !min-h-[44px] !px-5 !text-[15px] text-fg"
          onClick={() => track("cta_agendar", { lugar: "pildora" })}
        >
          {nav.agendar}
        </a>
      </div>
    </div>
  );
}

/* ── Cursor personalizado ────────────────────────────────────────── */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const el = dot.current!;
    gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    let state = "";
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
      gsap.to(el, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
      const t = e.target as HTMLElement | null;
      const target = t?.closest?.("[data-cursor], a, button, [role='button'], input[type='range'], label, summary");
      const next = target ? (target as HTMLElement).dataset.cursor || "link" : "";
      if (next === state) return;
      state = next;
      const big = next === "ver" || next === "arrastra";
      gsap.to(el, {
        width: big ? 84 : next === "link" ? 46 : 12,
        height: big ? 84 : next === "link" ? 46 : 12,
        backgroundColor: next === "link" ? "rgba(244,92,85,0.18)" : "rgba(244,92,85,1)",
        borderColor: next === "link" ? "rgba(255,138,107,0.9)" : "rgba(255,138,107,0)",
        duration: 0.35,
        ease: "power3.out",
      });
      if (label.current) {
        label.current.textContent = next === "ver" ? "Ver" : next === "arrastra" ? "Arrastra" : "";
        gsap.to(label.current, { autoAlpha: big ? 1 : 0, duration: 0.25 });
      }
    };
    const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.2 });
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);
  return (
    <div
      ref={dot}
      style={{ opacity: 0, visibility: "hidden" }}
      className="pointer-events-none fixed left-0 top-0 z-[100] grid h-3 w-3 place-items-center rounded-full border border-transparent bg-coral"
      aria-hidden="true"
    >
      <span ref={label} className="text-[13px] font-bold text-white opacity-0" />
    </div>
  );
}

export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}
