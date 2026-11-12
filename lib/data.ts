import placesJson from "@/data/places.json";
import eventsJson from "@/data/events.json";
import scenariosJson from "@/data/gaia-scenarios.json";
import municipioJson from "@/data/municipio.json";
import type { Category, EventItem, GaiaScenario, Place } from "@/data/types";
import { PLACE_IMAGE_IDS, EVENT_IMAGE_IDS } from "@/lib/images.generated";

export const PLACES = placesJson as unknown as Place[];
export const EVENTS = eventsJson as unknown as EventItem[];
export const SCENARIOS = scenariosJson as unknown as GaiaScenario[];
export const MUNICIPIO = municipioJson;

const byId = new Map(PLACES.map((p) => [p.id, p]));
export function getPlace(id: string | null | undefined): Place | undefined {
  if (!id) return undefined;
  return byId.get(id);
}

export const FEATURED = PLACES.filter((p) => p.featured);

/** Chips de categoría de Explorar (BRIEF §4.1). */
export type ExploreFilter =
  | "todo"
  | "comer"
  | "dormir"
  | "aventura"
  | "cultura"
  | "compras"
  | "naturaleza"
  | "experiencias";

export const EXPLORE_FILTERS: { id: ExploreFilter; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "comer", label: "Comer" },
  { id: "dormir", label: "Dormir" },
  { id: "aventura", label: "Aventura" },
  { id: "cultura", label: "Cultura" },
  { id: "compras", label: "Compras" },
  { id: "naturaleza", label: "Naturaleza" },
  { id: "experiencias", label: "Experiencias" },
];

export function matchesFilter(p: Place, f: ExploreFilter): boolean {
  switch (f) {
    case "todo":
      return true;
    case "comer":
      return p.category === "comer" || p.category === "beber";
    case "experiencias":
      return p.category === "experiencia";
    default:
      return p.category === f;
  }
}

export const CATEGORY_LABEL: Record<Category, string> = {
  comer: "Comer",
  beber: "Bar",
  dormir: "Dormir",
  aventura: "Aventura",
  cultura: "Cultura",
  compras: "Compras",
  naturaleza: "Naturaleza",
  experiencia: "Experiencia",
};

export const EVENT_CATEGORY_LABEL: Record<EventItem["category"], string> = {
  feria: "Feria",
  musica: "Música",
  gastronomia: "Gastronomía",
  deporte: "Deporte",
  cultura: "Cultura",
  tradicion: "Tradición",
};

const IMAGE_IDS = {
  places: new Set<string>(PLACE_IMAGE_IDS),
  events: new Set<string>(EVENT_IMAGE_IDS),
};

export function placeImage(p: Pick<Place, "id">): string | null {
  return IMAGE_IDS.places.has(p.id) ? `/images/places/${p.id}.jpg` : null;
}
export function eventImage(e: Pick<EventItem, "id">): string | null {
  return IMAGE_IDS.events.has(e.id) ? `/images/events/${e.id}.jpg` : null;
}

export function priceLabel(p: Place): string {
  if (p.priceUnit === "gratis" || p.priceFrom === 0) return "Gratis";
  const unit =
    p.priceUnit === "persona"
      ? "por persona"
      : p.priceUnit === "habitación"
        ? "por noche"
        : p.priceUnit === "entrada"
          ? "la entrada"
          : "por grupo";
  return `Desde $${p.priceFrom} ${unit}`;
}

export function priceLevelLabel(p: Place): string {
  if (p.priceLevel === 0) return "Gratis";
  return "$".repeat(p.priceLevel);
}
