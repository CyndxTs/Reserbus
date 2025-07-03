const express = require('express');
const router = express.Router();
const { Viaje, Ruta, Terminal, Empresa, Tarifa, Bus, Servicio, TipoDeAsiento, Piso, Asiento } = require('../models');
const { Op, Sequelize } = require('sequelize');
// TEST - SELECT ALL
router.get('/', async (req, res) => {
    const viajes = await Viaje.findAll();
    res.json(viajes);
});
// TEST - INSERT
router.post('/', async (req, res) => {
    const viaje = req.body;
    await Viaje.create(viaje);
    res.json(viaje);
});// buscar viajes según parámetros
router.get('/buscar', async (req, res) => {
    try {
        const { origen, destino, fecha_salida, fecha_regreso, pasajeros } = req.query;

        // Busca los IDs de los terminales
        const terminalOrigen = await Terminal.findOne({ where: { nombre: { [Op.like]: `%${origen}%` } } });
        const terminalDestino = await Terminal.findOne({ where: { nombre: { [Op.like]: `%${destino}%` } } });

        if (!terminalOrigen || !terminalDestino) {
            return res.json({ viajes: [], parametros: req.query });
        }

        const viajes = await Viaje.findAll({
            where: {
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('DATE', Sequelize.col('instante_abordaje')),
                        fecha_salida // debe ser 'YYYY-MM-DD'
                    ),
                    { estado: { [Op.notIn]: ['CANCELADO'] } },
                    { esta_habilitado: true }
                ]
            },
            include: [
                {
                    model: Ruta,
                    where: {
                        id_terminal_origen: terminalOrigen.id_terminal,
                        id_terminal_destino: terminalDestino.id_terminal
                    },
                    include: [
                        { model: Terminal, as: 'terminalOrigen' },
                        { model: Terminal, as: 'terminalDestino' }
                    ]
                },
                { model: Empresa },
                { model: Tarifa }
            ]
        });

        // Formatear resultados 
        const viajesFormateados = viajes.map(viaje => ({
            id_viaje: viaje.id_viaje,
            estado: viaje.estado,
            instante_abordaje: viaje.instante_abordaje,
            instante_partida: viaje.instante_partida,
            instante_llegada: viaje.instante_llegada,
            duracion_estimada_minutos: viaje.duracion_estimada_minutos,
            empresa: viaje.Empresa ? {
                id_empresa: viaje.Empresa.id_empresa,
                razon_social: viaje.Empresa.razon_social
            } : null,
            ruta: viaje.Ruta ? {
                origen: viaje.Ruta.terminalOrigen ? viaje.Ruta.terminalOrigen.nombre : 'Desconocido',
                destino: viaje.Ruta.terminalDestino ? viaje.Ruta.terminalDestino.nombre : 'Desconocido',
                distancia: viaje.Ruta.distancia_de_recorrido
            } : null,
            tarifas: viaje.Tarifas ? viaje.Tarifas.map(tarifa => ({
                id_tarifa: tarifa.id_tarifa,
                precio: tarifa.precio,
                tipo: tarifa.tipo
            })) : []
        }));

        res.json({
            viajes: viajesFormateados,
            parametros: {
                origen,
                destino,
                fecha_salida,
                fecha_regreso,
                pasajeros: parseInt(pasajeros) || 1
            }
        });

    } catch (error) {
        console.error('Error al buscar viajes:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            mensaje: error.message 
        });
    }
});

router.get('/resultados/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const viaje = await Viaje.findOne({
      where: { id_viaje: id },
      include: [
        {
          model: Ruta,
          include: [
            { model: Terminal, as: 'terminalOrigen' },
            { model: Terminal, as: 'terminalDestino' }
          ]
        },
        {
          model: Bus,
          include: [
            {
              model: Servicio,
              through: { attributes: [] } 
            },
            {
                model: Piso,
                include: [
                    {
                    model: Asiento,
                    include: [{ model: TipoDeAsiento }],
                    where: { esta_habilitado: true },
                    required: false
                    }
                ]
            }
          ]
        },
        { model: Empresa },
        {
          model: Tarifa,
          include: [{ model: TipoDeAsiento }]
        }
      ]
    });

    if (!viaje) return res.status(404).json({ error: 'Viaje no encontrado' });

    const pisos = (viaje.Bus?.Pisos || []).map(piso => ({
    numero_de_piso: piso.numero_de_piso,
    nombre: piso.nombre,
    asientos: (piso.Asientos || []).map(asiento => ({
    id_asiento: asiento.id_asiento,
    ubicacion: asiento.ubicacion,
    estado: asiento.estado,
    tipo: asiento.TipoDeAsiento?.nombre || 'Desconocido'
    }))
    }));

    const viajeFormateado = {
      id_viaje: viaje.id_viaje,
      estado: viaje.estado,
      abordaje: viaje.instante_abordaje,
      partida: viaje.instante_partida,
      llegada: viaje.instante_llegada,
      duracion: viaje.duracion_estimada_minutos,
      origen: viaje.Ruta?.terminalOrigen?.nombre || 'Desconocido',
      destino: viaje.Ruta?.terminalDestino?.nombre || 'Desconocido',
      empresa: viaje.Empresa?.razon_social || 'Empresa desconocida',
      placa_bus: viaje.Bus?.placa,
      cantidad_pisos: viaje.Bus?.Pisos?.length ?? 1, 
      servicios: viaje.Bus?.Servicios?.map(s => s.nombre) || [],
      tarifas: viaje.Tarifas?.map(t => ({
        id_tarifa: t.id_tarifa,
        tipo: t.TipoDeAsiento?.nombre,
        precio: t.precio,
        detalle: t.detalle
      })) || [],
      pisos 
    };

    return res.json(viajeFormateado);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;