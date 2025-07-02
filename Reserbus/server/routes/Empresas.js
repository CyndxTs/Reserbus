const express = require('express');
const router = express.Router();
const { Empresa } = require('../models')
const bcrypt = require('bcrypt');
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const empresas = await Empresa.findAll();
    res.json(empresas);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const empresa = req.body;
    const hashedPassword = await bcrypt.hash(empresa.contrasenia, 10);
    empresa.contrasenia = hashedPassword;
    await Empresa.create(empresa);
    res.json(empresa);
});
// SIGNUP
router.post('/signup', async (req, res) => {
  const { correo_electronico, contrasenia, nombres, apellidos } = req.body;
  try {
    const existente = await Empresa.findOne({ where: { correo_electronico } });
    if (existente) return res.status(409).json({ error: 'Valor ya registrado.' });
    const hashedPassword = await bcrypt.hash(contrasenia, 10);
    const nuevaEmpresa = await Empresa.create({
      correo_electronico,
      contrasenia: hashedPassword,
      nombres,
      apellidos
    });
    const { contrasenia: _, ...EmpresaSinPassword } = nuevaEmpresa.toJSON();
    res.status(201).json({ empresa: EmpresaSinPassword });
  } catch (error) {
    res.status(500).json({ error: `Error interno en el servidor.\n${err.message}` });
  }
});
// SIGNIN
router.post('/signin', async (req, res) => {
  const { correo_electronico, contrasenia } = req.body;
  try {
    const empresa = await Empresa.findOne({ where: { correo_electronico } });
    if (!empresa) return res.status(401).json({ error: 'Datos inválidos' });
    const passwordMatch = await bcrypt.compare(contrasenia, empresa.contrasenia);
    if (!passwordMatch) return res.status(401).json({ error: 'Datos inváldos' });
    const { contrasenia: _, ...empresaSinPassword } = empresa.toJSON();
    res.status(200).json({ empresa: empresaSinPassword });
  } catch (err) {
    res.status(500).json({ error: `Error interno en el servidor.\n${err.message}` });
  }
});

module.exports = router;