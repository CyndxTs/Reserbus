// Prueba de humo de punta a punta, SIN front. Requiere:
//   1) el server corriendo (npm start)   2) haber corrido el seed (npm run seed)
// Uso:  npm run prueba      (BASE_URL opcional, por defecto http://localhost:3001)
// Usa los usuarios del seed, hace login contra Supabase y recorre auth, búsqueda con trasbordo entre
// empresas, reserva con hold, doble venta, confirmar, cancelar, expiración y permisos.
require('dotenv').config();
const db = require('../models');

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const CLAVE = 'Reserbus123!';
let ok = 0, fallos = 0;

const chequear = (nombre, cond, extra = '') => {
  cond ? ok++ : fallos++;
  console.log(`${cond ? '  ✔' : '  ✖'} ${nombre}${cond ? '' : '  ' + extra}`);
};

async function api(metodo, ruta, { token, body } = {}) {
  const r = await fetch(BASE + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const texto = await r.text();
  let json; try { json = JSON.parse(texto); } catch { json = texto; }
  return { status: r.status, json };
}

async function login(correo) {
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: correo, password: CLAVE }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`Login falló para ${correo}: ${j.msg || j.error_description || JSON.stringify(j)}`);
  return j.access_token;
}

const titulo = (t) => console.log(`\n${t}`);
const diaLima = (mas = 1) => new Date(Date.now() - 5 * 3600e3 + mas * 86400e3).toISOString().slice(0, 10);

