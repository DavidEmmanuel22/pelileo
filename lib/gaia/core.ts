import type { Category, Itinerary, ItineraryStep, Place, Tag, Weekday } from "@/data/types";
import { PLACES, getPlace } from "@/lib/data";
import { haversineKm, travelBetween } from "@/lib/geo";
import { fromMin, toMin } from "@/lib/time";
import type { GaiaItinerary, GaiaMeta, Slot } from "./types";
import { normalize } from "./text";

type Group = Itinerary["group"];

/** Hoteles con cena / desayuno (contenido de demo, coherente con las descripciones). */
export const HOTEL_DINNER: Record<string, number> = { "h-hosteria": 10, "h-telar": 6, "h-glamping": 12 };
export const HOTEL_BREAKFAST = new Set(["h-hosteria", "h-telar", "h-glamping"]);

export const ACTIVITY_CATS: Category[] = ["aventura", "cultura", "compras", "naturaleza", "experiencia"];

const SLOT_CATS: Record<Slot, Category[]> = {
  desayuno: ["comer"],
  manana: ACTIVITY_CATS,
  medio: [...ACTIVITY_CATS, "comer"],
  almuerzo: ["comer"],
  tarde: ACTIVITY_CATS,
  atardecer: ["naturaleza", "cultura"],
  hotel: ["dormir"],
  cena: ["comer", "beber", "dormir"],
  noche: ["beber", "cultura"],
};

export const SLOT_LABEL: Record<Slot, string> = {
  desayuno: "el desayuno",
  manana: "la actividad de la mañana",
  medio: "la pausa",
  almuerzo: "el almuerzo",
  tarde: "la actividad de la tarde",
  atardecer: "el atardecer",
  hotel: "el hospedaje",
  cena: "la cena",
  noche: "el plan de noche",
};

export function people(g: Group) {
  return g.adults + g.kids;
}

/** Costo del paso para el grupo (BRIEF §5). */
export function stepCost(place: Place, group: Group, slot?: Slot): number {
  if (place.category === "dormir") {
    if (slot === "desayuno") return HOTEL_BREAKFAST.has(place.id) ? 0 : 6 * people(group);
    if (slot === "cena") {
      const pp = HOTEL_DINNER[place.id] ?? 10;
      return Math.round(pp * group.adults + pp * 0.6 * group.kids);
    }
    return Math.round(place.priceFrom * Math.ceil(people(group) / 4));
  }
  if (place.priceUnit === "gratis" || place.priceFrom === 0) return 0;
  if (place.priceUnit === "entrada")
    return Math.round(group.adults * place.priceFrom + group.kids * place.priceFrom * 0.5);
  if (place.priceUnit === "grupo") return Math.round(place.priceFrom);
  // comer / beber / experiencia por persona
  return Math.round(place.priceFrom * group.adults + place.priceFrom * 0.6 * group.kids);
}

export function itineraryTotal(it: Itinerary): number {
  return it.days.reduce((a, d) => a + d.steps.reduce((b, s) => b + (Number.isFinite(s.cost) ? s.cost : 0), 0), 0);
}

/** Infiero el "slot" de un paso a partir del lugar y la hora (sirve también para los escenarios guionizados). */
export function inferSlot(step: ItineraryStep, place: Place | undefined): Slot {
  const m = toMin(step.time);
  const title = normalize(step.title);
  if (!place) return "manana";
  if (place.category === "dormir") {
    if (title.includes("desayuno")) return "desayuno";
    if (title.includes("cena")) return "cena";
    return "hotel";
  }
  if (place.category === "beber") return m >= 19 * 60 + 30 ? "noche" : "cena";
  if (place.category === "comer") {
    if (title.includes("desayuno") || m < 10 * 60 + 30) return "desayuno";
    if (title.includes("cena") || m >= 17 * 60 + 30) return "cena";
    if (title.includes("almuerzo") || title.includes("empanadas") || (m >= 12 * 60 && m < 16 * 60)) return "almuerzo";
    return "medio";
  }
  if (m >= 17 * 60) return "atardecer";
  if (m >= 14 * 60) return "tarde";
  return "manana";
}

