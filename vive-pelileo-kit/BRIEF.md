# Vive Pelileo · by Clapzy — Brief de la demo

## 1. Qué es
Una plataforma de turismo y experiencias locales con la marca de la ciudad. En ella el visitante encuentra qué hacer en Pelileo (atractivos, restaurantes, bares, hoteles, experiencias y eventos) y, con **Gaia**, arma un itinerario hora por hora según su grupo, sus días y su presupuesto. El producto se vende a municipios: la ciudad es la protagonista y Clapzy firma discreto ("by Clapzy").

La demo es **100% simulada**: no hay backend, ni LLM, ni APIs externas, ni cuentas, ni claves. El mapa es una **ilustración cartográfica propia** (no hace falta que sea exacto, sí que se vea premium). Los lugares y datos son contenido de demo. Se comparte por link, así que tiene que verse impecable **en celular y en escritorio** y no puede romperse con ninguna pregunta.

## 2. Principios de experiencia
1. **En 5 segundos se entiende qué es**: la portada es el mapa del cantón con sus imperdibles. Gaia no aparece en la portada; vive en su propia pestaña y la portada solo la sugiere con una tarjeta discreta.
2. **Sobrio y premium, al estilo Clapzy**: base neutra, mucho aire, tipografía limpia y nada recargado. La marca de la ciudad solo aparece en puntos clave.
3. **Gaia se siente útil, no espectacular**: pasos de razonamiento breves, un resultado claro y el mapa sincronizado.
4. **El panel del municipio es lo que se vende**: tiene que sentirse como una herramienta real de decisión.

## 3. Identidad visual
**Base (línea Clapzy).** El logo de Clapzy (`public/brand/clapzy-logo.png`) es un wordmark negro redondeado con un ícono 3D coral y un punto coral. La plataforma es blanca y negra, y el coral se reserva para lo que es "Clapzy". Muestra el color exacto del logo y ajusta `--clapzy`. Tokens:

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#FAFAF8` | Fondo general |
| `--surface` | `#FFFFFF` | Tarjetas, sheets |
| `--ink` | `#151515` | Texto principal, pin seleccionado, ruta de Gaia |
| `--ink-2` | `#5C5C5C` | Texto secundario |
| `--line` | `#E7E5E0` | Bordes, divisores |
| `--clapzy` | `#F2615A` (ajustar al logo) | Solo Gaia y el sello "by Clapzy": botón de Gaia, chips de Gaia, indicador de "pensando" |
| `--pel-red` | `#A9443B` | Franja roja de la bandera (solo en la línea tricolor) |
| `--pel-green` | `#3E6A4F` | Verde andino de la ciudad: paradas numeradas del itinerario, presupuesto OK, estados "Abierto" |

Regla: la **ciudad** se nota en la línea tricolor, el ícono del volcán y el verde. **Clapzy** se nota en el coral de Gaia. Todo lo demás es blanco, negro y gris.

- **Bandera de Pelileo**: tres franjas horizontales en rojo, blanco y verde (confirmar con el municipio). Se usa **solo** como una línea fina tricolor de 3px bajo el lockup "Vive Pelileo", en la pantalla de carga y como detalle en el panel municipal. No va de fondo en ninguna parte.
- **Ícono de ciudad**: silueta mínima del volcán Tungurahua con 9 puntos (las 9 estrellas del escudo, una por parroquia). Lineal, monocromo, en SVG propio.
- **Tipografía**: Plus Jakarta Sans en todo (títulos incluidos), sin fuentes display. Pesos 400/500/600/700.
- **Formas**: radios de 14px en tarjetas y 24px en sheets; sombras suaves y difusas; bordes de 1px `--line`.
- **Movimiento**: 200–400 ms, ease-out, sin rebotes. Transiciones de cámara del mapa de 1.2–1.8 s.
- **Detalle de marca**: la ruta del itinerario se dibuja como una **costura punteada** (línea discontinua en `--ink`), un guiño a la Ciudad Azul y al jean sin usar azul.
- **Lockup**: "Vive **Pelileo**" (Pelileo en 700), debajo "by Clapzy" en 11px `--ink-2` con el logo de Clapzy pequeño.

## 4. Pantallas

### Navegación
- **Mobile (<768px)**: tab bar inferior: Explorar · Eventos · Gaia · Guardados.
- **Desktop (≥1024px)**: barra superior con lockup a la izquierda y las mismas 4 secciones. En las vistas con mapa: panel lateral izquierdo de 420px y el mapa a la derecha.
- **Tablet (768–1023px)**: igual que mobile pero con sheet más ancho (máx. 560px, centrado).
- La ruta `/municipio` no aparece en la navegación pública. Se entra por un link "Vista municipio" en el pie del menú o directo por URL.

