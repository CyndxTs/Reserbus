const express = require('express');
const router = express.Router();
const { Empresa, Bus, Piso, Servicio } = require('../models');
const { requireAuth, requireRol } = require('../middleware/auth');
const { crearUsuarioAuth, borrarUsuarioAuth, statusDeError } = require('../lib/supabase');

// GET ALL BUSES BY EMPRESA
// TODO: proteger con requireAuth + validar que :idEmpresa sea la empresa del token
router.get('/:idEmpresa/buses', async (req, res) => {
  try {
    const buses = await Bus.findAll({
      where: {
        id_empresa: req.params.idEmpresa,
        esta_habilitado: true
      },
      include: [
        { model: Piso },
        {
          model: Servicio,
          as: 'servicios',
          through: { attributes: [] }
        }
      ]
    });
    res.json(buses);
  } catch (error) {
    console.error('Error al obtener buses por empresa:', error);
    res.status(500).json({ error: 'Error al obtener buses' });
  }
});

// Solo ADMIN: listar
router.get('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  try {
    res.json(await Empresa.findAll());
  } catch (err) {
    res.status(500).json({ error: `Error al obtener empresas.\n${err.message}` });
  }
});

// Solo ADMIN: crear empresa (usuario en Supabase Auth + fila en empresa)
router.post('/', requireAuth, requireRol('ADMIN'), async (req, res) => {
  const { correo_electronico, contrasenia, razon_social, ruc, descripcion, logo_url } = req.body;
  let idAuth;
  try {
    idAuth = await crearUsuarioAuth({
      correo: correo_electronico,
      contrasenia,
      rol: 'EMPRESA',
    });
    const empresa = await Empresa.create({
      id_auth: idAuth,
      correo_electronico,
      razon_social,
      ruc,
      descripcion,
      logo_url,
    });
    res.status(201).json(empresa);
  } catch (err) {
    if (idAuth) await borrarUsuarioAuth(idAuth);
    res.status(statusDeError(err)).json({ error: `Error al crear empresa.\n${err.message}` });
  }
});

module.exports = router;
