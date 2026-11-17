const express = require('express');
const router = express.Router();
const { Viajero } = require('../models');
const { verificarToken, requireAuth } = require('../middleware/auth');
const { resolverPerfil, nombresDesdeToken } = require('../services/perfiles');

// Quién soy: el front lo llama después de login (correo o Google).
// Si responde 403 con codigo SIN_PERFIL, hay que llamar a POST /registro.
router.get('/me', requireAuth, (req, res) => {
  res.json({ rol: req.auth.rol, perfil: req.auth.perfil });
});

// Crea el perfil de VIAJERO de una cuenta recién registrada en Supabase Auth (correo o Google).
// Reemplaza al trigger de la BD vieja. Es idempotente: si ya tiene perfil, solo lo devuelve.
router.post('/registro', verificarToken, async (req, res) => {
  const existente = await resolverPerfil(req.token.id);
  if (existente) return res.json({ rol: existente.rol, perfil: existente.perfil, creado: false });
  const { nombres, apellidos } = req.body?.nombres
    ? { nombres: req.body.nombres, apellidos: req.body.apellidos || '' }
    : nombresDesdeToken(req.token.metadata, req.token.email);
  const perfil = await Viajero.create({ auth_id: req.token.id, nombres, apellidos });
  res.status(201).json({ rol: 'VIAJERO', perfil, creado: true });
});

module.exports = router;
