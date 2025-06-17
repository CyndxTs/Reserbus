const express = require('express');
const router = express.Router();
const { Viajero } = require('../models')
const bcrypt = require('bcrypt');
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const viajeros = await Viajero.findAll();
    res.json(viajeros);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const viajero = req.body;
    const hashedPassword = await bcrypt.hash(viajero.contrasenia, 10);
    viajero.contrasenia = hashedPassword;
    await Viajero.create(viajero);
    res.json(viajero);
});
// SIGNUP
router.post('/signup', async (req, res) => {
  const { correo_electronico, contrasenia, nombres, apellidos } = req.body;
  try {
    const existente = await Viajero.findOne({ where: { correo_electronico } });
    if (existente) return res.status(409).json({ error: 'Valor ya registrado.' });
    const hashedPassword = await bcrypt.hash(contrasenia, 10);
    const nuevoViajero = await Viajero.create({
      correo_electronico,
      contrasenia: hashedPassword,
      nombres,
      apellidos
    });
    const { contrasenia: _, ...viajeroSinPassword } = nuevoViajero.toJSON();
    res.status(201).json({ viajero: viajeroSinPassword });
  } catch (error) {
    res.status(500).json({ error: `Error interno en el servidor.\n${err.message}` });
  }
});
// SIGNIN
router.post('/signin', async (req, res) => {
  const { correo_electronico, contrasenia } = req.body;
  try {
    const viajero = await Viajero.findOne({ where: { correo_electronico } });
    if (!viajero) return res.status(401).json({ error: 'Datos inválidos' });
    const passwordMatch = await bcrypt.compare(contrasenia, viajero.contrasenia);
    if (!passwordMatch) return res.status(401).json({ error: 'Datos inváldos' });
    const { contrasenia: _, ...viajeroSinPassword } = viajero.toJSON();
    res.status(200).json({ viajero: viajeroSinPassword });
  } catch (err) {
    res.status(500).json({ error: `Error interno en el servidor.\n${err.message}` });
  }
});


module.exports = router;