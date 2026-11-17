const express = require('express');
const router = express.Router();
const { TipoAsiento } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { requerir, propio } = require('../lib/errores');

// Tipos de asiento de MI empresa (ej. "Cama" con tarifa_extra)
router.use(requireAuth, requireRol('EMPRESA'));

router.get('/', async (req, res) => {
  res.json(await TipoAsiento.findAll({ where: { id_empresa: req.auth.id_empresa }, order: [['id', 'ASC']] }));
});

router.post('/', async (req, res) => {
  requerir(req.body, ['nombre']);
  const { nombre, tarifa_extra } = req.body;
  res.status(201).json(await TipoAsiento.create({ id_empresa: req.auth.id_empresa, nombre, tarifa_extra }));
});

router.put('/:id', async (req, res) => {
  const ta = await propio(TipoAsiento, req.params.id, req.auth.id_empresa);
  const { nombre, tarifa_extra } = req.body;
  await ta.update({ ...(nombre !== undefined && { nombre }), ...(tarifa_extra !== undefined && { tarifa_extra }) });
  res.json(ta);
});

module.exports = router;
