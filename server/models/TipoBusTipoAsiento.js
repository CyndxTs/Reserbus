const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, SMALLINT }) => {
  const R = definir(sequelize, 'TipoBusTipoAsiento', 'tipo_bus_has_tipo_asiento', {
    id_tipo_bus: { type: INTEGER, primaryKey: true },
    fila_desde: { type: SMALLINT, primaryKey: true },
    fila_hasta: { type: SMALLINT, allowNull: false },
    id_tipo_asiento: { type: INTEGER, allowNull: false },
    id_empresa: { type: INTEGER, allowNull: false },
  });
  R.associate = (m) => { R.belongsTo(m.TipoAsiento, { foreignKey: 'id_tipo_asiento' }); };
  return R;
};
