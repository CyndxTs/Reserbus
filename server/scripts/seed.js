require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const PASOS = [
  { nombre: 'schema',  archivo: 'schema.sql' , titulo: 'Estructura (DROP + CREATE de todas las tablas)' },
  { nombre: 'users',   archivo: 'users.sql'  ,   titulo: 'Usuarios (administrador, empresas, trabajadores, choferes, viajeros)' },
  { nombre: 'catalog', archivo: 'catalog.sql' ,   titulo: 'Catálogo y tramos programados' },
];
const CLAVE = '12345678';

const pedidos = process.argv.slice(2).filter(a => !a.startsWith('-'));
const desconocidos = pedidos.filter(p => !PASOS.some(s => s.nombre === p));
if (desconocidos.length) {
  console.error(`Paso(s) desconocido(s): ${desconocidos.join(', ')}. Válidos: ${PASOS.map(s => s.nombre).join(', ')}`);
  process.exit(1);
}
const aEjecutar = pedidos.length ? PASOS.filter(s => pedidos.includes(s.nombre)) : PASOS;

// Cuando se fuerzan las fechas, se inyectan como SET LOCAL justo después del BEGIN del archivo
// (así viajan en la misma transacción incluso con el pooler de Supabase en modo transacción).
function prepararSql(paso, sql) {
  const ajustes = [];
  if (process.env.SEED_DESDE) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(process.env.SEED_DESDE)) throw new Error('SEED_DESDE debe ser YYYY-MM-DD.');
    ajustes.push(`SET LOCAL reserbus.seed_desde = '${process.env.SEED_DESDE}';`);
  }
  if (process.env.SEED_MESES) {
    if (!/^\d{1,2}$/.test(process.env.SEED_MESES)) throw new Error('SEED_MESES debe ser un número entero.');
    ajustes.push(`SET LOCAL reserbus.seed_meses = '${process.env.SEED_MESES}';`);
  }
  if (paso.nombre !== 'catalog' || !ajustes.length) return sql;
  return sql.replace(/^BEGIN;/m, `BEGIN;\n${ajustes.join('\n')}`);
}

(async () => {
  const client = new Client({
    host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    // Supabase exige SSL; en una BD local pon DB_SSL=false
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
  client.on('notice', n => { if (/^(Ventana|Tramos)/.test(n.message)) console.log(`     ${n.message}`); });
  await client.connect();

  try {
    for (const [i, paso] of aEjecutar.entries()) {
      const t0 = Date.now();
      console.log(`${i + 1}/${aEjecutar.length}  ${paso.titulo}`);
      const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', paso.archivo), 'utf8');
      try {
        await client.query(prepararSql(paso, sql));
      } catch (e) {
        await client.query('ROLLBACK').catch(() => {});
        console.error(`\n✖ Falló ${paso.archivo}: ${e.message}${e.position ? ` (posición ${e.position})` : ''}`);
        if (e.detail) console.error(`  ${e.detail}`);
        console.error('  Los pasos siguientes NO se ejecutaron.');
        process.exitCode = 1;
        return;
      }
      console.log(`     ok (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    }

    if (aEjecutar.some(s => s.nombre === 'users')) {
      console.log(`\nContraseña de todas las cuentas: ${CLAVE}`);
      const { rows } = await client.query(
        `SELECT email FROM auth.users WHERE raw_user_meta_data ->> 'seed' = 'reserbus' AND email IS NOT NULL ORDER BY email`);
      rows.forEach(r => console.log(`  ${r.email}`));
      console.log('  (empresas y choferes no tienen cuenta de acceso)');
    }
  } finally {
    await client.end();
  }
})().catch(e => { console.error('Seed falló:', e.message); process.exit(1); });
