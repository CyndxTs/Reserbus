-- =====================================================================
-- RESERBUS · CATALOG & SCHEDULE (DML)
-- Ubicaciones, red de tramos, flota, asientos, tarifas, servicios, rutas, horarios, planes
-- y los tramos programados (lo que el viajero busca y reserva).
-- Correr DESPUÉS de schema.sql y users.sql (necesita empresas y choferes).
--
-- NO crea viajes (reservas), pasajeros ni pasajes: la plantilla queda lista y las reservas
-- las harán los usuarios desde el sistema. Tampoco crea salidas que ya pasaron.
--
-- VENTANA DE FECHAS (automática, nada hardcodeado):
--   desde = día 1 del mes actual (en hora de Perú)   hasta = desde + 6 meses - 1 día
--   Ej.: hoy 19/11/2026 -> 01/11/2026 .. 30/04/2027.
--   Cada vez que se corre el seed, la ventana se recalcula con la fecha del día.
--   (Opcional, para pruebas: SET reserbus.seed_desde = '2026-11-01';  SET reserbus.seed_meses = 6;)
--
-- ZONA HORARIA: todo se guarda en UTC. Los horarios abajo se escriben en HORA LOCAL (Perú) por
-- legibilidad y se convierten a UTC con pais.desfase_utc_min al insertar (horario.hora_salida es UTC).
-- =====================================================================
BEGIN;
SET LOCAL search_path TO reserbus, public;

-- ---------------------------------------------------------------------
-- 1. UBICACIÓN
-- ---------------------------------------------------------------------
INSERT INTO pais (nombre, desfase_utc_min) VALUES ('Perú', -300);

INSERT INTO provincia (id_pais, nombre)
SELECT p.id, v.nombre
  FROM pais p
 CROSS JOIN (VALUES ('Lima'), ('Ica'), ('Arequipa'), ('Cusco'), ('Puno'),
                    ('Tacna'), ('Trujillo'), ('Chiclayo'), ('Piura'), ('Huancayo')) AS v (nombre)
 WHERE p.nombre = 'Perú';

INSERT INTO terminal (id_provincia, nombre, direccion)
SELECT pv.id, v.nombre, v.direccion
  FROM (VALUES
    ('Lima',     'Terminal Lima Sur',    'Av. Defensores del Morro 1200, Chorrillos'),
    ('Lima',     'Terminal Lima Norte',  'Av. Alfredo Mendiola 1500, Independencia'),
    ('Ica',      'Terminal Ica',         'Av. Los Maestros 420, Ica'),
    ('Arequipa', 'Terminal Arequipa',    'Av. Arturo Ibáñez 200, Cerro Colorado'),
    ('Cusco',    'Terminal Cusco',       'Av. Vía de Evitamiento 300, Wanchaq'),
    ('Puno',     'Terminal Puno',        'Jr. Primero de Mayo 703, Puno'),
    ('Tacna',    'Terminal Tacna',       'Av. Hipólito Unanue 1100, Tacna'),
    ('Trujillo', 'Terminal Trujillo',    'Av. América Sur 2300, Trujillo'),
    ('Chiclayo', 'Terminal Chiclayo',    'Av. Bolognesi 536, Chiclayo'),
    ('Piura',    'Terminal Piura',       'Av. Sánchez Cerro 1100, Piura'),
    ('Huancayo', 'Terminal Huancayo',    'Av. Ferrocarril 1590, Huancayo')
  ) AS v (provincia, nombre, direccion)
  JOIN provincia pv ON pv.nombre = v.provincia;

-- ---------------------------------------------------------------------
-- 2. RUTAS (por empresa). Cada definición crea la ruta de IDA y la de VUELTA (secuencia invertida).
--    terminales = paradas en orden; duraciones = minutos de cada tramo (1 menos que terminales).
--    Ninguna ruta pasa de 24 h para que un bus pueda repetirla todos los días.
-- ---------------------------------------------------------------------
CREATE TEMP TABLE _ruta_def (
  empresa TEXT, ida TEXT, vuelta TEXT, terminales TEXT[], duraciones INT[]
) ON COMMIT DROP;

