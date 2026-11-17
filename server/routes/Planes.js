const express = require('express');
const router = express.Router();
const { sequelize, Plan, PlanBus, PlanTrabajador, Ruta, Horario, Bus, Trabajador } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { requerir, propio } = require('../lib/errores');
const { generarTramosProgramados } = require('../services/generacion');

// Planes de MI empresa: ruta + horario + buses + choferes.
// La BD garantiza que ruta, horario, buses y choferes sean de la misma empresa.
router.use(requireAuth, requireRol('EMPRESA'));

const completo = {
  include: [
    { model: Ruta }, { model: Horario },
    { model: Bus, as: 'buses', through: { attributes: [] } },
    { model: Trabajador, as: 'choferes', through: { attributes: [] } },
  ],
  order: [['id', 'ASC']],
};

router.get('/', async (req, res) => {
  res.json(await Plan.findAll({ where: { id_empresa: req.auth.id_empresa }, ...completo }));
});

router.get('/:id', async (req, res) => {
  res.json(await propio(Plan, req.params.id, req.auth.id_empresa, completo));
});

// { id_ruta, id_horario, buses: [id_bus], choferes: [id_trabajador] }
router.post('/', async (req, res) => {
  requerir(req.body, ['id_ruta', 'id_horario']);
  const { id_ruta, id_horario, buses = [], choferes = [] } = req.body;
  const id_empresa = req.auth.id_empresa;
  const id = await sequelize.transaction(async (transaction) => {
    const plan = await Plan.create({ id_empresa, id_ruta, id_horario }, { transaction });
    await PlanBus.bulkCreate(buses.map(id_bus => ({ id_plan: plan.id, id_bus, id_empresa })), { transaction });
    await PlanTrabajador.bulkCreate(choferes.map(id_trabajador => ({ id_plan: plan.id, id_trabajador, id_empresa })), { transaction });
    return plan.id;
  });
  res.status(201).json(await Plan.findByPk(id, completo));
});

// { activo: true|false }: solo los activos generan tramos programados
router.patch('/:id', async (req, res) => {
  const plan = await propio(Plan, req.params.id, req.auth.id_empresa);
  if (req.body.activo !== undefined) await plan.update({ activo: req.body.activo });
  res.json(plan);
});

router.post('/:id/buses', async (req, res) => {
  const plan = await propio(Plan, req.params.id, req.auth.id_empresa);
  requerir(req.body, ['id_bus']);
  await PlanBus.create({ id_plan: plan.id, id_bus: req.body.id_bus, id_empresa: plan.id_empresa });
  res.status(201).json(await Plan.findByPk(plan.id, completo));
});

// (falla con 409 si el bus ya tiene tramos programados en el plan)
router.delete('/:id/buses/:idBus', async (req, res) => {
  const plan = await propio(Plan, req.params.id, req.auth.id_empresa);
  await PlanBus.destroy({ where: { id_plan: plan.id, id_bus: req.params.idBus } });
  res.status(204).end();
});

router.post('/:id/choferes', async (req, res) => {
  const plan = await propio(Plan, req.params.id, req.auth.id_empresa);
  requerir(req.body, ['id_trabajador']);
  await PlanTrabajador.create({ id_plan: plan.id, id_trabajador: req.body.id_trabajador, id_empresa: plan.id_empresa });
  res.status(201).json(await Plan.findByPk(plan.id, completo));
});

router.delete('/:id/choferes/:idTrabajador', async (req, res) => {
  const plan = await propio(Plan, req.params.id, req.auth.id_empresa);
  await PlanTrabajador.destroy({ where: { id_plan: plan.id, id_trabajador: req.params.idTrabajador } });
  res.status(204).end();
});

// Genera los tramos programados del plan para los próximos { dias } (90 por defecto)
router.post('/:id/generar', async (req, res) => {
  const plan = await propio(Plan, req.params.id, req.auth.id_empresa);
  const dias = Math.min(Math.max(Number(req.body?.dias) || 90, 1), 180);
  res.json(await generarTramosProgramados({ idPlan: plan.id, dias }));
});

module.exports = router;
