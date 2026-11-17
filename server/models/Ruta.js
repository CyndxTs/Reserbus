const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING }) => {
  const Ruta = definir(sequelize, 'Ruta', 'ruta', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    id_empresa: { type: INTEGER, allowNull: false },
    nombre: { type: STRING(100), allowNull: false },
  });
  Ruta.associate = (m) => {
    Ruta.hasMany(m.RutaTramo, { foreignKey: 'id_ruta', as: 'tramos' });
    Ruta.hasMany(m.Horario, { foreignKey: 'id_ruta', as: 'horarios' });
  };
  return Ruta;
};
