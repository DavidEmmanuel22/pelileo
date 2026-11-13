"use client";
import { track as vercelTrack } from "@vercel/analytics";

export type Evento = "cta_ver_demo" | "cta_agendar" | "form_enviado" | "gaia_chip" | "escena_vista";

/** Analítica liviana: si Vercel Analytics no está activo, no falla. */
export function track(evento: Evento, props?: Record<string, string | number | boolean>) {
  try {
    vercelTrack(evento, props);
  } catch {
    /* sin cuenta: no pasa nada */
  }
}
