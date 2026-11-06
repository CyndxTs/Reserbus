import { Viajero, Administrador, Empresa } from '../ClientContext';
type Client = Viajero | Administrador | Empresa | null;
export interface SignInValues {
    email: string;
    password: string;
}
export interface SignUpValues {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}
export function formattedClientName(client: Client): string {
  if (!client) return '';
  if ('nombres' in client) {
    const nombre = (client.nombres || '').trim().split(' ')[0];
    const apellido = (client.apellidos || '').trim().split(' ')[0];
    // Cuentas de Google pueden venir sin apellido: no mostramos "undefined."
    if (nombre && apellido) return `${nombre} ${apellido[0]}.`;
    if (nombre) return nombre;
    return client.correo_electronico.split('@')[0];
  }
  return '';
}
