"use client";

import { create } from "zustand";
import type { EventItem, Itinerary } from "@/data/types";
import { readJSON, writeJSON } from "@/lib/storage";

export type SavedPlan = { id: string; savedAt: number; itinerary: Itinerary };
export type PlanItem = { kind: "place" | "event"; id: string; addedAt: number };
export type PublishedEvent = EventItem & { date: string; publishedAt: number; description?: string };

export type GaiaMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "gaia"; text: string; kind?: "reply" | "oos" | "adjust" };

type AppState = {
  hydrated: boolean;
  savedPlaces: string[];
  savedPlans: SavedPlan[];
  planItems: PlanItem[];
  published: PublishedEvent[];
  toast: { id: number; text: string } | null;

  hydrate: () => void;
  toggleSavedPlace: (id: string) => boolean;
  savePlan: (it: Itinerary) => void;
  removePlan: (id: string) => void;
  addPlanItem: (kind: PlanItem["kind"], id: string) => boolean;
  removePlanItem: (kind: PlanItem["kind"], id: string) => void;
  publishEvent: (ev: PublishedEvent) => void;
  showToast: (text: string) => void;
};

const K = {
  places: "vp:saved-places",
  plans: "vp:saved-plans",
  items: "vp:plan-items",
  published: "vp:published-events",
};

export const useApp = create<AppState>((set, get) => ({
  hydrated: false,
  savedPlaces: [],
  savedPlans: [],
  planItems: [],
  published: [],
  toast: null,

  hydrate: () => {
    if (get().hydrated) return;
    const safeArr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
    set({
      hydrated: true,
      savedPlaces: safeArr<string>(readJSON(K.places, [])).filter((x) => typeof x === "string"),
      savedPlans: safeArr<SavedPlan>(readJSON(K.plans, [])).filter((p) => p && p.itinerary && Array.isArray(p.itinerary.days)),
      planItems: safeArr<PlanItem>(readJSON(K.items, [])).filter((p) => p && typeof p.id === "string"),
      published: safeArr<PublishedEvent>(readJSON(K.published, [], "session")).filter((e) => e && typeof e.id === "string"),
    });
  },

  toggleSavedPlace: (id) => {
    const cur = get().savedPlaces;
    const has = cur.includes(id);
    const next = has ? cur.filter((x) => x !== id) : [id, ...cur];
    set({ savedPlaces: next });
    writeJSON(K.places, next);
    get().showToast(has ? "Quitado de Guardados" : "Guardado");
    return !has;
  },

  savePlan: (it) => {
    const cur = get().savedPlans.filter((p) => p.id !== it.id);
    const next = [{ id: it.id, savedAt: Date.now(), itinerary: it }, ...cur].slice(0, 12);
    set({ savedPlans: next });
    writeJSON(K.plans, next);
    get().showToast("Plan guardado en Guardados");
  },

  removePlan: (id) => {
    const next = get().savedPlans.filter((p) => p.id !== id);
    set({ savedPlans: next });
    writeJSON(K.plans, next);
  },

  addPlanItem: (kind, id) => {
    const cur = get().planItems;
    if (cur.some((p) => p.kind === kind && p.id === id)) {
      get().showToast("Ya está en tu plan");
      return false;
    }
    const next = [...cur, { kind, id, addedAt: Date.now() }];
    set({ planItems: next });
    writeJSON(K.items, next);
    get().showToast("Agregado a tu plan");
    return true;
  },

  removePlanItem: (kind, id) => {
    const next = get().planItems.filter((p) => !(p.kind === kind && p.id === id));
    set({ planItems: next });
    writeJSON(K.items, next);
  },

  publishEvent: (ev) => {
    const next = [ev, ...get().published];
    set({ published: next });
    writeJSON(K.published, next, "session");
  },

  showToast: (text) => set({ toast: { id: Date.now(), text } }),
}));
