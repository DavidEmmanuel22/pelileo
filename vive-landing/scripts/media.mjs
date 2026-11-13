// Optimiza fotos, videos, pantallas y marca para la landing.
// Uso: npm run media   (idempotente: salta lo que ya existe; --force para rehacer)
import sharp from "sharp";
import ffmpeg from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import path from "node:path";

const FORCE = process.argv.includes("--force");
const HD = "../pelileo multimedia hd";
const KIT = "../vive-pelileo-kit/public";
const OUT = "public/media";
const P = `${OUT}/photos`;
const V = `${OUT}/video`;
for (const d of [P, V, "public/screens", "public/brand", "assets/brand", "public/logos"]) mkdirSync(d, { recursive: true });

/* ── Fotos ─────────────────────────────────────────────── */
const PHOTOS = {
  "lago-montana": `${HD}/Fotos HD/1.jpg`,
  "cerro-verde": `${HD}/Fotos HD/2.jpg`,
  "cumbre-noche": `${HD}/Fotos HD/3.jpg`,
  "laguna-refugio": `${HD}/Fotos HD/4.jpg`,
  "laguna-valle": `${HD}/Fotos HD/5.jpg`,
  "plato-tipico": `${HD}/Fotos HD/7.jpg`,
  "choclo-queso": `${HD}/Fotos HD/8.jpg`,
  "fritada": `${HD}/Fotos HD/9.jpg`,
  "trail": `${HD}/Fotos HD/10.jpg`,
  "caminantes": `${HD}/Fotos HD/11.jpg`,
  "telar": `${HD}/Fotos HD/12.jpg`,
  "jean": `${HD}/Fotos HD/13.jpg`,
  "sastre": `${HD}/Fotos HD/14.jpg`,
  "naranjillas": `${HD}/Fotos HD/15.jpg`,
  "mercado": `${HD}/Fotos HD/16.jpg`,
  "bici": `${HD}/Fotos HD/19.jpg`,
  "hosteria-patio": `${HD}/Fotos HD/20.jpg`,
  "hosteria": `${HD}/Fotos HD/21.jpg`,
  "suite": `${HD}/Fotos HD/22.jpg`,
  "llama": `${HD}/Fotos HD/23.jpg`,
  "comedor": `${HD}/Fotos HD/24.jpg`,
  "feria-noche": `${KIT}/images/events/ev-sabores.jpg`,
  "concierto": `${KIT}/images/events/ev-musica-andina.jpg`,
  "feria-artesanal": `${KIT}/images/events/ev-feria-salasaca.jpg`,
  "pase-nino": `${KIT}/images/events/ev-pase-nino.jpg`,
  "parapente": `${KIT}/images/places/e-parapente.jpg`,
  "bar": `${KIT}/images/places/b-costura.jpg`,
  "cafe": `${KIT}/images/places/r-indigo.jpg`,
  "volcan-nevado": `${KIT}/images/places/cotalo-cruz.jpg`,
  "mirador": `${KIT}/images/places/niton-mirador.jpg`,
  "plaza-arte": `${KIT}/images/places/salasaca-plaza-arte.jpg`,
  "trucha": `${KIT}/images/places/r-trucha.jpg`,
};

