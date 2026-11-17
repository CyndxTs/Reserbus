// IMPORTS
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const { manejadorErrores, noEncontrado } = require('./lib/errores');
const app = express();
// MIDDLEWARE
app.use(express.json());
app.use(cors({ origin: (process.env.CLIENT_ORIGINS || '').split(',') }));
// ENDPOINTS
app.get('/api/salud', async (req, res) => {
  const [[{ ahora }]] = await db.sequelize.query('SELECT now() AS ahora');
  res.json({ ok: true, ahora });
});
app.use('/api/auth', require('./routes/Auth'));
app.use('/api/administradores', require('./routes/Administradores'));
app.use('/api/empresas', require('./routes/Empresas'));
app.use('/api/trabajadores', require('./routes/Trabajadores'));
app.use('/api/viajeros', require('./routes/Viajeros'));
app.use('/api', require('./routes/Ubicaciones'));            // /paises /provincias /terminales /tramos
app.use('/api/servicios', require('./routes/Servicios'));
app.use('/api/tipos-de-bus', require('./routes/TiposDeBus'));
app.use('/api/tipos-de-asiento', require('./routes/TiposDeAsiento'));
app.use('/api/tarifas', require('./routes/Tarifas'));
app.use('/api/buses', require('./routes/Buses'));
app.use('/api/rutas', require('./routes/Rutas'));
app.use('/api/planes', require('./routes/Planes'));
app.use('/api/tramos-programados', require('./routes/TramosProgramados'));
app.use('/api/busqueda', require('./routes/Busqueda'));
app.use('/api/viajes', require('./routes/Viajes'));
app.use(noEncontrado);
app.use(manejadorErrores);
// SERVER
module.exports = app;
if (require.main === module) {
  db.sequelize.authenticate().then(() => {
    app.listen(process.env.PORT || 3001, () =>
      console.log('Servidor corriendo y conectado a Supabase'));
  });
}
