const { createClient } = require('@supabase/supabase-js');

// Cliente con la SECRET key: salta RLS y puede administrar usuarios.
// Solo se usa en el server. Nunca exponerlo al front.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Crea un usuario en Supabase Auth ya confirmado. Devuelve su UUID (= auth_id de los perfiles).
// El rol YA NO va en app_metadata: se deduce de en qué tabla de perfil existe el auth_id.
async function crearUsuarioAuth({ correo, contrasenia, metadata }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: correo,
    password: contrasenia,
    email_confirm: true,
    user_metadata: metadata || {},
  });
  if (error) {
    const e = new Error(error.message);
    e.code = error.code;
    throw e;
  }
  return data.user.id;
}

async function borrarUsuarioAuth(authId) {
  try {
    await supabaseAdmin.auth.admin.deleteUser(authId);
  } catch (_) { /* best effort */ }
}

// Auth primero, perfil después (hay FK a auth.users). Si el perfil falla, se borra el usuario de Auth.
async function crearUsuarioConPerfil({ correo, contrasenia, metadata }, crearPerfil) {
  const authId = await crearUsuarioAuth({ correo, contrasenia, metadata });
  try {
    return await crearPerfil(authId);
  } catch (err) {
    await borrarUsuarioAuth(authId);
    throw err;
  }
}

module.exports = { supabaseAdmin, crearUsuarioAuth, borrarUsuarioAuth, crearUsuarioConPerfil };
