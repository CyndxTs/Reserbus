import axios from 'axios';

export type TipoDocumento = 'DNI' | 'CE' | 'PASAPORTE';
export type EstadoViaje = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'EXPIRADO';

export interface RangoAsiento {
  fila_desde: number;
  fila_hasta: number;
  id_tipo_asiento: number;
  nombre: string;
  tarifa_extra: number;
}

// GET /api/tramos-programados/:id/asientos
export interface MapaAsientos {
  id: number;
  placa: string;
  tipo_bus: string;
  filas: number;
  asientos_por_fila: number;
  columnas: string[];
  pasillo_despues_de: number;
  rangos: RangoAsiento[];
  ocupados: string[];        // códigos "12A" con pasaje vigente
  libres: number;
}

export interface PasajeroForm {
  nombres: string;
  apellidos: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
}

// Respuesta de GET /api/viajes/:id y /api/viajes/mios
export interface ViajeTramo {
  posicion: number;
  id_tramo_programado: number;
  origen: string;
  destino: string;
  salida_estimada: string;   // UTC
  llegada_estimada: string;
  empresa: string;
  placa: string;
}
export interface ViajePasaje {
  id_pasajero: number;
  id_tramo_programado: number;
  codigo_asiento: string;
  precio: number;
  vigente: boolean;
  tipo_asiento: string;
}
export interface ViajePasajero {
  id: number;
  nombres: string;
  apellidos: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  asientos: ViajePasaje[];
}
export interface ViajeReserva {
  id: number;
  estado: EstadoViaje;
  creado_en: string;
  vence_en: string;
  cancelado_en: string | null;
  total: number;
  tramos: ViajeTramo[];
  pasajeros: ViajePasajero[];
}

// "Código de reserva" que ve el viajero (el id numérico con formato)
export const codigoReserva = (id: number) => `RB-${String(id).padStart(6, '0')}`;
export const soles = (n: number) => `S/ ${n.toFixed(2)}`;
// Los terminales de la BD de prueba están en Perú (UTC-5)
export const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'medium', timeStyle: 'short' });

export const mensajeError = (e: unknown, porDefecto = 'Ocurrió un error. Intenta de nuevo.') =>
  (axios.isAxiosError(e) && (e.response?.data as { error?: string } | undefined)?.error) || porDefecto;

// Hora corta local (Lima) a partir de un ISO UTC
export const horaCorta = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false });
export const diaCorto = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { timeZone: 'America/Lima', weekday: 'short', day: 'numeric', month: 'short' });
