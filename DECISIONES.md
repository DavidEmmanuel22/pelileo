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

## 9. Reservas: pantallas construidas en HTML, no capturas
Para que el "morph" sea real (la foto del riel vuela y se vuelve la portada del lugar; el botón Reservar viaja y se convierte en el check verde), las tres pantallas se construyen en HTML con unidades `em` que escalan con el ancho. Copian el lenguaje visual de la demo (crema, botones negros y coral, tarjetas redondeadas). En escritorio van en fila; en celular y tableta se apilan en el mismo marco y se funden una en otra. Fondo crema que entra como una hoja sobre Gaia, para cambiar de ritmo después de cuatro escenas oscuras.

## 10. Datos: panel oscuro construido en vivo
El panel del municipio no es la captura de la demo: se construye en HTML/SVG en tonos noche, con el mismo contenido (KPIs, tendencia de 12 semanas, mapa de calor y demanda insatisfecha). En escritorio se diseña a 1200×800 y se escala para caber entero en pantalla; sus piezas aparecen primero como un fantasma tenue y se encienden una por una con el scroll. Los titulares `t-h2` usan `text-wrap: balance` para no dejar una palabra sola.

## 11. Antes y después: collage en HTML con unidades de contenedor
El "antes" (folletos, una foto impresa, una publicación vieja, un mapa genérico, notas adhesivas y un grupo de vecinos con preguntas sin respuesta) se construye en HTML con unidades `cqw`, para que escale con el comparador y se lea en cualquier ancho; en celular tiene posiciones propias. El "con Vive" usa la captura real de la demo en escritorio con las pantallas de agenda e itinerario flotando encima. El deslizador se arrastra con mouse, dedo o teclado (rol `slider`) y se mueve solo una vez al entrar.

## 12. Cierre: el Ecuador de la escena 2, ahora encendido
El paisaje vuelve con todos los pueblos prendidos, un brillo cálido sobre el valle y el cóndor cruzando: cierra el arco que abrió la escena 2 (de noche y apagado). La única línea nueva que no viene del brief es la leyenda "Cada valle encendido. Cada negocio en vitrina.", que conecta ese paisaje con el titular. El titular lleva el video del volcán dentro de las letras. En vez de `background-clip: text` (que no admite video), se usa un bloque noche con el texto en blanco y `mix-blend-mode: darken` sobre el video: el resultado es el mismo y funciona en todos los navegadores. El formulario valida en el cliente, enfoca el primer error, abre WhatsApp en el mismo clic (para que no lo bloquee el navegador) y muestra el estado de éxito. El enlace al calendario solo aparece si `NEXT_PUBLIC_CALENDAR_URL` tiene valor.
