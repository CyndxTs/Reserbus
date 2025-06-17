const express = require('express');
const router = express.Router();
const { BusServicio } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const busesServicios = await BusServicio.findAll();
    res.json(busesServicios);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const busServicio = req.body;
    await BusServicio.create(busServicio);
    res.json(busServicio);
});

module.exports = router;