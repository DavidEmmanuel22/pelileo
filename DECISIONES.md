# Decisiones tomadas sin supervisión

1. **Skill frontend-design**: no está disponible en esta sesión. Apliqué el brief directamente y subí la vara con la revisión por capturas y video.
2. **Ecuador de noche (pedido de Agustín durante la sesión)**: le gustó la escena animada del valle y el volcán de la demo de Pelileo y pidió algo parecido "con otro sentido, de Ecuador en general", sin copiarla. La reinterpreté como la apertura de la escena 2: una avenida de volcanes de noche, con cóndor, niebla y pueblos que se encienden en los valles. La cámara baja a un valle y sus luces se vuelven el mapa de la ciudad. El paisaje vuelve, totalmente encendido, en el cierre. No cambia el número de escenas (15), porque es el primer acto de la escena del problema.
3. **La demo es el llamado a la acción**: la landing no reproduce la demo; la muestra en pantallas flotantes y siempre empuja a "Ver demo" (abre `DEMO_URL` en otra pestaña).
4. **Stack**: Next.js 16.4 (App Router), React 19.3, Tailwind 4, GSAP 3 + ScrollTrigger, Lenis y Framer Motion. El split de texto es propio (más liviano que SplitType y sin problemas de hidratación).
5. **Fuente**: Plus Jakarta Sans con `next/font/google` (400–800), autoalojada en el build.
6. **Fotos**: `scripts/media.mjs` (sharp) genera AVIF y WebP a 1800 px (el material original mide 1800 px, así que no se agranda a 2400) y versiones de 900 px para celular. Videos con `ffmpeg-static` (H.264, `-preset veryfast`, sin audio, 1080p y 720p) y un póster por video.
7. **Pantallas de la app**: capturadas de la demo a 390×844 @3x con `scripts/demo-shots.mjs` y servidas en WebP a 2x.

## 8. Gaia: tres escenarios reales de la demo
Los tres chips del brief se mapean a escenarios con lugares y precios de la demo de Pelileo (`content/gaia.ts`), para que lo que se ve en la landing coincida con lo que el municipio verá al abrir "Pruébala en la demo" (`/gaia`). El chat es simulado pero completo: escribe el mensaje, muestra los tres pasos de razonamiento, propone tres lugares con foto y arma el itinerario con presupuesto y mapa. No se fija con scroll: el usuario puede interactuar con calma.
