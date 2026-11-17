const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING }) =>
  definir(sequelize, 'Servicio', 'servicio', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: STRING(60), allowNull: false, unique: true },
  });
