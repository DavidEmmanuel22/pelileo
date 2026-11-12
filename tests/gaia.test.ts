import { describe, expect, it } from "vitest";
import { getPlace, PLACES, SCENARIOS } from "@/lib/data";
import { itineraryTotal, planWithGaia, removeStep, swapStep, swapStepWithInfo, type GaiaItinerary } from "@/lib/gaia";
import { toMin } from "@/lib/time";

const RANDOM_INPUTS = [
  "",
  "   ",
  "🙂🙂🌋",
  "hola",
  "family trip 2 days $200",
  "a day of adventure for a couple",
  "playa",
  "quiero ir a la playa con mis hijos",
  "$10 para 6 personas",
  "somos 6 amigos, fin de semana, $600, queremos salir de noche",
  "medio día, voy sola, me gusta la cultura",
  "3 días en familia con 3 niños y $400",
  "plan barato para dos",
  "Plan familiar · 2 días · $250",
  "Aventura en pareja · 1 día · $120",
  "Jean y artesanías · medio día · $80",
  "quiero comer cuy y ver el volcán",
  "un día de relax con termas",
  "discoteca",
  "domingo con mi pareja, naturaleza y fotos, $150",
  "jean jean jean",
  "1000000 dólares",
  "$0",
  "lunes",
  "nos gusta caminar, 2 adultos y 1 niño, un día",
  "un fin de semana sin cuy en familia",
  "<script>alert(1)</script>",
  "¿Qué hago en Pelileo?",
  "dos noches para 4 amigos con aventura",
  "solo tengo unas horas y $15",
  "comida vegetariana",
  "parapente!!!",
];

function assertValidItinerary(it: GaiaItinerary) {
  expect(it.days.length).toBeGreaterThan(0);
  for (const d of it.days) {
    expect(d.weather.tempC).toBeGreaterThan(0);
    for (const s of d.steps) {
      expect(getPlace(s.placeId), s.placeId).toBeTruthy();
      expect(s.time).toMatch(/^\d{2}:\d{2}$/);
      expect(Number.isFinite(s.cost)).toBe(true);
      expect(s.cost).toBeGreaterThanOrEqual(0);
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.note.length).toBeGreaterThan(0);
    }
  }
}

/** Ningún paso fuera de horario (los hoteles abren 24 h). */
function assertOpenHours(it: GaiaItinerary, strictEnd: boolean) {
  for (const d of it.days) {
    for (const s of d.steps) {
      const p = getPlace(s.placeId)!;
      if (p.category === "dormir") continue;
      const start = toMin(s.time);
      expect(p.hours.days, `${p.id} abre el ${d.weekday}`).toContain(d.weekday);
      expect(start, `${p.id} ${s.time} >= ${p.hours.open}`).toBeGreaterThanOrEqual(toMin(p.hours.open));
      expect(start, `${p.id} ${s.time} < ${p.hours.close}`).toBeLessThan(toMin(p.hours.close));
      if (strictEnd) expect(start + s.durationMin, `${p.id} termina antes del cierre`).toBeLessThanOrEqual(toMin(p.hours.close) + 1);
    }
  }
}

/** No se repiten lugares (salvo el hotel: check-in, cena y desayuno). */
function assertNoRepeats(it: GaiaItinerary) {
  const seen = new Set<string>();
  for (const d of it.days)
    for (const s of d.steps) {
      const p = getPlace(s.placeId)!;
      if (p.category === "dormir") continue;
      expect(seen.has(s.placeId), `repetido: ${s.placeId}`).toBe(false);
      seen.add(s.placeId);
    }
}

function assertChronological(it: GaiaItinerary) {
  for (const d of it.days) {
    for (let i = 1; i < d.steps.length; i++) {
      const prev = d.steps[i - 1];
      const cur = d.steps[i];
      expect(toMin(cur.time), `${d.label}: ${prev.title} → ${cur.title}`).toBeGreaterThanOrEqual(
        toMin(prev.time) + prev.durationMin + (cur.travelFromPrevMin ?? 0) - 1,
      );
    }
  }
}

