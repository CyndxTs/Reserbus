const express = require('express');
const router = express.Router();
const { Viajero } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { ErrorHttp, requerir } = require('../lib/errores');
const { crearUsuarioConPerfil } = require('../lib/supabase');

// El registro público (correo o Google) se hace en el front con supabase-js y luego se llama a
// POST /api/auth/registro, que crea la fila de "viajero". No hay /signup ni /signin aquí.

router.get('/me', requireAuth, requireRol('VIAJERO'), (req, res) => res.json(req.auth.perfil));

router.put('/me', requireAuth, requireRol('VIAJERO'), async (req, res) => {
  const { nombres, apellidos } = req.body;
  await req.auth.perfil.update({ ...(nombres !== undefined && { nombres }), ...(apellidos !== undefined && { apellidos }) });
  res.json(req.auth.perfil);
});

router.get('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  res.json(await Viajero.findAll({ order: [['id', 'ASC']] }));
});

// ADMIN: crear viajero (Auth + perfil)
router.post('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  requerir(req.body, ['correo_electronico', 'contrasenia', 'nombres', 'apellidos']);
  const { correo_electronico, contrasenia, nombres, apellidos } = req.body;
  const viajero = await crearUsuarioConPerfil(
    { correo: correo_electronico, contrasenia, metadata: { nombres, apellidos } },
    (authId) => Viajero.create({ auth_id: authId, nombres, apellidos })
  );
  res.status(201).json(viajero);
});

module.exports = router;
