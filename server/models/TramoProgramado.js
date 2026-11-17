const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, BIGINT, DATE }) => {
  const TP = definir(sequelize, 'TramoProgramado', 'tramo_programado', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    id_plan: { type: INTEGER, allowNull: false },
    id_bus: { type: INTEGER, allowNull: false },
    id_ruta: { type: INTEGER, allowNull: false },
    id_tramo: { type: INTEGER, allowNull: false },
    salida_estimada: { type: DATE, allowNull: false },          // UTC
    llegada_estimada: { type: DATE, allowNull: false },
    salida_real: { type: DATE },
    llegada_real: { type: DATE },
  });
  TP.associate = (m) => { TP.belongsTo(m.Tramo, { foreignKey: 'id_tramo' }); };
  return TP;
};