INSERT INTO _ruta_def VALUES
  ('Transportes Andes', 'Lima - Ica - Arequipa', 'Arequipa - Ica - Lima',
     ARRAY['Terminal Lima Sur', 'Terminal Ica', 'Terminal Arequipa'], ARRAY[270, 600]),
  ('Transportes Andes', 'Arequipa - Cusco', 'Cusco - Arequipa',
     ARRAY['Terminal Arequipa', 'Terminal Cusco'], ARRAY[600]),
  ('Expreso Altiplano', 'Arequipa - Puno', 'Puno - Arequipa',
     ARRAY['Terminal Arequipa', 'Terminal Puno'], ARRAY[360]),
  ('Expreso Altiplano', 'Arequipa - Cusco', 'Cusco - Arequipa',
     ARRAY['Terminal Arequipa', 'Terminal Cusco'], ARRAY[570]),
  ('Expreso Altiplano', 'Cusco - Puno', 'Puno - Cusco',
     ARRAY['Terminal Cusco', 'Terminal Puno'], ARRAY[360]),
  ('Norte Express', 'Lima - Trujillo - Chiclayo - Piura', 'Piura - Chiclayo - Trujillo - Lima',
     ARRAY['Terminal Lima Norte', 'Terminal Trujillo', 'Terminal Chiclayo', 'Terminal Piura'], ARRAY[480, 210, 210]),
  ('Sierra Central', 'Lima - Huancayo', 'Huancayo - Lima',
     ARRAY['Terminal Lima Sur', 'Terminal Huancayo'], ARRAY[420]),
  ('Pacífico Sur', 'Lima - Arequipa (Directo)', 'Arequipa - Lima (Directo)',
     ARRAY['Terminal Lima Sur', 'Terminal Arequipa'], ARRAY[960]),
  ('Pacífico Sur', 'Arequipa - Tacna', 'Tacna - Arequipa',
     ARRAY['Terminal Arequipa', 'Terminal Tacna'], ARRAY[360]);

-- Tramos (aristas) de cada ruta, ida y vuelta
CREATE TEMP TABLE _leg ON COMMIT DROP AS
SELECT d.empresa, d.ida AS ruta, g AS pos,
       d.terminales[g] AS origen, d.terminales[g + 1] AS destino, d.duraciones[g] AS dur
  FROM _ruta_def d
 CROSS JOIN LATERAL generate_series(1, array_length(d.duraciones, 1)) AS g
UNION ALL
SELECT d.empresa, d.vuelta, g,
       d.terminales[array_length(d.terminales, 1) - g + 1],
       d.terminales[array_length(d.terminales, 1) - g],
       d.duraciones[array_length(d.terminales, 1) - g]
  FROM _ruta_def d
 CROSS JOIN LATERAL generate_series(1, array_length(d.duraciones, 1)) AS g;

INSERT INTO tramo (id_terminal_origen, id_terminal_destino)
SELECT DISTINCT o.id, de.id
  FROM _leg l
  JOIN terminal o  ON o.nombre  = l.origen
  JOIN terminal de ON de.nombre = l.destino;

INSERT INTO ruta (id_empresa, nombre)
SELECT e.id, r.nombre
  FROM (SELECT empresa, ida AS nombre FROM _ruta_def UNION ALL SELECT empresa, vuelta FROM _ruta_def) r
  JOIN empresa e ON e.nombre = r.empresa;

INSERT INTO ruta_has_tramo (id_ruta, id_tramo, posicion, duracion_min)
SELECT r.id, t.id, l.pos, l.dur
  FROM _leg l
  JOIN empresa e   ON e.nombre = l.empresa
  JOIN ruta r      ON r.id_empresa = e.id AND r.nombre = l.ruta
  JOIN terminal o  ON o.nombre  = l.origen
  JOIN terminal de ON de.nombre = l.destino
  JOIN tramo t     ON t.id_terminal_origen = o.id AND t.id_terminal_destino = de.id;

