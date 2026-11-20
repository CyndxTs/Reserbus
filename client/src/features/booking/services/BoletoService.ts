import { pendiente } from '../../../lib/todo';

// TODO(server): envío del boleto por correo (la app avisa por correo, no hay pasarela de pago).
export const enviarBoletoPorCorreo = (idViaje: number) =>
  pendiente(`POST /api/viajes/${idViaje}/boleto/correo (enviar el boleto al correo del viajero)`);

// TODO(server): boleto descargable en PDF.
export const descargarBoleto = (idViaje: number) =>
  pendiente(`GET /api/viajes/${idViaje}/boleto.pdf (descargar el boleto)`);
