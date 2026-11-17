const express = require('express');
const router = express.Router();
const { Pais, Provincia, Terminal, Tramo } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { requerir } = require('../lib/errores');

// Montado en /api: /paises, /provincias, /terminales, /tramos. Lecturas públicas.
// Países y provincias los gestiona el ADMIN; terminales y tramos son GLOBALES (compartidos entre
// empresas para poder hacer conexiones), así que también los pueden crear las empresas.

router.get('/paises', async (req, res) => res.json(await Pais.findAll({ order: [['nombre', 'ASC']] })));
router.post('/paises', requireAuth, requireRol('ADMIN'), async (req, res) => {
  requerir(req.body, ['nombre', 'desfase_utc_min']);
  res.status(201).json(await Pais.create(req.body));
});

router.get('/provincias', async (req, res) => {
  const where = req.query.id_pais ? { id_pais: req.query.id_pais } : {};
  res.json(await Provincia.findAll({ where, order: [['nombre', 'ASC']] }));
});
router.post('/provincias', requireAuth, requireRol('ADMIN'), async (req, res) => {
  requerir(req.body, ['id_pais', 'nombre']);
  res.status(201).json(await Provincia.create(req.body));
});

// ?id_provincia= para "terminales de Arequipa"
router.get('/terminales', async (req, res) => {
  const where = req.query.id_provincia ? { id_provincia: req.query.id_provincia } : {};
  res.json(await Terminal.findAll({ where, include: [{ model: Provincia }], order: [['nombre', 'ASC']] }));
});
router.post('/terminales', requireAuth, requireRol('ADMIN', 'EMPRESA'), async (req, res) => {
  requerir(req.body, ['id_provincia', 'nombre', 'direccion']);
  res.status(201).json(await Terminal.create(req.body));
});

router.get('/tramos', async (req, res) => {
  const where = req.query.id_terminal_origen ? { id_terminal_origen: req.query.id_terminal_origen } : {};
  res.json(await Tramo.findAll({
    where,
    include: [{ model: Terminal, as: 'origen' }, { model: Terminal, as: 'destino' }],
    order: [['id', 'ASC']],
  }));
});
router.post('/tramos', requireAuth, requireRol('ADMIN', 'EMPRESA'), async (req, res) => {
  requerir(req.body, ['id_terminal_origen', 'id_terminal_destino']);
  res.status(201).json(await Tramo.create(req.body));
});

module.exports = router;
