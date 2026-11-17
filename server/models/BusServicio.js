const definir = require('../lib/modelo');
module.exports = (sequelize, { INTEGER }) =>
  definir(sequelize, 'BusServicio', 'bus_has_servicio', {
    id_bus: { type: INTEGER, primaryKey: true },
    id_servicio: { type: INTEGER, primaryKey: true },
  });
