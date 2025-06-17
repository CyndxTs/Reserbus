module.exports = (sequelize, DataTypes) => {
  const BusServicio = sequelize.define('BusServicio', {
    id_bus: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    id_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    tableName: 'BUS_SERVICIO',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  BusServicio.associate = (models) => {
    BusServicio.belongsTo(models.Bus, {
      foreignKey: 'id_bus',
      onDelete: 'CASCADE'
    });

    BusServicio.belongsTo(models.Servicio, {
      foreignKey: 'id_servicio',
      onDelete: 'CASCADE'
    });
  };

  return BusServicio;
};
