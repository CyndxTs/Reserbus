const express = require('express');
const router = express.Router();
const { Empresa, Bus, TipoBus, Servicio } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { ErrorHttp, requerir } = require('../lib/errores');
const { crearTrabajador } = require('../services/usuarios');

// Público: buses activos de una empresa
router.get('/:id/buses', async (req, res) => {
  res.json(await Bus.findAll({
    where: { id_empresa: req.params.id, activo: true },
    include: [{ model: TipoBus }, { model: Servicio, as: 'servicios', through: { attributes: [] } }],
  }));
});

// Solo ADMIN (sysadmin de la plataforma)
router.get('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  res.json(await Empresa.findAll({ order: [['id', 'ASC']] }));
});

router.post('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  requerir(req.body, ['nombre']);
  res.status(201).json(await Empresa.create({ nombre: req.body.nombre }));
});

// Activar/desactivar sin borrar: { activa: false }
router.patch('/:id', requireAuth, requireRol('ADMIN'), async (req, res) => {
  const empresa = await Empresa.findByPk(req.params.id);
  if (!empresa) throw new ErrorHttp(404, 'Empresa no encontrada.');
  const { nombre, activa } = req.body;
  await empresa.update({ ...(nombre !== undefined && { nombre }), ...(activa !== undefined && { activa }) });
  res.json(empresa);
});

// Crea el primer trabajador (normalmente ADMINISTRATIVO) de una empresa
router.post('/:id/trabajadores', requireAuth, requireRol('ADMIN'), async (req, res) => {
  res.status(201).json(await crearTrabajador(Number(req.params.id), req.body));
});

module.exports = router;
