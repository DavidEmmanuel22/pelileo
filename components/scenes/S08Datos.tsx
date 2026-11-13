"use client";
import { useEffect, useRef } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { miles } from "@/lib/format";
import { datos } from "@/content/site";
import { MaskLines } from "@/components/ui/MaskLines";

const BIG = "(min-width: 1024px)";
const DW = 1200;
const DH = 800;

/* ── Gráfico de tendencia ── */
const CW = 640;
const CH = 230;
function trendPath() {
  const v = datos.tendencia;
  const max = Math.max(...v) * 1.08;
  const min = Math.min(...v) * 0.82;
  const pts = v.map((y, i) => [12 + (i / (v.length - 1)) * (CW - 24), CH - 18 - ((y - min) / (max - min)) * (CH - 40)] as const);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return { d, area: `${d} L ${pts[pts.length - 1][0]} ${CH} L ${pts[0][0]} ${CH} Z`, end: pts[pts.length - 1] };
}
const TREND = trendPath();

const HOT = [
  { x: 132, y: 92, r: 62, n: "Centro" },
  { x: 222, y: 152, r: 46, n: "Mirador" },
  { x: 64, y: 168, r: 38, n: "Salasaca" },
  { x: 236, y: 58, r: 30, n: "Mercado" },
];

