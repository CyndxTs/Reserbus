const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Empresa, Bus, Piso, Servicio } = require('../models');

// GET ALL BUSES BY EMPRESA
router.get('/:idEmpresa/buses', async (req, res) => {
  try {
    const buses = await Bus.findAll({
      where: { 
        id_empresa: req.params.idEmpresa,
        esta_habilitado: true  // Solo buses habilitados
      },
      include: [
        {
          model: Piso,
        },
        {
          model: Servicio,
          as: 'servicios',
          through: { attributes: [] } // para excluir los datos de la tabla intermedia
        }
      ]
    });
    res.json(buses);
  } catch (error) {
    console.error("Error al obtener buses por empresa:", error);
    res.status(500).json({ error: 'Error al obtener buses' });
  }
});

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