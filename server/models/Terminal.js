const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING }) => {
  const Terminal = definir(sequelize, 'Terminal', 'terminal', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    id_provincia: { type: INTEGER, allowNull: false },
    nombre: { type: STRING(100), allowNull: false },
    direccion: { type: STRING(200), allowNull: false },       // el distrito va aquí
  });
  Terminal.associate = (m) => { Terminal.belongsTo(m.Provincia, { foreignKey: 'id_provincia' }); };
  return Terminal;
};
