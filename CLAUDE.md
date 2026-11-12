# Instrucciones para Claude Code — Vive Pelileo

Lee `BRIEF.md` completo antes de escribir código. Es la fuente de verdad.

## Modo de trabajo: noche sin supervisión
- Construyes **todo tú solo**, de principio a fin. Nadie va a responder preguntas hasta mañana.
- **No te detengas a preguntar.** Si algo es ambiguo, toma la decisión más razonable, anótala en `DECISIONES.md` y sigue.
- Lleva el avance en `PROGRESO.md`: un checklist con las fases de `PROMPTS.md`, marcando cada ítem al terminarlo. Si la sesión se corta, ese archivo dice dónde retomar.
- Haz commit al cerrar cada fase (`git add -A && git commit -m "fase N: ..."`).
- 100% simulado: no uses APIs externas, cuentas ni claves. La única red permitida es la búsqueda y descarga de fotos y la instalación de paquetes npm.
- Si algo falla dos veces, busca un enfoque más simple que cumpla el objetivo, anótalo en `DECISIONES.md` y continúa.

## Diseño
- Si la skill **frontend-design** está disponible, cárgala y aplícala antes de diseñar cualquier pantalla.
- Español neutro con "tú" en toda la interfaz. Nunca voseo.
- Plus Jakarta Sans en todo; sin fuentes display.
- Usa los tokens de la sección 3 del brief como variables CSS. Nada de colores sueltos.
- Sobrio y premium, al estilo Clapzy. La ciudad se nota en la línea tricolor, el ícono del volcán y el verde; Clapzy, en el coral de Gaia.

## Verificación visual (obligatoria)
Instala Playwright (`npx playwright install chromium`) y crea `scripts/screens.mjs`. El script toma capturas de cada ruta en 390×844 y 1440×900 y las guarda en `screens/`. Después de cada fase, córrelo, **mira las capturas** y corrige lo que se vea mal antes de seguir.

## Reglas técnicas
- localStorage siempre dentro de try/catch.
- Nada de errores en consola ni warnings de hidratación.
- `npm run build` tiene que pasar sin errores al final.
