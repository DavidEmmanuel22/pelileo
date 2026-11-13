/**
 * Escenarios del chat de Gaia (escena 6), tomados de los datos de la demo Vive Pelileo
 * (`../vive-pelileo-kit/data/gaia-scenarios.json` y `places.json`).
 */

export type Lugar = { id: string; nombre: string; tipo: string; lat: number; lng: number; nota: string };
export type Parada = { hora: string; lugar: string; titulo: string; costo: number };
export type Escenario = {
  chip: string;
  mensaje: string;
  respuesta: string;
  tarjetas: { lugar: string; detalle: string }[];
  plan: { titulo: string; grupo: string; presupuesto: number; paradas: Parada[] };
};

export const LUGARES: Record<string, Lugar> = {
  "r-indigo": { id: "r-indigo", nombre: "Café Índigo", tipo: "Café", lat: -1.3262, lng: -78.5515, nota: "Desde $5" },
  "tambo-ruta-jean": { id: "tambo-ruta-jean", nombre: "Ruta del Jean", tipo: "Compras", lat: -1.3252, lng: -78.5532, nota: "Gratis" },
  "r-volquetero": { id: "r-volquetero", nombre: "El Volquetero de Doña Rosa", tipo: "Comida típica", lat: -1.3295, lng: -78.5468, nota: "Desde $6" },
  "e-tejido": { id: "e-tejido", nombre: "Taller de tejido en telar", tipo: "Experiencia", lat: -1.3205, lng: -78.5792, nota: "Apto para niños" },
  "salasaca-plaza-arte": { id: "salasaca-plaza-arte", nombre: "Plaza del Arte · Salasaca", tipo: "Cultura", lat: -1.3209, lng: -78.5786, nota: "Gratis" },
  "h-hosteria": { id: "h-hosteria", nombre: "Hostería Valle de Pachanlica", tipo: "Hospedaje", lat: -1.3265, lng: -78.565, nota: "Piscina temperada" },
  "niton-mirador": { id: "niton-mirador", nombre: "Cerro Nitón", tipo: "Mirador", lat: -1.355, lng: -78.552, nota: "Gratis" },
  "pelileo-grande": { id: "pelileo-grande", nombre: "Pelileo Grande", tipo: "Historia", lat: -1.337, lng: -78.53, nota: "Guía local" },
  "r-fogon": { id: "r-fogon", nombre: "Fogón del Tungurahua", tipo: "Restaurante", lat: -1.336, lng: -78.5335, nota: "Vista al valle" },
  "e-cosecha": { id: "e-cosecha", nombre: "Cosecha en Huerta y Leña", tipo: "Agroturismo", lat: -1.3484, lng: -78.5404, nota: "Para toda la familia" },
  "r-niton-cafe": { id: "r-niton-cafe", nombre: "Mirador Nitón Café", tipo: "Desayuno", lat: -1.3538, lng: -78.5508, nota: "Vista al volcán" },
  "e-parapente": { id: "e-parapente", nombre: "Vuelo biplaza en el Nitón", tipo: "Aventura", lat: -1.3555, lng: -78.5525, nota: "Con piloto certificado" },
  "r-trucha": { id: "r-trucha", nombre: "Truchas del Valle Hermoso", tipo: "Restaurante", lat: -1.342, lng: -78.522, nota: "Trucha fresca" },
  "b-costura": { id: "b-costura", nombre: "La Costura", tipo: "Coctelería", lat: -1.3298, lng: -78.544, nota: "Aguardiente local" },
  "parque-central": { id: "parque-central", nombre: "Parque Central", tipo: "Paseo", lat: -1.3301, lng: -78.546, nota: "Gratis" },
  "teligote": { id: "teligote", nombre: "Cerro Teligote", tipo: "Naturaleza", lat: -1.37, lng: -78.565, nota: "Gratis" },
};

