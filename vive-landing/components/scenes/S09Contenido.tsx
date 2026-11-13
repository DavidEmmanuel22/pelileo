"use client";
 
import { useEffect, useRef } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { miles } from "@/lib/format";
import { contenido } from "@/content/site";
import { Photo } from "@/components/ui/Photo";
import { MaskLines } from "@/components/ui/MaskLines";

type Tile = { video?: string; foto?: string; tag?: string };

const COLS: Tile[][] = [
  [{ foto: "plato-tipico" }, { video: "crestas", tag: "Reel" }, { foto: "telar" }, { foto: "laguna-valle" }, { foto: "concierto" }, { foto: "bici" }],
  [{ foto: "feria-noche" }, { foto: "llama" }, { video: "volcan", tag: "Reel" }, { foto: "mercado" }, { foto: "choclo-queso" }, { foto: "sastre" }],
  [{ video: "hojas", tag: "Reel" }, { foto: "caminantes" }, { foto: "cumbre-noche" }, { foto: "naranjillas" }, { foto: "parapente" }, { foto: "hosteria" }],
  [{ foto: "plaza-arte" }, { video: "cascada", tag: "Reel" }, { foto: "fritada" }, { foto: "jean" }, { foto: "trail" }, { foto: "cafe" }],
  [{ foto: "mirador" }, { foto: "feria-artesanal" }, { foto: "trucha" }, { video: "crestas", tag: "Reel" }, { foto: "pase-nino" }, { foto: "laguna-refugio" }],
  [{ foto: "suite" }, { foto: "volcan-nevado" }, { video: "hojas", tag: "Reel" }, { foto: "bar" }, { foto: "cerro-verde" }, { foto: "telar" }],
  [{ video: "volcan", tag: "Reel" }, { foto: "hosteria-patio" }, { foto: "lago-montana" }, { foto: "comedor" }, { foto: "concierto" }, { foto: "llama" }],
];

function TileView({ t }: { t: Tile }) {
  if (t.video)
    return (
      <div className="ct-tile group" data-video-tile>
        <video muted loop playsInline preload="none" poster={`/media/video/${t.video}-v-poster.jpg`} data-src={`/media/video/${t.video}-v.mp4`} className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
          <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden="true">
            <path d="M0 0 9 5 0 10Z" fill="currentColor" />
          </svg>
          {t.tag}
        </span>
      </div>
    );
  return (
    <div className="ct-tile">
      <Photo name={t.foto!} alt="" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
    </div>
  );
}

