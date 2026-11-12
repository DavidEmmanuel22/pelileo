import Image from "next/image";

/** Silueta mínima del Tungurahua con 9 puntos (las 9 estrellas del escudo, una por parroquia). */
export function VolcanoIcon({ size = 28, className = "" }: { size?: number; className?: string }) {
  // 9 estrellas en arco sobre el volcán
  const stars = Array.from({ length: 9 }, (_, i) => {
    const t = Math.PI * (0.92 - (i / 8) * 0.84);
    return {
      x: Math.round((16 + Math.cos(t) * 12.5) * 100) / 100,
      y: Math.round((15.2 - Math.sin(t) * 9.6) * 100) / 100,
    };
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2.5 27.5h27M5.5 27.5 13.6 15.6c.5-.7 1-.9 1.5-.9h1.8c.5 0 1 .2 1.5.9l8.1 11.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6 18.6c1.3.9 2.3.3 3.3-.5.8-.6 1.6-.6 2.3 0 1 .8 2 1.4 3.3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={0.95} fill="currentColor" />
      ))}
    </svg>
  );
}

export function Tricolor({ className = "" }: { className?: string }) {
  return <div className={`tricolor ${className}`} aria-hidden="true" />;
}

export function ClapzyWordmark({ height = 12, className = "" }: { height?: number; className?: string }) {
  const width = Math.round((506 / 105) * height);
  return (
    <Image
      src="/brand/clapzy-wordmark.png"
      alt="Clapzy"
      width={width}
      height={height}
      className={className}
      style={{ height, width }}
      priority
    />
  );
}

/** Lockup de la ciudad: "Vive Pelileo" + línea tricolor + "by Clapzy". */
export function Lockup({
  size = "md",
  showIcon = true,
  className = "",
  inverted = false,
}: {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
  /** Versión clara para usar sobre fotos. */
  inverted?: boolean;
}) {
  const ink = inverted ? "text-on-photo" : "text-ink";
  const title = size === "lg" ? "text-[34px]" : size === "md" ? "text-[19px]" : "text-[17px]";
  const icon = size === "lg" ? 46 : size === "md" ? 30 : 26;
  const by = size === "lg" ? 13 : 11;
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showIcon && <VolcanoIcon size={icon} className={`${ink} shrink-0 transition-colors duration-500`} />}
      <div className="flex flex-col">
        <span className={`${title} whitespace-nowrap leading-none tracking-[-0.02em] ${ink} transition-colors duration-500`}>
          <span className="font-medium">Vive </span>
          <span className="font-bold">Pelileo</span>
        </span>
        <Tricolor className={size === "lg" ? "mt-2.5 w-full" : "mt-[5px] w-full"} />
        <span
          className={`mt-[5px] flex items-center gap-1 leading-none ${inverted ? "text-on-photo/80" : "text-ink-2"}`}
          style={{ fontSize: by }}
        >
          by <ClapzyWordmark height={by - 1} className={`translate-y-[0.5px] ${inverted ? "brightness-0 invert" : ""}`} />
        </span>
      </div>
    </div>
  );
}

/** Avatar de Gaia (coral = Clapzy). */
export function GaiaMark({ size = 28, thinking = false }: { size?: number; thinking?: boolean }) {
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center rounded-full bg-clapzy-soft"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/brand/clapzy-icon.png"
        alt=""
        width={size}
        height={size}
        className={thinking ? "gaia-pulse" : ""}
        style={{ width: size * 0.58, height: size * 0.58 }}
      />
    </span>
  );
}
