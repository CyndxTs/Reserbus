import axios from 'axios';
import { pendiente } from '../../../lib/todo';
import { Itinerario, Orden, Servicio } from '../utils/BuscarViajeUtil';

export interface ParametrosBusqueda {
  origen: string | number;
  destino: string | number;
  fecha: string;            // YYYY-MM-DD (día local del terminal de origen)
  pasajeros: number;
  orden?: Orden;
}

// GET /api/busqueda
export async function buscar(p: ParametrosBusqueda): Promise<Itinerario[]> {
  const { data } = await axios.get<{ total: number; resultados: Itinerario[] }>('/api/busqueda', {
    params: { origen: p.origen, destino: p.destino, fecha: p.fecha, pasajeros: p.pasajeros, orden: p.orden },
  });
  return data.resultados;
}

// GET /api/servicios
export async function listarServicios(): Promise<Servicio[]> {
  const { data } = await axios.get<Servicio[]>('/api/servicios');
  return data;
}

// TODO(server): /api/busqueda no recibe ni devuelve los servicios del bus (wifi, baño, etc.).
export const filtrarPorServicios = (_servicios: string[]) =>
  pendiente('filtrar resultados por servicios del bus (falta soporte en GET /api/busqueda)');