describe("Escenarios guionizados", () => {
  it("suman $246, $118 y $71", async () => {
    const expected = [246, 118, 71];
    for (let i = 0; i < SCENARIOS.length; i++) {
      const r = await planWithGaia(SCENARIOS[i].chip);
      expect(r.mode).toBe("scenario");
      expect(itineraryTotal(r.itinerary!)).toBe(expected[i]);
      expect(itineraryTotal(r.itinerary!)).toBeLessThanOrEqual(r.itinerary!.budget);
    }
  });

  it("el prompt completo también activa el escenario", async () => {
    for (const sc of SCENARIOS) {
      const r = await planWithGaia(sc.prompt);
      expect(r.mode).toBe("scenario");
      expect(r.itinerary!.id).toBe(sc.itinerary.id);
    }
  });

  it("los escenarios respetan los horarios de apertura", async () => {
    for (const sc of SCENARIOS) {
      const r = await planWithGaia(sc.chip);
      assertOpenHours(r.itinerary!, false);
    }
  });
});

describe("Cualquier texto devuelve un resultado válido", () => {
  it.each(RANDOM_INPUTS)("«%s»", async (input) => {
    const r = await planWithGaia(input);
    expect(["scenario", "generated", "adjusted", "out_of_scope"]).toContain(r.mode);
    expect(r.reply.length).toBeGreaterThan(10);
    expect(r.thinking.length).toBeGreaterThan(0);
    if (r.mode === "out_of_scope") {
      expect(r.itinerary).toBeUndefined();
      expect(r.suggestions?.length).toBeGreaterThan(0);
    } else {
      assertValidItinerary(r.itinerary!);
    }
  });

  it("no rompe con entradas no string", async () => {
    // @ts-expect-error prueba de robustez
    const r = await planWithGaia(undefined);
    expect(r.reply.length).toBeGreaterThan(0);
  });

  it("playa y discoteca responden fuera de alcance con una alternativa", async () => {
    const a = await planWithGaia("playa");
    expect(a.mode).toBe("out_of_scope");
    expect(a.reply).toMatch(/Las Caras/);
    const b = await planWithGaia("discoteca");
    expect(b.mode).toBe("out_of_scope");
  });
});

describe("Generador", () => {
  const generated = RANDOM_INPUTS.filter((x) => !/playa|discoteca/.test(x));

  it("no agenda nada fuera de horario ni repite lugares", async () => {
    for (const input of generated) {
      const r = await planWithGaia(input);
      if (!r.itinerary) continue;
      if (r.mode === "generated") {
        assertOpenHours(r.itinerary, true);
        assertChronological(r.itinerary);
      }
      assertNoRepeats(r.itinerary);
    }
  });

  it("respeta el presupuesto", async () => {
    const cases = [
      "2 adultos, un día, $40",
      "familia 2 adultos 2 niños, fin de semana, $150",
      "solo, medio día, $20",
      "6 amigos, 2 días, $300",
      "$10 para 6 personas",
      "pareja, 3 días, $200",
      "un día con $5",
      "family of 4, weekend, $90",
    ];
    for (const c of cases) {
      const r = await planWithGaia(c);
      expect(r.itinerary, c).toBeTruthy();
      expect(itineraryTotal(r.itinerary!), c).toBeLessThanOrEqual(r.itinerary!.budget);
    }
  });

  it("interpreta días, grupo y presupuesto", async () => {
    const r = await planWithGaia("3 adultos y 1 niño, 2 días, $300, nos gusta la naturaleza");
    const it = r.itinerary!;
    expect(it.group).toMatchObject({ adults: 3, kids: 1, type: "familia" });
    expect(it.budget).toBe(300);
    expect(it.days.length).toBe(2);
    // con niños no hay bares
    for (const d of it.days) for (const s of d.steps) expect(getPlace(s.placeId)!.category).not.toBe("beber");
  });

  it("medio día arranca a las 10:00 con 3 o 4 paradas", async () => {
    const r = await planWithGaia("medio día para dos, cultura");
    const steps = r.itinerary!.days[0].steps;
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps.length).toBeLessThanOrEqual(4);
    expect(toMin(steps[0].time)).toBeGreaterThanOrEqual(600);
  });

  it("por defecto calcula $60 por persona por día", async () => {
    const r = await planWithGaia("un día para 3 personas");
    expect(r.itinerary!.budget).toBe(180);
  });
});

