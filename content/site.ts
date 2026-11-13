/**
 * Todo el texto y todas las cifras de la landing viven aquí.
 * Los valores con `pendiente: true` son de ejemplo: se ven normales en la página
 * y están listados en PENDIENTES.md para reemplazarlos.
 */

export type Cifra = { valor: number; prefijo?: string; sufijo?: string; etiqueta: string; pendiente?: boolean };

const env = (v: string | undefined, fallback: string) => (v && v.trim() ? v.trim() : fallback);

export const config = {
  DEMO_URL: env(process.env.NEXT_PUBLIC_DEMO_URL, "http://localhost:3000"),
  WHATSAPP_NUMBER: env(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, "593990000000"), // pendiente
  CALENDAR_URL: env(process.env.NEXT_PUBLIC_CALENDAR_URL, ""), // pendiente (vacío = no se muestra)
  CONTACT_EMAIL: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL, "hola@clapzy.app"), // pendiente
};

export const seo = {
  title: "Vive · Activación local y promoción turística para tu ciudad | by clapzy",
  description:
    "La campaña que activa el consumo local y la promoción turística de tu cantón, operada de principio a fin. Tu ciudad en vitrina en 7 días.",
};

export const nav = {
  links: [
    { label: "La campaña", href: "#campana" },
    { label: "Gaia", href: "#gaia" },
    { label: "Datos", href: "#datos" },
    { label: "7 días", href: "#siete-dias" },
  ],
  verDemo: "Ver demo",
  agendar: "Agendar",
};

export const escenas = [
  "Inicio",
  "El problema",
  "La campaña",
  "Ganan todos",
  "7 días",
  "Gaia",
  "Reservas",
  "Datos",
  "Contenido",
  "Así se nota",
  "Respaldo",
  "Entregables",
  "Preguntas",
  "Hagamos que se viva",
];

export const hero = {
  titular: ["Cuando una ciudad", "se vive,", "se nota."],
  vive: "Vive",
  rotan: ["tu ciudad", "tu gente", "lo nuestro", "el fin de semana", "Pelileo"],
  bajada:
    "Vive es la campaña que activa el consumo local y la promoción turística de tu cantón. Nosotros la operamos de principio a fin.",
  ctaDemo: "Ver demo",
  ctaAgendar: "Agendar una reunión",
  desliza: "Desliza",
};

export const ecuador = {
  etiqueta: "Ecuador, de noche",
  linea: "En cada valle hay una ciudad con historias, sabores y gente que vale la pena conocer.",
};

export const problema = {
  titular: "Tu ciudad tiene más de lo que su gente conoce.",
  contadores: [
    { valor: 320, etiqueta: "negocios", pendiente: true },
    { valor: 48, etiqueta: "atractivos", pendiente: true },
    { valor: 26, etiqueta: "fiestas y eventos al año", pendiente: true },
  ] satisfies Cifra[],
  apagon: "La mayoría no aparece donde la gente busca.",
  frases: [
    { texto: "El restaurante que solo conoce el barrio.", foto: "plato-tipico", alt: "Plato típico servido en un restaurante local" },
    { texto: "El artesano sin vitrina.", foto: "telar", alt: "Manos tejiendo en un telar" },
    { texto: "La fiesta de la que todos se enteran el lunes.", foto: "concierto", alt: "Concierto de música andina en una plaza" },
  ],
  remate: "Cuando lo nuestro no se ve, la gente sale a buscar en otra parte.",
};

export const campana = {
  titular: "Vive enciende tu ciudad.",
  bajada:
    "Una campaña de activación local y promoción turística, hecha a la medida de tu cantón y operada de principio a fin por nuestro equipo.",
  nombres: ["tu ciudad", "tu cantón", "tu gente"],
};

export const ganadores = {
  titular: "Cuando tu ciudad se vive, ganan todos.",
  paneles: [
    {
      nombre: "Tu gente.",
      corto: "Tu gente",
      texto: "Redescubre su ciudad y la vive todo el año: dónde comer hoy, qué hacer el fin de semana, qué fiesta viene.",
      foto: "feria-noche",
      alt: "Feria nocturna con luces colgantes y familias recorriendo los puestos",
    },
    {
      nombre: "Tus visitantes.",
      corto: "Tus visitantes",
      texto: "Llegan y saben qué hacer desde el primer minuto, con planes armados a su medida.",
      foto: "caminantes",
      alt: "Dos caminantes subiendo una ladera de montaña",
    },
    {
      nombre: "Tus negocios.",
      corto: "Tus negocios",
      texto: "Ganan vitrina y clientes, sin pagar publicidad por su cuenta.",
      foto: "sastre",
      alt: "Sastre cosiendo en su taller",
    },
    {
      nombre: "Tu ciudad.",
      corto: "Tu ciudad",
      texto: "Se ve activa, moderna y orgullosa de lo suyo. Y eso se nota.",
      foto: "mercado",
      alt: "Mercado con canastas llenas de frutas de colores",
    },
  ],
};

