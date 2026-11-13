"use client";
import { useRef } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { initialCity, type CityState } from "@/lib/city";
import { miles } from "@/lib/format";
import { ecuador, problema } from "@/content/site";
import { CityCanvas } from "@/components/ui/CityCanvas";
import { MaskLines } from "@/components/ui/MaskLines";
import { Photo } from "@/components/ui/Photo";
import { Andes, Condor, focusOrigin } from "./Andes";

const DIVE: Record<string, { s: number; y?: number; fade?: boolean }> = {
  sky: { s: 1.08, y: -3 },
  far: { s: 1.28 },
  mist1: { s: 1.6, fade: true },
  mid: { s: 1.7 },
  mist2: { s: 2.2, fade: true },
  near: { s: 2.5 },
  valley: { s: 3.6 },
  front: { s: 5, y: 12 },
};

export function Problema() {
  const root = useRef<HTMLElement>(null);
  const city = useRef<CityState>(initialCity());
  const after = useRef<CityState>({ ...initialCity(), lit: 1, off: 1, streets: 0.55 });

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    const counters = q("[data-count]") as HTMLElement[];
    const setCounters = () => {
      const p = city.current.lit;
      counters.forEach((el, i) => (el.textContent = miles(problema.contadores[i].valor * Math.min(1, p * 1.04))));
    };

    mm.add({ motion: MQ.motion, reduce: MQ.reduce, mobile: MQ.mobile }, (ctx) => {
      const { reduce, mobile } = ctx.conditions as { reduce: boolean; mobile: boolean };
      if (reduce) {
        Object.assign(city.current, { lit: 1, off: 0.6, streets: 1 });
        setCounters();
        return;
      }
      const stage = q("[data-stage]")[0];
      const st = city.current;
      Object.assign(st, initialCity(), { zoom: 1.7, streets: 0 });
      setCounters();

      // Entrada del texto del Ecuador mientras el hero se aleja
      gsap.fromTo(q("[data-a] > *"), { autoAlpha: 0, y: 40 }, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: root.current, start: "top 75%", end: "top 15%", scrub: true },
      });

      gsap.set(q("[data-b] [data-line]"), { yPercent: 115 });
      gsap.set(q("[data-c] [data-line]"), { yPercent: 115 });
      gsap.set(q("[data-counters] > li"), { autoAlpha: 0, y: 30 });
      gsap.set(q("[data-map]"), { autoAlpha: 0 });
      gsap.set(q("[data-town]"), { opacity: 0.32 });

      const origin = () => {
        const o = focusOrigin(stage.clientWidth, stage.clientHeight);
        return `${o.ox}px ${o.oy}px`;
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: mobile ? "+=190%" : "+=360%",
          scrub: mobile ? 0.4 : 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: setCounters,
      });

      // 1 · Bajar al valle
      for (const [name, d] of Object.entries(DIVE)) {
        const el = q(`[data-layer="${name}"]`);
        tl.fromTo(el, { scale: 1, yPercent: 0, transformOrigin: origin }, { scale: d.s, yPercent: d.y ?? 0, transformOrigin: origin, ease: "power2.in", duration: 3.6 }, 0);
        if (d.fade) tl.to(el, { autoAlpha: 0, duration: 1.4 }, 1.6);
      }
      tl.to(q("[data-town]"), { opacity: 1, stagger: 0.12, duration: 0.8, ease: "power1.out" }, 0.2)
        .fromTo(q("[data-condor]"), { xPercent: -120, x: 0, y: 0, rotate: 4 }, { x: () => stage.clientWidth * 1.15, y: () => -stage.clientHeight * 0.08, rotate: -6, duration: 3.4, ease: "none" }, 0)
        .to(q("[data-a]"), { autoAlpha: 0, y: -60, duration: 1.0, ease: "power1.in" }, 1.1)
        // 2 · El valle se vuelve mapa
        .to(q("[data-andes]"), { autoAlpha: 0, duration: 1.0, ease: "power1.inOut" }, 2.9)
        .to(q("[data-map]"), { autoAlpha: 1, duration: 0.9 }, 2.8)
        .to(st, { zoom: 1, streets: 1, duration: 1.4, ease: "power2.out" }, 2.8)
        .to(q("[data-b] [data-line]"), { yPercent: 0, stagger: 0.18, duration: 0.8, ease: "power3.out" }, 3.5)
        .to(q("[data-counters] > li"), { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.6, ease: "power2.out" }, 4.0)
        // 3 · Se encienden uno por uno
        .to(st, { lit: 1, duration: 3.0, ease: "power1.inOut" }, 4.3)
        // 4 · La mayoría se apaga
        .to(st, { off: 1, streets: 0.55, duration: 1.6, ease: "power2.inOut" }, 7.7)
        .to(q("[data-b]"), { autoAlpha: 0.0, y: -40, duration: 1.0, ease: "power1.in" }, 7.8)
        .to(q("[data-c] [data-line]"), { yPercent: 0, stagger: 0.15, duration: 0.8, ease: "power3.out" }, 8.6)
        .to({}, { duration: 0.9 }, 9.4);

      // Frases con píldora de foto
      q("[data-phrase]").forEach((el) => {
        const pill = el.querySelector("[data-pill]");
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 88%", end: "top 38%", scrub: true } })
          .fromTo(el.querySelector("[data-text]"), { opacity: 0.12, y: 50 }, { opacity: 1, y: 0, ease: "power2.out" }, 0)
          .fromTo(pill, { width: 0, rotate: -6 }, { width: "var(--pill-w)", rotate: 0, ease: "power3.out" }, 0.15)
          .fromTo(pill?.querySelector("picture") ?? [], { scale: 1.5 }, { scale: 1, ease: "power2.out" }, 0.15);
      });
      gsap.fromTo(q("[data-remate] [data-word]"), { yPercent: 110 }, {
        yPercent: 0,
        stagger: 0.04,
        ease: "power3.out",
        scrollTrigger: { trigger: q("[data-remate]")[0], start: "top 80%", end: "top 40%", scrub: true },
      });
    });
  });

  const [lineA, lineB] = ["Tu ciudad tiene más", "de lo que su gente conoce."];

  return (
    <section ref={root} id="problema" data-scene="2" className="relative bg-night" aria-labelledby="problema-title">
      <div data-stage className="problema-stage relative h-[100svh] overflow-hidden">
        <div data-andes className="absolute inset-0">
          <Andes />
          <div data-condor className="absolute left-0 top-[30%] w-[84px] md:top-[33%] md:w-[130px]">
            <Condor className="w-full" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/70 to-transparent" />
        </div>
        <div data-map className="absolute inset-0">
          <CityCanvas state={city} />
          <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_50%,transparent_40%,rgba(13,9,7,.8)_100%)]" />
        </div>

        {/* A · Ecuador */}
        <div data-a className="problema-a pointer-events-none absolute inset-x-0 top-[15svh] z-10 px-[var(--gutter)] text-center">
          <p className="t-eyebrow text-amber">{ecuador.etiqueta}</p>
          <p className="t-h3 mx-auto mt-4 max-w-[17ch] text-balance text-fg md:max-w-[20ch]">{ecuador.linea}</p>
        </div>

        {/* B · Titular + contadores */}
        <div data-b className="problema-b pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-[var(--gutter)] pb-[9svh] pt-[16svh] md:pb-[11svh] md:pt-[18svh]">
          <MaskLines as="h2" id="problema-title" lines={[lineA, lineB]} className="t-h2 max-w-[14ch] text-fg md:max-w-none" lineClassName={(i) => (i === 1 ? "text-fg/70" : "")} />
          <ul data-counters className="grid grid-cols-3 gap-4 md:flex md:gap-16">
            {problema.contadores.map((c) => (
              <li key={c.etiqueta} className="min-w-0">
                <span className="block text-[clamp(40px,7.4vw,112px)] font-extrabold leading-none tracking-[-0.04em] text-amber tabular">
                  <span data-count aria-hidden="true">
                    {miles(c.valor)}
                  </span>
                  <span className="sr-only">{miles(c.valor)}</span>
                </span>
                <span className="mt-2 block text-[13px] font-semibold leading-snug text-fg-2 md:text-[17px]">{c.etiqueta}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* C · Apagón */}
        <div data-c className="problema-c pointer-events-none absolute inset-0 z-10 flex items-center px-[var(--gutter)]">
          <MaskLines as="p" lines={splitTwo(problema.apagon)} className="t-h2 max-w-[16ch] text-fg md:max-w-none" lineClassName={(i) => (i === 1 ? "text-amber" : "")} />
        </div>
      </div>

      {/* Frases: la ciudad apagada sigue detrás */}
      <div className="relative">
        <div className="sticky top-0 -mb-[100svh] h-[100svh] opacity-70">
          <CityCanvas state={after} />
          <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_50%,rgba(13,9,7,.35)_20%,rgba(13,9,7,.92)_100%)]" />
        </div>
        <div className="relative z-10 px-[var(--gutter)] pb-[16svh] pt-[10svh]">
          {problema.frases.map((f, i) => {
            const [a, b] = cut(f.texto);
            return (
              <div key={f.foto} data-phrase className={`flex min-h-[56svh] items-center md:min-h-[70svh] ${i % 2 ? "md:justify-end" : ""}`}>
                <p data-text className="t-h2 max-w-[15ch] text-fg md:max-w-[16ch]">
                  {a}{" "}
                  <span
                    data-pill
                    className="relative mx-[0.06em] inline-block h-[0.84em] translate-y-[0.1em] overflow-hidden rounded-full align-baseline shadow-[0_10px_40px_-10px_rgba(255,181,71,.45)] [--pill-w:2.1em] md:[--pill-w:2.7em]"
                    style={{ width: "var(--pill-w)" }}
                  >
                    <Photo name={f.foto} alt={f.alt} className="absolute inset-0 block h-full w-full" imgClassName="h-full w-full object-cover photo-rich" />
                  </span>{" "}
                  <span className="text-fg/75">{b}</span>
                </p>
              </div>
            );
          })}
          <div data-remate className="flex min-h-[70svh] flex-col justify-center">
            <p className="t-display max-w-[14ch] text-balance text-fg">
              <Words text={problema.remate} accentFrom={problema.remate.indexOf("la gente")} />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function cut(t: string): [string, string] {
  const words = t.split(" ");
  return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
}

function splitTwo(t: string): string[] {
  const i = t.indexOf(" donde");
  return i > 0 ? [t.slice(0, i), t.slice(i + 1)] : [t];
}

function Words({ text, accentFrom }: { text: string; accentFrom: number }) {
  const words = text.split(" ");
  const starts = words.map((_, i) => words.slice(0, i).reduce((a, x) => a + x.length + 1, 0));
  return (
    <>
      {words.map((w, i) => {
        const start = starts[i];
        return (
          <span key={i} className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
            <span data-word className={`inline-block ${start >= accentFrom ? "grad-text" : ""}`}>
              {w}
              {" "}
            </span>
          </span>
        );
      })}
    </>
  );
}
