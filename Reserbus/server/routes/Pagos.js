const express = require('express');
const router = express.Router();
const { Pago } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const pagos = await Pago.findAll();
    res.json(pagos);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const pago = req.body;
    await Pago.create(pago);
    res.json(pago);
});

module.exports = router;