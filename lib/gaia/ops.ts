import type { Category, Place, Weekday } from "@/data/types";
import { PLACES, getPlace } from "@/lib/data";
import { travelBetween } from "@/lib/geo";
import { WEEKDAY_LABEL } from "@/lib/time";
import {
  ACTIVITY_CATS,
  allowedForGroup,
  cloneItinerary,
  ctxFromItinerary,
  defaultMeta,
  excludedBy,
  fitsHours,
  fromMin,
  HOTEL_BREAKFAST,
  HOTEL_DINNER,
  inferSlot,
  itineraryTotal,
  noteFor,
  recomputeTravel,
  scorePlace,
  slotCats,
  stepCost,
  titleFor,
  toMin,
  visitMinutes,
} from "./core";
import type { GaiaItinerary, Slot } from "./types";
import { weatherFor } from "./weather";

type Alt = { place: Place; start: number; cost: number; minutes: number; score: number };

function stayingHotels(it: GaiaItinerary): Set<string> {
  const s = new Set<string>();
  for (const d of it.days)
    for (const st of d.steps) {
      const p = getPlace(st.placeId);
      if (p?.category === "dormir") s.add(p.id);
    }
  return s;
}

/** Alternativas compatibles para un paso: mismo tipo de parada, abiertas a esa hora, sin repetir lugares. */
export function alternativesFor(
  it: GaiaItinerary,
  d: number,
  s: number,
  opts: { cats?: Category[]; filter?: (p: Place) => boolean; preferCheap?: boolean } = {},
): Alt[] {
  const day = it.days[d];
  const step = day?.steps[s];
  if (!step) return [];
  const cur = getPlace(step.placeId);
  const slot = inferSlot(step, cur);
  const ctx = ctxFromItinerary(it);
  const used = new Set<string>();
  it.days.forEach((dd) => dd.steps.forEach((st) => st !== step && used.add(st.placeId)));
  const hotels = stayingHotels(it);
  const prev = s > 0 ? getPlace(day.steps[s - 1].placeId) : undefined;
  const next = day.steps[s + 1];
  const nextPlace = next ? getPlace(next.placeId) : undefined;
  const start = toMin(step.time);
  const total = itineraryTotal(it);
  const cats = opts.cats ?? (slot === "desayuno" && cur?.category === "dormir" ? ["comer" as Category] : slotCats(slot));
  const needsDinner = slot === "hotel" && it.days.some((dd) => dd.steps.some((st) => st.placeId === cur?.id && inferSlot(st, cur) === "cena"));

  const out: Alt[] = [];
  for (const p of PLACES) {
    if (p.id === step.placeId) continue;
    if (!cats.includes(p.category)) continue;
    if (opts.filter && !opts.filter(p)) continue;
    if (slot === "hotel") {
      if (p.category !== "dormir" || !allowedForGroup(p, ctx, "hotel")) continue;
      if (needsDinner && !(p.id in HOTEL_DINNER)) continue;
    } else {
      if (used.has(p.id) && !(p.category === "dormir" && hotels.has(p.id))) continue;
      if (p.category === "dormir" && !(hotels.has(p.id) && (slot === "cena" ? p.id in HOTEL_DINNER : slot === "desayuno"))) continue;
      if (!allowedForGroup(p, ctx, slot)) continue;
    }
    const minutes = visitMinutes(p, slot);
    if (p.category !== "dormir" && !fitsHours(p, day.weekday, start, minutes)) continue;
    // debe alcanzar a llegar a la siguiente parada
    if (next && nextPlace && nextPlace.id !== p.id) {
      const tr = travelBetween(p, nextPlace);
      if (start + minutes + tr.minutes > toMin(next.time) + 20) continue;
    }
    const cost = stepCost(p, it.group, slot);
    let score = scorePlace(p, ctx, prev, [], it.days.flatMap((dd) => dd.steps.map((x) => getPlace(x.placeId)!).filter(Boolean)));
    score -= Math.abs(cost - step.cost) / 15;
    if (total - step.cost + cost > it.budget) score -= 6;
    if (opts.preferCheap) score -= cost / 4;
    out.push({ place: p, start, cost, minutes, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

function applyAlt(it: GaiaItinerary, d: number, s: number, alt: Alt): GaiaItinerary {
  const out = cloneItinerary(it);
  out.meta = out.meta ?? defaultMeta("scenario");
  const day = out.days[d];
  const step = day.steps[s];
  const cur = getPlace(step.placeId);
  const slot = inferSlot(step, cur);
  const ctx = ctxFromItinerary(out);
  if (slot === "hotel" && cur) {
    // cambia el hotel en todo el plan (desayuno y cena incluidos)
    for (const dd of out.days) {
      for (const st of dd.steps) {
        if (st.placeId !== cur.id) continue;
        const sl = inferSlot(st, cur);
        st.placeId = alt.place.id;
        st.cost = stepCost(alt.place, out.group, sl);
        st.title = titleFor(alt.place, sl, !st.title.toLowerCase().includes("otra noche"));
        st.note = noteFor(alt.place, sl, ctx, dd.weekday, undefined, st.cost, null);
        if (sl === "desayuno" && !HOTEL_BREAKFAST.has(alt.place.id)) st.title = `Desayuno en ${alt.place.name}`;
      }
    }
  } else {
    const prev = s > 0 ? getPlace(day.steps[s - 1].placeId) : undefined;
    const tr = prev && prev.id !== alt.place.id ? travelBetween(prev, alt.place) : undefined;
    day.steps[s] = {
      time: fromMin(alt.start),
      placeId: alt.place.id,
      title: titleFor(alt.place, slot),
      durationMin: alt.minutes,
      cost: alt.cost,
      note: "",
      ...(step.optional ? { optional: true } : {}),
    };
    const total = itineraryTotal(out);
    day.steps[s].note = noteFor(alt.place, slot, ctx, day.weekday, tr?.minutes, alt.cost, out.budget - total);
  }
  recomputeTravel(out);
  out.meta.version += 1;
  return out;
}

export type SwapResult = { itinerary: GaiaItinerary; from?: Place; to?: Place; changed: boolean };

export function swapStepWithInfo(it: GaiaItinerary, d: number, s: number): SwapResult {
  const step = it.days[d]?.steps[s];
  if (!step) return { itinerary: it, changed: false };
  const key = `${d}:${step.time}`;
  const tried = it.meta?.tried?.[key] ?? [];
  const alts = alternativesFor(it, d, s);
  if (!alts.length) return { itinerary: it, changed: false, from: getPlace(step.placeId) };
  const fresh = alts.filter((a) => !tried.includes(a.place.id));
  const pick = fresh[0] ?? alts[0];
  const out = applyAlt(it, d, s, pick);
  out.meta!.tried = {
    ...(it.meta?.tried ?? {}),
    [key]: fresh.length ? [...tried, step.placeId] : [step.placeId],
  };
  return { itinerary: out, from: getPlace(step.placeId), to: pick.place, changed: true };
}

/** "Cambiar por otra": Gaia propone una alternativa compatible. */
export function swapStep(it: GaiaItinerary, dayIdx: number, stepIdx: number): GaiaItinerary {
  return swapStepWithInfo(it, dayIdx, stepIdx).itinerary;
}

/** "Quitar": elimina el paso y recalcula los traslados. */
export function removeStep(it: GaiaItinerary, dayIdx: number, stepIdx: number): GaiaItinerary {
  const out = cloneItinerary(it);
  const day = out.days[dayIdx];
  if (!day || !day.steps[stepIdx]) return it;
  day.steps.splice(stepIdx, 1);
  if (day.steps.length === 0 && out.days.length > 1) out.days.splice(dayIdx, 1);
  recomputeTravel(out);
  if (out.meta) out.meta.version += 1;
  return out;
}

// ───────────────────────────── Ajustes por conversación

export type AdjustOutcome = { itinerary: GaiaItinerary; reply: string; changed: boolean };

const SLOT_NAME: Record<Slot, string> = {
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

function totalLine(it: GaiaItinerary) {
  const t = itineraryTotal(it);
  return t <= it.budget ? `Ahora gastas $${t} de $${it.budget}.` : `El plan queda en $${t}.`;
}

export function makeCheaper(it: GaiaItinerary): AdjustOutcome {
  let cur = it;
  const start = itineraryTotal(it);
  const changes: { slot: Slot; to: Place; cost: number; saving: number }[] = [];
  for (let round = 0; round < 3; round++) {
    let best: { d: number; s: number; alt: Alt; saving: number } | null = null;
    cur.days.forEach((day, d) =>
      day.steps.forEach((st, s) => {
        if (st.cost <= 0) return;
        const alts = alternativesFor(cur, d, s, { preferCheap: true }).filter((a) => a.cost < st.cost);
        if (!alts.length) return;
        const cheapest = alts.sort((a, b) => a.cost - b.cost || b.score - a.score)[0];
        const saving = st.cost - cheapest.cost;
        if (!best || saving > best.saving) best = { d, s, alt: cheapest, saving };
      }),
    );
    if (!best) break;
    const b = best as { d: number; s: number; alt: Alt; saving: number };
    const step = cur.days[b.d].steps[b.s];
    const slot = inferSlot(step, getPlace(step.placeId));
    cur = applyAlt(cur, b.d, b.s, b.alt);
    changes.push({ slot, to: b.alt.place, cost: b.alt.cost, saving: b.saving });
    if (itineraryTotal(cur) <= start * 0.85) break;
  }
  if (!changes.length) {
    // sin alternativas más baratas: quita un opcional pagado
    const opt = it.days.flatMap((d, di) => d.steps.map((s, si) => ({ s, di, si }))).filter((x) => x.s.cost > 0 && x.s.optional);
    if (opt.length) {
      const o = opt.sort((a, b) => b.s.cost - a.s.cost)[0];
      const out = removeStep(it, o.di, o.si);
      return { itinerary: out, changed: true, reply: `Listo, quité «${o.s.title}» para ahorrar $${o.s.cost}. ${totalLine(out)}` };
    }
    return {
      itinerary: it,
      changed: false,
      reply: "Ya elegí las opciones más económicas que encajan con tus horarios. Si quieres, puedo quitar alguna parada pagada.",
    };
  }
  const first = changes[0];
  const extra = changes.length > 1 ? ` y ajusté ${changes.length - 1 === 1 ? "otra parada" : `${changes.length - 1} paradas más`}` : "";
  return {
    itinerary: cur,
    changed: true,
    reply: `Listo, cambié ${SLOT_NAME[first.slot]} por ${first.to.name}, una opción de $${first.cost}${extra}. ${totalLine(cur)}`,
  };
}

export function withoutTerm(it: GaiaItinerary, term: string): AdjustOutcome {
  let cur = cloneItinerary(it);
  cur.meta = cur.meta ?? defaultMeta("scenario");
  cur.meta.exclude = [...new Set([...(cur.meta.exclude ?? []), term])];
  const hits: { d: number; s: number }[] = [];
  cur.days.forEach((day, d) =>
    day.steps.forEach((st, s) => {
      const p = getPlace(st.placeId);
      if (!p) return;
      const text = `${st.title} ${st.note}`.toLowerCase();
      if (excludedBy(p, [term]) || text.normalize("NFD").replace(/[̀-ͯ]/g, "").includes(term)) hits.push({ d, s });
    }),
  );
  if (!hits.length) {
    return { itinerary: cur, changed: false, reply: `Tu plan no incluye ${term}, así que no tuve que cambiar nada.` };
  }
  const swapped: string[] = [];
  const removed: string[] = [];
  // de atrás hacia adelante para no mover índices
  for (const h of [...hits].reverse()) {
    const alts = alternativesFor(cur, h.d, h.s, { filter: (p) => !excludedBy(p, [term]) });
    const old = cur.days[h.d].steps[h.s];
    if (alts.length && getPlace(old.placeId)?.category !== "dormir") {
      cur = applyAlt(cur, h.d, h.s, alts[0]);
      swapped.push(alts[0].place.name);
    } else {
      removed.push(old.title);
      cur = removeStep(cur, h.d, h.s);
    }
  }
  const parts: string[] = [];
  if (swapped.length) parts.push(`puse ${swapped.reverse().join(" y ")} en su lugar`);
  if (removed.length) parts.push(`quité ${removed.map((r) => `«${r}»`).join(" y ")}`);
  return { itinerary: cur, changed: true, reply: `Listo, nada de ${term}: ${parts.join(" y ")}. ${totalLine(cur)}` };
}

export function moreOf(it: GaiaItinerary, kind: "aventura" | "relax" | "cultura"): AdjustOutcome {
  const ctx = ctxFromItinerary(it);
  const wanted: Category[] = kind === "aventura" ? ["aventura", "naturaleza", "experiencia"] : kind === "relax" ? ["naturaleza", "cultura"] : ["cultura", "experiencia"];
  const tagOk = (p: Place) =>
    kind === "aventura" ? p.tags.includes("aventura") : kind === "relax" ? p.tags.includes("relax") || p.tags.includes("naturaleza") : p.tags.includes("cultura");
  for (let d = 0; d < it.days.length; d++) {
    const steps = it.days[d].steps;
    for (let s = 0; s < steps.length; s++) {
      const p = getPlace(steps[s].placeId);
      if (!p || !ACTIVITY_CATS.includes(p.category) || tagOk(p)) continue;
      const total = itineraryTotal(it);
      const alts = alternativesFor(it, d, s, { cats: wanted, filter: tagOk }).filter(
        (a) => total - steps[s].cost + a.cost <= Math.max(it.budget, total),
      );
      if (!alts.length) continue;
      const out = applyAlt(it, d, s, alts[0]);
      out.meta!.tags = [...new Set([...(out.meta!.tags ?? []), kind === "aventura" ? "aventura" : kind === "relax" ? "relax" : "cultura"])] as typeof ctx.tags;
      return {
        itinerary: out,
        changed: true,
        reply: `Listo, cambié ${p.name} por ${alts[0].place.name}${kind === "aventura" ? " para sumar algo de aventura" : kind === "relax" ? " para bajar el ritmo" : " para sumar cultura local"}. ${totalLine(out)}`,
      };
    }
  }
  return {
    itinerary: it,
    changed: false,
    reply:
      kind === "aventura"
        ? ctx.group.kids > 0
          ? "Con niños mantuve opciones seguras; la cabalgata a Teligote es lo más aventurero que les recomiendo."
          : "Tu plan ya tiene lo más aventurero que encaja con tus horarios."
        : "Tu plan ya va en esa línea. Si quieres, quito alguna parada para tener más tiempo libre.",
  };
}

export function addNight(it: GaiaItinerary): AdjustOutcome {
  const ctx = ctxFromItinerary(it);
  const out = cloneItinerary(it);
  out.meta = out.meta ?? defaultMeta("scenario");
  out.meta.wantsNight = true;
  const used = new Set(out.days.flatMap((d) => d.steps.map((s) => s.placeId)));
  // intenta en cada día, del primero al último
  for (const day of out.days) {
    const last = day.steps[day.steps.length - 1];
    const lastPlace = last ? getPlace(last.placeId) : undefined;
    const lastEnd = last ? toMin(last.time) + Math.max(30, last.durationMin) : 19 * 60;
    const base = Math.max(19 * 60 + 30, Math.ceil(lastEnd / 15) * 15);
    if (base > 22 * 60) continue;
    const options: { p: Place; start: number; title: string; cost: number; note: string }[] = [];
    if (ctx.group.kids === 0) {
      for (const p of PLACES.filter((x) => x.category === "beber" && !used.has(x.id) && !excludedBy(x, ctx.exclude))) {
        const start = Math.max(base, toMin(p.hours.open));
        if (fitsHours(p, day.weekday, start, 90))
          options.push({ p, start, title: `Cierre en ${p.name}`, cost: stepCost(p, it.group, "noche"), note: `${p.short}.` });
      }
    }
    const parque = getPlace("parque-central")!;
    if (day.weekday === "sab" && base <= 21 * 60) {
      options.push({
        p: parque,
        start: Math.max(base, 19 * 60 + 30),
        title: "Noche de música andina en el parque",
        cost: 0,
        note: "Los sábados hay bandas locales y canelazo para el frío. Es gratis.",
      });
    }
    if (!used.has(parque.id) && fitsHours(parque, day.weekday, base, 45)) {
      options.push({ p: parque, start: base, title: "Paseo nocturno por el Parque Central", cost: 0, note: "La plaza se ilumina de noche y hay helados y vida local hasta las 22:00." });
    }
    if (!options.length) continue;
    // sin niños: prioriza bares; con niños: la música en el parque
    const pick = options.sort((a, b) => (ctx.group.kids === 0 ? b.cost - a.cost : a.cost - b.cost))[0];
    const tr = lastPlace && lastPlace.id !== pick.p.id ? travelBetween(lastPlace, pick.p) : undefined;
    day.steps.push({
      time: fromMin(Math.ceil(pick.start / 5) * 5),
      placeId: pick.p.id,
      title: pick.title,
      durationMin: pick.p.category === "beber" ? 90 : 60,
      cost: pick.cost,
      note: pick.note,
      ...(tr ? { travelFromPrevMin: tr.minutes, travelMode: tr.mode } : {}),
    });
    recomputeTravel(out);
    out.meta.version += 1;
    return {
      itinerary: out,
      changed: true,
      reply: `Listo, agregué «${pick.title}» el ${day.label.toLowerCase()} a las ${fromMin(Math.ceil(pick.start / 5) * 5)}${pick.cost ? ` ($${pick.cost})` : ", es gratis"}. ${totalLine(out)}`,
    };
  }
  return { itinerary: it, changed: false, reply: "Tu plan ya termina tarde y no encontré nada abierto después. Si quieres, quito la última parada para hacer espacio." };
}

const SHIFT: Record<Weekday, Weekday> = { lun: "mar", mar: "mie", mie: "jue", jue: "vie", vie: "sab", sab: "dom", dom: "sab" };

export function changeDay(it: GaiaItinerary, target?: Weekday): AdjustOutcome {
  let out = cloneItinerary(it);
  out.meta = out.meta ?? defaultMeta("scenario");
  const firstNew = target ?? SHIFT[out.days[0].weekday];
  const order: Weekday[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
  const i0 = order.indexOf(firstNew);
  out.days.forEach((d, i) => {
    const wd = order[(i0 + i) % 7];
    d.weekday = wd;
    d.label = WEEKDAY_LABEL[wd];
    d.weather = weatherFor(wd);
  });
  const fixes: string[] = [];
  for (let d = 0; d < out.days.length; d++) {
    for (let s = out.days[d].steps.length - 1; s >= 0; s--) {
      const st = out.days[d].steps[s];
      const p = getPlace(st.placeId);
      if (!p || p.category === "dormir") continue;
      if (fitsHours(p, out.days[d].weekday, toMin(st.time), Math.min(st.durationMin, 60))) continue;
      const alts = alternativesFor(out, d, s);
      if (alts.length) {
        fixes.push(`${p.name} por ${alts[0].place.name}`);
        out = applyAlt(out, d, s, alts[0]);
      } else {
        fixes.push(`quité ${p.name}`);
        out = removeStep(out, d, s);
      }
    }
  }
  recomputeTravel(out);
  const label = out.days.map((d) => d.label.toLowerCase()).join(" y ");
  return {
    itinerary: out,
    changed: true,
    reply: `Listo, moví el plan al ${label}.${fixes.length ? ` Cambié ${fixes.slice(0, 2).join(" y ")} porque no abre ese día.` : " Todo abre ese día, así que no tuve que cambiar paradas."}`,
  };
}
