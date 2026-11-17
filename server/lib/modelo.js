// Atajo para definir modelos del schema "reserbus" (la BD se crea con reserbus.sql; NO usar sequelize.sync()).
module.exports = (sequelize, nombre, tabla, atributos, opciones = {}) =>
  sequelize.define(nombre, atributos, {
    tableName: tabla,
    schema: 'reserbus',
    freezeTableName: true,
    timestamps: false,
    ...opciones,
  });
