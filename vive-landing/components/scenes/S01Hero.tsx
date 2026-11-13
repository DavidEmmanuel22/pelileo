"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { track } from "@/lib/analytics";
import { config, hero } from "@/content/site";
import { MaskLines } from "@/components/ui/MaskLines";
import { Magnetic } from "@/components/ui/Magnetic";
import { Screen } from "@/components/ui/Screen";
import { onReady } from "./S00Preloader";

/** Palabra que rota tras "Vive": la última queda fija un instante y luego reinicia. */
function Rotator({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia(MQ.reduce).matches) return;
    let t: ReturnType<typeof setTimeout>;
    const next = (k: number) => {
      t = setTimeout(
        () => {
          const n = (k + 1) % words.length;
          setI(n);
          next(n);
        },
        k === words.length - 1 ? 3400 : 1900,
      );
    };
    const off = onReady(() => next(0));
    return () => {
      off();
      clearTimeout(t);
    };
  }, [words.length]);
  return (
    <span className="relative inline-grid overflow-hidden align-bottom" aria-live="off">
      {words.map((w, k) => (
        <span
          key={w}
          className="col-start-1 row-start-1 whitespace-nowrap transition-[transform,opacity] duration-700 [transition-timing-function:var(--ease-out)]"
          style={{
            transform: `translateY(${k === i ? 0 : k === (i - 1 + words.length) % words.length ? -105 : 105}%)`,
            opacity: k === i ? 1 : 0,
          }}
          aria-hidden={k !== i}
        >
          <span className="grad-text">{w}</span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Video: el póster se pinta primero (LCP); el video se elige según el ancho y arranca después.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const slow = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (slow) return;
    v.src = narrow ? "/media/video/crestas-v.mp4" : window.innerWidth > 1600 ? "/media/video/crestas-1080.mp4" : "/media/video/crestas-720.mp4";
    const play = () => v.play().catch(() => {});
    v.addEventListener("canplay", () => v.classList.add("opacity-100"), { once: true });
    play();
  }, []);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    const q = gsap.utils.selector(root);

    mm.add(MQ.motion, () => {
      // Entrada (después de la precarga)
      gsap.set(q("[data-line]"), { yPercent: 115 });
      gsap.set(q("[data-in]"), { autoAlpha: 0, y: 24 });
      gsap.set(q("[data-scr]"), { autoAlpha: 0, y: 120, rotateZ: 0 });
      gsap.set(q("[data-bg]"), { scale: 1.18 });
      document.documentElement.classList.add("hero-set"); // desde aquí manda GSAP (ver globals.css)
      const intro = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
      intro
        .to(q("[data-bg]"), { scale: 1.04, duration: 2.4, ease: "power2.out" }, 0)
        .to(q("[data-line]"), { yPercent: 0, duration: 1.15, stagger: 0.12 }, 0.1)
        .to(q("[data-in]"), { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.55)
        .to(q("[data-scr]"), { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.12, ease: "expo.out" }, 0.45);
      const off = onReady(() => intro.play());

      // Momento: el hero se encoge hasta una tarjeta y se aleja
      const out = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=100%", scrub: true, pin: true, pinSpacing: false },
      });
      out
        .to(q("[data-card]"), { scale: 0.8, borderRadius: 36, yPercent: -4, ease: "none" }, 0)
        .to(q("[data-card]"), { autoAlpha: 0, ease: "power1.in", duration: 0.35 }, 0.65)
        .to(q("[data-copy]"), { yPercent: -18, autoAlpha: 0, ease: "power1.in", duration: 0.6 }, 0)
        .to(q("[data-depth='1']"), { yPercent: -60, ease: "none" }, 0)
        .to(q("[data-depth='2']"), { yPercent: -95, ease: "none" }, 0)
        .to(q("[data-depth='3']"), { yPercent: -140, ease: "none" }, 0)
        .to(q("[data-cue]"), { autoAlpha: 0, duration: 0.1 }, 0);

      return () => off();
    });

    // Parallax con el mouse (escritorio)
    mm.add(`${MQ.motion} and ${MQ.desktop} and (hover: hover)`, () => {
      const layers = q("[data-depth]").map((el) => {
        const d = Number((el as HTMLElement).dataset.depth);
        return { x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }), y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }), d };
      });
      const bg = { x: gsap.quickTo(q("[data-bg]")[0], "x", { duration: 1.6, ease: "power3.out" }), y: gsap.quickTo(q("[data-bg]")[0], "y", { duration: 1.6, ease: "power3.out" }) };
      const move = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        layers.forEach((l) => {
          l.x(nx * l.d * 22);
          l.y(ny * l.d * 16);
        });
        bg.x(nx * -18);
        bg.y(ny * -12);
      };
      window.addEventListener("pointermove", move, { passive: true });
      return () => window.removeEventListener("pointermove", move);
    });
  });

  return (
    <section ref={root} id="inicio" data-scene="1" className="relative z-20 h-[100svh] min-h-[640px]" aria-labelledby="hero-title">
      <div data-card className="absolute inset-0 overflow-hidden bg-night will-change-transform [transform-origin:50%_40%]">
        {/* Fondo: video de crestas al atardecer */}
        <div data-bg className="absolute inset-[-3%] will-change-transform">
          <img src="/media/video/crestas-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover photo-rich" fetchPriority="high" />
          <video
            ref={video}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-1000 photo-rich"
            poster="/media/video/crestas-poster.jpg"
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,9,7,.86)_0%,rgba(13,9,7,.55)_42%,rgba(13,9,7,.08)_75%)] max-md:bg-[linear-gradient(180deg,rgba(13,9,7,.55)_0%,rgba(13,9,7,.35)_30%,rgba(13,9,7,.82)_62%,rgba(13,9,7,.95)_100%)]" />
        <div className="vignette absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent" />

        {/* Pantallas flotantes */}
        <div className="pointer-events-none absolute inset-0 [perspective:1600px]" aria-hidden="true">
          <div className="hero-screens">
            <div data-depth="1" className="absolute">
              <div data-scr>
                <div className="hs hs-1">
                  <Screen src="gaia-chat" alt="" className="w-full opacity-90" priority />
                </div>
              </div>
            </div>
            <div data-depth="3" className="absolute">
              <div data-scr>
                <div className="hs hs-2">
                  <Screen src="inicio" alt="" className="w-full" priority />
                </div>
              </div>
            </div>
            <div data-depth="2" className="absolute">
              <div data-scr>
                <div className="hs hs-3">
                  <Screen src="gaia-itinerario" alt="" className="w-full opacity-90" priority />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Texto */}
        <div data-copy className="relative z-10 flex h-full flex-col justify-center px-[var(--gutter)] pt-20 max-md:justify-start max-md:pt-[clamp(96px,15svh,140px)]">
          <div className="max-w-[860px] md:max-w-[min(66vw,1320px)]">
            <MaskLines
              as="h1"
              id="hero-title"
              lines={hero.titular}
              className="t-display text-fg [text-shadow:0_2px_40px_rgba(13,9,7,.35)] md:!text-[clamp(64px,6.9vw,132px)] md:whitespace-nowrap"
              lineClassName={(i) => (i === 2 ? "grad-text" : "")}
            />
            <p data-in className="mt-6 text-[clamp(26px,3vw,44px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-fg md:mt-8">
              <span className="mr-[0.28em]">{hero.vive}</span>
              <Rotator words={hero.rotan} />
              <span className="sr-only">{hero.rotan.join(", ")}</span>
            </p>
            <p data-in className="t-lead mt-5 max-w-[46ch] text-fg/85 md:mt-6">
              {hero.bajada}
            </p>
            <div data-in className="mt-7 flex flex-wrap items-center gap-3 md:mt-9">
              <Magnetic>
                <a
                  href={config.DEMO_URL}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-primary"
                  data-cursor="ver"
                  onClick={() => track("cta_ver_demo", { lugar: "hero" })}
                >
                  {hero.ctaDemo}
                  <Arrow />
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#agendar" className="btn btn-ghost" onClick={() => track("cta_agendar", { lugar: "hero" })}>
                  {hero.ctaAgendar}
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* Indicador de scroll */}
        <div data-cue className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex" aria-hidden="true">
          <span className="t-eyebrow text-fg/70">{hero.desliza}</span>
          <span className="relative block h-12 w-px overflow-hidden bg-fg/20">
            <span className="absolute inset-0 bg-coral" style={{ animation: "scroll-cue 1.8s var(--ease-io) infinite" }} />
          </span>
        </div>
      </div>
    </section>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M4 12 12 4M6 4h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
