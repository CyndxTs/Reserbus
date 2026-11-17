const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, BOOLEAN }) => {
  const Plan = definir(sequelize, 'Plan', 'plan', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    id_empresa: { type: INTEGER, allowNull: false },
    id_ruta: { type: INTEGER, allowNull: false },
    id_horario: { type: INTEGER, allowNull: false },
    activo: { type: BOOLEAN, allowNull: false, defaultValue: true },
  });
  Plan.associate = (m) => {
    Plan.belongsTo(m.Ruta, { foreignKey: 'id_ruta' });
    Plan.belongsTo(m.Horario, { foreignKey: 'id_horario' });
    Plan.belongsToMany(m.Bus, { through: m.PlanBus, as: 'buses', foreignKey: 'id_plan', otherKey: 'id_bus' });
    Plan.belongsToMany(m.Trabajador, { through: m.PlanTrabajador, as: 'choferes', foreignKey: 'id_plan', otherKey: 'id_trabajador' });
  };
  return Plan;
};
