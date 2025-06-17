module.exports = (sequelize, DataTypes) => {
  const TipoDeAsiento = sequelize.define('TipoDeAsiento', {
    id_tipo_de_asiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(120),
      allowNull: true,
      defaultValue: null
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'TIPO_DE_ASIENTO',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  TipoDeAsiento.associate = (models) => {
    TipoDeAsiento.hasMany(models.Asiento, {
      foreignKey: 'id_tipo_de_asiento',
      onDelete: 'RESTRICT'
    });

    TipoDeAsiento.hasMany(models.Tarifa, {
      foreignKey: 'id_tipo_de_asiento',
      onDelete: 'RESTRICT'
    });
  };

  return TipoDeAsiento;
};
