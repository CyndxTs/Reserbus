const express = require('express');
const router = express.Router();
const { Bus, Servicio } = require('../models');

// TEST - SELECT ALL
router.get('/', async (req, res) => {
  try {
    const buses = await Bus.findAll({
      where: { id_empresa: req.params.id },
      include: [
        {
          model: Servicio,
          as: 'servicios'
        },
        {
          model: Piso,
          as: 'Pisos'
        }
      ]
    });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

// TEST - UPDATE
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { placa, marca, modelo, cantidad_pisos, servicios } = req.body;

  try {
    // 1. Actualizar el bus
    await Bus.update(
      { placa, marca, modelo, cantidad_pisos },
      { where: { id_bus: id } }
    );

    // 2. Obtener el bus y actualizar servicios
    const bus = await Bus.findByPk(id);
    if (bus) {
      await bus.setServicios(servicios || []);
      
      // 3. Obtener el bus con servicios para responder
      const busActualizado = await Bus.findByPk(id, {
        include: [{
          model: Servicio,
          as: 'servicios'
        }]
      });
      
      res.json(busActualizado);
    } else {
      res.status(404).json({ error: 'Bus no encontrado' });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Error al actualizar el bus' });
  }
});

// TEST - DELETE (logical delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Actualizar el estado de habilitación del bus
    const [updated] = await Bus.update(
      { esta_habilitado: false },
      { where: { id_bus: id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Bus no encontrado' });
    }

    res.json({ message: 'Bus deshabilitado correctamente' });
  } catch (error) {
    console.error("Error en DELETE /api/buses/:id:", error);
    res.status(500).json({ error: 'Error al eliminar el bus', detalle: error.message });
  }
});

module.exports = router;