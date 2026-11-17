// Express 5 reenvía solo las promesas rechazadas de los handlers async al manejador de errores,
// así que en las rutas basta con `throw new ErrorHttp(...)`.
class ErrorHttp extends Error {
  constructor(status, mensaje, extra = {}) {
    super(mensaje);
    this.status = status;
    this.extra = extra;
  }
}

// Valida que vengan los campos obligatorios del body
function requerir(obj = {}, campos) {
  const faltan = campos.filter(c => obj[c] === undefined || obj[c] === null || obj[c] === '');
  if (faltan.length) throw new ErrorHttp(400, `Faltan campos obligatorios: ${faltan.join(', ')}`);
}

const MENSAJES_CONSTRAINT = {
  uq_pasaje_asiento_vigente: 'Uno de los asientos ya está ocupado en ese tramo.',
};

function manejadorErrores(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err instanceof ErrorHttp) return res.status(err.status).json({ error: err.message, ...err.extra });

  const pg = err.parent || err.original || {};
  if (err.code === 'email_exists') return res.status(409).json({ error: 'Ese correo ya está registrado.' });
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: MENSAJES_CONSTRAINT[pg.constraint] || 'Ya existe un registro con esos datos.', detalle: pg.detail });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({ error: 'Referencia inválida o el registro tiene dependencias (¿pertenece a otra empresa?).', detalle: pg.detail });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors.map(e => e.message).join('; ') });
  }
  if (['23514', '22P02', '22007', '22008', '23502'].includes(pg.code)) {   // CHECK, tipo inválido, fecha inválida, NOT NULL
    return res.status(400).json({ error: 'Datos inválidos.', detalle: pg.detail || pg.message });
  }
  console.error(err);
  res.status(500).json({ error: `Error interno en el servidor. ${err.message}` });
}

const noEncontrado = (req, res) => res.status(404).json({ error: 'Ruta no encontrada.' });

module.exports = { ErrorHttp, requerir, manejadorErrores, noEncontrado };

// Busca un registro por id verificando que sea de la empresa (404 si no existe o es de otra)
async function propio(Modelo, id, idEmpresa, opciones = {}) {
  const r = await Modelo.findOne({ where: { id, id_empresa: idEmpresa }, ...opciones });
  if (!r) throw new ErrorHttp(404, `${Modelo.name} no encontrado.`);
  return r;
}
module.exports.propio = propio;
