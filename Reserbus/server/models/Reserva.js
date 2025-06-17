module.exports = (sequelize, DataTypes) => {
  const Reserva = sequelize.define('Reserva', {
    id_reserva: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    estado: {
      type: DataTypes.ENUM('PAGO_PENDIENTE', 'PAGADA', 'COMPLETADA', 'CANCELADA'),
      allowNull: false,
      defaultValue: 'PAGO_PENDIENTE'
    },
    id_viajero: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_viaje_ida: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_viaje_vuelta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    id_pago: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'RESERVA',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Reserva.associate = (models) => {
    Reserva.belongsTo(models.Viajero, {
      foreignKey: 'id_viajero',
      onDelete: 'CASCADE'
    });
    Reserva.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje_ida',
      as: 'viajeIda',
      onDelete: 'CASCADE'
    });
    Reserva.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje_vuelta',
      as: 'viajeVuelta',
      onDelete: 'SET NULL'
    });
    Reserva.belongsTo(models.Pago, {
      foreignKey: 'id_pago',
      onDelete: 'SET NULL'
    });
    Reserva.hasMany(models.Pasajero, {
      foreignKey: 'id_reserva',
      onDelete: 'CASCADE'
    });
  };

  return Reserva;
};
