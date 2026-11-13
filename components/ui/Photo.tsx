/* eslint-disable @next/next/no-img-element */
type Props = {
  name: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  style?: React.CSSProperties;
};

/** Foto optimizada (AVIF/WebP, versión liviana en celular). */
export function Photo({ name, alt, className, imgClassName, priority, style }: Props) {
  const base = `/media/photos/${name}`;
  return (
    <picture className={className} style={style}>
      <source type="image/avif" media="(max-width: 767px)" srcSet={`${base}-m.avif`} />
      <source type="image/webp" media="(max-width: 767px)" srcSet={`${base}-m.webp`} />
      <source type="image/avif" srcSet={`${base}.avif`} />
      <img
        src={`${base}.webp`}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={imgClassName ?? "h-full w-full object-cover"}
        draggable={false}
      />
    </picture>
  );
}
