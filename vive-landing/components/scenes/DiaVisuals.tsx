/**
 * Visual animado de cada día de la escena "7 días".
 * Cada visual es HTML real; `buildDia(kind, el)` devuelve un timeline pausado (0→1) que la escena mueve con el scroll.
 */
import { gsap } from "@/lib/gsap";
import { miles } from "@/lib/format";
import { sieteDias } from "@/content/site";
import { Photo } from "@/components/ui/Photo";

const V = sieteDias.visual;
const card = "absolute inset-0 overflow-hidden rounded-[28px] border border-[var(--line-d)] bg-night-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)]";

function Diagnostico() {
  return (
    <div className={`${card} flex flex-col justify-center gap-[5%] p-[7%]`}>
      <div className="flex items-baseline justify-between">
        <p className="text-[clamp(16px,1.5vw,22px)] font-extrabold tracking-[-0.02em] text-fg">{V.diagnostico.titulo}</p>
        <p className="t-eyebrow !text-[10px] text-fg-3">{V.diagnostico.sub}</p>
      </div>
      {V.diagnostico.filas.map((f) => (
        <div key={f.nombre} className="grid grid-cols-[34%_1fr_3.2em] items-center gap-3 text-[clamp(12px,1.05vw,15px)] font-semibold text-fg-2">
          <span>{f.nombre}</span>
          <span className="relative h-[10px] overflow-hidden rounded-full bg-fg/[.07]">
            <span data-bar className="absolute inset-y-0 left-0 origin-left rounded-full bg-[image:var(--grad-coral)]" style={{ width: `${f.valor}%` }} />
          </span>
          <span data-pct data-v={f.valor} className="text-right tabular text-fg">
            {f.valor}%
          </span>
        </div>
      ))}
      <p data-falta className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-amber/10 px-3 py-1.5 text-[12px] font-bold text-amber">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" /> {V.diagnostico.alerta}
      </p>
    </div>
  );
}

const PINS = [
  [18, 30], [32, 22], [44, 40], [58, 28], [70, 46], [26, 58], [40, 66], [54, 56], [66, 70], [80, 30], [84, 60], [14, 76], [48, 82], [62, 14],
];
function Mapeo() {
  return (
    <div className={card}>
      <svg viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {/* curvas de nivel, como un mapa topográfico */}
        <g stroke="rgba(255,236,214,.1)" strokeWidth=".3" fill="none">
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse key={`a${i}`} cx="30" cy="30" rx={4 + i * 5.5} ry={3 + i * 3.6} transform={`rotate(-12 30 30)`} />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={`b${i}`} cx="78" cy="22" rx={3 + i * 4.6} ry={2.4 + i * 3} transform={`rotate(18 78 22)`} />
          ))}
          {Array.from({ length: 4 }, (_, i) => (
            <path key={`c${i}`} d={`M -5 ${60 + i * 4} C 25 ${54 + i * 4} 55 ${70 + i * 4} 105 ${58 + i * 4}`} />
          ))}
        </g>
        <g stroke="rgba(255,236,214,.16)" strokeWidth=".6" fill="none" strokeLinecap="round">
          <path d="M 10 -5 C 18 20 30 34 44 40 S 70 52 74 80" />
          <path d="M -5 34 C 20 30 40 42 105 30" />
        </g>
        <path d="M -5 50 C 20 44 40 60 60 48 S 90 40 105 46" stroke="rgba(244,92,85,.25)" strokeWidth="2.2" fill="none" />
      </svg>
      {PINS.map(([x, y], i) => (
        <span key={i} data-pin className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
          <svg width="22" height="28" viewBox="0 0 22 28" className="-translate-x-1/2 -translate-y-full drop-shadow-[0_6px_10px_rgba(0,0,0,.5)]" aria-hidden="true">
            <path d="M11 27C11 27 21 16.5 21 10.5A10 10 0 1 0 1 10.5C1 16.5 11 27 11 27Z" fill={i % 4 === 0 ? "#FFB547" : "#F45C55"} />
            <circle cx="11" cy="10.5" r="3.6" fill="#fff" />
          </svg>
        </span>
      ))}
      <div className="absolute inset-x-[5%] bottom-[5%] flex flex-wrap gap-1.5">
        {V.mapeo.map((m) => (
          <span key={m.nombre} data-chip className="glass rounded-full px-2.5 py-1 text-[11px] font-bold text-fg">
            <span data-n data-v={m.n} className="tabular text-coral-2">
              {m.n}
            </span>{" "}
            {m.nombre}
          </span>
        ))}
      </div>
    </div>
  );
}

