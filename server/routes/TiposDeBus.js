const express = require('express');
const router = express.Router();
const { sequelize, TipoBus, TipoBusTipoAsiento, TipoAsiento } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { ErrorHttp, requerir, propio } = require('../lib/errores');
const { validarRangos } = require('../services/asientos');

// Tipos de bus de MI empresa: bus de 1 piso, pasillo al medio, mitad de asientos a cada lado.
router.use(requireAuth, requireRol('EMPRESA'));

const conRangos = { include: [{ model: TipoBusTipoAsiento, as: 'rangos', include: [{ model: TipoAsiento }] }],
                    order: [['id', 'ASC'], [{ model: TipoBusTipoAsiento, as: 'rangos' }, 'fila_desde', 'ASC']] };

router.get('/', async (req, res) => {
  res.json(await TipoBus.findAll({ where: { id_empresa: req.auth.id_empresa }, ...conRangos }));
});

router.get('/:id', async (req, res) => {
  res.json(await propio(TipoBus, req.params.id, req.auth.id_empresa, conRangos));
});

// { nombre, filas, asientos_por_fila, rangos: [{ fila_desde, fila_hasta, id_tipo_asiento }] }
// Los rangos deben cubrir las filas 1..filas sin huecos ni solapes (lo valida la app).
router.post('/', async (req, res) => {
  requerir(req.body, ['nombre', 'filas', 'asientos_por_fila']);
  const { nombre, filas, asientos_por_fila, rangos } = req.body;
  if (!Number.isInteger(filas) || filas < 1) throw new ErrorHttp(400, 'filas debe ser un entero positivo.');
  if (!Number.isInteger(asientos_por_fila) || asientos_por_fila < 2 || asientos_por_fila % 2) {
    throw new ErrorHttp(400, 'asientos_por_fila debe ser par (mitad a cada lado del pasillo).');
  }
  const orden = validarRangos(rangos, filas);
  const id_empresa = req.auth.id_empresa;
  const id = await sequelize.transaction(async (transaction) => {
    const tb = await TipoBus.create({ id_empresa, nombre, filas, asientos_por_fila }, { transaction });
    await TipoBusTipoAsiento.bulkCreate(orden.map(r => ({
      id_tipo_bus: tb.id, id_empresa, id_tipo_asiento: r.id_tipo_asiento, fila_desde: r.fila_desde, fila_hasta: r.fila_hasta,
    })), { transaction });
    return tb.id;
  });
  res.status(201).json(await TipoBus.findByPk(id, conRangos));
});

// Reemplaza los rangos de filas de un tipo de bus
router.put('/:id/rangos', async (req, res) => {
  const tb = await propio(TipoBus, req.params.id, req.auth.id_empresa);
  const orden = validarRangos(req.body.rangos, tb.filas);
  await sequelize.transaction(async (transaction) => {
    await TipoBusTipoAsiento.destroy({ where: { id_tipo_bus: tb.id }, transaction });
    await TipoBusTipoAsiento.bulkCreate(orden.map(r => ({
      id_tipo_bus: tb.id, id_empresa: tb.id_empresa, id_tipo_asiento: r.id_tipo_asiento, fila_desde: r.fila_desde, fila_hasta: r.fila_hasta,
    })), { transaction });
  });
  res.json(await TipoBus.findByPk(tb.id, conRangos));
});

module.exports = router;