export function visitMinutes(place: Place, slot: Slot): number {
  if (place.category === "dormir") return slot === "desayuno" ? 45 : slot === "cena" ? 75 : 45;
  if (slot === "noche") return 90;
  return Math.max(30, place.durationMin || 60);
}

/** ¿Está abierto y alcanza a terminar antes del cierre? */
export function fitsHours(place: Place, day: Weekday, start: number, minutes: number): boolean {
  if (!place.hours.days.includes(day)) return false;
  const o = toMin(place.hours.open);
  const c = toMin(place.hours.close);
  if (place.category === "dormir") return true;
  return start >= o && start + minutes <= c + (c >= 23 * 60 + 59 ? 1 : 0);
}

export function placeText(p: Place): string {
  return normalize(`${p.name} ${p.short} ${p.description} ${p.category} ${p.tags.join(" ")}`);
}

const EXCLUDE_SYNONYMS: Record<string, (p: Place) => boolean> = {
  alcohol: (p) => p.category === "beber",
  bar: (p) => p.category === "beber",
  bares: (p) => p.category === "beber",
  tragos: (p) => p.category === "beber",
  cerveza: (p) => p.category === "beber",
  carne: (p) => /cuy|hornado|fritada|volquetero/.test(placeText(p)),
  caminar: (p) => p.category === "naturaleza",
  caminata: (p) => p.category === "naturaleza",
  caminatas: (p) => p.category === "naturaleza",
  compras: (p) => p.category === "compras",
  parapente: (p) => /parapente/.test(placeText(p)),
  volar: (p) => /parapente/.test(placeText(p)),
  alturas: (p) => /parapente|mirador/.test(placeText(p)),
  pescado: (p) => /trucha/.test(placeText(p)),
};

export function excludedBy(p: Place, terms: string[]): boolean {
  for (const raw of terms) {
    const t = normalize(raw);
    if (!t) continue;
    const syn = EXCLUDE_SYNONYMS[t];
    if (syn?.(p)) return true;
    const stem = t.length > 4 ? t.replace(/(es|s)$/, "") : t;
    if (new RegExp(`(^|[^a-z])${stem}`).test(placeText(p))) return true;
  }
  return false;
}

export type Ctx = {
  group: Group;
  tags: Tag[];
  exclude: string[];
  forced: string[];
  wantsNight: boolean;
};

export function ctxFromItinerary(it: GaiaItinerary): Ctx {
  const meta = it.meta;
  const base: Tag[] = [it.group.type === "solo" ? "solo" : it.group.type];
  if (it.group.kids > 0) base.push("ninos");
  return {
    group: it.group,
    tags: [...new Set([...base, ...(meta?.tags ?? [])])],
    exclude: meta?.exclude ?? [],
    forced: meta?.forced ?? [],
    wantsNight: meta?.wantsNight ?? false,
  };
}

export function allowedForGroup(p: Place, ctx: Ctx, slot: Slot): boolean {
  if (excludedBy(p, ctx.exclude)) return false;
  if (ctx.group.kids > 0) {
    if (p.category === "beber") return false;
    if (slot !== "hotel" && p.category !== "dormir" && !p.tags.includes("familia") && !p.tags.includes("ninos"))
      return false;
    if (p.category === "dormir" && !p.tags.includes("familia")) return false;
  }
  if (slot === "noche" && p.category === "cultura" && p.id !== "parque-central") return false;
  if (slot === "atardecer" && p.priceFrom > 0 && p.category !== "naturaleza") return false;
  return true;
}

export function slotCats(slot: Slot): Category[] {
  return SLOT_CATS[slot];
}

