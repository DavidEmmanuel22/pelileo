/* eslint-disable @next/next/no-img-element */
type Props = { tone?: "light" | "dark"; size?: "sm" | "md" | "lg"; className?: string };

/** "Vive" en 800 + "by clapzy" pequeño con el ícono coral. */
export function Lockup({ tone = "light", size = "md", className = "" }: Props) {
  const s = { sm: [22, 10, 14], md: [28, 11, 17], lg: [56, 15, 28] }[size];
  return (
    <span className={`inline-flex items-end gap-[0.4em] leading-none ${className}`} aria-label="Vive by clapzy">
      <span
        className={tone === "light" ? "text-fg" : "text-ink"}
        style={{ fontSize: s[0], fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 0.85 }}
        aria-hidden="true"
      >
        Vive
      </span>
      <span className="inline-flex items-center gap-[5px] pb-[0.12em]" aria-hidden="true">
        <span
          className={tone === "light" ? "text-fg-2" : "text-ink-2"}
          style={{ fontSize: s[1], fontWeight: 600, letterSpacing: "0.02em" }}
        >
          by
        </span>
        <img
          src={tone === "light" ? "/brand/clapzy-wordmark-light.png" : "/brand/clapzy-wordmark.png"}
          alt=""
          height={s[2]}
          width={Math.round(s[2] * (506 / 105))}
          style={{ height: s[2], width: "auto" }}
          className="clapzy-wordmark"
        />
      </span>
    </span>
  );
}