### 4.1 Explorar (`/`) — portada
- **Carga (1.2 s máx.)**: lockup "Vive Pelileo" + línea tricolor que se dibuja de izquierda a derecha. Solo la primera vez por sesión.
- **Intro de cámara**: el mapa ilustrado arranca alejado y hace un zoom suave hacia el centro de Pelileo.
- **Mapa** a pantalla completa (ilustración propia, ver sección 6). Pines por categoría con ícono lineal; el seleccionado se pone en `--ink` y crece.
- **Arriba**: chips de categoría (Todo, Comer, Dormir, Aventura, Cultura, Compras, Naturaleza, Experiencias), con scroll horizontal en mobile, y un chip de clima discreto ("18° · Parcialmente nublado").
- **Sheet inferior (mobile)** con 3 posiciones (15% / 50% / 92%):
  - Título: "Imperdibles de Pelileo" + carrusel horizontal de tarjetas con foto (lugares con `featured: true`). Al deslizar el carrusel, el mapa vuela al lugar y resalta su pin.
  - "Esta semana" (3 eventos próximos).
  - Tarjeta discreta de Gaia: "¿No sabes por dónde empezar? Arma tu plan con Gaia →".
  - Lista completa filtrable.
- **Desktop**: el mismo contenido en el panel lateral, con el carrusel convertido en una grilla de 2 columnas.

### 4.2 Detalle de lugar (sheet / modal, URL `/lugar/[id]`)
Galería, nombre, categoría, parroquia, rating (solo negocios), rango de precio, horario con estado "Abierto ahora / Cierra a las 18:00", descripción, tags. Acciones: **Cómo llegar** (traza la ruta en el mapa ilustrado), **Guardar** y **Agregar a mi plan**. Abajo, "Cerca de aquí" con los 3 lugares más próximos. En el mapa, la cámara se centra en el lugar.

### 4.3 Eventos (`/eventos`)
Agenda por día (Hoy, Este fin de semana, Próximas semanas). Las fechas se calculan en runtime a partir de `weekday` + `weeksAhead`, para que la demo siempre se vea actual. Filtros por categoría. Cada tarjeta lleva fecha, hora, lugar, precio o "Gratis" y la acción "Agregar a mi plan". Opción de ver los eventos en el mapa.

### 4.4 Gaia (`/gaia`)
1. **Inicio**: saludo breve ("Hola, soy Gaia. Cuéntame cómo quieres vivir Pelileo."), caja de texto y 3 chips con los escenarios de `gaia-scenarios.json`. Al tocar un chip, el prompt se escribe solo con efecto de tipeo (40 ms/carácter) y se envía.
2. **Pensando**: lista de 4–5 pasos que aparecen uno a uno (600–900 ms cada uno) con check suave: lugares, filtros, presupuesto, horarios y clima. Tono ligero, sin animaciones pomposas.
3. **Resultado**:
   - Texto introductorio de Gaia (streaming palabra por palabra).
   - Resumen: días, grupo, **barra de presupuesto** (gastado / total, en verde si entra) y "Te sobran $X".
   - Tabs por día con el clima del día.
   - **Timeline hora por hora**: hora, foto miniatura, título, duración, costo y la nota de Gaia ("por qué lo elegí"). Entre paradas: "12 min en auto".
   - **Mapa sincronizado**: paradas numeradas en `--pel-green`, ruta-costura que se dibuja progresivamente y cámara que encuadra el día. Al tocar una parada en el timeline, el mapa vuela a ella, y viceversa.
   - Acciones por paso: **Cambiar por otra** (Gaia propone una alternativa compatible) y **Quitar**.
   - Acciones globales: **Guardar plan**, **Compartir** (Web Share API o copiar link), **Ajustar** (reabre el chat con el contexto).
   - Mobile: el timeline va en el sheet y el mapa arriba (40% de la altura). Desktop: timeline en el panel y mapa a la derecha.
4. **Seguir conversando**: el usuario puede escribir "más barato", "sin cuy" o "agrega algo de noche". El motor ajusta el plan y Gaia responde con una línea ("Listo, cambié el almuerzo por una opción de $6").

### 4.5 Guardados (`/guardados`)
Lugares y planes guardados (localStorage, envuelto en try/catch). Estado vacío amable que invita a explorar.

