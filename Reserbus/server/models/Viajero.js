module.exports = (sequelize, DataTypes) => {
  const Viajero = sequelize.define('Viajero', {
    id_viajero: {
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
    telefono: {
      type: DataTypes.STRING(20),
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
    tableName: 'VIAJERO',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Viajero.associate = (models) => {
    Viajero.hasMany(models.Reserva, {
      foreignKey: 'id_viajero',
      onDelete: 'RESTRICT'
    });
  };

  return Viajero;
};
