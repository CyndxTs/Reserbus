const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING, UUID, BOOLEAN }) => {
  const Trabajador = definir(sequelize, 'Trabajador', 'trabajador', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    auth_id: { type: UUID, allowNull: false, unique: true },
    id_empresa: { type: INTEGER, allowNull: false },
    tipo: { type: STRING, allowNull: false, validate: { isIn: [['CHOFER', 'ADMINISTRATIVO']] } },
    nombres: { type: STRING(80), allowNull: false },
    apellidos: { type: STRING(80), allowNull: false },
    activo: { type: BOOLEAN, allowNull: false, defaultValue: true },
  });
  Trabajador.associate = (m) => { Trabajador.belongsTo(m.Empresa, { foreignKey: 'id_empresa' }); };
  return Trabajador;
};
