const express = require('express');
const router = express.Router();
const { Terminal } = require('../models')
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const terminales = await Terminal.findAll();
    res.json(terminales);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const terminal = req.body;
    await Terminal.create(terminal);
    res.json(terminal);
});

module.exports = router;