/* eslint-disable @next/next/no-img-element */
type Props = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  radius?: number;
};

/** Captura real de la app, flotando sin marco de teléfono. */
export function Screen({ src, alt, className = "", style, priority, radius }: Props) {
  return (
    <div className={`screen ${className}`} style={{ ...style, ...(radius ? { borderRadius: radius } : null) }}>
      <img
        src={`/screens/${src}.webp`}
        alt={alt}
        width={780}
        height={1688}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
      />
    </div>
  );
}