describe("Cambiar, quitar y ajustar", () => {
  it("Cambiar por otra cambia el almuerzo y actualiza el presupuesto", async () => {
    const r = await planWithGaia(SCENARIOS[0].chip);
    const it = r.itinerary!;
    const s = it.days[0].steps.findIndex((x) => x.placeId === "r-volquetero");
    const res = swapStepWithInfo(it, 0, s);
    expect(res.changed).toBe(true);
    const next = res.itinerary;
    expect(next.days[0].steps[s].placeId).not.toBe("r-volquetero");
    expect(getPlace(next.days[0].steps[s].placeId)!.category).toBe("comer");
    expect(itineraryTotal(next)).not.toBe(246);
    expect(itineraryTotal(next)).toBeLessThanOrEqual(250);
    assertNoRepeats(next);
    assertOpenHours(next, false);
    // otro cambio propone una tercera opción
    const third = swapStep(next, 0, s);
    expect(third.days[0].steps[s].placeId).not.toBe(next.days[0].steps[s].placeId);
  });

  it("Quitar elimina el paso", async () => {
    const r = await planWithGaia(SCENARIOS[1].chip);
    const n = r.itinerary!.days[0].steps.length;
    const out = removeStep(r.itinerary!, 0, 2);
    expect(out.days[0].steps.length).toBe(n - 1);
  });

  it("«algo más barato» baja el total", async () => {
    const r = await planWithGaia(SCENARIOS[0].chip);
    const adj = await planWithGaia("algo más barato", r.itinerary);
    expect(adj.mode).toBe("adjusted");
    expect(itineraryTotal(adj.itinerary!)).toBeLessThan(246);
    expect(adj.reply).toMatch(/Listo/);
    assertNoRepeats(adj.itinerary!);
  });

  it("«sin cuy» saca el Fogón", async () => {
    const r = await planWithGaia(SCENARIOS[0].chip);
    const adj = await planWithGaia("sin cuy", r.itinerary);
    const ids = adj.itinerary!.days.flatMap((d) => d.steps.map((s) => s.placeId));
    expect(ids).not.toContain("r-fogon");
  });

  it("«agrega algo de noche» suma una parada nocturna", async () => {
    const r = await planWithGaia(SCENARIOS[1].chip);
    const before = r.itinerary!.days.reduce((a, d) => a + d.steps.length, 0);
    const base = removeStep(r.itinerary!, 0, r.itinerary!.days[0].steps.length - 1); // quita el bar final
    const adj = await planWithGaia("agrega algo de noche", base);
    const after = adj.itinerary!.days.reduce((a, d) => a + d.steps.length, 0);
    expect(after).toBe(before);
    const last = adj.itinerary!.days[0].steps.at(-1)!;
    expect(toMin(last.time)).toBeGreaterThanOrEqual(19 * 60);
  });

  it("«otro día» mueve el plan y respeta horarios", async () => {
    const r = await planWithGaia(SCENARIOS[1].chip);
    const adj = await planWithGaia("otro día", r.itinerary);
    expect(adj.itinerary!.days[0].weekday).toBe("dom");
    assertOpenHours(adj.itinerary!, false);
  });

  it("un texto ambiguo con contexto no rompe el plan", async () => {
    const r = await planWithGaia(SCENARIOS[2].chip);
    const adj = await planWithGaia("mmm", r.itinerary);
    expect(adj.itinerary).toBeTruthy();
    expect(adj.reply.length).toBeGreaterThan(10);
  });

  it("todos los lugares del catálogo tienen coordenadas válidas", () => {
    for (const p of PLACES) {
      expect(p.lat).toBeLessThan(-1.2);
      expect(p.lng).toBeLessThan(-78.4);
    }
  });
});

