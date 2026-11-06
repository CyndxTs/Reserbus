module.exports = (sequelize, DataTypes) => {
  const Pasajero = sequelize.define('Pasajero', {
    id_pasajero: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo_documento: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [['DNI', 'PASAPORTE', 'CEDULA', 'CARNET_EXTRANJERIA', 'OTRO']] }
    },
    numero_documento: {
      type: DataTypes.STRING(30),
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
    correo_electronico: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    id_reserva: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'pasajero',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Pasajero.associate = (models) => {
    Pasajero.belongsTo(models.Reserva, {
      foreignKey: 'id_reserva',
      onDelete: 'CASCADE'
    });
    Pasajero.hasMany(models.Boleto, {
      foreignKey: 'id_pasajero',
      onDelete: 'CASCADE'
    });
  };

  return Pasajero;
};
