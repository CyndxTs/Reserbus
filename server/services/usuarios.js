const { Trabajador, Administrador } = require('../models');
const { crearUsuarioConPerfil } = require('../lib/supabase');
const { requerir } = require('../lib/errores');

// Crea la cuenta en Supabase Auth y luego el perfil de trabajador de una empresa
async function crearTrabajador(idEmpresa, body) {
  requerir(body, ['correo_electronico', 'contrasenia', 'tipo', 'nombres', 'apellidos']);
  return crearUsuarioConPerfil(
    { correo: body.correo_electronico, contrasenia: body.contrasenia },
    (authId) => Trabajador.create({
      auth_id: authId, id_empresa: idEmpresa, tipo: body.tipo, nombres: body.nombres, apellidos: body.apellidos,
    })
  );
}

async function crearAdministrador(body) {
  requerir(body, ['correo_electronico', 'contrasenia', 'nombres', 'apellidos']);
  return crearUsuarioConPerfil(
    { correo: body.correo_electronico, contrasenia: body.contrasenia },
    (authId) => Administrador.create({ auth_id: authId, nombres: body.nombres, apellidos: body.apellidos })
  );
}

module.exports = { crearTrabajador, crearAdministrador };
