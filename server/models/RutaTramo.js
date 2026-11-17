const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, SMALLINT }) => {
  const RutaTramo = definir(sequelize, 'RutaTramo', 'ruta_has_tramo', {
    id_ruta: { type: INTEGER, primaryKey: true },
    id_tramo: { type: INTEGER, primaryKey: true },
    posicion: { type: SMALLINT, allowNull: false },
    duracion_min: { type: INTEGER, allowNull: false },
  });
  RutaTramo.associate = (m) => { RutaTramo.belongsTo(m.Tramo, { foreignKey: 'id_tramo' }); };
  return RutaTramo;
};
