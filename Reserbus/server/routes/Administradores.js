const express = require('express');
const router = express.Router();
const { Administrador } = require('../models');
const bcrypt = require('bcrypt');

// Obtener todos los administradores
router.get('/', async (req, res) => {
  try {
    const administradores = await Administrador.findAll();
    res.json(administradores);
  } catch (err) {
    res.status(500).json({ error: `Error al obtener administradores.\n${err.message}` });
  }
});

// Crear nuevo administrador
router.post('/', async (req, res) => {
  try {
    const administrador = req.body;
    const hashedPassword = await bcrypt.hash(administrador.contrasenia, 10);
    administrador.contrasenia = hashedPassword;

    const nuevoAdministrador = await Administrador.create(administrador);
    const { contrasenia: _, ...adminSinPassword } = nuevoAdministrador.toJSON();

    res.status(201).json(adminSinPassword);
  } catch (err) {
    res.status(500).json({ error: `Error al crear administrador.\n${err.message}` });
  }
});

// Registro de administrador (signup)
router.post('/signup', async (req, res) => {
  const { correo_electronico, contrasenia, nombres, apellidos } = req.body;

  try {
    const existente = await Administrador.findOne({ where: { correo_electronico } });

    if (existente) {
      return res.status(409).json({ error: 'Correo ya registrado.' });
    }

    const hashedPassword = await bcrypt.hash(contrasenia, 10);
    const nuevoAdministrador = await Administrador.create({
      correo_electronico,
      contrasenia: hashedPassword,
      nombres,
      apellidos
    });

    const { contrasenia: _, ...administradorSinPassword } = nuevoAdministrador.toJSON();
    res.status(201).json({ administrador: administradorSinPassword });

  } catch (err) {
    res.status(500).json({ error: `Error interno en el servidor.\n${err.message}` });
  }
});

// Login de administrador (signin)
router.post('/signin', async (req, res) => {
  const { correo_electronico, contrasenia } = req.body;

  try {
    const administrador = await Administrador.findOne({ where: { correo_electronico } });

    if (!administrador) {
      return res.status(401).json({ error: 'Datos inválidos' });
    }

    const passwordMatch = await bcrypt.compare(contrasenia, administrador.contrasenia);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Datos inválidos' });
    }

    const { contrasenia: _, ...administradorSinPassword } = administrador.toJSON();
    res.status(200).json({ administrador: administradorSinPassword });

  } catch (err) {
    res.status(500).json({ error: `Error interno en el servidor.\n${err.message}` });
  }
});

module.exports = router;
