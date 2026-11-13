"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap, useInView } from "@/lib/hooks";
import { initialCity, type CityState } from "@/lib/city";
import { campana } from "@/content/site";
import { CityCanvas } from "@/components/ui/CityCanvas";
import { MaskLines } from "@/components/ui/MaskLines";

/** "[tu ciudad]" se escribe y se borra probando nombres. */
function Typer({ words, active }: { words: string[]; active: boolean }) {
  const [text, setText] = useState(words[0]);
  useEffect(() => {
    if (!active || window.matchMedia(MQ.reduce).matches) return;
    let wi = 0;
    let ci = words[0].length;
    let dir = -1;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      const w = words[wi];
      if (dir < 0) {
        ci--;
        setText(w.slice(0, ci));
        if (ci <= 0) {
          dir = 1;
          wi = (wi + 1) % words.length;
          t = setTimeout(step, 260);
          return;
        }
        t = setTimeout(step, 45);
      } else {
        const nw = words[wi];
        ci++;
        setText(nw.slice(0, ci));
        if (ci >= nw.length) {
          dir = -1;
          t = setTimeout(step, 1700);
          return;
        }
        t = setTimeout(step, 85);
      }
    };
    t = setTimeout(step, 1600);
    return () => clearTimeout(t);
  }, [active, words]);
  return (
    <span className="relative whitespace-nowrap">
      <span className="grad-text">{text || " "}</span>
      <span className="ml-[0.04em] inline-block h-[0.8em] w-[0.06em] translate-y-[0.08em] bg-coral" style={{ animation: "caret 1s steps(1) infinite" }} />
    </span>
  );
}

export function Campana() {
  const root = useRef<HTMLElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const city = useRef<CityState>({ ...initialCity(), lit: 1, off: 1, streets: 0.55 });
  const typing = useInView(logo, "-10% 0px", false);

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
      const { mobile } = ctx.conditions as { mobile: boolean };
      const st = city.current;
      Object.assign(st, { extra: 0, bloom: 0 });
      gsap.set(q("[data-line]"), { yPercent: 115 });
      gsap.set(q("[data-vl]"), { yPercent: 110 });
      gsap.set(q("[data-fade]"), { autoAlpha: 0, y: 30 });
      gsap.set(q("[data-cream]"), { autoAlpha: 0 });
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: q("[data-stage]")[0], start: "top top", end: mobile ? "+=140%" : "+=220%", scrub: 0.6, pin: true, anticipatePin: 1 },
        })
        .to(st, { extra: 1, duration: 3, ease: "power1.in" }, 0)
        .to(st, { bloom: 1, duration: 2.2, ease: "power2.in" }, 1.2)
        .to(q("[data-cream]"), { autoAlpha: 1, duration: 1.2, ease: "power1.inOut" }, 2.8)
        .to(q("[data-line]"), { yPercent: 0, stagger: 0.15, duration: 1, ease: "power3.out" }, 3.6)
        .to(q("[data-vl]"), { yPercent: 0, stagger: 0.06, duration: 0.9, ease: "power3.out" }, 3.9)
        .to(q("[data-fade]"), { autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.9, ease: "power2.out" }, 4.4)
        .to({}, { duration: 1.2 });
    });
    mm.add(MQ.reduce, () => {
      gsap.set(q("[data-cream]"), { autoAlpha: 1 });
    });
  });

  return (
    <section ref={root} id="campana" data-scene="3" className="relative bg-cream text-ink" aria-labelledby="campana-title">
      <div data-stage className="relative h-[100svh] min-h-[600px] overflow-hidden bg-night">
        <div className="absolute inset-0">
          <CityCanvas state={city} />
        </div>
        <div data-cream className="absolute inset-0 bg-cream">
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_70%_30%,rgba(255,181,71,.22),transparent_70%),radial-gradient(60%_60%_at_10%_90%,rgba(244,92,85,.12),transparent_70%)]" />
        </div>

        <div className="relative z-10 grid h-full grid-rows-[auto_1fr_auto] px-[var(--gutter)] pb-[15svh] pt-[16svh] md:pb-[7svh] md:pt-[17svh]">
          <MaskLines as="h2" id="campana-title" lines={["Vive enciende", "tu ciudad."]} className="t-h2 text-ink" lineClassName={(i) => (i === 1 ? "" : "")} />

          {/* El logo se arma */}
          <div ref={logo} className="flex items-center self-center" aria-hidden="true">
            <div className="flex flex-wrap items-end gap-x-[0.22em] text-[clamp(56px,13.5vw,220px)] font-extrabold leading-[0.9] tracking-[-0.05em] text-ink">
              <span className="inline-flex overflow-hidden pb-[0.06em]">
                {"Vive".split("").map((c, i) => (
                  <span key={i} data-vl className="inline-block">
                    {c}
                  </span>
                ))}
              </span>
              <span data-fade className="inline-block">
                <Typer words={campana.nombres} active={typing} />
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p data-fade className="t-lead max-w-[52ch] text-ink-2">
              {campana.bajada}
            </p>
            <p data-fade className="flex items-center gap-2 text-[15px] font-semibold text-ink-2">
              <span className="text-ink/60">by</span>
              <img src="/brand/clapzy-wordmark.png" alt="clapzy" width={96} height={20} className="h-5 w-auto" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
