"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

import { PRELOAD_KEY as KEY } from "./preload-script";

export function markReady() {
  (window as unknown as { __viveReady?: boolean }).__viveReady = true;
  window.dispatchEvent(new Event("vive:ready"));
}

/** Llama a fn cuando termina la precarga (o de inmediato si no hay precarga). */
export function onReady(fn: () => void) {
  if ((window as unknown as { __viveReady?: boolean }).__viveReady) {
    fn();
    return () => {};
  }
  window.addEventListener("vive:ready", fn, { once: true });
  return () => window.removeEventListener("vive:ready", fn);
}

/** Escena 0 · "Vive" letra por letra, un punto coral que late y se abre como iris (máx. 1,8 s). */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = ref.current!;
    if (document.documentElement.classList.contains("no-preload")) {
      const id = requestAnimationFrame(() => setGone(true));
      markReady();
      return () => cancelAnimationFrame(id);
    }
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* modo privado */
    }
    window.__lenis?.stop();
    const letters = root.querySelectorAll("[data-l]");
    const dot = root.querySelector("[data-dot]");
    const tl = gsap.timeline({
      defaults: { ease: "power4.out" },
      onComplete: () => {
        window.__lenis?.start();
        setGone(true);
      },
    });
    tl.from(letters, { yPercent: 110, duration: 0.6, stagger: 0.07 })
      .from(dot, { scale: 0, duration: 0.35, ease: "back.out(3)" }, 0.35)
      .to(dot, { scale: 1.5, duration: 0.18, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.75)
      .to(letters, { yPercent: -110, duration: 0.45, stagger: 0.04, ease: "power3.in" }, 1.05)
      .call(markReady, [], 1.2)
      .to(root, { "--r": `${Math.hypot(innerWidth, innerHeight)}px`, duration: 0.6, ease: "power3.in" }, 1.15)
      .to(dot, { scale: 0, duration: 0.3 }, 1.15);
    return () => {
      tl.kill();
    };
  }, []);

  if (gone) return null;
  return (
    <div
      ref={ref}
      className="preloader fixed inset-0 z-[200] grid place-items-center bg-night"
      style={{ "--r": "0px" } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center">
        <div className="flex overflow-hidden pb-2 text-[clamp(64px,14vw,168px)] font-extrabold leading-none tracking-[-0.05em] text-fg">
          {"Vive".split("").map((c, i) => (
            <span key={i} data-l className="inline-block">
              {c}
            </span>
          ))}
        </div>
        <span data-dot className="mt-5 block h-3.5 w-3.5 rounded-full bg-coral" style={{ boxShadow: "0 0 24px 4px rgba(244,92,85,.55)" }} />
      </div>
    </div>
  );
}
