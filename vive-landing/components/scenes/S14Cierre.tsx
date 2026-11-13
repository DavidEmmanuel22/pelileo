"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { track } from "@/lib/analytics";
import { cierre, config, provincias } from "@/content/site";
import { Andes, Condor } from "./Andes";
import { Arrow } from "./S01Hero";
import { Lockup } from "@/components/ui/Lockup";
import { Magnetic } from "@/components/ui/Magnetic";

type Campo = "nombre" | "cargo" | "municipio" | "provincia" | "whatsapp" | "correo";
type Datos = Record<Campo, string>;
const VACIO: Datos = { nombre: "", cargo: "", municipio: "", provincia: "", whatsapp: "", correo: "" };

function validar(d: Datos) {
  const e: Partial<Record<Campo, string>> = {};
  if (d.nombre.trim().length < 2) e.nombre = "Escribe tu nombre.";
  if (d.cargo.trim().length < 2) e.cargo = "Escribe tu cargo.";
  if (d.municipio.trim().length < 2) e.municipio = "Escribe tu municipio o cantón.";
  if (!d.provincia) e.provincia = "Elige tu provincia.";
  if (d.whatsapp.replace(/\D/g, "").length < 9) e.whatsapp = "Revisa el número: necesitamos al menos 9 dígitos.";
  if (d.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.correo = "Revisa el correo.";
  return e;
}

function waLink(d: Datos) {
  const msg = cierre.form.mensaje({ nombre: d.nombre.trim(), cargo: d.cargo.trim(), municipio: d.municipio.trim(), provincia: d.provincia });
  return `https://wa.me/${config.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function Formulario() {
  const [d, setD] = useState<Datos>(VACIO);
  const [err, setErr] = useState<Partial<Record<Campo, string>>>({});
  const [listo, setListo] = useState<string | null>(null);
  const first = useRef<HTMLDivElement>(null);
  const ok = useRef<HTMLDivElement>(null);
  const c = cierre.form.campos;

  useEffect(() => {
    if (listo) ok.current?.focus();
  }, [listo]);

  const set = (k: Campo) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setD((p) => ({ ...p, [k]: e.target.value }));
    if (err[k]) setErr((p) => ({ ...p, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validar(d);
    setErr(v);
    const bad = Object.keys(v)[0];
    if (bad) {
      first.current?.querySelector<HTMLElement>(`#f-${bad}`)?.focus();
      return;
    }
    const url = waLink(d);
    track("form_enviado", { provincia: d.provincia });
    window.open(url, "_blank", "noopener");
    setListo(url);
  };

  const field = (k: Campo, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={`cf-field ${err[k] ? "is-bad" : ""}`}>
      <label htmlFor={`f-${k}`}>{label}</label>
      <input id={`f-${k}`} name={k} value={d[k]} onChange={set(k)} aria-invalid={!!err[k]} aria-describedby={err[k] ? `e-${k}` : undefined} {...props} />
      {err[k] ? (
        <p id={`e-${k}`} className="cf-err">
          {err[k]}
        </p>
      ) : null}
    </div>
  );

  if (listo)
    return (
      <div ref={ok} tabIndex={-1} className="flex min-h-[420px] flex-col items-center justify-center text-center outline-none" role="status">
        <span className="cf-ok grid h-20 w-20 place-items-center rounded-full bg-[#16a34a] text-white">
          <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="mt-6 max-w-[22ch] text-[clamp(24px,2.4vw,32px)] font-extrabold leading-tight tracking-[-0.03em]">{cierre.form.exito}</p>
        <a href={listo} target="_blank" rel="noopener" className="mt-6 text-[15px] font-bold underline decoration-coral decoration-2 underline-offset-[6px]">
          Abrir WhatsApp otra vez
        </a>
        <button type="button" onClick={() => setListo(null)} className="mt-3 text-[14px] font-semibold text-ink-2 hover:text-ink">
          Editar mis datos
        </button>
      </div>
    );

  return (
    <form noValidate onSubmit={submit} aria-labelledby="cf-title">
      <div ref={first} className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
        {field("nombre", c.nombre, { autoComplete: "name", required: true })}
        {field("cargo", c.cargo, { autoComplete: "organization-title", required: true })}
        {field("municipio", c.municipio, { autoComplete: "address-level2", required: true })}
        <div className={`cf-field ${err.provincia ? "is-bad" : ""}`}>
          <label htmlFor="f-provincia">{c.provincia}</label>
          <select id="f-provincia" name="provincia" value={d.provincia} onChange={set("provincia")} aria-invalid={!!err.provincia} aria-describedby={err.provincia ? "e-provincia" : undefined} required>
            <option value="" disabled>
              Elige una
            </option>
            {provincias.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {err.provincia ? (
            <p id="e-provincia" className="cf-err">
              {err.provincia}
            </p>
          ) : null}
        </div>
        {field("whatsapp", c.whatsapp, { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "09 9999 9999", required: true })}
        {field("correo", c.correo, { type: "email", inputMode: "email", autoComplete: "email" })}
      </div>
      <button type="submit" className="btn btn-primary mt-6 w-full" onClick={() => track("cta_agendar", { lugar: "formulario" })}>
        {cierre.form.boton}
        <Arrow />
      </button>
      {config.CALENDAR_URL ? (
        <a href={config.CALENDAR_URL} target="_blank" rel="noopener" className="mt-4 block text-center text-[15px] font-bold text-ink-2 underline decoration-ink/30 underline-offset-[6px] hover:text-ink" onClick={() => track("cta_agendar", { lugar: "calendario" })}>
          {cierre.form.calendario}
        </a>
      ) : null}
    </form>
  );
}

