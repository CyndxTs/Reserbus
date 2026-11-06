module.exports = (sequelize, DataTypes) => {
  const Boleto = sequelize.define('Boleto', {
    id_boleto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_pasajero: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_viaje: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_asiento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tarifa: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'boleto',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Boleto.associate = (models) => {
    Boleto.belongsTo(models.Pasajero, { foreignKey: 'id_pasajero', onDelete: 'CASCADE' });
    Boleto.belongsTo(models.Viaje,    { foreignKey: 'id_viaje',    onDelete: 'RESTRICT' });
    Boleto.belongsTo(models.Asiento,  { foreignKey: 'id_asiento',  onDelete: 'RESTRICT' });
    Boleto.belongsTo(models.Tarifa,   { foreignKey: 'id_tarifa',   onDelete: 'RESTRICT' });
  };

  return Boleto;
};
