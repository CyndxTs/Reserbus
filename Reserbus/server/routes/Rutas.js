const express = require('express');
const router = express.Router();
const { Ruta } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const rutas = await Ruta.findAll();
    res.json(rutas);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const ruta = req.body;
    await Ruta.create(ruta);
    res.json(ruta);
});

module.exports = router;