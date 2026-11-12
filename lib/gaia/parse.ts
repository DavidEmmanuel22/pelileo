import type { Tag, Weekday } from "@/data/types";
import type { GroupType, ParsedRequest } from "./types";
import { hasAny, hasWord, normalize } from "./text";

const NUM_WORDS: Record<string, number> = {
  un: 1,
  una: 1,
  uno: 1,
  one: 1,
  dos: 2,
  two: 2,
  tres: 3,
  three: 3,
  cuatro: 4,
  four: 4,
  cinco: 5,
  five: 5,
  seis: 6,
  six: 6,
  siete: 7,
  seven: 7,
  ocho: 8,
  eight: 8,
};
const NUM = `(\\d{1,2}|${Object.keys(NUM_WORDS).join("|")})`;
const toNum = (s: string) => (/^\d+$/.test(s) ? Number(s) : (NUM_WORDS[s] ?? 0));

const INTERESTS: { words: string[]; tag: Tag }[] = [
  { words: ["aventura", "parapente", "adrenalina", "adventure", "paragliding", "volar", "extremo", "cabalgata", "caballo"], tag: "aventura" },
  { words: ["comida", "comer", "gastronomia", "gastronomica", "food", "cuy", "volquetero", "platos", "foodie", "comidita", "restaurantes"], tag: "gastronomia" },
  { words: ["cultura", "cultural", "historia", "artesania", "artesanias", "culture", "history", "tejido", "tejer", "museo", "tradicion", "salasaca", "salasaka"], tag: "cultura" },
  { words: ["compras", "jean", "jeans", "shopping", "comprar", "ropa", "muebles", "denim"], tag: "compras" },
  { words: ["naturaleza", "caminar", "caminata", "senderismo", "hiking", "nature", "cascada", "cascadas", "bosque", "mirador", "montana", "trekking"], tag: "naturaleza" },
  { words: ["relax", "descanso", "descansar", "termal", "termas", "tranquilo", "tranquila", "spa", "relajar", "relajarnos", "relajado"], tag: "relax" },
  { words: ["foto", "fotos", "fotografia", "instagram", "paisajes", "vistas"], tag: "foto" },
];

const WEEKDAY_WORDS: [string[], Weekday][] = [
  [["lunes", "monday"], "lun"],
  [["martes", "tuesday"], "mar"],
  [["miercoles", "wednesday"], "mie"],
  [["jueves", "thursday"], "jue"],
  [["viernes", "friday"], "vie"],
  [["sabado", "saturday"], "sab"],
  [["domingo", "sunday"], "dom"],
];

