"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { antesDespues } from "@/content/site";
import { Photo } from "@/components/ui/Photo";

const MENSAJES = [
  { t: "¿alguien sabe dónde venden fritada el domingo?", h: "9:41" },
  { t: "¿a qué hora abre el mirador?", h: "10:02" },
  { t: "¿hay algo para hacer hoy con niños??", h: "11:15" },
  { t: "creo que la feria era la otra semana", h: "11:16" },
];

/** El "antes": folletos, publicaciones sueltas, un mapa genérico y preguntas sin respuesta. */
function Antes() {
  return (
    <div className="ad-antes" aria-hidden="true">
      {/* Folleto amarillo */}
      <div className="ad-item ad-flyer" style={{ ["--x" as string]: "3%", ["--y" as string]: "7%", ["--mx" as string]: "4%", ["--my" as string]: "11%", rotate: "-7deg" }}>
        <span className="ad-tape" style={{ left: "38%", top: "-0.9em", rotate: "4deg" }} />
        <p className="text-[2.1em] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]">Feria de sabores</p>
        <p className="mt-[0.4em] text-[1.25em] font-bold">¡¡este sábado!!</p>
        <p className="mt-[0.6em] text-[0.95em] font-semibold opacity-70">info: 09•• ••• •••</p>
        <p className="mt-[0.2em] text-[0.95em] font-semibold opacity-70">lugar: por confirmar</p>
      </div>

      {/* Foto impresa en blanco y negro */}
      <div className="ad-item ad-print" style={{ ["--x" as string]: "24%", ["--y" as string]: "4%", ["--mx" as string]: "54%", ["--my" as string]: "3%", rotate: "5deg" }}>
        <Photo name="concierto" alt="" className="block aspect-[4/3] w-full overflow-hidden" imgClassName="h-full w-full object-cover grayscale contrast-125" />
        <p className="mt-[0.5em] text-[1.05em] font-bold">Concierto ¿en la plaza?</p>
      </div>

      {/* Publicación vieja */}
      <div className="ad-item ad-post" style={{ ["--x" as string]: "6%", ["--y" as string]: "52%", ["--mx" as string]: "4%", ["--my" as string]: "40%", rotate: "3deg" }}>
        <div className="flex items-center gap-[0.5em]">
          <span className="h-[1.8em] w-[1.8em] rounded-full bg-[#9a9389]" />
          <span className="text-[0.95em] font-bold">Turismo Cantón</span>
          <span className="ml-auto text-[0.8em] font-semibold opacity-60">hace 3 semanas</span>
        </div>
        <div className="mt-[0.6em] aspect-[16/9] overflow-hidden rounded-[0.4em] bg-[#bdb6aa]">
          <Photo name="laguna-valle" alt="" className="block h-full w-full" imgClassName="h-full w-full object-cover blur-[2px] grayscale-[60%]" />
        </div>
        <p className="mt-[0.5em] text-[1em] font-semibold">Pronto más información…</p>
      </div>

      {/* Mapa genérico */}
      <div className="ad-item ad-map" style={{ ["--x" as string]: "29%", ["--y" as string]: "44%", ["--mx" as string]: "56%", ["--my" as string]: "33%", rotate: "-3deg" }}>
        <svg viewBox="0 0 200 130" className="block h-auto w-full" aria-hidden="true">
          <rect width="200" height="130" fill="#e4e1db" />
          <g stroke="#fff" strokeWidth="6" fill="none">
            <path d="M-5 40 L205 52" />
            <path d="M-5 96 L205 84" />
            <path d="M60 -5 L72 135" />
            <path d="M140 -5 L128 135" />
          </g>
          <g stroke="#f2efe9" strokeWidth="2.5" fill="none">
            <path d="M-5 70 L205 68" />
            <path d="M100 -5 L101 135" />
            <path d="M20 -5 L30 135" />
            <path d="M175 -5 L170 135" />
          </g>
          <path d="M100 52 c-8 0 -13 6 -13 13 c0 10 13 22 13 22 s13 -12 13 -22 c0 -7 -5 -13 -13 -13 Z" fill="#d93a32" />
          <text x="100" y="69" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">?</text>
        </svg>
        <p className="mt-[0.4em] text-[0.9em] font-bold opacity-70">“Estamos por aquí”</p>
      </div>

      {/* Nota adhesiva */}
      <div className="ad-item ad-sticky" style={{ ["--x" as string]: "45%", ["--y" as string]: "22%", ["--mx" as string]: "36%", ["--my" as string]: "24%", rotate: "8deg" }}>
        <p className="text-[1.25em] font-bold leading-tight">Cerrado hoy</p>
        <p className="text-[1.05em] font-semibold opacity-70">(creo)</p>
      </div>

      {/* Mensajes */}
      <div className="ad-item ad-chat" style={{ ["--x" as string]: "50%", ["--y" as string]: "50%", ["--mx" as string]: "28%", ["--my" as string]: "61%", rotate: "-2deg" }}>
        <p className="mb-[0.6em] text-[0.85em] font-bold uppercase tracking-[0.08em] opacity-60">Grupo · Vecinos del centro</p>
        {MENSAJES.map((m) => (
          <p key={m.t} className="ad-bubble">
            {m.t}
            <span className="ml-[0.6em] text-[0.75em] opacity-50">{m.h}</span>
          </p>
        ))}
      </div>

      {/* Otro folleto, al borde derecho */}
      <div className="ad-item ad-flyer ad-flyer-2" style={{ ["--x" as string]: "74%", ["--y" as string]: "9%", ["--mx" as string]: "3%", ["--my" as string]: "70%", rotate: "4deg" }}>
        <span className="ad-tape" style={{ left: "20%", top: "-0.9em", rotate: "-6deg" }} />
        <p className="text-[1.6em] font-extrabold uppercase leading-[0.95]">Se arriendan cabañas</p>
        <p className="mt-[0.5em] text-[0.95em] font-semibold opacity-70">llamar al dueño</p>
        <div className="mt-[0.6em] flex gap-[0.3em]">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="h-[2.8em] flex-1 border-l border-dashed border-ink/30 [writing-mode:vertical-rl] text-[0.6em] opacity-60">
              09••
            </span>
          ))}
        </div>
      </div>

      <div className="ad-item ad-sticky ad-sticky-2" style={{ ["--x" as string]: "78%", ["--y" as string]: "60%", ["--mx" as string]: "72%", ["--my" as string]: "84%", rotate: "-6deg" }}>
        <p className="text-[1.15em] font-bold leading-tight">¿Bus al mirador?</p>
        <p className="text-[1em] font-semibold opacity-70">preguntar en el parque</p>
      </div>
    </div>
  );
}

