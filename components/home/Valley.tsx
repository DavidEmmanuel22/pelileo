"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

/* ── Geometría determinista (sin Math.random: mismo SVG en servidor y cliente) ── */
const W = 1600;

function ridgeY(x: number, base: number, amp: number, seed: number) {
  return (
    base -
    amp *
      (0.55 * Math.sin(x / 210 + seed) +
        0.3 * Math.sin(x / 97 + seed * 2.3) +
        0.15 * Math.sin(x / 41 + seed * 4.1))
  );
}
function ridge(base: number, amp: number, seed: number, bottom = 1700) {
  let d = `M -300 ${bottom} L -300 ${ridgeY(-300, base, amp, seed).toFixed(1)}`;
  for (let x = -260; x <= W + 300; x += 40) d += ` L ${x} ${ridgeY(x, base, amp, seed).toFixed(1)}`;
  return `${d} L ${W + 300} ${bottom} Z`;
}
const r1 = (n: number) => Math.round(n * 10) / 10;

const RIDGE_FAR = ridge(640, 34, 1.2);
const RIDGE_MID = ridge(700, 42, 3.4);
const RIDGE_NEAR = ridge(772, 30, 5.1, 2400);
const FRONT = ridge(850, 22, 7.7, 3200);

const TREES = Array.from({ length: 46 }, (_, i) => {
  const x = -200 + i * 43 + ((i * 37) % 23);
  if (x > 980 && x < 1260) return null; // claro para el pueblo
  const y = ridgeY(x, 772, 30, 5.1);
  const h = 26 + ((i * 53) % 22);
  return `M ${r1(x - h * 0.28)} ${r1(y + 4)} L ${r1(x)} ${r1(y - h)} L ${r1(x + h * 0.28)} ${r1(y + 4)} Z`;
}).filter(Boolean) as string[];

const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: r1((i * 233.7) % W),
  y: r1(30 + ((i * 97.3) % 380)),
  r: 0.8 + ((i * 7) % 3) * 0.55,
}));

/* El Tungurahua: cono simétrico con cráter plano y nieve en la cumbre */
const CONE = "M 230 800 C 470 600 690 330 768 262 L 832 262 C 910 330 1130 600 1370 800 Z";
const SNOW =
  "M 700 200 L 900 200 L 900 352 L 880 340 L 862 368 L 846 342 L 826 382 L 806 346 L 786 376 L 768 344 L 748 364 L 730 338 L 712 352 L 700 340 Z";
const SHADE = "M 800 262 L 832 262 C 910 330 1130 600 1370 800 L 860 800 C 850 600 820 380 800 262 Z";

/* Pelileo: casas y la iglesia matriz sobre la ladera */
function Town() {
  const houses = [
    [1000, 30, 22],
    [1034, 24, 18],
    [1062, 34, 26],
    [1170, 30, 20],
    [1206, 26, 24],
    [1238, 32, 18],
  ];
  return (
    <g fill="var(--ridge-front)">
      {houses.map(([x, w, h], i) => {
        const base = ridgeY(x + w / 2, 772, 30, 5.1) + 10;
        return (
          <g key={i}>
            <rect x={x} y={r1(base - h)} width={w} height={h + 20} />
            <path d={`M ${x - 3} ${r1(base - h)} L ${x + w / 2} ${r1(base - h - 12)} L ${x + w + 3} ${r1(base - h)} Z`} />
          </g>
        );
      })}
      {/* iglesia */}
      {(() => {
        const x = 1100;
        const base = ridgeY(x + 30, 772, 30, 5.1) + 12;
        return (
          <g>
            <rect x={x} y={r1(base - 46)} width={60} height={66} />
            <path d={`M ${x - 4} ${r1(base - 46)} L ${x + 30} ${r1(base - 66)} L ${x + 64} ${r1(base - 46)} Z`} />
            <rect x={x - 8} y={r1(base - 92)} width={18} height={112} />
            <rect x={x + 50} y={r1(base - 92)} width={18} height={112} />
            <path d={`M ${x - 10} ${r1(base - 92)} L ${x + 1} ${r1(base - 110)} L ${x + 12} ${r1(base - 92)} Z`} />
            <path d={`M ${x + 48} ${r1(base - 92)} L ${x + 59} ${r1(base - 110)} L ${x + 70} ${r1(base - 92)} Z`} />
            <rect x={x - 0.5} y={r1(base - 120)} width={1.5} height={12} />
            <rect x={x + 58.5} y={r1(base - 120)} width={1.5} height={12} />
          </g>
        );
      })()}
    </g>
  );
}

function Paraglider() {
  return (
    <g>
      <path d="M -34 0 Q 0 -22 34 0 Q 0 -12 -34 0 Z" fill="var(--clapzy)" />
      <path d="M -30 -1 L -2 34 M 30 -1 L 2 34 M -12 -9 L -1 34 M 12 -9 L 1 34" stroke="var(--night)" strokeWidth="0.8" opacity="0.55" />
      <circle cx="0" cy="38" r="4" fill="var(--night)" />
    </g>
  );
}

function useLayer(p: MotionValue<number>, to: number, reduce: boolean | null) {
  return useTransform(p, [0, 1], [0, reduce ? 0 : to]);
}

