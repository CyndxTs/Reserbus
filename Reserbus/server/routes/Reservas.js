const express = require('express');
const router = express.Router();
const { Reserva } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const reservas = await Reserva.findAll();
    res.json(reservas);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const reserva = req.body;
    await Reserva.create(reserva);
    res.json(reserva);
});

module.exports = router;