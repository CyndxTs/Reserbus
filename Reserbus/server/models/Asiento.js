module.exports = (sequelize, DataTypes) => {
  const Asiento = sequelize.define('Asiento', {
    id_asiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ubicacion: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    tiene_ventana: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('DISPONIBLE', 'RESERVADO'),
      allowNull: false,
      defaultValue: 'DISPONIBLE'
    },
    id_piso: {
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
    tableName: 'ASIENTO',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Asiento.associate = (models) => {
    Asiento.belongsTo(models.Piso, {
      foreignKey: 'id_piso',
      onDelete: 'CASCADE'
    });

    Asiento.belongsTo(models.TipoDeAsiento, {
      foreignKey: 'id_tipo_de_asiento',
      onDelete: 'CASCADE'
    });

    Asiento.hasMany(models.Pasajero, {
      foreignKey: 'id_asiento',
      onDelete: 'CASCADE'
    });
  };

  return Asiento;
};
