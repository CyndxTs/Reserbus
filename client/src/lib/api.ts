import axios from 'axios';
import { supabase } from './supabase';

// En desarrollo se deja vacío: las rutas "/api/..." pasan por el proxy de Vite hacia el server.
// En producción (Vercel) apunta a la URL del server desplegado.
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || '';

let configurado = false;

// Agrega "Authorization: Bearer <token>" a toda petición axios hacia NUESTRO server:
//  - rutas relativas ("/api/...")  -> mismo origen / proxy
//  - URLs absolutas que empiecen con API_URL
// Nunca se envía el token a otros dominios.
export function setupAxiosAuth() {
  if (configurado) return;
  configurado = true;

  if (API_URL) axios.defaults.baseURL = API_URL;

  axios.interceptors.request.use(async (config) => {
    const url = config.url || '';
    const esAbsoluta = /^https?:\/\//i.test(url);
    const haciaNuestraApi = !esAbsoluta || (!!API_URL && url.startsWith(API_URL));

    if (haciaNuestraApi && !config.headers.has('Authorization')) {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        config.headers.set('Authorization', `Bearer ${data.session.access_token}`);
      }
    }
    return config;
  });
}
