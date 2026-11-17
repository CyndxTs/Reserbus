const express = require('express');
const router = express.Router();
const { Trabajador } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { propio } = require('../lib/errores');
const { crearTrabajador } = require('../services/usuarios');

// Trabajadores de MI empresa (ADMINISTRATIVO)
router.use(requireAuth, requireRol('EMPRESA'));

router.get('/', async (req, res) => {
  res.json(await Trabajador.findAll({ where: { id_empresa: req.auth.id_empresa }, order: [['id', 'ASC']] }));
});

// { correo_electronico, contrasenia, tipo: 'CHOFER' | 'ADMINISTRATIVO', nombres, apellidos }
router.post('/', async (req, res) => {
  res.status(201).json(await crearTrabajador(req.auth.id_empresa, req.body));
});

// { activo: false } para dar de baja sin perder historial
router.patch('/:id', async (req, res) => {
  const t = await propio(Trabajador, req.params.id, req.auth.id_empresa);
  if (req.body.activo !== undefined) await t.update({ activo: req.body.activo });
  res.json(t);
});

module.exports = router;
