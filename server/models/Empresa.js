const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING, BOOLEAN }) => {
  const Empresa = definir(sequelize, 'Empresa', 'empresa', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: STRING(100), allowNull: false, unique: true },
    activa: { type: BOOLEAN, allowNull: false, defaultValue: true },
  });
  Empresa.associate = (m) => {
    Empresa.hasMany(m.Trabajador, { foreignKey: 'id_empresa' });
    Empresa.hasMany(m.Bus, { foreignKey: 'id_empresa' });
  };
  return Empresa;
};