### 4.6 Panel del municipio (`/municipio`)
Header: "Panel de Turismo · GAD Pelileo" + "by Clapzy" + línea tricolor + selector de período (solo visual). Datos en `municipio.json`.
- Fila de KPIs (6 tarjetas, con variación vs. período anterior).
- Visitantes e itinerarios por semana (líneas, 12 semanas).
- **Mapa de calor de interés** sobre el mapa del cantón.
- **Qué le piden a Gaia** (barras horizontales) y **De dónde vienen** (barras horizontales).
- **Demanda insatisfecha**: tabla con búsqueda, volumen e insight. Es la sección estrella; se resalta.
- Lugares más vistos vs. agregados a itinerarios.
- Embudo: vieron → cómo llegar → contactaron → reservaron.
- Visitas por día de la semana.
- Gestión: negocios registrados, pendientes de verificación (con botones Aprobar/Rechazar simulados) y **Publicar evento** (formulario; al publicar, el evento aparece en `/eventos` durante la sesión).
- Desktop: grilla de 12 columnas. Mobile: tarjetas apiladas y legibles, sin tablas que se desborden (las tablas pasan a lista).

## 5. Motor de Gaia (simulado)
Archivo `lib/gaia/`. Firma pública:

```ts
planWithGaia(input: string, context?: Itinerary): Promise<GaiaResult>
// GaiaResult = { mode: "scenario" | "generated" | "adjusted" | "out_of_scope";
//                thinking: string[]; reply: string; itinerary?: Itinerary }
swapStep(it: Itinerary, dayIdx: number, stepIdx: number): Itinerary
removeStep(it: Itinerary, dayIdx: number, stepIdx: number): Itinerary
```

**Paso 1 — Escenario.** Si el texto coincide con un chip, o con 2 o más `keywords` de un escenario, se usa el itinerario guionizado.

**Paso 2 — Generador.** Si no, se interpreta el texto:
- **Días**: "medio día" = 0.5 · "un día" = 1 · "fin de semana" = 2 · "N días" (máx. 3) · por defecto 1.
- **Grupo**: familia = 2 adultos + 2 niños · pareja = 2 · solo = 1 · amigos = 4. Si se mencionan números ("3 adultos"), se usan esos.
- **Presupuesto**: primer monto con `$` o "dólares". Por defecto: $60 por persona por día.
- **Intereses → tags**: aventura, parapente → aventura · comida, comer → gastronomia · cultura, historia, artesanía → cultura · compras, jean → compras · naturaleza, caminar → naturaleza · relax, descanso, termal → relax · niños → ninos.

**Slots por día:** desayuno 08:30 · mañana 10:00 · almuerzo 13:00 · tarde 15:00 · atardecer 17:30 (opcional) · cena 19:30 · hotel (si queda otro día). Medio día: 3–4 slots desde las 10:00.
- **Puntaje** de cada candidato = coincidencia de tags × 3 + `featured` × 1 + `rating` − distancia al paso anterior (km) × 0.5. Solo entran lugares abiertos ese día y a esa hora, y no se repiten.
- **Bares**: solo si no hay niños y el día lo permite.
- **Costos**: comer/beber/experiencia = `priceFrom` × adultos + `priceFrom` × 0.6 × niños · entrada = adultos × precio + niños × precio × 0.5 · habitación = `priceFrom` × ⌈personas/4⌉ · gratis = 0.
- **Presupuesto**: si se pasa, se reemplaza el paso más caro por la alternativa más barata del mismo slot y se quitan opcionales, hasta que entre.
- **Traslados**: haversine en km × 2.2 min (vías de montaña), redondeado a 5 y mínimo 3. Menos de 400 m = "a pie".
- **Notas de Gaia**: plantillas cortas según el motivo ("Abre los domingos", "Queda a 5 min del anterior", "Apto para niños", "Lo más pedido por familias", "Entra en tu presupuesto").
- **Clima simulado** por día de la semana (sáb 18° parcial, dom 19° soleado, el resto 17° parcial).

**Fuera de alcance** (playa, mar, discoteca grande, etc.): Gaia responde con amabilidad que eso no está en Pelileo y propone lo más cercano ("No hay playa, pero en Las Caras hay agua termal entre cascadas").

**Ajustes**: "más barato", "sin X", "más aventura", "algo de noche", "otro día" modifican el itinerario actual.

Los itinerarios guionizados deben sumar exactamente esto: familia $246 de $250 · pareja $118 de $120 · compras $71 de $80.