export function Valley() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const night = useTransform(p, [0, 0.55], [0.92, 0]);
  const stars = useTransform(p, [0, 0.35], [1, 0]);
  const sunY = useLayer(p, -330, reduce);
  const volcanoY = useLayer(p, -30, reduce);
  const volcanoS = useTransform(p, [0, 1], [1, reduce ? 1 : 1.07]);
  const farY = useLayer(p, -50, reduce);
  const midY = useLayer(p, -100, reduce);
  const nearY = useTransform(p, [0, 0.62, 1], reduce ? [0, 0, 0] : [0, -80, -260]);
  // El primer plano (color papel) sube al final y funde el paisaje con la sección siguiente.
  const frontY = useTransform(p, [0, 0.66, 1], reduce ? [0, 0, 0] : [0, -30, -470]);
  const cloudA = useLayer(p, -260, reduce);
  const cloudB = useLayer(p, 200, reduce);
  const gliderX = useTransform(p, [0.05, 0.95], [reduce ? 1180 : -120, reduce ? 1180 : 1760]);
  const gliderY = useTransform(p, [0.05, 0.5, 0.95], [reduce ? 300 : 360, 230, reduce ? 300 : 290]);
  const glider = useTransform([gliderX, gliderY], ([x, y]) => `translate(${x}px, ${y}px) rotate(-6deg)`);

  const c1 = useTransform(p, [0.02, 0.1, 0.32, 0.42], [0, 1, 1, 0]);
  const c1y = useTransform(p, [0.02, 0.42], [30, -30]);
  const c2 = useTransform(p, [0.44, 0.52, 0.68, 0.76], [0, 1, 1, 0]);
  const c2y = useTransform(p, [0.44, 0.76], [30, -30]);

  return (
    <section ref={ref} id="descubre" className="relative h-[260vh] bg-bg" aria-label="El valle al pie del Tungurahua">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* cielo */}
        <div className="valley-sky absolute inset-0" />
        <motion.div className="absolute inset-0 bg-night" style={{ opacity: night }} />

        <svg
          viewBox={`0 0 ${W} 900`}
          className="absolute bottom-0 left-1/2 h-auto w-[max(100%,980px)] -translate-x-1/2 overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="v-sun" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="var(--sun)" stopOpacity="1" />
              <stop offset="0.35" stopColor="var(--sun)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--dawn)" stopOpacity="0" />
            </radialGradient>
            <clipPath id="v-cone">
              <path d={CONE} />
            </clipPath>
          </defs>

          <motion.g style={{ opacity: stars }} fill="var(--snow)">
            {STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y - 300} r={s.r} />
            ))}
          </motion.g>

          <motion.g style={{ y: sunY }}>
            <circle cx="1130" cy="760" r="260" fill="url(#v-sun)" />
            <circle cx="1130" cy="760" r="54" fill="var(--sun)" />
          </motion.g>

          <motion.g style={{ x: cloudA }} fill="var(--snow)" opacity="0.5">
            <ellipse cx="420" cy="330" rx="190" ry="16" />
            <ellipse cx="520" cy="314" rx="110" ry="12" />
            <ellipse cx="1400" cy="250" rx="150" ry="12" />
          </motion.g>

          <motion.g style={{ y: volcanoY, scale: volcanoS, transformOrigin: "800px 800px" }}>
            <path d={CONE} fill="var(--ridge-far)" />
            <g clipPath="url(#v-cone)">
              <path d={SHADE} fill="var(--night)" opacity="0.22" />
              <path d={SNOW} fill="var(--snow)" />
              <path d="M 800 262 L 832 262 C 860 290 880 312 900 340 L 880 340 L 862 368 L 846 342 L 826 382 L 806 346 C 806 320 804 290 800 262 Z" fill="var(--night)" opacity="0.12" />
            </g>
            {/* fumarola */}
            <path d="M 800 258 C 786 236 822 220 812 196 C 804 176 830 160 824 140" fill="none" stroke="var(--snow)" strokeOpacity="0.3" strokeWidth="12" strokeLinecap="round" />
          </motion.g>

          <motion.g style={{ x: cloudB }} fill="var(--snow)" opacity="0.6">
            <ellipse cx="760" cy="560" rx="260" ry="18" />
            <ellipse cx="300" cy="600" rx="200" ry="14" />
          </motion.g>

          <motion.path d={RIDGE_FAR} fill="var(--ridge-far)" style={{ y: farY }} opacity="0.85" />
          <motion.path d={RIDGE_MID} fill="var(--ridge-mid)" style={{ y: midY }} />
          <motion.g style={{ y: nearY }}>
            <path d={RIDGE_NEAR} fill="var(--ridge-near)" />
            <g fill="var(--ridge-front)">
              {TREES.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            <Town />
          </motion.g>

          <motion.g style={{ transform: glider }}>
            <Paraglider />
          </motion.g>

          <motion.path d={FRONT} fill="var(--bg)" style={{ y: frontY }} />
        </svg>

        {/* Textos que aparecen al bajar */}
        <div className="pointer-events-none absolute inset-x-0 top-[11vh] px-6 text-center text-on-photo">
          <motion.div style={{ opacity: c1, y: c1y }}>
            <p className="smallcaps text-[13px] font-semibold text-on-photo/80">5.023 metros de volcán</p>
            <h2 className="mx-auto mt-3 max-w-[900px] font-display text-[clamp(40px,7vw,96px)] font-medium leading-[0.95] tracking-[-0.03em]">
              Al pie del <em className="font-normal">Tungurahua</em>
            </h2>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-[9vh] px-6 text-center text-on-photo">
          <motion.div style={{ opacity: c2, y: c2y }}>
            <h2 className="mx-auto max-w-[860px] font-display text-[clamp(30px,4.4vw,60px)] font-medium leading-[1.02] tracking-[-0.02em] [text-shadow:0_2px_30px_color-mix(in_srgb,var(--night)_35%,transparent)]">
              Un valle que madruga: ferias, telares y <em className="font-normal">vuelos sobre las nubes</em>.
            </h2>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
