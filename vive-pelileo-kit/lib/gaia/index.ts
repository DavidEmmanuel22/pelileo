import type { Itinerary, Tag, Weekday } from "@/data/types";
import { PLACES, SCENARIOS, getPlace } from "@/lib/data";
import { WEEKDAY_LABEL } from "@/lib/time";
import { cloneItinerary, defaultMeta, itineraryTotal, people } from "./core";
import { generateItinerary } from "./generate";
import { addNight, addPlace, changeDay, makeCheaper, moreOf, removeStep, swapStepWithInfo, withoutTerm } from "./ops";
import { parseRequest } from "./parse";
import { cap, hasAny, hasWord, normalize } from "./text";
import type { GaiaItinerary, GaiaResult, ParsedRequest } from "./types";

export { itineraryTotal } from "./core";
export { addPlace, removeStep, swapStep, swapStepWithInfo } from "./ops";
export { weatherFor, CONDITION_LABEL } from "./weather";
import { CONDITION_LABEL as COND } from "./weather";
export type { GaiaItinerary, GaiaResult } from "./types";

const SCENARIO_TAGS: Record<string, Tag[]> = {
  "familia-2d": ["familia", "ninos", "cultura", "naturaleza"],
  "pareja-aventura": ["pareja", "aventura", "naturaleza"],
  "compras-medio-dia": ["solo", "compras", "cultura"],
};

export const DEFAULT_SUGGESTIONS = ["Más barato", "Agrega algo de noche", "Más aventura", "Otro día"];

// ───────────────────────────── Fuera de alcance
const OUT_OF_SCOPE: { words: string[]; reply: string }[] = [
  {
    words: ["playa", "playas", "mar", "oceano", "beach", "sea", "ocean", "surf", "surfear", "buceo", "bucear", "snorkel", "malecon", "arena"],
    reply:
      "En Pelileo no hay playa, pero en el Complejo Las Caras, en Cotaló, hay agua termal entre cascadas, a unos 25 minutos del centro. ¿Te armo un plan con eso?",
  },
  {
    words: ["discoteca", "discotecas", "antro", "antros", "club nocturno", "nightclub", "rave", "after party"],
    reply:
      "En Pelileo no hay discotecas grandes, pero La Costura y la Cervecería Cerro Azul tienen buen ambiente de jueves a sábado. ¿Te armo un plan con algo de noche?",
  },
  {
    words: ["casino", "casinos", "apuestas"],
    reply: "En el cantón no hay casinos. Para una noche distinta te recomiendo la Noche de música andina en el parque, los sábados. ¿La agrego a un plan?",
  },
  {
    words: ["centro comercial", "mall", "shopping center", "cine 3d", "multicine"],
    reply:
      "No hay centros comerciales, pero la Ruta del Jean en El Tambo tiene cientos de locales a precio de fábrica. ¿Te armo un recorrido de compras?",
  },
  {
    words: ["nieve", "esquiar", "esqui", "ski", "snowboard"],
    reply:
      "En Pelileo no se esquía, pero desde la Cruz de Cotaló ves el Tungurahua de frente y, con suerte, nevado. ¿Te armo un plan de miradores?",
  },
  {
    words: ["aeropuerto", "vuelo a", "pasajes", "avion"],
    reply:
      "No puedo reservar vuelos, pero sí armarte el plan una vez que llegues: Pelileo queda a 20 minutos de Ambato. ¿Cuántos días tienes?",
  },
];

function outOfScope(t: string): string | null {
  // "mar" solo como palabra suelta y sin hablar de martes
  for (const o of OUT_OF_SCOPE) {
    for (const w of o.words) {
      if (w === "mar" && /\b(martes|mar \d)/.test(t)) continue;
      if (hasWord(t, w)) return o.reply;
    }
  }
  return null;
}

