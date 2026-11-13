// Captura las pantallas de la demo Vive Pelileo para usarlas como pantallas flotantes.
// Requiere la demo corriendo: cd ../vive-pelileo-kit && npm run dev (puerto 3000)
// Uso: node scripts/demo-shots.mjs [--base=http://localhost:3000]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] || "http://localhost:3000";
const OUT = "assets/screens";
mkdirSync(OUT, { recursive: true });

const HIDE = `nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }`;

async function mobile(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  const go = async (path, wait = 1800) => {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: HIDE });
    await page.waitForTimeout(wait);
  };
  const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });

  await go("/", 2600);
  await shot("inicio");
  await page.mouse.wheel(0, 900);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.2));
  await page.waitForTimeout(2600);
  await shot("inicio-abajo");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3.4));
  await page.waitForTimeout(2600);
  await shot("inicio-abajo-2");

  await go("/lugar/niton-mirador", 2000);
  await shot("lugar");
  await go("/lugar/r-fogon", 2000);
  await shot("lugar-fogon");

  await go("/explorar", 3600);
  await shot("mapa");

  await go("/eventos", 2200);
  await shot("agenda");

  await go("/gaia", 1400);
  await shot("gaia-inicio");
  await page.getByRole("button", { name: /Plan familiar/ }).first().click();
  await page.waitForTimeout(5200);
  await shot("gaia-chat");
  await page.getByRole("button", { name: "Guardar plan" }).first().waitFor({ timeout: 25000 });
  await page.waitForTimeout(1800);
  await shot("gaia-itinerario");
  await ctx.close();
}

async function desktop(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE + "/municipio", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/municipio.png` });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${OUT}/inicio-escritorio.png` });
  await ctx.close();
}

const browser = await chromium.launch();
await mobile(browser);
await desktop(browser);
await browser.close();
console.log("Capturas listas en", OUT);
