import { Viajero, Administrador, Empresa } from '../context/ClientContext';
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
  if ('nombres' in client && 'apellidos' in client) {
    const nombre = client.nombres.split(' ')[0];
    const apellido = client.apellidos.split(' ')[0];
    return `${nombre} ${apellido[0]}.`;
  }
  return '';
}
