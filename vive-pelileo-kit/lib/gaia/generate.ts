import type { Category, Itinerary, Place, Tag, Weekday } from "@/data/types";
import { PLACES } from "@/lib/data";
import { WEEKDAY_LABEL } from "@/lib/time";
import {
  ACTIVITY_CATS,
  allowedForGroup,
  candidatesFor,
  fitsHours,
  fromMin,
  HOTEL_BREAKFAST,
  HOTEL_DINNER,
  noteFor,
  roundUp5,
  scorePlace,
  stepCost,
  titleFor,
  travelInfo,
  visitMinutes,
  type Ctx,
} from "./core";
import type { GaiaItinerary, ParsedRequest, Slot } from "./types";
import { weatherFor } from "./weather";
import { hash } from "./text";

const ORDER: Weekday[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
export function nextDays(start: Weekday, n: number): Weekday[] {
  const i = ORDER.indexOf(start);
  return Array.from({ length: n }, (_, k) => ORDER[(i + k) % 7]);
}

type PlanStep = {
  slot: Slot;
  place: Place;
  start: number;
  minutes: number;
  cost: number;
  optional?: boolean;
  firstNight?: boolean;
};

type PlanDay = { weekday: Weekday; steps: PlanStep[] };

function slotsFor(dayIdx: number, totalDays: number, half: boolean, ctx: Ctx, hasHotel: boolean): [Slot, number, boolean?][] {
  if (half) {
    return [
      ["manana", 600],
      ["medio", 705],
      ["almuerzo", 780],
    ];
  }
  const last = dayIdx === totalDays - 1;
  const s: [Slot, number, boolean?][] = [
    ["desayuno", dayIdx > 0 && hasHotel ? 480 : 510],
    ["manana", 600],
    ["almuerzo", 780],
    ["tarde", 900],
    ["atardecer", 1050, true],
  ];
  if (!last && hasHotel) s.push(["hotel", 1110]);
  s.push(["cena", 1170]);
  if (ctx.wantsNight && ctx.group.kids === 0) s.push(["noche", 1260, true]);
  return s;
}

function pickHotel(ctx: Ctx, budget: number, nights: number): Place | undefined {
  const perPersonDay = budget / Math.max(1, ctx.group.adults + ctx.group.kids) / Math.max(1, nights + 1);
  const hotels = PLACES.filter((p) => p.category === "dormir" && allowedForGroup(p, ctx, "hotel"));
  let best: Place | undefined;
  let bestScore = -Infinity;
  for (const h of hotels) {
    let s = scorePlace(h, ctx, undefined, [], []);
    const cost = stepCost(h, ctx.group, "hotel");
    if (perPersonDay < 45) s -= cost / 10;
    if (cost * nights > budget * 0.55) s -= 6;
    if (s > bestScore) {
      bestScore = s;
      best = h;
    }
  }
  return best;
}

/** Re-ordena tiempos con los traslados reales; elimina lo que deje de entrar en horario. */
function reflow(day: PlanDay) {
  let prev: Place | undefined;
  let prevEnd = 0;
  const out: PlanStep[] = [];
  for (const st of day.steps) {
    const tr = travelInfo(prev, st.place);
    const minStart = prevEnd + (tr.minutes ?? 0);
    let start = st.start;
    if (start < minStart) start = roundUp5(minStart);
    if (st.place.category !== "dormir" && !fitsHours(st.place, day.weekday, start, st.minutes)) continue;
    if (start > 23 * 60) continue;
    out.push({ ...st, start });
    prev = st.place;
    prevEnd = start + st.minutes;
  }
  day.steps = out;
}

function totalOf(days: PlanDay[]) {
  return days.reduce((a, d) => a + d.steps.reduce((b, s) => b + s.cost, 0), 0);
}

function usedSet(days: PlanDay[], except?: PlanStep) {
  const s = new Set<string>();
  for (const d of days) for (const st of d.steps) if (st !== except && st.place.category !== "dormir") s.add(st.place.id);
  return s;
}

function cheaperAlternative(days: PlanDay[], d: PlanDay, st: PlanStep, ctx: Ctx): { place: Place; cost: number } | null {
  if (st.place.category === "dormir" && st.slot !== "hotel") return null;
  const used = usedSet(days, st);
  let best: { place: Place; cost: number } | null = null;
  const idx = d.steps.indexOf(st);
  const prev = idx > 0 ? d.steps[idx - 1].place : undefined;
  for (const p of PLACES) {
    if (p.id === st.place.id || used.has(p.id)) continue;
    if (p.category === "dormir" && st.slot !== "hotel") continue;
    if (st.slot === "hotel") {
      if (p.category !== "dormir" || !allowedForGroup(p, ctx, "hotel")) continue;
    } else {
      const cands = candidatesFor(st.slot, d.weekday, st.start, 0, prev, ctx, used);
      if (!cands.some((c) => c.place.id === p.id)) continue;
    }
    const cost = stepCost(p, ctx.group, st.slot);
    if (cost >= st.cost) continue;
    if (!best || cost < best.cost) best = { place: p, cost };
  }
  return best;
}

function replaceHotel(days: PlanDay[], oldHotel: Place, newHotel: Place, ctx: Ctx) {
  for (const d of days) {
    d.steps = d.steps.filter((st) => {
      if (st.place.id !== oldHotel.id) return true;
      if (st.slot === "cena" && !(newHotel.id in HOTEL_DINNER)) return false;
      st.place = newHotel;
      st.cost = stepCost(newHotel, ctx.group, st.slot);
      return true;
    });
  }
}

function fitBudget(days: PlanDay[], budget: number, ctx: Ctx): boolean {
  let tight = false;
  for (let guard = 0; guard < 80 && totalOf(days) > budget; guard++) {
    // 1) reemplazar el paso con mayor ahorro posible
    let best: { d: PlanDay; st: PlanStep; alt: { place: Place; cost: number }; saving: number } | null = null;
    for (const d of days) {
      for (const st of d.steps) {
        if (st.cost <= 0) continue;
        const alt = cheaperAlternative(days, d, st, ctx);
        if (!alt) continue;
        const saving = st.cost - alt.cost;
        if (!best || saving > best.saving) best = { d, st, alt, saving };
      }
    }
    if (best) {
      if (best.st.slot === "hotel") replaceHotel(days, best.st.place, best.alt.place, ctx);
      else {
        best.st.place = best.alt.place;
        best.st.cost = best.alt.cost;
        best.st.minutes = visitMinutes(best.alt.place, best.st.slot);
      }
      days.forEach(reflow);
      continue;
    }
    // 2) quitar opcionales con costo
    const optional = days.flatMap((d) => d.steps.filter((s) => s.optional && s.cost > 0).map((s) => ({ d, s })));
    if (optional.length) {
      const { d, s } = optional.sort((a, b) => b.s.cost - a.s.cost)[0];
      d.steps = d.steps.filter((x) => x !== s);
      continue;
    }
    // 3) presupuesto muy ajustado: quitar el paso pagado más caro
    tight = true;
    const paid = days.flatMap((d) => d.steps.filter((s) => s.cost > 0).map((s) => ({ d, s })));
    if (!paid.length) break;
    const { d, s } = paid.sort((a, b) => b.s.cost - a.s.cost)[0];
    if (s.slot === "hotel") {
      for (const dd of days) dd.steps = dd.steps.filter((x) => x.place.id !== s.place.id);
    } else d.steps = d.steps.filter((x) => x !== s);
  }
  days.forEach(reflow);
  return tight;
}

export type GenerateOutput = { itinerary: GaiaItinerary; tight: boolean; hotel?: Place };

export function generateItinerary(req: ParsedRequest, input: string, forced: string[] = []): GenerateOutput {
  const groupTag: Tag = req.groupType === "solo" ? "solo" : req.groupType;
  const ctx: Ctx = {
    group: { type: req.groupType, adults: req.adults, kids: req.kids },
    tags: [...new Set<Tag>([groupTag, ...req.tags])],
    exclude: req.exclude,
    forced,
    wantsNight: req.wantsNight,
  };
  const half = req.days < 1;
  const n = Math.max(1, Math.ceil(req.days));
  const weekdays = nextDays(req.startDay, n);
  const hotel = n > 1 ? pickHotel(ctx, req.budget, n - 1) : undefined;
  const used = new Set<string>();
  const days: PlanDay[] = [];

  weekdays.forEach((wd, dayIdx) => {
    const day: PlanDay = { weekday: wd, steps: [] };
    const usedCats: Category[] = [];
    const usedPlaces: Place[] = [];
    let prev: Place | undefined = dayIdx > 0 ? hotel : undefined;
    let prevEnd = 0;
    const last = dayIdx === n - 1;

    for (const [slot, slotTime, optional] of slotsFor(dayIdx, n, half, ctx, !!hotel)) {
      if (prevEnd > 21 * 60 + 30) break;
      // desayuno en el hotel (días 2+)
      if (slot === "desayuno" && dayIdx > 0 && hotel && HOTEL_BREAKFAST.has(hotel.id)) {
        day.steps.push({ slot, place: hotel, start: slotTime, minutes: 45, cost: stepCost(hotel, ctx.group, "desayuno") });
        prev = hotel;
        prevEnd = slotTime + 45;
        continue;
      }
      if (slot === "hotel" && hotel) {
        const tr = travelInfo(prev, hotel);
        const start = roundUp5(Math.max(slotTime, prevEnd + (tr.minutes ?? 0)));
        day.steps.push({
          slot,
          place: hotel,
          start,
          minutes: 45,
          cost: stepCost(hotel, ctx.group, "hotel"),
          firstNight: dayIdx === 0,
        });
        prev = hotel;
        prevEnd = start + 45;
        continue;
      }
      if (optional && slot === "atardecer" && prevEnd > 17 * 60 + 15) continue;

      let cands = candidatesFor(slot, wd, slotTime, prevEnd, prev, ctx, used);
      if (slot === "cena") {
        // cena: en el hotel si se quedan; si no, bares sin niños o una cena temprana
        cands = cands.filter((c) => c.place.category !== "dormir" || (hotel && c.place.id === hotel.id && !last));
        if (!cands.length) cands = candidatesFor("cena", wd, 1080, prevEnd, prev, ctx, used).filter((c) => c.place.category === "comer");
      }
      if (!cands.length) continue;
      let best = cands[0];
      let bestScore = -Infinity;
      for (const c of cands) {
        let s = scorePlace(c.place, ctx, prev, usedCats, usedPlaces);
        if (hotel && c.place.id === hotel.id) s += 4;
        if (slot === "atardecer" && c.place.tags.includes("foto")) s += 1.5;
        if (slot === "medio" && c.place.category === "comer") s -= 1;
        // presupuesto: castiga lo caro cuando el presupuesto por persona es bajo
        const pp = req.budget / Math.max(1, ctx.group.adults + ctx.group.kids) / Math.max(0.5, req.days);
        if (pp < 50) s -= stepCost(c.place, ctx.group, slot) / Math.max(10, pp / 2);
        if (s > bestScore) {
          bestScore = s;
          best = c;
        }
      }
      const minutes = visitMinutes(best.place, slot);
      day.steps.push({
        slot,
        place: best.place,
        start: best.start,
        minutes,
        cost: stepCost(best.place, ctx.group, slot),
        optional: !!optional,
      });
      if (best.place.category !== "dormir") used.add(best.place.id);
      usedCats.push(best.place.category);
      usedPlaces.push(best.place);
      prev = best.place;
      prevEnd = best.start + minutes;
    }
    days.push(day);
  });

  // Asegura al menos una actividad por día (si el presupuesto o los horarios dejaron uno vacío)
  const tight = fitBudget(days, req.budget, ctx);
  days.forEach(reflow);
  for (const d of days) {
    if (d.steps.length > 0) continue;
    const free = PLACES.filter(
      (p) => ACTIVITY_CATS.includes(p.category) && p.priceFrom === 0 && allowedForGroup(p, ctx, "manana") && fitsHours(p, d.weekday, 600, p.durationMin) && !usedSet(days).has(p.id),
    )[0];
    if (free) d.steps.push({ slot: "manana", place: free, start: 600, minutes: free.durationMin, cost: 0 });
  }

  const total = totalOf(days);
  const itinerary: GaiaItinerary = {
    id: `it-${hash(input + JSON.stringify(req))}`,
    title: titleForPlan(req),
    summary: "",
    group: ctx.group,
    budget: req.budget,
    days: days.map((d) => {
      let prev: Place | undefined;
      return {
        label: WEEKDAY_LABEL[d.weekday],
        weekday: d.weekday,
        weather: weatherFor(d.weekday),
        steps: d.steps.map((st) => {
          const tr = travelInfo(prev, st.place);
          prev = st.place;
          return {
            time: fromMin(st.start),
            placeId: st.place.id,
            title: titleFor(st.place, st.slot, st.firstNight !== false),
            durationMin: st.minutes,
            cost: st.cost,
            note: noteFor(st.place, st.slot, ctx, d.weekday, tr.minutes, st.cost, req.budget - total),
            ...(tr.minutes != null ? { travelFromPrevMin: tr.minutes, travelMode: tr.mode } : {}),
            ...(st.optional ? { optional: true } : {}),
          };
        }),
      };
    }),
    meta: {
      tags: req.tags,
      exclude: req.exclude,
      wantsNight: req.wantsNight,
      forced,
      tried: {},
      source: "generated",
      version: 1,
    },
  };
  return { itinerary, tight, hotel };
}

function titleForPlan(req: ParsedRequest): string {
  const when = req.days < 1 ? "Medio día" : req.days === 1 ? "Un día" : req.days === 2 ? "Fin de semana" : `${Math.ceil(req.days)} días`;
  const who =
    req.groupType === "familia" ? "en familia" : req.groupType === "pareja" ? "para dos" : req.groupType === "solo" ? "a tu ritmo" : "con amigos";
  return `${when} ${who} en Pelileo`;
}

export type { Itinerary };