/** Cada pieza del panel devuelve una línea de tiempo 0→1 que el scroll recorre. */
function buildPiece(el: HTMLElement) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  const kind = el.dataset.piece;
  // la pieza existe desde el principio como un fantasma tenue y se "enciende" al armarse
  tl.fromTo(el, { autoAlpha: 0.14, y: 40, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }, 0);
  if (kind === "kpi") {
    const n = el.querySelector<HTMLElement>("[data-n]")!;
    const to = Number(n.dataset.to);
    const pre = n.dataset.pre ?? "";
    const o = { v: 0 };
    tl.to(o, { v: to, duration: 0.7, ease: "power2.out", onUpdate: () => void (n.textContent = pre + miles(o.v)) }, 0.1);
    tl.fromTo(el.querySelector("[data-delta]"), { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.2 }, 0.6);
  }
  if (kind === "trend") {
    const line = el.querySelector<SVGPathElement>("[data-trend-line]")!;
    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len });
    tl.fromTo(line, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.7, ease: "power1.inOut" }, 0.15)
      .fromTo(el.querySelector("[data-trend-area]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.45)
      .fromTo(el.querySelector("[data-trend-dot]"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.15, ease: "back.out(3)" }, 0.83)
      .fromTo(el.querySelector("[data-trend-label]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.15 }, 0.85);
  }
  if (kind === "heat") {
    tl.fromTo(el.querySelectorAll("[data-hot]"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.4, stagger: 0.12, ease: "back.out(1.6)" }, 0.2).fromTo(
      el.querySelectorAll("[data-hot-label]"),
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.2, stagger: 0.12 },
      0.45,
    );
  }
  if (kind === "demand") {
    el.querySelectorAll<HTMLElement>("[data-row]").forEach((r, i) => {
      const t = r.querySelector<HTMLElement>("[data-type]")!;
      const full = t.dataset.full!;
      const o = { c: 0 };
      const at = 0.15 + i * 0.18;
      tl.fromTo(r, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, at)
        .to(o, { c: full.length, duration: 0.16, onUpdate: () => void (t.textContent = full.slice(0, Math.round(o.c))) }, at)
        .fromTo(r.querySelector("[data-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: "power2.out" }, at + 0.1)
        .fromTo(r.querySelector("[data-vol]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, at + 0.2);
    });
  }
  if (kind === "frase") {
    tl.fromTo(el.querySelector("[data-frase]"), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.2);
  }
  return tl;
}

function Card({ piece, className = "", children }: { piece: string; className?: string; children: React.ReactNode }) {
  return (
    <div data-piece={piece} className={`dt-card ${className}`}>
      {children}
    </div>
  );
}

export function Datos() {
  const root = useRef<HTMLElement>(null);
  const fit = useRef<HTMLDivElement>(null);

  // Escala el panel (diseñado a 1200×780) para que quepa entero en la pantalla
  useEffect(() => {
    const el = fit.current;
    if (!el) return;
    const set = () => {
      const k = window.matchMedia(BIG).matches ? Math.min(1.12, (window.innerHeight - 110) / DH, (window.innerWidth - 96) / DW) : 1;
      el.style.setProperty("--k", String(k));
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    const pieces = q("[data-piece]") as HTMLElement[];

    mm.add(MQ.motion, () => {
      gsap.fromTo(q("[data-line]"), { yPercent: 115 }, { yPercent: 0, stagger: 0.12, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: q("[data-head]")[0], start: "top 80%" } });
      gsap.fromTo(q("[data-sub]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, delay: 0.3, ease: "power3.out", scrollTrigger: { trigger: q("[data-head]")[0], start: "top 80%" } });
    });

    // Escritorio: el panel se arma pieza por pieza con la pantalla fijada
    mm.add(`${MQ.motion} and ${BIG}`, () => {
      const tls = pieces.map(buildPiece);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: q("[data-stage]")[0], start: "top top", end: "+=260%", scrub: 0.6, pin: true, anticipatePin: 1 },
      });
      // el panel llega inclinado mientras la pantalla se acerca, y se arma ya fijado
      gsap.fromTo(q("[data-dash]"), { rotateX: 28, y: 160, scale: 0.84 }, { rotateX: 0, y: 0, scale: 1, ease: "power2.out", scrollTrigger: { trigger: q("[data-stage]")[0], start: "top bottom", end: "top top", scrub: 0.6 } });
      const at: Record<string, number> = { head: 0, kpi: 0.15, trend: 0.9, heat: 1.3, demand: 2.0, frase: 3.1 };
      let k = 0;
      pieces.forEach((p, i) => {
        const kind = p.dataset.piece!;
        const t = (at[kind] ?? 0) + (kind === "kpi" ? k++ * 0.14 : 0);
        tl.to(tls[i], { progress: 1, duration: kind === "demand" ? 1.2 : 0.9 }, t);
      });
      tl.to({}, { duration: 0.6 });
    });

    // Celular y tableta: cada pieza se arma con su propio scroll
    mm.add(`${MQ.motion} and (max-width: 1023px)`, () => {
      pieces.forEach((p) => {
        const t = buildPiece(p);
        gsap.to(t, { progress: 1, ease: "none", scrollTrigger: { trigger: p, start: "top 92%", end: p.dataset.piece === "demand" ? "bottom 70%" : "bottom 80%", scrub: 0.4 } });
      });
    });

    mm.add(MQ.reduce, () => {
      pieces.forEach((p) => buildPiece(p).progress(1));
    });
  });

  return (
    <section ref={root} id="datos" data-scene="8" className="relative bg-night" aria-labelledby="datos-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,236,214,.07)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(transparent,#000_20%,#000_80%,transparent)]" aria-hidden="true" />

      <div data-head className="relative mx-auto max-w-[1100px] px-[var(--gutter)] pt-[18svh] text-center">
        <p className="t-eyebrow text-coral-2">Datos para decidir</p>
        <MaskLines as="h2" id="datos-title" lines={["Por primera vez,", "sabrás qué busca tu gente."]} className="t-h2 mt-5 text-fg" lineClassName={(i) => (i === 1 ? "grad-text" : "")} />
        <p data-sub className="t-lead mx-auto mt-6 max-w-[52ch] text-fg-2">
          {datos.bajada}
        </p>
      </div>

      <div data-stage className="dt-stage">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,92,85,.16),transparent_62%)]" aria-hidden="true" />
        <div ref={fit} className="dt-fit">
          <div data-dash className="dt-dash" role="img" aria-label="Panel de turismo del municipio con visitantes, tendencia semanal, mapa de calor y lo que la gente busca y la ciudad aún no ofrece">
            {/* Encabezado */}
            <Card piece="head" className="dt-head !bg-transparent !p-0 !shadow-none !ring-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[image:var(--grad-coral)] text-[15px] font-extrabold text-white">TM</span>
                  <div>
                    <p className="text-[18px] font-extrabold leading-tight tracking-[-0.02em] text-fg">Panel de Turismo · Tu municipio</p>
                    <p className="flex items-center gap-1.5 text-[12px] font-semibold text-fg-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-ok" style={{ animation: "pulse-dot 1.6s ease-in-out infinite" }} /> En vivo · datos de la app Vive
                    </p>
                  </div>
                </div>
                <div className="hidden gap-1 rounded-full border border-[var(--line-d)] p-1 text-[12px] font-bold text-fg-2 sm:flex">
                  {["7 días", "30 días", "90 días"].map((t, i) => (
                    <span key={t} className={`rounded-full px-3 py-1.5 ${i === 1 ? "bg-fg text-ink" : ""}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* KPIs */}
            {datos.kpis.map((k) => (
              <Card key={k.etiqueta} piece="kpi" className="dt-kpi">
                <p className="text-[13px] font-semibold text-fg-2">{k.etiqueta}</p>
                <p className="mt-2 text-[clamp(26px,3vw,36px)] font-extrabold leading-none tracking-[-0.03em] text-fg tabular">
                  <span data-n data-to={k.valor} data-pre={k.prefijo ?? ""}>
                    {(k.prefijo ?? "") + miles(k.valor)}
                  </span>
                </p>
                <p data-delta className="mt-2 text-[12px] font-bold text-ok">
                  ▲ {k.delta} <span className="font-semibold text-fg-3">vs. mes anterior</span>
                </p>
              </Card>
            ))}

            {/* Tendencia */}
            <Card piece="trend" className="dt-trend">
              <div className="flex items-baseline justify-between">
                <p className="text-[15px] font-extrabold text-fg">Visitantes por semana</p>
                <p className="text-[12px] font-semibold text-fg-3">Últimas 12 semanas</p>
              </div>
              <div className="relative mt-3">
                <svg viewBox={`0 0 ${CW} ${CH}`} className="h-auto w-full overflow-visible" aria-hidden="true">
                  <defs>
                    <linearGradient id="dt-area" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#f45c55" stopOpacity=".35" />
                      <stop offset="1" stopColor="#f45c55" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="dt-line" x1="0" x2="1">
                      <stop offset="0" stopColor="#ffb547" />
                      <stop offset="1" stopColor="#f45c55" />
                    </linearGradient>
                  </defs>
                  {[0.25, 0.5, 0.75].map((f) => (
                    <line key={f} x1="0" x2={CW} y1={CH * f} y2={CH * f} stroke="rgba(255,236,214,.08)" strokeDasharray="3 5" />
                  ))}
                  <path data-trend-area d={TREND.area} fill="url(#dt-area)" />
                  <path data-trend-line d={TREND.d} fill="none" stroke="url(#dt-line)" strokeWidth="3.2" strokeLinecap="round" />
                  <g data-trend-dot>
                    <circle cx={TREND.end[0]} cy={TREND.end[1]} r="11" fill="#f45c55" opacity=".25" />
                    <circle cx={TREND.end[0]} cy={TREND.end[1]} r="5.5" fill="#f45c55" stroke="#fff" strokeWidth="2" />
                  </g>
                </svg>
                <div data-trend-label className="absolute right-0 top-0 rounded-[12px] border border-[var(--line-d)] bg-night-3/90 px-3 py-2 text-right">
                  <p className="text-[11px] font-semibold text-fg-2">Esta semana</p>
                  <p className="text-[18px] font-extrabold leading-tight text-fg tabular">{miles(datos.tendencia[datos.tendencia.length - 1])}</p>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-semibold text-fg-3">
                {["S1", "S3", "S5", "S7", "S9", "Hoy"].map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </Card>

            {/* Mapa de calor */}
            <Card piece="heat" className="dt-heat">
              <div className="flex items-baseline justify-between">
                <p className="text-[15px] font-extrabold text-fg">Dónde se mueve la gente</p>
                <p className="text-[12px] font-semibold text-fg-3">Hoy</p>
              </div>
              <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" className="dt-heat-map mt-3 w-full rounded-[16px] bg-night/70" aria-hidden="true">
                <defs>
                  <radialGradient id="dt-hot">
                    <stop offset="0" stopColor="#ffb547" stopOpacity=".95" />
                    <stop offset=".35" stopColor="#f45c55" stopOpacity=".6" />
                    <stop offset="1" stopColor="#f45c55" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <g stroke="rgba(255,236,214,.13)" strokeWidth="1.2" fill="none">
                  <path d="M-10 70 C 60 60 120 90 310 64" />
                  <path d="M-10 130 C 80 120 160 150 310 120" />
                  <path d="M-10 185 C 90 176 200 200 310 180" />
                  <path d="M70 -10 C 80 60 60 140 84 230" />
                  <path d="M150 -10 C 140 70 160 150 150 230" />
                  <path d="M230 -10 C 240 80 220 150 236 230" />
                </g>
                <path d="M-10 108 C 70 96 120 130 190 110 S 280 90 310 100" stroke="rgba(110,170,200,.28)" strokeWidth="7" fill="none" />
                {HOT.map((h, i) => (
                  <g key={h.n}>
                    <g data-hot>
                      <circle cx={h.x} cy={h.y} r={h.r} fill="url(#dt-hot)" className="dt-pulse" style={{ animationDelay: `${i * 0.6}s` }} />
                    </g>
                    <text data-hot-label x={h.x} y={h.y + 4} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#fff">
                      {h.n}
                    </text>
                  </g>
                ))}
              </svg>
            </Card>

            {/* Demanda */}
            <Card piece="demand" className="dt-demand">
              <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-coral-2">
                <span className="h-1.5 w-1.5 rounded-full bg-coral" /> Insight clave
              </p>
              <p className="mt-2 text-[clamp(18px,1.8vw,22px)] font-extrabold leading-tight tracking-[-0.02em] text-fg">{datos.demandaTitulo}</p>
              <ul className="mt-4 grid gap-3">
                {datos.demanda.map((d) => (
                  <li key={d.item} data-row className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_36px]">
                    <span className="truncate text-[15px] font-bold text-fg">
                      <span data-type data-full={d.item}>
                        {d.item}
                      </span>
                    </span>
                    <span className="order-last col-span-2 h-2.5 overflow-hidden rounded-full bg-fg/10 lg:order-none lg:col-span-1">
                      <span data-bar className="block h-full origin-left rounded-full bg-[image:var(--grad-coral)]" style={{ width: `${d.volumen}%` }} />
                    </span>
                    <span data-vol className="text-right text-[13px] font-bold text-fg-2 tabular">
                      {d.volumen}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] font-semibold text-fg-3">Índice de búsquedas sin respuesta en Gaia</p>
            </Card>

            {/* Frase */}
            <Card piece="frase" className="dt-frase">
              <p data-frase className="text-[clamp(22px,2.3vw,30px)] font-extrabold leading-[1.12] tracking-[-0.03em] text-white">
                {datos.frase}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
