const express = require('express');
const router = express.Router();
const { TipoDeAsiento } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const tiposDeAsiento = await TipoDeAsiento.findAll();
    res.json(tiposDeAsiento);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const tipoDeAsiento = req.body;
    await TipoDeAsiento.create(tipoDeAsiento);
    res.json(tipoDeAsiento);
});

module.exports = router;