const { consultar } = require('../lib/sql');
const { ErrorHttp } = require('../lib/errores');

// No existe la tabla ASIENTO: un asiento es (fila, columna) y su código es fila + letra ("12A").
// Con 4 por fila: A B | C D (pasillo después de la mitad).
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const columnasDe = (porFila) => LETRAS.slice(0, porFila).split('');

function parsearAsiento(codigo) {
  const m = /^(\d{1,3})([A-Z])$/.exec(String(codigo || '').trim().toUpperCase());
  return m ? { fila: Number(m[1]), columna: m[2] } : null;
}

// La BD no valida esto: fila <= filas y columna dentro de las primeras asientos_por_fila letras
const asientoValido = ({ fila, columna }, { filas, asientos_por_fila }) =>
  fila >= 1 && fila <= filas && columnasDe(asientos_por_fila).includes(columna);

// Rangos de filas -> tipo de asiento (con su tarifa_extra) de varios tipos de bus
async function cargarRangos(idsTipoBus) {
  const filas = await consultar(
    `SELECT r.id_tipo_bus, r.fila_desde, r.fila_hasta, r.id_tipo_asiento,
            ta.nombre, ta.tarifa_extra::float8 AS tarifa_extra
       FROM reserbus.tipo_bus_has_tipo_asiento r
       JOIN reserbus.tipo_asiento ta ON ta.id = r.id_tipo_asiento
      WHERE r.id_tipo_bus IN (:ids)
      ORDER BY r.id_tipo_bus, r.fila_desde`,
    { ids: idsTipoBus.length ? idsTipoBus : [0] }
  );
  const porTipoBus = new Map();
  for (const f of filas) {
    if (!porTipoBus.has(f.id_tipo_bus)) porTipoBus.set(f.id_tipo_bus, []);
    porTipoBus.get(f.id_tipo_bus).push(f);
  }
  return porTipoBus;
}

const tipoAsientoDeFila = (rangos = [], fila) =>
  rangos.find(r => fila >= r.fila_desde && fila <= r.fila_hasta) || null;

// Mapa de un tramo programado: forma del bus, tipos por fila y asientos ocupados (pasajes vigentes)
async function mapaAsientos(idTramoProgramado) {
  const [tp] = await consultar(
    `SELECT tp.id, tp.id_plan, tp.salida_estimada, tp.llegada_estimada,
            tb.id AS id_tipo_bus, tb.nombre AS tipo_bus, tb.filas, tb.asientos_por_fila, tb.total_asientos,
            b.placa
       FROM reserbus.tramo_programado tp
       JOIN reserbus.bus b ON b.id = tp.id_bus
       JOIN reserbus.tipo_bus tb ON tb.id = b.id_tipo_bus
      WHERE tp.id = :id`,
    { id: idTramoProgramado }
  );
  if (!tp) throw new ErrorHttp(404, 'Tramo programado no encontrado.');
  const ocupados = (await consultar(
    `SELECT codigo_asiento FROM reserbus.pasaje WHERE id_tramo_programado = :id AND vigente ORDER BY fila, columna`,
    { id: idTramoProgramado }
  )).map(r => r.codigo_asiento);
  const rangos = (await cargarRangos([tp.id_tipo_bus])).get(tp.id_tipo_bus) || [];
  return {
    ...tp,
    columnas: columnasDe(tp.asientos_por_fila),
    pasillo_despues_de: tp.asientos_por_fila / 2,
    rangos,
    ocupados,
    libres: tp.total_asientos - ocupados.length,
  };
}

// Los rangos de un tipo de bus no deben solaparse y deben cubrir todas las filas (lo valida la app)
function validarRangos(rangos, filas) {
  if (!Array.isArray(rangos) || !rangos.length) throw new ErrorHttp(400, 'Debes indicar al menos un rango de filas con su tipo de asiento.');
  const orden = [...rangos].sort((a, b) => a.fila_desde - b.fila_desde);
  let esperado = 1;
  for (const r of orden) {
    if (!Number.isInteger(r.fila_desde) || !Number.isInteger(r.fila_hasta) || r.fila_hasta < r.fila_desde) {
      throw new ErrorHttp(400, 'Rango de filas inválido.');
    }
    if (r.fila_desde !== esperado) throw new ErrorHttp(400, `Los rangos deben ser contiguos, sin huecos ni solapes (falta/sobra cerca de la fila ${esperado}).`);
    esperado = r.fila_hasta + 1;
  }
  if (esperado - 1 !== filas) throw new ErrorHttp(400, `Los rangos deben cubrir exactamente las filas 1 a ${filas}.`);
  return orden;
}

module.exports = { columnasDe, parsearAsiento, asientoValido, cargarRangos, tipoAsientoDeFila, mapaAsientos, validarRangos };