function Perfil({ p, big = false }: { p: (typeof V.perfiles)[number]; big?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-[18px] bg-white p-2.5 text-ink shadow-[0_12px_30px_-12px_rgba(0,0,0,.4)] ${big ? "p-3.5" : ""}`}>
      <Photo name={p.foto} alt="" className="block h-14 w-14 shrink-0 overflow-hidden rounded-[12px]" imgClassName="h-full w-full object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-extrabold leading-tight">{p.nombre}</p>
        <p className="text-[11px] font-semibold text-ink-2">{p.tipo}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-[#15803d]">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" />
          {p.horario}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-[image:var(--grad-coral)] px-3 py-1.5 text-[11px] font-bold text-white">Reservar</span>
    </div>
  );
}

function Vitrina() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative h-[100%] w-[min(90%,380px)] md:w-[min(72%,380px)] overflow-hidden rounded-[36px] bg-[#f6f2ec] p-4 shadow-[var(--shadow-float)]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">Vive tu ciudad</p>
          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-bold text-ink-2">Comer · Dormir · Hacer</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {V.perfiles.map((p) => (
            <div key={p.nombre} data-prof>
              <Perfil p={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Capacitacion() {
  const c = V.capacitacion;
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative w-[min(86%,420px)] min-w-0 rounded-[28px] bg-[#f6f2ec] p-4 md:p-5 text-ink shadow-[var(--shadow-float)]">
        <Perfil p={V.perfiles[0]} big />
        <div className="mt-4 rounded-[16px] border border-ink/10 bg-white p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-2">{c.campo}</p>
          <p className="mt-1 h-6 truncate text-[16px] font-bold">
            <span data-type data-full={c.valor} />
            <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-coral" style={{ animation: "caret 1s steps(1) infinite" }} />
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          {["fritada", "plato-tipico", "comedor"].map((f) => (
            <div key={f} data-thumb className="h-12 w-12 overflow-hidden rounded-[10px]">
              <Photo name={f} alt="" className="block h-full w-full" />
            </div>
          ))}
        </div>
        <div data-ok className="absolute -right-2 -top-4 md:-right-4 flex items-center gap-2 rounded-full bg-ok px-4 py-2 text-[13px] font-extrabold text-[#052e16] shadow-[0_14px_30px_-10px_rgba(74,222,128,.7)]">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {c.listo}
        </div>
      </div>
    </div>
  );
}

const FRAMES = ["plato-tipico", "telar", "feria-noche", "parapente", "mercado", "sastre"];
function Contenido() {
  return (
    <div className={`${card} grid place-items-center`}>
      <div className="relative w-full">
        <div className="absolute inset-x-0 -top-3 h-2 bg-[repeating-linear-gradient(90deg,rgba(255,236,214,.18)_0_10px,transparent_10px_20px)]" />
        <div className="flex justify-center gap-[2.4%] px-[4%]">
          {FRAMES.map((f, i) => (
            <div key={f} data-frame className="relative aspect-[9/16] w-[15%] overflow-hidden rounded-[10px] shadow-[0_14px_30px_-12px_rgba(0,0,0,.8)]">
              <Photo name={f} alt="" className="absolute inset-0 block h-full w-full" />
              {i < 2 ? (
                <span className="absolute inset-x-1 bottom-1 rounded-md bg-night/70 px-1 py-0.5 text-center text-[8px] font-bold leading-tight text-fg backdrop-blur">
                  {V.contenido[i]}
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 -bottom-3 h-2 bg-[repeating-linear-gradient(90deg,rgba(255,236,214,.18)_0_10px,transparent_10px_20px)]" />
      </div>
      <div className="absolute bottom-[6%] flex gap-1.5">
        {V.contenido.map((c) => (
          <span key={c} data-chip className="glass rounded-full px-2.5 py-1 text-[11px] font-bold text-fg">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

const DOTS = Array.from({ length: 96 }, (_, i) => {
  const a = i * 2.399;
  const r = Math.sqrt(i / 96) * 44;
  return [50 + Math.cos(a) * r * 1.25, 50 + Math.sin(a) * r * 0.9];
});
function Lanzamiento() {
  return (
    <div className={card}>
      {DOTS.map(([x, y], i) => (
        <span
          key={i}
          data-dot
          className="absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber shadow-[0_0_14px_4px_rgba(255,181,71,.45)]"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
      <div data-live className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-cream px-5 py-3 text-[clamp(13px,1.2vw,17px)] font-extrabold text-ink shadow-[0_20px_60px_-10px_rgba(255,181,71,.6)]">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-ok/70" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-ok" />
        </span>
        {V.lanzamiento}
      </div>
    </div>
  );
}

function Informe() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="w-[min(92%,460px)] rounded-[28px] bg-[#f6f2ec] p-6 text-ink shadow-[var(--shadow-float)]">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-extrabold tracking-[-0.02em]">{V.informe.titulo}</p>
          <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold text-cream">PDF</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {V.informe.metricas.map((m) => (
            <div key={m.etiqueta} data-met className="rounded-[16px] bg-white p-3.5">
              <p className="text-[clamp(20px,2vw,28px)] font-extrabold leading-none tracking-[-0.03em] tabular">
                <span data-n data-v={m.valor}>
                  {miles(m.valor)}
                </span>
              </p>
              <p className="mt-1 text-[11px] font-semibold text-ink-2">{m.etiqueta}</p>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 200 50" className="mt-4 h-12 w-full" aria-hidden="true">
          <path data-spark d="M0 44 C 20 40 30 42 45 34 S 75 30 90 26 S 120 22 135 16 S 170 12 200 4" fill="none" stroke="#F45C55" strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        </svg>
      </div>
    </div>
  );
}

export const DIA_COMPONENTS: Record<string, () => React.JSX.Element> = {
  diagnostico: Diagnostico,
  mapeo: Mapeo,
  vitrina: Vitrina,
  capacitacion: Capacitacion,
  contenido: Contenido,
  lanzamiento: Lanzamiento,
  informe: Informe,
};

const countTo = (els: Element[], p: number) =>
  els.forEach((el) => {
    const v = Number((el as HTMLElement).dataset.v);
    el.textContent = miles(v * p);
  });

/** Timeline pausado de 0 a 1 para cada visual. */
export function buildDia(kind: string, el: HTMLElement): gsap.core.Timeline {
  const q = gsap.utils.selector(el);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
  switch (kind) {
    case "diagnostico": {
      const pct = q("[data-pct]");
      const o = { p: 0 };
      tl.fromTo(q("[data-bar]"), { scaleX: 0 }, { scaleX: 1, stagger: 0.08, duration: 0.55 }, 0.05)
        .to(o, { p: 1, duration: 0.85, onUpdate: () => pct.forEach((e) => (e.textContent = `${Math.round(Number((e as HTMLElement).dataset.v) * o.p)}%`)) }, 0.05)
        .fromTo(q("[data-falta]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.75);
      break;
    }
    case "mapeo": {
      const ns = q("[data-n]");
      const o = { p: 0 };
      tl.fromTo(q("[data-pin]"), { y: -60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.045, duration: 0.3, ease: "bounce.out" }, 0.02)
        .fromTo(q("[data-chip]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.2 }, 0.5)
        .to(o, { p: 1, duration: 0.4, onUpdate: () => countTo(ns, o.p) }, 0.55);
      break;
    }
    case "vitrina":
      tl.fromTo(q("[data-prof]"), { y: 160, autoAlpha: 0, rotate: 4 }, { y: 0, autoAlpha: 1, rotate: 0, stagger: 0.22, duration: 0.45, ease: "back.out(1.4)" }, 0.05);
      break;
    case "capacitacion": {
      const t = q("[data-type]")[0] as HTMLElement;
      const full = t.dataset.full ?? "";
      const o = { p: 0 };
      tl.to(o, { p: 1, duration: 0.5, ease: "none", onUpdate: () => (t.textContent = full.slice(0, Math.round(full.length * o.p))) }, 0.08)
        .fromTo(q("[data-thumb]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, stagger: 0.08, duration: 0.2, ease: "back.out(2)" }, 0.5)
        .fromTo(q("[data-ok]"), { scale: 0, rotate: -12, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.25, ease: "back.out(2.5)" }, 0.75);
      break;
    }
    case "contenido":
      tl.fromTo(
        q("[data-frame]"),
        { y: (i) => (i % 2 ? 140 : -140), rotate: (i) => (i % 2 ? 10 : -10), autoAlpha: 0 },
        { y: 0, rotate: 0, autoAlpha: 1, stagger: 0.08, duration: 0.45, ease: "power3.out" },
        0.02,
      ).fromTo(q("[data-chip]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.2 }, 0.65);
      break;
    case "lanzamiento":
      tl.fromTo(q("[data-dot]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, stagger: { each: 0.006, from: "center" }, duration: 0.25 }, 0)
        .fromTo(q("[data-live]"), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.25, ease: "back.out(2)" }, 0.6);
      break;
    case "informe": {
      const ns = q("[data-n]");
      const o = { p: 0 };
      tl.fromTo(q("[data-met]"), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.3 }, 0.02)
        .to(o, { p: 1, duration: 0.6, onUpdate: () => countTo(ns, o.p) }, 0.15)
        .to(q("[data-spark]"), { strokeDashoffset: 0, duration: 0.6, ease: "power1.inOut" }, 0.3);
      break;
    }
  }
  tl.to({}, { duration: Math.max(0, 1 - tl.duration()) });
  return tl;
}
