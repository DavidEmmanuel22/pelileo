import type { EventItem, Hours, Weekday } from "@/data/types";

export const WEEKDAYS: Weekday[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"]; // índice = Date.getDay()
export const WEEKDAY_LABEL: Record<Weekday, string> = {
  lun: "Lunes",
  mar: "Martes",
  mie: "Miércoles",
  jue: "Jueves",
  vie: "Viernes",
  sab: "Sábado",
  dom: "Domingo",
};
export const WEEKDAY_SHORT: Record<Weekday, string> = {
  lun: "lun",
  mar: "mar",
  mie: "mié",
  jue: "jue",
  vie: "vie",
  sab: "sáb",
  dom: "dom",
};
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}
export function fromMin(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
export function weekdayOf(d: Date): Weekday {
  return WEEKDAYS[d.getDay()];
}

export function isOpenAt(hours: Hours, day: Weekday, minute: number): boolean {
  if (!hours.days.includes(day)) return false;
  return minute >= toMin(hours.open) && minute < toMin(hours.close);
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Estado de horario para el detalle ("Abierto ahora · Cierra a las 18:00"). */
export function openStatus(hours: Hours, now: Date): { open: boolean; label: string } {
  const day = weekdayOf(now);
  const minute = now.getHours() * 60 + now.getMinutes();
  const allDay = hours.open === "00:00" && hours.close >= "23:59";
  if (allDay && hours.days.includes(day)) return { open: true, label: "Abierto las 24 horas" };
  if (isOpenAt(hours, day, minute)) {
    return { open: true, label: `Cierra a las ${hours.close === "23:59" ? "00:00" : hours.close}` };
  }
  for (let i = 0; i < 8; i++) {
    const d = WEEKDAYS[(now.getDay() + i) % 7];
    if (!hours.days.includes(d)) continue;
    if (i === 0) {
      if (minute < toMin(hours.open)) return { open: false, label: `Abre hoy a las ${hours.open}` };
      continue;
    }
    if (i === 1) return { open: false, label: `Abre mañana a las ${hours.open}` };
    return { open: false, label: `Abre el ${WEEKDAY_LABEL[d].toLowerCase()} a las ${hours.open}` };
  }
  return { open: false, label: "Cerrado" };
}

export function hoursSummary(hours: Hours): string {
  const all: Weekday[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
  const days = all.filter((d) => hours.days.includes(d));
  let dayLabel: string;
  if (days.length === 7) dayLabel = "Todos los días";
  else {
    const idx = days.map((d) => all.indexOf(d));
    const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
    dayLabel =
      contiguous && days.length > 2
        ? `${cap(WEEKDAY_SHORT[days[0]])} a ${WEEKDAY_SHORT[days[days.length - 1]]}`
        : days.map((d, i) => (i === 0 ? cap(WEEKDAY_SHORT[d]) : WEEKDAY_SHORT[d])).join(", ");
  }
  if (hours.open === "00:00" && hours.close >= "23:59") return `${dayLabel} · 24 horas`;
  return `${dayLabel} · ${hours.open}–${hours.close === "23:59" ? "00:00" : hours.close}`;
}

/** Fecha real de un evento: el próximo <weekday> de esta semana + weeksAhead. */
export function eventDate(ev: Pick<EventItem, "weekday" | "weeksAhead" | "end">, now: Date): Date {
  const target = WEEKDAYS.indexOf(ev.weekday);
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let diff = (target - d.getDay() + 7) % 7;
  if (diff === 0 && now.getHours() * 60 + now.getMinutes() > toMin(ev.end)) diff = 7;
  d.setDate(d.getDate() + diff + ev.weeksAhead * 7);
  return d;
}

export function dayDiff(a: Date, b: Date): number {
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((db - da) / 86400000);
}

export function formatShortDate(d: Date): string {
  return `${WEEKDAY_SHORT[weekdayOf(d)]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
export function formatLongDate(d: Date): string {
  return `${WEEKDAY_LABEL[weekdayOf(d)]} ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]}`;
}
export function monthShort(d: Date): string {
  return MONTHS[d.getMonth()];
}

export function durationLabel(min: number): string {
  if (min <= 0) return "";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
