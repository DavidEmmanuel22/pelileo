# Fotos y video para la portada

> **Estado (12 nov):** integrado todo el material HD de `pelileo multimedia hd`: video del hero (horizontal y vertical), cascada, vuelo y cierre; hospedajes, restaurantes, experiencias, collage de la intro y la galería «Postales del valle» (`public/media/galeria/`, cualquier foto que agregues ahí entra sola).

Suelta los archivos con **estos nombres exactos** y la demo los usa sola (en `npm run dev` basta con recargar; para producción, vuelve a correr `npm run build`). Formatos: `.jpg`, `.jpeg`, `.webp` o `.png`. Mientras un archivo no exista, se ve la foto provisional.

## Portada · `public/media/`

| Archivo | Dónde aparece | Tamaño ideal |
|---|---|---|
| `hero.jpg` | Fondo del hero (y póster del video) | 2400 px de ancho o más, horizontal |
| `hero.mp4` | Video del hero (opcional; si existe, reemplaza la foto) | 1920×1080, 10–20 s, sin audio, máx. ~8 MB |
| `hero-vertical.mp4` | Video del hero en celulares (opcional) | 1080×1920, 10–20 s, sin audio |
| `exp-aventura.jpg` | Mosaico «Qué vivir» · Aventura (la grande) | 1800 px, cuadrada o vertical |
| `exp-cultura.jpg` | Mosaico · Cultura Salasaka | 1200 px |
| `exp-jean.jpg` | Mosaico · Ciudad del Jean | 1200 px |
| `exp-sabores.jpg` | Mosaico · Sabores | 1200 px |
| `exp-naturaleza.jpg` | Mosaico · Naturaleza | 1200 px |
| `vuelo.jpg` | Franja «Vuela sobre el valle» (a pantalla completa) | 2400 px, horizontal, con espacio libre a la izquierda para el texto |
| `cierre.jpg` | Fondo del cierre «¿Listo para vivir Pelileo?» (se ve oscurecida) | 2400 px, horizontal |

Si el video pesa mucho, déjalo igual en `public/media/` y pídeme que lo comprima.

## Fotos de lugares · `public/images/places/`

Para cambiar la foto de un restaurante, hotel o atractivo, **reemplaza el archivo con el mismo nombre** (1400 px o más, horizontal). Aparece en la portada, en Explorar, en el detalle y en los planes de Gaia.

| Archivo | Lugar |
|---|---|
| `tambo-ruta-jean.jpg` | Ruta del Jean · El Tambo |
| `parque-central.jpg` | Parque Central de Pelileo |
| `feria-pelileo.jpg` | Mercado y feria de Pelileo |
| `salasaca-plaza-arte.jpg` | Plaza del Arte · Salasaca |
| `salasaca-llikakama.jpg` | Mercado Artesanal Llikakama |
| `niton-mirador.jpg` | Cerro Nitón |
| `pelileo-grande.jpg` | Pelileo Grande |
| `huambalo-muebles.jpg` | Ruta de los Muebles · Huambaló |
| `ruta-gigantes.jpg` | Ruta de los Gigantes |
| `teligote.jpg` | Cerro Teligote |
| `cotalo-cruz.jpg` | Cruz de Cotaló |
| `las-caras.jpg` | Complejo Las Caras · Cotaló |
| `r-indigo.jpg` | Café Índigo |
| `r-volquetero.jpg` | El Volquetero de Doña Rosa |
| `r-fogon.jpg` | Fogón del Tungurahua |
| `r-trucha.jpg` | Truchas del Valle Hermoso |
| `r-tiesto.jpg` | Empanadas de Tiesto Salasaka |
| `r-huerta.jpg` | Huerta y Leña |
| `r-niton-cafe.jpg` | Mirador Nitón Café |
| `b-cerveceria.jpg` | Cervecería Cerro Azul |
| `b-costura.jpg` | La Costura |
| `h-hosteria.jpg` | Hostería Valle de Pachanlica |
| `h-ciudad-azul.jpg` | Hotel Ciudad Azul |
| `h-telar.jpg` | Casa del Telar · Salasaka |
| `h-glamping.jpg` | Glamping Nueve Estrellas |
| `e-parapente.jpg` | Vuelo biplaza en el Nitón |
| `e-tejido.jpg` | Taller de tejido en telar |
| `e-jean.jpg` | Diseña tu jean |
| `e-cabalgata.jpg` | Cabalgata a Teligote |
| `e-tallado.jpg` | Taller de tallado en madera |
| `e-cosecha.jpg` | Cosecha de frutas en Huerta y Leña |

Las fotos de eventos están en `public/images/events/` y funcionan igual.

## Logos · `public/brand/`

Si tienes el logo del GAD Pelileo en SVG o PNG transparente, déjalo como `public/brand/gad-pelileo.svg` (o `.png`) y te lo pongo en el encabezado y en el pie.

Cuando cambies fotos, actualiza también los créditos en `public/images/credits.json` si no son tuyas.
