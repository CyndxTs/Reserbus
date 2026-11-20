import { format } from 'date-fns';

export interface SearchValues {
  origen: string;      // id de terminal (como texto, viene de un <select>)
  destino: string;     // id de terminal
  salida: string;      // YYYY-MM-DD (día local del terminal de origen)
  pasajeros: number;
}

export interface Terminal {
  id: number;
  nombre: string;
  direccion: string;
  Provincia?: { id: number; nombre: string };
}

export interface Servicio {
  id: number;
  nombre: string;
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

export type Orden = 'llegada' | 'precio' | 'trasbordos';

export interface SearchParams {
  origen: string;          // nombre, solo para mostrar
  destino: string;
  fecha_salida: string;
  pasajeros: number;
}

// Estado que viaja de resultados a /reservar
export interface LocationState {
  itinerario: Itinerario;
  parametros: SearchParams;
}

export const hoyLocal = () => format(new Date(), 'yyyy-MM-dd');
export const MAX_PASAJEROS = 8;

// "YYYY-MM-DD HH:mm" -> "HH:mm"
export const hora = (local: string) => (local ? local.slice(11, 16) : '--:--');
// "YYYY-MM-DD HH:mm" -> minutos absolutos (para comparar y proporcionar tramos)
export const minutosLocal = (local: string) => {
  const [f, h] = local.split(' ');
  const [y, m, d] = f.split('-').map(Number);
  const [hh, mm] = h.split(':').map(Number);
  return Date.UTC(y, m - 1, d, hh, mm) / 60000;
};

export const formatoDuracion = (minutos: number) => {
  if (!minutos || minutos <= 0) return '—';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
};

export type Franja = 'madrugada' | 'manana' | 'tarde' | 'noche';
export const FRANJAS: { id: Franja; nombre: string; rango: string }[] = [
  { id: 'madrugada', nombre: 'Madrugada', rango: 'antes de 6:00' },
  { id: 'manana', nombre: 'Mañana', rango: '6:00 a 12:00' },
  { id: 'tarde', nombre: 'Tarde', rango: '12:00 a 18:00' },
  { id: 'noche', nombre: 'Noche', rango: 'desde 18:00' },
];
export const franjaDe = (local: string): Franja => {
  const h = Number(local.slice(11, 13));
  if (h < 6) return 'madrugada';
  if (h < 12) return 'manana';
  if (h < 18) return 'tarde';
  return 'noche';
};
