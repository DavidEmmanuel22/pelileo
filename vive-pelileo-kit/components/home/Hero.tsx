"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import { GaiaMark, Lockup } from "@/components/brand/Brand";
import { bootDelay } from "@/components/shell/Boot";
import { AutoVideo } from "./AutoVideo";

export const HERO_PROMPT = "Quiero un plan para divertirme este fin de semana";
export const HERO_CHIPS = [
  { label: "Fin de semana en familia", prompt: "Vamos en familia, 2 adultos y 2 niños. Queremos 2 días en Pelileo con $250." },
  { label: "Aventura en pareja", prompt: "Somos una pareja, nos gusta la aventura y la naturaleza. Tenemos un día en Pelileo y $120." },
  { label: "Jean y artesanías", prompt: "Voy solo, quiero comprar jean y artesanías. Tengo medio día y unos $80." },
];

const EASE = [0.22, 1, 0.36, 1] as const;
/** Misma caja para el campo y su espejo animado: 2 líneas en mobile, 1 en escritorio. */
const FIELD = "h-[78px] px-3 py-3 text-[16.5px] font-medium leading-[1.6] sm:h-14 sm:py-[14px] sm:text-[17px] sm:leading-[1.6] sm:whitespace-nowrap";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Hero({
  image,
  video,
  videoMobile,
  onAsk,
}: {
  image: string;
  video: string | null;
  videoMobile: string | null;
  onAsk: (prompt: string) => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "28%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);
  const fgY = useTransform(scrollYProgress, [0, 0.6], [0, reduce ? 0 : -80]);
  const fgOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-night text-on-photo" aria-label="Portada">
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY, scale: bgScale }}>
        <div className="kenburns absolute inset-0">
          <Image src={image} alt="El volcán Tungurahua visto desde el valle de Pelileo" fill priority sizes="100vw" className="object-cover" />
          {video && <AutoVideo src={videoMobile ?? video} poster={image} className="hidden max-md:block" />}
          {video && <AutoVideo src={video} poster={image} className="max-md:hidden" />}
        </div>
      </motion.div>
      {/* Velos para que el texto se lea sobre cualquier foto */}
      <div className="hero-veil pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Marca (mobile; en escritorio está en la barra superior) */}
      <div className="absolute left-5 top-[calc(18px+env(safe-area-inset-top))] z-10 lg:hidden">
        <Lockup size="sm" inverted />
      </div>

      <motion.div
        className="relative z-10 mx-auto flex h-full max-w-[1240px] flex-col justify-end px-5 pb-[calc(var(--tabbar-h)+44px)] pt-28 sm:px-8 lg:justify-center lg:pb-16 lg:pt-[calc(var(--topbar-h)+40px)]"
        style={{ y: fgY, opacity: fgOpacity }}
      >
        <motion.p
          className="smallcaps text-[13px] font-semibold text-on-photo/85"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        >
          Tungurahua · Ecuador
        </motion.p>
        <h1 className="mt-2 font-display font-medium leading-[0.92] tracking-[-0.03em]">
          <motion.span
            className="block text-[clamp(30px,5vw,56px)] italic font-normal text-on-photo/90"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
          >
            Vive
          </motion.span>
          <motion.span
            className="block text-[clamp(68px,13vw,176px)]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.35 }}
          >
            Pelileo
          </motion.span>
        </h1>
        <motion.p
          className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-on-photo/90 sm:text-[18px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
        >
          Jean, telares, vuelos sobre el valle y sabores de leña, al pie del volcán. Cuéntale a Gaia qué quieres vivir y te arma
          el plan en segundos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
          className="mt-7 w-full max-w-[680px]"
        >
          <GaiaBox onAsk={onAsk} />
          <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
            {HERO_CHIPS.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => onAsk(c.prompt)}
                className="h-10 shrink-0 rounded-full border border-on-photo/35 bg-night/25 px-4 text-[13.5px] font-medium text-on-photo backdrop-blur-md transition-colors hover:border-on-photo/70 hover:bg-night/40"
              >
                {c.label}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.a
        href="#descubre"
        className="absolute bottom-[calc(var(--tabbar-h)+12px)] left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[12px] font-medium text-on-photo/80 sm:flex lg:bottom-6"
        style={{ opacity: fgOpacity }}
      >
        Desliza para descubrir
        <span className="scroll-cue grid h-9 w-9 place-items-center rounded-full border border-on-photo/40">
          <ArrowDown size={15} aria-hidden="true" />
        </span>
      </motion.a>
    </section>
  );
}

/** Caja de Gaia: se escribe sola con un pedido de ejemplo; el visitante puede tocar el botón o escribir el suyo. */
export function GaiaBox({ onAsk, tone = "light", autoType = true }: { onAsk: (prompt: string) => void; tone?: "light" | "dark"; autoType?: boolean }) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(autoType ? "" : HERO_PROMPT);
  const [typing, setTyping] = useState(autoType);
  const touched = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoType) return;
    let alive = true;
    (async () => {
      await wait(bootDelay() + (reduce ? 0 : 1300));
      for (let i = 1; i <= HERO_PROMPT.length; i++) {
        if (!alive || touched.current) return;
        setText(HERO_PROMPT.slice(0, i));
        await wait(reduce ? 0 : 42 + Math.random() * 40);
      }
      if (alive) setTyping(false);
    })();
    return () => {
      alive = false;
    };
  }, [autoType, reduce]);

  const ready = text.trim().length > 0 && !typing;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim() || HERO_PROMPT;
    onAsk(t);
  };

  return (
    <form
      onSubmit={submit}
      className={`rounded-[26px] p-2 shadow-[var(--shadow-float)] ${tone === "light" ? "bg-surface text-ink" : "bg-night-2 text-on-photo ring-1 ring-on-photo/15"}`}
    >
      <div className="flex items-center gap-2 px-3 pb-1 pt-2">
        <GaiaMark size={26} />
        <span className="text-[13px] font-semibold">Gaia</span>
        <span className={`text-[12.5px] ${tone === "light" ? "text-ink-2" : "text-on-photo/70"}`}>· tu guía de viaje con IA</span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Cuéntale a Gaia qué quieres hacer</span>
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => {
              touched.current = true;
              setTyping(false);
              setText(e.target.value);
            }}
            onFocus={() => {
              if (typing) {
                touched.current = true;
                setTyping(false);
                setText(HERO_PROMPT);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            enterKeyHint="send"
            placeholder="Ej.: un día de aventura con $100"
            className={`${FIELD} block w-full min-w-0 resize-none bg-transparent focus:outline-none focus-visible:outline-none ${
              tone === "light" ? "placeholder:text-ink-3" : "placeholder:text-on-photo/50"
            } ${typing ? "text-transparent placeholder:text-transparent" : ""}`}
          />
          {typing && (
            // Espejo del texto con cursor parpadeante mientras Gaia "escribe" el ejemplo.
            <span aria-hidden="true" className={`${FIELD} pointer-events-none absolute inset-0 overflow-hidden`}>
              {text}
              <span className="caret ml-[2px] inline-block h-[1.15em] w-[2px] translate-y-[3px] bg-clapzy" />
            </span>
          )}
        </label>
        <button
          type="submit"
          className={`relative inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-[18px] bg-clapzy px-6 text-[15.5px] font-semibold text-surface transition-transform active:scale-[0.97] ${
            ready ? "cta-glow" : ""
          }`}
        >
          <Sparkles size={17} aria-hidden="true" />
          Armar mi plan
          <ArrowUp size={16} className="rotate-45" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
