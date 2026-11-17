const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, DECIMAL }) => {
  const Tarifa = definir(sequelize, 'Tarifa', 'tarifa', {
    id_tipo_bus: { type: INTEGER, primaryKey: true },
    id_tramo: { type: INTEGER, primaryKey: true },
    monto_base: { type: DECIMAL(10, 2), allowNull: false },
  });
  Tarifa.associate = (m) => { Tarifa.belongsTo(m.Tramo, { foreignKey: 'id_tramo' }); };
  return Tarifa;
};
