const express = require('express');
const router = express.Router();
const { Bus, Servicio } = require('../models');

// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const buses = await Bus.findAll();
    res.json(buses);
});
// TEST - INSERT
router.post('/', async (req, res) => {
  console.log("Cuerpo recibido del frontend:", req.body);

  const { placa, marca, modelo, cantidad_pisos, id_empresa, esta_habilitado, servicios } = req.body;

  try {
    // 1. Crear el bus
    const nuevoBus = await Bus.create({
      placa,
      marca,
      modelo,
      cantidad_pisos,
      id_empresa,
      esta_habilitado
    });

    // 2. Asociar servicios (si llegan)
    if (Array.isArray(servicios) && servicios.length > 0) {
      await nuevoBus.setServicios(servicios); 
    }

    // 3. Obtener bus con relaciones para responder
    const busCompleto = await Bus.findByPk(nuevoBus.id_bus, {
      include: [{
        model: Servicio,
        as: 'servicios'
      }]
    });

    res.status(201).json(busCompleto);
  } catch (error) {
    
    console.error("Error en POST /api/buses:", error);
    res.status(500).json({ error: 'Error al crear el bus', detalle: error.message });
  
  }
});

module.exports = router;