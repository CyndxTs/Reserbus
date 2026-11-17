const express = require('express');
const router = express.Router();
const { Tarifa, TipoBus } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { requerir, propio } = require('../lib/errores');
const { consultar } = require('../lib/sql');

// Precio base por TIPO DE BUS x TRAMO de MI empresa.
// Precio de un asiento = monto_base + tipo_asiento.tarifa_extra (se congela en pasaje.precio).
router.use(requireAuth, requireRol('EMPRESA'));

// ?id_tipo_bus= opcional
router.get('/', async (req, res) => {
  res.json(await consultar(
    `SELECT tar.id_tipo_bus, tb.nombre AS tipo_bus, tar.id_tramo, tor.nombre AS origen, tde.nombre AS destino,
            tar.monto_base::float8 AS monto_base
       FROM reserbus.tarifa tar
       JOIN reserbus.tipo_bus tb ON tb.id = tar.id_tipo_bus
       JOIN reserbus.tramo t ON t.id = tar.id_tramo
       JOIN reserbus.terminal tor ON tor.id = t.id_terminal_origen
       JOIN reserbus.terminal tde ON tde.id = t.id_terminal_destino
      WHERE tb.id_empresa = :empresa AND (CAST(:tb AS int) IS NULL OR tb.id = CAST(:tb AS int))
      ORDER BY tb.id, tar.id_tramo`,
    { empresa: req.auth.id_empresa, tb: req.query.id_tipo_bus || null }
  ));
});

// Crea o actualiza: { id_tipo_bus, id_tramo, monto_base }
// (tarifa no guarda id_empresa, por eso la app verifica que el tipo de bus sea de la empresa)
router.put('/', async (req, res) => {
  requerir(req.body, ['id_tipo_bus', 'id_tramo', 'monto_base']);
  const { id_tipo_bus, id_tramo, monto_base } = req.body;
  await propio(TipoBus, id_tipo_bus, req.auth.id_empresa);
  await Tarifa.upsert({ id_tipo_bus, id_tramo, monto_base });
  res.json(await Tarifa.findOne({ where: { id_tipo_bus, id_tramo } }));
});

router.delete('/:idTipoBus/:idTramo', async (req, res) => {
  await propio(TipoBus, req.params.idTipoBus, req.auth.id_empresa);
  await Tarifa.destroy({ where: { id_tipo_bus: req.params.idTipoBus, id_tramo: req.params.idTramo } });
  res.status(204).end();
});

module.exports = router;
