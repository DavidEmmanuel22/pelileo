import type { ItineraryDay, Weekday } from "@/data/types";

/** Clima simulado por día de la semana (BRIEF §5). */
export function weatherFor(day: Weekday): ItineraryDay["weather"] {
  if (day === "sab") return { tempC: 18, condition: "parcial", tip: "Lleva una chompa para la tarde." };
  if (day === "dom")
    return { tempC: 19, condition: "soleado", tip: "Buen día para ver el Tungurahua despejado temprano." };
  return { tempC: 17, condition: "parcial", tip: "Mañana fresca; la neblina suele bajar después de las 16:00." };
}

export const CONDITION_LABEL: Record<ItineraryDay["weather"]["condition"], string> = {
  soleado: "Soleado",
  parcial: "Parcialmente nublado",
  nublado: "Nublado",
  lluvia: "Lluvia",
};