export function scorePlace(
  p: Place,
  ctx: Ctx,
  prev: Place | undefined,
  usedCats: Category[],
  usedPlaces: Place[],
): number {
  const tagMatch = p.tags.filter((t) => ctx.tags.includes(t)).length;
  let s = tagMatch * 3 + (p.featured ? 1 : 0) + (p.rating ?? 4.3);
  if (prev) s -= haversineKm(prev, p) * 0.5;
  if (usedCats.includes(p.category) && ACTIVITY_CATS.includes(p.category)) s -= 2;
  if (usedPlaces.some((u) => u.id !== p.id && u.category !== "dormir" && haversineKm(u, p) < 0.15)) s -= 3;
  if (ctx.forced.includes(p.id)) s += 12;
  return s;
}

export function travelInfo(prev: Place | undefined, p: Place): { minutes?: number; mode?: "auto" | "a pie" } {
  if (!prev || prev.id === p.id) return {};
  const t = travelBetween(prev, p);
  return { minutes: t.minutes, mode: t.mode };
}

export function roundUp5(min: number) {
  return Math.ceil(min / 5) * 5;
}

export function titleFor(p: Place, slot: Slot, isFirstNight = true): string {
  switch (slot) {
    case "desayuno":
      return p.category === "dormir" ? "Desayuno incluido" : `Desayuno en ${p.name}`;
    case "almuerzo":
      return `Almuerzo en ${p.name}`;
    case "cena":
      return p.category === "dormir" ? `Cena en ${shortName(p)}` : p.category === "beber" ? `Cena y tragos en ${p.name}` : `Cena en ${p.name}`;
    case "hotel":
      return isFirstNight ? `Check-in en ${p.name}` : `Otra noche en ${shortName(p)}`;
    case "noche":
      return p.category === "beber" ? `Cierre en ${p.name}` : `Paseo nocturno por el ${p.name.replace(" de Pelileo", "")}`;
    case "medio":
      return p.category === "comer" ? `Pausa en ${p.name}` : p.name;
    default:
      return p.name;
  }
}

function shortName(p: Place) {
  if (p.id === "h-hosteria") return "la hostería";
  if (p.id === "h-telar") return "la Casa del Telar";
  if (p.id === "h-glamping") return "el glamping";
  return p.name;
}

const PLACE_NOTES: Record<string, string> = {
  "e-parapente": "De 10:00 a 12:00 es cuando mejor está el viento. Incluye video del vuelo.",
  "niton-mirador": "Entre 10:00 y 12:00 hay más parapentes en el aire.",
  "las-caras": "Rostros tallados en roca, cascadas y agua termal en las faldas del volcán.",
  "cotalo-cruz": "Si está despejado, el atardecer frente al Tungurahua vale la pena.",
  "tambo-ruta-jean": "Precios de fábrica. Las compras no están incluidas en el presupuesto.",
  "salasaca-plaza-arte": "Tejedores trabajando en vivo y tapices hechos a mano.",
  "e-tejido": "Cada persona se lleva su primera pieza tejida en telar.",
  "r-volquetero": "El plato típico de Pelileo, con porciones generosas.",
  "e-cosecha": "Se llevan su canasta de fruta para el camino de regreso.",
  "parque-central": "El corazón de la ciudad reconstruida después de 1949.",
};

