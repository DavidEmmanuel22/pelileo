// Busca y descarga fotos de uso libre en Wikimedia Commons para lugares y eventos.
// Escribe public/images/{places,events}/<id>.jpg, public/images/credits.json y lib/images.generated.ts.
// Uso: node scripts/fetch-photos.mjs [--only=id1,id2] [--skip=id] [--force]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const places = JSON.parse(readFileSync(new URL("../data/places.json", import.meta.url)));
const events = JSON.parse(readFileSync(new URL("../data/events.json", import.meta.url)));
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const only = args.only ? args.only.split(",") : null;
const UA = "VivePelileoDemo/1.0 (demo turistica sin fines comerciales)";

// Búsquedas alternativas (Commons responde mejor a términos simples)
const Q = {
  "tambo-ruta-jean": ["Pelileo jeans", "jeans shop", "denim jeans stack"],
  "parque-central": ["Pelileo iglesia", "Pelileo", "iglesia Tungurahua Ecuador"],
  "feria-pelileo": ["mercado Ambato frutas", "Ecuador market fruit", "mercado frutas Ecuador"],
  "salasaca-plaza-arte": ["Salasaca", "Salasaca tapestry", "Ecuador indigenous weaving"],
  "salasaca-llikakama": ["Salasaca market", "Otavalo market textiles", "Ecuador handicraft market"],
  "niton-mirador": ["paragliding Andes mountains", "paragliding mountain valley", "paraglider mountains"],
  "pelileo-grande": ["ruinas iglesia Ecuador", "church ruins", "ruined church stone"],
  "huambalo-muebles": ["Huambalo", "wood furniture workshop", "carpenter workshop wood"],
  "ruta-gigantes": ["Pelileo escultura", "wooden sculpture giant", "wood sculpture Ecuador"],
  teligote: ["Teligote", "Andean forest Ecuador", "cloud forest trail Ecuador"],
  "cotalo-cruz": ["Tungurahua volcano", "Tungurahua", "volcan Tungurahua"],
  "las-caras": ["cascada Ecuador", "waterfall Ecuador", "waterfall Baños Ecuador"],
  "r-indigo": ["latte art coffee cup", "cappuccino cafe table", "specialty coffee"],
  "r-volquetero": ["fritada Ecuador", "comida tipica Ecuador", "Ecuadorian food"],
  "r-fogon": ["cuy asado", "hornado Ecuador", "Ecuadorian roast pork"],
  "r-trucha": ["grilled trout", "trucha frita", "fried trout plate"],
  "r-tiesto": ["empanadas", "empanadas de viento Ecuador", "empanadas plate"],
  "r-huerta": ["vegetable garden", "organic vegetable garden", "farm vegetables harvest"],
  "r-niton-cafe": ["breakfast eggs bread coffee table", "breakfast plate coffee", "desayuno"],
  "b-cerveceria": ["craft beer glasses", "craft beer bar", "brewery taps"],
  "b-costura": ["cocktail bar", "cocktail glass bar", "cocktails"],
  "h-hosteria": ["hacienda Ecuador", "hosteria Ecuador", "hotel swimming pool mountains"],
  "h-ciudad-azul": ["hotel bedroom", "hotel room", "hotel room double bed"],
  "h-telar": ["adobe house Ecuador", "casa de adobe", "Andean village house"],
  "h-glamping": ["glamping dome", "geodesic dome tent", "glamping"],
  "e-parapente": ["tandem paragliding", "paragliding tandem", "paraglider"],
  "e-tejido": ["backstrap loom weaving", "telar de cintura", "weaving loom hands"],
  "e-jean": ["sewing machine", "jeans sewing", "tailor workshop"],
  "e-cabalgata": ["horseback riding Ecuador", "horse riding Andes", "horseback riding mountain"],
  "e-tallado": ["wood carving", "woodcarving tools", "wood carver"],
  "e-cosecha": ["strawberry picking", "apple picking", "fruit harvest basket"],
  "ev-feria-jean": ["denim jeans", "jeans stack", "jeans shop"],
  "ev-feria-salasaca": ["Salasaca", "Otavalo market", "Andean textiles market"],
  "ev-musica-andina": ["Andean music band", "musica andina", "Andean musicians"],
  "ev-sabores": ["street food festival", "food festival", "Ecuador street food"],
  "ev-trail-teligote": ["trail running mountain", "trail running", "mountain race runners"],
  "ev-parapente-open": ["paragliding festival", "paragliders sky", "paragliding"],
  "ev-pase-nino": ["Pase del Niño", "Pase del Niño Viajero", "desfile Ecuador"],
  "ev-cine": ["outdoor cinema", "open air cinema", "cinema screen night"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  for (let i = 0; i < 4; i++) {
    await sleep(1200);
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status !== 429) return r;
    await sleep(6000 * (i + 1));
  }
  throw new Error("HTTP 429");
}

