const { createClient } = require('@supabase/supabase-js');

// Cliente con la SECRET key: salta RLS y puede administrar usuarios.
// Solo se usa en el server. Nunca exponerlo al front.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Crea un usuario en Supabase Auth ya confirmado. Devuelve su UUID.
// rol: 'ADMIN' | 'EMPRESA' | undefined (viajero: lo crea el trigger de la BD)
async function crearUsuarioAuth({ correo, contrasenia, rol, metadata }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: correo,
    password: contrasenia,
    email_confirm: true,
    ...(rol ? { app_metadata: { rol } } : {}),
    user_metadata: metadata || {},
  });
  if (error) {
    const e = new Error(error.message);
    e.code = error.code;
    throw e;
  }
  return data.user.id;
}

async function borrarUsuarioAuth(idAuth) {
  try {
    await supabaseAdmin.auth.admin.deleteUser(idAuth);
  } catch (_) { /* best effort */ }
}

function statusDeError(err) {
  if (err.code === 'email_exists' || err.name === 'SequelizeUniqueConstraintError') return 409;
  if (err.name === 'SequelizeValidationError') return 400;
  return 500;
}

module.exports = { supabaseAdmin, crearUsuarioAuth, borrarUsuarioAuth, statusDeError };
