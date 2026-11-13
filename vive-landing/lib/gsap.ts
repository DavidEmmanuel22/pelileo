"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  (window as unknown as { __ST?: typeof ScrollTrigger }).__ST = ScrollTrigger;
}

export { gsap, ScrollTrigger };

/** Consultas que usan todas las escenas con gsap.matchMedia(). */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 768px)",
  mobile: "(max-width: 767px)",
} as const;
