/**
 * Ecuador de noche: avenida de volcanes en capas, niebla, cóndor y pueblos con luces.
 * Inspirado en la escena del valle de la demo (capas fijadas con parallax), pero con dibujo,
 * paleta y sentido propios: aquí es el país entero y sus valles encendiéndose.
 *
 * Cada capa es un <svg> independiente con el mismo viewBox (1600×1000, xMidYMax slice) para que
 * el parallax se anime con transform en GPU.
 */
import { useId } from "react";

const VB = "0 0 1600 1000";
const r1 = (n: number) => Math.round(n * 10) / 10;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ── Geometría ─────────────────────────────────────────────────── */

/** Cono volcánico con laderas cóncavas y cráter plano. */
function cone(cx: number, py: number, by: number, hw: number, crater: number, seed: number, rough = 6) {
  const r = rng(seed);
  const n = 28;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n; // 0 base → 1 cumbre
    const y = by - (by - py) * t;
    const spread = crater / 2 + (hw - crater / 2) * Math.pow(1 - t, 1.55);
    const nl = (r() - 0.5) * rough * (1 - t * 0.6);
    const nr = (r() - 0.5) * rough * (1 - t * 0.6);
    left.push(`${r1(cx - spread + nl)} ${r1(y)}`);
    right.unshift(`${r1(cx + spread + nr)} ${r1(y)}`);
  }
  return `M ${r1(cx - hw - 60)} ${by + 400} L ${left.join(" L ")} L ${right.join(" L ")} L ${r1(cx + hw + 60)} ${by + 400} Z`;
}

/** Macizo con varias cumbres (tipo domo nevado). */
function massif(x0: number, x1: number, base: number, peaks: [number, number, number][]) {
  let d = `M ${x0} ${base + 400} L ${x0} ${base}`;
  for (let x = x0; x <= x1; x += 8) {
    let y = base;
    for (const [px, py, w] of peaks) {
      const g = Math.exp(-Math.pow((x - px) / w, 2));
      y = Math.min(y, base - (base - py) * g);
    }
    y += Math.sin(x / 13) * 2.2 + Math.sin(x / 5.3) * 1.1;
    d += ` L ${x} ${r1(y)}`;
  }
  return `${d} L ${x1} ${base + 400} Z`;
}

/** Cumbre dentada (tipo caldera abierta). */
function jagged(cx: number, base: number, top: number, hw: number, seed: number) {
  const r = rng(seed);
  let d = `M ${cx - hw - 80} ${base + 400} L ${cx - hw - 80} ${base}`;
  for (let x = cx - hw - 80; x <= cx + hw + 80; x += 14) {
    const t = 1 - Math.min(1, Math.abs(x - cx) / hw);
    const y = base - (base - top) * Math.pow(t, 0.7) + (t > 0.35 ? (r() - 0.3) * 46 * t : 0);
    d += ` L ${x} ${r1(y)}`;
  }
  return `${d} L ${cx + hw + 80} ${base + 400} Z`;
}

function ridgeY(x: number, base: number, amp: number, seed: number) {
  return base - amp * (0.55 * Math.sin(x / 230 + seed) + 0.3 * Math.sin(x / 101 + seed * 2.3) + 0.15 * Math.sin(x / 43 + seed * 4.1));
}
function ridge(base: number, amp: number, seed: number) {
  let d = `M -200 1400 L -200 ${r1(ridgeY(-200, base, amp, seed))}`;
  for (let x = -160; x <= 1800; x += 32) d += ` L ${x} ${r1(ridgeY(x, base, amp, seed))}`;
  return `${d} L 1800 1400 Z`;
}

/** Banda de nieve (para recortar con el volcán): todo lo que está sobre `line`, con borde irregular. */
function snowBand(x0: number, x1: number, line: number, seed: number) {
  const r = rng(seed);
  let d = `M ${x0} -100 L ${x0} ${line}`;
  for (let x = x0; x <= x1; x += 10) d += ` L ${x} ${r1(line + (r() - 0.35) * 34 + Math.sin(x / 17) * 8)}`;
  return `${d} L ${x1} -100 Z`;
}

/* ── Luces de pueblos ──────────────────────────────────────────── */
type Light = { x: number; y: number; r: number };

function town(cx: number, spread: number, n: number, ridgeFn: (x: number) => number, depth: number, seed: number): Light[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const x = cx + (r() + r() + r() - 1.5) * spread;
    const y0 = ridgeFn(x);
    const l = { x: r1(x), y: r1(y0 + 6 + r() * depth), r: r1(2.2 + r() * 2.6) };
    r(); // conserva la secuencia del generador (misma disposición de luces)
    return l;
  });
}