-- ---------------------------------------------------------------------
-- 3. SERVICIOS, TIPOS DE ASIENTO, TIPOS DE BUS Y TARIFAS
-- ---------------------------------------------------------------------
INSERT INTO servicio (nombre) VALUES
  ('Wifi'), ('Baño'), ('Enchufes USB'), ('Aire acondicionado'),
  ('Calefacción'), ('TV'), ('Snack'), ('Frazada');

INSERT INTO tipo_asiento (id_empresa, nombre, tarifa_extra)
SELECT e.id, v.nombre, v.extra
  FROM (VALUES
    ('Transportes Andes', 'Cama',      40),
    ('Transportes Andes', 'Semicama',  15),
    ('Expreso Altiplano', 'Estándar',   0),
    ('Expreso Altiplano', 'Semicama',  15),
    ('Norte Express',     'Cama',      50),
    ('Norte Express',     'Semicama',  20),
    ('Sierra Central',    'Estándar',   0),
    ('Sierra Central',    'VIP',       25),
    ('Pacífico Sur',      'Cama',      45),
    ('Pacífico Sur',      'Semicama',  15)
  ) AS v (empresa, nombre, extra)
  JOIN empresa e ON e.nombre = v.empresa;

-- factor = multiplicador sobre el precio de referencia del tramo (ver sección de tarifas)
CREATE TEMP TABLE _tipo_bus_def (
  empresa TEXT, nombre TEXT, filas INT, por_fila INT, factor NUMERIC
) ON COMMIT DROP;
INSERT INTO _tipo_bus_def VALUES
  ('Transportes Andes', 'Premium 2+2',   10, 4, 1.20),
  ('Expreso Altiplano', 'Económico 2+2', 12, 4, 1.00),
  ('Expreso Altiplano', 'Ejecutivo 2+2', 10, 4, 1.15),
  ('Norte Express',     'Suite 1+1',      8, 2, 1.60),
  ('Norte Express',     'Semicama 2+2',  11, 4, 1.15),
  ('Sierra Central',    'Económico 2+2', 13, 4, 1.00),
  ('Sierra Central',    'VIP 2+2',       10, 4, 1.25),
  ('Pacífico Sur',      'Imperial 2+2',  11, 4, 1.30);

INSERT INTO tipo_bus (id_empresa, nombre, filas, asientos_por_fila)
SELECT e.id, d.nombre, d.filas, d.por_fila
  FROM _tipo_bus_def d JOIN empresa e ON e.nombre = d.empresa;

-- Qué filas son de qué tipo de asiento (sin solaparse y cubriendo todas las filas)
INSERT INTO tipo_bus_has_tipo_asiento (id_tipo_bus, id_tipo_asiento, id_empresa, fila_desde, fila_hasta)
SELECT tb.id, ta.id, e.id, v.desde, v.hasta
  FROM (VALUES
    ('Transportes Andes', 'Premium 2+2',   'Cama',      1,  3),
    ('Transportes Andes', 'Premium 2+2',   'Semicama',  4, 10),
    ('Expreso Altiplano', 'Económico 2+2', 'Estándar',  1, 12),
    ('Expreso Altiplano', 'Ejecutivo 2+2', 'Semicama',  1,  3),
    ('Expreso Altiplano', 'Ejecutivo 2+2', 'Estándar',  4, 10),
    ('Norte Express',     'Suite 1+1',     'Cama',      1,  8),
    ('Norte Express',     'Semicama 2+2',  'Semicama',  1, 11),
    ('Sierra Central',    'Económico 2+2', 'Estándar',  1, 13),
    ('Sierra Central',    'VIP 2+2',       'VIP',       1,  3),
    ('Sierra Central',    'VIP 2+2',       'Estándar',  4, 10),
    ('Pacífico Sur',      'Imperial 2+2',  'Cama',      1,  4),
    ('Pacífico Sur',      'Imperial 2+2',  'Semicama',  5, 11)
  ) AS v (empresa, tipo_bus, tipo_asiento, desde, hasta)
  JOIN empresa e       ON e.nombre = v.empresa
  JOIN tipo_bus tb     ON tb.id_empresa = e.id AND tb.nombre = v.tipo_bus
  JOIN tipo_asiento ta ON ta.id_empresa = e.id AND ta.nombre = v.tipo_asiento;

