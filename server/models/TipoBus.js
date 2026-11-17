const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING, SMALLINT }) => {
  const TipoBus = definir(sequelize, 'TipoBus', 'tipo_bus', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    id_empresa: { type: INTEGER, allowNull: false },
    nombre: { type: STRING(60), allowNull: false },
    filas: { type: SMALLINT, allowNull: false },
    asientos_por_fila: { type: SMALLINT, allowNull: false },   // par: mitad a cada lado del pasillo
    total_asientos: { type: INTEGER },                          // GENERADA por la BD: no escribir
  });
  TipoBus.associate = (m) => {
    TipoBus.hasMany(m.TipoBusTipoAsiento, { foreignKey: 'id_tipo_bus', as: 'rangos' });
    TipoBus.hasMany(m.Bus, { foreignKey: 'id_tipo_bus' });
  };
  return TipoBus;
};
