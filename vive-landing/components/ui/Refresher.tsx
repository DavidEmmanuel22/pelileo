"use client";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/** Recalcula los pins cuando cargan fuentes e imágenes. */
export function Refresher() {
  useEffect(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const t = setTimeout(() => ScrollTrigger.refresh(), 1500);
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    return () => clearTimeout(t);
  }, []);
  return null;
}
