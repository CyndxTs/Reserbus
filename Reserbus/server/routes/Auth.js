const express = require('express');
const router = express.Router();
const { Viajero, Empresa, Administrador } = require('../models');
const { requireAuth } = require('../middleware/auth');

// Quién soy: el front lo llama después de login (email o Google)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { id, rol } = req.auth;
    const Modelo = rol === 'ADMIN' ? Administrador : rol === 'EMPRESA' ? Empresa : Viajero;
    const perfil = await Modelo.findOne({ where: { id_auth: id } });
    if (!perfil || !perfil.esta_habilitado) {
      return res.status(403).json({ error: 'Cuenta no disponible.' });
    }
    res.json({ rol, perfil });
  } catch (err) {
    res.status(500).json({ error: `Error interno en el servidor.\n${err.message}` });
  }
});

module.exports = router;
