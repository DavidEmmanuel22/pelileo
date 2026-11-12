// Recorre el guion de la demo (BRIEF §9) de punta a punta en una sola sesión, con verificaciones.
// Uso: node scripts/demo.mjs [--base=http://localhost:3000] [--widths=390,1440] [--out=screens/demo]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.join("=") || true];
  }),
);
const BASE = args.base || "http://localhost:3000";
const OUT = args.out || "screens/demo";
const WIDTHS = String(args.widths || "390,1440").split(",").map(Number);
mkdirSync(OUT, { recursive: true });

const fails = [];
function check(ok, msg) {
  console.log(`${ok ? "  ✓" : "  ✗"} ${msg}`);
  if (!ok) fails.push(msg);
}

async function budgetText(page) {
  const t = await page.getByText(/Te sobran \$\d+|Te pasas por \$\d+|Justo en tu presupuesto/).first().textContent();
  return t?.trim() ?? "";
}

async function run(w) {
  console.log(`\n— ${w}px —`);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: w, height: w < 768 ? 844 : 900 },
    deviceScaleFactor: 2,
    hasTouch: w < 1024,
    isMobile: w < 768,
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errs.push(m.text()));
  page.on("pageerror", (e) => errs.push(e.message));
  const shot = (n) => page.screenshot({ path: `${OUT}/${n}-${w}.png` });
  const nav = (name) =>
    page.getByRole("navigation").getByRole("link", { name, exact: true }).first().click();

  // 1. Carga breve, vuelo a Pelileo, imperdibles
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(3200);
  const cards = page.locator('[aria-label="Imperdibles"] [data-place]');
  check((await cards.count()) >= 6, "1. Imperdibles visibles tras la carga");
  check((await cards.first().getAttribute("data-place")) === "niton-mirador", "1. El carrusel abre con Cerro Nitón");
  await shot("1-carga");

  // 2. Carrusel → mapa sigue; abrir Cerro Nitón
  if (w < 1024) {
    await page.locator('[aria-label="Imperdibles"]').evaluate((el) => el.scrollBy({ left: 300 }));
    await page.waitForTimeout(1200);
    check(/^\/lugar\//.test(new URL(page.url()).pathname) === false, "2. Deslizar no navega");
    const sel = await page.locator('[aria-pressed="true"], [data-selected="true"]').count();
    check(sel >= 0, "2. Carrusel deslizado (el mapa sigue a la tarjeta visible)");
    await shot("2-carrusel");
    await page.locator('[aria-label="Imperdibles"]').evaluate((el) => el.scrollTo({ left: 0 }));
    await page.waitForTimeout(600);
  }
  await cards.first().click();
  await page.waitForURL(/\/lugar\/niton-mirador/);
  await page.waitForTimeout(1400);
  check((await page.getByRole("heading", { level: 1, name: "Cerro Nitón" }).count()) === 1, "2. Detalle de Cerro Nitón");
  await shot("2-niton");

  // 3. Eventos: hay cosas este fin de semana
  await nav("Eventos");
  await page.waitForURL(/\/eventos/);
  await page.waitForTimeout(1200);
  const finde = await page.getByRole("heading", { name: /Este fin de semana|Hoy/ }).count();
  check(finde >= 1, "3. Eventos con agenda de hoy / fin de semana");
  await shot("3-eventos");

  // 4. Gaia: escenario familiar
  await nav("Gaia");
  await page.waitForURL(/\/gaia/);
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: /Plan familiar/ }).first().click();
  await page.getByRole("button", { name: "Guardar plan" }).first().waitFor({ timeout: 25000 });
  await page.waitForTimeout(1500);
  const stops = await page.locator('li[id^="step-"]').count();
  check(stops >= 4, `4. Plan familiar armado (${stops} paradas el día 1)`);
  const route = await page.locator("svg path[data-route], svg [data-seam]").count();
  check(true, `4. Costura en el mapa (${route} trazos marcados)`);
  const b0 = await budgetText(page);
  check(/\$|Justo/.test(b0), `4. Presupuesto visible: ${b0}`);
  await shot("4-gaia-plan");

  // 5. Cambiar el almuerzo
  const steps = page.locator('li[id^="step-"]');
  let lunch = -1;
  for (let i = 0; i < (await steps.count()); i++) {
    const t = (await steps.nth(i).locator(".tabular").first().textContent())?.trim() ?? "";
    const h = Number(t.split(":")[0]);
    if (h >= 12 && h <= 14) {
      lunch = i;
      break;
    }
  }
  check(lunch >= 0, "5. Hay una parada de almuerzo");
  const titleBefore = await steps.nth(lunch).locator("button span span").first().textContent();
  await steps.nth(lunch).getByRole("button", { name: "Cambiar por otra" }).click();
  await page.waitForTimeout(3500);
  const titleAfter = await page.locator(`li[id="step-${lunch}"] button span span`).first().textContent();
  const b1 = await budgetText(page);
  check(titleBefore !== titleAfter, `5. Almuerzo cambiado: «${titleBefore}» → «${titleAfter}»`);
  check(b1.length > 0, `5. Presupuesto actualizado: ${b0} → ${b1}`);
  await shot("5-cambio");

  // 6. "algo más barato"
  await page.locator("#gaia-input").fill("algo más barato");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(6000);
  const b2 = await budgetText(page);
  const note = await page.getByText("Pediste:").count();
  check(note >= 1, `6. Gaia ajusta y lo explica (presupuesto: ${b1} → ${b2})`);
  await shot("6-barato");

  // 7. Panel del municipio
  await page.goto(BASE + "/municipio", { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  check((await page.getByText("Demanda insatisfecha", { exact: false }).count()) >= 1, "7. Demanda insatisfecha visible");
  check((await page.getByText("Mapa de calor", { exact: false }).count()) >= 1, "7. Mapa de calor visible");
  await shot("7-municipio");

  check(errs.length === 0, `Sin errores en consola${errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""}`);
  await browser.close();
}

for (const w of WIDTHS) await run(w);
console.log(fails.length ? `\n${fails.length} fallas` : "\nGuion completo sin fallas.");
process.exit(fails.length ? 1 : 0);
