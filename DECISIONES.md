# Decisiones tomadas sin supervisión

1. **Skill frontend-design**: no está disponible en esta sesión. Apliqué directamente los criterios del brief (sobrio, premium, mucho aire, tokens estrictos).
2. **Next.js 16.4 + cacheComponents**: el scaffold trae `cacheComponents` y `partialPrefetching` activados, que mantienen páginas ocultas con `<Activity>`. Los desactivé: la app es casi toda cliente, con un mapa persistente en un layout compartido, y así el comportamiento es predecible.
3. **Coral de Clapzy**: muestreado del logo → `#F45C55` (el brief sugería `#F2615A`).
4. **@types/node 24**: Vitest 5 pide @types/node ≥ 22; subí de 20 a 24.
