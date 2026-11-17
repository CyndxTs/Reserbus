const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER, STRING, DATE }) => {
  const Viaje = definir(sequelize, 'Viaje', 'viaje', {      // Viaje = reserva
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    id_viajero: { type: INTEGER, allowNull: false },
    estado: { type: STRING, allowNull: false, defaultValue: 'PENDIENTE',
              validate: { isIn: [['PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'EXPIRADO']] } },
    creado_en: { type: DATE },
    vence_en: { type: DATE },
    cancelado_en: { type: DATE },
  });
  Viaje.associate = (m) => {
    Viaje.belongsTo(m.Viajero, { foreignKey: 'id_viajero' });
    Viaje.hasMany(m.Pasajero, { foreignKey: 'id_viaje' });
  };
  return Viaje;
};