function road(points: [number, number][], n: number, seed: number): Light[] {
  const r = rng(seed);
  const out: Light[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const seg = Math.min(points.length - 2, Math.floor(t * (points.length - 1)));
    const lt = t * (points.length - 1) - seg;
    const [x1, y1] = points[seg];
    const [x2, y2] = points[seg + 1];
    out.push({ x: r1(x1 + (x2 - x1) * lt + (r() - 0.5) * 4), y: r1(y1 + (y2 - y1) * lt), r: r1(1.8 + r() * 1.2) });
  }
  return out;
}

const NEAR = { base: 712, amp: 44, seed: 2.2 };
const VALLEY = { base: 832, amp: 22, seed: 6.4 };
const nearY = (x: number) => ridgeY(x, NEAR.base, NEAR.amp, NEAR.seed);
const valleyY = (x: number) => ridgeY(x, VALLEY.base, VALLEY.amp, VALLEY.seed);
const MID_BASE = 600;

export const TOWNS = {
  mid: [town(540, 30, 7, () => 690, 30, 3), town(1240, 40, 8, () => 700, 30, 4)],
  near: [town(250, 60, 16, nearY, 70, 11), town(560, 50, 13, nearY, 60, 12), town(1080, 70, 18, nearY, 70, 13), town(1390, 55, 14, nearY, 60, 14)],
  valley: [town(800, 120, 64, valleyY, 90, 21), road([[800, 860], [900, 800], [1000, 770], [1120, 742], [1240, 720]], 16, 22), road([[790, 870], [640, 820], [520, 790], [380, 760]], 14, 23)],
};

/** Luces fijas (sin animación propia): el SVG se pinta una vez y luego solo se compone. */
function Lights({ list, id }: { list: Light[]; id: string }) {
  return (
    <g>
      {list.map((l, i) => (
        <circle key={i} cx={l.x} cy={l.y} r={l.r * 2.4} fill={`url(#${id})`} />
      ))}
    </g>
  );
}

/**
 * Capa de pueblos encendidos. Va en su propio <svg> para que la opacidad (que anima el scroll)
 * se aplique al elemento entero y la resuelva la GPU, sin volver a pintar el paisaje.
 */
function TownLayer({ towns, id }: { towns: Light[][]; id: string }) {
  return (
    <svg data-town viewBox={VB} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full [will-change:opacity]">
      <defs>
        <LightGrad id={id} />
      </defs>
      {towns.map((t, i) => (
        <Lights key={i} list={t} id={id} />
      ))}
    </svg>
  );
}

const STARS = (() => {
  const r = rng(77);
  return Array.from({ length: 140 }, () => ({ x: r1(r() * 1600), y: r1(r() * 560), r: r1(0.6 + r() * r() * 2.2), tw: r() < 0.3, d: r1(r() * 4) }));
})();
/* Las estrellas que titilan van en tres grupos desfasados; cada grupo anima su opacidad
   como elemento completo (compositor), no estrella por estrella. */
const STARS_FIXED = STARS.filter((s) => !s.tw);
const STARS_TW = [0, 1, 2].map((k) => STARS.filter((s, i) => s.tw && i % 3 === k));

/* ── Degradados ────────────────────────────────────────────────────
   Cada <svg> declara sus propios degradados y recortes: nada se referencia entre SVG distintos,
   así Chrome no pierde la referencia (y no parpadea) cuando vuelve a pintar una capa escalada. */
function LightGrad({ id }: { id: string }) {
  return (
    <radialGradient id={id}>
      <stop offset="0" stopColor="#fff3dc" />
      <stop offset="0.22" stopColor="#ffc871" stopOpacity="0.95" />
      <stop offset="0.5" stopColor="#ffb547" stopOpacity="0.35" />
      <stop offset="1" stopColor="#ffb547" stopOpacity="0" />
    </radialGradient>
  );
}
function SnowGrad({ id }: { id: string }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="350" x2="0" y2="640">
      <stop offset="0" stopColor="#f2e6d6" stopOpacity="0.95" />
      <stop offset="0.45" stopColor="#d9c5b3" stopOpacity="0.78" />
      <stop offset="0.8" stopColor="#b9a291" stopOpacity="0.25" />
      <stop offset="1" stopColor="#b9a291" stopOpacity="0" />
    </linearGradient>
  );
}