-- Precio de referencia por par de terminales (se usa en ambos sentidos). Tarifa = referencia * factor del tipo de bus.
-- Se crea la tarifa de CADA tipo de bus de la empresa para CADA tramo de sus rutas.
CREATE TEMP TABLE _precio_ref (a TEXT, b TEXT, precio NUMERIC) ON COMMIT DROP;
INSERT INTO _precio_ref VALUES
  ('Terminal Lima Sur',   'Terminal Ica',        40),
  ('Terminal Ica',        'Terminal Arequipa',   70),
  ('Terminal Arequipa',   'Terminal Cusco',      60),
  ('Terminal Arequipa',   'Terminal Puno',       40),
  ('Terminal Cusco',      'Terminal Puno',       40),
  ('Terminal Lima Sur',   'Terminal Arequipa',  100),
  ('Terminal Arequipa',   'Terminal Tacna',      45),
  ('Terminal Lima Norte', 'Terminal Trujillo',   60),
  ('Terminal Trujillo',   'Terminal Chiclayo',   35),
  ('Terminal Chiclayo',   'Terminal Piura',      35),
  ('Terminal Lima Sur',   'Terminal Huancayo',   45);

INSERT INTO tarifa (id_tipo_bus, id_tramo, monto_base)
SELECT tb.id, t.id, ROUND(pr.precio * d.factor, 0)      -- si falta un precio, el NOT NULL de monto_base lo delata
  FROM (SELECT DISTINCT empresa, origen, destino FROM _leg) l
  JOIN _tipo_bus_def d ON d.empresa = l.empresa
  JOIN empresa e   ON e.nombre = l.empresa
  JOIN tipo_bus tb ON tb.id_empresa = e.id AND tb.nombre = d.nombre
  JOIN terminal o  ON o.nombre  = l.origen
  JOIN terminal de ON de.nombre = l.destino
  JOIN tramo t     ON t.id_terminal_origen = o.id AND t.id_terminal_destino = de.id
  LEFT JOIN _precio_ref pr ON (pr.a = l.origen AND pr.b = l.destino) OR (pr.a = l.destino AND pr.b = l.origen);

