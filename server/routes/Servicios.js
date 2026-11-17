const express = require('express');
const router = express.Router();
const { Servicio } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { requerir } = require('../lib/errores');

router.get('/', async (req, res) => res.json(await Servicio.findAll({ order: [['nombre', 'ASC']] })));
router.post('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  requerir(req.body, ['nombre']);
  res.status(201).json(await Servicio.create({ nombre: req.body.nombre }));
});

module.exports = router;