export function parseRequest(input: string): ParsedRequest {
  const t = normalize(input);

  // ── Días
  let days = 1;
  let daysExplicit = false;
  if (hasAny(t, ["medio dia", "media jornada", "half day", "half a day", "medio-dia", "unas horas", "pocas horas", "una tarde", "una manana"])) {
    days = 0.5;
    daysExplicit = true;
  } else if (hasAny(t, ["fin de semana", "finde", "weekend", "fin de semana largo"])) {
    days = hasWord(t, "fin de semana largo") ? 3 : 2;
    daysExplicit = true;
  } else {
    const m = t.match(new RegExp(`${NUM}\\s*(dias|dia|days|day|noches|noche|nights)`));
    if (m) {
      let n = toNum(m[1]);
      if (/noche|night/.test(m[2])) n += 1;
      days = Math.max(1, Math.min(3, n || 1));
      daysExplicit = true;
    } else if (hasAny(t, ["un dia", "day trip", "todo el dia", "full day", "hoy", "manana", "today", "tomorrow"])) {
      days = 1;
      daysExplicit = true;
    }
  }

  // ── Grupo
  let adults = 0;
  let kids = 0;
  let groupType: GroupType | null = null;
  const mk = t.match(new RegExp(`${NUM}\\s*(ninos|ninas|nino|nina|hijos|hijas|hijo|hija|kids|kid|children|child|chicos|nenes|guaguas|peques|bebes|bebe)`));
  if (mk) kids = toNum(mk[1]);
  const ma = t.match(new RegExp(`${NUM}\\s*(adultos|adulto|adults|adult|grandes|mayores)`));
  if (ma) adults = toNum(ma[1]);
  const mp = t.match(new RegExp(`(somos|para|we are|grupo de)?\\s*${NUM}\\s*(personas|persona|people|amigos|amigas|friends|pax)`));
  if (mp && !adults) adults = Math.max(1, toNum(mp[2]) - kids);

  if (hasAny(t, ["familia", "familiar", "family", "con mis hijos", "con los ninos", "con ninos", "con mis ninos", "with kids", "hijos", "ninos", "nino", "nina", "hijo", "hija", "bebe"])) {
    groupType = "familia";
    if (!adults) adults = 2;
    if (!kids) kids = 2;
  } else if (hasAny(t, ["pareja", "couple", "novia", "novio", "esposa", "esposo", "mi amor", "aniversario", "luna de miel", "honeymoon", "mi pareja", "romantico", "romantica"])) {
    groupType = "pareja";
    if (!adults) adults = 2;
  } else if (hasAny(t, ["solo", "sola", "alone", "by myself", "mochilero", "mochilera", "voy yo", "viajo solo", "viajo sola"])) {
    groupType = "solo";
    if (!adults) adults = 1;
  } else if (hasAny(t, ["amigos", "amigas", "friends", "grupo", "panas", "parceros", "colegas"])) {
    groupType = "amigos";
    if (!adults) adults = 4;
  }
  const groupExplicit = groupType != null || adults > 0 || kids > 0;
  if (!adults) adults = kids > 0 ? 2 : 2;
  adults = Math.max(1, Math.min(12, adults));
  kids = Math.max(0, Math.min(8, kids));
  if (!groupType || (groupType !== "familia" && kids > 0)) {
    groupType = kids > 0 ? "familia" : adults === 1 ? "solo" : adults === 2 ? "pareja" : "amigos";
  }
  if (groupType === "solo" && adults > 1) groupType = adults === 2 ? "pareja" : "amigos";

  // ── Presupuesto
  const people = adults + kids;
  let budget = 0;
  let budgetExplicit = false;
  const mb =
    t.match(/\$\s?(\d{1,6}(?:[.,]\d{1,2})?)/) ||
    t.match(/(\d{1,6}(?:[.,]\d{1,2})?)\s*(dolares|dolar|usd|dollars|dollar|bucks|lucas)/);
  if (mb) {
    budget = Math.round(Number(mb[1].replace(",", ".")));
    budgetExplicit = budget > 0;
  }
  const cheap = hasAny(t, ["barato", "barata", "economico", "economica", "poco dinero", "poca plata", "cheap", "low budget", "presupuesto bajo", "mochilero", "mochilera"]);
  if (!budgetExplicit) {
    const perPerson = cheap ? 30 : 60;
    budget = Math.round(perPerson * people * Math.max(0.5, days));
  }
  if (budgetExplicit && /por persona|per person|c\/u|cada uno|each/.test(t)) budget = budget * people;

  // ── Intereses
  const tags = new Set<Tag>();
  for (const it of INTERESTS) if (hasAny(t, it.words)) tags.add(it.tag);
  if (kids > 0) tags.add("ninos");

  // ── Noche
  const wantsNight =
    hasAny(t, ["noche", "nocturno", "nocturna", "night", "nightlife", "bar", "bares", "cerveza", "coctel", "cocteles", "tragos", "drinks", "salir de noche"]) &&
    !/\bsin (bar|bares|alcohol|tragos)/.test(t);

  // ── Día de inicio
  let startDay: Weekday = days >= 3 ? "vie" : "sab";
  for (const [words, d] of WEEKDAY_WORDS) {
    if (hasAny(t, words)) {
      startDay = d;
      break;
    }
  }

  // ── Exclusiones ("sin cuy", "no quiero bares")
  const exclude: string[] = [];
  const re = /\b(?:sin|nada de|no quiero|no queremos|without|no)\s+([a-z]+(?:\s[a-z]+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const term = m[1].split(" ")[0];
    if (term && term.length > 2 && !["mas", "tan", "muy", "hay", "se", "me", "nos", "tengo", "tenemos", "sabemos", "se"].includes(term)) exclude.push(term);
  }

  return {
    days,
    daysExplicit,
    adults,
    kids,
    groupType,
    groupExplicit,
    budget,
    budgetExplicit,
    tags: [...tags],
    wantsNight,
    startDay,
    exclude,
    cheap,
  };
}
