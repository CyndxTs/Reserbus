// Datos de prueba (DML). Primero crea los usuarios en Supabase Auth y luego los perfiles.
// Es re-ejecutable: reutiliza lo que ya existe. Uso (desde /server):  npm run seed
// Todos los usuarios usan la contraseña de CLAVE (datos ficticios, proyecto académico).
require('dotenv').config();
const db = require('../models');
const { supabaseAdmin, crearUsuarioAuth } = require('../lib/supabase');
const { generarTramosProgramados } = require('../services/generacion');

const CLAVE = 'Reserbus123!';
const USUARIOS = {
  admin:         'admin@example.com',
  andesAdmin:    'andes.admin@example.com',
  altiplanoAdmin:'altiplano.admin@example.com',
  chofer:        'chofer.andes@example.com',
  viajero:       'viajero@example.com',
  viajero2:      'viajero2@example.com',
};

async function usuarioAuth(correo) {
  try {
    return await crearUsuarioAuth({ correo, contrasenia: CLAVE });
  } catch (e) {
    if (e.code !== 'email_exists') throw e;
    for (let page = 1; ; page++) {                              // ya existía: buscar su id
      const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      const u = data.users.find(x => x.email === correo);
      if (u) return u.id;
      if (data.users.length < 1000) throw e;
    }
  }
}

const crear = async (Modelo, where, defaults = {}) => (await Modelo.findOrCreate({ where, defaults }))[0];