export function noteFor(
  p: Place,
  slot: Slot,
  ctx: Ctx,
  day: Weekday,
  travelMin: number | undefined,
  cost: number,
  budgetLeft: number | null,
): string {
  const reasons: string[] = [];
  if (p.category === "dormir" && slot === "desayuno") return "Ya está pagado con la habitación.";
  if (p.category === "dormir" && slot === "cena") return "Así no tienen que manejar de noche.";
  if (p.category === "dormir" && slot === "hotel")
    return HOTEL_BREAKFAST.has(p.id) ? `${p.short}. Desayuno incluido.` : `${p.short}.`;
  if (slot === "noche" && p.id === "parque-central") return "De noche la plaza se ilumina y hay vida local hasta las 22:00.";
  if (ctx.forced.includes(p.id)) reasons.push("Lo agregaste a tu plan");
  if (PLACE_NOTES[p.id] && !(p.id === "cotalo-cruz" && slot !== "atardecer")) reasons.push(PLACE_NOTES[p.id].replace(/\.$/, ""));
  if (day === "sab" && (p.id === "feria-pelileo" || p.id === "salasaca-llikakama")) reasons.unshift("El sábado es día de feria");
  if (ctx.group.kids > 0 && p.tags.includes("ninos")) reasons.push("Apto para niños");
  else if (ctx.group.type === "familia" && p.featured) reasons.push("Lo más pedido por familias");
  if (day === "dom" && p.hours.days.length < 7 && p.hours.days.includes("dom")) reasons.push("Abre los domingos");
  if (travelMin != null && travelMin <= 5) reasons.push(`Queda a ${travelMin} min del anterior`);
  if (slot === "desayuno" && toMin(p.hours.open) <= 8 * 60) reasons.push("Abre temprano, así arrancan sin apuro");
  if (reasons.length < 2 && cost > 0 && budgetLeft != null && budgetLeft >= 0) reasons.push("Entra en tu presupuesto");
  if (reasons.length === 0) reasons.push(p.short);
  return (reasons.slice(0, 2).join(". ") + ".").replace(/\.\./g, ".");
}

/** Lugares candidatos para un slot a una hora dada. */
export function candidatesFor(
  slot: Slot,
  day: Weekday,
  slotTime: number,
  prevEnd: number,
  prev: Place | undefined,
  ctx: Ctx,
  used: Set<string>,
): { place: Place; start: number; travel: { minutes?: number; mode?: "auto" | "a pie" } }[] {
  const cats = slotCats(slot);
  const out: { place: Place; start: number; travel: { minutes?: number; mode?: "auto" | "a pie" } }[] = [];
  for (const p of PLACES) {
    if (!cats.includes(p.category)) continue;
    if (used.has(p.id)) continue;
    if (!allowedForGroup(p, ctx, slot)) continue;
    if (slot === "cena" && p.category === "dormir" && !(p.id in HOTEL_DINNER)) continue;
    if (slot === "cena" && p.category === "beber" && ctx.group.kids > 0) continue;
    if (slot === "noche" && p.category === "beber" && ctx.group.kids > 0) continue;
    const travel = travelInfo(prev, p);
    const start = roundUp5(Math.max(slotTime, prevEnd + (travel.minutes ?? 0)));
    if (!fitsHours(p, day, start, visitMinutes(p, slot))) continue;
    out.push({ place: p, start, travel });
  }
  return out;
}

export function cloneItinerary<T extends Itinerary>(it: T): T {
  return JSON.parse(JSON.stringify(it)) as T;
}

/** Recalcula traslados entre pasos consecutivos de cada día. */
export function recomputeTravel(it: Itinerary): void {
  for (const day of it.days) {
    let prev: Place | undefined;
    day.steps.forEach((s, i) => {
      const p = getPlace(s.placeId);
      if (i === 0 || !p || !prev || prev.id === p.id) {
        delete s.travelFromPrevMin;
        delete s.travelMode;
      } else {
        const t = travelBetween(prev, p);
        s.travelFromPrevMin = t.minutes;
        s.travelMode = t.mode;
      }
      prev = p ?? prev;
    });
  }
}

export function usedIds(it: Itinerary): Set<string> {
  const s = new Set<string>();
  for (const d of it.days) for (const st of d.steps) s.add(st.placeId);
  return s;
}

export function defaultMeta(source: GaiaMeta["source"], tags: Tag[] = []): GaiaMeta {
  return { tags, exclude: [], wantsNight: false, forced: [], tried: {}, source, version: 1 };
}

export function stepEnd(step: ItineraryStep): number {
  return toMin(step.time) + Math.max(0, step.durationMin);
}

export { fromMin, toMin };
