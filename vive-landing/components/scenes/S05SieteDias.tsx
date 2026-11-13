"use client";
import { useRef } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { sieteDias } from "@/content/site";
import { DIA_COMPONENTS, buildDia } from "./DiaVisuals";

const STAGE = `${MQ.motion} and ${MQ.desktop}`;
const STEP = 1.3;
const T0 = 2.2;

export function SieteDias() {
  const root = useRef<HTMLElement>(null);
  const pasos = sieteDias.pasos;

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    const steps = q("[data-step]") as HTMLElement[];
    const visTls = () => steps.map((s) => buildDia(s.dataset.kind!, s.querySelector("[data-vis]") as HTMLElement));

    // Escritorio: una sola coreografía fijada
    mm.add(STAGE, () => {
      const vis = visTls();
      const nodes = q("[data-node]");
      gsap.set(steps, { autoAlpha: 0 });
      gsap.set(q("[data-text]"), { y: 40 });
      gsap.set(q("[data-counter], [data-line]"), { autoAlpha: 0 });
      gsap.set(q("[data-remate] [data-line-r]"), { yPercent: 115 });
      gsap.set(q("[data-seven]"), { scale: 0.14, autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: q("[data-stage]")[0], start: "top top", end: "+=760%", scrub: 0.6, pin: true, invalidateOnRefresh: true },
      });

      // 1 · "7 días" crece hasta llenar la pantalla
      tl.to(q("[data-seven]"), { autoAlpha: 1, duration: 0.2 }, 0)
        .to(q("[data-seven]"), { scale: 1, duration: 1.2, ease: "power2.inOut" }, 0)
        .fromTo(q("[data-pre]"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.1)
        // 2 · se reduce y queda en la esquina como contador
        .to(q("[data-pre]"), { autoAlpha: 0, y: -30, duration: 0.4 }, 1.3)
        .to(
          q("[data-seven]"),
          {
            scale: 0.16,
            x: () => -window.innerWidth * 0.5 + window.innerWidth * 0.11,
            y: () => -window.innerHeight * 0.5 + window.innerHeight * 0.2,
            autoAlpha: 0,
            duration: 0.8,
            ease: "power3.inOut",
          },
          1.35,
        )
        .to(q("[data-counter]"), { autoAlpha: 1, duration: 0.3 }, 1.9)
        .to(q("[data-line]"), { autoAlpha: 1, duration: 0.3 }, 1.9)
        .fromTo(q("[data-track-fill]"), { scaleX: 0 }, { scaleX: 1, duration: STEP * pasos.length, ease: "none" }, T0);

      // 3 · cada día con su visual
      steps.forEach((s, k) => {
        const at = T0 + k * STEP;
        const num = pasos[k].contador;
        tl.to(s, { autoAlpha: 1, duration: 0.2 }, at)
          .to(s.querySelector("[data-text]"), { y: 0, duration: 0.35, ease: "power3.out" }, at)
          .to(vis[k], { progress: 1, duration: STEP * 0.8, ease: "none" }, at + 0.05)
          .to(q("[data-num]"), { yPercent: (-100 * (num - 1)) / 7, duration: 0.3, ease: "power3.inOut" }, at)
          .call(() => nodes.forEach((n, i) => n.classList.toggle("is-on", i <= k)), [], at + 0.01)
          .call(() => nodes.forEach((n, i) => n.classList.toggle("is-on", i <= k - 1)), [], at - 0.01);
        if (k < steps.length - 1) {
          tl.to(s, { autoAlpha: 0, duration: 0.2 }, at + STEP - 0.2).to(s.querySelector("[data-text]"), { y: -40, duration: 0.2 }, at + STEP - 0.2);
        }
      });

      // 4 · remate
      const end = T0 + steps.length * STEP;
      tl.to([steps[steps.length - 1], q("[data-counter]"), q("[data-line]")], { autoAlpha: 0, duration: 0.3 }, end)
        .to(q("[data-remate] [data-line-r]"), { yPercent: 0, stagger: 0.2, duration: 0.6, ease: "power3.out" }, end + 0.2)
        .to({}, { duration: 0.8 });
    });

    // Celular: intro corta y línea vertical; cada visual se anima con su propio scroll
    mm.add(`${MQ.motion} and ${MQ.mobile}`, () => {
      const vis = visTls();
      gsap.fromTo(q("[data-seven]"), { scale: 0.3 }, {
        scale: 1,
        ease: "power2.out",
        scrollTrigger: { trigger: q("[data-intro]")[0], start: "top 80%", end: "bottom 60%", scrub: true },
      });
      steps.forEach((s, k) => {
        gsap.to(vis[k], { progress: 1, ease: "none", scrollTrigger: { trigger: s.querySelector("[data-vis]"), start: "top 85%", end: "bottom 60%", scrub: 0.4 } });
        gsap.from(s.querySelector("[data-text]"), { y: 40, autoAlpha: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: s, start: "top 85%" } });
      });
      gsap.fromTo(q("[data-remate] [data-line-r]"), { yPercent: 115 }, { yPercent: 0, stagger: 0.15, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: q("[data-remate]")[0], start: "top 75%" } });
    });

    mm.add(MQ.reduce, () => {
      visTls().forEach((t) => t.progress(1));
    });
  });

  return (
    <section ref={root} id="siete-dias" data-scene="5" className="relative bg-night" aria-labelledby="dias-title">
      <h2 id="dias-title" className="sr-only">
        {sieteDias.titular}
      </h2>
      <div data-stage className="sd-stage">
        {/* "7 días" */}
        <div data-intro className="sd-intro pointer-events-none flex flex-col items-center justify-center text-center" aria-hidden="true">
          <p data-pre className="t-h3 mb-[2svh] text-fg">Lo hacemos nosotros.</p>
          <p data-seven className="sd-seven grad-text will-change-transform">{sieteDias.grande}</p>
        </div>

        {/* Contador */}
        <div data-counter className="sd-counter" aria-hidden="true">
          <p className="t-eyebrow text-fg-2">Día</p>
          <div className="h-[0.86em] overflow-hidden text-[clamp(96px,10vw,168px)] font-extrabold leading-[0.86] tracking-[-0.05em]">
            <div data-num>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <span key={n} className="grad-text block">
                  {n}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-1 text-[13px] font-bold text-fg-3">de 7</p>
        </div>

        {/* Días */}
        <ol className="sd-steps">
          {pasos.map((p, k) => {
            const Vis = DIA_COMPONENTS[p.visual];
            return (
              <li key={p.nombre} data-step data-kind={p.visual} className="sd-step">
                <div data-text className="sd-text">
                  <p className="t-eyebrow text-coral-2">{p.dia}</p>
                  <h3 className="mt-3 text-[clamp(40px,5.6vw,92px)] font-extrabold leading-[0.95] tracking-[-0.04em] text-fg">{p.nombre}</h3>
                  <p className="t-lead mt-5 max-w-[40ch] text-fg-2">{p.texto}</p>
                </div>
                <div data-vis className="sd-vis" aria-hidden="true">
                  <Vis />
                </div>
                <span className="sr-only">Paso {k + 1} de {pasos.length}</span>
              </li>
            );
          })}
        </ol>

        {/* Línea de tiempo */}
        <div data-line className="sd-line" aria-hidden="true">
          <div className="relative h-[2px] bg-fg/10">
            <div data-track-fill className="absolute inset-0 origin-left bg-[image:var(--grad-coral)]" />
          </div>
          <ol className="mt-4 grid grid-cols-7 text-[12px] font-bold">
            {pasos.map((p) => (
              <li key={p.nombre} data-node className="sd-node relative pt-1 text-fg-3 transition-colors duration-300">
                <span className="absolute -top-[23px] left-0 h-3 w-3 rounded-full border-2 border-night bg-night-4 transition-colors duration-300" />
                <span className="block text-fg-3">{p.dia}</span>
                <span className="block">{p.nombre}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Remate */}
        <div data-remate className="sd-remate">
          <p className="t-display max-w-[13ch] text-fg md:max-w-none md:text-center">
            {sieteDias.remate.map((l, i) => (
              <span key={l} className="line-mask">
                <span data-line-r className={`block ${i === 1 ? "grad-text" : ""}`}>
                  {l}
                </span>
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

