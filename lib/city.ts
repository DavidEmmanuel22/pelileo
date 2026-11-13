/**
 * Mapa nocturno abstracto de una ciudad (canvas 2D) y sus puntos de luz.
 * Determinista: misma semilla → mismas calles y puntos, así las escenas 2, 3 y 14 comparten la ciudad.
 */

export type CityState = {
  lit: number; // 0..1 puntos encendidos (uno por uno)
  off: number; // 0..1 la mayoría se apaga (quedan los "keep")
  extra: number; // 0..1 los que quedaron se multiplican (escena 3)
  bloom: number; // 0..1 luz cálida general
  streets: number; // 0..1 visibilidad de calles
  zoom: number; // escala de cámara (1 = normal)
};

export const initialCity = (): CityState => ({ lit: 0, off: 0, extra: 0, bloom: 0, streets: 1, zoom: 1 });

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Dot = { x: number; y: number; r: number; order: number; keep: boolean; warm: number; tw: number };
type Seg = { x1: number; y1: number; x2: number; y2: number; a: number; w: number };

const W = 1000; // mundo cuadrado
const C = W / 2;

export type City = { dots: Dot[]; extra: Dot[]; segs: Seg[] };

let cache: City | null = null;

export function buildCity(): City {
  if (cache) return cache;
  const r = rng(20251113);
  const segs: Seg[] = [];
  const fall = (x: number, y: number) => {
    const d = Math.hypot(x - C, y - C) / 520;
    return Math.max(0, 1 - d * d);
  };
  const ang = -0.21;
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const rot = (x: number, y: number) => [C + (x - C) * ca - (y - C) * sa, C + (x - C) * sa + (y - C) * ca];

  // Cuadrícula irregular (manzanas)
  for (let dir = 0; dir < 2; dir++) {
    for (let i = -15; i <= 15; i++) {
      const off = i * 34 + (r() - 0.5) * 14;
      const wob = r() * 6;
      const ph = r() * 6;
      let prev: number[] | null = null;
      for (let t = -560; t <= 560; t += 22) {
        const along = t;
        const across = off + Math.sin(t / 90 + ph) * wob;
        const p = dir === 0 ? rot(C + along, C + across) : rot(C + across, C + along);
        if (prev) {
          const a = fall((prev[0] + p[0]) / 2, (prev[1] + p[1]) / 2);
          if (a > 0.02 && r() > 0.06) segs.push({ x1: prev[0], y1: prev[1], x2: p[0], y2: p[1], a: a * 0.75, w: 1 });
        }
        prev = p;
      }
    }
  }
  // Avenidas y anillo
  const curve = (pts: number[][], a: number, w: number) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const [x1, y1] = pts[k];
      const [x2, y2] = pts[k + 1];
      segs.push({ x1, y1, x2, y2, a: a * Math.max(0.15, fall((x1 + x2) / 2, (y1 + y2) / 2)), w });
    }
  };
  const bez = (p0: number[], p1: number[], p2: number[], p3: number[], n = 40) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n;
      const u = 1 - t;
      return [
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ];
    });
  curve(bez([-40, 640], [300, 520], [620, 700], [1040, 380]), 1.6, 1.6);
  curve(bez([220, -40], [420, 300], [560, 620], [700, 1040]), 1.6, 1.6);
  curve(bez([1040, 820], [760, 640], [380, 420], [-40, 260]), 1.2, 1.4);
  curve(
    Array.from({ length: 73 }, (_, i) => {
      const t = (i / 72) * Math.PI * 2;
      return [C + Math.cos(t) * 300, C + Math.sin(t) * 250];
    }),
    1.1,
    1.3,
  );
  // Río
  curve(bez([-40, 380], [260, 470], [520, 300], [1040, 560], 60), 2.4, 7);

  // Puntos de luz: cerca de las calles, más densos al centro
  const dots: Dot[] = [];
  const N = 460;
  while (dots.length < N) {
    const s = segs[Math.floor(r() * segs.length)];
    if (s.w > 3) continue;
    const t = r();
    const x = s.x1 + (s.x2 - s.x1) * t + (r() - 0.5) * 8;
    const y = s.y1 + (s.y2 - s.y1) * t + (r() - 0.5) * 8;
    const d = Math.hypot(x - C, y - C);
    if (d > 470 || r() > 1 - d / 620) continue;
    dots.push({ x, y, r: 1.1 + r() * 1.6, order: d / 470 + r() * 0.45, keep: false, warm: r(), tw: r() * Math.PI * 2 });
  }
  dots.sort((a, b) => a.order - b.order);
  dots.forEach((d, i) => (d.order = i / (N - 1)));
  // los pocos que quedan encendidos (≈7%), repartidos
  const keepIdx = new Set<number>();
  while (keepIdx.size < 32) keepIdx.add(Math.floor(r() * N));
  keepIdx.forEach((i) => (dots[i].keep = true));

  // Puntos extra (escena 3): nacen de los que quedaron, hacia afuera
  const keeps = dots.filter((d) => d.keep);
  const extra: Dot[] = [];
  for (let i = 0; i < 1500; i++) {
    const k = keeps[i % keeps.length];
    const ring = Math.pow(r(), 0.8);
    const a = r() * Math.PI * 2;
    const dist = ring * 760;
    extra.push({
      x: k.x + Math.cos(a) * dist,
      y: k.y + Math.sin(a) * dist,
      r: 1 + r() * 2.2,
      order: ring + r() * 0.12,
      keep: false,
      warm: r(),
      tw: r() * Math.PI * 2,
    });
  }
  extra.sort((a, b) => a.order - b.order);
  extra.forEach((d, i) => (d.order = i / (extra.length - 1)));

  cache = { dots, extra, segs };
  return cache;
}

