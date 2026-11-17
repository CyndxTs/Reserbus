const { sequelize, Viaje, Pasajero, ViajeTramoProgramado, Pasaje } = require('../models');
const { QueryTypes } = require('sequelize');
const { consultar, expirarViajes } = require('../lib/sql');
const { ErrorHttp } = require('../lib/errores');
const { parsearAsiento, asientoValido, cargarRangos, tipoAsientoDeFila } = require('./asientos');

const TRASBORDO_MIN_MIN = Number(process.env.TRASBORDO_MIN_MIN || 30);
const TIPOS_DOC = ['DNI', 'CE', 'PASAPORTE'];
const redondear = (n) => Math.round(n * 100) / 100;

// body: { tramos_programados: [id, ...] (en orden),
//         pasajeros: [{ nombres, apellidos, tipo_documento, numero_documento, asientos: { "<id_tramo_programado>": "12A" } }] }
// Crea el viaje PENDIENTE (hold de 10 min, lo fija la BD) con sus patas, pasajeros y pasajes.
async function crearViaje(idViajero, body) {
  await expirarViajes();
  const ids = (body.tramos_programados || []).map(String);
  const pasajeros = body.pasajeros || [];
  if (!ids.length || ids.some(i => !/^\d+$/.test(i))) throw new ErrorHttp(400, 'tramos_programados debe ser una lista de ids.');
  if (new Set(ids).size !== ids.length) throw new ErrorHttp(400, 'tramos_programados tiene ids repetidos.');
  if (!pasajeros.length) throw new ErrorHttp(400, 'Debes enviar al menos un pasajero.');

  const filas = await consultar(
    `SELECT tp.id, tp.id_plan, tp.id_bus, tp.salida_estimada, tp.llegada_estimada, tp.salida_real,
            t.id_terminal_origen AS origen, t.id_terminal_destino AS destino,
            tb.id AS id_tipo_bus, tb.filas, tb.asientos_por_fila, tar.monto_base::float8 AS monto_base,
            p.activo AS plan_activo, b.activo AS bus_activo
       FROM reserbus.tramo_programado tp
       JOIN reserbus.tramo t ON t.id = tp.id_tramo
       JOIN reserbus.plan p ON p.id = tp.id_plan
       JOIN reserbus.bus b ON b.id = tp.id_bus
       JOIN reserbus.tipo_bus tb ON tb.id = b.id_tipo_bus
       LEFT JOIN reserbus.tarifa tar ON tar.id_tipo_bus = tb.id AND tar.id_tramo = tp.id_tramo
      WHERE tp.id IN (:ids)`, { ids }
  );
  const porId = new Map(filas.map(f => [String(f.id), f]));
  const tps = ids.map(id => porId.get(id) || null);
  if (tps.some(t => !t)) throw new ErrorHttp(404, 'Algún tramo programado no existe.');

  const ahora = Date.now();
  tps.forEach((t, i) => {
    if (t.salida_real || t.salida_estimada.getTime() <= ahora) throw new ErrorHttp(409, `El tramo programado ${ids[i]} ya salió.`);
    if (!t.plan_activo || !t.bus_activo) throw new ErrorHttp(409, `El tramo programado ${ids[i]} ya no está disponible.`);
    if (t.monto_base === null) throw new ErrorHttp(422, `El tramo programado ${ids[i]} no tiene tarifa definida.`);
  });

  // Coherencia de las patas (la BD no la valida): el destino de una es el origen de la siguiente
  for (let i = 1; i < tps.length; i++) {
    const a = tps[i - 1], b = tps[i];
    if (a.destino !== b.origen) throw new ErrorHttp(400, `Los tramos ${ids[i - 1]} y ${ids[i]} no conectan (el destino del primero no es el origen del segundo).`);
    const mismoBus = a.id_plan === b.id_plan && a.id_bus === b.id_bus;
    const margen = mismoBus ? 0 : TRASBORDO_MIN_MIN * 60000;
    if (b.salida_estimada.getTime() < a.llegada_estimada.getTime() + margen) {
      throw new ErrorHttp(400, `Tiempo insuficiente entre los tramos ${ids[i - 1]} y ${ids[i]}.`);
    }
  }

  const rangosPorTipoBus = await cargarRangos([...new Set(tps.map(t => t.id_tipo_bus))]);
  const ocupadoEnRequest = new Set();
  const pasajesAInsertar = [];     // se completan con ids de pasajero dentro de la transacción

  pasajeros.forEach((p, ip) => {
    if (!p.nombres || !p.apellidos || !p.numero_documento) throw new ErrorHttp(400, `Pasajero ${ip + 1}: faltan nombres, apellidos o numero_documento.`);
    if (!TIPOS_DOC.includes(p.tipo_documento)) throw new ErrorHttp(400, `Pasajero ${ip + 1}: tipo_documento debe ser ${TIPOS_DOC.join(', ')}.`);
    const lista = [];
    tps.forEach((t, i) => {
      const codigo = (p.asientos || {})[ids[i]];
      const as = parsearAsiento(codigo);
      if (!as) throw new ErrorHttp(400, `Pasajero ${ip + 1}: falta un asiento válido (ej. "12A") para el tramo ${ids[i]}.`);
      if (!asientoValido(as, t)) throw new ErrorHttp(400, `Pasajero ${ip + 1}: el asiento ${codigo} no existe en el bus del tramo ${ids[i]}.`);
      const clave = `${ids[i]}|${as.fila}${as.columna}`;
      if (ocupadoEnRequest.has(clave)) throw new ErrorHttp(400, `El asiento ${codigo} está repetido en el tramo ${ids[i]}.`);
      ocupadoEnRequest.add(clave);
      const ta = tipoAsientoDeFila(rangosPorTipoBus.get(t.id_tipo_bus), as.fila);
      if (!ta) throw new ErrorHttp(422, `La fila ${as.fila} del bus del tramo ${ids[i]} no tiene tipo de asiento configurado.`);
      lista.push({
        id_tramo_programado: ids[i], fila: as.fila, columna: as.columna,
        id_tipo_asiento: ta.id_tipo_asiento, precio: redondear(t.monto_base + ta.tarifa_extra),   // base + extra, congelado
      });
    });
    pasajesAInsertar.push(lista);
  });

  const idViaje = await sequelize.transaction(async (transaction) => {
    const viaje = await Viaje.create({ id_viajero: idViajero }, { transaction });
    await ViajeTramoProgramado.bulkCreate(
      ids.map((id, i) => ({ id_viaje: viaje.id, id_tramo_programado: id, posicion: i + 1 })), { transaction });
    for (let ip = 0; ip < pasajeros.length; ip++) {
      const p = pasajeros[ip];
      const pas = await Pasajero.create({
        id_viaje: viaje.id, nombres: p.nombres, apellidos: p.apellidos,
        tipo_documento: p.tipo_documento, numero_documento: p.numero_documento,
      }, { transaction });
      await Pasaje.bulkCreate(pasajesAInsertar[ip].map(x => ({ ...x, id_pasajero: pas.id, id_viaje: viaje.id })), { transaction });
    }
    return viaje.id;
  });
  return obtenerViaje(idViaje);
}

