module.exports = (sequelize, DataTypes) => {
  const Terminal = sequelize.define('Terminal', {
    id_terminal: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    pais: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    ciudad: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    latitud: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true
    },
    longitud: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true
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
    tableName: 'TERMINAL',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Terminal.associate = (models) => {
    Terminal.belongsTo(models.Empresa, {
      foreignKey: 'id_empresa',
      onDelete: 'CASCADE'
    });
    Terminal.hasMany(models.Ruta, {
      foreignKey: 'id_terminal_origen',
      as: 'rutasComoOrigen',
      onDelete: 'RESTRICT'
    });
    Terminal.hasMany(models.Ruta, {
      foreignKey: 'id_terminal_destino',
      as: 'rutasComoDestino',
      onDelete: 'RESTRICT'
    });
  };

  return Terminal;
};
