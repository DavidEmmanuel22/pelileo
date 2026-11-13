# PLAN · Vive para municipios

> Un spot que se recorre con el scroll. Cada escena: un titular, una imagen que se queda y **un** gran movimiento.

## 1. Dirección de arte

**Idea madre — "la ciudad se enciende".** La página empieza de noche y termina con todo encendido. El hilo visual es un punto de luz ámbar: es un negocio, un atractivo o una persona que vive su ciudad.

**Firma propia: el Ecuador de noche (pedido de Agustín).** Tomo como inspiración la escena del valle de la demo de Pelileo (capas de cordillera fijadas que se mueven a distintas velocidades), pero la reinterpreto con otro sentido y otro dibujo. Aquí es **el país**: una avenida de volcanes (cono perfecto, domo nevado, cumbre dentada y uno que humea), luna, niebla en los valles, un **cóndor** que planea en lugar del parapente y, en cada valle, **pueblos con luces tenues**. La cámara baja hacia un valle y esas luces se convierten en el mapa de la ciudad. El mismo paisaje vuelve al cierre con todos los valles encendidos. Ninguna capa, color ni texto se copia de la demo.

### Paleta (noche cálida)
| Token | Valor | Uso |
|---|---|---|
| `--night` | `#0D0907` | fondo base, casi negro con tinte cálido |
| `--night-2` | `#16100C` | superficies |
| `--night-3` | `#211812` | tarjetas, bordes |
| `--line-d` | `rgba(255,236,214,.12)` | líneas sobre oscuro |
| `--cream` | `#F4ECE1` | escenas claras |
| `--cream-2` | `#EADFCF` | superficies claras |
| `--ink` | `#1B130E` | texto sobre claro |
| `--fg` | `#F7F0E7` | texto sobre oscuro |
| `--fg-2` | `#BFAF9F` | texto secundario sobre oscuro (AA ≥ 4.5 sobre `--night`) |
| `--coral` | `#F45C55` → `--coral-2` `#FF8A6B` | acento, botones y luces |
| `--amber` | `#FFB547` | puntos de luz |
| `--ok` | `#4ADE80` | solo estados positivos |
| Cordillera | `#2A1C22` → `#1C1418` → `#120D0E` | capas del paisaje (ciruela, berenjena y carbón, nada de azul frío) |

### Escala tipográfica (solo Plus Jakarta Sans)
- **Display**: `clamp(48px, 10.5vw, 140px)`, 800, tracking −0.035 em, interlineado 0.95.
- **H2**: `clamp(44px, 7vw, 112px)`, 800, −0.035 em, 0.98.
- **H3**: `clamp(28px, 3.4vw, 48px)`, 700, −0.025 em, 1.05.
- **Cuerpo grande**: 19 px escritorio / 16 px celular, interlineado 1.55, ancho máximo de 60 caracteres.
- **Etiquetas**: 12–13 px, 700, versalitas con tracking +0.14 em.

### Materia
- Grano SVG fijo en toda la página (opacidad 0.07) y viñeta en fotos y video.
- Pantallas de la app: sin marco de teléfono, esquinas de 36 px, sombra profunda, reflejo diagonal sutil y perspectiva 3D.
- Fotos a sangre con contraste rico (`filter: contrast(1.08) saturate(1.05)`) y degradé cálido.

## 2. Escenas (una línea cada una)

| # | Escena | Fondo | Momento |
|---|---|---|---|
| 00 | Precarga | noche | "Vive" letra por letra, punto coral que late y se abre como iris |
| 01 | Hero | video de crestas al atardecer | titular con máscara + palabra que rota + 3 pantallas flotantes; al bajar se encoge a tarjeta y se aleja |
| 02 | Problema | **Ecuador de noche** → mapa | la cámara baja al valle, cientos de luces se encienden con contadores, la mayoría se apaga; tres frases con píldoras de foto |
| 03 | Campaña | luz → crema | los puntos se multiplican hasta llenar de luz; "Vive [tu ciudad]" se escribe y se borra |
| 04 | Tres ganadores | crema | scroll horizontal fijado con 4 paneles (foto a sangre y texto enorme); el último termina en negro |
| 05 | 7 días | noche | "7 días" crece hasta llenar la pantalla y queda como contador; línea de tiempo con un visual vivo por día |
| 06 | Gaia | noche + halo coral | chat real simulado: chips, pensando, lugares, itinerario con ruta-costura |
| 07 | Reservas | noche | tres pantallas que se transforman (Descubre → Elige → Reserva), check que estalla y un toast |
| 08 | Datos | noche | el panel del municipio se arma pieza por pieza; la lista de demanda insatisfecha se escribe sola |
| 09 | Contenido | noche | muro 9:16 en columnas que van en sentidos opuestos; al centro, publicación de @TuMunicipio con "me gusta" que suben |
| 10 | Antes y después | noche | comparador que se arrastra; se mueve solo una vez al entrar |
| 11 | Respaldo | foto de comercio desenfocada | siluetas de logos elegantes y cifras que cuentan |
| 12 | Todo lo que recibe | crema | bento asimétrico con 7 visuales propios |
| 13 | Preguntas | noche | acordeón grande, de alto contraste |
| 14 | Cierre | **Ecuador encendido** | el paisaje vuelve con cada valle iluminado; titular con video dentro de las letras; demo y formulario |

