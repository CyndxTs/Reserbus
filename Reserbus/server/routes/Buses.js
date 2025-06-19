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

// TEST - UPDATE
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { placa, marca, modelo, cantidad_pisos, id_empresa, esta_habilitado, servicios } = req.body;

  try {
    // 1. Actualizar el bus
    const [updated] = await Bus.update(
      { placa, marca, modelo, cantidad_pisos, id_empresa, esta_habilitado },
      { where: { id_bus: id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Bus no encontrado' });
    }

    // 2. Actualizar servicios asociados
    const bus = await Bus.findByPk(id);
    if (Array.isArray(servicios) && servicios.length > 0) {
      await bus.setServicios(servicios);
    } else {
      await bus.setServicios([]); // Limpiar servicios si no se envían
    }

    // 3. Obtener bus actualizado con relaciones
    const busActualizado = await Bus.findByPk(id, {
      include: [{
        model: Servicio,
        as: 'servicios'
      }]
    });

    res.json(busActualizado);
  } catch (error) {
    console.error("Error en PUT /api/buses/:id:", error);
    res.status(500).json({ error: 'Error al actualizar el bus', detalle: error.message });
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