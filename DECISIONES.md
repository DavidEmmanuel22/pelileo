# Decisiones tomadas sin supervisión

1. **Skill frontend-design**: no está disponible en esta sesión. Apliqué directamente los criterios del brief (sobrio, premium, mucho aire, tokens estrictos).
2. **Next.js 16.4 + cacheComponents**: el scaffold trae `cacheComponents` y `partialPrefetching` activados, que mantienen páginas ocultas con `<Activity>`. Los desactivé: la app es casi toda cliente, con un mapa persistente en un layout compartido, y así el comportamiento es predecible.
3. **Coral de Clapzy**: muestreado del logo → `#F45C55` (el brief sugería `#F2615A`).
4. **@types/node 24**: Vitest 5 pide @types/node ≥ 22; subí de 20 a 24.
5. **Mapa**: d3-zoom (pan, pellizco, rueda y vuelos con `interpolateZoom`) en lugar de react-zoom-pan-pinch, porque permite vuelos de cámara suaves y control total del transform. Las curvas de nivel se generan una sola vez con `scripts/gen-terrain.mjs` (marching squares sobre un relieve sintético con Nitón, Teligote y Tungurahua) y quedan como SVG estático: cero cálculo en el celular.
6. **Pines y etiquetas** son HTML sobre el SVG, posicionados con variables CSS (`--tx`, `--ty`, `--k`) que se actualizan sin re-render de React; la ruta-costura se recalcula en coordenadas de pantalla para que el punteado no se deforme con el zoom.
7. **Tokens del mapa**: los colores del mapa (`--map-*`) son mezclas `color-mix()` de los tokens del brief; no hay colores sueltos.
8. **Mapa persistente**: Explorar, Lugar, Eventos y Gaia comparten un layout con un solo mapa, así la cámara vuela entre pantallas sin recargar.
9. **Amigable para todas las personas** (pedido del usuario durante la noche): objetivos táctiles de 44 px como mínimo, textos cortos y claros en "tú", contraste AA en texto (el gris `--ink-2` solo para texto secundario), foco de teclado visible, `aria-label` en pines e íconos, respeto por `prefers-reduced-motion`, y Gaia siempre responde algo útil (nunca queda en blanco).
10. **El itinerario vive solo en Gaia** (aclaración del usuario): no hay sección de itinerario independiente. "Agregar a mi plan" en lugares y eventos lleva a Gaia: si ya hay un plan, Gaia suma esa parada; si no, Gaia arma un plan que la incluya. Guardados muestra lugares guardados y planes armados por Gaia.
11. **Escenarios vs. generador**: un escenario guionizado se usa solo si el texto no pide algo distinto (otro presupuesto, otros días u otro grupo); si no, el generador arma un plan propio. Así "familia, 2 días, $400" no devuelve el plan de $250.
12. **Grupo por defecto**: si no se menciona, Gaia asume 2 adultos.
13. **Cena**: casi todos los restaurantes cierran antes de las 19:30, así que la cena va en el hotel (si tiene restaurante), en un bar si no hay niños, o se adelanta a las 18:00 en Café Índigo.
14. **Presupuesto muy bajo** ("$10 para 6 personas"): Gaia deja solo lugares gratuitos y lo explica, en lugar de pasarse del presupuesto.
15. **Fotos**: Wikimedia Commons (licencias libres, créditos en `public/images/credits.json`). Donde no hay foto real del lugar, elegí una imagen representativa del tipo de lugar (p. ej. un desayuno, una máquina de coser, parapente) y no una foto falsa de Pelileo. Las redimensioné a 1400 px de lado mayor; `next/image` sirve AVIF/WebP.
