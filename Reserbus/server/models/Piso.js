module.exports = (sequelize, DataTypes) => {
  const Piso = sequelize.define('Piso', {
    id_piso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_de_piso: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: null
    },
    id_bus: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'PISO',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Piso.associate = (models) => {
    Piso.belongsTo(models.Bus, {
      foreignKey: 'id_bus',
      onDelete: 'CASCADE'
    });

    Piso.hasMany(models.Asiento, {
      foreignKey: 'id_piso',
      onDelete: 'CASCADE'
    });
  };

  return Piso;
};
