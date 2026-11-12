export type MapLabel = {
  text: string;
  lat: number;
  lng: number;
  kind: "town" | "parish" | "hill" | "river" | "volcano";
  rotate?: number;
};

/** Nombres de las parroquias y accidentes, en versalitas grises. Posiciones aproximadas. */
export const MAP_LABELS: MapLabel[] = [
  { text: "Pelileo", lat: -1.3348, lng: -78.5418, kind: "town" },
  { text: "Pelileo Grande", lat: -1.3405, lng: -78.5255, kind: "parish" },
  { text: "Salasaca", lat: -1.3155, lng: -78.5835, kind: "parish" },
  { text: "Benítez", lat: -1.3312, lng: -78.5725, kind: "parish" },
  { text: "García Moreno", lat: -1.3905, lng: -78.6015, kind: "parish" },
  { text: "Chiquicha", lat: -1.3008, lng: -78.5305, kind: "parish" },
  { text: "Bolívar", lat: -1.3735, lng: -78.5085, kind: "parish" },
  { text: "Huambaló", lat: -1.3955, lng: -78.5265, kind: "parish" },
  { text: "El Rosario", lat: -1.4005, lng: -78.5625, kind: "parish" },
  { text: "Cotaló", lat: -1.4215, lng: -78.5185, kind: "parish" },
  { text: "Cerro Nitón", lat: -1.3628, lng: -78.5452, kind: "hill" },
  { text: "Cerro Teligote", lat: -1.3812, lng: -78.5735, kind: "hill" },
  { text: "Río Patate", lat: -1.3185, lng: -78.5048, kind: "river", rotate: 76 },
  { text: "Volcán Tungurahua · 5.023 m", lat: -1.4515, lng: -78.442, kind: "volcano" },
];
