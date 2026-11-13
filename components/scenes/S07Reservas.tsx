"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { reservas } from "@/content/site";
import { MaskLines } from "@/components/ui/MaskLines";

const ROW = "(min-width: 1024px)";

const RIEL = [
  { id: "r-volquetero", nombre: "El Volquetero", tipo: "Comida típica", nota: "4.7" },
  { id: "r-indigo", nombre: "Café Índigo", tipo: "Café", nota: "4.8" },
  { id: "r-fogon", nombre: "Fogón del Tungurahua", tipo: "Restaurante", nota: "4.6" },
  { id: "r-trucha", nombre: "Truchas del Valle", tipo: "Restaurante", nota: "4.5" },
];

/** Posición de un elemento dentro del escenario, sin contar transformaciones. */
function off(el: HTMLElement, stage: HTMLElement) {
  let x = 0;
  let y = 0;
  let e: HTMLElement | null = el;
  while (e && e !== stage) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight, r: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0 };
}

function Tap() {
  return <span data-tap className="rs-tap" aria-hidden="true" />;
}

function Tabs({ on }: { on: number }) {
  const items = ["Inicio", "Explorar", "Gaia", "Eventos", "Guardados"];
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-ink/[.06] bg-white/95 px-[0.6em] pb-[1.1em] pt-[0.7em]">
      {items.map((t, i) => (
        <span key={t} className={`flex flex-col items-center gap-[0.25em] text-[0.82em] font-semibold ${i === on ? "text-ink" : "text-ink/45"}`}>
          <span className={`block h-[1.5em] w-[1.5em] rounded-[0.45em] ${i === 2 ? "bg-coral/80" : i === on ? "bg-ink" : "border-[0.14em] border-ink/35"}`} />
          {t}
        </span>
      ))}
    </div>
  );
}

