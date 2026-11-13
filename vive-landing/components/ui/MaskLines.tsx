import { createElement } from "react";

type Props = {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
  lineClassName?: (i: number) => string;
  id?: string;
};

/** Titular partido en líneas con máscara: cada línea (data-line) se anima de abajo hacia arriba. */
export function MaskLines({ lines, as = "h2", className = "", lineClassName, id }: Props) {
  return createElement(
    as,
    { className, id },
    lines.map((l, i) => (
      <span key={i} className="line-mask">
        <span data-line className={lineClassName?.(i)}>
          {l}
        </span>
      </span>
    )),
  );
}

/** Parte un texto en palabras con máscara (data-word). */
export function MaskWords({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i} className={`inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom ${className}`}>
          <span data-word className="inline-block will-change-transform">
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </>
  );
}
