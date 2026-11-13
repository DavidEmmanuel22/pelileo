# Pendientes: lo que debes reemplazar

La página funciona completa con valores de ejemplo. Antes de presentarla, cambia esto.

## 1. Variables de entorno (`.env.local`)

Copia `.env.example` como `.env.local` (y cárgalas también en Vercel, en *Settings → Environment Variables*):

| Variable | Para qué sirve | Valor de ejemplo |
|---|---|---|
| `NEXT_PUBLIC_DEMO_URL` | Todos los botones "Ver demo" y "Pruébala en la demo" (este último va a `/gaia`) | `http://localhost:3000` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número que recibe el formulario y el enlace "¿Otra pregunta?". Solo dígitos, con código de país, sin `+` | `593990000000` |
| `NEXT_PUBLIC_CALENDAR_URL` | Enlace "Prefiero elegir fecha en el calendario". **Si queda vacío, el enlace no aparece** | *(vacío)* |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Correo del pie de página | `hola@clapzy.app` |

Si una variable no existe, la página usa el valor de ejemplo (está en `content/site.ts`, objeto `config`).

## 2. Logos de aliados (`public/logos/`)

Deja los archivos con estos nombres exactos. Mientras no existan, la página muestra una silueta elegante con el nombre en gris. Después de agregarlos, vuelve a compilar (`npm run build`) o vuelve a publicar en Vercel: la página los detecta sola.

| Archivo | Aliado |
|---|---|
| `public/logos/aei.svg` | AEI |
| `public/logos/camara-1.svg` | Cámara de Comercio 1 |
| `public/logos/camara-2.svg` | Cámara de Comercio 2 |
| `public/logos/camara-3.svg` | Cámara de Comercio 3 |
| `public/logos/aliado-5.svg` | Una más |

Se aceptan SVG (ideal) o PNG con fondo transparente; si usas PNG, cambia la extensión en `content/site.ts → respaldo.logos`. Los logos se pintan en blanco para que se lean sobre el fondo oscuro. Para cambiar los nombres que se ven en las siluetas, edita `respaldo.logos[].nombre`.

## 3. Cifras de ejemplo (`content/site.ts`)

Todas tienen `pendiente: true` o un comentario `// pendiente`. Se ven como cifras reales: revísalas una por una.

| Dónde se ve | Ruta en `content/site.ts` | Valor de ejemplo |
|---|---|---|
| Escena 2 · contadores de la ciudad | `problema.contadores` | 320 negocios · 48 atractivos · 26 fiestas y eventos al año |
| Escena 11 · eventos publicados | `respaldo.cifras[1]` | +1.200 |
| Escena 11 · gremios y cámaras aliadas | `respaldo.cifras[2]` | 12 |
| Escena 5 y 12 · alerta del diagnóstico | `sieteDias.visual.diagnostico.alerta` | "7 de cada 10 negocios no aparecen en internet" |
| Escena 5 y 12 · porcentajes del diagnóstico | `sieteDias.visual.diagnostico.filas` | 38 %, 54 %, 27 %, 12 %, 41 % |
| Escena 5 y 12 · conteo del mapeo | `sieteDias.visual.mapeo` | 142 restaurantes, 38 hospedajes… |
| Escena 5 y 12 · informe | `sieteDias.visual.informe.metricas` | 316 · 248.000 · 31.400 · 12.900 |
| Escena 8 · panel del municipio | `datos.kpis`, `datos.tendencia`, `datos.demanda` | 14.390 visitantes, etc. |
| Escena 9 · publicación | `contenido.post` | 2.847 me gusta · 186 comentarios |

La cifra "+5.000 establecimientos en Clapzy" viene del brief y no está marcada como pendiente.

## 4. Opcional

- **Analítica:** los eventos (`cta_ver_demo`, `cta_agendar`, `form_enviado`, `gaia_chip`, `escena_vista`) se envían a Vercel Analytics. Actívalo en el proyecto de Vercel, en la pestaña *Analytics*. Si no lo activas, no pasa nada.
- **Dominio:** cuando tengas el dominio final, agrega `NEXT_PUBLIC_SITE_URL=https://tu-dominio` en Vercel para que la imagen al compartir (`public/og.jpg`) use esa URL. Sin ella se usa la URL automática de Vercel.
