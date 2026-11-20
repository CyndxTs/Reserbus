// Servicios del client cuyo endpoint aún no existe en el server.
// Devuelven un mensaje "To do" para que la UI lo muestre sin romperse.
export interface RespuestaPendiente {
  pendiente: true;
  mensaje: string;
}

export const esPendiente = (r: unknown): r is RespuestaPendiente =>
  typeof r === 'object' && r !== null && (r as RespuestaPendiente).pendiente === true;

export const pendiente = (que: string): Promise<RespuestaPendiente> =>
  Promise.resolve({ pendiente: true, mensaje: `To do: ${que}` });
