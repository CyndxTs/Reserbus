const express = require('express');
const router = express.Router();
const { Viaje } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const viajes = await Viaje.findAll();
    res.json(viajes);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const viaje = req.body;
    await Viaje.create(viaje);
    res.json(viaje);
});

module.exports = router;