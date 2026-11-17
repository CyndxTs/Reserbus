// Crea el PRIMER administrador (sysadmin). Después los crea un admin desde la API.
// Uso (desde /server):
//   node scripts/crear-admin.js correo@dominio.com "ContraseñaLarga123" "Nombres" "Apellidos"
require('dotenv').config();
const { crearAdministrador } = require('../services/usuarios');

(async () => {
  const [correo_electronico, contrasenia, nombres, apellidos] = process.argv.slice(2);
  if (!correo_electronico || !contrasenia || !nombres || !apellidos) {
    console.error('Uso: node scripts/crear-admin.js correo contrasenia nombres apellidos');
    process.exit(1);
  }
  try {
    await crearAdministrador({ correo_electronico, contrasenia, nombres, apellidos });
    console.log('Administrador creado:', correo_electronico);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
