const { Administrador, Trabajador, Viajero, Empresa } = require('../models');

// Deduce el rol desde las tablas de perfil (auth_id es UNIQUE en cada una):
//   administrador -> ADMIN | trabajador ADMINISTRATIVO -> EMPRESA | trabajador CHOFER -> CHOFER | viajero -> VIAJERO
// Devuelve null si el usuario de Auth todavía no tiene perfil.
async function resolverPerfil(authId) {
  const [adm, trab, via] = await Promise.all([
    Administrador.findOne({ where: { auth_id: authId } }),
    Trabajador.findOne({ where: { auth_id: authId }, include: [{ model: Empresa }] }),
    Viajero.findOne({ where: { auth_id: authId } }),
  ]);
  if (adm) return { rol: 'ADMIN', perfil: adm };
  if (trab) {
    return {
      rol: trab.tipo === 'CHOFER' ? 'CHOFER' : 'EMPRESA',
      perfil: trab,
      id_empresa: trab.id_empresa,
      habilitado: trab.activo && trab.Empresa.activa,
    };
  }
  if (via) return { rol: 'VIAJERO', perfil: via };
  return null;
}

// Nombres para el perfil de viajero a partir de lo que trae el token (correo o Google)
function nombresDesdeToken(meta = {}, email = '') {
  if (meta.given_name || meta.family_name) return { nombres: meta.given_name || '', apellidos: meta.family_name || '' };
  const completo = (meta.full_name || meta.name || '').trim();
  if (completo) {
    const partes = completo.split(/\s+/);
    return { nombres: partes.slice(0, Math.ceil(partes.length / 2)).join(' '), apellidos: partes.slice(Math.ceil(partes.length / 2)).join(' ') };
  }
  return { nombres: email.split('@')[0], apellidos: '' };
}

module.exports = { resolverPerfil, nombresDesdeToken };
