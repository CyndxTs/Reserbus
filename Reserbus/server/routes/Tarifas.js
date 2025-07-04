const express = require('express');
const router = express.Router();
const { Tarifa } = require('../models')
// TEST - SELECT ALL
// GET - Listar todas las tarifas con info de viaje y tipo de asiento
router.get('/', async (req, res) => {
  console.log("GET /api/tarifas called");
  try {
    const tarifas = await Tarifa.findAll({
      where: { esta_habilitado: true },
      include: [
        {
          model: Viaje,
            attributes: [
            'id_viaje',
            'estado',
            'instante_abordaje',
            'instante_partida',
            'instante_llegada',
            'id_ruta',
            'id_bus',
            'id_empresa',
            'esta_habilitado'
            ] , 
             include: [
                    {
                    model: Ruta,
                    attributes: ['id_ruta', 'distancia_de_recorrido'],
                    include: [
                        {
                        model: Terminal,
                        as: 'terminalOrigen',
                        attributes: ['nombre']
                        },
                        {
                        model: Terminal,
                        as: 'terminalDestino',
                        attributes: ['nombre']
                        }
                    ]
                    }
                ]
        },
        {
          model: TipoDeAsiento,
          attributes: ['id_tipo_de_asiento', 'nombre', 'descripcion']
        }
      ]
    });
    console.log('Tarifas encontradas:', tarifas); // <--- Agrega esto
    res.json(tarifas);
  } catch (error) {
    console.error('Error en GET /api/tarifas:', error); // <--- Asegúrate de tener esto
    res.status(500).json({ error: error.message });
  }
});
// POST - Crear tarifa
router.post('/', async (req, res) => {
  try {
    const { id_viaje, id_tipo_de_asiento, precio } = req.body;
    const tarifa = await Tarifa.create({
      id_viaje,
      id_tipo_de_asiento,
      precio,
      esta_habilitado: true
    });
    res.status(201).json(tarifa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar tarifa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_viaje, id_tipo_de_asiento, precio } = req.body;
    await Tarifa.update(
      { id_viaje, id_tipo_de_asiento, precio },
      { where: { id_tarifa: id } }
    );
    res.json({ message: 'Tarifa actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminado lógico
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Tarifa.update(
      { esta_habilitado: false },
      { where: { id_tarifa: id } }
    );
    res.json({ message: 'Tarifa eliminada lógicamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;