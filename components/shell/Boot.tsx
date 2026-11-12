"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lockup } from "@/components/brand/Brand";
import { useApp } from "@/lib/store";
import { writeFlag } from "@/lib/storage";

/** Pantalla de carga (CSS puro, ~1.2 s). Solo la primera vez por sesión: un script en <head> marca html[data-booted]. */
export function BootScreen() {
  useEffect(() => {
    writeFlag("vp:booted");
  }, []);
  return (
    <div className="boot" aria-hidden="true">
      <div className="boot-lockup">
        <Lockup size="lg" />
      </div>
    </div>
  );
}

export const BOOT_SCRIPT = `try{if(sessionStorage.getItem('vp:booted')==='1'){document.documentElement.setAttribute('data-booted','')}}catch(e){}`;

/** Ms que faltan para que termine la pantalla de carga. */
export function bootDelay(): number {
  if (typeof document === "undefined") return 0;
  if (document.documentElement.hasAttribute("data-booted")) return 0;
  const elapsed = performance.now();
  return Math.max(0, 1150 - elapsed);
}

export function ClientInit() {
  const hydrate = useApp((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}

export function Toaster() {
  const toast = useApp((s) => s.toast);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => useApp.setState({ toast: null }), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+16px)] z-[60] flex justify-center px-4 lg:bottom-8"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-surface shadow-float"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