/* ── Condor ────────────────────────────────────────────────────── */
export function Condor({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-70 -22 140 40" className={className} aria-hidden="true">
      <path
        d="M 0 0 C -10 -3 -22 -6 -34 -6 L -46 -3 L -56 -6 L -52 -2 L -62 -3 L -55 1 L -66 1 L -50 4 C -38 4 -20 4 -6 5 L -3 9 L 0 6 L 3 9 L 6 5 C 20 4 38 4 50 4 L 66 1 L 55 1 L 62 -3 L 52 -2 L 56 -6 L 46 -3 L 34 -6 C 22 -6 10 -3 0 0 Z M -2 -1 C -1 -5 2 -5 3 -2 Z"
        fill="#140d10"
        stroke="#f3dcc4"
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />
      <path d="M -6 2 C -2 0.5 2 0.5 6 2" stroke="#f4e8da" strokeOpacity=".8" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

/* ── Escena ────────────────────────────────────────────────────── */
export function Andes({ full = false }: { full?: boolean }) {
  const u = useId().replace(/[:«»]/g, "");
  const g = (s: string) => `${u}-${s}`;
  const layer = "absolute inset-0 h-full w-full will-change-transform";

  const V1 = cone(170, 540, 790, 330, 40, 1, 7);
  const V2 = cone(630, 390, 790, 380, 34, 2, 4); // cono perfecto
  const V3 = massif(860, 1360, 760, [
    [1040, 380, 130],
    [1150, 362, 95],
    [1255, 405, 85],
  ]); // domo nevado de varias cumbres
  const V4 = cone(1490, 470, 790, 300, 60, 5, 9);
  const V5 = cone(860, 520, 840, 300, 26, 6, 6); // el que humea
  const V6 = jagged(320, 690, 560, 190, 9);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Cielo */}
      <div data-layer="sky" className={`${layer} bg-[linear-gradient(180deg,#07050a_0%,#120b12_38%,#2a1618_66%,#4a2420_82%,#1a0f0e_100%)]`}>
        <svg viewBox={VB} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id={g("moon")}>
              <stop offset="0" stopColor="#fff4e2" stopOpacity="0.55" />
              <stop offset="0.35" stopColor="#f3c9a0" stopOpacity="0.14" />
              <stop offset="1" stopColor="#f3c9a0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g fill="#f7ecdf" opacity="0.55">
            {STARS_FIXED.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} />
            ))}
          </g>
          <circle cx="1010" cy="170" r="190" fill={`url(#${g("moon")})`} />
          <circle cx="1010" cy="170" r="30" fill="#f6e8d4" />
          <circle cx="1021" cy="163" r="27" fill="#2a1a1c" opacity="0.12" />
        </svg>
        {STARS_TW.map((list, k) => (
          <svg key={k} viewBox={VB} preserveAspectRatio="xMidYMax slice" className={`andes-stars andes-stars-${k} absolute inset-0 h-full w-full`}>
            <g fill="#f7ecdf">
              {list.map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={s.r} />
              ))}
            </g>
          </svg>
        ))}
      </div>

      {/* Volcanes lejanos, nevados */}
      <div data-layer="far" className={layer}>
      <svg viewBox={VB} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={g("far")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.25" stopColor="#35252e" />
            <stop offset="0.7" stopColor="#1f161b" />
          </linearGradient>
          <SnowGrad id={g("snow")} />
          {[V1, V2, V3, V4].map((d, i) => (
            <clipPath key={i} id={g(`c${i + 1}`)}>
              <path d={d} />
            </clipPath>
          ))}
        </defs>
        <g fill={`url(#${g("far")})`}>
          <path d={V1} />
          <path d={V2} />
          <path d={V3} />
          <path d={V4} />
        </g>
        <g fill={`url(#${g("snow")})`}>
          <path d={snowBand(-200, 600, 610, 31)} clipPath={`url(#${g("c1")})`} opacity="0.6" />
          <path d={snowBand(200, 1100, 540, 32)} clipPath={`url(#${g("c2")})`} />
          <path d={snowBand(800, 1400, 520, 33)} clipPath={`url(#${g("c3")})`} />
          <path d={snowBand(1100, 1800, 560, 34)} clipPath={`url(#${g("c4")})`} opacity="0.7" />
        </g>
        {/* lado en sombra (la luna ilumina desde la izquierda) */}
        <g fill="#0d0907" opacity="0.3">
          <path d="M 640 388 L 670 388 C 760 500 900 660 1080 800 L 690 800 Z" clipPath={`url(#${g("c2")})`} />
          <path d="M 1160 360 C 1220 470 1300 620 1400 800 L 1150 800 Z" clipPath={`url(#${g("c3")})`} />
          <path d="M 180 538 L 220 538 C 300 620 400 720 520 800 L 190 800 Z" clipPath={`url(#${g("c1")})`} />
          <path d="M 1500 468 L 1530 468 C 1600 560 1700 680 1800 800 L 1510 800 Z" clipPath={`url(#${g("c4")})`} />
        </g>
      </svg>
      </div>

      <div data-layer="mist1" className={`${layer} andes-mist andes-mist-1`} />

      {/* Volcanes medios: el que humea y la caldera dentada */}
      <div data-layer="mid" className={layer}>
      <svg viewBox={VB} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <SnowGrad id={g("snow2")} />
          <clipPath id={g("c5")}>
            <path d={V5} />
          </clipPath>
        </defs>
        <g className="andes-plume">
          <path d="M 864 518 C 846 482 892 464 878 424 C 868 394 902 372 894 334 C 888 308 920 286 916 254" fill="none" stroke="#e9d9cb" strokeOpacity="0.06" strokeWidth="40" strokeLinecap="round" />
          <path d="M 864 518 C 850 490 886 474 876 442" fill="none" stroke="#e9d9cb" strokeOpacity="0.09" strokeWidth="16" strokeLinecap="round" />
        </g>
        <path d={ridge(MID_BASE + 110, 36, 4.2)} fill="#22171c" />
        <path d={V6} fill="#22171c" />
        <path d={V5} fill="#251a1f" />
        <path d={snowBand(600, 1100, 560, 41)} fill={`url(#${g("snow2")})`} opacity="0.55" clipPath={`url(#${g("c5")})`} />
        <path d={`M 870 520 L 886 520 C 960 620 1060 740 1170 840 L 900 840 Z`} fill="#0d0907" opacity="0.32" clipPath={`url(#${g("c5")})`} />
      </svg>
      <TownLayer towns={TOWNS.mid} id={g("lm")} />
      </div>

      <div data-layer="mist2" className={`${layer} andes-mist andes-mist-2`} />

      {/* Lomas cercanas con pueblos */}
      <div data-layer="near" className={layer}>
        <svg viewBox={VB} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
          <path d={ridge(NEAR.base, NEAR.amp, NEAR.seed)} fill="#181115" />
        </svg>
        <TownLayer towns={TOWNS.near} id={g("ln")} />
      </div>

      {/* Valle con la ciudad principal */}
      <div data-layer="valley" className={layer}>
        <svg viewBox={VB} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
          <path d={ridge(VALLEY.base, VALLEY.amp, VALLEY.seed)} fill="#110c0d" />
        </svg>
        <TownLayer towns={TOWNS.valley} id={g("lv")} />
      </div>

      {/* Primer plano: laderas que enmarcan el valle */}
      <div data-layer="front" className={layer}>
      <svg viewBox={VB} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <path d="M -200 1100 L -200 760 C 0 770 200 820 380 900 C 470 940 540 980 600 1100 Z" fill="#080605" />
        <path d="M 1800 1100 L 1800 720 C 1600 740 1380 800 1220 880 C 1120 930 1060 990 1020 1100 Z" fill="#0a0706" />
        <g fill="#0a0706">
          {[40, 90, 150, 220, 1300, 1370, 1440, 1520].map((x, i) => {
            const base = x < 800 ? 770 + x * 0.25 : 740 + (1800 - x) * 0.18 - 40;
            const hgt = 60 + ((i * 37) % 40);
            return <path key={x} d={`M ${x - 14} ${base + 10} Q ${x - 18} ${base - hgt * 0.6} ${x} ${base - hgt} Q ${x + 18} ${base - hgt * 0.6} ${x + 14} ${base + 10} Z`} />;
          })}
        </g>
      </svg>
      </div>

      {full ? <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_85%,rgba(255,170,90,.28),transparent_70%)]" /> : null}
    </div>
  );
}

/** Punto de la ciudad principal en el viewBox (para centrar la bajada de cámara). */
export const VALLEY_FOCUS = { x: 800, y: 870 };

/** Origen de transformación en píxeles de pantalla para el punto (x,y) del viewBox con xMidYMax slice. */
export function focusOrigin(w: number, h: number, x = VALLEY_FOCUS.x, y = VALLEY_FOCUS.y) {
  const s = Math.max(w / 1600, h / 1000);
  return { ox: w / 2 + (x - 800) * s, oy: h - (1000 - y) * s };
}