export const sieteDias = {
  titular: "Lo hacemos nosotros. En 7 días.",
  grande: "7 días",
  pasos: [
    { dia: "Día 1", nombre: "Diagnóstico", texto: "Hacemos una radiografía de tu oferta: qué hay, qué falta y qué se ve en internet.", visual: "diagnostico", contador: 1 },
    { dia: "Días 2 y 3", nombre: "Mapeo", texto: "Censamos y georreferenciamos restaurantes, hospedajes, operadores, artesanos y atractivos.", visual: "mapeo", contador: 3 },
    { dia: "Día 4", nombre: "Vitrina Vive", texto: "Cada negocio queda con su perfil: fotos, horarios, contacto y reservas.", visual: "vitrina", contador: 4 },
    { dia: "Día 5", nombre: "Capacitación", texto: "Enseñamos a cada negocio a actualizar su perfil y a recibir clientes.", visual: "capacitacion", contador: 5 },
    { dia: "Día 6", nombre: "Contenido", texto: "Grabamos el video de la ciudad y el video demostrativo, y entregamos fotos y piezas para las redes del municipio.", visual: "contenido", contador: 6 },
    { dia: "Día 7", nombre: "Lanzamiento", texto: "Difundimos la vitrina y los atractivos. Tu ciudad queda en vitrina.", visual: "lanzamiento", contador: 7 },
    { dia: "Después", nombre: "Informe", texto: "Te entregamos las métricas: negocios activados, alcance, visitas e interacciones.", visual: "informe", contador: 7 },
  ],
  remate: ["Tu equipo no suma tareas.", "Lo aprueba y lo comparte."],
};

export const gaia = {
  titular: "Una guía que conoce cada rincón de tu ciudad.",
  bajada:
    "Gaia es la inteligencia artificial de Clapzy. Entiende lo que cada persona quiere vivir y le arma el plan con los negocios de tu ciudad.",
  beneficios: [
    "Responde en segundos, a cualquier hora.",
    "Recomienda negocios de tu ciudad.",
    "Ajusta el plan al presupuesto, al grupo y al clima.",
  ],
  pensando: ["Revisé 31 lugares", "Ajusté a tu presupuesto", "Miré el clima"],
  pregunta: "¿Te armo el itinerario?",
  si: "Sí, ármalo",
  boton: "Pruébala en la demo",
  saludo: "Hola, soy Gaia. ¿Qué quieres vivir?",
  placeholder: "Cuéntale a Gaia qué quieres vivir…",
};

export const reservas = {
  titular: "Del ¿qué hacemos hoy? a la reserva, en dos toques.",
  pasos: ["Descubre", "Elige", "Reserva"],
  toast: { titulo: "Reserva confirmada", detalle: "Fogón del Tungurahua · Sábado 13:00 · 4 personas" },
  bajada: "Cada recomendación termina en un negocio local: una mesa, una habitación, un tour, una entrada.",
};

export const datos = {
  titular: "Por primera vez, sabrás qué busca tu gente.",
  bajada:
    "Qué se busca, cuándo, de dónde llega la gente y cuánto planea gastar. Decisiones de turismo con evidencia.",
  frase: "Cada búsqueda sin respuesta es una oportunidad de inversión para tu cantón.",
  kpis: [
    { valor: 14390, etiqueta: "Visitantes", delta: "+18%", pendiente: true },
    { valor: 4490, etiqueta: "Planes creados con Gaia", delta: "+41%", pendiente: true },
    { valor: 9214, etiqueta: "Contactos a negocios", delta: "+27%", pendiente: true },
    { valor: 612400, prefijo: "$", etiqueta: "Gasto estimado", delta: "+22%", pendiente: true },
  ] satisfies (Cifra & { delta: string })[],
  tendencia: [2380, 2460, 2520, 2690, 2810, 2760, 3050, 3010, 3320, 3460, 3590, 3870],
  demandaTitulo: "Lo que la gente busca y tu ciudad aún no ofrece",
  demanda: [
    { item: "Glamping", volumen: 92 },
    { item: "Comida vegetariana", volumen: 74 },
    { item: "Transporte al mirador", volumen: 61 },
    { item: "Planes de noche", volumen: 48 },
  ],
};

export const contenido = {
  titular: "Tu ciudad, contada como se merece.",
  bajada:
    "Videos, fotos y piezas listas para las redes del municipio. Una ciudad activa, todos los días, en todas partes.",
  post: { cuenta: "@TuMunicipio", texto: "Este fin de semana, vive lo nuestro", likes: 2847, comentarios: 186 },
};

