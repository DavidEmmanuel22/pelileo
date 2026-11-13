"use client";
import { useRef } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { ganadores } from "@/content/site";
import { Photo } from "@/components/ui/Photo";
import { MaskLines } from "@/components/ui/MaskLines";

const HORIZONTAL = `${MQ.motion} and ${MQ.desktop}`;

export function Ganadores() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add(HORIZONTAL, () => {
      const track = q("[data-track]")[0] as HTMLElement;
      const panels = q("[data-panel]") as HTMLElement[];
      const names = q("[data-name]") as HTMLElement[];
      const dist = () => track.scrollWidth - window.innerWidth;
      gsap.set(q("[data-panel] [data-line]"), { yPercent: 115 });
      gsap.set(q("[data-ptext]"), { autoAlpha: 0, y: 30 });

      // Animaciones internas de cada panel, movidas según su posición real en pantalla
      const inner = panels.map((panel) =>
        gsap
          .timeline({ paused: true })
          .to(panel.querySelectorAll("[data-line]"), { yPercent: 0, stagger: 0.08, duration: 0.5, ease: "power3.out" }, 0)
          .to(panel.querySelectorAll("[data-ptext]"), { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.3),
      );
      const imgs = panels.map((p) => p.querySelector("[data-photo] picture"));
      gsap.set(imgs, { scale: 1.14 });
      const intro = q("[data-intro] [data-line]");
      const clamp = gsap.utils.clamp(0, 1);
      const sync = () => {
        const x = Number(gsap.getProperty(track, "x"));
        const vw = window.innerWidth;
        panels.forEach((panel, i) => {
          const left = panel.offsetLeft + x;
          inner[i].progress(clamp((vw * 0.86 - left) / (vw * 0.74)));
          const v = clamp((vw - left) / (vw + panel.offsetWidth));
          if (imgs[i]) gsap.set(imgs[i], { xPercent: -9 + 18 * v });
        });
        gsap.set(intro, { xPercent: clamp(-x / vw) * -14 });
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: sync,
        scrollTrigger: {
          trigger: q("[data-stage]")[0],
          start: "top top",
          end: () => `+=${dist() * 1.1 + window.innerHeight * 0.7}`,
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: sync,
          onUpdate: (s) => {
            const p = Math.min(1, s.progress / 0.86);
            gsap.set(bar.current, { scaleX: p });
            const idx = Math.min(3, Math.floor(p * 4 + 0.12));
            names.forEach((n, i) => n.classList.toggle("is-on", i <= idx));
          },
        },
      });
      tl.to(track, { x: () => -dist(), duration: 1 }, 0)
        // El último panel termina en negro
        .to(q("[data-last]"), { backgroundColor: "#0d0907", duration: 0.18, ease: "power1.in" }, 1.02)
        .to(q("[data-last] h3, [data-last] [data-ptext]"), { color: "#f7f0e7", duration: 0.14 }, 1.04)
        .to(q("[data-last] [data-photo]"), { autoAlpha: 0, duration: 0.16 }, 1.02)
        .to(q("[data-progress]"), { autoAlpha: 0, duration: 0.08 }, 1.02);
      sync();
    });

    // Celular / reduced-motion: fotos que se revelan en vertical
    mm.add(`${MQ.motion} and ${MQ.mobile}`, () => {
      q("[data-panel]").forEach((panel) => {
        const ph = panel.querySelector("[data-photo]");
        gsap.fromTo(ph, { clipPath: "inset(18% 10% 18% 10% round 28px)" }, {
          clipPath: "inset(0% 0% 0% 0% round 28px)",
          ease: "none",
          scrollTrigger: { trigger: panel, start: "top 92%", end: "top 30%", scrub: true },
        });
        gsap.fromTo(ph?.querySelector("picture") ?? [], { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: panel, start: "top 92%", end: "top 20%", scrub: true } });
        gsap.from(panel.querySelectorAll("[data-line], [data-ptext]"), {
          yPercent: 60,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: panel.querySelector("[data-copy]"), start: "top 85%" },
        });
      });
    });
  });

  const P = ganadores.paneles;
  return (
    <section ref={root} id="ganadores" data-scene="4" className="relative bg-cream text-ink" aria-labelledby="ganadores-title">
      <div data-stage className="g-stage relative overflow-hidden">
        <div data-track className="g-track">
          {/* Titular */}
          <div data-intro className="g-intro flex flex-col justify-center px-[var(--gutter)]">
            <p className="t-eyebrow mb-6 text-coral">Ganan todos</p>
            <MaskLines as="h2" id="ganadores-title" lines={["Cuando tu ciudad", "se vive,", "ganan todos."]} className="t-display text-ink" lineClassName={(i) => (i === 2 ? "grad-text" : "")} />
          </div>

          {P.map((p, i) => {
            const last = i === P.length - 1;
            return (
              <article
                key={p.nombre}
                data-panel
                {...(last ? { "data-last": "" } : {})}
                className={`g-panel relative bg-cream ${i % 2 ? "g-panel--rev" : ""}`}
                aria-label={p.corto}
              >
                <div data-photo className="g-photo relative overflow-hidden">
                  <Photo name={p.foto} alt={p.alt} className="absolute inset-0 block h-full w-full will-change-transform" imgClassName="h-full w-full object-cover photo-rich" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(27,19,14,.35))]" />
                  <span className="absolute left-5 top-5 rounded-full bg-cream/90 px-3 py-1.5 text-[13px] font-extrabold tabular text-ink md:left-8 md:top-8">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div data-copy className="g-copy flex flex-col justify-center">
                  <MaskLines as="h3" lines={[p.nombre]} className="g-name" />
                  <p data-ptext className="mt-5 max-w-[24ch] text-[clamp(22px,2.4vw,38px)] font-bold leading-[1.15] tracking-[-0.02em] text-ink md:mt-8">
                    {p.texto}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* En vertical: funde a negro hacia la escena 7 días */}
        <div className="g-fade h-[34svh] bg-gradient-to-b from-cream to-night" aria-hidden="true" />

        {/* Barra de avance con los 4 nombres */}
        <div data-progress className="g-progress pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-[var(--gutter)]">
          <div className="glass relative overflow-hidden rounded-full px-2 py-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)]">
            <ol className="flex text-[13px] font-bold">
              {P.map((p) => (
                <li key={p.corto} data-name className="g-name-step rounded-full px-4 py-2 text-fg/45 transition-colors duration-300">
                  {p.corto}
                </li>
              ))}
            </ol>
            <div className="absolute inset-x-4 bottom-0 h-[2px] bg-fg/10">
              <div ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-[image:var(--grad-coral)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