## 6. Stack y mapa
- **Next.js (App Router) + TypeScript + Tailwind + Framer Motion**, listo para desplegar en Vercel. Sin backend, sin APIs, sin claves: `npm run dev` y funciona.
- **Mapa = ilustración cartográfica propia en SVG** (componente `MapView`). No es un mapa real ni necesita serlo; tiene que verse premium y sobrio:
  - Lienzo SVG grande del cantón con: fondo crema muy claro, curvas de nivel finas en gris, el río Patate como una línea suave, la vía principal Ambato–Baños y algunas vías secundarias, manchas verdes muy tenues para cerros (Nitón, Teligote), la silueta del volcán Tungurahua al sureste y nombres de las parroquias en versalitas grises.
  - Los pines se ubican **proyectando lat/lng de `places.json` a coordenadas del SVG** (proyección lineal sobre un bounding box del cantón). Aunque no sea exacto, se conservan las posiciones relativas.
  - Interacción: arrastrar, pellizcar y rueda para zoom (`react-zoom-pan-pinch` o `d3-zoom`). "Vuelos de cámara" animando el transform (1.2–1.8 s, ease-in-out) para centrar un lugar o encuadrar un día del itinerario.
  - Inclinación sutil opcional (`perspective` + `rotateX(20deg)`) en la intro para dar profundidad, volviendo a plano al interactuar.
  - Ruta del itinerario: path SVG con curvas suaves entre paradas, trazo discontinuo (costura) en `--ink`, dibujado progresivo con `stroke-dashoffset`.
  - Heatmap del municipio: círculos con gradiente radial `--pel-red` → transparente, con blur y `mix-blend-mode: multiply`.
  - Pines HTML posicionados sobre el SVG (no dentro) para que sean nítidos y accesibles (`button` con `aria-label`). Clustering simple cuando el zoom es bajo.
  - API del componente:
    ```ts
    type MapViewProps = {
      mode: "explore" | "itinerary" | "heatmap";
      places: Place[];
      selectedId?: string | null;
      onSelect?: (id: string) => void;
      route?: { stops: { placeId: string; order: number }[] } | null;
      focusStop?: number | null;
      heatmap?: { lat: number; lng: number; weight: number }[];
      padding?: { top: number; bottom: number; left: number; right: number };
      intro?: boolean;
    };
    ```
- **Gráficos del panel**: Recharts estilizado con los tokens (sin colores por defecto).
- **Estado** en memoria + localStorage (en try/catch).

## 7. Contenido e imágenes
- Todo el contenido está en `data/`. Úsalo tal cual. Ignora el campo `verifyCoords`: no hace falta verificar nada.
- **Fotos**: búscalas en internet con tu herramienta de búsqueda web (Wikimedia Commons, Unsplash o Pexels, que permiten uso libre) usando `imageQuery` de cada lugar o evento. Descárgalas a `public/images/places/<id>.jpg` y `public/images/events/<id>.jpg` y anota la fuente en `public/images/credits.json`.
  - Si una descarga falla o no encuentras una buena, usa un placeholder elegante (gradiente neutro con el ícono de la categoría) y sigue adelante. **Nunca te detengas por las fotos.**
  - Optimiza con `next/image`.

## 8. Calidad (criterios de aceptación)
- Se ve impecable en 360, 390, 768, 1024, 1440 y 1920 px de ancho. Nada se desborda y no hay scroll horizontal accidental.
- Rendimiento fluido en mobile: animaciones a 60 fps y carga inicial rápida.
- Sin errores en consola. Todos los botones hacen algo (aunque sea simulado).
- Gaia nunca queda en blanco: cualquier texto devuelve un plan válido o una respuesta amable.
- Los textos están en español neutro con "tú".
- Carga inicial < 2.5 s en 4G.

## 9. Guion de la demo (lo que tiene que funcionar perfecto)
1. Abro el link: carga breve, el mapa vuela a Pelileo y aparecen los imperdibles.
2. Deslizo el carrusel y el mapa me sigue. Abro Cerro Nitón y veo su detalle.
3. Voy a Eventos: hay cosas este fin de semana.
4. Voy a Gaia, toco "Plan familiar · 2 días · $250": piensa, arma el plan y la costura dibuja la ruta.
5. Cambio el almuerzo con "Cambiar por otra" y el presupuesto se actualiza.
6. Escribo "algo más barato" y Gaia ajusta.
7. Abro `/municipio`: KPIs, mapa de calor y demanda insatisfecha.
