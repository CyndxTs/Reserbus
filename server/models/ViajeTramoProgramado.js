const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, BIGINT, SMALLINT }) =>
  definir(sequelize, 'ViajeTramoProgramado', 'viaje_has_tramo_programado', {
    id_viaje: { type: INTEGER, primaryKey: true },
    id_tramo_programado: { type: BIGINT, primaryKey: true },
    posicion: { type: SMALLINT, allowNull: false },
  });
