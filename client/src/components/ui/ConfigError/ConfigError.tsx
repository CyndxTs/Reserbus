// Se muestra cuando faltan variables de entorno del front.
const ConfigError = () => (
  <main className="mx-auto mt-16 max-w-[640px] rounded-2xl border border-red-200 bg-red-50 p-8 text-left">
    <h1 className="mb-3 text-2xl font-bold text-red-700">Falta configurar el entorno</h1>
    <p className="mb-4 text-[#444]">
      No se encontraron las variables de Supabase. Crea el archivo <code className="font-code">client/.env.local</code> con:
    </p>
    <pre className="overflow-x-auto rounded-lg bg-white p-4 font-code text-sm text-[#222]">
{`VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# Solo en producción (URL de la API en Vercel):
# VITE_API_URL=https://tu-api.vercel.app`}
    </pre>
    <p className="mt-4 text-[#444]">Luego reinicia <code className="font-code">npm run dev</code> (Vite solo lee el archivo al arrancar).</p>
  </main>
);

export default ConfigError;
