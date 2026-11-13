// Genera la cartografía ilustrada del cantón Pelileo (estática) en components/map/terrain.generated.ts
// Curvas de nivel por marching squares (d3-contour) sobre un relieve sintético con los cerros reales.
import { contours } from "d3-contour";
import { writeFileSync } from "node:fs";

// ── Proyección lineal (equirectangular local; 1° ≈ igual en lat y lng cerca del ecuador)
const LNG0 = -78.63;
const LAT0 = -1.28;
const SCALE = 10000; // unidades SVG por grado
const SIZE = 2300;
const px = (lat, lng) => [(lng - LNG0) * SCALE, (LAT0 - lat) * SCALE];

const r1 = (n) => Math.round(n * 10) / 10;

// Catmull-Rom → Bézier
function smoothPath(points, closed = false, tension = 0.5) {
  const p = points;
  if (p.length < 2) return "";
  const n = p.length;
  const get = (i) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1),
      p1 = get(i),
      p2 = get(i + 1),
      p3 = get(i + 2);
    const t = tension / 3;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return closed ? d + "Z" : d;
}
const ll = (arr) => arr.map(([lat, lng]) => px(lat, lng));

// ── Rasgos
const RIVER_PATATE = ll([
  [-1.27, -78.514],
  [-1.29, -78.51],
  [-1.305, -78.512],
  [-1.32, -78.509],
  [-1.335, -78.503],
  [-1.35, -78.497],
  [-1.364, -78.486],
  [-1.378, -78.474],
  [-1.39, -78.458],
  [-1.398, -78.44],
  [-1.404, -78.42],
  [-1.41, -78.39],
]);
const RIVER_PACHANLICA = ll([
  [-1.352, -78.64],
  [-1.343, -78.616],
  [-1.338, -78.597],
  [-1.336, -78.578],
  [-1.329, -78.565],
  [-1.318, -78.556],
  [-1.309, -78.538],
  [-1.304, -78.522],
  [-1.303, -78.511],
]);
const RIVER_CHAMBO = ll([
  [-1.53, -78.47],
  [-1.5, -78.462],
  [-1.47, -78.468],
  [-1.445, -78.462],
  [-1.425, -78.452],
  [-1.41, -78.442],
  [-1.4, -78.438],
]);

const ROAD_MAIN = ll([
  [-1.268, -78.64],
  [-1.29, -78.617],
  [-1.307, -78.596],
  [-1.3209, -78.5786],
  [-1.3245, -78.566],
  [-1.3252, -78.5532],
  [-1.3285, -78.548],
  [-1.3315, -78.541],
  [-1.338, -78.528],
  [-1.348, -78.514],
  [-1.36, -78.502],
  [-1.374, -78.489],
  [-1.386, -78.473],
  [-1.396, -78.455],
  [-1.402, -78.435],
  [-1.408, -78.41],
  [-1.412, -78.39],
]);
const ROADS_SECONDARY = [
  // Pelileo → Pelileo Grande → Huambaló → Cotaló → Las Caras
  ll([
    [-1.331, -78.5445],
    [-1.3345, -78.536],
    [-1.337, -78.53],
    [-1.345, -78.528],
    [-1.358, -78.532],
    [-1.372, -78.529],
    [-1.3886, -78.5316],
    [-1.4, -78.526],
    [-1.412, -78.517],
    [-1.422, -78.512],
    [-1.428, -78.509],
    [-1.4345, -78.5055],
  ]),
  // Pelileo → Nitón → Teligote → García Moreno
  ll([
    [-1.3315, -78.5475],
    [-1.338, -78.551],
    [-1.346, -78.549],
    [-1.3538, -78.5508],
    [-1.36, -78.556],
    [-1.3685, -78.5628],
    [-1.372, -78.572],
    [-1.378, -78.585],
    [-1.386, -78.6],
  ]),
  // Benítez → El Rosario → Huambaló
  ll([
    [-1.3245, -78.566],
    [-1.338, -78.572],
    [-1.355, -78.575],
    [-1.374, -78.572],
    [-1.392, -78.562],
    [-1.396, -78.548],
    [-1.3886, -78.5316],
  ]),
  // Pelileo → Chiquicha → Patate
  ll([
    [-1.3285, -78.545],
    [-1.32, -78.538],
    [-1.307, -78.532],
    [-1.297, -78.523],
    [-1.288, -78.512],
    [-1.282, -78.498],
    [-1.276, -78.48],
  ]),
  // Huambaló → Bolívar → vía principal
  ll([
    [-1.3886, -78.5316],
    [-1.382, -78.52],
    [-1.372, -78.511],
    [-1.362, -78.505],
  ]),
  // Salasaca → norte (Ambato)
  ll([
    [-1.3209, -78.5786],
    [-1.305, -78.584],
    [-1.29, -78.59],
    [-1.275, -78.594],
  ]),
  // Cotaló → Cruz de Cotaló → Bilbao (faldas del volcán)
  ll([
    [-1.422, -78.512],
    [-1.426, -78.498],
    [-1.436, -78.486],
    [-1.448, -78.474],
  ]),
];

