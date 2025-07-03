module.exports = (sequelize, DataTypes) => {
  const Viaje = sequelize.define('Viaje', {
    id_viaje: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    estado: {
      type: DataTypes.ENUM('PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'RETRASADO', 'CANCELADO'),
      allowNull: false,
      defaultValue: 'PROGRAMADO'
    },
    instante_abordaje: {
      type: DataTypes.DATE,
      allowNull: false
    },
    instante_partida: {
      type: DataTypes.DATE,
      allowNull: true
    },
    instante_llegada: {
      type: DataTypes.DATE,
      allowNull: true
    },
    id_ruta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_bus: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    duracion_estimada_minutos:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    esta_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'VIAJE',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });

  Viaje.associate = (models) => {
    Viaje.belongsTo(models.Ruta, {
      foreignKey: 'id_ruta',
      onDelete: 'RESTRICT'
    });
    Viaje.belongsTo(models.Bus, {
      foreignKey: 'id_bus',
      onDelete: 'RESTRICT'
    });
    Viaje.belongsTo(models.Empresa, {
      foreignKey: 'id_empresa',
      onDelete: 'RESTRICT'
    });
    Viaje.hasMany(models.Reserva, {
      foreignKey: 'id_viaje_ida',
      as: 'reservasIda'
    });
    Viaje.hasMany(models.Reserva, {
      foreignKey: 'id_viaje_vuelta',
      as: 'reservasVuelta'
    });
    Viaje.hasMany(models.Tarifa, {
      foreignKey: 'id_viaje'
    });
  };

  return Viaje;
};