-- ---------------------------------------------------------------------
-- 4. HORARIOS, PLANES, BUSES Y CHOFERES
--    Un plan = una ruta + una hora de salida + sus buses + sus choferes.
--    hora_local = hora de salida en Perú; n_buses = buses que hacen ese plan CADA DÍA.
-- ---------------------------------------------------------------------
CREATE TEMP TABLE _plan_def ON COMMIT DROP AS
SELECT v.empresa, v.ruta, v.hora_local::time AS hora_local, v.n_buses, v.tipo_bus,
       ((v.hora_local::time) - (SELECT desfase_utc_min FROM pais WHERE nombre = 'Perú') * INTERVAL '1 minute')::time AS hora_utc
  FROM (VALUES
    -- empresa,             ruta,                                   hora,    buses, tipo de bus
    ('Transportes Andes', 'Lima - Ica - Arequipa',                '18:00', 2, 'Premium 2+2'),
    ('Transportes Andes', 'Lima - Ica - Arequipa',                '21:30', 1, 'Premium 2+2'),
    ('Transportes Andes', 'Arequipa - Ica - Lima',                '17:00', 2, 'Premium 2+2'),
    ('Transportes Andes', 'Arequipa - Ica - Lima',                '20:30', 1, 'Premium 2+2'),
    ('Transportes Andes', 'Arequipa - Cusco',                     '09:30', 1, 'Premium 2+2'),
    ('Transportes Andes', 'Arequipa - Cusco',                     '21:00', 1, 'Premium 2+2'),
    ('Transportes Andes', 'Cusco - Arequipa',                     '10:00', 1, 'Premium 2+2'),
    ('Transportes Andes', 'Cusco - Arequipa',                     '20:30', 1, 'Premium 2+2'),

    ('Expreso Altiplano', 'Arequipa - Puno',                      '08:00', 1, 'Económico 2+2'),
    ('Expreso Altiplano', 'Arequipa - Puno',                      '14:00', 1, 'Ejecutivo 2+2'),
    ('Expreso Altiplano', 'Arequipa - Puno',                      '22:00', 1, 'Económico 2+2'),
    ('Expreso Altiplano', 'Puno - Arequipa',                      '08:30', 1, 'Económico 2+2'),
    ('Expreso Altiplano', 'Puno - Arequipa',                      '15:00', 1, 'Ejecutivo 2+2'),
    ('Expreso Altiplano', 'Puno - Arequipa',                      '22:30', 1, 'Económico 2+2'),
    ('Expreso Altiplano', 'Arequipa - Cusco',                     '07:30', 1, 'Económico 2+2'),
    ('Expreso Altiplano', 'Arequipa - Cusco',                     '20:00', 1, 'Ejecutivo 2+2'),
    ('Expreso Altiplano', 'Cusco - Arequipa',                     '08:00', 1, 'Económico 2+2'),
    ('Expreso Altiplano', 'Cusco - Arequipa',                     '19:30', 1, 'Ejecutivo 2+2'),
    ('Expreso Altiplano', 'Cusco - Puno',                         '07:00', 1, 'Económico 2+2'),
    ('Expreso Altiplano', 'Cusco - Puno',                         '13:00', 1, 'Ejecutivo 2+2'),
    ('Expreso Altiplano', 'Puno - Cusco',                         '07:30', 1, 'Económico 2+2'),
    ('Expreso Altiplano', 'Puno - Cusco',                         '13:30', 1, 'Ejecutivo 2+2'),

    ('Norte Express',     'Lima - Trujillo - Chiclayo - Piura',   '17:00', 2, 'Semicama 2+2'),
    ('Norte Express',     'Lima - Trujillo - Chiclayo - Piura',   '21:00', 1, 'Suite 1+1'),
    ('Norte Express',     'Piura - Chiclayo - Trujillo - Lima',   '16:30', 1, 'Semicama 2+2'),
    ('Norte Express',     'Piura - Chiclayo - Trujillo - Lima',   '20:30', 1, 'Suite 1+1'),

    ('Sierra Central',    'Lima - Huancayo',                      '07:00', 1, 'Económico 2+2'),
    ('Sierra Central',    'Lima - Huancayo',                      '13:00', 1, 'Económico 2+2'),
    ('Sierra Central',    'Lima - Huancayo',                      '22:00', 1, 'VIP 2+2'),
    ('Sierra Central',    'Huancayo - Lima',                      '07:30', 1, 'Económico 2+2'),
    ('Sierra Central',    'Huancayo - Lima',                      '13:30', 1, 'Económico 2+2'),
    ('Sierra Central',    'Huancayo - Lima',                      '22:30', 1, 'VIP 2+2'),

    ('Pacífico Sur',      'Lima - Arequipa (Directo)',            '15:00', 2, 'Imperial 2+2'),
    ('Pacífico Sur',      'Lima - Arequipa (Directo)',            '19:30', 1, 'Imperial 2+2'),
    ('Pacífico Sur',      'Arequipa - Lima (Directo)',            '15:30', 2, 'Imperial 2+2'),
    ('Pacífico Sur',      'Arequipa - Lima (Directo)',            '19:00', 1, 'Imperial 2+2'),
    ('Pacífico Sur',      'Arequipa - Tacna',                     '09:00', 1, 'Imperial 2+2'),
    ('Pacífico Sur',      'Arequipa - Tacna',                     '18:00', 1, 'Imperial 2+2'),
    ('Pacífico Sur',      'Tacna - Arequipa',                     '09:30', 1, 'Imperial 2+2'),
    ('Pacífico Sur',      'Tacna - Arequipa',                     '18:30', 1, 'Imperial 2+2')
  ) AS v (empresa, ruta, hora_local, n_buses, tipo_bus);

