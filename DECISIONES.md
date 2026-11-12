# Decisiones tomadas sin supervisión

1. **Skill frontend-design**: no está disponible en esta sesión. Apliqué directamente los criterios del brief (sobrio, premium, mucho aire, tokens estrictos).
2. **Next.js 16.4 + cacheComponents**: el scaffold trae `cacheComponents` y `partialPrefetching` activados, que mantienen páginas ocultas con `<Activity>`. Los desactivé: la app es casi toda cliente, con un mapa persistente en un layout compartido, y así el comportamiento es predecible.
3. **Coral de Clapzy**: muestreado del logo → `#F45C55` (el brief sugería `#F2615A`).
4. **@types/node 24**: Vitest 5 pide @types/node ≥ 22; subí de 20 a 24.
5. **Mapa**: d3-zoom (pan, pellizco, rueda y vuelos con `interpolateZoom`) en lugar de react-zoom-pan-pinch, porque permite vuelos de cámara suaves y control total del transform. Las curvas de nivel se generan una sola vez con `scripts/gen-terrain.mjs` (marching squares sobre un relieve sintético con Nitón, Teligote y Tungurahua) y quedan como SVG estático: cero cálculo en el celular.
6. **Pines y etiquetas** son HTML sobre el SVG, posicionados con variables CSS (`--tx`, `--ty`, `--k`) que se actualizan sin re-render de React; la ruta-costura se recalcula en coordenadas de pantalla para que el punteado no se deforme con el zoom.
7. **Tokens del mapa**: los colores del mapa (`--map-*`) son mezclas `color-mix()` de los tokens del brief; no hay colores sueltos.
8. **Mapa persistente**: Explorar, Lugar, Eventos y Gaia comparten un layout con un solo mapa, así la cámara vuela entre pantallas sin recargar.
