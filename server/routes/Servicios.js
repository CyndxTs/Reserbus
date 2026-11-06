const express = require('express');
const router = express.Router();
const { Servicio } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const servicios = await Servicio.findAll();
    res.json(servicios);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const servicio = req.body;
    await Servicio.create(servicio);
    res.json(servicio);
});

module.exports = router;