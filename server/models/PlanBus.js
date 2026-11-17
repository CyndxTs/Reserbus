const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER }) =>
  definir(sequelize, 'PlanBus', 'plan_has_bus', {
    id_plan: { type: INTEGER, primaryKey: true },
    id_bus: { type: INTEGER, primaryKey: true },
    id_empresa: { type: INTEGER, allowNull: false },
  });
