// Recorre la portada con scroll y abre el demo de Gaia. Capturas en screens/home.
// Uso: node scripts/home.mjs [--base=http://localhost:3000] [--widths=390,1440]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
const BASE = args.base || "http://localhost:3000";
const OUT = args.out || "screens/home";
const WIDTHS = String(args.widths || "390,1440").split(",").map(Number);
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const errors = [];
for (const w of WIDTHS) {
  const h = w < 768 ? 844 : 900;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 1024, isMobile: w < 768 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("vp:booted", "1"); } catch {} });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${w}] ${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`[${w}] pageerror: ${e.message}`));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await sleep(4500);
  await page.screenshot({ path: `${OUT}/${w}-00-hero.png` });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (overflow) errors.push(`[${w}] overflow horizontal`);
  let i = 1;
  for (let y = h * 0.9; y < total; y += h * 0.9) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await sleep(900);
    await page.screenshot({ path: `${OUT}/${w}-${String(i++).padStart(2, "0")}.png` });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(800);
  await page.getByRole("button", { name: /Armar mi plan/ }).first().click();
  await sleep(1200);
  await page.screenshot({ path: `${OUT}/${w}-gaia-pensando.png` });
  await sleep(5500);
  await page.screenshot({ path: `${OUT}/${w}-gaia-plan.png` });
  await page.getByRole("button", { name: /Ver en el mapa y ajustar/ }).click();
  await sleep(3000);
  await page.screenshot({ path: `${OUT}/${w}-gaia-pagina.png` });
  await ctx.close();
}
await browser.close();
console.log(errors.length ? errors.join("\n") : "sin errores de consola");