## 3. Coreografía de transiciones

1. **00 → 01 · Iris.** El punto coral bajo "Vive" crece con `clip-path: circle()` y revela el video del hero.
2. **01 → 02 · La tarjeta se aleja.** El hero (fijado) se encoge a `scale .82`, gana esquinas de 36 px y baja su opacidad mientras detrás ya está el cielo nocturno del Ecuador. Las pantallas flotantes salen en parallax más rápido que la tarjeta.
3. **02 · Bajar al valle.** Paisaje en 5 capas (estrellas y luna, volcanes lejanos, volcanes medios, lomas con pueblos y primer plano) con velocidades distintas. El cóndor cruza. Las luces de los pueblos parpadean. La cámara hace zoom al valle central: sus luces crecen, la cordillera se abre hacia los lados y aparece el **mapa nocturno** de calles. Ahí se encienden los puntos (canvas 2D) con los contadores; luego se apagan casi todos.
4. **02 → 03 · Luz.** Los pocos puntos que quedaron se multiplican en olas radiales hasta saturar la pantalla de luz ámbar → coral → crema. Funde a la escena clara.
5. **03 → 04 · Cortina.** Sobre crema, el titular "Cuando tu ciudad se vive, ganan todos." empuja hacia el pin horizontal. Los 4 paneles se deslizan; el 4.º oscurece hasta negro.
6. **04 → 05 · Negro → número.** Desde el negro, "7 días" crece desde un punto hasta llenar la pantalla (escala) y se reduce a la esquina como contador.
7. **05 → 06 · El mapa se enciende.** El día 7 enciende el mapa entero; su brillo se queda como el halo coral que respira detrás de Gaia.
8. **06 → 07 · La ruta continúa.** La ruta-costura del itinerario lleva a las tres pantallas de reserva.
9. **07 → 08 · Partículas.** Las partículas coral del check se vuelven los puntos del mapa de calor del panel.
10. **08 → 09 · Titular que crece.** "Tu ciudad, contada como se merece." entra y el muro de videos sube por detrás.
11. **09 → 10 · Corte limpio.** El comparador entra con un barrido del deslizador.
12. **10 → 11 → 12 · Cortina crema.** Las cifras sobre la foto oscura y luego una cortina crema sube para el bento.
13. **12 → 13 → 14 · Volver a la noche.** El acordeón sobre noche y, al final, el Ecuador de la escena 2 vuelve con **todos** los valles encendidos y el cóndor de regreso.

## 4. Revisión del plan contra el brief (antes de construir)

- ¿Alguna escena es plantilla? **Respaldo (11)** corría riesgo de verse como "fila de logos + 3 números". Rediseño: cifras gigantes que ocupan el ancho, con el "+" en coral y los logos como un riel infinito de siluetas que pasa por delante de la foto desenfocada. **Preguntas (13)**: en lugar de un acordeón chico, preguntas a 32–40 px, número de orden grande y respuesta que se despliega con máscara.
- **Todo lo que recibe (12)**: 7 celdas de tamaños distintos, cada una con su visual animado (mapa con pines, perfil, fotograma, gráfico, etc.). Nada de ícono + título + párrafo.
- **Celular**: los pins largos se acortan (escena 2: 150 svh; 4: carrusel vertical; 5: línea vertical sin pin largo). Ninguna escena pasa de ~1,5 pantallas.
- **Reduced motion**: `gsap.matchMedia` sin pins ni scrub; todo visible y con fundidos simples.
- **Texto real**: contadores, chat, panel y comparador son HTML. El canvas del mapa es decorativo (`aria-hidden`) y su información está en texto.
- **Frases prohibidas**: revisadas. Sin voseo ni "no somos solo".

## 5. Activos elegidos

- **Hero**: video 1 (crestas al atardecer, cálido), recortado a 14 s en bucle; póster del primer cuadro.
- **Cierre (texto con video)**: video 3 (volcán con nubes): el blanco de las nubes llena bien las letras.
- **Muro de contenido**: recortes 9:16 de los videos 1, 3 y 4 (cascada) y del 2 (hojas a contraluz), más fotos de comida, artesanía, aventura, gente y fiesta.
- **Ganadores**: tu gente → feria de sabores de noche (`ev-sabores`); visitantes → caminantes (11); negocios → sastre en su taller (14); ciudad → mercado de frutas (16).
- **Píldoras del problema**: restaurante → plato típico (7); artesano → telar (12); fiesta → concierto andino (`ev-musica-andina`).
- **Respaldo**: comedor de madera (24), desenfocado.
- No uso el escudo ni la bandera de Pelileo (17 y 18) fuera de la demo.
