const express = require('express');
const router = express.Router();
const { sequelize, Ruta, RutaTramo, Horario, Tramo, Terminal } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { ErrorHttp, requerir, propio } = require('../lib/errores');

// Rutas de MI empresa: secuencia ordenada de tramos (con duración) + horarios de salida (UTC)
router.use(requireAuth, requireRol('EMPRESA'));

const completa = {
  include: [
    { model: RutaTramo, as: 'tramos',
      include: [{ model: Tramo, include: [{ model: Terminal, as: 'origen' }, { model: Terminal, as: 'destino' }] }] },
    { model: Horario, as: 'horarios' },
  ],
  order: [['id', 'ASC'], [{ model: RutaTramo, as: 'tramos' }, 'posicion', 'ASC']],
};

router.get('/', async (req, res) => {
  res.json(await Ruta.findAll({ where: { id_empresa: req.auth.id_empresa }, ...completa }));
});

router.get('/:id', async (req, res) => {
  res.json(await propio(Ruta, req.params.id, req.auth.id_empresa, completa));
});

// { nombre, tramos: [{ id_tramo, duracion_min }, ...] }  (el orden del arreglo es la posición)
router.post('/', async (req, res) => {
  requerir(req.body, ['nombre', 'tramos']);
  const { nombre, tramos } = req.body;
  if (!Array.isArray(tramos) || !tramos.length) throw new ErrorHttp(400, 'La ruta necesita al menos un tramo.');
  const filas = await Tramo.findAll({ where: { id: tramos.map(t => t.id_tramo) } });
  const porId = new Map(filas.map(t => [t.id, t]));
  tramos.forEach((t, i) => {
    const tr = porId.get(t.id_tramo);
    if (!tr) throw new ErrorHttp(404, `El tramo ${t.id_tramo} no existe.`);
    if (!Number.isInteger(t.duracion_min) || t.duracion_min <= 0) throw new ErrorHttp(400, `Tramo ${i + 1}: duracion_min debe ser un entero positivo.`);
    if (i > 0 && porId.get(tramos[i - 1].id_tramo).id_terminal_destino !== tr.id_terminal_origen) {
      throw new ErrorHttp(400, `El destino del tramo ${i} no es el origen del tramo ${i + 1}.`);   // la BD no lo valida
    }
  });
  if (new Set(tramos.map(t => t.id_tramo)).size !== tramos.length) throw new ErrorHttp(400, 'Un tramo no puede repetirse en la misma ruta.');
  const id = await sequelize.transaction(async (transaction) => {
    const ruta = await Ruta.create({ id_empresa: req.auth.id_empresa, nombre }, { transaction });
    await RutaTramo.bulkCreate(tramos.map((t, i) => ({
      id_ruta: ruta.id, id_tramo: t.id_tramo, posicion: i + 1, duracion_min: t.duracion_min,
    })), { transaction });
    return ruta.id;
  });
  res.status(201).json(await Ruta.findByPk(id, completa));
});

// Hora de salida del primer tramo, en UTC: { hora_salida: "23:00" }
router.post('/:id/horarios', async (req, res) => {
  const ruta = await propio(Ruta, req.params.id, req.auth.id_empresa);
  requerir(req.body, ['hora_salida']);
  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(req.body.hora_salida)) throw new ErrorHttp(400, 'hora_salida debe ser HH:MM (UTC).');
  res.status(201).json(await Horario.create({ id_ruta: ruta.id, hora_salida: req.body.hora_salida }));
});

module.exports = router;
