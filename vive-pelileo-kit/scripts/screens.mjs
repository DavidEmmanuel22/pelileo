// Capturas de todas las rutas con Playwright.
// Uso: node scripts/screens.mjs [--base=http://localhost:3000] [--widths=390,1440] [--out=screens] [--routes=/,/gaia] [--boot]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

const BASE = args.base || "http://localhost:3000";
const OUT = args.out || "screens";
const WIDTHS = String(args.widths || "390,1440")
  .split(",")
  .map(Number);
const HEIGHT_FOR = (w) => (w < 768 ? 844 : w < 1024 ? 1024 : 900);
const ROUTES = String(
  args.routes || "/,/explorar,/lugar/niton-mirador,/eventos,/gaia,/guardados,/municipio,/dev/mapa",
).split(",");
const WAIT = Number(args.wait || 2600);

mkdirSync(OUT, { recursive: true });

const slug = (r) => (r === "/" ? "inicio" : r.replace(/^\//, "").replace(/[/?=&]+/g, "-"));

const browser = await chromium.launch();
const errors = [];
for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: HEIGHT_FOR(w) },
    deviceScaleFactor: 2,
    hasTouch: w < 1024,
    isMobile: w < 768,
  });
  if (!args.boot) {
    await ctx.addInitScript(() => {
      try {
        sessionStorage.setItem("vp:booted", "1");
      } catch {}
    });
  }
  for (const r of ROUTES) {
    const page = await ctx.newPage();
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") errors.push(`[${w}] ${r} ${m.type()}: ${m.text()}`);
    });
    page.on("pageerror", (e) => errors.push(`[${w}] ${r} pageerror: ${e.message}`));
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(WAIT);
    const file = join(OUT, `${slug(r)}-${w}.png`);
    await page.screenshot({ path: file, fullPage: args.full === true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (overflow) errors.push(`[${w}] ${r} OVERFLOW horizontal`);
    console.log("✓", file);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
if (errors.length) {
  console.log("\nProblemas:");
  for (const e of [...new Set(errors)]) console.log(" -", e);
} else console.log("\nSin errores de consola ni desbordes.");
