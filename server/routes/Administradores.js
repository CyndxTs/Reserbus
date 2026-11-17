const express = require('express');
const router = express.Router();
const { Administrador } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { crearAdministrador } = require('../services/usuarios');

router.get('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  res.json(await Administrador.findAll({ order: [['id', 'ASC']] }));
});

// Crear otro sysadmin: { correo_electronico, contrasenia, nombres, apellidos }
router.post('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  res.status(201).json(await crearAdministrador(req.body));
});

module.exports = router;
