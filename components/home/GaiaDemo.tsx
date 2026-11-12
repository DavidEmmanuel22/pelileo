"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Car, Footprints, MessageCircle, RotateCcw, Sparkles, X } from "lucide-react";
import { GaiaMark } from "@/components/brand/Brand";
import { WeatherIcon } from "@/components/ui/bits";
import { CategoryIcon } from "@/components/ui/icons";
import { getPlace, placeImage } from "@/lib/data";
import { planSync, itineraryTotal } from "@/lib/gaia";
import { CONDITION_LABEL } from "@/lib/gaia/weather";
import { useGaia } from "@/lib/gaiaStore";

const EASE = [0.22, 1, 0.36, 1] as const;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Stage = "thinking" | "reply" | "plan";

/**
 * Simulación de Gaia en la portada: el visitante escribe (o acepta el texto sugerido),
 * Gaia "piensa" y arma el itinerario en pantalla, parada por parada.
 * Usa el mismo motor que /gaia, así que el plan se puede seguir ajustando allá.
 */
export function GaiaDemo({ prompt, onClose }: { prompt: string | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {prompt && <DemoPanel key={prompt} prompt={prompt} onClose={onClose} />}
    </AnimatePresence>
  );
}

function DemoPanel({ prompt, onClose }: { prompt: string; onClose: () => void }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const loadPlan = useGaia((s) => s.loadPlan);
  const res = useMemo(() => planSync(prompt), [prompt]);
  const it = res.itinerary;
  const [stage, setStage] = useState<Stage>("thinking");
  const [done, setDone] = useState(0);
  const [words, setWords] = useState(0);
  const [day, setDay] = useState(0);
  const [active, setActive] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyWords = res.reply.split(" ");

  // Guion de la simulación: pasos de "pensando" → respuesta palabra por palabra → plan.
  useEffect(() => {
    let alive = true;
    (async () => {
      const step = reduce ? 0 : 520;
      for (let i = 1; i <= res.thinking.length; i++) {
        await wait(i === 1 ? step + 250 : step);
        if (!alive) return;
        setDone(i);
      }
      await wait(reduce ? 0 : 300);
      if (!alive) return;
      setStage("reply");
      if (reduce) setWords(replyWords.length);
      else
        for (let w = 1; w <= replyWords.length; w++) {
          await wait(38);
          if (!alive) return;
          setWords(w);
        }
      await wait(reduce ? 0 : 220);
      if (alive) setStage("plan");
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  // Bloquea el scroll de la página y cierra con Escape.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (stage === "plan") scrollRef.current?.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [stage, reduce]);

  const continueInGaia = () => {
    if (!it) return;
    loadPlan(it, { prompt, reply: res.reply });
    router.push("/gaia");
  };

  const steps = it?.days[day]?.steps ?? [];
  const activeStep = steps[Math.min(active, steps.length - 1)];
  const activePlace = getPlace(activeStep?.placeId);
  const total = it ? itineraryTotal(it) : 0;

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Gaia arma tu plan"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-night/70 backdrop-blur-[6px]"
      />
      <motion.div
        className="relative flex h-[94svh] w-full flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-[var(--shadow-float)] lg:h-[min(860px,90vh)] lg:max-w-[1180px] lg:flex-row lg:rounded-[28px]"
        initial={{ y: reduce ? 0 : 60, opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: reduce ? 0 : 40, opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {/* Columna de conversación + itinerario */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:max-w-[600px]">
          <header className="flex items-center gap-3 border-b border-line px-5 py-3.5 lg:px-7">
            <GaiaMark size={36} thinking={stage === "thinking"} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold leading-tight text-ink">Gaia</p>
              <p className="text-[12.5px] text-ink-2">{stage === "plan" ? "Tu plan está listo" : "Armando tu plan…"}</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-ink-3"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div ref={scrollRef} className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5 lg:px-7">
            {/* Pedido del visitante */}
            <motion.p
              className="ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-md bg-ink px-4 py-3 text-[15px] leading-snug text-surface"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {prompt}
            </motion.p>

            {/* Pensando */}
            <motion.ul
              className="mt-5 space-y-2"
              aria-live="polite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {res.thinking.map((t, i) => {
                const ok = i < done;
                const current = i === done && stage === "thinking";
                if (i > done) return null;
                return (
                  <motion.li
                    key={t}
                    className="flex items-center gap-2.5 text-[14px] text-ink-2"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full ${ok ? "bg-pel-green text-surface" : "bg-clapzy-soft"}`}
                    >
                      {ok ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : current ? <span className="gaia-pulse h-2 w-2 rounded-full bg-clapzy" /> : null}
                    </span>
                    {t}
                  </motion.li>
                );
              })}
            </motion.ul>

            {/* Respuesta */}
            {stage !== "thinking" && (
              <div className="mt-5 flex gap-3">
                <GaiaMark size={30} />
                <p className="flex-1 pt-1 text-[15.5px] leading-relaxed text-ink">{replyWords.slice(0, words).join(" ")}</p>
              </div>
            )}

            {/* Itinerario */}
            {stage === "plan" && it && (
              <motion.section
                className="mt-6"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                aria-label="Itinerario"
              >
                <h3 className="font-display text-[26px] leading-tight tracking-[-0.01em] text-ink">{it.title}</h3>
                {it.days.length > 1 && (
                  <div role="tablist" aria-label="Días del plan" className="mt-4 flex gap-2">
                    {it.days.map((d, i) => (
                      <button
                        key={d.label}
                        type="button"
                        role="tab"
                        aria-selected={day === i}
                        onClick={() => {
                          setDay(i);
                          setActive(0);
                        }}
                        className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors ${
                          day === i ? "border-ink bg-ink text-surface" : "border-line text-ink hover:border-ink-3"
                        }`}
                      >
                        {d.label}
                        <span className={`inline-flex items-center gap-1 text-[12.5px] ${day === i ? "text-surface/80" : "text-ink-2"}`}>
                          <WeatherIcon condition={d.weather.condition} size={14} />
                          {d.weather.tempC}°
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-[13px] text-ink-2">
                  {it.days[day].weather.tempC}° · {CONDITION_LABEL[it.days[day].weather.condition]}
                  {it.days[day].weather.tip ? ` · ${it.days[day].weather.tip}` : ""}
                </p>

                <ol key={day} className="relative mt-5">
                  <span aria-hidden="true" className="absolute bottom-6 left-[27px] top-6 w-px bg-line" />
                  {steps.map((s, i) => {
                    const p = getPlace(s.placeId);
                    const img = p ? placeImage(p) : null;
                    const on = i === active;
                    return (
                      <motion.li
                        key={`${s.placeId}-${s.time}`}
                        className="relative"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.08 * i }}
                      >
                        {i > 0 && s.travelFromPrevMin ? (
                          <p className="flex items-center gap-1.5 py-1 pl-[60px] text-[12px] text-ink-3">
                            {s.travelMode === "a pie" ? <Footprints size={13} aria-hidden="true" /> : <Car size={13} aria-hidden="true" />}
                            {s.travelFromPrevMin} min {s.travelMode === "a pie" ? "a pie" : "en auto"}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          onMouseEnter={() => setActive(i)}
                          onFocus={() => setActive(i)}
                          onClick={() => setActive(i)}
                          className={`flex w-full items-start gap-3 rounded-[18px] p-1.5 text-left transition-colors ${on ? "bg-bg-2" : "hover:bg-bg"}`}
                        >
                          <span className="relative z-10 h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[14px] bg-bg-2 ring-4 ring-surface">
                            {img ? (
                              <Image src={img} alt="" fill sizes="52px" className="object-cover" />
                            ) : (
                              <span className="grid h-full place-items-center text-ink-3">
                                {p && <CategoryIcon category={p.category} size={18} />}
                              </span>
                            )}
                          </span>
                          <span className="min-w-0 flex-1 py-0.5">
                            <span className="flex items-baseline gap-2">
                              <span className="tabular text-[13px] font-semibold text-clapzy-ink">{s.time}</span>
                              {s.optional && <span className="text-[11.5px] text-ink-3">opcional</span>}
                              <span className="tabular ml-auto text-[13px] text-ink-2">{s.cost ? `$${s.cost}` : "Gratis"}</span>
                            </span>
                            <span className="mt-0.5 block text-[15px] font-semibold leading-snug text-ink">{s.title}</span>
                            <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-ink-2 lg:hidden">{s.note}</span>
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </ol>
              </motion.section>
            )}
          </div>

          {/* Barra de acciones */}
          <AnimatePresence>
            {stage === "plan" && it && (
              <motion.footer
                className="border-t border-line bg-surface px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3.5 lg:px-7 lg:pb-4"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.35 }}
              >
                <div className="flex items-center justify-between gap-3 text-[13.5px]">
                  <span className="text-ink-2">
                    Total estimado <strong className="tabular text-[17px] font-semibold text-ink">${total}</strong>{" "}
                    <span className="text-ink-3">de ${it.budget}</span>
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full px-2 font-medium text-ink-2 hover:text-ink"
                  >
                    <RotateCcw size={15} aria-hidden="true" /> Otro pedido
                  </button>
                </div>
                <button
                  type="button"
                  onClick={continueInGaia}
                  className="mt-3 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-clapzy text-[15.5px] font-semibold text-surface transition-transform active:scale-[0.98]"
                >
                  <MessageCircle size={18} aria-hidden="true" /> Ver en el mapa y ajustar con Gaia
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </motion.footer>
            )}
          </AnimatePresence>
        </div>

        {/* Columna visual (escritorio): foto de la parada activa */}
        <aside className="relative hidden flex-1 overflow-hidden bg-night lg:block" aria-hidden="true">
          <AnimatePresence mode="popLayout">
            {stage === "plan" && activePlace ? (
              <motion.div
                key={activePlace.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                {placeImage(activePlace) && (
                  <Image src={placeImage(activePlace)!} alt="" fill sizes="600px" className="object-cover" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,color-mix(in_srgb,var(--night)_88%,transparent))]" />
                <div className="absolute inset-x-0 bottom-0 p-8 text-on-photo">
                  <p className="flex items-center gap-2 text-[13px] font-medium text-on-photo/80">
                    <span className="tabular">{activeStep?.time}</span> · {activePlace.parish}
                  </p>
                  <p className="mt-1 font-display text-[34px] leading-[1.05] tracking-[-0.01em]">{activePlace.name}</p>
                  <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-on-photo/90">
                    <Sparkles size={14} className="mr-1.5 inline -translate-y-[1px] text-dawn" aria-hidden="true" />
                    {activeStep?.note}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="wait" className="absolute inset-0 grid place-items-center" exit={{ opacity: 0 }}>
                <ValleyGlow />
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </motion.div>
    </motion.div>
  );
}

/** Fondo mientras Gaia piensa: el volcán al amanecer, con un pulso suave. */
function ValleyGlow() {
  return (
    <svg viewBox="0 0 600 800" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="vg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--night)" />
          <stop offset="0.55" stopColor="var(--dusk)" />
          <stop offset="1" stopColor="var(--dawn)" />
        </linearGradient>
      </defs>
      <rect width="600" height="800" fill="url(#vg-sky)" />
      <circle cx="300" cy="520" r="60" fill="var(--sun)" className="gaia-pulse" style={{ transformOrigin: "300px 520px" }} opacity="0.85" />
      <path d="M40 620 L260 330 Q300 300 340 330 L560 620 Z" fill="var(--ridge-far)" />
      <path d="M232 368 L260 330 Q300 300 340 330 L368 368 Q340 360 320 376 Q300 360 282 378 Q262 360 232 368 Z" fill="var(--snow)" />
      <path d="M0 640 Q150 560 300 620 T600 600 L600 800 L0 800 Z" fill="var(--ridge-mid)" />
      <path d="M0 700 Q200 640 380 690 T600 680 L600 800 L0 800 Z" fill="var(--ridge-front)" />
    </svg>
  );
}
