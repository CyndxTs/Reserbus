const express = require('express');
const router = express.Router();
const { Bus, Servicio, Piso, Asiento, TipoDeAsiento, Viaje, Reserva } = require('../models');
const { Op } = require('sequelize');

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

    // 2. Crear pisos
    const pisos = [];
    for (let i = 1; i <= cantidad_pisos; i++) {
      const piso = await Piso.create({
        numero_de_piso: i,
        nombre: `Piso ${i}`,
        id_bus: nuevoBus.id_bus,
        esta_habilitado: true
      });
      pisos.push(piso);
    }

    // 3. Crear asientos para cada piso
    const tiposDeAsiento = await TipoDeAsiento.findAll({ where: { esta_habilitado: true } });
    
    for (const piso of pisos) {
      // Ejemplo de creación de asientos (ajustar según la lógica de tu negocio)
      // Aquí asumimos que cada piso tiene 40 asientos
      for (let i = 1; i <= 30; i++) {
        const fila = Math.ceil(i / 4); // 4 asientos por fila
        const columna = i % 4 || 4;
        const ubicacion = `${String.fromCharCode(64 + fila)}-${columna}`; // A-1, A-2, etc.
        
        // Alternar entre tipos de asiento disponibles
        const tipo = tiposDeAsiento[i % tiposDeAsiento.length];
        const esVentana = (columna === 1 || columna === 4);
        await Asiento.create({
          ubicacion,
          tiene_ventana: i % 4 === 1 || i % 4 === 2, // Asientos de ventana en columnas 1 y 2
          estado: 'DISPONIBLE',
          id_piso: piso.id_piso,
          id_tipo_de_asiento: tipo.id_tipo_de_asiento,
          esta_habilitado: true,
          tiene_ventana: esVentana 
        });
      }
    }

    // 4. Asociar servicios (si llegan)
    if (Array.isArray(servicios) && servicios.length > 0) {
      await nuevoBus.setServicios(servicios);
    }

    // 5. Obtener bus completo con relaciones para responder
    const busCompleto = await Bus.findByPk(nuevoBus.id_bus, {
      include: [
        {
          model: Servicio,
          as: 'servicios'
        },
        {
          model: Piso,
          as: 'Pisos',
          include: [
            {
              model: Asiento,
              as: 'Asientos'
            }
          ]
        }
      ]
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

    // 2. Actualizar servicios
    const bus = await Bus.findByPk(id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus no encontrado' });
    }
    await bus.setServicios(servicios || []);

    // 3. Sincronizar pisos y asientos
    const pisosActuales = await Piso.findAll({
      where: { id_bus: id, esta_habilitado: true },
      order: [['numero_de_piso', 'ASC']]
    });
    const cantidadActual = pisosActuales.length;
    const diferencia = cantidad_pisos - cantidadActual;

    if (diferencia < 0) {
      // Hay que inhabilitar pisos y asientos sobrantes
      const pisosASobrar = pisosActuales.slice(diferencia); // Los últimos pisos
      for (const piso of pisosASobrar) {
        await Asiento.destroy({ where: { id_piso: piso.id_piso } });
        await Piso.destroy({ where: { id_piso: piso.id_piso } });
      }
    }

    if (diferencia > 0) {
      // Hay que crear pisos y asientos nuevos
      // Obtén los tipos de asiento habilitados para usarlos en la creación
      const tiposDeAsiento = await TipoDeAsiento.findAll({ where: { esta_habilitado: true } });

      for (let i = cantidadActual + 1; i <= cantidad_pisos; i++) {
        const nuevoPiso = await Piso.create({
          numero_de_piso: i,
          nombre: `Piso ${i}`,
          id_bus: id,
          esta_habilitado: true
        });

        // Crea asientos para el nuevo piso (ajusta la cantidad según tu lógica)
        for (let j = 1; j <= 30; j++) { // Ejemplo: 30 asientos por piso
          const fila = Math.ceil(j / 4); // 4 asientos por fila
          const columna = j % 4 || 4;
          const ubicacion = `${String.fromCharCode(64 + fila)}-${columna}`;
          const tipo = tiposDeAsiento[j % tiposDeAsiento.length];
          const esVentana = (columna === 1 || columna === 4);
          await Asiento.create({
            ubicacion,
            id_piso: nuevoPiso.id_piso,
            id_tipo_de_asiento: tipo.id_tipo_de_asiento,
            esta_habilitado: true,
            tiene_ventana: esVentana 
          });
        }
      }
    }

    // 4. Devolver el bus actualizado con relaciones
    const busActualizado = await Bus.findByPk(id, {
      include: [
        { model: Servicio, as: 'servicios' },
        {
          model: Piso,
          as: 'Pisos',
          include: [{ model: Asiento, as: 'Asientos' }]
        }
      ]
    });

    res.json(busActualizado);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Error al actualizar el bus' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Verificar si el bus está asignado a algún viaje habilitado
    const viajesAsociados = await Viaje.findAll({
       where: {
        id_bus: id,
        estado: {
          [Op.in]: ['PROGRAMADO', 'EN_CURSO']
        }
      }
    });

    if (viajesAsociados.length > 0) {
      // 2. Verificar si alguno de los viajes tiene reservas activas
      const viajesConReservas = await Promise.all(
        viajesAsociados.map(async viaje => {
          const reservas = await Reserva.findAll({
            where: {
              [Op.or]: [
                { id_viaje_ida: viaje.id_viaje },
                { id_viaje_vuelta: viaje.id_viaje }
              ]
            }
          });
          return reservas.length > 0;
        })
      );

      if (viajesConReservas.some(viajeTieneReservas => viajeTieneReservas)) {
        return res.status(400).json({
          error: 'No se puede inhabilitar el bus',
          detalle: 'Este bus está asignado a viajes con reservas activas. Debe eliminar o reasignar esas reservas antes de inhabilitar el bus.'
        });
      }

      // Si tiene viajes pero sin reservas
      return res.status(400).json({
        error: 'No se puede inhabilitar el bus',
        detalle: 'Este bus está asignado a viajes activos. Debe desvincular el bus de los viajes antes de inhabilitarlo.'
      });
    }

    // 3. Si no hay viajes asociados, proceder a inhabilitar el bus y sus recursos relacionados
    const [updated] = await Bus.update(
      { esta_habilitado: false },
      { where: { id_bus: id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Bus no encontrado' });
    }

    // Inhabilitar pisos y asientos relacionados
    await Piso.update(
      { esta_habilitado: false },
      { where: { id_bus: id } }
    );
    const pisos = await Piso.findAll({ where: { id_bus: id } });
    const pisoIds = pisos.map(p => p.id_piso);
    if (pisoIds.length > 0) {
      await Asiento.update(
        { esta_habilitado: false },
        { where: { id_piso: pisoIds } }
      );
    }

    res.json({ message: 'Bus y todos sus pisos y asientos inhabilitados correctamente' });
  } catch (error) {
    console.error("Error en DELETE lógico /api/buses/:id:", error);
    res.status(500).json({ error: 'Error al inhabilitar el bus', detalle: error.message });
  }
});

module.exports = router;