# Listo: Vive, landing-presentación para municipios

Una página narrativa de 15 escenas (0 a 14) que reemplaza al PowerPoint. Se presenta haciendo scroll y termina en dos caminos: ver la demo o agendar la reunión por WhatsApp.

## Cómo correrla

```bash
cd vive-landing
npm install
cp .env.example .env.local   # y completa los valores (ver PENDIENTES.md)
npm run dev                  # http://localhost:3001
```

- La demo de Pelileo corre aparte en `http://localhost:3000` (es el valor por defecto de `NEXT_PUBLIC_DEMO_URL`).
- Producción local: `npm run build && npm start` (puerto 3001).
- Recomendación para presentar: Chrome a pantalla completa (F11 / ⌃⌘F). La precarga solo aparece la primera vez por pestaña.

## Cómo publicarla en Vercel

1. Sube la carpeta `vive-landing` a un repositorio de GitHub. Puede ser su propio repo, o una carpeta dentro del repo actual.
2. En vercel.com, elige **Add New → Project** e importa el repositorio. Si `vive-landing` es una subcarpeta, indícala en **Root Directory**.
3. Vercel detecta Next.js solo, así que no hace falta cambiar comandos.
4. En **Settings → Environment Variables**, carga las variables de `.env.example` con los valores reales (ver PENDIENTES.md).
5. Pulsa **Deploy**. Cada vez que subas cambios a la rama principal, se vuelve a publicar.
6. Opcional: en la pestaña **Analytics**, actívala para ver los eventos de los botones y del formulario.

La demo (`vive-pelileo-kit`) también tiene que estar publicada, y su URL va en `NEXT_PUBLIC_DEMO_URL`.

## Qué se verificó

- `npm run build` pasa sin errores ni advertencias de TypeScript, y `eslint` queda limpio.
- La consola queda limpia (sin errores ni avisos de hidratación) en todo el recorrido a 360, 390, 768, 1024, 1440 y 1920 px.
- No hay desborde horizontal en ninguno de esos anchos.
- Con `prefers-reduced-motion`, no hay pines ni animaciones: cada escena muestra su estado final y todo se lee.
- **Formulario:**
  - Valida los campos y enfoca el primer error.
  - Abre WhatsApp con el texto exacto, por ejemplo: "Hola, soy Ana Pérez, Directora de Turismo de Baños de Agua Santa, Tungurahua. Quiero agendar una reunión sobre Vive."
  - Después muestra el estado de éxito.
- "Ver demo" (en la navegación, el hero y el cierre) abre `DEMO_URL` en otra pestaña. "Pruébala en la demo" abre `/gaia`.
- "Agendar" (en el hero y en la píldora del celular) baja hasta el formulario y le pasa el foco.

## Las escenas

| # | Escena | Momento |
|---|---|---|
| 0 | Precarga | "Vive" letra por letra y un punto coral que se abre como iris (≤ 1,8 s) |
| 1 | Hero | Video de crestas, titular por líneas, palabra que rota, pantallas con parallax; al bajar, la portada se encoge como una tarjeta |
| 2 | El problema | Ecuador de noche en capas (volcanes, neblina, cóndor). Se entra al valle, el pueblo se convierte en un mapa de luces que se enciende y se apaga, y siguen las frases con fotos en píldora |
| 3 | La campaña | Las luces vuelven, todo pasa a crema y aparece "Vive tu ciudad" |
| 4 | Ganan todos | Scroll horizontal con tres ganadores y el remate |
| 5 | 7 días | "7 días" llena la pantalla y queda de contador; cada día trae su visual vivo |
| 6 | Gaia | Chat que funciona: tres planes reales de la demo, razonamiento, tarjetas e itinerario con mapa. Se reproduce solo a los 4 s |
| 7 | Reservas | Tres pantallas: la foto del riel vuela a la portada, "Reservar" se vuelve un check que estalla en partículas, y cae el aviso |
| 8 | Datos | El panel del municipio se arma pieza por pieza: KPIs, tendencia, mapa de calor, demanda que se escribe sola |
| 9 | Contenido | Muro de reels en columnas que van en sentidos opuestos; los videos se reproducen al pasar el mouse; publicación de @TuMunicipio |
| 10 | Así se nota | Comparador arrastrable: collage caótico contra Vive limpio. Se mueve solo una vez |
| 11 | Respaldo | Cinta con los 9 logos de gremios y aliados, cifras que cuentan y la foto del comedor de fondo |
| 12 | Entregables | Bento crema con un visual distinto por entregable y el sello "Operado de principio a fin…" |
| 13 | Preguntas | Acordeón grande y accesible |
| 14 | Cierre | Ecuador vuelve encendido, el titular lleva el video del volcán dentro de las letras, y aparecen la tarjeta de demo, el formulario y el pie |

## Decisiones principales

Están todas en `DECISIONES.md`. Las más importantes:

- **Ecuador de noche en lugar de copiar la demo.** El paisaje animado de volcanes que te gustó se rehízo con otro sentido: Ecuador entero, de noche y apagado al inicio (el problema) y encendido al final (la promesa).
- **La demo es el llamado a la acción.** Hay un botón "Ver demo" en la navegación, en el hero, en Gaia y en el cierre.
- **Pantallas de Reservas y panel de Datos construidos en HTML** (no capturas), para que el morph y el armado pieza por pieza sean reales.
- **Video dentro de las letras con `mix-blend-mode: darken`.** `background-clip: text` no acepta video, y así funciona en todos los navegadores.
- **Única línea nueva fuera del brief:** la leyenda del cierre, "Cada valle encendido. Cada negocio en vitrina."

## Pendientes

Lo que tienes que reemplazar (variables, logos, cifras de ejemplo) está en **`PENDIENTES.md`**.

## Mejores capturas

En `docs/capturas/`:

- `01-hero-1440.jpg`
- `06-gaia-1440.jpg`, `06-gaia-390.jpg`: el itinerario armado
- `07-reservas-1440.jpg`, `07-reservas-390.jpg`: la reserva confirmada con el aviso
- `08-datos-1440.jpg`: el panel completo
- `09-contenido-1440.jpg`
- `10-antes-despues-1440.jpg`, `10-antes-despues-390.jpg`
- `12-entregables-1440.jpg`
- `14-cierre-1440.jpg`: el titular con video

## Herramientas incluidas

- `npm run media`: regenera fotos, videos, pantallas y marca optimizados desde `../pelileo multimedia hd` y la demo.
- `npm run shots`: vuelve a capturar las pantallas de la demo (con la demo corriendo en el puerto 3000).
- `npm run screens -- --scenes=gaia --widths=390,1440 --video`: capturas y video de revisión por escena (en `review/`, que no se sube al repo).
