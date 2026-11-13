export const PRELOAD_KEY = "vive:precarga";

/** Corre antes de pintar: marca que hay JS (el hero espera oculto su entrada) y, si ya se vio la precarga
 *  en esta sesión (o hay reduced-motion), no la muestra. */
export const PRELOAD_SCRIPT = `try{document.documentElement.classList.add("js");if(sessionStorage.getItem("${PRELOAD_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("no-preload")}catch(e){}`;
