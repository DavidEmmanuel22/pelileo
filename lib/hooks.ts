"use client";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "./gsap";

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Crea un gsap.context ligado a un contenedor y lo revierte al desmontar. */
export function useGsap(scope: RefObject<HTMLElement | null>, fn: (ctx: gsap.Context) => void, deps: unknown[] = []) {
  const fnRef = useRef(fn);
  // la función más reciente se guarda en un efecto (no durante el render); corre antes del efecto principal
  useIsoLayoutEffect(() => {
    fnRef.current = fn;
  });
  useIsoLayoutEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context((self) => fnRef.current(self), scope.current);
    return () => ctx.revert();
  }, deps);
}

export function useMedia(query: string, initial = false) {
  const [match, setMatch] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

/** true cuando el elemento está en pantalla (para autoplay de videos y simulaciones). */
export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = "0px", once = false) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting && once) io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once]);
  return inView;
}
