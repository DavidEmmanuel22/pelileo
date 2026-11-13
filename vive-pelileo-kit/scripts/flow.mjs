// Captura tras una secuencia de acciones.
// Uso: node scripts/flow.mjs <ruta> <ancho> <salida.png> [acciones...]
// Acciones: "click:Texto" · "role:button:Nombre" · "wait:ms" · "type:selector:texto" · "press:Enter" · "sel:css" · "scroll:css:px"
import { chromium } from "playwright";

const [route, width, out, ...steps] = process.argv.slice(2);
const w = Number(width);
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: w, height: w < 768 ? 844 : w < 1024 ? 1024 : 900 },
  deviceScaleFactor: 2,
  hasTouch: w < 1024,
  isMobile: w < 768,
});
await ctx.addInitScript(() => {
  try {
    sessionStorage.setItem("vp:booted", "1");
  } catch {}
});
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errs.push(m.text()));
page.on("pageerror", (e) => errs.push(e.message));
await page.goto("http://localhost:3000" + route, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
for (const s of steps) {
  const [cmd, ...rest] = s.split(":");
  const arg = rest.join(":");
  if (cmd === "click") await page.getByText(arg, { exact: false }).first().click();
  else if (cmd === "role") {
    const [role, ...name] = rest;
    await page.getByRole(role, { name: name.join(":") }).first().click();
  } else if (cmd === "wait") await page.waitForTimeout(Number(arg));
  else if (cmd === "type") {
    const [sel, ...txt] = rest;
    await page.locator(sel).first().fill(txt.join(":"));
  } else if (cmd === "press") await page.keyboard.press(arg);
  else if (cmd === "sel") await page.locator(arg).first().click();
  else if (cmd === "scroll") {
    const [sel, px] = rest;
    await page.locator(sel).first().evaluate((el, y) => el.scrollBy(0, Number(y)), px);
  }
}
await page.waitForTimeout(600);
await page.screenshot({ path: out });
console.log("✓", out, errs.length ? "\nErrores:\n - " + [...new Set(errs)].join("\n - ") : "");
await browser.close();
