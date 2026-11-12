"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Check, RotateCcw } from "lucide-react";
import { PLACES, SCENARIOS } from "@/lib/data";
import { useMapConfig } from "@/lib/mapStore";
import { useIsDesktop } from "@/lib/hooks";
import { useGaia, type ChatMsg } from "@/lib/gaiaStore";
import { Sheet, type SheetHandle } from "@/components/ui/Sheet";
import { Chip } from "@/components/ui/bits";
import { GaiaMark } from "@/components/brand/Brand";
import { PlanBlock } from "./PlanBlock";

const SCENARIO_BY_CHIP = new Map(SCENARIOS.map((s) => [s.chip, s.prompt]));

export function GaiaView() {
  const router = useRouter();
  const desktop = useIsDesktop();
  const sheetRef = useRef<SheetHandle>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const g = useGaia();
  const { itinerary: it, dayIdx, focusStop, phase, messages } = g;
  const busy = phase === "typing" || phase === "thinking" || phase === "streaming";

  // Restaurar sesión y leer parámetros (?q=, ?add=, ?ev=) una sola vez
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    useGaia.getState().restore();
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("q");
    const add = sp.get("add");
    const ev = sp.get("ev") ?? undefined;
    if (q || add) router.replace("/gaia", { scroll: false });
    const st = useGaia.getState();
    if (add) void st.addFromLink(add, ev);
    else if (q && st.prompt !== q) void st.typeAndSend(q.slice(0, 400));
  }, [router]);

  // Mapa: itinerario del día activo, o todos los lugares mientras no hay plan
  const day = it?.days[Math.min(dayIdx, (it?.days.length ?? 1) - 1)];
  const route = useMemo(() => (day ? { stops: day.steps.map((s, i) => ({ placeId: s.placeId, order: i })) } : null), [day]);
  const onStopSelect = useCallback((order: number) => {
    useGaia.getState().setFocus(order);
    const el = document.getElementById(`step-${order}`);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }, []);
  const openPlace = useCallback((id: string) => router.push(`/lugar/${id}`), [router]);
  useMapConfig(
    it && route
      ? {
          mode: "itinerary",
          places: PLACES,
          route,
          focusStop,
          onStopSelect,
          fitKey: `${it.id}:${dayIdx}:${it.meta?.version ?? 0}:${route.stops.length}`,
        }
      : { mode: "explore", places: PLACES, onSelect: openPlace },
    [it, route, focusStop, dayIdx, onStopSelect, openPlace],
  );

  // Al llegar un plan nuevo: sheet al 60% (mapa visible) y vista al inicio del resultado
  useEffect(() => {
    if (!g.resultTick) return;
    if (!desktop) sheetRef.current?.snapTo(1);
    const t = setTimeout(() => {
      const ms = useGaia.getState().messages;
      const last = [...ms].reverse().find((m) => m.role === "gaia" && m.kind === "plan");
      const el = (last && document.getElementById(`msg-${last.id}`)) || planRef.current;
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => clearTimeout(t);
  }, [g.resultTick, desktop]);

  // Mientras piensa, mostramos el indicador (abajo)
  useEffect(() => {
    if (phase !== "thinking") return;
    const t = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 60);
    return () => clearTimeout(t);
  }, [phase]);

  const submit = (text: string) => {
    if (busy || !text.trim()) return;
    const scenario = SCENARIO_BY_CHIP.get(text);
    if (scenario && !it) void g.typeAndSend(scenario);
    else void g.send(scenario && it ? text : text);
  };

  const focusComposer = () => {
    if (!desktop) sheetRef.current?.snapTo(2);
    setTimeout(() => {
      inputRef.current?.focus();
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 200);
  };

  // Mensajes: arriba, el pedido y la respuesta que originaron el plan; el último ajuste va
  // como aviso dentro del plan; el resto queda en "Ver conversación anterior".
  const planMsgIdx = findLastIndex(messages, (m) => m.role === "gaia" && m.kind === "plan");
  const after = planMsgIdx >= 0 ? messages.slice(planMsgIdx + 1) : [];
  const updIdx = findLastIndex(after, (m) => m.role === "gaia");
  const update = updIdx >= 0 ? after[updIdx] : undefined;
  const updQ = updIdx > 0 && after[updIdx - 1].role === "user" ? after[updIdx - 1] : undefined;
  const pending = updIdx >= 0 ? after.slice(updIdx + 1) : after; // pedido en curso
  const [showOld, setShowOld] = useState(false);
  const head = planMsgIdx >= 0 ? messages.slice(0, planMsgIdx + 1) : messages;
  const history = [...head, ...after.slice(0, Math.max(0, updQ ? updIdx - 1 : updIdx))];
  const visibleTop = showOld ? history : head.slice(-2);
  const hiddenCount = Math.max(0, history.length - visibleTop.length);

  // Al llegar la respuesta de un ajuste, llevamos la vista al plan
  const updId = update?.id;
  useEffect(() => {
    if (!updId) return;
    const t = setTimeout(() => planRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    return () => clearTimeout(t);
  }, [updId]);

  const empty = !it && messages.length === 0 && phase !== "typing";

  const header = (
    <div className="flex items-center gap-3 px-5 pb-3 pt-1 lg:pt-5">
      <GaiaMark size={36} thinking={phase === "thinking"} />
      <div className="min-w-0 flex-1">
        <h1 className="text-[18px] font-bold leading-tight tracking-[-0.01em] text-ink">Gaia</h1>
        <p className="truncate text-[12.5px] text-ink-2">Arma tu plan · by Clapzy</p>
      </div>
      {(it || messages.length > 0) && (
        <button
          type="button"
          onClick={() => {
            g.reset();
            setShowOld(false);
            sheetRef.current?.snapTo(2);
            sheetRef.current?.scrollToTop();
          }}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 text-[13px] font-semibold text-ink transition-colors hover:border-ink-3"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Nuevo plan
        </button>
      )}
    </div>
  );

  const composer = (
    <form
      className="border-t border-line bg-surface px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 lg:px-5 lg:pb-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit(g.draft);
      }}
      data-no-drag
    >
      <label htmlFor="gaia-input" className="sr-only">
        Escríbele a Gaia
      </label>
      <div className="flex items-center gap-2 rounded-full border border-line bg-bg py-1 pl-4 pr-1 transition-[border-color,box-shadow] focus-within:border-ink focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ink)_10%,transparent)]">
        <input
          ref={inputRef}
          id="gaia-input"
          value={g.draft}
          onChange={(e) => g.setDraft(e.target.value.slice(0, 400))}
          readOnly={phase === "typing"}
          placeholder={it ? "Pídele un ajuste: «más barato», «sin cuy»…" : "Ej.: 2 días en familia con $200"}
          enterKeyHint="send"
          autoComplete="off"
          className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-2 focus:outline-none focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !g.draft.trim()}
          aria-label="Enviar a Gaia"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-clapzy text-surface transition-[opacity,transform] duration-200 hover:scale-[1.04] disabled:opacity-35 disabled:hover:scale-100"
        >
          <ArrowUp size={19} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    </form>
  );

  return (
    <Sheet
      ref={sheetRef}
      label="Conversación con Gaia"
      snaps={[0.15, 0.6, 0.92]}
      initial={2}
      header={header}
      footer={composer}
    >
      <div className="pb-6" aria-live="polite">
        {empty ? (
          <Intro onPick={(chip) => submit(chip)} />
        ) : (
          <div className="space-y-3 px-5 pt-1">
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowOld(true)}
                className="mx-auto flex h-10 items-center rounded-full px-3 text-[13px] font-medium text-ink-2 underline decoration-line underline-offset-4 hover:text-ink"
              >
                Ver conversación anterior ({hiddenCount})
              </button>
            )}
            {visibleTop.map((m) => (
              <Bubble key={m.id} m={m} />
            ))}
            {phase === "typing" && g.draft && <Bubble m={{ id: "typing", role: "user", text: g.draft }} typing />}
          </div>
        )}

        {it && (
          <div ref={planRef} className="scroll-mt-2">
            <PlanBlock
              it={it}
              dayIdx={Math.min(dayIdx, it.days.length - 1)}
              focusStop={focusStop}
              busy={busy}
              update={update}
              updateQ={updQ?.text}
              onAdjust={focusComposer}
            />
          </div>
        )}

        {it && pending.length > 0 && (
          <div className="mt-5 space-y-3 px-5">
            {pending.map((m) => (
              <Bubble key={m.id} m={m} />
            ))}
          </div>
        )}

        <AnimatePresence>{phase === "thinking" && <Thinking key="thinking" />}</AnimatePresence>

        {!empty && !busy && g.suggestions.length > 0 && (
          <div className="mt-5 px-5">
            <p className="mb-2 text-[12.5px] font-medium text-ink-2">{it ? "Puedes pedirle:" : "Prueba con:"}</p>
            <div className="flex flex-wrap gap-2">
              {g.suggestions.map((s) => (
                <Chip key={s} gaia onClick={() => submit(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-1" />
      </div>
    </Sheet>
  );
}

function findLastIndex<T>(arr: T[], fn: (x: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) if (fn(arr[i])) return i;
  return -1;
}

function Intro({ onPick }: { onPick: (chip: string) => void }) {
  return (
    <div className="px-5 pt-2">
      <p className="text-[24px] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
        Hola, soy Gaia.
        <br />
        <span className="font-semibold text-ink-2">Cuéntame cómo quieres vivir Pelileo.</span>
      </p>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
        Dime con quién vas, cuántos días tienes y tu presupuesto. Te armo un plan hora por hora, con el mapa.
      </p>
      <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-2">Empieza con un ejemplo</p>
      <ul className="mt-2.5 space-y-2.5">
        {SCENARIOS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onPick(s.chip)}
              className="group flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--clapzy)_28%,var(--line))] bg-clapzy-soft px-4 py-3.5 text-left transition-colors duration-200 hover:border-clapzy"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-clapzy-ink">{s.chip}</span>
                <span className="mt-0.5 line-clamp-1 block text-[13px] text-ink-2">{s.prompt}</span>
              </span>
              <span className="text-clapzy-ink transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Bubble({ m, typing = false }: { m: ChatMsg; typing?: boolean }) {
  const streamId = useGaia((s) => s.streamId);
  const words = useGaia((s) => s.streamWords);
  if (m.role === "user") {
    return (
      <div id={`msg-${m.id}`} className="flex scroll-mt-3 justify-end">
        <p className="max-w-[85%] rounded-[20px] rounded-br-md bg-ink px-4 py-2.5 text-[14.5px] leading-snug text-surface">
          {m.text}
          {typing && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-surface" aria-hidden="true" />}
        </p>
      </div>
    );
  }
  const streaming = streamId === m.id;
  const text = streaming ? m.text.split(/\s+/).slice(0, words).join(" ") : m.text;
  return (
    <div id={`msg-${m.id}`} className="flex scroll-mt-3 gap-2.5">
      <span className="mt-0.5">
        <GaiaMark size={26} />
      </span>
      <p className={`min-w-0 flex-1 text-[15px] leading-relaxed ${m.kind === "oos" ? "text-ink" : "text-ink"}`}>
        <span className="sr-only">Gaia: </span>
        {text}
        {streaming && <span className="ml-1 inline-block h-2 w-2 rounded-full bg-clapzy align-middle gaia-pulse" aria-hidden="true" />}
      </p>
    </div>
  );
}

function Thinking() {
  const steps = useGaia((s) => s.thinking);
  const done = useGaia((s) => s.thinkingDone);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-5 mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-4"
      role="status"
      aria-label="Gaia está pensando"
    >
      <div className="flex items-center gap-2.5">
        <GaiaMark size={26} thinking />
        <p className="text-[14px] font-semibold text-ink">Armando tu plan…</p>
      </div>
      <ul className="mt-3 space-y-2 pl-0.5">
        {steps.map((s, i) => {
          if (i > done) return null;
          const ok = i < done;
          return (
            <motion.li
              key={s}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-2.5 text-[13.5px] ${ok ? "text-ink" : "text-ink-2"}`}
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                  ok ? "border-pel-green bg-pel-green text-surface" : "border-line"
                }`}
              >
                {ok ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : <span className="h-1.5 w-1.5 rounded-full bg-ink-3 gaia-pulse" />}
              </span>
              {s}
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}