async function search(q) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${q} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1400",
  }).toString();
  const r = await get(u);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const pages = Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  return pages
    .map((p) => ({ title: p.title, ii: p.imageinfo?.[0] }))
    .filter(
      ({ ii, title }) =>
        ii &&
        /jpe?g/i.test(ii.mime) &&
        ii.width >= 900 &&
        ii.width >= ii.height * 1.05 &&
        !/map|mapa|logo|diagram|flag|bandera|coat|escudo|stamp|\.svg/i.test(title),
    );
}

const creditsPath = "public/images/credits.json";
const credits = existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath)) : {};

const strip = (h = "") => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function fetchOne(item, kind) {
  const dir = `public/images/${kind}`;
  mkdirSync(dir, { recursive: true });
  const file = `${dir}/${item.id}.jpg`;
  if (existsSync(file) && !args.force) return { id: item.id, kind, cached: true };
  const queries = Q[item.id] ?? [item.imageQuery];
  const skip = (args.skip || "").split("|");
  if (args.force && credits[item.id]?.title) skip.push(credits[item.id].title);
  for (const c of Object.values(credits)) if (c.id !== item.id && c.title) skip.push(c.title);
  for (const q of queries) {
    try {
      const res = await search(q);
      const pick = res.find((r) => !skip.includes(r.title));
      if (!pick) continue;
      const img = await get(pick.ii.thumburl || pick.ii.url);
      if (!img.ok) continue;
      const buf = Buffer.from(await img.arrayBuffer());
      writeFileSync(file, buf);
      const md = pick.ii.extmetadata || {};
      return {
        id: item.id,
        kind,
        query: q,
        title: pick.title,
        source: pick.ii.descriptionurl,
        author: strip(md.Artist?.value) || "Desconocido",
        license: strip(md.LicenseShortName?.value) || "Ver fuente",
      };
    } catch (e) {
      console.warn("  ✗", item.id, q, e.message);
    }
  }
  return null;
}

const jobs = [...places.map((p) => [p, "places"]), ...events.map((e) => [e, "events"])].filter(
  ([it]) => !only || only.includes(it.id),
);
for (const [it, kind] of jobs) {
  const r = await fetchOne(it, kind);
  if (r && !r.cached) {
    credits[it.id] = r;
    console.log("✓", it.id, "←", r.title, `(${r.license})`);
  } else if (!r) console.log("· sin foto:", it.id);
}
writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
const ids = (kind) =>
  [...(kind === "places" ? places : events)].map((x) => x.id).filter((id) => existsSync(`public/images/${kind}/${id}.jpg`));
writeFileSync(
  "lib/images.generated.ts",
  `// Generado por scripts/fetch-photos.mjs — ids con foto descargada.\nexport const PLACE_IMAGE_IDS: string[] = ${JSON.stringify(ids("places"))};\nexport const EVENT_IMAGE_IDS: string[] = ${JSON.stringify(ids("events"))};\n`,
);
console.log(`\nLugares con foto: ${ids("places").length}/${places.length} · Eventos: ${ids("events").length}/${events.length}`);
