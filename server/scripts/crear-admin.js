// Crea el PRIMER administrador (después los crea un admin desde la API).
// Uso (desde /server):
//   node scripts/crear-admin.js correo@dominio.com "ContraseñaLarga123" "Nombres" "Apellidos"
require('dotenv').config();
const db = require('../models');
const { crearUsuarioAuth, borrarUsuarioAuth } = require('../lib/supabase');

(async () => {
  const [correo, contrasenia, nombres, apellidos] = process.argv.slice(2);
  if (!correo || !contrasenia || !nombres || !apellidos) {
    console.error('Uso: node scripts/crear-admin.js correo contrasenia nombres apellidos');
    process.exit(1);
  }
  let idAuth;
  try {
    idAuth = await crearUsuarioAuth({ correo, contrasenia, rol: 'ADMIN' });
    await db.Administrador.create({
      id_auth: idAuth, correo_electronico: correo, nombres, apellidos,
    });
    console.log('Administrador creado:', correo);
    process.exit(0);
  } catch (err) {
    if (idAuth) await borrarUsuarioAuth(idAuth);
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
