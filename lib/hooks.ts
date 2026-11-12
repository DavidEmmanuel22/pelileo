"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const noop = () => () => {};

/** true solo en el cliente después de hidratar (evita diferencias servidor/cliente). */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** Fecha actual solo en el cliente; null durante el render del servidor. */
export function useNow(intervalMs = 60_000): Date | null {
  const mounted = useMounted();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!mounted) return;
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [mounted, intervalMs]);
  return now;
}

const subs = new Map<string, (cb: () => void) => () => void>();
function subscribeMQ(query: string) {
  const hit = subs.get(query);
  if (hit) return hit;
  const fn = (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
  subs.set(query, fn);
  return fn;
}

export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    subscribeMQ(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
