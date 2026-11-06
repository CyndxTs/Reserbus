// IMPORTS
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const app = express();
// MIDDLEWARE
app.use(express.json());
app.use(cors({ origin: (process.env.CLIENT_ORIGINS || '').split(',') }));
// ENDPOINTS
const administradoresRouter = require('./routes/Administradores');
app.use("/api/administradores", administradoresRouter);
const asientosRouter = require('./routes/Asientos');
app.use("/api/asientos", asientosRouter);
const busesRouter = require('./routes/Buses');
app.use("/api/buses", busesRouter);
const busesServiciosRouter = require('./routes/BusesServicios');
app.use("/api/buses-servicios", busesServiciosRouter);
const empresasRouter = require('./routes/Empresas');
app.use("/api/empresas", empresasRouter);
const pagosRouter = require('./routes/Pagos');
app.use("/api/pagos", pagosRouter);
const pasajerosRouter = require('./routes/Pasajeros');
app.use("/api/pasajeros", pasajerosRouter);
const pisosRouter = require('./routes/Pisos');
app.use("/api/pisos", pisosRouter);
const reservasRouter = require('./routes/Reservas');
app.use("/api/reservas", reservasRouter);
const rutasRouter = require('./routes/Rutas');
app.use("/api/rutas", rutasRouter);
const serviciosRouter = require('./routes/Servicios');
app.use("/api/servicios", serviciosRouter);
const tarifasRouter = require('./routes/Tarifas');
app.use("/api/tarifas", tarifasRouter);
const terminalesRouter = require('./routes/Terminales');
app.use("/api/terminales", terminalesRouter);
const tiposDeAsientoRouter = require('./routes/TiposDeAsiento');
app.use("/api/tipos-de-asiento", tiposDeAsientoRouter);
const viajesRouter = require('./routes/Viajes');
app.use("/api/viajes", viajesRouter);
const viajerosRouter = require('./routes/Viajeros');
app.use("/api/viajeros", viajerosRouter);
const authRouter = require('./routes/Auth');
app.use("/api/auth", authRouter);
// SERVER
module.exports = app;
if (require.main === module) {
  db.sequelize.authenticate().then(() => {
    app.listen(process.env.PORT || 3001, () =>
      console.log('Servidor corriendo y conectado a Supabase'));
  });
}
