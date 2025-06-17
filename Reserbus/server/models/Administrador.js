module.exports = (sequelize, DataTypes) => {
  const Administrador = sequelize.define('Administrador', {
    id_administrador: {
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
    nombres: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    apellidos: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    foto: {
      type: DataTypes.BLOB('medium'),
      allowNull: true,
      defaultValue: null
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null
    },
    esta_habilitado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'ADMINISTRADOR',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  return Administrador;
};
