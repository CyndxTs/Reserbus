const { createRemoteJWKSet, jwtVerify } = require('jose');

// Valida el token de Supabase localmente con las llaves públicas (JWKS).
const JWKS = createRemoteJWKSet(new URL(process.env.SUPABASE_JWKS_URL));

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autenticado.' });

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    });
    req.auth = {
      id: payload.sub,                                  // = id_auth en las tablas
      email: payload.email,
      rol: payload.app_metadata?.rol || 'VIAJERO',      // app_metadata solo lo escribe el server
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

const requireRol = (...roles) => (req, res, next) =>
  roles.includes(req.auth?.rol)
    ? next()
    : res.status(403).json({ error: 'No tienes permisos para esta acción.' });

module.exports = { requireAuth, requireRol };
