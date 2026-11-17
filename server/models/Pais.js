const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING, SMALLINT }) => {
  const Pais = definir(sequelize, 'Pais', 'pais', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: STRING(80), allowNull: false, unique: true },
    desfase_utc_min: { type: SMALLINT, allowNull: false },   // Perú = -300
  });
  Pais.associate = (m) => { Pais.hasMany(m.Provincia, { foreignKey: 'id_pais' }); };
  return Pais;
};
