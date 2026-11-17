const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING, DECIMAL }) =>
  definir(sequelize, 'TipoAsiento', 'tipo_asiento', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    id_empresa: { type: INTEGER, allowNull: false },
    nombre: { type: STRING(60), allowNull: false },
    tarifa_extra: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  });
