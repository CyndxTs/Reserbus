const express = require('express');
const router = express.Router();
const { requireAuth, requireRol } = require('../middleware/auth');
const { ErrorHttp } = require('../lib/errores');
const { expirarViajes } = require('../lib/sql');
const { crearViaje, obtenerViaje, listarViajesDe, confirmarViaje, cancelarViaje } = require('../services/viajes');

// Viaje = RESERVA. Nace PENDIENTE (hold de 10 min), luego CONFIRMADO / CANCELADO / EXPIRADO.
router.use(requireAuth);

// Crear reserva (hold). Body:
// { tramos_programados: [id, ...],  // en orden; sale de /api/busqueda
//   pasajeros: [{ nombres, apellidos, tipo_documento, numero_documento, asientos: { "<id_tramo_programado>": "12A" } }] }
router.post('/', requireRol('VIAJERO'), async (req, res) => {
  res.status(201).json(await crearViaje(req.auth.perfil.id, req.body));
});

router.get('/mios', requireRol('VIAJERO'), async (req, res) => {
  await expirarViajes();
  res.json(await listarViajesDe(req.auth.perfil.id));
});

router.get('/:id', requireRol('VIAJERO', 'ADMIN'), async (req, res) => {
  await expirarViajes();
  const viaje = await obtenerViaje(Number(req.params.id));
  if (!viaje || (req.auth.rol === 'VIAJERO' && viaje.id_viajero !== req.auth.perfil.id)) throw new ErrorHttp(404, 'Viaje no encontrado.');
  res.json(viaje);
});

router.post('/:id/confirmar', requireRol('VIAJERO'), async (req, res) => {
  res.json(await confirmarViaje(Number(req.params.id), req.auth.perfil.id));
});

router.post('/:id/cancelar', requireRol('VIAJERO'), async (req, res) => {
  res.json(await cancelarViaje(Number(req.params.id), req.auth.perfil.id));
});

module.exports = router;
