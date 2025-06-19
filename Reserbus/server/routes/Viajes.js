const express = require('express');
const router = express.Router();
const { Viaje, Ruta, Terminal, Empresa, Tarifa } = require('../models');
const { Op } = require('sequelize');
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
});
// buscar viajes según parámetros
router.get('/buscar', async (req, res) => {
    try {
        const { origen, destino, fecha_salida, fecha_regreso, pasajeros } = req.query;
        
        // Convertir fecha_salida a objeto Date para comparación
        const fechaSalida = new Date(fecha_salida);
        // Establecer hora a 00:00:00 para buscar todos los viajes del día
        fechaSalida.setHours(0, 0, 0, 0);
        
        // Fecha fin (final del día)
        const fechaFinDia = new Date(fechaSalida);
        fechaFinDia.setHours(23, 59, 59, 999);
        
        const viajes = await Viaje.findAll({
            where: {
                // Filtrar por fecha de abordaje
                instante_abordaje: {
                    [Op.between]: [fechaSalida, fechaFinDia]
                },
                // Solo viajes programados y no cancelados
                estado: {
                    [Op.notIn]: ['CANCELADO']
                },
                esta_habilitado: true
            },
            include: [
                {
                    model: Ruta,
                    include: [
                        {
                            model: Terminal,
                            as: 'terminalOrigen',
                            where: {
                                nombre: origen
                            }
                        },
                        {
                            model: Terminal,
                            as: 'terminalDestino',
                            where: {
                                nombre: destino
                            }
                        }
                    ]
                },
                {
                    model: Empresa
                },
                {
                    model: Tarifa
                }
            ]
        });
        
        // Formatear resultados para el frontend
        const viajesFormateados = viajes.map(viaje => ({
            id_viaje: viaje.id_viaje,
            estado: viaje.estado,
            instante_abordaje: viaje.instante_abordaje,
            instante_partida: viaje.instante_partida,
            instante_llegada: viaje.instante_llegada,
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


module.exports = router;