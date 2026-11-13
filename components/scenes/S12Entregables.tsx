"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { miles } from "@/lib/format";
import { entregables, sieteDias } from "@/content/site";
import { Photo } from "@/components/ui/Photo";
import { MaskLines } from "@/components/ui/MaskLines";
import { Lockup } from "@/components/ui/Lockup";

const V = sieteDias.visual;
const item = (id: string) => entregables.items.find((i) => i.id === id)!;

/* ── Visuales, uno por entregable ──────────────────────── */
function VisDiagnostico() {
  return (
    <div className="mt-5 grid gap-2.5">
      {V.diagnostico.filas.slice(0, 4).map((f, i) => (
        <div key={f.nombre} className="grid grid-cols-[96px_1fr_36px] items-center gap-3 text-[13px] font-bold">
          <span className="text-ink-2">{f.nombre}</span>
          <span className="relative h-2.5 overflow-hidden rounded-full bg-ink/[.08]">
            <span className="bt-grow absolute inset-y-0 left-0 rounded-full bg-[image:var(--grad-coral)]" style={{ width: `${f.valor}%`, transitionDelay: `${i * 0.12}s` }} />
          </span>
          <span className="text-right tabular">{f.valor}%</span>
        </div>
      ))}
      <p className="mt-1 text-[12px] font-semibold text-ink-2">{V.diagnostico.sub}</p>
      <p className="mt-3 flex items-center gap-2.5 rounded-[14px] bg-coral/10 px-3.5 py-2.5 text-[13px] font-bold text-[#b9342d]">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coral text-[13px] font-extrabold text-white">!</span>
        {V.diagnostico.alerta}
      </p>
    </div>
  );
}