INSERT INTO horario (id_ruta, hora_salida)
SELECT r.id, p.hora_utc
  FROM _plan_def p
  JOIN empresa e ON e.nombre = p.empresa
  JOIN ruta r    ON r.id_empresa = e.id AND r.nombre = p.ruta;

INSERT INTO plan (id_empresa, id_ruta, id_horario)
SELECT r.id_empresa, r.id, h.id
  FROM _plan_def p
  JOIN empresa e ON e.nombre = p.empresa
  JOIN ruta r    ON r.id_empresa = e.id AND r.nombre = p.ruta
  JOIN horario h ON h.id_ruta = r.id AND h.hora_salida = p.hora_utc
 ORDER BY r.id, h.id;

-- Un bus por cada "n_buses" de cada plan. Placa: 3 letras de la empresa + número correlativo.
CREATE TEMP TABLE _bus_def ON COMMIT DROP AS
SELECT x.id_plan, x.id_empresa, x.id_tipo_bus, x.empresa, x.tipo_bus,
       pf.pref || '-' || (100 + row_number() OVER (PARTITION BY x.id_empresa ORDER BY x.id_plan, x.k))::text AS placa
  FROM (
    SELECT pl.id AS id_plan, pl.id_empresa, tb.id AS id_tipo_bus, p.empresa, p.tipo_bus, k
      FROM _plan_def p
      JOIN empresa e   ON e.nombre = p.empresa
      JOIN ruta r      ON r.id_empresa = e.id AND r.nombre = p.ruta
      JOIN horario h   ON h.id_ruta = r.id AND h.hora_salida = p.hora_utc
      JOIN plan pl     ON pl.id_ruta = r.id AND pl.id_horario = h.id
      JOIN tipo_bus tb ON tb.id_empresa = e.id AND tb.nombre = p.tipo_bus
     CROSS JOIN LATERAL generate_series(1, p.n_buses) AS k
  ) x
  JOIN (VALUES ('Transportes Andes', 'AND'), ('Expreso Altiplano', 'ALT'), ('Norte Express', 'NOR'),
               ('Sierra Central', 'SIE'), ('Pacífico Sur', 'PAC')) AS pf (empresa, pref) ON pf.empresa = x.empresa;

INSERT INTO bus (id_empresa, id_tipo_bus, placa)
SELECT id_empresa, id_tipo_bus, placa FROM _bus_def ORDER BY placa;

INSERT INTO plan_has_bus (id_plan, id_bus, id_empresa)
SELECT d.id_plan, b.id, d.id_empresa
  FROM _bus_def d JOIN bus b ON b.placa = d.placa;

