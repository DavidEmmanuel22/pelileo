import fs from "node:fs";
import path from "node:path";

/**
 * Medios de la portada. Si existe el archivo en `public/media/` se usa; si no, cae a una foto
 * que ya tiene la demo. Así basta con soltar los archivos con estos nombres (ver MEDIA.md).
 */
const exists = (rel: string) => {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", rel));
  } catch {
    return false;
  }
};

function pick(names: string[], fallback: string): string {
  for (const n of names) for (const ext of ["jpg", "jpeg", "webp", "png"]) {
    const rel = `/media/${n}.${ext}`;
    if (exists(rel)) return rel;
  }
  return fallback;
}

const video = (name: string) => (exists(`/media/${name}.mp4`) ? `/media/${name}.mp4` : null);

export type HomeMedia = {
  hero: string;
  heroVideo: string | null;
  heroVideoMobile: string | null;
  naturalezaVideo: string | null;
  vueloVideo: string | null;
  cierreVideo: string | null;
  exp: Record<"aventura" | "cultura" | "jean" | "sabores" | "naturaleza" | "muebles", string>;
  vuelo: string;
  cierre: string;
};

export function homeMedia(): HomeMedia {
  const P = (id: string) => `/images/places/${id}.jpg`;
  return {
    hero: pick(["hero"], P("cotalo-cruz")),
    heroVideo: video("hero"),
    heroVideoMobile: video("hero-vertical"),
    naturalezaVideo: video("exp-naturaleza"),
    vueloVideo: video("vuelo"),
    cierreVideo: video("cierre"),
    exp: {
      aventura: pick(["exp-aventura"], P("e-parapente")),
      cultura: pick(["exp-cultura"], P("e-tejido")),
      jean: pick(["exp-jean"], P("e-jean")),
      sabores: pick(["exp-sabores"], "/images/events/ev-sabores.jpg"),
      naturaleza: pick(["exp-naturaleza"], P("las-caras")),
      muebles: pick(["exp-muebles"], P("huambalo-muebles")),
    },
    vuelo: pick(["vuelo"], P("niton-mirador")),
    cierre: pick(["cierre"], P("teligote")),
  };
}