async function obtenerViaje(id) {
  const [viaje] = await consultar(
    `SELECT id, id_viajero, estado, creado_en, vence_en, cancelado_en FROM reserbus.viaje WHERE id = :id`, { id });
  if (!viaje) return null;
  const tramos = await consultar(
    `SELECT vt.posicion, tp.id AS id_tramo_programado, tor.nombre AS origen, tde.nombre AS destino,
            tp.salida_estimada, tp.llegada_estimada, tp.salida_real, tp.llegada_real, e.nombre AS empresa, b.placa
       FROM reserbus.viaje_has_tramo_programado vt
       JOIN reserbus.tramo_programado tp ON tp.id = vt.id_tramo_programado
       JOIN reserbus.tramo t ON t.id = tp.id_tramo
       JOIN reserbus.terminal tor ON tor.id = t.id_terminal_origen
       JOIN reserbus.terminal tde ON tde.id = t.id_terminal_destino
       JOIN reserbus.plan p ON p.id = tp.id_plan
       JOIN reserbus.empresa e ON e.id = p.id_empresa
       JOIN reserbus.bus b ON b.id = tp.id_bus
      WHERE vt.id_viaje = :id ORDER BY vt.posicion`, { id });
  const pasajeros = await consultar(
    `SELECT id, nombres, apellidos, tipo_documento, numero_documento FROM reserbus.pasajero WHERE id_viaje = :id ORDER BY id`, { id });
  const pasajes = await consultar(
    `SELECT ps.id_pasajero, ps.id_tramo_programado, ps.codigo_asiento, ps.precio::float8 AS precio, ps.vigente,
            ta.nombre AS tipo_asiento
       FROM reserbus.pasaje ps JOIN reserbus.tipo_asiento ta ON ta.id = ps.id_tipo_asiento
      WHERE ps.id_viaje = :id ORDER BY ps.id_pasajero, ps.id_tramo_programado`, { id });
  return {
    ...viaje,
    total: redondear(pasajes.reduce((s, p) => s + p.precio, 0)),
    tramos,
    pasajeros: pasajeros.map(p => ({ ...p, asientos: pasajes.filter(x => x.id_pasajero === p.id) })),
  };
}

