module.exports = (sequelize, DataTypes) => {
  const Ruta = sequelize.define('Ruta', {
    id_ruta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    distancia_de_recorrido: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false
    },
    id_terminal_origen: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_terminal_destino: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    tableName: 'RUTA',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Ruta.associate = (models) => {
    Ruta.belongsTo(models.Terminal, {
      foreignKey: 'id_terminal_origen',
      as: 'terminalOrigen',
      onDelete: 'CASCADE'
    });
    Ruta.belongsTo(models.Terminal, {
      foreignKey: 'id_terminal_destino',
      as: 'terminalDestino',
      onDelete: 'CASCADE'
    });
    Ruta.belongsTo(models.Empresa, {
      foreignKey: 'id_empresa',
      onDelete: 'CASCADE'
    });
    Ruta.hasMany(models.Viaje, {
      foreignKey: 'id_ruta',
      onDelete: 'CASCADE'
    });
  };

  return Ruta;
};