(async () => {
  const { Pais, Provincia, Terminal, Tramo, Administrador, Empresa, Trabajador, Viajero, TipoAsiento, TipoBus,
          TipoBusTipoAsiento, Tarifa, Bus, Servicio, Ruta, RutaTramo, Horario, Plan, PlanBus, PlanTrabajador } = db;

  // ---- Auth + perfiles ----
  const auth = {};
  for (const [k, correo] of Object.entries(USUARIOS)) auth[k] = await usuarioAuth(correo);
  await crear(Administrador, { auth_id: auth.admin }, { nombres: 'Sysadmin', apellidos: 'Reserbus' });
  await crear(Viajero, { auth_id: auth.viajero }, { nombres: 'Vera', apellidos: 'Viajera' });
  await crear(Viajero, { auth_id: auth.viajero2 }, { nombres: 'Vicente', apellidos: 'Viajero' });

  // ---- Ubicación y red (globales) ----
  const peru = await crear(Pais, { nombre: 'Perú' }, { desfase_utc_min: -300 });
  const prov = {};
  for (const n of ['Lima', 'Arequipa', 'Cusco', 'Puno']) prov[n] = await crear(Provincia, { id_pais: peru.id, nombre: n });
  const term = {};
  for (const n of Object.keys(prov)) {
    term[n] = await crear(Terminal, { id_provincia: prov[n].id, nombre: `Terminal ${n}` }, { direccion: `Av. Principal 100, ${n}` });
  }
  const tramo = async (o, d) => crear(Tramo, { id_terminal_origen: term[o].id, id_terminal_destino: term[d].id });
  const LIM_AQP = await tramo('Lima', 'Arequipa'), AQP_CUS = await tramo('Arequipa', 'Cusco'), AQP_PUN = await tramo('Arequipa', 'Puno');
  const servicios = [];
  for (const n of ['Wifi', 'Baño', 'Enchufes']) servicios.push(await crear(Servicio, { nombre: n }));

  // ---- Empresa 1: Transportes Andes (Lima -> Arequipa -> Cusco, un solo bus) ----
  const andes = await crear(Empresa, { nombre: 'Transportes Andes' });
  await crear(Trabajador, { auth_id: auth.andesAdmin }, { id_empresa: andes.id, tipo: 'ADMINISTRATIVO', nombres: 'Ana', apellidos: 'Andes' });
  const chofer = await crear(Trabajador, { auth_id: auth.chofer }, { id_empresa: andes.id, tipo: 'CHOFER', nombres: 'Carlos', apellidos: 'Chofer' });
  const cama = await crear(TipoAsiento, { id_empresa: andes.id, nombre: 'Cama' }, { tarifa_extra: 40 });
  const semi = await crear(TipoAsiento, { id_empresa: andes.id, nombre: 'Semicama' }, { tarifa_extra: 0 });
  const tbAndes = await crear(TipoBus, { id_empresa: andes.id, nombre: 'Doble 2+2' }, { filas: 10, asientos_por_fila: 4 });
  await crear(TipoBusTipoAsiento, { id_tipo_bus: tbAndes.id, fila_desde: 1 }, { id_empresa: andes.id, fila_hasta: 3, id_tipo_asiento: cama.id });
  await crear(TipoBusTipoAsiento, { id_tipo_bus: tbAndes.id, fila_desde: 4 }, { id_empresa: andes.id, fila_hasta: 10, id_tipo_asiento: semi.id });
  await Tarifa.upsert({ id_tipo_bus: tbAndes.id, id_tramo: LIM_AQP.id, monto_base: 80 });
  await Tarifa.upsert({ id_tipo_bus: tbAndes.id, id_tramo: AQP_CUS.id, monto_base: 50 });
  const busAndes = await crear(Bus, { placa: 'AND-101' }, { id_empresa: andes.id, id_tipo_bus: tbAndes.id });
  await busAndes.setServicios(servicios.map(s => s.id));
  const rutaAndes = await crear(Ruta, { id_empresa: andes.id, nombre: 'Lima - Arequipa - Cusco' });
  await crear(RutaTramo, { id_ruta: rutaAndes.id, id_tramo: LIM_AQP.id }, { posicion: 1, duracion_min: 960 });
  await crear(RutaTramo, { id_ruta: rutaAndes.id, id_tramo: AQP_CUS.id }, { posicion: 2, duracion_min: 600 });
  const hAndes = await crear(Horario, { id_ruta: rutaAndes.id, hora_salida: '23:00:00' });       // 18:00 hora de Lima
  const planAndes = await crear(Plan, { id_empresa: andes.id, id_ruta: rutaAndes.id, id_horario: hAndes.id });
  await crear(PlanBus, { id_plan: planAndes.id, id_bus: busAndes.id }, { id_empresa: andes.id });
  await crear(PlanTrabajador, { id_plan: planAndes.id, id_trabajador: chofer.id }, { id_empresa: andes.id });

  // ---- Empresa 2: Expreso Altiplano (Arequipa -> Puno y Arequipa -> Cusco) ----
  const alti = await crear(Empresa, { nombre: 'Expreso Altiplano' });
  await crear(Trabajador, { auth_id: auth.altiplanoAdmin }, { id_empresa: alti.id, tipo: 'ADMINISTRATIVO', nombres: 'Alba', apellidos: 'Altiplano' });
  const estandar = await crear(TipoAsiento, { id_empresa: alti.id, nombre: 'Estándar' }, { tarifa_extra: 0 });
  const tbAlti = await crear(TipoBus, { id_empresa: alti.id, nombre: 'Económico 2+2' }, { filas: 12, asientos_por_fila: 4 });
  await crear(TipoBusTipoAsiento, { id_tipo_bus: tbAlti.id, fila_desde: 1 }, { id_empresa: alti.id, fila_hasta: 12, id_tipo_asiento: estandar.id });
  await Tarifa.upsert({ id_tipo_bus: tbAlti.id, id_tramo: AQP_PUN.id, monto_base: 35 });
  await Tarifa.upsert({ id_tipo_bus: tbAlti.id, id_tramo: AQP_CUS.id, monto_base: 45 });
  const bus1 = await crear(Bus, { placa: 'ALT-201' }, { id_empresa: alti.id, id_tipo_bus: tbAlti.id });
  const bus2 = await crear(Bus, { placa: 'ALT-202' }, { id_empresa: alti.id, id_tipo_bus: tbAlti.id });
  const rutaPuno = await crear(Ruta, { id_empresa: alti.id, nombre: 'Arequipa - Puno' });
  await crear(RutaTramo, { id_ruta: rutaPuno.id, id_tramo: AQP_PUN.id }, { posicion: 1, duracion_min: 420 });
  const hPuno = await crear(Horario, { id_ruta: rutaPuno.id, hora_salida: '20:00:00' });
  const planPuno = await crear(Plan, { id_empresa: alti.id, id_ruta: rutaPuno.id, id_horario: hPuno.id });
  await crear(PlanBus, { id_plan: planPuno.id, id_bus: bus1.id }, { id_empresa: alti.id });
  const rutaCusco = await crear(Ruta, { id_empresa: alti.id, nombre: 'Arequipa - Cusco' });
  await crear(RutaTramo, { id_ruta: rutaCusco.id, id_tramo: AQP_CUS.id }, { posicion: 1, duracion_min: 540 });
  const hCusco = await crear(Horario, { id_ruta: rutaCusco.id, hora_salida: '17:00:00' });
  const planCusco = await crear(Plan, { id_empresa: alti.id, id_ruta: rutaCusco.id, id_horario: hCusco.id });
  await crear(PlanBus, { id_plan: planCusco.id, id_bus: bus2.id }, { id_empresa: alti.id });

  // ---- Tramos programados de los próximos 10 días ----
  const g = await generarTramosProgramados({ dias: 10 });
  console.log(`Seed listo. Tramos programados nuevos: ${g.creados} (${g.desde} a ${g.hasta})\n`);
  console.log(`Contraseña de todos: ${CLAVE}`);
  for (const [k, c] of Object.entries(USUARIOS)) console.log(`  ${k.padEnd(15)} ${c}`);
  console.log('\nBuscar: Lima -> Puno (1 trasbordo entre empresas) y Lima -> Cusco (directo con el mismo bus, o con trasbordo).');
  await db.sequelize.close();
})().catch(e => { console.error('Seed falló:', e); process.exit(1); });
