// Revisión visual por escena: capturas en varios anchos + video del scroll (Playwright recordVideo)
// y una hoja de cuadros del video para revisar el movimiento.
// Uso: node scripts/screens.mjs --scenes=inicio,problema [--widths=390,1440] [--video] [--steps=0,0.5,1] [--preload]
import { chromium } from "playwright";
import ffmpeg from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.join("=") || true];
  }),
);
const BASE = args.base || "http://localhost:3001";
const OUT = args.out || "review";
const WIDTHS = String(args.widths || "390,1440").split(",").map(Number);
const SCENES = String(args.scenes || "inicio").split(",");
const STEPS = String(args.steps || "0,0.33,0.66,1").split(",").map(Number);
const REDUCED = !!args.reduced;
mkdirSync(OUT, { recursive: true });

const errors = [];

async function measure(page, id) {
  return page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const box = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
    const top = box.getBoundingClientRect().top + window.scrollY;
    let len = Math.max(0, box.offsetHeight - window.innerHeight);
    const sts = (window.__ST?.getAll() ?? []).filter((t) => t.trigger === el && t.pin);
    for (const t of sts) len = Math.max(len, t.end - top);
    return { top, len, vh: window.innerHeight };
  }, id);
}

async function scrollTo(page, y) {
  await page.evaluate((y) => {
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  }, y);
}

async function run(w) {
  const h = w < 768 ? 844 : w >= 1900 ? 1080 : 900;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: w < 768 ? 2 : 1,
    isMobile: w < 768,
    hasTouch: w < 768,
    reducedMotion: REDUCED ? "reduce" : "no-preference",
    ...(args.video ? { recordVideo: { dir: `${OUT}/_vid`, size: { width: Math.min(w, 1280), height: Math.round((Math.min(w, 1280) / w) * h) } } } : {}),
  });
  if (!args.preload) await ctx.addInitScript(() => sessionStorage.setItem("vive:precarga", "1"));
  const page = await ctx.newPage();
  const t0 = Date.now();
  const clips = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(`[${w}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${w}] ${e.message}`));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(args.preload ? 2600 : 1600);

  // Ancho: ¿hay desborde horizontal?
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) errors.push(`[${w}] desborde horizontal de ${overflow}px`);

  for (const id of SCENES) {
    const m = await measure(page, id);
    if (!m) {
      errors.push(`[${w}] no existe #${id}`);
      continue;
    }
    for (const [k, s] of STEPS.entries()) {
      await scrollTo(page, m.top + m.len * s);
      await page.waitForTimeout(args.wait ? Number(args.wait) : 1100);
      await page.screenshot({ path: `${OUT}/${id}-${w}-${k}.png` });
    }
    if (args.video) {
      // recorrido continuo del scroll por la escena
      const from = Math.max(0, m.top - m.vh * 0.6);
      const to = m.top + m.len + m.vh * 0.2;
      await scrollTo(page, from);
      await page.waitForTimeout(500);
      const clipStart = (Date.now() - t0) / 1000;
      const dur = Math.min(9000, Math.max(3500, ((to - from) / m.vh) * 1500));
      await page.evaluate(
        ({ from, to, dur }) =>
          new Promise((res) => {
            const t0 = performance.now();
            const step = (t) => {
              const p = Math.min(1, (t - t0) / dur);
              const y = from + (to - from) * p;
              if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
              else window.scrollTo(0, y);
              if (p < 1) requestAnimationFrame(step);
              else res();
            };
            requestAnimationFrame(step);
          }),
        { from, to, dur },
      );
      clips.push({ id, ss: clipStart, t: dur / 1000 + 0.6 });
      await page.waitForTimeout(800);
    }
  }
  const video = page.video();
  await ctx.close();
  await browser.close();
  if (video) {
    const p = await video.path();
    const name = `${OUT}/${SCENES.join("+")}-${w}.webm`;
    renameSync(p, name);
    // hoja de cuadros del recorrido de cada escena (20 cuadros repartidos)
    const n = w < 768 ? 16 : 20;
    for (const c of clips)
      execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(c.ss), "-t", String(c.t), "-i", name, "-vf", `fps=${(n / c.t).toFixed(3)},scale=${w < 768 ? 220 : 400}:-2,tile=${w < 768 ? 8 : 5}x${w < 768 ? 2 : 4}`, "-frames:v", "1", `${OUT}/${c.id}-${w}-frames.jpg`]);
  }
}

for (const w of WIDTHS) await run(w);
try {
  rmSync(`${OUT}/_vid`, { recursive: true, force: true });
} catch {}
console.log(errors.length ? "PROBLEMAS:\n" + [...new Set(errors)].join("\n") : "Sin errores de consola ni desbordes.");
console.log(readdirSync(OUT).filter((f) => SCENES.some((s) => f.startsWith(s))).join("\n"));
