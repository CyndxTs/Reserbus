// Imprime un access_token de Supabase para probar la API sin front.
// Uso: node scripts/token.js correo contrasenia
//   luego: curl -H "Authorization: Bearer <token>" http://localhost:3001/api/auth/me
require('dotenv').config();

(async () => {
  const [email, password] = process.argv.slice(2);
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  if (!r.ok) { console.error('Error:', j.msg || j.error_description || JSON.stringify(j)); process.exit(1); }
  console.log(j.access_token);
})();