const HILLS = [
  { lat: -1.356, lng: -78.553, rx: 0.0105, ry: 0.0085, rot: -18 }, // Nitón
  { lat: -1.371, lng: -78.567, rx: 0.016, ry: 0.012, rot: 12 }, // Teligote
];

// Límite del cantón (aprox., dibujado a mano)
const CANTON = ll([
  [-1.296, -78.612],
  [-1.288, -78.585],
  [-1.29, -78.556],
  [-1.284, -78.53],
  [-1.29, -78.512],
  [-1.31, -78.508],
  [-1.334, -78.501],
  [-1.352, -78.494],
  [-1.37, -78.48],
  [-1.388, -78.464],
  [-1.402, -78.452],
  [-1.42, -78.462],
  [-1.44, -78.476],
  [-1.452, -78.49],
  [-1.452, -78.51],
  [-1.44, -78.528],
  [-1.425, -78.545],
  [-1.41, -78.565],
  [-1.398, -78.585],
  [-1.388, -78.602],
  [-1.368, -78.61],
  [-1.348, -78.618],
  [-1.326, -78.624],
  [-1.31, -78.62],
]);

// ── Relieve sintético
const G = [
  { lat: -1.467, lng: -78.442, a: 13, s: 0.05 }, // Tungurahua
  { lat: -1.356, lng: -78.553, a: 2.1, s: 0.0105 }, // Nitón
  { lat: -1.372, lng: -78.567, a: 2.7, s: 0.016 }, // Teligote
  { lat: -1.41, lng: -78.64, a: 5.2, s: 0.06 }, // altos del oeste
  { lat: -1.402, lng: -78.546, a: 1.7, s: 0.02 }, // lomas de Huambaló
  { lat: -1.3, lng: -78.6, a: 1.3, s: 0.025 }, // lomas de Salasaca
  { lat: -1.432, lng: -78.492, a: 2.2, s: 0.028 }, // faldas de Cotaló
  { lat: -1.33, lng: -78.465, a: 3.2, s: 0.032 }, // cerros de Patate
  { lat: -1.505, lng: -78.53, a: 3.5, s: 0.045 }, // sur
  { lat: -1.28, lng: -78.44, a: 2.5, s: 0.04 }, // noreste
];

function distToPolyline(x, y, pts) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i],
      [bx, by] = pts[i + 1];
    const dx = bx - ax,
      dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    const ex = ax + t * dx - x,
      ey = ay + t * dy - y;
    best = Math.min(best, Math.hypot(ex, ey));
  }
  return best;
}

const N = 190; // celdas por lado (incluye margen)
const PAD = 160; // margen fuera del lienzo para que las curvas no dibujen el borde
const cell = (SIZE + PAD * 2) / N;
const values = new Float64Array(N * N);
for (let j = 0; j < N; j++) {
  for (let i = 0; i < N; i++) {
    const x = (i + 0.5) * cell - PAD,
      y = (j + 0.5) * cell - PAD;
    const lng = x / SCALE + LNG0,
      lat = LAT0 - y / SCALE;
    let h = 0;
    for (const g of G) {
      const d2 = ((lat - g.lat) ** 2 + (lng - g.lng) ** 2) / (g.s * g.s);
      h += g.a * Math.exp(-d2 / 2);
    }
    h +=
      0.42 * Math.sin(x / 150 + 1.7 * Math.cos(y / 230)) +
      0.34 * Math.cos(y / 125 - Math.sin(x / 175) * 1.6) +
      0.2 * Math.sin((x + 0.6 * y) / 62 + Math.cos(x / 90)) +
      0.12 * Math.cos((x - y) / 41 + Math.sin(y / 70) * 2);
    const dr = Math.min(distToPolyline(x, y, RIVER_PATATE), distToPolyline(x, y, RIVER_CHAMBO));
    h -= 2.6 * Math.exp(-((dr / 110) ** 2));
    const dp = distToPolyline(x, y, RIVER_PACHANLICA);
    h -= 1.1 * Math.exp(-((dp / 70) ** 2));
    values[j * N + i] = h;
  }
}
let min = Infinity,
  max = -Infinity;
for (const v of values) {
  min = Math.min(min, v);
  max = Math.max(max, v);
}
const STEP = 0.27;
const thresholds = [];
for (let t = Math.ceil(min / STEP) * STEP; t < max; t += STEP) thresholds.push(Math.round(t * 1000) / 1000);

