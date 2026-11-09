import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Si faltan las variables (.env.local) NO se debe romper todo el front (pantalla en blanco):
// main.tsx revisa esta bandera y muestra un aviso claro.
export const supabaseConfigurado = Boolean(url && key);

// La publishable key es pública (va al navegador); la seguridad real está en el server y en RLS.
// Los valores de respaldo solo evitan que createClient lance excepción al importar el módulo.
export const supabase = createClient(url || 'http://localhost:54321', key || 'sin-configurar', {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
