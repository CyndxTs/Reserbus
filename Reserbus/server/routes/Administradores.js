const express = require('express');
const router = express.Router();
const { Administrador } = require('../models')
const bcrypt = require('bcrypt');
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const administradores = await Administrador.findAll();
    res.json(administradores);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const administrador = req.body;
    const hashedPassword = await bcrypt.hash(administrador.contrasenia, 10);
    administrador.contrasenia = hashedPassword;
    await Administrador.create(administrador);
    res.json(administrador);
});
// SIGNIN
router.post('/signin', async (req, res) => {
  const { correo_electronico, contrasenia } = req.body;
  try {
    const administrador = await Administrador.findOne({ where: { correo_electronico } });
    if (!administrador) return res.status(401).json({ error: 'Datos inválidos' });
    const passwordMatch = await bcrypt.compare(contrasenia, administrador.contrasenia);
    if (!passwordMatch) return res.status(401).json({ error: 'Datos inváldos' });
    const { contrasenia: _, ...administradorSinPassword } = administrador.toJSON();
    res.status(200).json({ administrador: administradorSinPassword });
  } catch (err) {
    res.status(500).json({ error: `Error interno en el servidor.\n${err.message}` });
  }
});

module.exports = router;