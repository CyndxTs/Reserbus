const { consultar, expirarViajes } = require('../lib/sql');
const { ErrorHttp } = require('../lib/errores');

const TRASBORDO_MIN_MIN = Number(process.env.TRASBORDO_MIN_MIN || 30);   // parámetro de la app
const MIN = 60000;

// ISO "YYYY-MM-DD HH:mm" en hora local del terminal (UTC + desfase del país)
const aLocal = (fecha, desfaseMin) =>
  new Date(fecha.getTime() + desfaseMin * MIN).toISOString().slice(0, 16).replace('T', ' ');

// Grafo con tiempo: nodos = terminales, aristas = tramos programados con asientos libres.
// Se permite conectar si la siguiente arista sale del terminal donde se llegó con
// salida >= llegada (+ tiempo mínimo de trasbordo al cambiar de plan/bus). Mismo plan y bus
// sin espera no cuenta como trasbordo. Búsqueda en profundidad acotada por nº de trasbordos.
async function buscar({
  origenes, destinos, fecha, pasajeros = 1, maxTrasbordos = 2,
  trasbordoMin = TRASBORDO_MIN_MIN, ventanaHoras = 48, orden = 'llegada', limite = 20,
}) {
  if (!origenes.length || !destinos.length) throw new ErrorHttp(400, 'Indica origen y destino.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) throw new ErrorHttp(400, 'fecha debe ser YYYY-MM-DD.');
  await expirarViajes();

  // "fecha" es el día LOCAL del terminal de origen -> rango UTC
  const [{ desfase_utc_min: desfase }] = await consultar(
    `SELECT pa.desfase_utc_min FROM reserbus.terminal t
       JOIN reserbus.provincia pv ON pv.id = t.id_provincia
       JOIN reserbus.pais pa ON pa.id = pv.id_pais
      WHERE t.id = :id`, { id: origenes[0] }
  ).then(r => r.length ? r : [{ desfase_utc_min: 0 }]);
  const inicioDia = new Date(`${fecha}T00:00:00Z`).getTime() - desfase * MIN;
  const finDia = inicioDia + 24 * 60 * MIN;
  const desde = new Date(Math.max(inicioDia, Date.now()));
  const hasta = new Date(inicioDia + ventanaHoras * 60 * MIN);

  const aristas = await consultar(
    `SELECT tp.id, tp.id_plan, tp.id_bus, tp.id_tramo, tp.salida_estimada, tp.llegada_estimada,
            t.id_terminal_origen AS origen, t.id_terminal_destino AS destino,
            tor.nombre AS origen_nombre, tde.nombre AS destino_nombre,
            po.desfase_utc_min AS desfase_origen, pd.desfase_utc_min AS desfase_destino,
            p.id_empresa, e.nombre AS empresa, b.placa, tb.nombre AS tipo_bus,
            tar.monto_base::float8 AS monto_base,
            tb.total_asientos - COALESCE(oc.n, 0) AS libres
       FROM reserbus.tramo_programado tp
       JOIN reserbus.tramo t ON t.id = tp.id_tramo
       JOIN reserbus.terminal tor ON tor.id = t.id_terminal_origen
       JOIN reserbus.provincia pvo ON pvo.id = tor.id_provincia
       JOIN reserbus.pais po ON po.id = pvo.id_pais
       JOIN reserbus.terminal tde ON tde.id = t.id_terminal_destino
       JOIN reserbus.provincia pvd ON pvd.id = tde.id_provincia
       JOIN reserbus.pais pd ON pd.id = pvd.id_pais
       JOIN reserbus.plan p ON p.id = tp.id_plan AND p.activo
       JOIN reserbus.empresa e ON e.id = p.id_empresa AND e.activa
       JOIN reserbus.bus b ON b.id = tp.id_bus AND b.activo
       JOIN reserbus.tipo_bus tb ON tb.id = b.id_tipo_bus
       JOIN reserbus.tarifa tar ON tar.id_tipo_bus = tb.id AND tar.id_tramo = tp.id_tramo
       LEFT JOIN LATERAL (SELECT count(*)::int AS n FROM reserbus.pasaje ps
                           WHERE ps.id_tramo_programado = tp.id AND ps.vigente) oc ON TRUE
      WHERE tp.salida_estimada >= :desde AND tp.salida_estimada < :hasta AND tp.salida_real IS NULL
        AND tb.total_asientos - COALESCE(oc.n, 0) >= :pasajeros
      ORDER BY tp.salida_estimada`,
    { desde, hasta, pasajeros }
  );

  const porOrigen = new Map();
  for (const a of aristas) {
    if (!porOrigen.has(a.origen)) porOrigen.set(a.origen, []);
    porOrigen.get(a.origen).push(a);
  }
  const setDestinos = new Set(destinos);
  const itinerarios = [];
  let explorados = 0;

  const dfs = (terminal, ultimo, camino, visitados, trasbordos) => {
    if (++explorados > 20000) return;                            // tope de seguridad
    for (const e of porOrigen.get(terminal) || []) {
      let nuevos = trasbordos;
      if (!ultimo) {
        if (e.salida_estimada.getTime() >= finDia) continue;     // 1er tramo: dentro del día pedido
      } else {
        const mismoBus = e.id_plan === ultimo.id_plan && e.id_bus === ultimo.id_bus
          && e.salida_estimada.getTime() === ultimo.llegada_estimada.getTime();
        if (!mismoBus) {
          if (e.salida_estimada.getTime() < ultimo.llegada_estimada.getTime() + trasbordoMin * MIN) continue;
          nuevos = trasbordos + 1;
          if (nuevos > maxTrasbordos) continue;
        }
      }
      if (visitados.has(e.destino)) continue;
      const nuevoCamino = [...camino, e];
      if (setDestinos.has(e.destino)) {
        itinerarios.push({ legs: nuevoCamino, trasbordos: nuevos });
      } else {
        dfs(e.destino, e, nuevoCamino, new Set([...visitados, e.destino]), nuevos);
      }
    }
  };
  for (const o of origenes) dfs(o, null, [], new Set([o]), 0);

  const resultados = itinerarios.map(({ legs, trasbordos }) => {
    // Une tramos consecutivos del mismo plan y bus en una "sección" (lo que ve el viajero)
    const secciones = [];
    for (const l of legs) {
      const s = secciones[secciones.length - 1];
      if (s && s.id_plan === l.id_plan && s.id_bus === l.id_bus && s.llegada.getTime() === l.salida_estimada.getTime()) {
        s.destino = l.destino_nombre; s.id_terminal_destino = l.destino; s.llegada = l.llegada_estimada;
        s.llegada_local = aLocal(l.llegada_estimada, l.desfase_destino);
        s.precio_base += l.monto_base; s.libres = Math.min(s.libres, l.libres);
        s.tramos_programados.push(l.id);
      } else {
        secciones.push({
          id_plan: l.id_plan, id_bus: l.id_bus, empresa: l.empresa, placa: l.placa, tipo_bus: l.tipo_bus,
          origen: l.origen_nombre, id_terminal_origen: l.origen, destino: l.destino_nombre, id_terminal_destino: l.destino,
          salida: l.salida_estimada, llegada: l.llegada_estimada,
          salida_local: aLocal(l.salida_estimada, l.desfase_origen), llegada_local: aLocal(l.llegada_estimada, l.desfase_destino),
          precio_base: l.monto_base, libres: l.libres, tramos_programados: [l.id],
        });
      }
    }
    const primero = legs[0], ultimo = legs[legs.length - 1];
    return {
      salida: primero.salida_estimada, llegada: ultimo.llegada_estimada,
      salida_local: aLocal(primero.salida_estimada, primero.desfase_origen),
      llegada_local: aLocal(ultimo.llegada_estimada, ultimo.desfase_destino),
      duracion_min: Math.round((ultimo.llegada_estimada - primero.salida_estimada) / MIN),
      trasbordos,
      precio_base: Math.round(legs.reduce((s, l) => s + l.monto_base, 0) * 100) / 100,   // sin extra de tipo de asiento
      libres: Math.min(...legs.map(l => l.libres)),
      tramos_programados: legs.map(l => l.id),                  // en orden, listos para POST /api/viajes
      secciones: secciones.map(s => ({ ...s, precio_base: Math.round(s.precio_base * 100) / 100 })),
    };
  });

  const claves = {
    llegada: (a, b) => a.llegada - b.llegada || a.trasbordos - b.trasbordos,
    precio: (a, b) => a.precio_base - b.precio_base || a.llegada - b.llegada,
    trasbordos: (a, b) => a.trasbordos - b.trasbordos || a.llegada - b.llegada,
  };
  resultados.sort(claves[orden] || claves.llegada);
  return resultados.slice(0, limite);
}

module.exports = { buscar };
