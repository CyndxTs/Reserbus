const express = require('express');
const router = express.Router();
const { Pasajero } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const pasajero = await Pasajero.findAll();
    res.json(pasajero);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const pasajero = req.body;
    await Pasajero.create(pasajero);
    res.json(pasajero);
});

module.exports = router;