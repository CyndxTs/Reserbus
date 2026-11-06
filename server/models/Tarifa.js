module.exports = (sequelize, DataTypes) => {
  const Tarifa = sequelize.define('Tarifa', {
    id_tarifa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    detalle: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    id_viaje: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tipo_de_asiento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'tarifa',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Tarifa.associate = (models) => {
    Tarifa.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      onDelete: 'CASCADE'
    });
    Tarifa.belongsTo(models.TipoDeAsiento, {
      foreignKey: 'id_tipo_de_asiento',
      onDelete: 'CASCADE'
    });
    Tarifa.hasMany(models.Boleto, {
      foreignKey: 'id_tarifa',
      onDelete: 'RESTRICT'
    });
  };

  return Tarifa;
};
