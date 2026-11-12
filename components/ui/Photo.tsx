import Image from "next/image";
import type { Category } from "@/data/types";
import { CategoryIcon } from "./icons";
import { VolcanoIcon } from "@/components/brand/Brand";

/** Foto con placeholder elegante (gradiente neutro + ícono de categoría) si no hay imagen. */
export function Photo({
  src,
  alt,
  category,
  sizes = "(max-width: 768px) 80vw, 400px",
  className = "",
  priority = false,
  iconSize = 28,
}: {
  src: string | null;
  alt: string;
  category?: Category | "evento";
  sizes?: string;
  className?: string;
  priority?: boolean;
  iconSize?: number;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-bg-2 ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" preload={priority} loading={priority ? "eager" : "lazy"} />
      </div>
    );
  }
  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${className}`}
      style={{
        background:
          "radial-gradient(120% 90% at 20% 0%, var(--surface) 0%, var(--bg-2) 55%, color-mix(in srgb, var(--line) 80%, var(--bg)) 100%)",
      }}
      role="img"
      aria-label={alt}
    >
      <span className="text-ink-3">
        {category && category !== "evento" ? (
          <CategoryIcon category={category} size={iconSize} strokeWidth={1.4} />
        ) : (
          <VolcanoIcon size={iconSize + 8} />
        )}
      </span>
    </div>
  );
}
