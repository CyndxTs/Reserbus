import axios from 'axios';
import { MapaAsientos, PasajeroForm, ViajeReserva } from '../utils/ReservaUtil';

export interface NuevoViaje {
  tramos_programados: number[];
  pasajeros: (PasajeroForm & { asientos: Record<string, string> })[];
}

// GET /api/tramos-programados/:id/asientos
export const mapaDeAsientos = async (idTramoProgramado: string | number) =>
  (await axios.get<MapaAsientos>(`/api/tramos-programados/${idTramoProgramado}/asientos`)).data;

// POST /api/viajes  (crea la reserva PENDIENTE con hold de 10 min)
export const crearViaje = async (v: NuevoViaje) => (await axios.post<{ id: number }>('/api/viajes', v)).data;

// GET /api/viajes/:id
export const obtenerViaje = async (id: string | number) => (await axios.get<ViajeReserva>(`/api/viajes/${id}`)).data;

// GET /api/viajes/mios
export const misViajes = async () => (await axios.get<ViajeReserva[]>('/api/viajes/mios')).data;

// POST /api/viajes/:id/confirmar
export const confirmarViaje = async (id: string | number) => { await axios.post(`/api/viajes/${id}/confirmar`); };

// POST /api/viajes/:id/cancelar
export const cancelarViaje = async (id: string | number) => { await axios.post(`/api/viajes/${id}/cancelar`); };
