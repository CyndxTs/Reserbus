const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING }) => {
  const Provincia = definir(sequelize, 'Provincia', 'provincia', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    id_pais: { type: INTEGER, allowNull: false },
    nombre: { type: STRING(80), allowNull: false },
  });
  Provincia.associate = (m) => {
    Provincia.belongsTo(m.Pais, { foreignKey: 'id_pais' });
    Provincia.hasMany(m.Terminal, { foreignKey: 'id_provincia' });
  };
  return Provincia;
};
