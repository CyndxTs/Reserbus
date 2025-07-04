const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { 
  Empresa, 
  Bus, 
  Piso, 
  Servicio, 
  Reserva, 
  Viaje,
  Ruta, 
  Terminal, 
  Pago,
  Viajero, 
  Pasajero 
} = require('../models');

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

// GET ALL RESERVAS BY EMPRESA
// server/routes/Empresas.js
router.get('/:idEmpresa/reservas', async (req, res) => {
  try {
    const { idEmpresa } = req.params;
    
    const reservas = await Reserva.findAll({
      where: {
        esta_habilitado: true
      },
      include: [
        {
          model: Viajero,
          attributes: ['nombres', 'apellidos', 'correo_electronico', 'telefono']
        },
        {
          model: Viaje,
          as: 'viajeIda',
          where: {
            id_empresa: idEmpresa,
            esta_habilitado: true
          },
          include: [
            {
              model: Ruta,
              include: [
                {
                  model: Terminal,
                  as: 'terminalOrigen',
                  attributes: ['nombre', 'ciudad']
                },
                {
                  model: Terminal,
                  as: 'terminalDestino',
                  attributes: ['nombre', 'ciudad']
                }
              ]
            },
            {
              model: Bus,
              attributes: ['placa']
            }
          ]
        },
        {
          model: Viaje,
          as: 'viajeVuelta',
          required: false,
          where: {
            id_empresa: idEmpresa,  
            esta_habilitado: true    
          },
          include: [
            {
              model: Ruta,
              include: [
                {
                  model: Terminal,
                  as: 'terminalOrigen',
                  attributes: ['nombre', 'ciudad']
                },
                {
                  model: Terminal,
                  as: 'terminalDestino',
                  attributes: ['nombre', 'ciudad']
                }
              ]
            }
          ]
        },
        {
          model: Pago,
          required: false,
          attributes: ['monto', 'metodo_pago']
        },
        {
          model: Pasajero,
          attributes: ['nombres', 'apellidos', 'tipo_documento', 'numero_documento', 'id_asiento'],
          limit: 1 // Solo obtener el primer pasajero
        }
      ],
      order: [['id_reserva', 'DESC']]
    });

    const reservasFormateadas = reservas.map(reserva => {
      const viajeIda = reserva.viajeIda;
      const viajeVuelta = reserva.viajeVuelta || {}; // Manejar caso sin viaje de vuelta
      const ruta = viajeIda?.Ruta;
      const terminalOrigen = ruta?.terminalOrigen;
      const terminalDestino = ruta?.terminalDestino;
      const primerPasajero = reserva.Pasajeros?.[0]; // Obtener el primer pasajero
      
      return {
        id_reserva: reserva.id_reserva,
        estado: reserva.estado,
        id_viajero: reserva.id_viajero,
        id_viaje_ida: reserva.id_viaje_ida,
        id_viaje_vuelta: reserva.id_viaje_vuelta,
        id_pago: reserva.id_pago,
        esta_habilitado: reserva.esta_habilitado,
        
        // Datos del viajero (usuario registrado)
        viajero: {
          nombres: reserva.Viajero?.nombres,
          apellidos: reserva.Viajero?.apellidos,
          correo: reserva.Viajero?.correo_electronico,
          telefono: reserva.Viajero?.telefono
        },
        
        // Datos del primer pasajero
        pasajero: {
          nombres: primerPasajero?.nombres || reserva.Viajero?.nombres,
          apellidos: primerPasajero?.apellidos || reserva.Viajero?.apellidos,
          tipoDocumento: primerPasajero?.tipo_documento || 'DNI',
          documento: primerPasajero?.numero_documento || '',
          asiento: primerPasajero?.id_asiento || ''
        },
        
        // Datos del viaje
        fechaIda: viajeIda?.instante_abordaje ? 
          new Date(viajeIda.instante_abordaje).toLocaleDateString('es-PE') : '',
        horaIda: viajeIda?.instante_abordaje ? 
          new Date(viajeIda.instante_abordaje).toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '',
        fechaVuelta: viajeVuelta?.instante_abordaje ? 
          new Date(viajeVuelta.instante_abordaje).toLocaleDateString('es-PE') : '',
        horaVuelta: viajeVuelta?.instante_abordaje ? 
          new Date(viajeVuelta.instante_abordaje).toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '',
        
        // Ruta formateada
        ruta: terminalOrigen && terminalDestino ? 
          `${terminalOrigen.ciudad} → ${terminalDestino.ciudad}` : '',
        
        // Información del bus
        bus: viajeIda?.Bus?.placa || '',
             
        // Información de pago
        monto: reserva.Pago?.monto || 0,
        metodo_pago: reserva.Pago?.metodo_pago || '',
        
        // Cantidad de pasajeros (para referencia)
        cantidad_pasajeros: reserva.Pasajeros?.length || 0,
        
        // Información completa para detalles
        detalles: {
          viaje_ida: viajeIda,
          viaje_vuelta: reserva.viajeVuelta,
          pago: reserva.Pago
        }
      };
    });
    console.log('Reservas formateadas:', JSON.stringify(reservasFormateadas, null, 2));
    res.json(reservasFormateadas);
  } catch (error) {
    console.error("Error al obtener reservas por empresa:", error);
    res.status(500).json({ 
      error: 'Error al obtener reservas',
      details: error.message 
    });
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