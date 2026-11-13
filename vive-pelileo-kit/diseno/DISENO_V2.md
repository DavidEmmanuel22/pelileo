# Diseño v2 — reemplaza las secciones 2, 3 y 4 de BRIEF.md

La dirección visual cambió. **Este archivo manda sobre BRIEF.md** en todo lo visual y de navegación. El motor de Gaia, los datos y el mapa ilustrado (fases 1 y 2) se mantienen; solo cambian su tema (oscuro) y su lugar en la app.

## Referencias obligatorias
1. `diseno/referencia.html` y `diseno/ref-*.png`: las 6 pantallas objetivo. Repróducelas con fidelidad y llévalas a responsive.
2. Capturas reales de la app de Clapzy en la carpeta de arriba (`../IMG_6877.PNG` … `../IMG_6882.PNG`). Míralas todas antes de escribir código. Vive Pelileo tiene que sentirse de la misma familia, pero **más cálido y con más engagement**.

## Principios
- **El contenido es protagonista**: fotos grandes de lugares, comida y experiencias. Lo primero que ve la gente son establecimientos y planes, **no un mapa**.
- **Gaia está en todas partes**: barra flotante inferior en todas las pantallas (mascota + sugerencia que rota cada 4 s según la pantalla + botón enviar), igual que en Clapzy. Al tocarla se abre la conversación.
- **El itinerario existe solo dentro de Gaia.** Gaia primero recomienda lugares y después pregunta "¿Quieres que te arme el itinerario hora por hora?" con respuestas rápidas ("Sí, ármalo", "Solo el sábado", "Más aventura"). Si el usuario dice que sí, aparece una **tarjeta de itinerario dentro del chat** (presupuesto, mini mapa con ruta-costura, tabs de día y paradas). "Ver completo" la abre a pantalla completa. No hay sección ni pestaña de itinerario.
- **Engagement amigable**: historias de "hoy en Pelileo", prueba social ("Valeria, Diego y 38 más fueron", "126 lo guardaron", "92% de match contigo"), botones con acción clara ("Quiero ir", "Voy", "Armar plan con este lugar"), saludo personal y copy cálido con algún emoji puntual (sin abusar).
- **La ciudad se nota en**: el nombre "Vive Pelileo", la franja tricolor junto a "by clapzy", el contenido local y el verde andino de las paradas del itinerario.

## Tokens (tema oscuro Clapzy)
| Token | Valor |
|---|---|
| `--bg` | `#0E0E13` |
| `--s1` / `--s2` / `--s3` | `#17171D` / `#202027` / `#2A2A32` |
| `--tx` / `--tx2` / `--tx3` | `#F4F4F6` / `#A0A0AA` / `#6E6E78` |
| `--coral` / `--coral2` | `#F45C55` / `#FF7D6E` (botones principales con degradé y sombra coral) |
| `--match` | `#F28B83` |
| `--free` | `#4ADE80` ("Gratis", "Abierto", presupuesto OK) |
| `--andino` | `#45B575` (paradas del itinerario) |
| Bandera | `#C9463D` / `#F4F4F6` / `#3E8A5A` (solo en la franja tricolor) |

- Tipografía: Plus Jakarta Sans. Títulos de pantalla y de sección en 800 con tracking −0.02 a −0.03 em. Meta en 500–600.
- Radios: 28 px (hero, mapa), 20 px (tarjetas), 999 px (chips y botones).
- Botones: principal en degradé coral; secundario en píldora blanca con texto negro; íconos en círculos `--s2`.
- Cristal (`backdrop-filter: blur`) solo sobre fotos y mapa.

## Navegación
- **Mobile**: barra flotante con Gaia arriba y 4 pestañas abajo: Inicio · Mapa · Agenda · Guardados (pestaña activa en coral).
- **Desktop (≥1024 px)**: barra superior con el lockup, las 4 secciones y un campo "Pregúntale a Gaia…" centrado. Gaia se abre como panel lateral derecho de 440 px, sin salir de la página. El inicio pasa a grilla: hero de 7 columnas a la izquierda y "Planes de Gaia" más la agenda en 5 columnas a la derecha. Los rieles se vuelven grillas de 4.
- `/municipio` mantiene su ruta, pero con el mismo tema oscuro.

## Pantallas
1. **Inicio** (`/`): lockup, clima, avatar · saludo personalizado con lo que pasa este fin de semana · historias "Hoy en Pelileo" · chips de categoría con emoji · hero "Imperdible de Pelileo" (carrusel de 4, con prueba social, precio, corazón y "Quiero ir") · "Planes que armó Gaia" (tocar uno abre Gaia con ese escenario) · "Este fin de semana" en filas tipo evento Clapzy (fecha coral, match, Gratis/precio, corazón, "Voy") · rieles "Dónde comer", "Dónde dormir", "Aventura", "Cultura y artesanía" con foto grande, estado "Abierto" y rating · tarjeta "Pelileo en el mapa" que abre la pestaña Mapa.
2. **Detalle** (`/lugar/[id]`): foto a sangre con galería, franja de stats (rating, precio, abierto), descripción, tags con emoji, prueba social, **tarjeta de Gaia** ("Queda a 15 min del Nitón… ¿Te armo el plan?" → abre Gaia con ese lugar) y CTA fijo abajo: "Cómo llegar" + acción principal según el tipo (Reservar mesa, Reservar noche, Quiero ir).
3. **Gaia** (conversación a pantalla completa en mobile, panel en desktop): encabezado con mascota y "Tu guía en Pelileo" · burbujas · pasos de "pensando" compactos con check verde · recomendaciones en tarjetas horizontales · pregunta de itinerario con respuestas rápidas · tarjeta de itinerario · respuestas rápidas de ajuste ("Más barato", "Sin cuy", "Algo de noche") · input fijo abajo con botón coral.
4. **Mapa** (pestaña): el mapa ilustrado **en oscuro** a pantalla completa, buscador y chips arriba, pines con emoji de categoría, pin seleccionado con la foto del lugar y tarjeta inferior que cambia al tocar otro pin.
5. **Agenda** (`/eventos`): filas tipo evento Clapzy agrupadas por día.
6. **Guardados**: lugares y planes de Gaia guardados.

## Fotos que hay que reemplazar (no corresponden)
Revisa cada foto de `public/images` y reemplaza las que no muestren lo que dicen. Como mínimo:
- `niton-mirador.jpg`: es una playa. Pelileo está en la Sierra.
- `pelileo-grande.jpg`: es una pintura de ruinas.
- `las-caras.jpg`: es una carretera.
- `e-cosecha.jpg`: es una foto antigua en blanco y negro.
- `tambo-ruta-jean.jpg`: maniquíes; busca algo más atractivo (tienda o tela de jean).

Mientras tanto, usa una foto buena de la misma categoría. Ninguna tarjeta puede quedar sin imagen.