function Heart({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z"
        fill={filled ? "#f45c55" : "none"}
        stroke={filled ? "#f45c55" : "currentColor"}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Contenido() {
  const root = useRef<HTMLElement>(null);

  // Videos: con mouse se reproducen al pasar; en táctil, mientras están en pantalla
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia(MQ.reduce).matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const tiles = [...el.querySelectorAll<HTMLElement>("[data-video-tile]")];
    const load = (v: HTMLVideoElement) => {
      if (!v.src) v.src = v.dataset.src!;
    };
    const offs: (() => void)[] = [];
    if (fine) {
      tiles.forEach((t) => {
        const v = t.querySelector("video")!;
        const on = () => {
          load(v);
          v.play().catch(() => {});
        };
        const off = () => v.pause();
        t.addEventListener("pointerenter", on);
        t.addEventListener("pointerleave", off);
        offs.push(() => {
          t.removeEventListener("pointerenter", on);
          t.removeEventListener("pointerleave", off);
        });
      });
    } else if (!reduce) {
      const io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            const v = e.target.querySelector("video")!;
            if (e.isIntersecting) {
              load(v);
              v.play().catch(() => {});
            } else v.pause();
          }),
        { threshold: 0.6 },
      );
      tiles.forEach((t) => io.observe(t));
      offs.push(() => io.disconnect());
    }
    return () => offs.forEach((f) => f());
  }, []);

  useGsap(root, () => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    const likes = q("[data-likes]")[0] as HTMLElement;
    const to = contenido.post.likes;

    mm.add(MQ.motion, () => {
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.5 };
      q("[data-col]").forEach((c, i) => {
        const up = i % 2 === 0;
        gsap.fromTo(c, { yPercent: up ? 4 : -30 }, { yPercent: up ? -30 : 4, ease: "none", scrollTrigger: st });
      });
      gsap.fromTo(q("[data-wall]"), { scale: 1.18 }, { scale: 1.02, ease: "none", scrollTrigger: st });
      gsap.fromTo(q("[data-line]"), { yPercent: 115 }, { yPercent: 0, stagger: 0.12, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: q("[data-head]")[0], start: "top 80%" } });
      gsap.fromTo(q("[data-sub]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, delay: 0.25, ease: "power3.out", scrollTrigger: { trigger: q("[data-head]")[0], start: "top 80%" } });

      // La publicación sube, se endereza y los "me gusta" cuentan con el scroll
      const post = q("[data-post]")[0];
      gsap.fromTo(post, { y: 160, rotate: 6, scale: 0.9 }, { y: 0, rotate: -2, scale: 1, ease: "power2.out", scrollTrigger: { trigger: post, start: "top bottom", end: "center 55%", scrub: 0.6 } });
      const o = { v: 0 };
      gsap.to(o, {
        v: to,
        ease: "power1.out",
        onUpdate: () => {
          likes.textContent = miles(o.v);
          root.current?.querySelector("[data-heart]")?.classList.toggle("is-on", o.v > to * 0.05);
        },
        scrollTrigger: { trigger: post, start: "top 75%", end: "bottom 45%", scrub: 0.6 },
      });
    });

    mm.add(MQ.reduce, () => {
      likes.textContent = miles(to);
      root.current?.querySelector("[data-heart]")?.classList.add("is-on");
    });
  });

  const p = contenido.post;
  return (
    <section ref={root} id="contenido" data-scene="9" className="ct-section relative overflow-hidden bg-night-2" aria-labelledby="contenido-title">
      {/* Muro */}
      <div className="ct-wall-wrap" aria-hidden="true">
        <div data-wall className="ct-wall">
          {COLS.map((col, i) => (
            <div key={i} data-col className="ct-col">
              {col.map((t, k) => (
                <TileView key={k} t={t} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 ct-shade" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-night-2 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-night to-transparent" aria-hidden="true" />

      <div className="ct-grid pointer-events-none relative z-10">
        <div data-head className="ct-head">
          <p className="t-eyebrow text-coral-2">Contenido</p>
          <MaskLines as="h2" id="contenido-title" lines={["Tu ciudad,", "contada como", "se merece."]} className="ct-title t-h2 mt-5 text-fg" lineClassName={(i) => (i === 2 ? "grad-text" : "")} />
          <p data-sub className="t-lead mt-6 max-w-[34ch] text-fg-2">
            {contenido.bajada}
          </p>
        </div>

        {/* Publicación */}
        <article data-post className="ct-post pointer-events-auto" aria-label={`Publicación de ${p.cuenta}`}>
          <header className="flex items-center gap-2.5 px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--grad-coral)] p-[2px]">
              <span className="grid h-full w-full place-items-center rounded-full bg-white text-[11px] font-extrabold text-ink">TM</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-extrabold leading-tight text-ink">{p.cuenta}</span>
              <span className="block text-[12px] font-semibold text-ink-2">hace 2 h</span>
            </span>
            <span className="text-[18px] font-extrabold leading-none text-ink-2">···</span>
          </header>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Photo name="feria-noche" alt="Feria nocturna con luces en la plaza" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
            <span className="ct-float" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} style={{ left: `${12 + i * 14}%`, animationDelay: `${i * 0.7}s` }}>
                  <Heart filled />
                </span>
              ))}
            </span>
          </div>
          <div className="px-4 pb-4 pt-3 text-ink">
            <div className="flex items-center gap-4">
              <span data-heart className="ct-heart">
                <Heart />
              </span>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20l1.2-4.2A8.5 8.5 0 1 1 20.5 11.5Z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
              </svg>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-2.5 text-[14px] font-extrabold">
              <span data-likes className="tabular">
                {miles(p.likes)}
              </span>{" "}
              me gusta
            </p>
            <p className="mt-1 text-[14px] leading-snug">
              <b className="font-extrabold">{p.cuenta}</b> {p.texto} <span className="font-semibold text-[#2563eb]">#ViveTuCiudad</span>
            </p>
            <p className="mt-1 text-[13px] font-semibold text-ink-2">Ver los {p.comentarios} comentarios</p>
          </div>
        </article>
      </div>
    </section>
  );
}
