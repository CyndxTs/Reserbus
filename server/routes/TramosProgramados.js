const express = require('express');
const router = express.Router();
const { TramoProgramado, Plan, PlanTrabajador } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { ErrorHttp } = require('../lib/errores');
const { consultar, expirarViajes } = require('../lib/sql');
const { mapaAsientos } = require('../services/asientos');

// Público: mapa del bus en ese tramo (forma, tipos por fila y asientos ocupados)
router.get('/:id/asientos', async (req, res) => {
  await expirarViajes();
  res.json(await mapaAsientos(req.params.id));
});

// EMPRESA: tramos programados de MI empresa. ?id_plan=  &fecha=YYYY-MM-DD (día UTC)
router.get('/', requireAuth, requireRol('EMPRESA'), async (req, res) => {
  res.json(await consultar(
    `SELECT tp.id, tp.id_plan, tp.id_bus, b.placa, tor.nombre AS origen, tde.nombre AS destino,
            tp.salida_estimada, tp.llegada_estimada, tp.salida_real, tp.llegada_real
       FROM reserbus.tramo_programado tp
       JOIN reserbus.plan p ON p.id = tp.id_plan
       JOIN reserbus.bus b ON b.id = tp.id_bus
       JOIN reserbus.tramo t ON t.id = tp.id_tramo
       JOIN reserbus.terminal tor ON tor.id = t.id_terminal_origen
       JOIN reserbus.terminal tde ON tde.id = t.id_terminal_destino
      WHERE p.id_empresa = :empresa
        AND (CAST(:plan AS int) IS NULL OR tp.id_plan = CAST(:plan AS int))
        AND (CAST(:fecha AS date) IS NULL OR CAST(tp.salida_estimada AT TIME ZONE 'UTC' AS date) = CAST(:fecha AS date))
      ORDER BY tp.salida_estimada, tp.id LIMIT 500`,
    { empresa: req.auth.id_empresa, plan: req.query.id_plan || null, fecha: req.query.fecha || null }
  ));
});

// Tiempos reales al operar: { salida_real, llegada_real } en ISO UTC, o "now".
// Lo puede hacer la empresa o un chofer asignado al plan.
router.patch('/:id/tiempos', requireAuth, requireRol('EMPRESA', 'CHOFER'), async (req, res) => {
  const tp = await TramoProgramado.findByPk(req.params.id);
  const plan = tp && await Plan.findByPk(tp.id_plan);
  if (!tp || plan.id_empresa !== req.auth.id_empresa) throw new ErrorHttp(404, 'Tramo programado no encontrado.');
  if (req.auth.rol === 'CHOFER') {
    const asignado = await PlanTrabajador.findOne({ where: { id_plan: tp.id_plan, id_trabajador: req.auth.perfil.id } });
    if (!asignado) throw new ErrorHttp(403, 'No estás asignado a este plan.');
  }
  const f = (v) => (v === 'now' ? new Date() : v);
  const cambios = {};
  if (req.body.salida_real !== undefined) cambios.salida_real = f(req.body.salida_real);
  if (req.body.llegada_real !== undefined) cambios.llegada_real = f(req.body.llegada_real);
  await tp.update(cambios);
  res.json(tp);
});

module.exports = router;
