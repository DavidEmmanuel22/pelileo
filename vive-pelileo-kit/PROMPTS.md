# Plan de construcción nocturna — ejecutar todas las fases en orden, sin detenerse

Antes de empezar: lee `CLAUDE.md` y `BRIEF.md` completos y crea `PROGRESO.md` con este checklist.

## Fase 0 — Base
1. Crea la app Next.js (App Router) + TypeScript + Tailwind + Framer Motion + ESLint **en esta misma carpeta**, sin borrar `data/`, `public/brand/` ni los .md. Si el instalador se niega porque la carpeta no está vacía, créala en `app-tmp/` y mueve todo a la raíz.
2. Plus Jakarta Sans con next/font (400, 500, 600, 700).
3. Mira `public/brand/clapzy-logo.png`, ajusta `--clapzy` al coral real del logo y define todos los tokens como variables CSS y en el tema de Tailwind.
4. Shell de navegación responsive (tab bar inferior en mobile, barra superior en desktop) con el lockup "Vive Pelileo / by Clapzy" y la línea tricolor. Rutas: `/`, `/eventos`, `/gaia`, `/guardados`, `/lugar/[id]` y `/municipio`.
5. `git init`, `.gitignore` y commit.

## Fase 1 — Mapa ilustrado
Construye `components/map/MapView.tsx` según BRIEF.md sección 6: ilustración SVG del cantón, proyección de lat/lng, pan y zoom, vuelos de cámara, pines, clustering, ruta-costura animada y modo heatmap. Crea `/dev/mapa` para probar los tres modos. Tiene que verse como un mapa editorial premium, no como un dibujo genérico. Toma capturas y mejóralo hasta que lo esté.

## Fase 2 — Motor de Gaia
`lib/gaia/` según BRIEF.md sección 5: escenarios, generador, ajustes ("más barato", "sin X", "algo de noche"…), `swapStep`, `removeStep`, `itineraryTotal`, clima simulado y respuesta fuera de alcance. Tests con Vitest:
- Los 3 escenarios suman $246, $118 y $71.
- Cualquier texto (vacío, inglés, emojis) devuelve un resultado válido.
- No se agenda nada fuera de horario ni se repiten lugares.
- El generador respeta el presupuesto.

## Fase 3 — Fotos
Busca y descarga fotos para los lugares y eventos (BRIEF.md sección 7). Máximo 45 minutos en esta fase. Lo que no consigas queda con placeholder elegante.

## Fase 4 — Pantallas públicas
Explorar, Detalle de lugar, Eventos, Gaia y Guardados, exactamente como en BRIEF.md sección 4, conectadas al mapa y al motor reales. Mobile primero, impecable también en desktop.

## Fase 5 — Panel del municipio
`/municipio` según BRIEF.md sección 4.6 con `data/municipio.json`. Lo que se publique desde el formulario de eventos debe aparecer en `/eventos` durante la sesión.

## Fase 6 — Pulido
Pantalla de carga, transiciones entre rutas, skeletons, estados vacíos, foco de teclado, microinteracciones sobrias. Revisa toda la copia en español neutro con "tú".

## Fase 7 — QA final
1. `npm run build` sin errores. Vitest en verde.
2. Capturas de todas las rutas en 360, 390, 768, 1024 y 1440 px. Revísalas una por una y corrige desbordes, solapes y textos cortados.
3. Recorre el guion de BRIEF.md sección 9 con Playwright y verifica que cada paso funcione.
4. Prueba 30 entradas aleatorias en Gaia.
5. Si queda tiempo, haz otra vuelta de pulido visual en Explorar y Gaia, que son lo primero que se ve.

## Al terminar
Escribe `LISTO.md` con:
- Cómo correrlo (`npm install && npm run dev`) y cómo desplegarlo en Vercel.
- Qué quedó listo, qué decisiones tomaste (resumen de `DECISIONES.md`) y qué quedó pendiente.
- Las 6 mejores capturas (rutas a `screens/`).

Haz el commit final.
