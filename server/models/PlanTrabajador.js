const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING }) =>
  definir(sequelize, 'PlanTrabajador', 'plan_has_trabajador', {
    id_plan: { type: INTEGER, primaryKey: true },
    id_trabajador: { type: INTEGER, primaryKey: true },
    id_empresa: { type: INTEGER, allowNull: false },
    tipo: { type: STRING, allowNull: false, defaultValue: 'CHOFER' },
  });
