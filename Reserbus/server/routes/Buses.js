const express = require('express');
const router = express.Router();
const { Bus } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const buses = await Bus.findAll();
    res.json(buses);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const bus = req.body;
    await Bus.create(bus);
    res.json(bus);
});

module.exports = router;