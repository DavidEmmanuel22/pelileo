/** 14390 → "14.390" (estilo Ecuador, también para 4 cifras). */
export function miles(n: number) {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
