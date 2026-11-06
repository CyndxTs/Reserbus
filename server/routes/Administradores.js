const express = require('express');
const router = express.Router();
const { Administrador } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { crearUsuarioAuth, borrarUsuarioAuth, statusDeError } = require('../lib/supabase');

// Solo ADMIN: listar
router.get('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  try {
    res.json(await Administrador.findAll());
  } catch (err) {
    res.status(500).json({ error: `Error al obtener administradores.\n${err.message}` });
  }
});

// Solo ADMIN: crear otro administrador
router.post('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  const { correo_electronico, contrasenia, nombres, apellidos, fecha_nacimiento, foto_url } = req.body;
  let idAuth;
  try {
    idAuth = await crearUsuarioAuth({
      correo: correo_electronico,
      contrasenia,
      rol: 'ADMIN',
    });
    const administrador = await Administrador.create({
      id_auth: idAuth,
      correo_electronico,
      nombres,
      apellidos,
      fecha_nacimiento,
      foto_url,
    });
    res.status(201).json(administrador);
  } catch (err) {
    if (idAuth) await borrarUsuarioAuth(idAuth);
    res.status(statusDeError(err)).json({ error: `Error al crear administrador.\n${err.message}` });
  }
});

module.exports = router;
