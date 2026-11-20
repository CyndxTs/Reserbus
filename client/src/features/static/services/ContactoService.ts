import { pendiente } from '../../../lib/todo';

export interface MensajeContacto { nombre: string; email: string; mensaje: string }

// TODO(server): POST /api/contacto
export const enviarMensaje = (_m: MensajeContacto) => pendiente('POST /api/contacto (enviar mensaje de contacto)');
