const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, TIME }) =>
  definir(sequelize, 'Horario', 'horario', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    id_ruta: { type: INTEGER, allowNull: false },
    hora_salida: { type: TIME, allowNull: false },             // UTC
  });
