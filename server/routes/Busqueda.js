const express = require('express');
const router = express.Router();
const { Terminal } = require('../models');
const { buscar } = require('../services/busqueda');

const ids = (v) => String(v || '').split(',').map(s => s.trim()).filter(Boolean).map(Number).filter(Number.isInteger);

// Si se pasa una provincia, se usan todos sus terminales ("terminales de Arequipa")
async function terminales(directo, provincia) {
  const lista = ids(directo);
  if (provincia) {
    const t = await Terminal.findAll({ where: { id_provincia: ids(provincia) }, attributes: ['id'] });
    lista.push(...t.map(x => x.id));
  }
  return [...new Set(lista)];
}

// GET /api/busqueda?origen=<id_terminal>&destino=<id_terminal>&fecha=YYYY-MM-DD
//   opcionales: origen_provincia, destino_provincia, pasajeros=1, max_trasbordos=2,
//               trasbordo_min=30, orden=llegada|precio|trasbordos, limite=20
// "fecha" es el día LOCAL del terminal de origen. No muestra planes completos sino las
// secciones de planes que calzan, combinando empresas distintas.
router.get('/', async (req, res) => {
  const q = req.query;
  const resultados = await buscar({
    origenes: await terminales(q.origen, q.origen_provincia),
    destinos: await terminales(q.destino, q.destino_provincia),
    fecha: q.fecha,
    pasajeros: Math.max(Number(q.pasajeros) || 1, 1),
    maxTrasbordos: q.max_trasbordos !== undefined ? Math.min(Number(q.max_trasbordos), 3) : 2,
    ...(q.trasbordo_min !== undefined && { trasbordoMin: Number(q.trasbordo_min) }),
    orden: q.orden,
    limite: Math.min(Number(q.limite) || 20, 50),
  });
  res.json({ total: resultados.length, resultados });
});

module.exports = router;
