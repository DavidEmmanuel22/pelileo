import type { Itinerary, Tag, Weekday } from "@/data/types";

export type GaiaMode = "scenario" | "generated" | "adjusted" | "out_of_scope";

export type GaiaResult = {
  mode: GaiaMode;
  thinking: string[];
  reply: string;
  itinerary?: GaiaItinerary;
  /** Sugerencias para seguir (chips). */
  suggestions?: string[];
};

export type GroupType = Itinerary["group"]["type"];

export type GaiaMeta = {
  tags: Tag[];
  exclude: string[]; // términos a evitar ("cuy", "alcohol"…)
  wantsNight: boolean;
  forced: string[]; // lugares que el usuario agregó a su plan
  tried: Record<string, string[]>; // historial de "Cambiar por otra" por paso
  source: "scenario" | "generated";
  version: number;
};

/** Itinerario de Gaia: el contrato de `data/types.ts` + metadatos opcionales del motor. */
export type GaiaItinerary = Itinerary & { meta?: GaiaMeta };

export type Slot =
  | "desayuno"
  | "manana"
  | "medio"
  | "almuerzo"
  | "tarde"
  | "atardecer"
  | "hotel"
  | "cena"
  | "noche";

export type ParsedRequest = {
  days: number; // 0.5, 1, 2, 3
  daysExplicit: boolean;
  adults: number;
  kids: number;
  groupType: GroupType;
  groupExplicit: boolean;
  budget: number;
  budgetExplicit: boolean;
  tags: Tag[];
  wantsNight: boolean;
  startDay: Weekday;
  exclude: string[];
  cheap: boolean;
};
