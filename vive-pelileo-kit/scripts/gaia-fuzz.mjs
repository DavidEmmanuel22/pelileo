// 30 entradas variadas escritas en la caja de Gaia, en la interfaz real.
// Verifica que Gaia siempre responda algo útil, que no queden en blanco y que no haya errores.
// Uso: node scripts/gaia-fuzz.mjs [--base=http://localhost:3000] [--width=390]
import { chromium } from "playwright";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.join("=") || true];
  }),
);
const BASE = args.base || "http://localhost:3000";
const W = Number(args.width || 390);

const INPUTS = [
  "2 días en familia con $200",
  "algo más barato",
  "sin cuy",
  "quiero más aventura",
  "somos 6 amigos, un fin de semana, $600",
  "más tranquilo, vamos con mi abuela",
  "medio día, solo compras de jean",
  "$10 para 6 personas",
  "quiero ver el volcán",
  "cambia el hotel",
  "3 días en pareja romántico $350",
  "agrega parapente",
  "no me gusta caminar",
  "vegetariano",
  "¿qué tiempo hará el sábado?",
  "hola",
  "asdkjh qwe zzz",
  "quiero ir a la playa",
  "plan de 1 día con niños pequeños y $50",
  "más barato todavía",
  "empezar más tarde",
  "llévame a Salasaca",
  "cuánto cuesta todo",
  "5 días mochilero $90",
  "un día gastronómico, quiero probar de todo",
  "quita lo opcional",
  "😀😀😀",
  "PLAN PARA 2 DIAS CON 300 DOLARES",
  "algo cultural y museos",
  "gracias",
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: W, height: W < 768 ? 844 : 900 },
  reducedMotion: "reduce",
  isMobile: W < 768,
  hasTouch: W < 1024,
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
await page.goto(BASE + "/gaia", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const lastMsg = () =>
  page.evaluate(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem("vp:gaia") || "null");
      const m = s?.messages?.[s.messages.length - 1];
      return m ? { id: m.id, role: m.role, kind: m.kind, text: m.text, plan: !!s.itinerary } : null;
    } catch {
      return null;
    }
  });

const bad = [];
let i = 0;
for (const text of INPUTS) {
  i++;
  const before = await lastMsg();
  await page.locator("#gaia-input").fill(text);
  await page.keyboard.press("Enter");
  let after = null;
  for (let t = 0; t < 60; t++) {
    await page.waitForTimeout(250);
    after = await lastMsg();
    if (after && after.id !== before?.id && after.role === "gaia") break;
  }
  const ok = after && after.id !== before?.id && after.role === "gaia" && after.text.trim().length > 12;
  const voseo = /\b(querés|tenés|podés|sabés|vos)\b/i.test(after?.text ?? "");
  console.log(`${ok && !voseo ? "✓" : "✗"} ${String(i).padStart(2)}. «${text}» → [${after?.kind}] ${(after?.text ?? "").slice(0, 110).replace(/\s+/g, " ")}`);
  if (!ok || voseo) bad.push(text);
  await page.waitForTimeout(300);
}
await page.screenshot({ path: "screens/fase7/gaia-fuzz-final.png" });
await browser.close();
console.log(`\n${INPUTS.length - bad.length}/${INPUTS.length} respuestas útiles · errores de consola: ${errs.length}`);
if (errs.length) console.log(errs.slice(0, 5).join("\n"));
process.exit(bad.length || errs.length ? 1 : 0);
