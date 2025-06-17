const express = require('express');
const router = express.Router();
const { Piso } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const piso = await Piso.findAll();
    res.json(piso);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const piso = req.body;
    await Piso.create(piso);
    res.json(piso);
});

module.exports = router;