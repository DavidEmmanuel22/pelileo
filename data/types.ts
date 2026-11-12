// Contrato de datos compartido entre Claude Code y Codex.
// No cambiar sin avisar al otro agente (ver CLAUDE.md / AGENTS.md).

export type Category =
  | "comer"
  | "beber"
  | "dormir"
  | "aventura"
  | "cultura"
  | "compras"
  | "naturaleza"
  | "experiencia";

export type Tag =
  | "familia"
  | "pareja"
  | "amigos"
  | "solo"
  | "ninos"
  | "aventura"
  | "gastronomia"
  | "cultura"
  | "compras"
  | "naturaleza"
  | "foto"
  | "relax";

export type Weekday = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

export interface Hours {
  days: Weekday[];
  open: string; // "08:00"
  close: string; // "18:00"
}

export interface Place {
  id: string;
  name: string;
  category: Category;
  real: boolean; // true = atractivo real del cantón; false = negocio inventado
  verifyCoords: boolean; // true = coordenada aproximada, Codex debe verificar en OSM
  lat: number;
  lng: number;
  parish: string; // parroquia
  short: string; // 1 línea para tarjetas
  description: string; // 2-3 líneas para el detalle
  tags: Tag[];
  priceLevel: 0 | 1 | 2 | 3; // 0 = gratis
  priceFrom: number; // USD
  priceUnit: "persona" | "habitación" | "grupo" | "entrada" | "gratis";
  hours: Hours;
  durationMin: number; // tiempo típico de visita
  rating?: number; // solo negocios inventados
  reviews?: number;
  featured?: boolean; // aparece en "Imperdibles"
  imageQuery: string; // término para buscar foto (Wikimedia Commons / Unsplash)
  image?: string; // ruta local cuando se descargue: /images/places/<id>.jpg
}

export interface EventItem {
  id: string;
  title: string;
  placeId?: string;
  lat: number;
  lng: number;
  weekday: Weekday; // la fecha real se calcula en runtime: el próximo <weekday>
  weeksAhead: number; // 0 = esta semana / este fin de semana, 1 = la siguiente…
  start: string;
  end: string;
  category: "feria" | "musica" | "gastronomia" | "deporte" | "cultura" | "tradicion";
  price: number; // 0 = gratis
  short: string;
  imageQuery: string;
}

export interface ItineraryStep {
  time: string; // "09:00"
  placeId: string;
  title: string; // texto visible (puede diferir del nombre del lugar)
  durationMin: number;
  cost: number; // USD total del grupo para este paso
  note: string; // por qué Gaia lo eligió
  travelFromPrevMin?: number;
  travelMode?: "auto" | "a pie" | "camioneta";
  optional?: boolean;
}

export interface ItineraryDay {
  label: string; // "Sábado"
  weekday: Weekday;
  weather: { tempC: number; condition: "soleado" | "parcial" | "nublado" | "lluvia"; tip?: string };
  steps: ItineraryStep[];
}

export interface Itinerary {
  id: string;
  title: string;
  summary: string; // respuesta introductoria de Gaia
  group: { type: "familia" | "pareja" | "amigos" | "solo"; adults: number; kids: number };
  budget: number;
  days: ItineraryDay[];
}

export interface GaiaScenario {
  id: string;
  chip: string; // texto del chip sugerido
  prompt: string; // prompt completo que se "escribe" al tocar el chip
  keywords: string[]; // para hacer match con texto libre
  thinking: string[]; // pasos visibles mientras "piensa"
  itinerary: Itinerary;
}