// Pines en espiral (determinista), redondeados para que servidor y cliente coincidan
const PINS = Array.from({ length: 26 }, (_, i) => {
  const a = i * 2.399;
  const r = Math.sqrt(i + 0.5) / Math.sqrt(26);
  const round = (n: number) => Math.round(n * 10) / 10;
  return { x: round(50 + Math.cos(a) * r * 42), y: round(44 + Math.sin(a) * r * 34), c: ["#f45c55", "#3e6a4f", "#ffb547", "#1b130e"][i % 4] };
});
function VisMapa() {
  return (
    <div className="relative mt-5 h-[220px] overflow-hidden rounded-[20px] bg-[#efe8de] md:h-[260px]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx="52" cy="54" rx={8 + i * 9} ry={5 + i * 6} fill="none" stroke="#d9cfc1" strokeWidth=".35" vectorEffect="non-scaling-stroke" />
        ))}
        <path d="M0 72 C 25 64 45 80 70 66 S 95 58 100 62" fill="none" stroke="#c9dccd" strokeWidth="6" vectorEffect="non-scaling-stroke" />
      </svg>
      {PINS.map((p, i) => (
        <span key={i} className="bt-pin absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, transitionDelay: `${(15 + i * 4) / 100}s` }}>
          <span className="block h-3.5 w-3.5 rounded-full border-2 border-white shadow-[0_4px_10px_rgba(0,0,0,.25)]" style={{ background: p.c }} />
        </span>
      ))}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
        {V.mapeo.slice(0, 4).map((m, i) => (
          <span key={m.nombre} className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm">
            <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: ["#f45c55", "#3e6a4f", "#ffb547", "#1b130e"][i] }} />
            {m.n} {m.nombre.toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

function VisVitrina() {
  const p = V.perfiles[0];
  return (
    <div className="mt-5 overflow-hidden rounded-[22px] bg-[#fbf8f4] shadow-[0_24px_50px_-28px_rgba(60,30,10,.5)] ring-1 ring-ink/[.06]">
      <Photo name={p.foto} alt="" className="block aspect-[4/3] w-full overflow-hidden" imgClassName="bt-zoom h-full w-full object-cover" />
      <div className="p-4">
        <p className="text-[12px] font-semibold text-ink-2">{p.tipo} · Pelileo Grande</p>
        <p className="mt-0.5 text-[20px] font-extrabold leading-tight tracking-[-0.02em]">{p.nombre}</p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold text-[#15803d]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
          {p.horario}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {["plato-tipico", "comedor", "choclo-queso"].map((f) => (
            <Photo key={f} name={f} alt="" className="block aspect-square overflow-hidden rounded-[10px]" imgClassName="h-full w-full object-cover" />
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <span className="flex h-10 flex-1 items-center justify-center rounded-full border-[1.5px] border-ink text-[13px] font-bold">Cómo llegar</span>
          <span className="flex h-10 flex-1 items-center justify-center rounded-full bg-coral text-[13px] font-bold text-white">Reservar</span>
        </div>
      </div>
    </div>
  );
}

function VisCapacitacion() {
  const tareas = ["Subir fotos", "Actualizar horarios", "Responder reservas"];
  return (
    <div className="mt-5 flex items-center gap-5">
      <svg viewBox="0 0 44 44" className="h-[84px] w-[84px] shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(27,19,14,.08)" strokeWidth="5" />
        <circle className="bt-ring" cx="22" cy="22" r="18" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray="100" />
      </svg>
      <ul className="grid gap-2">
        {tareas.map((t, i) => (
          <li key={t} className="bt-task flex items-center gap-2 text-[14px] font-bold" style={{ transitionDelay: `${0.3 + i * 0.25}s` }}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#16a34a] text-white">
              <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function VisContenidos() {
  return (
    <div className="relative mt-5 flex-1 overflow-hidden rounded-[22px] bg-ink" data-bt-video>
      <video muted loop playsInline preload="none" poster="/media/video/volcan-v-poster.jpg" data-src="/media/video/volcan-v.mp4" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-coral" style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }} /> REC 00:14
      </span>
      <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
        {V.contenido.map((c) => (
          <span key={c} className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function VisDifusion() {
  return (
    <div className="relative mt-4 flex h-[120px] items-center justify-center overflow-hidden">
      {[0, 1, 2].map((i) => (
        <span key={i} className="bt-wave absolute h-[90px] w-[90px] rounded-full border-2 border-coral/50" style={{ animationDelay: `${i * 0.9}s` }} />
      ))}
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[image:var(--grad-coral)] text-white shadow-[0_14px_30px_-10px_rgba(244,92,85,.8)]">
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10v4h3l5 4V6L7 10H4Zm13-2a5 5 0 0 1 0 8m2.5-10.5a8.5 8.5 0 0 1 0 13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {["Reels", "Historias", "Publicaciones"].map((t, i) => (
        <span key={t} className="absolute rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink shadow-[0_6px_16px_-6px_rgba(60,30,10,.4)]" style={{ left: ["6%", "64%", "14%"][i], top: ["14%", "22%", "66%"][i] }}>
          {t}
        </span>
      ))}
    </div>
  );
}

function VisInforme() {
  const barras = [32, 40, 38, 52, 49, 61, 66, 72, 70, 84, 90, 100];
  return (
    <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1.1fr] md:items-end">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {V.informe.metricas.map((m) => (
          <div key={m.etiqueta}>
            <dt className="text-[12px] font-semibold text-ink-2">{m.etiqueta}</dt>
            <dd className="text-[clamp(22px,2.2vw,30px)] font-extrabold leading-tight tracking-[-0.03em] tabular">{miles(m.valor)}</dd>
          </div>
        ))}
      </dl>
      <div className="flex h-[110px] items-end gap-1.5">
        {barras.map((b, i) => (
          <span key={i} className="bt-bar flex-1 origin-bottom rounded-t-[5px]" style={{ height: `${b}%`, background: i === barras.length - 1 ? "var(--coral)" : "rgba(27,19,14,.14)", transitionDelay: `${0.1 + i * 0.05}s` }} />
        ))}
      </div>
    </div>
  );
}

const VIS: Record<string, () => React.ReactElement> = {
  diagnostico: VisDiagnostico,
  mapeo: VisMapa,
  vitrina: VisVitrina,
  capacitacion: VisCapacitacion,
  contenidos: VisContenidos,
  difusion: VisDifusion,
  informe: VisInforme,
};

const ORDEN = ["diagnostico", "mapeo", "vitrina", "capacitacion", "contenidos", "difusion", "informe"];

export function Entregables() {
  const root = useRef<HTMLElement>(null);

  // Cada tarjeta enciende su visual al entrar; el video corre solo mientras se ve
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia(MQ.reduce).matches;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-in");
          const v = e.target.querySelector<HTMLVideoElement>("[data-bt-video] video");
          if (v && !reduce) {
            if (e.isIntersecting) {
              if (!v.src) v.src = v.dataset.src!;
              v.play().catch(() => {});
            } else v.pause();
          }
        }),
      { threshold: 0.35 },
    );
    el.querySelectorAll(".bt-card").forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(q("[data-line]"), { yPercent: 115 }, { yPercent: 0, stagger: 0.12, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: q("[data-head]")[0], start: "top 80%" } });
      ScrollTriggerBatch(q(".bt-card") as HTMLElement[]);
      gsap.fromTo(q("[data-stamp]"), { rotate: -90, scale: 0.6 }, { rotate: 0, scale: 1, ease: "back.out(1.4)", duration: 1.2, scrollTrigger: { trigger: q("[data-sello]")[0], start: "top 85%" } });
    });
  });

  return (
    <section ref={root} id="entregables" data-scene="12" className="relative z-[1] -mt-[40px] rounded-t-[40px] bg-cream px-[var(--gutter)] pb-[14svh] pt-[16svh] text-ink" aria-labelledby="bt-title">
      <div className="mx-auto max-w-[1320px]">
        <div data-head className="max-w-[1000px]">
          <p className="t-eyebrow text-coral">Entregables</p>
          <MaskLines as="h2" id="bt-title" lines={["Todo lo que recibe", "tu municipio."]} className="t-h2 mt-5" lineClassName={(i) => (i === 1 ? "grad-text" : "")} />
        </div>

        <ol className="bt-grid mt-[8svh]">
          {ORDEN.map((id, k) => {
            const it = item(id);
            const Vis = VIS[id];
            return (
              <li key={id} className={`bt-card bt-${id}`}>
                <div className="flex items-baseline gap-3">
                  <span className="text-[13px] font-extrabold text-coral tabular">{String(k + 1).padStart(2, "0")}</span>
                  <h3 className="text-[clamp(22px,2vw,28px)] font-extrabold leading-tight tracking-[-0.03em]">{it.nombre}</h3>
                </div>
                <p className="mt-2 max-w-[44ch] text-[15px] font-medium leading-snug text-ink-2">{it.texto}</p>
                <Vis />
              </li>
            );
          })}

          {/* Etiqueta destacada */}
          <li data-sello className="bt-card bt-sello">
            <p className="relative z-[1] max-w-[16ch] text-[clamp(30px,3.4vw,52px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-fg">{entregables.etiqueta}</p>
            <div className="relative z-[1] mt-6">
              <Lockup size="md" />
            </div>
            <svg data-stamp viewBox="0 0 200 200" className="bt-stamp" aria-hidden="true">
              <defs>
                <path id="bt-circle" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" />
              </defs>
              <text fontSize="15.5" fontWeight="800" letterSpacing="3.2" fill="currentColor">
                <textPath href="#bt-circle">DE PRINCIPIO A FIN · EQUIPO CLAPZY · </textPath>
              </text>
              <circle cx="100" cy="100" r="22" fill="var(--coral)" />
            </svg>
          </li>
        </ol>
      </div>
    </section>
  );
}

function ScrollTriggerBatch(cards: HTMLElement[]) {
  gsap.set(cards, { y: 60, autoAlpha: 0 });
  cards.forEach((c, i) => {
    gsap.to(c, { y: 0, autoAlpha: 1, duration: 0.9, delay: (i % 3) * 0.08, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 92%" } });
  });
}
