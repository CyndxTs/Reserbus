module.exports = (sequelize, DataTypes) => {
  const Bus = sequelize.define('Bus', {
    id_bus: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    placa: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    marca: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    modelo: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    cantidad_pisos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'BUS',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Bus.associate = (models) => {
    Bus.belongsTo(models.Empresa, {
      foreignKey: 'id_empresa',
      onDelete: 'CASCADE'
    });

    Bus.hasMany(models.Piso, {
      foreignKey: 'id_bus',
      onDelete: 'CASCADE'
    });

    Bus.hasMany(models.Viaje, {
      foreignKey: 'id_bus',
      onDelete: 'CASCADE'
    });

    Bus.belongsToMany(models.Servicio, {
      through: models.BusServicio,
      as: 'servicios',
      foreignKey: 'id_bus',
      otherKey: 'id_servicio',
      onDelete: 'CASCADE'
    });
  };

  return Bus;
};
