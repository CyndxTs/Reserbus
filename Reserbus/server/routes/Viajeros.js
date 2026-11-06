const express = require('express');
const router = express.Router();
const { Viajero } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { crearUsuarioAuth, borrarUsuarioAuth, statusDeError } = require('../lib/supabase');

// El registro público (correo/contraseña o Google) se hace en el front con
// supabase-js; el trigger de la BD crea la fila en "viajero". No hay /signup ni /signin.

// Perfil propio
router.get('/me', requireAuth, requireRol('VIAJERO'), async (req, res) => {
  const viajero = await Viajero.findOne({ where: { id_auth: req.auth.id } });
  if (!viajero) return res.status(404).json({ error: 'Perfil no encontrado.' });
  res.json(viajero);
});

router.put('/me', requireAuth, requireRol('VIAJERO'), async (req, res) => {
  try {
    const viajero = await Viajero.findOne({ where: { id_auth: req.auth.id } });
    if (!viajero) return res.status(404).json({ error: 'Perfil no encontrado.' });
    const { nombres, apellidos, telefono, fecha_nacimiento } = req.body;
    const cambios = {};
    if (nombres !== undefined) cambios.nombres = nombres;
    if (apellidos !== undefined) cambios.apellidos = apellidos;
    if (telefono !== undefined) cambios.telefono = telefono;
    if (fecha_nacimiento !== undefined) cambios.fecha_nacimiento = fecha_nacimiento;
    await viajero.update(cambios);
    res.json(viajero);
  } catch (err) {
    res.status(statusDeError(err)).json({ error: `Error al actualizar perfil.\n${err.message}` });
  }
});

// Solo ADMIN: listar
router.get('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  try {
    res.json(await Viajero.findAll());
  } catch (err) {
    res.status(500).json({ error: `Error al obtener viajeros.\n${err.message}` });
  }
});

// Solo ADMIN: crear viajero
router.post('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  const { correo_electronico, contrasenia, nombres, apellidos, telefono, fecha_nacimiento } = req.body;
  let idAuth;
  try {
    idAuth = await crearUsuarioAuth({
      correo: correo_electronico,
      contrasenia,
      metadata: { nombres, apellidos },
    });
    // La fila de viajero ya la creó el trigger; completamos datos opcionales
    const viajero = await Viajero.findOne({ where: { id_auth: idAuth } });
    const extras = {};
    if (telefono !== undefined) extras.telefono = telefono;
    if (fecha_nacimiento !== undefined) extras.fecha_nacimiento = fecha_nacimiento;
    if (Object.keys(extras).length) await viajero.update(extras);
    res.status(201).json(viajero);
  } catch (err) {
    if (idAuth) await borrarUsuarioAuth(idAuth);
    res.status(statusDeError(err)).json({ error: `Error al crear viajero.\n${err.message}` });
  }
});

module.exports = router;