-- Servicios por tipo de bus (se aplican a todos los buses de ese tipo)
INSERT INTO bus_has_servicio (id_bus, id_servicio)
SELECT b.id, s.id
  FROM (VALUES
    ('Transportes Andes', 'Premium 2+2',   'Wifi'), ('Transportes Andes', 'Premium 2+2', 'Baño'), ('Transportes Andes', 'Premium 2+2', 'Enchufes USB'),
    ('Transportes Andes', 'Premium 2+2',   'Aire acondicionado'), ('Transportes Andes', 'Premium 2+2', 'TV'),
    ('Transportes Andes', 'Premium 2+2',   'Snack'), ('Transportes Andes', 'Premium 2+2', 'Frazada'),
    ('Expreso Altiplano', 'Económico 2+2', 'Baño'), ('Expreso Altiplano', 'Económico 2+2', 'Calefacción'),
    ('Expreso Altiplano', 'Ejecutivo 2+2', 'Wifi'), ('Expreso Altiplano', 'Ejecutivo 2+2', 'Baño'), ('Expreso Altiplano', 'Ejecutivo 2+2', 'Enchufes USB'),
    ('Expreso Altiplano', 'Ejecutivo 2+2', 'Calefacción'), ('Expreso Altiplano', 'Ejecutivo 2+2', 'Frazada'),
    ('Norte Express',     'Suite 1+1',     'Wifi'), ('Norte Express', 'Suite 1+1', 'Baño'), ('Norte Express', 'Suite 1+1', 'Enchufes USB'),
    ('Norte Express',     'Suite 1+1',     'Aire acondicionado'), ('Norte Express', 'Suite 1+1', 'TV'),
    ('Norte Express',     'Suite 1+1',     'Snack'), ('Norte Express', 'Suite 1+1', 'Frazada'),
    ('Norte Express',     'Semicama 2+2',  'Wifi'), ('Norte Express', 'Semicama 2+2', 'Baño'), ('Norte Express', 'Semicama 2+2', 'Enchufes USB'),
    ('Norte Express',     'Semicama 2+2',  'Aire acondicionado'),
    ('Sierra Central',    'Económico 2+2', 'Baño'), ('Sierra Central', 'Económico 2+2', 'Calefacción'),
    ('Sierra Central',    'VIP 2+2',       'Wifi'), ('Sierra Central', 'VIP 2+2', 'Baño'), ('Sierra Central', 'VIP 2+2', 'Enchufes USB'),
    ('Sierra Central',    'VIP 2+2',       'Calefacción'), ('Sierra Central', 'VIP 2+2', 'Snack'),
    ('Pacífico Sur',      'Imperial 2+2',  'Wifi'), ('Pacífico Sur', 'Imperial 2+2', 'Baño'), ('Pacífico Sur', 'Imperial 2+2', 'Enchufes USB'),
    ('Pacífico Sur',      'Imperial 2+2',  'Aire acondicionado'), ('Pacífico Sur', 'Imperial 2+2', 'TV'),
    ('Pacífico Sur',      'Imperial 2+2',  'Snack'), ('Pacífico Sur', 'Imperial 2+2', 'Frazada')
  ) AS v (empresa, tipo_bus, servicio)
  JOIN empresa e   ON e.nombre = v.empresa
  JOIN tipo_bus tb ON tb.id_empresa = e.id AND tb.nombre = v.tipo_bus
  JOIN bus b       ON b.id_tipo_bus = tb.id AND b.id_empresa = e.id
  JOIN servicio s  ON s.nombre = v.servicio;

-- Choferes por plan: 2 por plan, repartidos en rotación entre los choferes de la empresa
WITH ch AS (
  SELECT id, id_empresa,
         row_number() OVER (PARTITION BY id_empresa ORDER BY id) - 1 AS i,
         count(*)     OVER (PARTITION BY id_empresa)                 AS m
    FROM trabajador WHERE tipo = 'CHOFER'
), pl AS (
  SELECT id, id_empresa, row_number() OVER (PARTITION BY id_empresa ORDER BY id) - 1 AS i FROM plan
)
INSERT INTO plan_has_trabajador (id_plan, id_trabajador, id_empresa)
SELECT pl.id, ch.id, pl.id_empresa
  FROM pl
  JOIN ch ON ch.id_empresa = pl.id_empresa
 CROSS JOIN generate_series(0, 1) AS j
 WHERE ch.i = (pl.i * 2 + j) % ch.m;