describe("Agregar a mi plan (addPlace)", () => {
  it("suma un lugar compatible a un plan existente sin repetir ni salirse de horario", async () => {
    const { addPlace } = await import("@/lib/gaia");
    const base = (await planWithGaia(SCENARIOS[0].chip)).itinerary!;
    let added = 0;
    for (const p of PLACES) {
      const r = addPlace(base, p.id);
      if (!r.changed) continue;
      added++;
      const ids = r.itinerary.days.flatMap((d) => d.steps.map((s) => s.placeId));
      expect(ids).toContain(p.id);
      for (const d of r.itinerary.days)
        for (const s of d.steps) {
          const pl = getPlace(s.placeId)!;
          if (pl.category === "dormir") continue;
          expect(pl.hours.days).toContain(d.weekday);
        }
    }
    expect(added).toBeGreaterThan(10);
  });
  it("avisa si el lugar ya está en el plan", async () => {
    const { addPlace } = await import("@/lib/gaia");
    const base = (await planWithGaia(SCENARIOS[0].chip)).itinerary!;
    const id = base.days[0].steps[0].placeId;
    expect(addPlace(base, id).reply).toMatch(/ya está/);
  });
  it("si no encaja, planWithGaia con forced arma un plan que lo incluye", async () => {
    const r = await planWithGaia("1 día en pareja", undefined, ["e-tejido"]);
    const ids = r.itinerary!.days.flatMap((d) => d.steps.map((s) => s.placeId));
    expect(ids).toContain("e-tejido");
  });
});

describe("Gaia · preguntas y pedidos puntuales", () => {
  const base = async () => (await planWithGaia(SCENARIOS[0].chip)).itinerary as GaiaItinerary;
  const ids = (it: GaiaItinerary) => it.days.flatMap((d) => d.steps.map((s) => s.placeId));

  it("una pregunta de clima no mueve el plan", async () => {
    const b = await base();
    const r = await planWithGaia("¿qué tiempo hará el sábado?", b);
    expect(r.itinerary).toBe(b);
    expect(r.reply).toMatch(/Sábado: \d+°/);
  });

  it("«cuánto cuesta todo» responde el total sin cambiar nada", async () => {
    const b = await base();
    const r = await planWithGaia("cuánto cuesta todo", b);
    expect(r.itinerary).toBe(b);
    expect(r.reply).toContain(`$${itineraryTotal(b)}`);
  });

  it("«agrega parapente» suma el vuelo biplaza (pareja)", async () => {
    const b = (await planWithGaia("Somos una pareja, 2 días tranquilos con $300")).itinerary as GaiaItinerary;
    const r = await planWithGaia("agrega parapente", b);
    expect(ids(r.itinerary as GaiaItinerary)).toContain("e-parapente");
  });

  it("con niños, explica que el parapente no es apto en vez de sumarlo", async () => {
    const b = await base();
    const r = await planWithGaia("agrega parapente", b);
    expect(r.itinerary).toBe(b);
    expect(r.reply).toMatch(/no es apto para niños/);
  });

  it("«cambia el hotel» cambia el hospedaje", async () => {
    const b = await base();
    const before = ids(b).filter((id) => getPlace(id)?.category === "dormir");
    const r = await planWithGaia("cambia el hotel", b);
    const after = ids(r.itinerary as GaiaItinerary).filter((id) => getPlace(id)?.category === "dormir");
    expect(after[0]).not.toBe(before[0]);
    expect(r.reply).toMatch(/duermes en/);
  });

  it("«quita lo opcional» no deja frases rotas", async () => {
    const b = await base();
    const r = await planWithGaia("quita lo opcional", b);
    expect(r.reply).not.toMatch(/nada de lo/);
    expect((r.itinerary as GaiaItinerary).days.flatMap((d) => d.steps).some((s) => s.optional)).toBe(false);
  });

  it("saludos y gracias responden amable sin tocar el plan", async () => {
    const b = await base();
    for (const t of ["hola", "gracias"]) {
      const r = await planWithGaia(t, b);
      expect(r.itinerary).toBe(b);
      expect(r.reply.length).toBeGreaterThan(20);
    }
  });
});
