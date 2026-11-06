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
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'PENDIENTE',
      validate: { isIn: [['PENDIENTE', 'PAGADO', 'RECHAZADO']] }
    },
    metodo_pago: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [['TARJETA', 'TRANSFERENCIA']] }
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
    tableName: 'pago',
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