// Douglas-Peucker
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let idx = -1, dmax = 0;
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const L = Math.hypot(bx - ax, by - ay) || 1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / L;
      if (d > dmax) { dmax = d; idx = i; }
    }
    if (dmax > tol && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const inside = ([x, y]) => x > -40 && y > -40 && x < SIZE + 40 && y < SIZE + 40;
const cs = contours().size([N, N]).thresholds(thresholds)(Array.from(values));
const contourOut = cs
  .map((c, idx) => {
    let d = "";
    for (const poly of c.coordinates) {
      for (const ring of poly) {
        const raw = ring.map(([gx, gy]) => [gx * cell - PAD, gy * cell - PAD]);
        const mid = Math.floor(raw.length / 2);
        const pts = [...simplify(raw.slice(0, mid + 1), 1.6).slice(0, -1), ...simplify(raw.slice(mid), 1.6)];
        if (pts.length < 3 || !pts.some(inside)) continue;
        d += "M" + pts.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join("L") + "Z";
      }
    }
    return { d, major: idx % 5 === 0, level: idx };
  })
  .filter((c) => c.d.length > 0);

// ── Manzanas urbanas (Pelileo y poblados)
function blocks(lat, lng, rx, ry, size, gap, rot, seed) {
  const [cx, cy] = px(lat, lng);
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const out = [];
  const a = (rot * Math.PI) / 180;
  const step = size + gap;
  for (let gy = -ry; gy <= ry; gy += step * 0.8) {
    for (let gx = -rx; gx <= rx; gx += step) {
      const e = (gx / rx) ** 2 + (gy / ry) ** 2;
      if (e > 1 - rnd() * 0.25) continue;
      if (rnd() < 0.12) continue;
      const w = size * (0.75 + rnd() * 0.35),
        h = size * 0.8 * (0.7 + rnd() * 0.35);
      const corners = [
        [gx, gy],
        [gx + w, gy],
        [gx + w, gy + h],
        [gx, gy + h],
      ].map(([u, v]) => [cx + u * Math.cos(a) - v * Math.sin(a), cy + u * Math.sin(a) + v * Math.cos(a)]);
      out.push(`M${corners.map((c) => `${r1(c[0])} ${r1(c[1])}`).join("L")}Z`);
    }
  }
  return out.join("");
}
const URBAN = [
  blocks(-1.3305, -78.5455, 75, 58, 15, 5, -14, 7),
  blocks(-1.3255, -78.5535, 36, 24, 12, 5, -10, 11),
  blocks(-1.3215, -78.578, 34, 22, 11, 6, 8, 13),
  blocks(-1.337, -78.53, 26, 18, 11, 6, 20, 17),
  blocks(-1.3886, -78.5316, 30, 20, 11, 6, -6, 19),
  blocks(-1.428, -78.509, 24, 16, 10, 6, 14, 23),
  blocks(-1.3255, -78.566, 22, 14, 10, 6, -4, 29),
].join("");

function ellipsePath({ lat, lng, rx, ry, rot }) {
  const [cx, cy] = px(lat, lng);
  const pts = [];
  const a = (rot * Math.PI) / 180;
  for (let i = 0; i < 14; i++) {
    const t = (i / 14) * Math.PI * 2;
    const wob = 1 + 0.12 * Math.sin(t * 3 + rot) + 0.06 * Math.cos(t * 5);
    const u = Math.cos(t) * rx * SCALE * wob,
      v = Math.sin(t) * ry * SCALE * wob;
    pts.push([cx + u * Math.cos(a) - v * Math.sin(a), cy + u * Math.sin(a) + v * Math.cos(a)]);
  }
  return smoothPath(pts, true);
}

const out = `// ⚠️ Archivo generado por scripts/gen-terrain.mjs — no editar a mano.
export const MAP_SIZE = ${SIZE};
export const LNG0 = ${LNG0};
export const LAT0 = ${LAT0};
export const SCALE = ${SCALE};
export const CANTON_PATH = ${JSON.stringify(smoothPath(CANTON, true, 0.6))};
export const CONTOURS: { d: string; major: boolean; level: number }[] = ${JSON.stringify(contourOut)};
export const RIVERS: { d: string; width: number; name?: string }[] = ${JSON.stringify([
  { d: smoothPath(RIVER_PATATE), width: 9, name: "Río Patate" },
  { d: smoothPath(RIVER_CHAMBO), width: 7, name: "Río Chambo" },
  { d: smoothPath(RIVER_PACHANLICA), width: 3.2, name: "Río Pachanlica" },
])};
export const ROAD_MAIN = ${JSON.stringify(smoothPath(ROAD_MAIN))};
export const ROADS_SECONDARY: string[] = ${JSON.stringify(ROADS_SECONDARY.map((r) => smoothPath(r)))};
export const HILLS: string[] = ${JSON.stringify(HILLS.map(ellipsePath))};
export const URBAN_PATH = ${JSON.stringify(URBAN)};
`;
writeFileSync(new URL("../components/map/terrain.generated.ts", import.meta.url), out);
console.log(
  `contours: ${contourOut.length} (min ${min.toFixed(2)} max ${max.toFixed(2)}), bytes: ${(out.length / 1024).toFixed(1)} KB`,
);
