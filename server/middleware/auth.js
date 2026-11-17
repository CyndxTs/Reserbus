const { createRemoteJWKSet, jwtVerify } = require('jose');
const { resolverPerfil } = require('../services/perfiles');

// Valida el token de Supabase localmente con las llaves públicas (JWKS).
const JWKS = createRemoteJWKSet(new URL(process.env.SUPABASE_JWKS_URL));

async function leerToken(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    });
    return { id: payload.sub, email: payload.email, metadata: payload.user_metadata || {} };
  } catch (_) {
    return null;
  }
}

// Solo valida el token (sirve para /auth/registro, cuando el perfil aún no existe)
async function verificarToken(req, res, next) {
  const t = await leerToken(req);
  if (!t) return res.status(401).json({ error: 'No autenticado o token inválido.' });
  req.token = t;
  next();
}

// Token + perfil. Deja req.auth = { id, email, rol, perfil, id_empresa }
async function requireAuth(req, res, next) {
  const t = await leerToken(req);
  if (!t) return res.status(401).json({ error: 'No autenticado o token inválido.' });
  const r = await resolverPerfil(t.id);
  if (!r) return res.status(403).json({ error: 'La cuenta no tiene perfil. Llama a POST /api/auth/registro.', codigo: 'SIN_PERFIL' });
  if (r.habilitado === false) return res.status(403).json({ error: 'Cuenta deshabilitada.' });
  req.token = t;
  req.auth = { id: t.id, email: t.email, rol: r.rol, perfil: r.perfil, id_empresa: r.id_empresa };
  next();
}

const requireRol = (...roles) => (req, res, next) =>
  roles.includes(req.auth?.rol)
    ? next()
    : res.status(403).json({ error: 'No tienes permisos para esta acción.' });

module.exports = { verificarToken, requireAuth, requireRol };
