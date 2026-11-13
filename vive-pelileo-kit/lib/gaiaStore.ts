"use client";

import { create } from "zustand";
import type { Weekday } from "@/data/types";
import { getPlace, EVENTS, SCENARIOS } from "@/lib/data";
import { addPlace, itineraryTotal, planWithGaia, removeStep, swapStepWithInfo, type GaiaItinerary } from "@/lib/gaia";
import { DEFAULT_SUGGESTIONS } from "@/lib/gaia";
import { readJSON, writeJSON } from "@/lib/storage";
import { WEEKDAY_LABEL } from "@/lib/time";

export type GaiaPhase = "idle" | "typing" | "thinking" | "streaming" | "ready";
export type ChatMsg = { id: string; role: "user" | "gaia"; text: string; kind?: "plan" | "adjust" | "oos" | "info" };

type GaiaState = {
  phase: GaiaPhase;
  messages: ChatMsg[];
  thinking: string[];
  thinkingDone: number;
  /** id del mensaje que se está escribiendo palabra por palabra y cuántas palabras van */
  streamId: string | null;
  streamWords: number;
  itinerary: GaiaItinerary | null;
  /** el prompt que originó el plan (para "Compartir") */
  prompt: string;
  suggestions: string[];
  dayIdx: number;
  focusStop: number | null;
  draft: string;
  restored: boolean;
  /** se incrementa cuando hay que llevar la vista al inicio del resultado */
  resultTick: number;

  restore: () => void;
  setDraft: (t: string) => void;
  setDay: (i: number) => void;
  setFocus: (order: number | null) => void;
  send: (text: string, forced?: string[]) => Promise<void>;
  typeAndSend: (text: string) => Promise<void>;
  swap: (d: number, s: number) => void;
  remove: (d: number, s: number) => void;
  addFromLink: (placeId: string, eventId?: string) => Promise<void>;
  reset: () => void;
  loadPlan: (it: GaiaItinerary, intro?: { prompt: string; reply: string }) => void;
};

const KEY = "vp:gaia";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
let runId = 0;
let seq = 0;
const mid = () => `m${Date.now().toString(36)}${(seq++).toString(36)}`;