/** El "con Vive": la app limpia, con Gaia, planes y agenda. */
function ConVive() {
  return (
    <div className="ad-vive" aria-hidden="true">
      <img src="/screens/inicio-escritorio.webp" alt="" className="ad-vive-bg" />
      <div className="ad-vive-float ad-vf-1 screen">
        <img src="/screens/agenda.webp" alt="" />
      </div>
      <div className="ad-vive-float ad-vf-2 screen">
        <img src="/screens/gaia-itinerario.webp" alt="" />
      </div>
    </div>
  );
}

export function AntesDespues() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const pos = useRef({ p: 50 });
  const touched = useRef(false);

  const apply = useCallback((p: number) => {
    const v = Math.max(0, Math.min(100, p));
    pos.current.p = v;
    frame.current?.style.setProperty("--p", `${v}%`);
    handle.current?.setAttribute("aria-valuenow", String(Math.round(v)));
  }, []);

  // Arrastre con mouse, dedo o teclado
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let dragging = false;
    const at = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      apply(((e.clientX - r.left) / r.width) * 100);
    };
    const down = (e: PointerEvent) => {
      dragging = true;
      touched.current = true;
      gsap.killTweensOf(pos.current);
      el.setPointerCapture(e.pointerId);
      at(e);
    };
    const move = (e: PointerEvent) => dragging && at(e);
    const up = () => (dragging = false);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [apply]);

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 20 : 5;
    let p = pos.current.p;
    if (e.key === "ArrowLeft") p -= step;
    else if (e.key === "ArrowRight") p += step;
    else if (e.key === "Home") p = 0;
    else if (e.key === "End") p = 100;
    else return;
    e.preventDefault();
    touched.current = true;
    gsap.killTweensOf(pos.current);
    apply(p);
  };

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(q("[data-word]"), { yPercent: 110 }, { yPercent: 0, stagger: 0.08, duration: 1, ease: "power4.out", scrollTrigger: { trigger: q("[data-head]")[0], start: "top 80%" } });
      gsap.fromTo(frame.current, { y: 80, scale: 0.94, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, ease: "power2.out", scrollTrigger: { trigger: frame.current, start: "top 95%", end: "top 55%", scrub: 0.6 } });
      gsap.fromTo(q(".ad-item"), { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, stagger: 0.06, duration: 0.6, ease: "back.out(1.6)", scrollTrigger: { trigger: frame.current, start: "top 70%" } });
      gsap.fromTo(q("[data-txt]"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: q("[data-txt]")[0], start: "top 92%" } });
      // El deslizador se mueve solo una vez para enseñar que se puede arrastrar
      ScrollTriggerOnce(frame.current!, () => {
        if (touched.current) return;
        gsap
          .timeline({ onUpdate: () => apply(pos.current.p) })
          .to(pos.current, { p: 82, duration: 1.1, ease: "power2.inOut" })
          .to(pos.current, { p: 18, duration: 1.4, ease: "power2.inOut" })
          .to(pos.current, { p: 50, duration: 1, ease: "power2.inOut" });
      });
    });
  });

  return (
    <section ref={root} id="antes-despues" data-scene="10" className="relative bg-night px-[var(--gutter)] pb-[16svh] pt-[18svh]" aria-labelledby="ad-title">
      <div data-head className="mx-auto max-w-[1280px]">
        <h2 id="ad-title" className="t-display text-fg">
          {antesDespues.titular.split(" ").map((w, i, a) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
              <span data-word className={`inline-block ${i === a.length - 1 ? "grad-text" : ""}`}>
                {w}
                {i < a.length - 1 ? " " : ""}
              </span>
            </span>
          ))}
        </h2>
      </div>

      <div className="mx-auto mt-[6svh] max-w-[1280px]">
        <div ref={frame} className="ad-frame" data-cursor="arrastra" style={{ ["--p" as string]: "50%" }}>
          <Antes />
          <div className="ad-clip">
            <ConVive />
          </div>
          <span className="ad-chip left-4 bg-ink/70 text-fg">{antesDespues.antes}</span>
          <span className="ad-chip right-4 bg-white text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            {antesDespues.despues}
          </span>
          <div className="ad-line" aria-hidden="true" />
          <div
            ref={handle}
            className="ad-handle"
            role="slider"
            tabIndex={0}
            aria-label="Comparar antes y con Vive"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={50}
            aria-valuetext="Desliza para comparar"
            onKeyDown={onKey}
            data-cursor="arrastra"
          >
            <svg width="26" height="14" viewBox="0 0 26 14" aria-hidden="true">
              <path d="M7 1 1 7l6 6M19 1l6 6-6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-10">
          <p data-txt className="text-[clamp(20px,2.2vw,30px)] font-bold leading-snug tracking-[-0.02em] text-fg-3">
            {antesDespues.texto[0]}
          </p>
          <p data-txt className="text-[clamp(20px,2.2vw,30px)] font-bold leading-snug tracking-[-0.02em] text-fg md:text-right">
            {antesDespues.texto[1]}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Corre una función la primera vez que el elemento entra bien en pantalla. */
function ScrollTriggerOnce(el: HTMLElement, fn: () => void) {
  gsap.timeline({ scrollTrigger: { trigger: el, start: "top 55%", once: true, onEnter: fn } });
}
