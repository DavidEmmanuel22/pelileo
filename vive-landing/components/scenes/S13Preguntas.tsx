"use client";
import { useRef, useState } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { config, preguntas } from "@/content/site";
import { MaskLines } from "@/components/ui/MaskLines";

export function Preguntas() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(q("[data-line]"), { yPercent: 115 }, { yPercent: 0, stagger: 0.12, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: q("[data-head]")[0], start: "top 80%" } });
      gsap.fromTo(q("[data-q]"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: q("[data-list]")[0], start: "top 85%" } });
    });
  });

  const wa = `https://wa.me/${config.WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, tengo una pregunta sobre Vive.")}`;

  return (
    <section ref={root} id="preguntas" data-scene="13" className="relative bg-cream px-[var(--gutter)] pb-[18svh] pt-[10svh] text-ink" aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-[6vw]">
        <div data-head className="lg:sticky lg:top-[16svh] lg:self-start">
          <p className="t-eyebrow text-coral">Preguntas</p>
          <MaskLines as="h2" id="faq-title" lines={["Preguntas que", "siempre nos hacen"]} className="mt-5 text-[clamp(40px,5vw,80px)] font-extrabold leading-[0.98] tracking-[-0.04em]" lineClassName={(i) => (i === 1 ? "grad-text" : "")} />
          <a href={wa} target="_blank" rel="noopener" className="mt-8 inline-flex items-center gap-2 text-[16px] font-bold text-ink underline decoration-coral decoration-2 underline-offset-[6px] hover:text-coral">
            ¿Otra pregunta? Escríbenos por WhatsApp
          </a>
        </div>

        <ul data-list className="border-t border-ink/15">
          {preguntas.items.map((it, i) => {
            const on = open === i;
            return (
              <li key={it.q} data-q className="border-b border-ink/15">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="group flex w-full items-start gap-4 py-6 text-left md:gap-6 md:py-8"
                  >
                    <span className={`mt-[0.45em] w-7 shrink-0 text-[13px] font-extrabold tabular transition-colors ${on ? "text-coral" : "text-ink/35"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={`flex-1 text-[clamp(21px,2.4vw,36px)] font-extrabold leading-[1.12] tracking-[-0.03em] transition-colors ${on ? "text-ink" : "text-ink/75 group-hover:text-ink"}`}>{it.q}</span>
                    <span className={`faq-icon mt-[0.2em] shrink-0 ${on ? "is-on" : ""}`} aria-hidden="true">
                      <span />
                      <span />
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={`faq-a ${on ? "is-on" : ""}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-[54ch] pb-8 pl-11 text-[clamp(17px,1.5vw,21px)] font-medium leading-[1.5] text-ink-2 md:pl-[52px]">{it.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