-- ---------------------------------------------------------------------
-- 5. VENTANA DE FECHAS (se calcula con la fecha del día en que corre el seed)
-- ---------------------------------------------------------------------
CREATE TEMP TABLE _ventana ON COMMIT DROP AS
WITH cfg AS (
  SELECT COALESCE(NULLIF(current_setting('reserbus.seed_meses', true), '')::int, 6) AS meses,
         NULLIF(current_setting('reserbus.seed_desde', true), '')::date               AS desde_forzado,
         (SELECT desfase_utc_min FROM pais WHERE nombre = 'Perú')                      AS desfase
), loc AS (
  SELECT meses, desfase,
         COALESCE(desde_forzado,
                  date_trunc('month', (now() AT TIME ZONE 'UTC') + desfase * INTERVAL '1 minute')::date) AS desde
    FROM cfg
)
SELECT meses, desfase, desde,
       (desde + make_interval(months => meses))::date - 1 AS hasta,
       -- 00:00 local del primer día y 00:00 local del día siguiente al último, expresados en UTC
       ((desde::timestamp                                    - desfase * INTERVAL '1 minute') AT TIME ZONE 'UTC') AS inicio_utc,
       (((desde + make_interval(months => meses))::timestamp - desfase * INTERVAL '1 minute') AT TIME ZONE 'UTC') AS fin_utc
  FROM loc;

-- ---------------------------------------------------------------------
-- 6. TRAMOS PROGRAMADOS
--    Para cada día de la ventana, cada bus de cada plan activo recorre los tramos de su ruta:
--      salida del tramo N = hora de salida (UTC) + suma de las duraciones de los tramos anteriores.
--    Se descartan los viajes cuya salida inicial ya pasó (no se crea nada del pasado).
--    (Para incluir también los días pasados de la ventana, borra la última condición del WHERE.)
-- ---------------------------------------------------------------------
INSERT INTO tramo_programado (id_plan, id_bus, id_ruta, id_tramo, salida_estimada, llegada_estimada)
SELECT x.id_plan, x.id_bus, x.id_ruta, x.id_tramo, x.salida, x.salida + x.duracion_min * INTERVAL '1 minute'
  FROM (
    SELECT p.id AS id_plan, pb.id_bus, p.id_ruta, rt.id_tramo, rt.duracion_min,
           (d::date + h.hora_salida) AT TIME ZONE 'UTC' AS inicio_viaje,
           ((d::date + h.hora_salida) AT TIME ZONE 'UTC')
             + COALESCE(SUM(rt.duracion_min) OVER (
                 PARTITION BY p.id, pb.id_bus, d ORDER BY rt.posicion
                 ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) * INTERVAL '1 minute' AS salida
      FROM plan p
      JOIN horario h        ON h.id = p.id_horario
      JOIN plan_has_bus pb  ON pb.id_plan = p.id
      JOIN bus b            ON b.id = pb.id_bus AND b.activo
      JOIN ruta_has_tramo rt ON rt.id_ruta = p.id_ruta
     CROSS JOIN _ventana v
     CROSS JOIN LATERAL generate_series(v.desde::timestamp - INTERVAL '1 day',
                                        v.hasta::timestamp + INTERVAL '1 day',
                                        INTERVAL '1 day') AS d   -- 1 día de margen: la hora UTC puede caer al día siguiente
     WHERE p.activo
  ) x
 CROSS JOIN _ventana v
 WHERE x.inicio_viaje >= v.inicio_utc
   AND x.inicio_viaje <  v.fin_utc
   AND x.inicio_viaje >  now();                                   -- sin viajes pasados

-- ---------------------------------------------------------------------
-- 7. RESUMEN (lo imprime el runner como NOTICE)
-- ---------------------------------------------------------------------
DO $$
DECLARE v RECORD; r RECORD;
BEGIN
  SELECT * INTO v FROM _ventana;
  SELECT count(*) AS n,
         (min(salida_estimada) AT TIME ZONE 'UTC') + v.desfase * INTERVAL '1 minute' AS primera,
         (max(salida_estimada) AT TIME ZONE 'UTC') + v.desfase * INTERVAL '1 minute' AS ultima
    INTO r FROM tramo_programado;
  RAISE NOTICE 'Ventana (hora Perú): % a % (% meses)', v.desde, v.hasta, v.meses;
  RAISE NOTICE 'Tramos programados: % | primera salida local: % | última salida local: %', r.n, r.primera, r.ultima;
END $$;

COMMIT;
