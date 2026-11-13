export const PRELOAD_KEY = "vive:precarga";

/** Corre antes de pintar: si ya se vio la precarga en esta sesión (o hay reduced-motion), no se muestra. */
export const PRELOAD_SCRIPT = `try{if(sessionStorage.getItem("${PRELOAD_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("no-preload")}catch(e){}`;
