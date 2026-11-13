"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { respaldo } from "@/content/site";
import { Photo } from "@/components/ui/Photo";
import { CountUp } from "@/components/ui/CountUp";
import { MaskLines } from "@/components/ui/MaskLines";

/** Logo real si existe en public/logos; si no, una silueta con el nombre.
 *  La altura sale de la proporción (1/√a): así un logo ancho y uno vertical pesan lo mismo a la vista. */
function Logo({ nombre, archivo, a, ok }: { nombre: string; archivo: string; a: number; ok: boolean }) {
  return (
    <li className="rp-logo">
      {ok ? (
        <img src={`/logos/${archivo}`} alt={nombre} loading="lazy" draggable={false} className="rp-img" style={{ height: `calc(var(--logo-k) * ${(1 / Math.sqrt(a)).toFixed(3)})` }} />
      ) : (
        <>
          <span className="rp-mark" aria-hidden="true" />
          <span className="px-3 text-center text-[13px] font-bold tracking-[0.02em] text-fg/45">{nombre}</span>
        </>
      )}
    </li>
  );
}

export function Respaldo({ logosOk }: { logosOk: Record<string, boolean> }) {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(q("[data-bg]"), { yPercent: -10, scale: 1.15 }, { yPercent: 10, scale: 1.05, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(q("[data-line]"), { yPercent: 115 }, { yPercent: 0, stagger: 0.12, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: q("[data-head]")[0], start: "top 80%" } });
      gsap.fromTo(q(".rp-logo"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: q("[data-logos]")[0], start: "top 88%" } });
      gsap.fromTo(q("[data-cifra]"), { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, stagger: 0.14, duration: 1, ease: "power3.out", scrollTrigger: { trigger: q("[data-cifras]")[0], start: "top 85%" } });
      gsap.fromTo(q("[data-rule]"), { scaleX: 0 }, { scaleX: 1, stagger: 0.14, duration: 1.2, ease: "power3.inOut", scrollTrigger: { trigger: q("[data-cifras]")[0], start: "top 85%" } });
    });
  });

  const logos = respaldo.logos.map((l) => ({ ...l, ok: !!logosOk[l.archivo] }));

  return (
    <section ref={root} id="respaldo" data-scene="11" className="relative overflow-hidden bg-night px-[var(--gutter)] pb-[16svh] pt-[18svh]" aria-labelledby="respaldo-title">
      <div className="absolute inset-0" aria-hidden="true">
        <div data-bg className="absolute inset-[-8%]">
          <Photo name="comedor" alt="" className="block h-full w-full" imgClassName="h-full w-full object-cover blur-[6px] saturate-[.8]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,9,7,.94)_0%,rgba(13,9,7,.72)_40%,rgba(13,9,7,.8)_75%,rgba(13,9,7,1)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-[1280px]">
        <div data-head className="max-w-[1100px]">
          <p className="t-eyebrow text-coral-2">Respaldo</p>
          <MaskLines as="h2" id="respaldo-title" lines={["Trabajamos con quienes", "mueven la economía local."]} className="t-h2 mt-5 text-fg" lineClassName={(i) => (i === 1 ? "grad-text" : "")} />
        </div>

        {/* Logos: cinta continua (se detiene al pasar el mouse) */}
        <div data-logos className="rp-logos mt-[10svh]">
          <ul className="rp-track" aria-label="Gremios y aliados">
            {logos.map((l) => (
              <Logo key={l.archivo} {...l} />
            ))}
          </ul>
          <ul className="rp-track rp-dup" aria-hidden="true">
            {logos.map((l) => (
              <Logo key={l.archivo} {...l} />
            ))}
          </ul>
        </div>

        {/* Cifras */}
        <dl data-cifras className="mt-[10svh] grid gap-10 md:grid-cols-3 md:gap-8">
          {respaldo.cifras.map((c, i) => (
            <div key={c.etiqueta} data-cifra className="relative pt-6">
              <span data-rule className="absolute left-0 right-0 top-0 h-px origin-left bg-[var(--line-d2)]" aria-hidden="true" />
              <dt className="sr-only">{c.etiqueta}</dt>
              <dd className={`text-[clamp(72px,6.8vw,128px)] font-extrabold leading-[0.9] tracking-[-0.05em] ${i === 0 ? "grad-text" : "text-fg"}`}>
                <CountUp to={c.valor} prefix={c.prefijo ?? ""} duration={2} />
              </dd>
              <p className="mt-3 max-w-[22ch] text-[clamp(17px,1.4vw,20px)] font-semibold leading-snug text-fg-2" aria-hidden="true">
                {c.etiqueta}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
