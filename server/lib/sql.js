const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

// SELECT crudo -> arreglo de filas. Parámetros nombrados con :nombre
const consultar = (sql, replacements = {}, transaction) =>
  sequelize.query(sql, { replacements, type: QueryTypes.SELECT, transaction });

// Marca como EXPIRADO los viajes PENDIENTE vencidos (el trigger libera sus asientos).
// Llamarla antes de consultar disponibilidad o reservar (o programarla con pg_cron).
const expirarViajes = async () => {
  const [r] = await consultar('SELECT reserbus.expirar_viajes() AS n');
  return r.n;
};

module.exports = { consultar, expirarViajes };