export const ESCENARIOS: Escenario[] = [
  {
    chip: "Plan familiar, 2 días, $250",
    mensaje: "Vamos en familia, 2 adultos y 2 niños. Queremos un plan de 2 días con $250.",
    respuesta: "Armé un fin de semana tranquilo, con actividades que los niños van a disfrutar. Te propongo estos lugares:",
    tarjetas: [
      { lugar: "e-tejido", detalle: "Sábado · 14:30" },
      { lugar: "h-hosteria", detalle: "Sábado · noche" },
      { lugar: "e-cosecha", detalle: "Domingo · 15:00" },
    ],
    plan: {
      titulo: "Fin de semana en familia",
      grupo: "2 días · 2 adultos y 2 niños",
      presupuesto: 250,
      paradas: [
        { hora: "Sáb 09:00", lugar: "r-indigo", titulo: "Desayuno en Café Índigo", costo: 18 },
        { hora: "Sáb 10:00", lugar: "tambo-ruta-jean", titulo: "Ruta del Jean", costo: 0 },
        { hora: "Sáb 12:30", lugar: "r-volquetero", titulo: "Almuerzo: volquetero", costo: 28 },
        { hora: "Sáb 14:30", lugar: "e-tejido", titulo: "Taller de tejido en telar", costo: 20 },
        { hora: "Sáb 17:30", lugar: "h-hosteria", titulo: "Hostería con piscina y cena", costo: 102 },
        { hora: "Dom 09:30", lugar: "niton-mirador", titulo: "Mirador del Cerro Nitón", costo: 0 },
        { hora: "Dom 13:00", lugar: "r-fogon", titulo: "Almuerzo en Fogón del Tungurahua", costo: 42 },
        { hora: "Dom 15:00", lugar: "e-cosecha", titulo: "Cosecha de frutas", costo: 26 },
      ],
    },
  },
  {
    chip: "Una cita para el sábado",
    mensaje: "Quiero sorprender a mi pareja el sábado. Algo distinto, con buena vista y una cena rica.",
    respuesta: "Tengo un sábado de aventura y vista al volcán, que cierra con cócteles. Mira estas opciones:",
    tarjetas: [
      { lugar: "e-parapente", detalle: "Sábado · 10:00" },
      { lugar: "r-trucha", detalle: "Sábado · 14:00" },
      { lugar: "b-costura", detalle: "Sábado · 19:00" },
    ],
    plan: {
      titulo: "Un sábado para dos",
      grupo: "1 día · pareja",
      presupuesto: 120,
      paradas: [
        { hora: "08:30", lugar: "r-niton-cafe", titulo: "Desayuno con vista al volcán", costo: 12 },
        { hora: "10:00", lugar: "e-parapente", titulo: "Vuelo biplaza sobre el valle", costo: 70 },
        { hora: "12:00", lugar: "teligote", titulo: "Caminata corta en Teligote", costo: 0 },
        { hora: "14:00", lugar: "r-trucha", titulo: "Almuerzo de trucha fresca", costo: 14 },
        { hora: "19:00", lugar: "b-costura", titulo: "Cócteles en La Costura", costo: 12 },
      ],
    },
  },
  {
    chip: "Algo gratis para hoy",
    mensaje: "¿Qué puedo hacer hoy sin gastar nada?",
    respuesta: "Hoy hay mucho que vivir sin gastar un dólar. Empieza por aquí:",
    tarjetas: [
      { lugar: "tambo-ruta-jean", detalle: "Abierto hasta 18:30" },
      { lugar: "salasaca-plaza-arte", detalle: "Tejedores en vivo" },
      { lugar: "niton-mirador", detalle: "Atardecer 18:10" },
    ],
    plan: {
      titulo: "Hoy, sin gastar",
      grupo: "Hoy · plan libre",
      presupuesto: 0,
      paradas: [
        { hora: "10:00", lugar: "tambo-ruta-jean", titulo: "Recorre la Ruta del Jean", costo: 0 },
        { hora: "12:00", lugar: "parque-central", titulo: "Parque Central y la iglesia", costo: 0 },
        { hora: "14:00", lugar: "salasaca-plaza-arte", titulo: "Tejedores en la Plaza del Arte", costo: 0 },
        { hora: "17:30", lugar: "niton-mirador", titulo: "Atardecer en el Cerro Nitón", costo: 0 },
      ],
    },
  },
];
