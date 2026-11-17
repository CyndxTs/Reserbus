const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING, BOOLEAN }) => {
  const Bus = definir(sequelize, 'Bus', 'bus', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    id_empresa: { type: INTEGER, allowNull: false },
    id_tipo_bus: { type: INTEGER, allowNull: false },
    placa: { type: STRING(10), allowNull: false, unique: true },
    activo: { type: BOOLEAN, allowNull: false, defaultValue: true },
  });
  Bus.associate = (m) => {
    Bus.belongsTo(m.TipoBus, { foreignKey: 'id_tipo_bus' });
    Bus.belongsTo(m.Empresa, { foreignKey: 'id_empresa' });
    Bus.belongsToMany(m.Servicio, { through: m.BusServicio, as: 'servicios', foreignKey: 'id_bus', otherKey: 'id_servicio' });
  };
  return Bus;
};
