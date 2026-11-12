import { LAT0, LNG0, MAP_SIZE, SCALE } from "./terrain.generated";

export { MAP_SIZE };

/** Proyección lineal lat/lng → coordenadas del lienzo SVG del cantón. */
export function project(lat: number, lng: number): [number, number] {
  return [(lng - LNG0) * SCALE, (LAT0 - lat) * SCALE];
}

export type Bounds = { x0: number; y0: number; x1: number; y1: number };

export function boundsOf(points: [number, number][], minSize = 120): Bounds {
  if (points.length === 0) return { x0: 0, y0: 0, x1: MAP_SIZE, y1: MAP_SIZE };
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const [x, y] of points) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  const cx = (x0 + x1) / 2,
    cy = (y0 + y1) / 2;
  const w = Math.max(minSize, x1 - x0),
    h = Math.max(minSize, y1 - y0);
  return { x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 };
}

/** 1 km en unidades del lienzo (1° ≈ 111.32 km). */
export const KM_UNITS = SCALE / 111.32;

// Vistas de referencia
export const VIEW_CANTON: Bounds = boundsOf([project(-1.29, -78.62), project(-1.47, -78.44)]);
export const VIEW_PELILEO: Bounds = boundsOf([project(-1.312, -78.588), project(-1.366, -78.522)]);