// ───────────────────────────── Escenarios
export function matchScenario(t: string, req: ParsedRequest) {
  for (const sc of SCENARIOS) {
    if (t === normalize(sc.chip) || t === normalize(sc.prompt)) return sc;
  }
  let best: { sc: (typeof SCENARIOS)[number]; hits: number } | null = null;
  for (const sc of SCENARIOS) {
    const hits = new Set(sc.keywords.map(normalize).filter((k) => hasWord(t, k))).size;
    if (hits >= 2 && (!best || hits > best.hits)) best = { sc, hits };
  }
  if (!best) return null;
  const it = best.sc.itinerary;
  // si pidió algo distinto (presupuesto, días o grupo), mejor generar
  if (req.budgetExplicit && Math.abs(req.budget - it.budget) / it.budget > 0.15) return null;
  if (req.daysExplicit && req.days !== (best.sc.id === "compras-medio-dia" ? 0.5 : it.days.length)) return null;
  if (req.groupExplicit && (req.adults !== it.group.adults || req.kids !== it.group.kids)) return null;
  if (req.exclude.length) return null;
  return best.sc;
}

function scenarioItinerary(id: string, it: Itinerary): GaiaItinerary {
  const out = cloneItinerary(it) as GaiaItinerary;
  out.meta = defaultMeta("scenario", SCENARIO_TAGS[id] ?? []);
  return out;
}

// ───────────────────────────── Textos
function daysLabel(n: number) {
  return n < 1 ? "medio día" : n === 1 ? "un día" : n === 2 ? "un fin de semana" : `${Math.ceil(n)} días`;
}
function whoLabel(req: ParsedRequest) {
  if (req.groupType === "familia") return `tu familia (${req.adults} ${req.adults === 1 ? "adulto" : "adultos"} y ${req.kids} ${req.kids === 1 ? "niño" : "niños"})`;
  if (req.groupType === "pareja") return "ustedes dos";
  if (req.groupType === "solo") return "ti";
  return `un grupo de ${req.adults}`;
}
const TAG_LABEL: Partial<Record<Tag, string>> = {
  aventura: "aventura",
  gastronomia: "comida típica",
  cultura: "cultura",
  compras: "compras",
  naturaleza: "naturaleza",
  relax: "descanso",
  foto: "buenas vistas",
};

