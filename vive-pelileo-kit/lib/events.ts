"use client";

import { useMemo } from "react";
import type { EventItem } from "@/data/types";
import { EVENTS, getPlace } from "@/lib/data";
import { useNow } from "@/lib/hooks";
import { useApp, type PublishedEvent } from "@/lib/store";
import { dayDiff, eventDate } from "@/lib/time";

export type DatedEvent = {
  ev: EventItem & { description?: string; published?: boolean };
  date: Date;
  diff: number; // días desde hoy
  placeName: string;
};

export function datedEvents(now: Date, published: PublishedEvent[]): DatedEvent[] {
  const list: DatedEvent[] = [];
  for (const ev of EVENTS) {
    const date = eventDate(ev, now);
    list.push({ ev, date, diff: dayDiff(now, date), placeName: getPlace(ev.placeId)?.name ?? "Pelileo" });
  }
  for (const p of published) {
    const [y, m, d] = p.date.split("-").map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    const diff = dayDiff(now, date);
    if (diff < 0) continue;
    list.push({ ev: { ...p, published: true }, date, diff, placeName: getPlace(p.placeId)?.name ?? "Pelileo" });
  }
  return list.sort((a, b) => a.date.getTime() - b.date.getTime() || a.ev.start.localeCompare(b.ev.start));
}

/** Eventos con fecha real calculada en el cliente (null mientras hidrata). */
export function useDatedEvents(): DatedEvent[] | null {
  const now = useNow();
  const published = useApp((s) => s.published);
  return useMemo(() => (now ? datedEvents(now, published) : null), [now, published]);
}

export type EventGroup = "hoy" | "finde" | "semana" | "proximas";
export const GROUP_LABEL: Record<EventGroup, string> = {
  hoy: "Hoy",
  finde: "Este fin de semana",
  semana: "Esta semana",
  proximas: "Próximas semanas",
};

export function groupOf(d: DatedEvent): EventGroup {
  if (d.diff === 0) return "hoy";
  const wd = d.date.getDay();
  if (d.diff <= 6 && (wd === 0 || wd === 6)) return "finde";
  if (d.diff <= 6) return "semana";
  return "proximas";
}
