const express = require('express');
const router = express.Router();
const { Viaje, Ruta, Terminal, Empresa, Tarifa } = require('../models');
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

        viajes.forEach(viaje => {
            console.log(
                'Viaje:', viaje.id_viaje,
                'Ruta:', viaje.Ruta?.id_ruta,
                'Origen:', viaje.Ruta?.terminalOrigen?.nombre,
                'Destino:', viaje.Ruta?.terminalDestino?.nombre
            );
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

module.exports = router;