(async () => {
  titulo('Salud y login');
  chequear('GET /api/salud', (await api('GET', '/api/salud')).status === 200);
  const t = {};
  for (const [k, c] of Object.entries({ admin: 'admin@example.com', andes: 'andes.admin@example.com', chofer: 'chofer.andes@example.com', viajero: 'viajero@example.com' })) {
    t[k] = await login(c);
  }
  chequear('login de 4 roles', Object.values(t).every(Boolean));

  titulo('Auth y permisos');
  const roles = {};
  for (const k of Object.keys(t)) roles[k] = (await api('GET', '/api/auth/me', { token: t[k] })).json.rol;
  chequear('/me devuelve el rol de cada perfil', roles.admin === 'ADMIN' && roles.andes === 'EMPRESA' && roles.chofer === 'CHOFER' && roles.viajero === 'VIAJERO', JSON.stringify(roles));
  chequear('sin token -> 401', (await api('GET', '/api/auth/me')).status === 401);
  chequear('viajero no puede listar buses -> 403', (await api('GET', '/api/buses', { token: t.viajero })).status === 403);
  chequear('viajero no puede listar empresas -> 403', (await api('GET', '/api/empresas', { token: t.viajero })).status === 403);
  chequear('admin lista empresas', (await api('GET', '/api/empresas', { token: t.admin })).json.length >= 2);

  titulo('Catálogo público');
  const terminales = (await api('GET', '/api/terminales')).json;
  chequear('4 terminales', terminales.length >= 4, JSON.stringify(terminales).slice(0, 200));
  const lima = terminales.find(x => x.nombre === 'Terminal Lima').id, puno = terminales.find(x => x.nombre === 'Terminal Puno').id;
  const cusco = terminales.find(x => x.nombre === 'Terminal Cusco').id;

  titulo('Búsqueda Lima -> Puno (conexión entre empresas)');
  const fecha = diaLima(1);
  const b = await api('GET', `/api/busqueda?origen=${lima}&destino=${puno}&fecha=${fecha}`);
  const it = b.json.resultados?.[0];
  chequear('hay resultados', b.status === 200 && b.json.total >= 1, JSON.stringify(b.json).slice(0, 200));
  chequear('1 trasbordo con 2 secciones de empresas distintas', it && it.trasbordos === 1 && it.secciones.length === 2 && it.secciones[0].empresa !== it.secciones[1].empresa);
  chequear('precio base 80 + 35 = 115', it && it.precio_base === 115, it && String(it.precio_base));
  const porProvincia = await api('GET', `/api/busqueda?origen_provincia=${terminales.find(x => x.nombre === 'Terminal Lima').id_provincia}&destino=${puno}&fecha=${fecha}`);
  chequear('buscar por provincia de origen también funciona', porProvincia.json.total >= 1);
  const lc = await api('GET', `/api/busqueda?origen=${lima}&destino=${cusco}&fecha=${fecha}&orden=trasbordos`);
  chequear('Lima -> Cusco: el 1.º es directo (mismo bus, 0 trasbordos)', lc.json.resultados?.[0]?.trasbordos === 0 && lc.json.resultados[0].secciones.length === 1);
  const tramos = it.tramos_programados;                                   // [Lima->Arequipa (Andes), Arequipa->Puno (Altiplano)]

  titulo('Mapa de asientos');
  const mapa = (await api('GET', `/api/tramos-programados/${tramos[0]}/asientos`)).json;
  chequear('bus Andes: 10 filas x 4 = 40, columnas A-D', mapa.total_asientos === 40 && mapa.columnas.join('') === 'ABCD' && mapa.libres === 40);
  chequear('rangos: filas 1-3 Cama, 4-10 Semicama', mapa.rangos.length === 2 && mapa.rangos[0].nombre === 'Cama');

  titulo('Reserva con hold de 10 min');
  const cuerpo = (a1, a2, doc = ['11111111', '22222222']) => ({
    tramos_programados: tramos,
    pasajeros: [
      { nombres: 'Ana', apellidos: 'Prueba', tipo_documento: 'DNI', numero_documento: doc[0], asientos: { [tramos[0]]: a1, [tramos[1]]: a1 } },
      { nombres: 'Beto', apellidos: 'Prueba', tipo_documento: 'DNI', numero_documento: doc[1], asientos: { [tramos[0]]: a2, [tramos[1]]: a2 } },
    ],
  });
  const v = await api('POST', '/api/viajes', { token: t.viajero, body: cuerpo('1A', '5C') });
  chequear('crea viaje PENDIENTE (201)', v.status === 201 && v.json.estado === 'PENDIENTE', JSON.stringify(v.json).slice(0, 300));
  const minutos = (new Date(v.json.vence_en) - new Date(v.json.creado_en)) / 60000;
  chequear('hold de 10 minutos', Math.round(minutos) === 10, String(minutos));
  chequear('total congelado = (80+40 + 35) + (80+0 + 35) = 270', v.json.total === 270, String(v.json.total));
  chequear('1 viaje, 2 patas, 2 pasajeros, 4 pasajes', v.json.tramos.length === 2 && v.json.pasajeros.length === 2 && v.json.pasajeros.flatMap(p => p.asientos).length === 4);
  const ocupados = (await api('GET', `/api/tramos-programados/${tramos[0]}/asientos`)).json.ocupados;
  chequear('asientos 1A y 5C quedan ocupados', ocupados.includes('1A') && ocupados.includes('5C'), ocupados.join(','));
  const doble = await api('POST', '/api/viajes', { token: t.viajero, body: cuerpo('1A', '6D', ['33333333', '44444444']) });
  chequear('doble venta del 1A -> 409', doble.status === 409, JSON.stringify(doble.json));
  chequear('la doble venta no dejó basura (6D sigue libre)', !(await api('GET', `/api/tramos-programados/${tramos[0]}/asientos`)).json.ocupados.includes('6D'));
  const mismoDoc = await api('POST', '/api/viajes', { token: t.viajero, body: cuerpo('2A', '2B', ['55555555', '55555555']) });
  chequear('mismo documento repetido en un viaje -> 409', mismoDoc.status === 409, JSON.stringify(mismoDoc.json));

  titulo('Validaciones de la app');
  const malAsiento = await api('POST', '/api/viajes', { token: t.viajero, body: cuerpo('99Z', '2B', ['66666666', '77777777']) });
  chequear('asiento inexistente (99Z) -> 400', malAsiento.status === 400, JSON.stringify(malAsiento.json));
  const cc = await api('POST', '/api/viajes', { token: t.viajero, body: { ...cuerpo('2A', '2B', ['88888888', '99999999']), tramos_programados: [tramos[1], tramos[0]] } });
  chequear('tramos que no conectan -> 400', cc.status === 400, JSON.stringify(cc.json));
  const dup = await api('POST', '/api/viajes', { token: t.viajero, body: cuerpo('2A', '2A', ['12121212', '34343434']) });
  chequear('mismo asiento para 2 pasajeros -> 400', dup.status === 400, JSON.stringify(dup.json));

  titulo('Confirmar y cancelar');
  const conf = await api('POST', `/api/viajes/${v.json.id}/confirmar`, { token: t.viajero });
  chequear('confirmar -> CONFIRMADO', conf.status === 200 && conf.json.estado === 'CONFIRMADO', JSON.stringify(conf.json).slice(0, 200));
  const canc = await api('POST', `/api/viajes/${v.json.id}/cancelar`, { token: t.viajero });
  chequear('cancelar -> CANCELADO con cancelado_en', canc.json.estado === 'CANCELADO' && !!canc.json.cancelado_en);
  chequear('cancelar libera los asientos (pasajes no vigentes)', canc.json.pasajeros.flatMap(p => p.asientos).every(a => a.vigente === false));
  chequear('el 1A vuelve a estar libre', !(await api('GET', `/api/tramos-programados/${tramos[0]}/asientos`)).json.ocupados.includes('1A'));
  chequear('no se puede confirmar uno cancelado -> 409', (await api('POST', `/api/viajes/${v.json.id}/confirmar`, { token: t.viajero })).status === 409);

  titulo('Expiración del hold');
  const v2 = await api('POST', '/api/viajes', { token: t.viajero, body: cuerpo('1A', '1B', ['10101010', '20202020']) });
  await db.sequelize.query(`UPDATE reserbus.viaje SET vence_en = now() - interval '1 minute' WHERE id = ${v2.json.id}`);   // simula que pasaron 10 min
  const tarde = await api('POST', `/api/viajes/${v2.json.id}/confirmar`, { token: t.viajero });
  chequear('confirmar con el hold vencido -> 409 EXPIRADO', tarde.status === 409 && tarde.json.estado === 'EXPIRADO', JSON.stringify(tarde.json));
  chequear('el 1A quedó libre otra vez', !(await api('GET', `/api/tramos-programados/${tramos[0]}/asientos`)).json.ocupados.includes('1A'));
  const mios = await api('GET', '/api/viajes/mios', { token: t.viajero });
  chequear('/viajes/mios lista los viajes', mios.status === 200 && mios.json.length >= 2);

  titulo('Lado empresa');
  const planes = (await api('GET', '/api/planes', { token: t.andes })).json;
  chequear('Andes ve solo su plan', planes.length === 1 && planes[0].buses.length === 1);
  const gen = await api('POST', `/api/planes/${planes[0].id}/generar`, { token: t.andes, body: { dias: 10 } });
  chequear('generar tramos es idempotente (0 nuevos)', gen.status === 200 && gen.json.creados === 0, JSON.stringify(gen.json));
  const lista = (await api('GET', `/api/tramos-programados?id_plan=${planes[0].id}`, { token: t.andes })).json;
  const tp = lista[lista.length - 1];                                      // el más lejano: no afecta las búsquedas de mañana
  const tiempos = await api('PATCH', `/api/tramos-programados/${tp.id}/tiempos`, { token: t.chofer, body: { salida_real: 'now' } });
  chequear('chofer asignado registra salida_real', tiempos.status === 200 && !!tiempos.json.salida_real, JSON.stringify(tiempos.json));
  chequear('empresa Andes no ve planes de Altiplano', (await api('GET', '/api/rutas', { token: t.andes })).json.every(r => r.nombre.includes('Lima')));
  const tbNuevo = await api('POST', '/api/tipos-de-bus', { token: t.andes, body: { nombre: 'Malo', filas: 5, asientos_por_fila: 4, rangos: [{ fila_desde: 1, fila_hasta: 3, id_tipo_asiento: 1 }] } });
  chequear('tipo de bus con rangos que no cubren las filas -> 400', tbNuevo.status === 400, JSON.stringify(tbNuevo.json));

  console.log(`\n${ok} bien, ${fallos} mal.`);
  await db.sequelize.close();
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.error('La prueba se cayó:', e); process.exit(1); });
