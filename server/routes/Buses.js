const express = require('express');
const router = express.Router();
const { Bus, TipoBus, Servicio } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { requerir, propio } = require('../lib/errores');

// Buses físicos de MI empresa
router.use(requireAuth, requireRol('EMPRESA'));

const completo = { include: [{ model: TipoBus }, { model: Servicio, as: 'servicios', through: { attributes: [] } }] };

router.get('/', async (req, res) => {
  res.json(await Bus.findAll({ where: { id_empresa: req.auth.id_empresa }, ...completo, order: [['id', 'ASC']] }));
});

// { placa, id_tipo_bus, servicios: [id_servicio, ...] }
router.post('/', async (req, res) => {
  requerir(req.body, ['placa', 'id_tipo_bus']);
  const { placa, id_tipo_bus, servicios } = req.body;
  const bus = await Bus.create({ id_empresa: req.auth.id_empresa, id_tipo_bus, placa });
  if (Array.isArray(servicios) && servicios.length) await bus.setServicios(servicios);
  res.status(201).json(await Bus.findByPk(bus.id, completo));
});

router.put('/:id', async (req, res) => {
  const bus = await propio(Bus, req.params.id, req.auth.id_empresa);
  const { placa, id_tipo_bus, activo, servicios } = req.body;
  await bus.update({
    ...(placa !== undefined && { placa }), ...(id_tipo_bus !== undefined && { id_tipo_bus }), ...(activo !== undefined && { activo }),
  });
  if (Array.isArray(servicios)) await bus.setServicios(servicios);
  res.json(await Bus.findByPk(bus.id, completo));
});

// Baja lógica (se conserva el historial)
router.delete('/:id', async (req, res) => {
  const bus = await propio(Bus, req.params.id, req.auth.id_empresa);
  await bus.update({ activo: false });
  res.json({ mensaje: 'Bus dado de baja.' });
});

module.exports = router;
