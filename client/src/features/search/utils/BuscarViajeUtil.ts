export interface SearchValues {
  origen: string;      // id de terminal (como texto, viene de un <select>)
  destino: string;     // id de terminal
  salida: string;      // YYYY-MM-DD (día local del terminal de origen)
  regreso: string;     // el server aún no soporta ida y vuelta: se ignora
  pasajeros: number;
}

export interface Terminal {
  id: number;
  nombre: string;
  direccion: string;
  Provincia?: { id: number; nombre: string };
}

// Una "sección" es el tramo de un itinerario que hace un mismo bus (de un plan de una empresa)
export interface Seccion {
  id_plan: number;
  id_bus: number;
  empresa: string;
  placa: string;
  tipo_bus: string;
  origen: string;
  destino: string;
  salida_local: string;    // "YYYY-MM-DD HH:mm" en hora local del terminal
  llegada_local: string;
  precio_base: number;
  libres: number;
  tramos_programados: number[];
}

// Un resultado = un itinerario (1 o más secciones, con trasbordos si cambia de bus/plan)
export interface Itinerario {
  salida_local: string;
  llegada_local: string;
  duracion_min: number;
  trasbordos: number;
  precio_base: number;     // sin el extra del tipo de asiento
  libres: number;
  tramos_programados: number[];   // en orden, listos para POST /api/viajes
  secciones: Seccion[];
}

export interface SearchParams {
  origen: string;          // nombre, solo para mostrar
  destino: string;
  fecha_salida: string;
  pasajeros: number;
}

export interface LocationState {
  resultados: Itinerario[];
  parametros: SearchParams;
}
