module.exports = (sequelize, DataTypes) => {
  const Administrador = sequelize.define('Administrador', {
    id_administrador: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_auth: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    correo_electronico: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    nombres: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    apellidos: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    foto_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'administrador',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  return Administrador;
};
