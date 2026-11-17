const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER }) => {
  const Tramo = definir(sequelize, 'Tramo', 'tramo', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    id_terminal_origen: { type: INTEGER, allowNull: false },
    id_terminal_destino: { type: INTEGER, allowNull: false },
  });
  Tramo.associate = (m) => {
    Tramo.belongsTo(m.Terminal, { foreignKey: 'id_terminal_origen', as: 'origen' });
    Tramo.belongsTo(m.Terminal, { foreignKey: 'id_terminal_destino', as: 'destino' });
  };
  return Tramo;
};