async function listarViajesDe(idViajero) {
  const ids = await consultar(`SELECT id FROM reserbus.viaje WHERE id_viajero = :id ORDER BY creado_en DESC`, { id: idViajero });
  return Promise.all(ids.map(r => obtenerViaje(r.id)));
}

// Solo si sigue PENDIENTE y el hold no venció (la comprobación es atómica en el UPDATE)
async function confirmarViaje(idViaje, idViajero) {
  await expirarViajes();
  const r = await sequelize.query(
    `UPDATE reserbus.viaje SET estado = 'CONFIRMADO'
      WHERE id = :idViaje AND id_viajero = :idViajero AND estado = 'PENDIENTE' AND vence_en > now()
      RETURNING id`, { replacements: { idViaje, idViajero }, type: QueryTypes.SELECT });
  if (!r.length) await explicarFallo(idViaje, idViajero, 'confirmar');
  return obtenerViaje(idViaje);
}

// Cancela la reserva completa; el trigger de la BD libera los asientos
async function cancelarViaje(idViaje, idViajero) {
  await expirarViajes();
  const r = await sequelize.query(
    `UPDATE reserbus.viaje SET estado = 'CANCELADO', cancelado_en = now()
      WHERE id = :idViaje AND id_viajero = :idViajero AND estado IN ('PENDIENTE', 'CONFIRMADO')
      RETURNING id`, { replacements: { idViaje, idViajero }, type: QueryTypes.SELECT });
  if (!r.length) await explicarFallo(idViaje, idViajero, 'cancelar');
  return obtenerViaje(idViaje);
}

async function explicarFallo(idViaje, idViajero, accion) {
  const [v] = await consultar(`SELECT estado, id_viajero FROM reserbus.viaje WHERE id = :id`, { id: idViaje });
  if (!v || v.id_viajero !== idViajero) throw new ErrorHttp(404, 'Viaje no encontrado.');
  const msg = v.estado === 'EXPIRADO' ? 'El tiempo de reserva (10 min) venció; los asientos se liberaron.' : `No se puede ${accion}: el viaje está ${v.estado}.`;
  throw new ErrorHttp(409, msg, { estado: v.estado });
}

module.exports = { crearViaje, obtenerViaje, listarViajesDe, confirmarViaje, cancelarViaje };
