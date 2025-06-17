module.exports = (sequelize, DataTypes) => {
  const Pago = sequelize.define('Pago', {
    id_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'PAGADO', 'RECHAZADO'),
      allowNull: false,
      defaultValue: 'PENDIENTE'
    },
    metodo_pago: {
      type: DataTypes.ENUM('TARJETA', 'TRANSFERENCIA'),
      allowNull: false
    },
    moneda: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'PAGO',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Pago.associate = (models) => {
    Pago.hasMany(models.Reserva, {
      foreignKey: 'id_pago',
      onDelete: 'CASCADE'
    });
  };

  return Pago;
};
