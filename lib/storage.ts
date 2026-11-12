/** Acceso seguro a localStorage / sessionStorage: siempre dentro de try/catch. */
type Kind = "local" | "session";

function store(kind: Kind): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readJSON<T>(key: string, fallback: T, kind: Kind = "local"): T {
  try {
    const s = store(kind);
    if (!s) return fallback;
    const raw = s.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown, kind: Kind = "local"): void {
  try {
    const s = store(kind);
    if (!s) return;
    s.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento lleno o bloqueado: seguimos en memoria */
  }
}

export function readFlag(key: string, kind: Kind = "session"): boolean {
  try {
    return store(kind)?.getItem(key) === "1";
  } catch {
    return false;
  }
}
export function writeFlag(key: string, kind: Kind = "session"): void {
  try {
    store(kind)?.setItem(key, "1");
  } catch {
    /* noop */
  }
}
