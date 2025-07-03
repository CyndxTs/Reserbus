module.exports = (sequelize, DataTypes) => {
  const Servicio = sequelize.define('Servicio', {
    id_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(60),
      allowNull: true,
      defaultValue: null
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'SERVICIO',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Servicio.associate = (models) => {
    Servicio.belongsToMany(models.Bus, {
      through: models.BusServicio,
      as: 'buses',
      foreignKey: 'id_servicio',
      otherKey: 'id_bus',
      onDelete: 'CASCADE'
    });
  };

  return Servicio;
};