async function photo(slug, src) {
  const big = `${P}/${slug}`;
  if (!FORCE && existsSync(`${big}.webp`)) return;
  const base = sharp(src).rotate();
  const meta = await base.metadata();
  const w = Math.min(1800, meta.width ?? 1800);
  await base.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`${big}.webp`);
  await base.clone().resize({ width: w, withoutEnlargement: true }).avif({ quality: 52 }).toFile(`${big}.avif`);
  await base.clone().resize({ width: 900, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${big}-m.webp`);
  await base.clone().resize({ width: 900, withoutEnlargement: true }).avif({ quality: 50 }).toFile(`${big}-m.avif`);
  console.log("foto", slug);
}

/* ── Fotos de lugares (Gaia y reservas) ── */
const PLACES = ["r-indigo", "tambo-ruta-jean", "r-volquetero", "e-tejido", "salasaca-plaza-arte", "h-hosteria", "niton-mirador", "pelileo-grande", "r-fogon", "e-cosecha", "r-niton-cafe", "e-parapente", "teligote", "r-trucha", "las-caras", "b-costura", "parque-central", "h-telar"];
async function places() {
  mkdirSync(`${OUT}/places`, { recursive: true });
  for (const id of PLACES) {
    const out = `${OUT}/places/${id}.webp`;
    if (!FORCE && existsSync(out)) continue;
    await sharp(`${KIT}/images/places/${id}.jpg`).rotate().resize({ width: 640, height: 480, fit: "cover" }).webp({ quality: 74 }).toFile(out);
  }
}

/* ── Videos ────────────────────────────────────────────── */
const ff = (args) => execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
const enc = (crf) => ["-c:v", "libx264", "-preset", "veryfast", "-crf", String(crf), "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an"];

const VIDEOS = [
  // slug, fuente, inicio, duración
  ["crestas", `${HD}/videos HD/1.mp4`, 2, 14],
  ["hojas", `${HD}/videos HD/2.mp4`, 1, 10],
  ["volcan", `${HD}/videos HD/3.mp4`, 0, 7.2],
  ["cascada", `${HD}/videos HD/4.mp4`, 0, 5],
];

function video(slug, src, ss, t) {
  const o = `${V}/${slug}`;
  if (!FORCE && existsSync(`${o}-1080.mp4`)) return;
  const trim = ["-ss", String(ss), "-t", String(t), "-i", src];
  ff([...trim, "-vf", "scale=1920:-2", ...enc(25), `${o}-1080.mp4`]);
  ff([...trim, "-vf", "scale=1280:-2", ...enc(27), `${o}-720.mp4`]);
  // vertical 9:16 (muro de contenido y hero en celular)
  ff([...trim, "-vf", "crop=ih*9/16:ih,scale=720:1280", ...enc(27), `${o}-v.mp4`]);
  // pósters
  ff(["-ss", String(ss + 0.2), "-i", src, "-frames:v", "1", "-vf", "scale=1920:-2", "-q:v", "3", `${o}-poster.jpg`]);
  ff(["-ss", String(ss + 0.2), "-i", src, "-frames:v", "1", "-vf", "crop=ih*9/16:ih,scale=720:1280", "-q:v", "3", `${o}-v-poster.jpg`]);
  console.log("video", slug);
}

/* ── Pantallas de la app ───────────────────────────────── */
async function screens() {
  for (const f of readdirSync("assets/screens").filter((f) => f.endsWith(".png"))) {
    const slug = f.replace(/\.png$/, "");
    const out = `public/screens/${slug}.webp`;
    if (!FORCE && existsSync(out)) continue;
    const w = slug === "municipio" || slug === "inicio-escritorio" ? 1800 : 780;
    await sharp(`assets/screens/${f}`).resize({ width: w }).webp({ quality: 84 }).toFile(out);
    console.log("pantalla", slug);
  }
}

/* ── Marca ─────────────────────────────────────────────── */
async function brand() {
  for (const f of ["clapzy-icon.png", "clapzy-logo.png", "clapzy-wordmark.png"]) {
    copyFileSync(`${KIT}/brand/${f}`, `assets/brand/${f}`);
    copyFileSync(`${KIT}/brand/${f}`, `public/brand/${f}`);
  }
  // Wordmark en crema para fondos oscuros: los trazos oscuros pasan a crema; el coral se mantiene.
  const { data, info } = await sharp(`${KIT}/brand/clapzy-wordmark.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (sat < 60) {
      data[i] = 247;
      data[i + 1] = 240;
      data[i + 2] = 231;
    }
  }
  await sharp(data, { raw: info }).png().toFile("public/brand/clapzy-wordmark-light.png");
}

for (const [slug, src] of Object.entries(PHOTOS)) await photo(slug, src);
for (const [slug, src, ss, t] of VIDEOS) video(slug, src, ss, t);
await places();
await screens();
await brand();
console.log("Listo:", path.resolve(OUT));