export function Cierre() {
  const root = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);

  // El video del titular corre solo mientras se ve
  useEffect(() => {
    const v = vid.current;
    if (!v || window.matchMedia(MQ.reduce).matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!v.src) v.src = window.innerWidth < 768 ? "/media/video/volcan-720.mp4" : "/media/video/volcan-1080.mp4";
        v.play().catch(() => {});
      } else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const stage = q("[data-stage]")[0] as HTMLElement;
      // Ecuador otra vez, ahora encendido entero
      gsap.set(q("[data-town]"), { opacity: 0.25 });
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: stage, start: "top top", end: "+=130%", scrub: 0.6, pin: true } });
      tl.fromTo(q("[data-andes]"), { scale: 1.22 }, { scale: 1, duration: 1.6, ease: "power2.out" }, 0)
        .to(q("[data-town]"), { opacity: 1, stagger: 0.07, duration: 0.5 }, 0.1)
        .fromTo(q("[data-glow]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0.5)
        .fromTo(q("[data-condor2]"), { xPercent: -120, x: 0 }, { x: () => stage.clientWidth * 1.15, y: () => -stage.clientHeight * 0.1, duration: 2, ease: "none" }, 0.2)
        .fromTo(q("[data-stage-copy]"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.1)
        .to({}, { duration: 0.4 });
      q("[data-layer]").forEach((l) => {
        const d = { sky: 0.04, far: 0.08, mid: 0.14, near: 0.22, valley: 0.3, front: 0.4 }[(l as HTMLElement).dataset.layer as string] ?? 0;
        if (d) tl.fromTo(l, { yPercent: d * 30 }, { yPercent: 0, duration: 1.6, ease: "power2.out" }, 0);
      });

      gsap.fromTo(q("[data-hl] [data-hl-line]"), { yPercent: 105 }, { yPercent: 0, stagger: 0.12, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: q("[data-hl]")[0], start: "top 80%" } });
      gsap.fromTo(q("[data-path]"), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, stagger: 0.15, duration: 1, ease: "power3.out", scrollTrigger: { trigger: q("[data-paths]")[0], start: "top 85%" } });
    });
  });

  const titular = cierre.titular;

  return (
    <section ref={root} id="cierre" data-scene="14" className="relative bg-night" aria-labelledby="cierre-title">
      {/* Ecuador encendido */}
      <div data-stage className="relative h-[100svh] overflow-hidden">
        <div data-andes className="absolute inset-0 origin-[50%_85%]">
          <Andes full />
        </div>
        <div data-glow className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_42%_at_50%_82%,rgba(255,170,90,.46),transparent_70%),linear-gradient(180deg,transparent_45%,rgba(255,140,80,.12)_70%,transparent_90%)]" aria-hidden="true" />
        <div data-condor2 className="absolute left-0 top-[26%] w-[84px] md:w-[130px]" aria-hidden="true">
          <Condor />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-transparent to-night" aria-hidden="true" />
        <p data-stage-copy className="absolute inset-x-0 bottom-[9svh] px-[var(--gutter)] text-center text-[clamp(18px,1.8vw,24px)] font-semibold text-fg-2">
          Cada valle encendido. Cada negocio en vitrina.
        </p>
      </div>

      {/* Titular con video dentro de las letras */}
      <div data-hl className="cf-hl relative mx-auto max-w-[1600px] px-[var(--gutter)] pt-[6svh]">
        <div className="cf-hl-box">
          <video ref={vid} muted loop playsInline preload="none" poster="/media/video/volcan-poster.jpg" className="cf-hl-video" aria-hidden="true" />
          <h2 id="cierre-title" className="cf-hl-text">
            {titular.map((l) => (
              <span key={l} className="block overflow-hidden pb-[0.06em]">
                <span data-hl-line className="block">
                  {l}
                </span>
              </span>
            ))}
          </h2>
        </div>
      </div>

      {/* Dos caminos */}
      <div data-paths className="mx-auto mt-[8svh] grid max-w-[1320px] gap-5 px-[var(--gutter)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-6">
        {/* Ver la demo */}
        <div data-path className="cf-demo group">
          <a href={config.DEMO_URL} target="_blank" rel="noopener" className="absolute inset-0 z-[2]" aria-label={`${cierre.demo.titulo}: ${cierre.demo.texto}`} data-cursor="ver" onClick={() => track("cta_ver_demo", { lugar: "cierre" })} />
          <div className="relative aspect-[16/10] overflow-hidden rounded-[22px]">
            <img src="/screens/inicio-escritorio.webp" alt="" className="h-full w-full object-cover object-left-top transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="cf-demo-float screen">
              <img src="/screens/gaia-chat.webp" alt="" loading="lazy" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="t-eyebrow text-coral-2">{cierre.demo.titulo}</p>
              <p className="mt-2 text-[clamp(26px,2.6vw,38px)] font-extrabold leading-tight tracking-[-0.03em] text-fg">{cierre.demo.texto}</p>
            </div>
            <Magnetic className="relative z-[3]">
              <a href={config.DEMO_URL} target="_blank" rel="noopener" className="btn btn-primary" onClick={() => track("cta_ver_demo", { lugar: "cierre-boton" })}>
                {cierre.demo.boton}
                <Arrow />
              </a>
            </Magnetic>
          </div>
        </div>

        {/* Agendar */}
        <div data-path id="agendar" className="cf-form scroll-mt-24">
          <p className="t-eyebrow text-coral">Agendar</p>
          <h3 id="cf-title" className="mt-2 text-[clamp(26px,2.6vw,38px)] font-extrabold leading-tight tracking-[-0.03em]">
            {cierre.form.titulo}
          </h3>
          <div className="mt-6">
            <Formulario />
          </div>
        </div>
      </div>

      {/* Pie */}
      <footer className="mx-auto mt-[14svh] flex max-w-[1320px] flex-col gap-6 border-t border-[var(--line-d)] px-[var(--gutter)] pb-[calc(40px+env(safe-area-inset-bottom))] pt-10 md:flex-row md:pb-24 md:items-center md:justify-between">
        <Lockup size="md" />
        <div className="flex flex-col gap-2 text-[15px] font-semibold text-fg-2 md:flex-row md:items-center md:gap-8">
          <a href={`mailto:${config.CONTACT_EMAIL}`} className="hover:text-fg">
            {config.CONTACT_EMAIL}
          </a>
          <span className="text-fg-3">{cierre.pie.copy}</span>
        </div>
      </footer>
    </section>
  );
}
