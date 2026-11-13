import { memo, useId } from "react";
import {
  CANTON_PATH,
  CONTOURS,
  HILLS,
  MAP_SIZE,
  RIVERS,
  ROAD_MAIN,
  ROADS_SECONDARY,
  URBAN_PATH,
} from "./terrain.generated";
import { project } from "./projection";

const NS = { vectorEffect: "non-scaling-stroke" } as const;

const [VX, VY] = project(-1.467, -78.442);

/** Silueta lineal del Tungurahua (viñeta de perfil, estilo mapa editorial). */
function VolcanoProfile() {
  const bx = VX,
    by = MAP_SIZE - 120;
  const w = 560,
    h = 210;
  const L = bx - w / 2,
    R = bx + w / 2;
  const d = `M${L} ${by} C${L + 120} ${by - 18} ${bx - 140} ${by - h * 0.55} ${bx - 46} ${by - h + 8} L${bx - 22} ${by - h} L${bx + 18} ${by - h + 2} L${bx + 44} ${by - h + 10} C${bx + 130} ${by - h * 0.52} ${R - 120} ${by - 20} ${R} ${by}`;
  const snow = `M${bx - 86} ${by - h + 58} C${bx - 60} ${by - h + 46} ${bx - 40} ${by - h + 62} ${bx - 18} ${by - h + 48} C${bx} ${by - h + 60} ${bx + 30} ${by - h + 44} ${bx + 52} ${by - h + 58} C${bx + 66} ${by - h + 50} ${bx + 78} ${by - h + 60} ${bx + 90} ${by - h + 62}`;
  return (
    <g
      fill="none"
      stroke="var(--map-contour-strong)"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} strokeWidth={1.4} style={NS} />
      <path d={snow} strokeWidth={1} style={NS} />
      <path d={`M${L - 60} ${by}H${R + 60}`} strokeWidth={0.8} style={NS} />
    </g>
  );
}

function Hachures() {
  // trazos radiales cortos alrededor del cráter
  const lines: string[] = [];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const r0 = 34,
      r1 = 34 + 26 + (i % 3) * 10;
    lines.push(
      `M${(VX + Math.cos(a) * r0).toFixed(1)} ${(VY + Math.sin(a) * r0).toFixed(1)}L${(VX + Math.cos(a) * r1).toFixed(1)} ${(VY + Math.sin(a) * r1).toFixed(1)}`,
    );
  }
  return (
    <path
      d={lines.join("")}
      stroke="var(--map-contour-strong)"
      strokeWidth={0.9}
      style={NS}
      fill="none"
    />
  );
}

/** Máscaras que desvanecen el terreno hacia los bordes del lienzo (sin cortes duros al alejar). */
function EdgeFade({ id }: { id: string }) {
  const stops = (
    <>
      <stop offset="0" stopColor="#fff" stopOpacity={0} />
      <stop offset="0.12" stopColor="#fff" stopOpacity={1} />
      <stop offset="0.88" stopColor="#fff" stopOpacity={1} />
      <stop offset="1" stopColor="#fff" stopOpacity={0} />
    </>
  );
  return (
    <defs>
      <linearGradient id={`${id}-gx`} x1="0" y1="0" x2="1" y2="0">
        {stops}
      </linearGradient>
      <linearGradient id={`${id}-gy`} x1="0" y1="0" x2="0" y2="1">
        {stops}
      </linearGradient>
      <mask
        id={`${id}-mx`}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={MAP_SIZE}
        height={MAP_SIZE}
      >
        <rect width={MAP_SIZE} height={MAP_SIZE} fill={`url(#${id}-gx)`} />
      </mask>
      <mask
        id={`${id}-my`}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={MAP_SIZE}
        height={MAP_SIZE}
      >
        <rect width={MAP_SIZE} height={MAP_SIZE} fill={`url(#${id}-gy)`} />
      </mask>
    </defs>
  );
}

function Faded({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <g mask={`url(#${id}-mx)`}>
      <g mask={`url(#${id}-my)`}>{children}</g>
    </g>
  );
}

export const MapArt = memo(function MapArt() {
  const id = `vp-fade-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <g>
      <EdgeFade id={id} />
      {/* papel */}
      <rect
        x={-6000}
        y={-6000}
        width={MAP_SIZE + 12000}
        height={MAP_SIZE + 12000}
        fill="var(--map-land)"
      />

      <Faded id={id}>
        {/* cerros: manchas verdes muy tenues */}
        <g fill="var(--map-hill)">
          {HILLS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* curvas de nivel */}
        <g fill="none" strokeLinejoin="round">
          {CONTOURS.map((c) => (
            <path
              key={c.level}
              d={c.d}
              stroke={
                c.major ? "var(--map-contour-strong)" : "var(--map-contour)"
              }
              strokeWidth={c.major ? 0.95 : 0.6}
              style={NS}
            />
          ))}
        </g>

        {/* volcán */}
        <Hachures />
        <ellipse
          cx={VX}
          cy={VY}
          rx={30}
          ry={24}
          fill="var(--map-land)"
          stroke="var(--map-contour-strong)"
          strokeWidth={1.1}
          style={NS}
        />
        <VolcanoProfile />
      </Faded>

      {/* fuera del cantón: velo de papel */}
      <path
        d={`M-6000 -6000H${MAP_SIZE + 6000}V${MAP_SIZE + 6000}H-6000Z${CANTON_PATH}`}
        fill="var(--map-paper)"
        fillRule="evenodd"
        opacity={0.62}
      />

      <Faded id={id}>
        {/* ríos */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {RIVERS.map((r) => (
            <path
              key={`e-${r.name}`}
              d={r.d}
              stroke="var(--map-water-edge)"
              strokeWidth={r.width * 0.55 + 1.4}
              style={NS}
            />
          ))}
          {RIVERS.map((r) => (
            <path
              key={r.name}
              d={r.d}
              stroke="var(--map-water)"
              strokeWidth={r.width * 0.55}
              style={NS}
            />
          ))}
        </g>

        {/* área urbana */}
        <path d={URBAN_PATH} fill="var(--map-urban)" opacity={0.8} />

        {/* vías */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {ROADS_SECONDARY.map((d, i) => (
            <path
              key={`sc-${i}`}
              d={d}
              stroke="var(--map-road-casing)"
              strokeWidth={3.6}
              style={NS}
            />
          ))}
          {ROADS_SECONDARY.map((d, i) => (
            <path
              key={`s-${i}`}
              d={d}
              stroke="var(--map-road)"
              strokeWidth={2}
              style={NS}
            />
          ))}
          <path
            d={ROAD_MAIN}
            stroke="var(--map-road-casing)"
            strokeWidth={6}
            style={NS}
          />
          <path
            d={ROAD_MAIN}
            stroke="var(--map-road)"
            strokeWidth={3.8}
            style={NS}
          />
        </g>
      </Faded>

      {/* límite cantonal */}
      <path
        d={CANTON_PATH}
        fill="none"
        stroke="var(--ink-2)"
        strokeOpacity={0.42}
        strokeWidth={1.1}
        strokeDasharray="7 4 1.5 4"
        style={NS}
      />
    </g>
  );
});