/* ── Render ──────────────────────────────────────────────────────── */

const sprites: Record<string, HTMLCanvasElement> = {};
function glowSprite(color: string) {
  if (sprites[color]) return sprites[color];
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, `rgba(${color},1)`);
  grd.addColorStop(0.18, `rgba(${color},0.55)`);
  grd.addColorStop(0.45, `rgba(${color},0.14)`);
  grd.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  sprites[color] = c;
  return c;
}

let streetLayer: { key: string; canvas: HTMLCanvasElement } | null = null;

function streets(w: number, h: number, dpr: number, k: number, ox: number, oy: number) {
  const key = `${w}x${h}@${dpr}`;
  if (streetLayer?.key === key) return streetLayer.canvas;
  const c = document.createElement("canvas");
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext("2d")!;
  g.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
  g.lineCap = "round";
  for (const s of buildCity().segs) {
    g.strokeStyle = s.w > 3 ? `rgba(120,70,60,${0.22 * s.a})` : `rgba(255,226,196,${0.085 * s.a})`;
    g.lineWidth = s.w / k;
    g.beginPath();
    g.moveTo(s.x1, s.y1);
    g.lineTo(s.x2, s.y2);
    g.stroke();
  }
  streetLayer = { key, canvas: c };
  return c;
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export function drawCity(ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number, st: CityState, time: number) {
  const city = buildCity();
  const k0 = Math.max(w, h) / (W * 0.82);
  const k = k0 * st.zoom;
  const ox = w / 2 - C * k;
  const oy = h / 2 - C * k;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w * dpr, h * dpr);

  if (st.streets > 0.01) {
    ctx.globalAlpha = st.streets;
    if (st.zoom === 1) ctx.drawImage(streets(w, h, dpr, k0, w / 2 - C * k0, h / 2 - C * k0), 0, 0);
    else {
      const layer = streets(w, h, dpr, k0, w / 2 - C * k0, h / 2 - C * k0);
      ctx.save();
      ctx.translate((w * dpr) / 2, (h * dpr) / 2);
      ctx.scale(st.zoom, st.zoom);
      ctx.translate((-w * dpr) / 2, (-h * dpr) / 2);
      ctx.drawImage(layer, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "lighter";
  const amber = glowSprite("255,181,71");
  const coral = glowSprite("255,138,107");
  const cream = glowSprite("255,236,200");

  const put = (d: Dot, a: number, scale = 1) => {
    if (a <= 0.01) return;
    const x = ox + d.x * k;
    const y = oy + d.y * k;
    if (x < -40 || y < -40 || x > w + 40 || y > h + 40) return;
    const tw = 0.82 + 0.18 * Math.sin(time * 1.6 + d.tw);
    const s = (10 + d.r * 7) * scale * Math.min(1.6, Math.max(0.8, k0));
    ctx.globalAlpha = a * tw;
    ctx.drawImage(d.warm > 0.86 ? coral : amber, x - s / 2, y - s / 2, s, s);
    ctx.globalAlpha = Math.min(1, a * 1.2);
    ctx.drawImage(cream, x - s * 0.12, y - s * 0.12, s * 0.24, s * 0.24);
  };

  for (const d of city.dots) {
    const on = smooth(d.order - 0.04, d.order + 0.02, st.lit);
    const off = d.keep ? 1 : 1 - smooth(0.1 + d.order * 0.6, 0.3 + d.order * 0.7, st.off);
    put(d, on * off, d.keep && st.off > 0.5 ? 1 + st.off * 0.35 : 1);
  }
  if (st.extra > 0) {
    for (const d of city.extra) {
      const a = smooth(d.order - 0.06, d.order + 0.01, st.extra);
      put(d, a, 0.9 + st.bloom * 0.6);
    }
  }
  if (st.bloom > 0) {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, `rgba(255,214,150,${0.95 * st.bloom})`);
    g.addColorStop(0.45, `rgba(255,170,95,${0.7 * st.bloom})`);
    g.addColorStop(1, `rgba(244,92,85,${0.45 * st.bloom})`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}
