// Formato propio (es-EC: punto de miles, coma decimal) para que servidor y navegador rindan igual.

function group(int: number): string {
  return String(Math.abs(Math.round(int))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function fmtNumber(n: number): string {
  return `${n < 0 ? "−" : ""}${group(n)}`;
}

export function fmtDecimal(n: number, digits = 1): string {
  const [i, d] = Math.abs(n).toFixed(digits).split(".");
  const out = d && Number(d) !== 0 ? `${group(Number(i))},${d}` : group(Number(i));
  return `${n < 0 ? "−" : ""}${out}`;
}

export function fmtUsd(n: number): string {
  return `$${group(n)}`;
}

export function fmtPct(share: number): string {
  return `${Math.round(share * 100)}%`;
}

export function fmtKpi(value: number, format: string): string {
  if (format === "usd") return fmtUsd(value);
  if (format === "days") return `${fmtDecimal(value)} días`;
  return fmtNumber(value);
}