export const antesDespues = {
  titular: "Así se nota.",
  texto: ["Antes: información dispersa.", "Con Vive: tu ciudad entera, en un solo lugar."],
  antes: "Antes",
  despues: "Con Vive",
};

export const respaldo = {
  titular: "Trabajamos con quienes mueven la economía local.",
  logos: [
    { nombre: "AEI", archivo: "aei.svg" },
    { nombre: "Cámara de Comercio 1", archivo: "camara-1.svg" },
    { nombre: "Cámara de Comercio 2", archivo: "camara-2.svg" },
    { nombre: "Cámara de Comercio 3", archivo: "camara-3.svg" },
    { nombre: "Aliado 5", archivo: "aliado-5.svg" },
  ],
  cifras: [
    { valor: 5000, prefijo: "+", etiqueta: "establecimientos en Clapzy" },
    { valor: 1200, prefijo: "+", etiqueta: "eventos publicados", pendiente: true },
    { valor: 12, etiqueta: "gremios y cámaras aliadas", pendiente: true },
  ] satisfies Cifra[],
};

export const entregables = {
  titular: "Todo lo que recibe tu municipio.",
  etiqueta: "Operado de principio a fin por el equipo de Clapzy.",
  items: [
    { id: "diagnostico", nombre: "Diagnóstico", texto: "Una radiografía de la oferta turística actual: qué hay, qué falta y qué tiene presencia digital." },
    { id: "mapeo", nombre: "Mapeo", texto: "Un censo georreferenciado de restaurantes, hospedajes, operadores, artesanos y atractivos." },
    { id: "vitrina", nombre: "Vitrina Vive", texto: "Cada establecimiento con su perfil (fotos, horarios, contacto) dentro de Clapzy." },
    { id: "capacitacion", nombre: "Capacitación", texto: "A los establecimientos, para que usen y actualicen su perfil." },
    { id: "contenidos", nombre: "Contenidos", texto: "Videos cortos, fotos y piezas del cantón para las redes del municipio. Incluye un video de la ciudad y un video demostrativo." },
    { id: "difusion", nombre: "Difusión digital", texto: "De la vitrina y de los atractivos." },
    { id: "informe", nombre: "Informe con métricas", texto: "Establecimientos activados, alcance, visitas e interacciones." },
  ],
};

export const preguntas = {
  titular: "Preguntas que siempre nos hacen",
  items: [
    { q: "¿Mi equipo tiene que hacer algo?", a: "Aprobar y compartir. El mapeo, la carga de negocios, la capacitación, el contenido y la difusión los hacemos nosotros." },
    { q: "¿Cuánto tarda?", a: "En 7 días tu ciudad está en vitrina, con sus negocios cargados, capacitados y con contenido listo." },
    { q: "¿Qué pasa con los negocios que no tienen redes ni página web?", a: "Los visitamos, tomamos sus datos y fotos y creamos su perfil. Solo necesitan un celular para actualizarlo." },
    { q: "¿Cómo vemos los resultados?", a: "Con un informe de negocios activados, alcance, visitas e interacciones, y con el panel de datos de la campaña." },
    { q: "¿Sirve para la gente de la ciudad o solo para turistas?", a: "Para las dos. Vive empieza por tu gente: cuando la ciudad se vive, los visitantes la siguen." },
  ],
};

export const cierre = {
  titular: ["Tu ciudad ya tiene todo.", "Hagamos que se viva."],
  demo: { titulo: "Ver la demo", texto: "Mira cómo se vive Pelileo", boton: "Ver demo" },
  form: {
    titulo: "Agendar una reunión",
    campos: {
      nombre: "Nombre",
      cargo: "Cargo",
      municipio: "Municipio o cantón",
      provincia: "Provincia",
      whatsapp: "WhatsApp",
      correo: "Correo (opcional)",
    },
    boton: "Quiero agendar una reunión",
    exito: "Listo. Te escribimos por WhatsApp para coordinar la reunión.",
    calendario: "Prefiero elegir fecha en el calendario",
    mensaje: (d: { nombre: string; cargo: string; municipio: string; provincia: string }) =>
      `Hola, soy ${d.nombre}, ${d.cargo} de ${d.municipio}, ${d.provincia}. Quiero agendar una reunión sobre Vive.`,
  },
  pie: { copy: "© Clapzy" },
};

export const provincias = [
  "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro", "Esmeraldas", "Galápagos",
  "Guayas", "Imbabura", "Loja", "Los Ríos", "Manabí", "Morona Santiago", "Napo", "Orellana", "Pastaza",
  "Pichincha", "Santa Elena", "Santo Domingo de los Tsáchilas", "Sucumbíos", "Tungurahua", "Zamora Chinchipe",
];
