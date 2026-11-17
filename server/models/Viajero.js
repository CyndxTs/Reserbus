const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING, UUID }) => {
  const Viajero = definir(sequelize, 'Viajero', 'viajero', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    auth_id: { type: UUID, allowNull: false, unique: true },
    nombres: { type: STRING(80), allowNull: false },
    apellidos: { type: STRING(80), allowNull: false },
  });
  Viajero.associate = (m) => { Viajero.hasMany(m.Viaje, { foreignKey: 'id_viajero' }); };
  return Viajero;
};
