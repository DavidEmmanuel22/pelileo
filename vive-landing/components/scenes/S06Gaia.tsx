"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { track } from "@/lib/analytics";
import { config, gaia } from "@/content/site";
import { ESCENARIOS, LUGARES, type Escenario } from "@/content/gaia";
import { MaskLines } from "@/components/ui/MaskLines";
import { Magnetic } from "@/components/ui/Magnetic";
import { Arrow } from "./S01Hero";

type Fase = "idle" | "typing" | "thinking" | "cards" | "ask" | "plan";

const ease = [0.22, 1, 0.36, 1] as const;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function GaiaAvatar({ size = 36, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <span className="relative grid shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#3a1d1b,#1c1110)] ring-1 ring-coral/30" style={{ width: size, height: size }}>
      {pulse ? <span className="absolute inset-0 animate-ping rounded-full bg-coral/25" /> : null}
      <img src="/brand/clapzy-icon.png" alt="" width={size * 0.6} height={size * 0.6} style={{ width: size * 0.6, height: size * 0.6 }} />
    </span>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Mini mapa con la ruta dibujada como costura punteada. */
function MiniMapa({ e }: { e: Escenario }) {
  const pts = e.plan.paradas.map((p) => LUGARES[p.lugar]).filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const [minLa, maxLa, minLo, maxLo] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  // misma escala en ambos ejes (sin estirar) y centrado en el lienzo de 200×90
  const span = Math.max((maxLo - minLo) / 176, (maxLa - minLa) / 66, 0.00005);
  const ox = 100 - (maxLo - minLo) / span / 2;
  const oy = 45 - (maxLa - minLa) / span / 2;
  const P = (p: { lat: number; lng: number }) => [ox + (p.lng - minLo) / span, oy + (maxLa - p.lat) / span];
  const xy = pts.map(P);
  let d = `M ${xy[0][0].toFixed(1)} ${xy[0][1].toFixed(1)}`;
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1];
    const [x1, y1] = xy[i];
    const mx = (x0 + x1) / 2 + (y1 - y0) * 0.16;
    const my = (y0 + y1) / 2 - (x1 - x0) * 0.16;
    d += ` Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return (
    <svg viewBox="0 0 200 90" className="h-auto w-full rounded-[14px] bg-[#efe8de]" aria-hidden="true">
      <g stroke="#d9cfc1" strokeWidth=".6" fill="none">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M -10 ${8 + i * 10} C 50 ${2 + i * 10} 120 ${16 + i * 10} 210 ${6 + i * 10}`} />
        ))}
      </g>
      <path d="M -5 70 C 40 60 80 80 120 64 S 180 50 210 58" stroke="#c9dccd" strokeWidth="5" fill="none" />
      <motion.path d={d} fill="none" stroke="#1b130e" strokeWidth="1.6" strokeDasharray="3 2.4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }} />
      {xy.map(([x, y], i) => (
        <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.35 + i * 0.18, type: "spring", stiffness: 400, damping: 18 }} style={{ originX: `${x}px`, originY: `${y}px` }}>
          <circle cx={x} cy={y} r="5.2" fill="#3e6a4f" stroke="#fff" strokeWidth="1.3" />
          <text x={x} y={y + 2} textAnchor="middle" fontSize="5.6" fontWeight="800" fill="#fff">
            {i + 1}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

function Plan({ e }: { e: Escenario }) {
  const total = e.plan.paradas.reduce((a, p) => a + p.costo, 0);
  const libre = e.plan.presupuesto === 0;
  return (
    <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease }} className="w-full rounded-[22px] bg-[#f6f2ec] p-4 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,.9)] md:p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-2">Tu plan</p>
      <p className="mt-1 text-[clamp(20px,2vw,24px)] font-extrabold leading-tight tracking-[-0.02em]">{e.plan.titulo}</p>
      <p className="text-[13px] font-medium text-ink-2">
        {e.plan.grupo}
        {libre ? "" : ` · Presupuesto $${e.plan.presupuesto}`}
      </p>
      <div className="mt-3 flex items-baseline justify-between text-[14px]">
        <span>
          <b className="text-[16px] font-extrabold">${total}</b> {libre ? "en total" : `de $${e.plan.presupuesto}`}
        </span>
        <span className="font-bold text-[#15803d]">{libre ? "Todo gratis" : `Te sobran $${e.plan.presupuesto - total}`}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
        <motion.div className="h-full rounded-full bg-[#3e6a4f]" initial={{ width: 0 }} animate={{ width: libre ? "100%" : `${(total / e.plan.presupuesto) * 100}%` }} transition={{ duration: 1.1, ease, delay: 0.2 }} />
      </div>
      <div className="mt-3">
        <MiniMapa e={e} />
      </div>
      <ol className="mt-3 divide-y divide-ink/[.07]">
        {e.plan.paradas.map((p, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.09, duration: 0.4, ease }} className="flex items-center gap-3 py-2 text-[13px]">
            <span className="w-[74px] shrink-0 whitespace-nowrap font-bold tabular text-ink-2">{p.hora}</span>
            <span className="min-w-0 flex-1 truncate font-semibold">{p.titulo}</span>
            <span className={`shrink-0 font-bold tabular ${p.costo === 0 ? "text-[#15803d]" : ""}`}>{p.costo === 0 ? "Gratis" : `$${p.costo}`}</span>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}

export function Gaia() {
  const root = useRef<HTMLElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [esc, setEsc] = useState<number | null>(null);
  const [fase, setFase] = useState<Fase>("idle");
  const [typed, setTyped] = useState("");
  const [steps, setSteps] = useState(0);
  const run = useRef(0);
  const touched = useRef(false);
  const auto = useRef(false);

  const play = useCallback(async (i: number, fromUser = true) => {
    const id = ++run.current;
    const alive = () => id === run.current;
    if (fromUser) {
      touched.current = true;
      track("gaia_chip", { chip: ESCENARIOS[i].chip });
    }
    auto.current = !fromUser;
    const e = ESCENARIOS[i];
    setEsc(i);
    setFase("typing");
    setSteps(0);
    setTyped("");
    const reduce = window.matchMedia(MQ.reduce).matches;
    for (let c = 1; c <= e.mensaje.length; c += reduce ? e.mensaje.length : 2) {
      if (!alive()) return;
      setTyped(e.mensaje.slice(0, c));
      await wait(16);
    }
    setTyped(e.mensaje);
    await wait(350);
    if (!alive()) return;
    setFase("thinking");
    for (let s = 1; s <= gaia.pensando.length; s++) {
      await wait(reduce ? 50 : 750);
      if (!alive()) return;
      setSteps(s);
    }
    await wait(500);
    if (!alive()) return;
    setFase("cards");
    await wait(reduce ? 100 : 1100);
    if (!alive()) return;
    setFase("ask");
    if (auto.current) {
      await wait(2200);
      if (!alive() || !auto.current) return;
      setFase("plan");
    }
  }, []);

  // Autoreproduce el primer chip si nadie toca nada en 4 s con la escena visible
  useEffect(() => {
    const el = root.current?.querySelector("[data-chat]");
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([e]) => {
        clearTimeout(t);
        if (e.isIntersecting && !touched.current && run.current === 0) t = setTimeout(() => !touched.current && run.current === 0 && play(0, false), 4000);
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [play]);

  // El chat baja solo a lo último
  useEffect(() => {
    const l = log.current;
    if (!l) return;
    const id = requestAnimationFrame(() => l.scrollTo({ top: l.scrollHeight, behavior: "smooth" }));
    return () => cancelAnimationFrame(id);
  }, [fase, steps, typed]);

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(q("[data-line]"), { yPercent: 115 }, { yPercent: 0, stagger: 0.12, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: q("[data-head]")[0], start: "top 80%" } });
      gsap.fromTo(q("[data-sub]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, delay: 0.3, ease: "power3.out", scrollTrigger: { trigger: q("[data-head]")[0], start: "top 80%" } });
      gsap.fromTo(q("[data-chat]"), { y: 120, scale: 0.92, rotateX: 14, autoAlpha: 0 }, { y: 0, scale: 1, rotateX: 0, autoAlpha: 1, ease: "power2.out", scrollTrigger: { trigger: q("[data-chat]")[0], start: "top 98%", end: "top 45%", scrub: 0.6 } });
      gsap.to(q("[data-halo]"), { yPercent: -20, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  const e = esc !== null ? ESCENARIOS[esc] : null;
  const working = fase !== "idle";
  const showBenefit = (i: number) => fase === "plan" || fase === "ask" || fase === "cards" || (fase === "thinking" && steps > i);

  return (
    <section ref={root} id="gaia" data-scene="6" className="relative overflow-hidden bg-night pb-[14svh] pt-[16svh]" aria-labelledby="gaia-title">
      {/* Halo coral que respira */}
      <div data-halo className="pointer-events-none absolute left-1/2 top-[58%] h-[min(120vw,1300px)] w-[min(120vw,1300px)]" aria-hidden="true">
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(244,92,85,.34)_0%,rgba(255,138,107,.14)_32%,transparent_66%)]" style={{ animation: "breathe 7s ease-in-out infinite" }} />
      </div>

      <div data-head className="relative z-10 mx-auto max-w-[1200px] px-[var(--gutter)] text-center">
        <p className="t-eyebrow text-coral-2">Gaia · IA de Clapzy</p>
        <MaskLines as="h2" id="gaia-title" lines={["Una guía que conoce", "cada rincón de tu ciudad."]} className="t-h2 mt-5 text-fg" lineClassName={(i) => (i === 1 ? "grad-text" : "")} />
        <p data-sub className="t-lead mx-auto mt-6 text-fg-2">
          {gaia.bajada}
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-[7svh] grid max-w-[1320px] grid-cols-[minmax(0,1fr)] items-center gap-6 px-[var(--gutter)] lg:grid-cols-[1fr_minmax(0,560px)_1fr] [perspective:1400px]">
        {/* Beneficios */}
        <ul className="order-2 grid gap-3 lg:order-none lg:gap-6 lg:justify-self-end" aria-label="Lo que hace Gaia">
          {gaia.beneficios.slice(0, 2).map((b, i) => (
            <Benefit key={b} text={b} on={!working || showBenefit(i)} dim={!working} />
          ))}
        </ul>

        {/* Chat */}
        <div data-chat className="relative min-w-0 rounded-[32px] border border-[var(--line-d)] bg-[rgba(22,16,12,.78)] shadow-[0_50px_120px_-40px_rgba(244,92,85,.45),0_30px_80px_-30px_rgba(0,0,0,.9)] backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-[var(--line-d)] px-5 py-4">
            <GaiaAvatar pulse={fase === "thinking"} />
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-extrabold leading-tight text-fg">Gaia</p>
              <p className="flex items-center gap-1.5 whitespace-nowrap text-[12px] font-semibold text-fg-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ok" /> <span className="truncate"><span className="hidden sm:inline">Tu guía local con IA · </span>en línea</span>
              </p>
            </div>
            {working ? (
              <button type="button" onClick={() => { run.current++; setEsc(null); setFase("idle"); }} className="rounded-full border border-[var(--line-d2)] px-3 py-1.5 text-[12px] font-bold text-fg-2 hover:text-fg">
                Nuevo plan
              </button>
            ) : null}
          </div>

          <div ref={log} data-lenis-prevent className="no-scrollbar h-[min(560px,64svh)] overflow-y-auto px-4 py-5 md:px-5" role="log" aria-live="polite" aria-label="Conversación con Gaia">
            <div className="flex flex-col gap-3">
              <Bubble from="gaia">{gaia.saludo}</Bubble>
              {e ? (
                <>
                  <Bubble from="user">
                    {typed}
                    {fase === "typing" ? <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-white/80" style={{ animation: "caret 1s steps(1) infinite" }} /> : null}
                  </Bubble>
                  {fase !== "typing" ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5">
                      <GaiaAvatar size={28} />
                      <div className="rounded-[18px] rounded-tl-[6px] border border-[var(--line-d)] bg-night-3/70 px-4 py-3">
                        <p className="text-[13px] font-bold text-fg">{fase === "thinking" ? "Armando tu plan…" : "Listo, ya lo tengo"}</p>
                        <ul className="mt-2 grid gap-1.5">
                          {gaia.pensando.map((p, i) => (
                            <li key={p} className={`flex items-center gap-2 text-[13px] font-semibold transition-colors duration-300 ${steps > i ? "text-fg" : "text-fg-3"}`}>
                              <span className={`grid h-5 w-5 place-items-center rounded-full transition-all duration-300 ${steps > i ? "scale-100 bg-ok text-[#052e16]" : "scale-90 bg-fg/10 text-transparent"}`}>
                                <Check />
                              </span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ) : null}
                  {fase === "cards" || fase === "ask" || fase === "plan" ? (
                    <div className="flex flex-col gap-3">
                      <Bubble from="gaia">{e.respuesta}</Bubble>
                      <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
                        {e.tarjetas.map((t, i) => {
                          const l = LUGARES[t.lugar];
                          return (
                            <motion.div key={t.lugar} initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.14, duration: 0.55, ease }} className="w-[46%] min-w-[150px] shrink-0 overflow-hidden rounded-[18px] bg-[#f6f2ec] text-ink">
                              <img src={`/media/places/${l.id}.webp`} alt={l.nombre} width={320} height={240} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                              <div className="p-2.5">
                                <p className="truncate text-[13px] font-extrabold leading-tight">{l.nombre}</p>
                                <p className="mt-0.5 text-[11px] font-semibold text-ink-2">
                                  {l.tipo} · {t.detalle}
                                </p>
                                <p className={`mt-1 text-[11px] font-bold ${l.nota === "Gratis" ? "text-[#15803d]" : "text-coral"}`}>{l.nota}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  {fase === "ask" || fase === "plan" ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start gap-2.5">
                      <Bubble from="gaia">{gaia.pregunta}</Bubble>
                      {fase === "ask" ? (
                        <button
                          type="button"
                          onClick={() => {
                            auto.current = false;
                            touched.current = true;
                            setFase("plan");
                          }}
                          className="btn btn-primary ml-[38px] !min-h-[44px] !px-5 !text-[14px]"
                        >
                          {gaia.si}
                        </button>
                      ) : (
                        <div className="self-end">
                          <Bubble from="user">{gaia.si}</Bubble>
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                  {fase === "plan" ? <Plan e={e} /> : null}
                </>
              ) : null}
            </div>
          </div>

          {/* Chips + caja */}
          <div className="border-t border-[var(--line-d)] p-3 md:p-4">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
              {ESCENARIOS.map((s, i) => (
                <button
                  key={s.chip}
                  type="button"
                  onClick={() => play(i)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-bold transition-all duration-300 ${
                    esc === i ? "border-coral bg-coral/15 text-fg" : "border-[var(--line-d2)] text-fg-2 hover:border-coral-2 hover:text-fg"
                  }`}
                >
                  {s.chip}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[var(--line-d)] bg-night/60 py-1.5 pl-4 pr-1.5">
              <span className="min-w-0 flex-1 truncate text-[14px] text-fg-3">{gaia.placeholder}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--grad-coral)] text-white" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <ul className="order-3 grid gap-3 lg:order-none lg:justify-self-start" aria-label="Más de Gaia">
          <Benefit text={gaia.beneficios[2]} on={!working || showBenefit(2)} dim={!working} />
          <li className="mt-2 hidden lg:block">
            <Magnetic>
              <a href={`${config.DEMO_URL}/gaia`} target="_blank" rel="noopener" className="btn btn-primary" data-cursor="ver" onClick={() => track("cta_ver_demo", { lugar: "gaia" })}>
                {gaia.boton}
                <Arrow />
              </a>
            </Magnetic>
          </li>
        </ul>
        <div className="order-4 lg:hidden">
          <a href={`${config.DEMO_URL}/gaia`} target="_blank" rel="noopener" className="btn btn-primary w-full" onClick={() => track("cta_ver_demo", { lugar: "gaia" })}>
            {gaia.boton}
            <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}

function Bubble({ from, children }: { from: "gaia" | "user"; children: React.ReactNode }) {
  if (from === "user")
    return (
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-auto w-fit max-w-[86%] rounded-[18px] rounded-tr-[6px] bg-[image:var(--grad-coral)] px-4 py-2.5 text-[14px] font-semibold leading-snug text-white">
        {children}
      </motion.p>
    );
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5">
      <GaiaAvatar size={28} />
      <p className="max-w-[86%] rounded-[18px] rounded-tl-[6px] border border-[var(--line-d)] bg-night-3/70 px-4 py-2.5 text-[14px] font-medium leading-snug text-fg">{children}</p>
    </motion.div>
  );
}

function Benefit({ text, on, dim }: { text: string; on: boolean; dim: boolean }) {
  return (
    <AnimatePresence initial={false}>
      <motion.li
        animate={{ opacity: on ? (dim ? 0.75 : 1) : 0.18, x: 0, scale: on ? 1 : 0.97 }}
        transition={{ duration: 0.6, ease }}
        className="glass flex max-w-[300px] items-center gap-3 rounded-[20px] px-4 py-3.5 lg:max-w-[260px]"
      >
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors duration-500 ${on && !dim ? "bg-ok text-[#052e16]" : "bg-fg/10 text-fg-2"}`}>
          <Check />
        </span>
        <span className="text-[15px] font-bold leading-snug text-fg">{text}</span>
      </motion.li>
    </AnimatePresence>
  );
}