/* ── Pantalla 1 · Descubre ─────────────────────────────── */
function Descubre() {
  return (
    <div className="rs-screen" data-screen>
      <div className="px-[1.6em] pt-[2.2em]">
        <div className="flex items-center justify-between">
          <p className="text-[1.25em] font-extrabold tracking-[-0.02em]">
            Vive <span className="font-medium">Pelileo</span>
          </p>
          <span className="h-[2.4em] w-[2.4em] rounded-full bg-[url(/media/places/las-caras.webp)] bg-cover" />
        </div>
        <p className="mt-[1.4em] text-[2.15em] font-extrabold leading-[1.02] tracking-[-0.035em]">¿Qué hacemos hoy?</p>
        <div className="mt-[1.1em] flex gap-[0.5em] text-[1.05em] font-semibold">
          {["Comer", "Dormir", "Hacer", "Eventos"].map((c, i) => (
            <span key={c} className={`rounded-full px-[0.95em] py-[0.45em] ${i === 0 ? "bg-ink text-white" : "border border-ink/15 text-ink/70"}`}>
              {c}
            </span>
          ))}
        </div>
        <p className="mt-[1.6em] flex items-baseline justify-between text-[1.3em] font-extrabold">
          Para comer hoy <span className="text-[0.75em] font-bold text-coral">Ver todo</span>
        </p>
      </div>
      <div className="mt-[0.9em] overflow-hidden pl-[1.6em]">
        <div data-rail className="flex gap-[0.9em]">
          {RIEL.map((r) => (
            <div key={r.id} data-card={r.id} className="w-[13.4em] shrink-0">
              <div data-card-photo={r.id} className="relative h-[10.6em] overflow-hidden rounded-[1.2em] bg-ink/10">
                <img src={`/media/places/${r.id}.webp`} alt="" className="h-full w-full object-cover" />
                {r.id === "r-fogon" ? <Tap /> : null}
              </div>
              <p className="mt-[0.6em] truncate text-[1.15em] font-extrabold leading-tight">{r.nombre}</p>
              <p className="text-[0.95em] font-semibold text-ink/55">
                {r.tipo} · ★ {r.nota}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-[1.6em] mt-[1.5em] flex items-center gap-[0.9em] rounded-[1.2em] border border-ink/[.08] bg-white p-[0.8em]">
        <div className="grid h-[3.6em] w-[3.2em] shrink-0 place-items-center rounded-[0.8em] border border-ink/10 text-center leading-none">
          <span className="text-[0.75em] font-bold text-ink/55">SÁB</span>
          <span className="text-[1.35em] font-extrabold">14</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[1.1em] font-extrabold">Feria artesanal Salasaka</p>
          <p className="text-[0.95em] font-semibold text-[#15803d]">Gratis · 08:00</p>
        </div>
      </div>
      <Tabs on={0} />
    </div>
  );
}

/* ── Pantalla 2 · Elige ────────────────────────────────── */
function Elige() {
  return (
    <div className="rs-screen" data-screen>
      <div className="px-[1.2em] pt-[1.2em]">
        <div data-hero-slot className="relative h-[17em] overflow-hidden rounded-[1.8em] bg-ink/10">
          <img src="/media/places/r-fogon.webp" alt="" className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="px-[1.6em] pt-[1.3em]">
        <p data-s2-in className="text-[1em] font-semibold text-ink/55">Comer · Pelileo Grande</p>
        <p data-s2-in className="mt-[0.2em] text-[2em] font-extrabold leading-[1.02] tracking-[-0.035em]">Fogón del Tungurahua</p>
        <p data-s2-in className="mt-[0.6em] flex items-center gap-[0.45em] text-[1em] font-semibold text-ink/65">
          <span className="h-[0.55em] w-[0.55em] rounded-full bg-[#16a34a]" />
          <span className="text-[#15803d]">Abierto</span> · Cierra 18:00 · <b className="text-ink">★ 4.6</b> (401)
        </p>
        <p data-s2-in className="mt-[0.9em] text-[1.08em] font-medium leading-[1.4] text-ink/75">
          Cocina de leña con vista al valle. Fritada, tortillas de maíz y jugo de mora.
        </p>
        <div data-s2-in className="mt-[1em] flex flex-wrap gap-[0.45em] text-[0.92em] font-semibold">
          {["Vista al valle", "Leña", "Para grupos"].map((c) => (
            <span key={c} className="rounded-full bg-ink/[.06] px-[0.8em] py-[0.35em]">
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 border-t border-ink/[.06] bg-white px-[1.4em] pb-[1.6em] pt-[1em]">
        <p className="text-[0.95em] font-semibold text-ink/55">
          Desde <b className="text-[1.2em] text-ink">$10</b> por persona
        </p>
        <div className="mt-[0.7em] flex gap-[0.6em]">
          <span className="flex h-[3.6em] flex-1 items-center justify-center rounded-full border-[0.12em] border-ink text-[1.15em] font-bold">Cómo llegar</span>
          <span data-reserve className="relative flex h-[3.6em] flex-1 items-center justify-center rounded-full bg-coral text-[1.15em] font-bold text-white">
            Reservar
            <Tap />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Pantalla 3 · Reserva ──────────────────────────────── */
function Reserva() {
  return (
    <div className="rs-screen" data-screen>
      <div className="flex flex-col items-center px-[1.6em] pt-[3.4em] text-center">
        <div data-check-slot className="grid h-[6.4em] w-[6.4em] place-items-center rounded-full bg-[#16a34a] text-white">
          <svg viewBox="0 0 24 24" className="h-[3em] w-[3em]" aria-hidden="true">
            <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p data-s3-in className="mt-[1.4em] text-[2em] font-extrabold leading-[1.02] tracking-[-0.035em]">¡Listo, reservado!</p>
        <p data-s3-in className="mt-[0.5em] text-[1.08em] font-medium leading-[1.35] text-ink/65">Te esperan en el Fogón del Tungurahua. Te avisamos un día antes.</p>
      </div>
      <div data-s3-in className="mx-[1.4em] mt-[1.6em] overflow-hidden rounded-[1.4em] border border-ink/[.08] bg-white">
        <div className="flex items-center gap-[0.8em] p-[0.9em]">
          <img src="/media/places/r-fogon.webp" alt="" className="h-[3.4em] w-[3.4em] rounded-[0.8em] object-cover" />
          <div className="min-w-0 text-left">
            <p className="truncate text-[1.1em] font-extrabold">Fogón del Tungurahua</p>
            <p className="text-[0.92em] font-semibold text-ink/55">Mesa con vista al valle</p>
          </div>
        </div>
        <div className="mx-[0.9em] border-t border-dashed border-ink/15" />
        <dl className="grid grid-cols-3 gap-[0.4em] p-[0.9em] text-left">
          {[
            ["Día", "Sábado"],
            ["Hora", "13:00"],
            ["Personas", "4"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[0.85em] font-semibold text-ink/50">{k}</dt>
              <dd className="text-[1.2em] font-extrabold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div data-s3-in className="absolute inset-x-[1.4em] bottom-[1.8em] flex flex-col gap-[0.6em]">
        <span className="flex h-[3.6em] items-center justify-center rounded-full bg-ink text-[1.15em] font-bold text-white">Agregar a mi plan</span>
        <span className="text-center text-[1em] font-bold text-ink/60">Código VP-2841</span>
      </div>
    </div>
  );
}

const PARTICULAS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 + (i % 2 ? 0.17 : -0.11);
  const r = 70 + ((i * 37) % 60);
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 6 + ((i * 13) % 8), c: i % 3 === 0 ? "var(--amber)" : i % 3 === 1 ? "var(--coral)" : "var(--coral-2)" };
});

export function Reservas() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    const head = q("[data-head]")[0];

    mm.add(MQ.motion, () => {
      gsap.fromTo(q("[data-line]"), { yPercent: 115 }, { yPercent: 0, stagger: 0.12, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: head, start: "top 85%" } });
    });

    mm.add({ motion: MQ.motion, row: ROW }, (ctx) => {
      if (!ctx.conditions?.motion) return;
      const row = !!ctx.conditions.row;
      const stage = q("[data-stage]")[0] as HTMLElement;
      const screens = q("[data-screen]") as HTMLElement[];
      const [s1, s2, s3] = screens;
      const rail = q("[data-rail]")[0] as HTMLElement;
      const card0 = q("[data-card-photo]")[0] as HTMLElement;
      const cardF = q('[data-card-photo="r-fogon"]')[0] as HTMLElement;
      const hero = q("[data-hero-slot]")[0] as HTMLElement;
      const reserve = q("[data-reserve]")[0] as HTMLElement;
      const check = q("[data-check-slot]")[0] as HTMLElement;
      const f1 = q("[data-flyer1]")[0] as HTMLElement;
      const f2 = q("[data-flyer2]")[0] as HTMLElement;
      const taps = q("[data-tap]");
      const labels = q("[data-label]");
      const DIM = row ? 0.32 : 0;

      const setStep = (n: number) => labels.forEach((l, i) => l.classList.toggle("is-on", i === n));

      // Entrada: las pantallas suben mientras la sección llega
      gsap.fromTo(screens, { y: (i) => 140 + i * 50, rotate: (i) => (i - 1) * 3 }, { y: 0, rotate: 0, ease: "power2.out", stagger: 0.05, scrollTrigger: { trigger: root.current, start: "top bottom", end: "top top", scrub: 0.6 } });

      gsap.set([s2, s3], { autoAlpha: DIM });
      // En fila, las pantallas apagadas ya muestran su contenido; en pila, el contenido entra al activarse
      if (!row) gsap.set(q("[data-s2-in], [data-s3-in]"), { autoAlpha: 0, y: 16 });
      gsap.set([hero.firstElementChild, check], { autoAlpha: 0 });
      gsap.set(q("[data-bajada]"), { autoAlpha: 0, y: 16 });
      gsap.set(q("[data-toast]"), { yPercent: -160, autoAlpha: 0 });
      gsap.set(taps, { scale: 0, autoAlpha: 0 });
      gsap.set(q("[data-particle]"), { x: 0, y: 0, scale: 1, autoAlpha: 0 });
      setStep(0);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: stage, start: "top top", end: row ? "+=320%" : "+=300%", scrub: 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
      });

      const shift = () => -(cardF.parentElement!.offsetLeft - card0.parentElement!.offsetLeft);

      // 1 · Descubre: el riel corre hasta el Fogón y se toca
      tl.to(rail, { x: shift, duration: 1, ease: "power2.inOut" }, 0.1)
        .fromTo(taps[0], { scale: 0, autoAlpha: 0.9 }, { scale: 2.4, autoAlpha: 0, duration: 0.45, ease: "power2.out" }, 1.05)
        // 2 · la foto vuela y se vuelve la portada del lugar
        .set(f1, { autoAlpha: 1 }, 1.3)
        .set(cardF, { autoAlpha: 0 }, 1.3)
        .fromTo(
          f1,
          { x: () => off(card0, stage).x, y: () => off(card0, stage).y, width: () => card0.offsetWidth, height: () => card0.offsetHeight, borderRadius: () => off(card0, stage).r },
          { x: () => off(hero, stage).x, y: () => off(hero, stage).y, width: () => hero.offsetWidth, height: () => hero.offsetHeight, borderRadius: () => off(hero, stage).r, duration: 1, ease: "power3.inOut" },
          1.3,
        )
        // la foto aterriza: pasa a ser parte de la pantalla 2
        .set(hero.firstElementChild, { autoAlpha: 1 }, 2.31)
        .set(f1, { autoAlpha: 0 }, 2.31)
        .to(s1, { autoAlpha: DIM, duration: 0.5 }, row ? 1.5 : 1.75)
        .to(s2, { autoAlpha: 1, duration: 0.5 }, 1.45)
        .call(() => setStep(1), [], 1.8)
        .call(() => setStep(0), [], 1.79)
        .to(q("[data-s2-in]"), { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }, 2.25)
        // 3 · segundo toque: Reservar
        .fromTo(taps[1], { scale: 0, autoAlpha: 0.9 }, { scale: 2.4, autoAlpha: 0, duration: 0.45, ease: "power2.out" }, 3.05)
        .set(f2, { autoAlpha: 1 }, 3.35)
        .set(reserve, { autoAlpha: 0 }, 3.35)
        .fromTo(
          f2,
          { x: () => off(reserve, stage).x, y: () => off(reserve, stage).y, width: () => reserve.offsetWidth, height: () => reserve.offsetHeight, borderRadius: () => reserve.offsetHeight / 2, backgroundColor: "#f45c55" },
          { x: () => off(check, stage).x, y: () => off(check, stage).y, width: () => check.offsetWidth, height: () => check.offsetHeight, borderRadius: () => check.offsetWidth / 2, duration: 1, ease: "power3.inOut" },
          3.35,
        )
        .fromTo(q("[data-f2-text]"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25 }, 3.35)
        .to(s2, { autoAlpha: DIM, duration: 0.5 }, row ? 3.55 : 3.8)
        .to(s3, { autoAlpha: 1, duration: 0.5 }, 3.5)
        .call(() => setStep(2), [], 3.9)
        .call(() => setStep(1), [], 3.89)
        // 4 · se vuelve verde, se dibuja el check y estalla en partículas
        .to(f2, { backgroundColor: "#16a34a", duration: 0.3 }, 4.35)
        .fromTo(f2, { scale: 1 }, { scale: 1.14, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, 4.35)
        .fromTo(q("[data-f2-check]"), { strokeDashoffset: 24 }, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, 4.45)
        .to(q("[data-particle]"), { autoAlpha: 1, duration: 0.05 }, 4.45);
      PARTICULAS.forEach((p, i) => {
        tl.to(q("[data-particle]")[i], { x: p.x, y: p.y, scale: 0, duration: 0.85, ease: "power3.out" }, 4.47);
      });
      tl.fromTo(q("[data-s3-in]"), { autoAlpha: row ? 1 : 0, y: row ? 0 : 16 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.45, ease: "power2.out" }, 4.65)
        // 5 · la notificación cae desde arriba
        .to(q("[data-toast]"), { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: "back.out(1.6)" }, 5.25)
        // 6 · remate
        .to(q("[data-labels]"), { autoAlpha: 0, y: -10, duration: 0.35 }, 6)
        .to(q("[data-bajada]"), { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 6.15)
        .to({}, { duration: 0.8 });
    });
  });

  return (
    <section ref={root} id="reservas" data-scene="7" className="relative z-[1] -mt-[40px] rounded-t-[40px] bg-cream text-ink" aria-labelledby="reservas-title">
      <div data-stage className="rs-stage">
        <div data-head className="relative z-[2] px-[var(--gutter)] text-center">
          <p className="t-eyebrow text-coral">Reservas</p>
          <MaskLines as="h2" id="reservas-title" lines={["Del ¿qué hacemos hoy?", "a la reserva, en dos toques."]} className="rs-title mt-4" lineClassName={(i) => (i === 1 ? "grad-text" : "")} />
        </div>

        <div className="rs-screens" aria-hidden="true">
          <Descubre />
          <Elige />
          <Reserva />
        </div>

        <div className="rs-foot">
          <ol data-labels className="rs-labels" aria-label="Pasos">
            {reservas.pasos.map((p, i) => (
              <li key={p} data-label className="rs-label">
                <span className="rs-label-n">{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
          <p data-bajada className="rs-bajada t-lead text-ink-2">
            {reservas.bajada}
          </p>
        </div>

        {/* Elementos que viajan entre pantallas */}
        <div data-flyer1 className="rs-flyer overflow-hidden" aria-hidden="true">
          <img src="/media/places/r-fogon.webp" alt="" className="h-full w-full object-cover" />
        </div>
        <div data-flyer2 className="rs-flyer rs-flyer2 grid place-items-center text-white" aria-hidden="true">
          <span data-f2-text className="absolute text-[15px] font-bold">
            Reservar
          </span>
          <svg viewBox="0 0 24 24" className="h-[46%] w-[46%]" aria-hidden="true">
            <path data-f2-check d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" strokeDashoffset="24" />
          </svg>
          {PARTICULAS.map((p, i) => (
            <span key={i} data-particle className="absolute left-1/2 top-1/2 rounded-full" style={{ width: p.s, height: p.s, marginLeft: -p.s / 2, marginTop: -p.s / 2, background: p.c }} />
          ))}
        </div>

        {/* Notificación */}
        <div data-toast className="rs-toast" role="status">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#16a34a] text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="flex items-center justify-between gap-3 text-[14px] font-extrabold text-ink">
              {reservas.toast.titulo}
              <span className="text-[11px] font-semibold text-ink-2">ahora</span>
            </span>
            <span className="block text-[13px] font-semibold leading-snug text-ink-2">{reservas.toast.detalle}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
