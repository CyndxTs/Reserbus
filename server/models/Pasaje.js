const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, BIGINT, SMALLINT, STRING, DECIMAL, BOOLEAN }) =>
  definir(sequelize, 'Pasaje', 'pasaje', {
    id_pasajero: { type: INTEGER, primaryKey: true },
    id_tramo_programado: { type: BIGINT, primaryKey: true },
    id_viaje: { type: INTEGER, allowNull: false },
    fila: { type: SMALLINT, allowNull: false },
    columna: { type: STRING(1), allowNull: false },
    codigo_asiento: { type: STRING(4) },                        // GENERADA por la BD (fila + columna): no escribir
    id_tipo_asiento: { type: INTEGER, allowNull: false },
    precio: { type: DECIMAL(10, 2), allowNull: false },         // congelado al reservar
    vigente: { type: BOOLEAN, allowNull: false, defaultValue: true },
  });
