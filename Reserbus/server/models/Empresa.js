module.exports = (sequelize, DataTypes) => {
  const Empresa = sequelize.define('Empresa', {
    id_empresa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    correo_electronico: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    contrasenia: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    razon_social: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    ruc: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: null
    },
    logo: {
      type: DataTypes.BLOB('medium'),
      allowNull: true,
      defaultValue: null
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'EMPRESA',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Empresa.associate = (models) => {
    Empresa.hasMany(models.Bus, {
      foreignKey: 'id_empresa',
      onDelete: 'CASCADE'
    });
    Empresa.hasMany(models.Terminal, {
      foreignKey: 'id_empresa',
      onDelete: 'CASCADE'
    });
    Empresa.hasMany(models.Viaje, {
      foreignKey: 'id_empresa',
      onDelete: 'CASCADE'
    });
  };

  return Empresa;
};
