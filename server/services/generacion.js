const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

// Genera los tramos programados de los planes ACTIVOS: para cada día del horizonte y cada bus
// asignado al plan, un registro por tramo de la ruta. Sin esperas en paradas:
//   salida del tramo N = hora de salida (UTC) + suma de duraciones de los tramos anteriores.
// Es idempotente (ON CONFLICT DO NOTHING) y no crea tramos que ya salieron.
async function generarTramosProgramados({ idPlan = null, idEmpresa = null, dias = 90, desde = null } = {}) {
  const inicio = desde || new Date().toISOString().slice(0, 10);
  const fin = new Date(new Date(`${inicio}T00:00:00Z`).getTime() + (dias - 1) * 86400000).toISOString().slice(0, 10);
  const filas = await sequelize.query(
    `WITH base AS (
       SELECT p.id AS id_plan, pb.id_bus, p.id_ruta, rt.id_tramo, rt.duracion_min,
              CAST(d AS date) AS dia, h.hora_salida,
              COALESCE(SUM(rt.duracion_min) OVER (
                PARTITION BY p.id, pb.id_bus, d ORDER BY rt.posicion
                ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS previo
         FROM reserbus.plan p
         JOIN reserbus.horario h ON h.id = p.id_horario
         JOIN reserbus.plan_has_bus pb ON pb.id_plan = p.id
         JOIN reserbus.bus b ON b.id = pb.id_bus AND b.activo
         JOIN reserbus.ruta_has_tramo rt ON rt.id_ruta = p.id_ruta
        CROSS JOIN generate_series(CAST(:inicio AS date), CAST(:fin AS date), interval '1 day') AS d
        WHERE p.activo
          AND (CAST(:plan AS int) IS NULL OR p.id = CAST(:plan AS int))
          AND (CAST(:empresa AS int) IS NULL OR p.id_empresa = CAST(:empresa AS int))
     ), calc AS (
       SELECT id_plan, id_bus, id_ruta, id_tramo, duracion_min,
              ((dia + hora_salida) AT TIME ZONE 'UTC') + previo * interval '1 minute' AS salida
         FROM base
     )
     INSERT INTO reserbus.tramo_programado (id_plan, id_bus, id_ruta, id_tramo, salida_estimada, llegada_estimada)
     SELECT id_plan, id_bus, id_ruta, id_tramo, salida, salida + duracion_min * interval '1 minute'
       FROM calc
      WHERE salida > now()
     ON CONFLICT DO NOTHING
     RETURNING id`,
    { replacements: { inicio, fin, plan: idPlan, empresa: idEmpresa }, type: QueryTypes.SELECT }
  );
  return { creados: filas.length, desde: inicio, hasta: fin };
}

module.exports = { generarTramosProgramados };
