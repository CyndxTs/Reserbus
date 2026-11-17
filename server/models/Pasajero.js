const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING }) =>
  definir(sequelize, 'Pasajero', 'pasajero', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    id_viaje: { type: INTEGER, allowNull: false },
    nombres: { type: STRING(80), allowNull: false },
    apellidos: { type: STRING(80), allowNull: false },
    tipo_documento: { type: STRING, allowNull: false, validate: { isIn: [['DNI', 'CE', 'PASAPORTE']] } },
    numero_documento: { type: STRING(20), allowNull: false },
  });
