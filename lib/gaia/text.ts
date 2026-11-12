/** Normaliza texto libre: minúsculas, sin tildes, sin emojis ni signos raros. */
export function normalize(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .slice(0, 600)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9$€.,:/\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** ¿Aparece la palabra o frase (normalizada) como palabra completa? */
export function hasWord(text: string, word: string): boolean {
  const w = normalize(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!w) return false;
  return new RegExp(`(^|[^a-z0-9])${w}([^a-z0-9]|$)`).test(text);
}

export function hasAny(text: string, words: string[]): boolean {
  return words.some((w) => hasWord(text, w));
}

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function money(n: number): string {
  return `$${Math.round(n)}`;
}

export function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
