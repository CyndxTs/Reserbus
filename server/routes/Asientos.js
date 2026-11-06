const express = require('express');
const router = express.Router();
const { Asiento } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const asientos = await Asiento.findAll();
    res.json(asientos);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const asiento = req.body;
    await Asiento.create(asiento);
    res.json(asiento);
});

module.exports = router;