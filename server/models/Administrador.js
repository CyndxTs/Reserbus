const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING, UUID }) =>
  definir(sequelize, 'Administrador', 'administrador', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    auth_id: { type: UUID, allowNull: false, unique: true },
    nombres: { type: STRING(80), allowNull: false },
    apellidos: { type: STRING(80), allowNull: false },
  });