function joinEs(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function generatedReply(req: ParsedRequest, it: GaiaItinerary, tight: boolean, vague: boolean): string {
  const total = itineraryTotal(it);
  const interests = req.tags.map((t) => TAG_LABEL[t]).filter(Boolean) as string[];
  const parts: string[] = [];
  const focus = interests.length ? `, con foco en ${joinEs(interests)}` : "";
  if (vague) parts.push("No me diste muchos detalles, así que armé un plan clásico para conocer lo mejor de Pelileo.");
  else if (req.daysAsked) parts.push(`Pelileo se disfruta bien en 3 días, así que armé 3 para ${whoLabel(req)}${focus}.`);
  else parts.push(`Armé ${daysLabel(req.days)} para ${whoLabel(req)}${focus}.`);
  const stops = it.days.reduce((a, d) => a + d.steps.length, 0);
  parts.push(`Son ${stops} paradas con traslados cortos y todo abierto a esa hora.`);
  if (tight)
    parts.push(
      `Tu presupuesto de $${req.budget} es ajustado para ${req.adults + req.kids} ${req.adults + req.kids === 1 ? "persona" : "personas"}: priorizé lugares gratuitos y dejé fuera algunas comidas.`,
    );
  else if (total <= req.budget) parts.push(`Gastas $${total} de $${req.budget}.`);
  if (req.exclude.length) parts.push(`Dejé fuera ${joinEs(req.exclude)}.`);
  return parts.join(" ").replace("priorizé", "prioricé");
}

function generatedThinking(req: ParsedRequest, n: number): string[] {
  const who =
    req.kids > 0 ? "Filtrando opciones aptas para niños" : req.groupType === "pareja" ? "Buscando planes para dos" : req.groupType === "solo" ? "Buscando planes para ir a tu ritmo" : "Buscando planes para grupos";
  const days = n < 1 ? "de la mañana" : n === 1 ? "del sábado" : n === 2 ? "del sábado y domingo" : "de viernes a domingo";
  return [
    "Revisando 31 lugares de Pelileo",
    who,
    `Ajustando todo a tu presupuesto de $${req.budget}`,
    `Verificando horarios ${days}`,
    n > 1 ? "Mirando el clima del fin de semana" : "Mirando el clima del día",
  ];
}

// ───────────────────────────── Ajustes
const WEEKDAY_WORDS: [string[], Weekday][] = [
  [["lunes"], "lun"],
  [["martes"], "mar"],
  [["miercoles"], "mie"],
  [["jueves"], "jue"],
  [["viernes"], "vie"],
  [["sabado"], "sab"],
  [["domingo"], "dom"],
];

// ───────────────────────────── Preguntas y pedidos puntuales sobre el plan actual
type Adj = { reply: string; itinerary: GaiaItinerary; thinking: string[] };

function totalLine(it: GaiaItinerary) {
  const t = itineraryTotal(it);
  return t <= it.budget ? `Ahora gastas $${t} de $${it.budget}.` : `El plan queda en $${t}.`;
}
const dayName = (wd: Weekday) => WEEKDAY_LABEL[wd].toLowerCase();

const PLACE_ALIASES: [string[], string][] = [
  [["parapente", "volar", "vuelo"], "e-parapente"],
  [["volcan", "tungurahua"], "niton-mirador"],
  [["cabalgata", "caballo", "caballos"], "e-cabalgata"],
  [["termal", "termales", "termas", "cascada", "cascadas"], "las-caras"],
  [["salasaca", "salasaka"], "salasaca-plaza-arte"],
  [["muebles", "huambalo"], "huambalo-muebles"],
  [["gigantes"], "ruta-gigantes"],
];
const GENERIC = new Set(["pelileo", "plaza", "mercado", "parque", "taller", "complejo", "hotel", "valle", "central", "cerro"]);
const ADD_VERBS = ["agrega", "agregar", "agregame", "suma", "sumar", "sumale", "incluye", "incluir", "anade", "anadir", "pon", "ponme", "quiero ver", "quiero ir", "quiero conocer", "quiero hacer", "llevame", "vamos a", "visitar", "conocer", "ir a"];

/** Lugar que el texto nombra (por alias o por una palabra distintiva de su nombre). */
function namedPlace(t: string): string | null {
  for (const [words, id] of PLACE_ALIASES) if (hasAny(t, words)) return id;
  let best: { id: string; n: number } | null = null;
  for (const p of PLACES) {
    const tokens = normalize(p.name)
      .split(/[^a-z]+/)
      .filter((w) => w.length >= 5 && !GENERIC.has(w));
    const n = tokens.filter((w) => hasWord(t, w)).length;
    if (n && (!best || n > best.n)) best = { id: p.id, n };
  }
  return best?.id ?? null;
}

function infoReply(t: string, ctx: GaiaItinerary): Adj | null {
  const short = t.split(" ").length <= 4;
  if (short && hasAny(t, ["hola", "buenas", "buenos dias", "buenas tardes", "hey", "que tal"])) {
    return {
      itinerary: ctx,
      thinking: ["Leyendo tu mensaje"],
      reply: "¡Hola! Tu plan sigue aquí. Si quieres cambiar algo, pídemelo con tus palabras: «más barato», «cambia el hotel» o «agrega parapente».",
    };
  }
  if (short && hasAny(t, ["gracias", "genial", "perfecto", "excelente", "buenisimo", "me encanta", "chevere", "listo"])) {
    return {
      itinerary: ctx,
      thinking: ["Leyendo tu mensaje"],
      reply: "¡Con gusto! Toca «Guardar plan» para tenerlo a mano o «Compartir» para enviarlo a quien viaja contigo. Que disfrutes Pelileo.",
    };
  }
  if (hasAny(t, ["clima", "que tiempo", "el tiempo", "tiempo hara", "llueve", "lluvia", "llover", "temperatura", "frio", "calor"])) {
    const days = ctx.days.map((d) => `${cap(dayName(d.weekday))}: ${d.weather.tempC}°, ${COND[d.weather.condition].toLowerCase()}`);
    const tip = ctx.days.find((d) => d.weather.tip)?.weather.tip;
    return {
      itinerary: ctx,
      thinking: ["Mirando el pronóstico de tus días"],
      reply: `${days.join(". ")}.${tip ? ` ${tip}` : ""} No cambié nada del plan.`,
    };
  }
  if (hasAny(t, ["cuanto cuesta", "cuanto sale", "cuanto gasto", "cuanto gastamos", "cuanto es", "costo total", "precio total", "total"])) {
    const total = itineraryTotal(ctx);
    const per =
      ctx.days.length > 1
        ? ` (${ctx.days.map((d) => `${dayName(d.weekday)} $${d.steps.reduce((a, s) => a + s.cost, 0)}`).join(", ")})`
        : "";
    const n = people(ctx.group);
    const left = ctx.budget - total;
    return {
      itinerary: ctx,
      thinking: ["Sumando cada parada"],
      reply: `Todo el plan cuesta $${total} para ${n} ${n === 1 ? "persona" : "personas"}${per}. ${
        left >= 0 ? `Te sobran $${left} de tu presupuesto.` : `Te pasas por $${-left}; si quieres, pídeme «más barato».`
      }`,
    };
  }
  if (hasAny(t, ["vegetariano", "vegetariana", "vegano", "vegana", "sin carne"])) {
    return {
      itinerary: ctx,
      thinking: ["Revisando las comidas del plan"],
      reply:
        "Todavía no tengo el menú de cada restaurante, así que no puedo asegurarte opciones vegetarianas. Te recomiendo preguntar al llegar; si prefieres evitar un plato típico, pídeme «sin cuy» o «sin trucha».",
    };
  }
  return null;
}

function hotelChange(t: string, ctx: GaiaItinerary): Adj | null {
  if (!hasAny(t, ["hotel", "hospedaje", "hostal", "hosteria", "donde dormir", "alojamiento", "glamping"])) return null;
  if (!hasAny(t, ["cambia", "cambiar", "otro", "otra", "diferente", "mejor", "no me gusta"])) return null;
  for (let d = 0; d < ctx.days.length; d++) {
    const s = ctx.days[d].steps.findIndex((st) => getPlace(st.placeId)?.category === "dormir");
    if (s < 0) continue;
    const r = swapStepWithInfo(ctx, d, s);
    if (!r.changed || !r.to) {
      return { itinerary: ctx, thinking: ["Buscando otro hospedaje"], reply: "No encontré otro hospedaje que encaje con tus horarios, así que dejé el mismo." };
    }
    return {
      itinerary: r.itinerary,
      thinking: ["Buscando otro hospedaje cerca de tu ruta", "Comparando precios", "Recalculando el presupuesto"],
      reply: `Listo, ahora duermes en ${r.to.name}${r.from ? ` en lugar de ${r.from.name}` : ""}. ${totalLine(r.itinerary)}`,
    };
  }
  return {
    itinerary: ctx,
    thinking: ["Revisando tu plan"],
    reply: "Tu plan es de un solo día, así que no incluye hospedaje. Si quieres quedarte, pídeme un plan de 2 días.",
  };
}

function removeOptional(ctx: GaiaItinerary): Adj {
  let cur = ctx;
  const gone: string[] = [];
  for (let d = cur.days.length - 1; d >= 0; d--)
    for (let s = cur.days[d].steps.length - 1; s >= 0; s--)
      if (cur.days[d].steps[s].optional) {
        gone.unshift(cur.days[d].steps[s].title);
        cur = removeStep(cur, d, s);
      }
  if (!gone.length)
    return { itinerary: ctx, thinking: ["Revisando tu plan"], reply: "Tu plan no tiene paradas opcionales; todo lo que ves es parte del recorrido." };
  return {
    itinerary: cur,
    thinking: ["Quitando lo opcional", "Recalculando traslados"],
    reply: `Listo, quité ${gone.length === 1 ? "la parada opcional" : `${gone.length} paradas opcionales`}: ${joinEs(gone.map((g) => `«${g}»`))}. ${totalLine(cur)}`,
  };
}

function addNamed(t: string, ctx: GaiaItinerary): Adj | null {
  const verb = hasAny(t, ADD_VERBS);
  const id = namedPlace(t);
  if (!id || !(verb || hasWord(t, "parapente"))) return null;
  const place = getPlace(id)!;
  const kidSafe = place.tags.includes("familia") || place.tags.includes("ninos") || ["comer", "dormir"].includes(place.category);
  if (ctx.group.kids > 0 && !kidSafe) {
    const inPlan = ids(ctx).includes("niton-mirador") && id === "e-parapente";
    return {
      itinerary: ctx,
      thinking: [`Revisando ${place.name}`],
      reply: `${place.name} no es apto para niños, así que no lo sumé.${inPlan ? " Desde el Cerro Nitón, que ya está en tu plan, pueden ver los vuelos de cerca." : ""}`,
    };
  }
  const r = addPlace(ctx, id);
  if (!r.changed) {
    return {
      itinerary: ctx,
      thinking: [`Buscando un hueco para ${place.name}`],
      reply: `No encontré un hueco para ${place.name} sin desarmar el plan. Si quieres, pídeme un plan nuevo que lo incluya, por ejemplo «1 día con ${place.name}».`,
    };
  }
  return { itinerary: r.itinerary, thinking: [`Buscando un hueco para ${place.name}`, "Verificando horarios", "Actualizando el plan"], reply: r.reply };
}

function ids(it: GaiaItinerary) {
  return it.days.flatMap((d) => d.steps.map((s) => s.placeId));
}

const STOPWORDS = new Set(["lo", "la", "el", "los", "las", "un", "una", "algo", "todo", "nada", "mas", "tanto", "tan", "me", "te", "se"]);

function tryAdjust(t: string, ctx: GaiaItinerary): Adj | null {
  const info = infoReply(t, ctx);
  if (info) return info;
  if (hasAny(t, ["opcional", "opcionales"]) && hasAny(t, ["quita", "quitar", "sin", "elimina", "saca"])) return removeOptional(ctx);
  if (hasAny(t, ["caminar", "caminata", "caminatas", "subir"]) && hasAny(t, ["no me gusta", "no quiero", "sin", "poco", "menos", "no podemos", "no puedo"])) {
    const r = moreOf(ctx, "relax");
    return { ...r, thinking: ["Buscando paradas con menos caminata", "Verificando horarios", "Actualizando el plan"] };
  }
  const hotel = hotelChange(t, ctx);
  if (hotel) return hotel;
  const named = addNamed(t, ctx);
  if (named) return named;
  // sin X
  const sin = t.match(/\b(?:sin|nada de|no quiero|no queremos|quita|quitar|elimina|without)\s+(?:el |la |los |las |lo de )?([a-z]+)/);
  if (sin && !STOPWORDS.has(sin[1])) {
    const r = withoutTerm(ctx, sin[1]);
    return { ...r, thinking: [`Buscando paradas con ${sin[1]}`, "Probando alternativas compatibles", "Recalculando tiempos y presupuesto"] };
  }
  if (hasAny(t, ["barato", "barata", "baratos", "economico", "economica", "ahorrar", "menos plata", "menos dinero", "menos caro", "cheaper", "cheap", "presupuesto mas bajo", "mas bajo"])) {
    const r = makeCheaper(ctx);
    return { ...r, thinking: ["Buscando opciones más económicas", "Comparando precios por parada", "Recalculando el presupuesto"] };
  }
  if (hasAny(t, ["noche", "nocturno", "nocturna", "de noche", "night", "bar", "bares", "tragos", "salir"])) {
    const r = addNight(ctx);
    return { ...r, thinking: ["Revisando qué abre de noche", "Calculando el traslado", "Actualizando el plan"] };
  }
  if (hasAny(t, ["aventura", "adrenalina", "parapente", "mas accion", "adventure", "extremo"])) {
    const r = moreOf(ctx, "aventura");
    return { ...r, thinking: ["Buscando más aventura cerca de tu ruta", "Verificando horarios", "Actualizando el plan"] };
  }
  if (hasAny(t, ["relax", "tranquilo", "tranquila", "descanso", "descansar", "termal", "mas calmado", "relajado"])) {
    const r = moreOf(ctx, "relax");
    return { ...r, thinking: ["Buscando opciones más tranquilas", "Verificando horarios", "Actualizando el plan"] };
  }
  if (hasAny(t, ["cultura", "historia", "artesania", "tradicion"])) {
    const r = moreOf(ctx, "cultura");
    return { ...r, thinking: ["Buscando más cultura local", "Verificando horarios", "Actualizando el plan"] };
  }
  const wd = WEEKDAY_WORDS.find(([w]) => hasAny(t, w));
  if (hasAny(t, ["otro dia", "otra fecha", "cambia el dia", "cambiar de dia", "another day", "otro fin"]) || (wd && hasAny(t, ["el", "para el", "mejor", "cambia", "mueve", "pasa"]))) {
    const r = changeDay(ctx, wd?.[1]);
    return { ...r, thinking: ["Revisando horarios del nuevo día", "Cambiando lo que no abre", "Mirando el clima"] };
  }
  return null;
}

function looksLikeNewPlan(req: ParsedRequest, t: string): boolean {
  return (req.daysExplicit && (req.groupExplicit || req.budgetExplicit)) || (req.groupExplicit && req.budgetExplicit) || hasAny(t, ["nuevo plan", "otro plan", "empezar de nuevo", "desde cero"]);
}

/** Motor de Gaia (simulado). Nunca lanza errores: siempre devuelve un plan válido o una respuesta amable. */
export async function planWithGaia(input: string, context?: Itinerary, forced: string[] = []): Promise<GaiaResult> {
  try {
    return planSync(input, context as GaiaItinerary | undefined, forced);
  } catch {
    const fallback = SCENARIOS[1];
    return {
      mode: "scenario",
      thinking: fallback.thinking,
      reply: "Te dejo un plan que le encanta a quienes visitan Pelileo por primera vez.",
      itinerary: scenarioItinerary(fallback.id, fallback.itinerary),
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }
}

export function planSync(input: string, context?: GaiaItinerary, forced: string[] = []): GaiaResult {
  const t = normalize(input);
  const oos = outOfScope(t);
  if (oos) {
    return {
      mode: "out_of_scope",
      thinking: ["Revisando 31 lugares de Pelileo", "Buscando lo más parecido en el cantón"],
      reply: oos,
      suggestions: context ? DEFAULT_SUGGESTIONS : ["Plan familiar · 2 días · $250", "Aventura en pareja · 1 día · $120", "Jean y artesanías · medio día · $80"],
    };
  }
  const req = parseRequest(input);

  if (context && !looksLikeNewPlan(req, t) && !SCENARIOS.some((s) => t === normalize(s.chip))) {
    const adj = tryAdjust(t, context);
    if (adj) {
      return { mode: "adjusted", thinking: adj.thinking, reply: adj.reply, itinerary: adj.itinerary, suggestions: DEFAULT_SUGGESTIONS };
    }
    if (!req.daysExplicit && !req.groupExplicit && !req.budgetExplicit && req.tags.length === 0) {
      return {
        mode: "adjusted",
        thinking: ["Leyendo tu mensaje"],
        reply: "No estoy segura de qué cambiar. Puedes pedirme, por ejemplo, «más barato», «sin cuy», «agrega algo de noche» u «otro día».",
        itinerary: context,
        suggestions: DEFAULT_SUGGESTIONS,
      };
    }
    // trae intereses nuevos: regenera conservando grupo y presupuesto del plan actual
    if (!req.groupExplicit) {
      req.adults = context.group.adults;
      req.kids = context.group.kids;
      req.groupType = context.group.type;
    }
    if (!req.budgetExplicit) req.budget = context.budget;
    if (!req.daysExplicit) req.days = context.days.length === 1 && context.days[0].steps.length <= 4 ? 0.5 : context.days.length;
  }

  const sc = matchScenario(t, req);
  if (sc && forced.length === 0) {
    return {
      mode: "scenario",
      thinking: sc.thinking,
      reply: sc.itinerary.summary,
      itinerary: scenarioItinerary(sc.id, sc.itinerary),
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  const vague = !req.daysExplicit && !req.groupExplicit && !req.budgetExplicit && req.tags.length === 0 && req.exclude.length === 0;
  const { itinerary, tight } = generateItinerary(req, input, forced);
  itinerary.summary = generatedReply(req, itinerary, tight, vague);
  return {
    mode: "generated",
    thinking: generatedThinking(req, req.days),
    reply: itinerary.summary,
    itinerary,
    suggestions: DEFAULT_SUGGESTIONS,
  };
}
