const express = require('express');
const router = express.Router();
const { Tarifa } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const tarifas = await Tarifa.findAll();
    res.json(tarifas);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const tarifa = req.body;
    await Tarifa.create(tarifa);
    res.json(tarifa);
});

module.exports = router;