function reduced(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function persist(s: Pick<GaiaState, "itinerary" | "messages" | "prompt" | "suggestions" | "dayIdx">) {
  writeJSON(
    KEY,
    { itinerary: s.itinerary, messages: s.messages.slice(-12), prompt: s.prompt, suggestions: s.suggestions, dayIdx: s.dayIdx },
    "session",
  );
}

export const STARTER_SUGGESTIONS = SCENARIOS.map((s) => s.chip);

export const useGaia = create<GaiaState>((set, get) => {
  /** Muestra los pasos de "pensando" y luego escribe la respuesta palabra por palabra. */
  async function perform(
    my: number,
    thinking: string[],
    reply: string,
    kind: ChatMsg["kind"],
    apply: () => Partial<GaiaState>,
  ): Promise<boolean> {
    const fast = reduced();
    set({ phase: "thinking", thinking, thinkingDone: 0 });
    for (let i = 0; i < thinking.length; i++) {
      await wait(fast ? 60 : 600 + ((i * 271 + 113) % 300));
      if (my !== runId) return false;
      set({ thinkingDone: i + 1 });
    }
    await wait(fast ? 0 : 260);
    if (my !== runId) return false;
    const msg: ChatMsg = { id: mid(), role: "gaia", text: reply, kind };
    const words = reply.split(/\s+/).filter(Boolean).length;
    set((s) => ({
      ...apply(),
      phase: "streaming",
      messages: [...s.messages, msg],
      streamId: msg.id,
      streamWords: fast ? words : 0,
      thinking: [],
      thinkingDone: 0,
    }));
    if (!fast) {
      for (let w = 1; w <= words; w++) {
        await wait(32);
        if (my !== runId) return false;
        set({ streamWords: w });
      }
    }
    set({ phase: "ready", streamId: null });
    persist(get());
    return true;
  }

  /** Respuesta inmediata (cambiar/quitar paso): sin pasos de razonamiento. */
  function quickReply(text: string, patch: Partial<GaiaState>) {
    runId++;
    const msg: ChatMsg = { id: mid(), role: "gaia", text, kind: "adjust" };
    set((s) => ({ ...patch, messages: [...s.messages, msg], phase: "ready", streamId: null, thinking: [] }));
    persist(get());
  }

  return {
    phase: "idle",
    messages: [],
    thinking: [],
    thinkingDone: 0,
    streamId: null,
    streamWords: 0,
    itinerary: null,
    prompt: "",
    suggestions: STARTER_SUGGESTIONS,
    dayIdx: 0,
    focusStop: null,
    draft: "",
    restored: false,
    resultTick: 0,

    restore: () => {
      if (get().restored) return;
      const saved = readJSON<{
        itinerary: GaiaItinerary | null;
        messages: ChatMsg[];
        prompt: string;
        suggestions: string[];
        dayIdx: number;
      } | null>(KEY, null, "session");
      if (saved && saved.itinerary && Array.isArray(saved.itinerary.days) && saved.itinerary.days.length) {
        set({
          restored: true,
          itinerary: saved.itinerary,
          messages: Array.isArray(saved.messages) ? saved.messages.filter((m) => m && typeof m.text === "string") : [],
          prompt: typeof saved.prompt === "string" ? saved.prompt : "",
          suggestions: Array.isArray(saved.suggestions) ? saved.suggestions : DEFAULT_SUGGESTIONS,
          dayIdx: Math.min(Math.max(0, saved.dayIdx | 0), saved.itinerary.days.length - 1),
          phase: "ready",
        });
      } else set({ restored: true });
    },

    setDraft: (t) => set({ draft: t }),
    setDay: (i) => set({ dayIdx: i, focusStop: null }),
    setFocus: (order) => set({ focusStop: order }),

    send: async (raw, forced = []) => {
      const text = raw.trim();
      if (!text) return;
      const my = ++runId;
      const prev = get().itinerary;
      const user: ChatMsg = { id: mid(), role: "user", text };
      set((s) => ({ messages: [...s.messages, user], draft: "", focusStop: null }));
      const res = await planWithGaia(text, prev ?? undefined, forced);
      if (my !== runId) return;
      const newPlan = !!res.itinerary && res.itinerary !== prev && res.mode !== "adjusted";
      await perform(my, res.thinking, res.reply, res.mode === "out_of_scope" ? "oos" : res.mode === "adjusted" ? "adjust" : "plan", () => {
        const patch: Partial<GaiaState> = { suggestions: res.suggestions ?? DEFAULT_SUGGESTIONS };
        if (res.itinerary) {
          patch.itinerary = res.itinerary;
          if (newPlan) {
            patch.prompt = text;
            patch.dayIdx = 0;
            patch.resultTick = get().resultTick + 1;
          } else {
            patch.dayIdx = Math.min(get().dayIdx, res.itinerary.days.length - 1);
          }
        }
        return patch;
      });
    },

    typeAndSend: async (text) => {
      const my = ++runId;
      const fast = reduced();
      set({ phase: "typing", draft: "" });
      if (!fast) {
        for (let i = 1; i <= text.length; i++) {
          await wait(40);
          if (my !== runId) return;
          set({ draft: text.slice(0, i) });
        }
        await wait(250);
        if (my !== runId) return;
      }
      await get().send(text);
    },

    swap: (d, s) => {
      const it = get().itinerary;
      if (!it) return;
      const r = swapStepWithInfo(it, d, s);
      if (!r.changed || !r.to) {
        quickReply(`No encontré otra opción compatible para ${r.from?.name ?? "esa parada"} a esa hora. Puedes quitarla si prefieres.`, {});
        return;
      }
      const total = itineraryTotal(r.itinerary);
      const diff = total - itineraryTotal(it);
      const money = diff === 0 ? "El presupuesto queda igual." : diff < 0 ? `Ahorras $${-diff}.` : `Suma $${diff}.`;
      quickReply(`Cambié ${r.from?.name ?? "la parada"} por ${r.to.name}. ${money}`, { itinerary: r.itinerary, focusStop: null });
    },

    remove: (d, s) => {
      const it = get().itinerary;
      const step = it?.days[d]?.steps[s];
      if (!it || !step) return;
      const out = removeStep(it, d, s);
      const p = getPlace(step.placeId);
      const total = itineraryTotal(out);
      quickReply(`Quité ${p?.name ?? step.title}. Ahora gastas $${total} de $${out.budget}.`, {
        itinerary: out,
        focusStop: null,
        dayIdx: Math.min(d, out.days.length - 1),
      });
    },

    addFromLink: async (placeId, eventId) => {
      const place = getPlace(placeId);
      if (!place) return;
      const ev = eventId ? EVENTS.find((e) => e.id === eventId) : undefined;
      const what = ev ? ev.title : place.name;
      const it = get().itinerary;
      const my = ++runId;
      const user: ChatMsg = { id: mid(), role: "user", text: `Agrega ${what} a mi plan` };
      set((s) => ({ messages: [...s.messages, user], focusStop: null }));
      if (it) {
        const r = addPlace(it, placeId, ev?.weekday as Weekday | undefined);
        if (r.changed) {
          await perform(my, ["Buscando dónde encaja en tu plan", "Revisando horarios y traslados"], r.reply, "adjust", () => {
            const d = r.itinerary.days.findIndex((dd) => dd.steps.some((st) => st.placeId === placeId));
            return { itinerary: r.itinerary, dayIdx: d >= 0 ? d : get().dayIdx };
          });
          return;
        }
      }
      // No hay plan (o no encaja): Gaia arma uno nuevo que lo incluya
      const day = ev ? ` el ${WEEKDAY_LABEL[ev.weekday].toLowerCase()}` : "";
      const prompt = it
        ? `Plan de ${it.days.length} ${it.days.length === 1 ? "día" : "días"}${day} con $${it.budget}, ${it.group.adults} adultos${it.group.kids ? ` y ${it.group.kids} niños` : ""}`
        : `Plan de 1 día${day}`;
      const res = await planWithGaia(prompt, undefined, [placeId]);
      if (my !== runId || !res.itinerary) return;
      const intro = it
        ? `${what} no entraba en tu plan anterior sin romper horarios, así que armé uno nuevo alrededor de esa visita. `
        : `Puse ${what} en el centro del día. `;
      await perform(my, res.thinking, intro + res.reply, "plan", () => {
        const d = res.itinerary!.days.findIndex((dd) => dd.steps.some((st) => st.placeId === placeId));
        return {
          itinerary: res.itinerary!,
          prompt,
          dayIdx: d >= 0 ? d : 0,
          suggestions: res.suggestions ?? DEFAULT_SUGGESTIONS,
          resultTick: get().resultTick + 1,
        };
      });
    },

    loadPlan: (it, intro) => {
      runId++;
      const msg: ChatMsg = {
        id: mid(),
        role: "gaia",
        text: intro ? intro.reply : `Aquí tienes tu plan guardado: ${it.title.toLowerCase()}. Puedes seguir ajustándolo.`,
        kind: "plan",
      };
      const user: ChatMsg[] = intro ? [{ id: mid(), role: "user", text: intro.prompt }] : [];
      set({
        phase: "ready",
        messages: [...user, msg],
        thinking: [],
        streamId: null,
        itinerary: it,
        prompt: intro?.prompt ?? it.title,
        suggestions: DEFAULT_SUGGESTIONS,
        dayIdx: 0,
        focusStop: null,
        draft: "",
        restored: true,
        resultTick: get().resultTick + 1,
      });
      persist(get());
    },

    reset: () => {
      runId++;
      set({
        phase: "idle",
        messages: [],
        thinking: [],
        thinkingDone: 0,
        streamId: null,
        itinerary: null,
        prompt: "",
        suggestions: STARTER_SUGGESTIONS,
        dayIdx: 0,
        focusStop: null,
        draft: "",
      });
      writeJSON(KEY, null, "session");
    },
  };
});
