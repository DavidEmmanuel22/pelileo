# Progreso — Vive Pelileo · by Clapzy

Checklist de las fases de `PROMPTS.md`. Si la sesión se corta, retomar en el primer ítem sin marcar.

## Fase 0 — Base
- [x] Next.js (App Router) + TS + Tailwind + Framer Motion + ESLint en la raíz
- [x] Plus Jakarta Sans con next/font (400–700)
- [x] Coral real del logo en `--clapzy` y tokens CSS + tema Tailwind
- [x] Shell responsive (tab bar mobile / barra superior desktop) con lockup y línea tricolor
- [x] Rutas: `/`, `/eventos`, `/gaia`, `/guardados`, `/lugar/[id]`, `/municipio`
- [x] git init + .gitignore + commit

## Fase 1 — Mapa ilustrado
- [ ] Ilustración SVG del cantón (curvas de nivel, río Patate, vías, cerros, volcán, parroquias)
- [ ] Proyección lat/lng → SVG, pan y zoom, vuelos de cámara
- [ ] Pines HTML accesibles + clustering
- [ ] Ruta-costura animada (modo itinerario)
- [ ] Modo heatmap
- [ ] `/dev/mapa` con los tres modos + capturas revisadas

## Fase 2 — Motor de Gaia
- [ ] Escenarios, generador, ajustes, swapStep, removeStep, itineraryTotal, clima, fuera de alcance
- [ ] Tests Vitest en verde

## Fase 3 — Fotos
- [ ] Fotos de lugares y eventos + `credits.json` (o placeholder elegante)

## Fase 4 — Pantallas públicas
- [ ] Explorar
- [ ] Detalle de lugar
- [ ] Eventos
- [ ] Gaia
- [ ] Guardados

## Fase 5 — Panel del municipio
- [ ] KPIs, gráficos, heatmap, demanda insatisfecha, embudo, gestión
- [ ] Publicar evento → aparece en `/eventos`

## Fase 6 — Pulido
- [ ] Carga, transiciones, skeletons, estados vacíos, foco, microinteracciones, copia en "tú"

## Fase 7 — QA final
- [ ] `npm run build` + Vitest en verde
- [ ] Capturas 360/390/768/1024/1440 revisadas
- [ ] Guion de la demo con Playwright
- [ ] 30 entradas aleatorias en Gaia
- [ ] Pulido extra de Explorar y Gaia
- [ ] LISTO.md + commit final
