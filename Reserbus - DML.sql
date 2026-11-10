BEGIN;

-- La generación automática al insertar frecuencias se apaga: los viajes se generan
-- explícitamente más abajo con un rango de fechas fijo (sp_generar_viajes).
SELECT set_config('reserbus.generar_auto', 'off', true);

-- ---------------------------------------------------------------------
-- 0. LIMPIEZA de usuarios de prueba previos (tras re-ejecutar el DDL las tablas están vacías)
-- ---------------------------------------------------------------------
DELETE FROM auth.users
 WHERE email IN ('viajero@example.com', 'empresa@example.com', 'administrador@example.com');

-- ---------------------------------------------------------------------
-- 1. CATÁLOGO DE DÍAS (ISO: 1 = Lunes ... 7 = Domingo)
-- ---------------------------------------------------------------------
INSERT INTO dia_semana (id_dia, nombre, abreviatura) VALUES
  (1, 'Lunes',     'LUN'),
  (2, 'Martes',    'MAR'),
  (3, 'Miércoles', 'MIE'),
  (4, 'Jueves',    'JUE'),
  (5, 'Viernes',   'VIE'),
  (6, 'Sábado',    'SAB'),
  (7, 'Domingo',   'DOM');

-- ---------------------------------------------------------------------
-- 2. GEOGRAFÍA: países, desfases horarios, provincias
-- ---------------------------------------------------------------------
INSERT INTO pais (codigo_iso, nombre, codigo_moneda, prefijo_telefono) VALUES
  ('PE', 'Perú',    'PEN', '+51'),
  ('CL', 'Chile',   'CLP', '+56'),
  ('BO', 'Bolivia', 'BOB', '+591');

-- inicio = fin  -> vale todo el año (Perú y Bolivia no tienen horario de verano).
-- Chile: verano UTC-3 (desde el 1.er domingo de septiembre) e invierno UTC-4 (desde el 1.er
-- domingo de abril). Las fechas del DDL son fijas por año, por eso se usan 6/sep y 5/abr (aprox.).
INSERT INTO desfase_horario (id_pais, descripcion, minutos_desfase,
                             mes_inicio, dia_inicio, hora_inicio, mes_fin, dia_fin, hora_fin)
SELECT p.id_pais, v.descripcion, v.minutos, v.mi, v.di, v.hi::time, v.mf, v.df, v.hf::time
FROM (VALUES
  ('PE', 'Perú (UTC-5, todo el año)',          -300, 1, 1, '00:00', 1, 1, '00:00'),
  ('BO', 'Bolivia (UTC-4, todo el año)',       -240, 1, 1, '00:00', 1, 1, '00:00'),
  ('CL', 'Chile - horario de verano (UTC-3)',  -180, 9, 6, '00:00', 4, 5, '00:00'),
  ('CL', 'Chile - horario de invierno (UTC-4)',-240, 4, 5, '00:00', 9, 6, '00:00')
) AS v(iso, descripcion, minutos, mi, di, hi, mf, df, hf)
JOIN pais p ON p.codigo_iso = v.iso;

INSERT INTO provincia (id_pais, nombre)
SELECT p.id_pais, v.nombre
FROM (VALUES
  ('PE', 'Lima'), ('PE', 'Ica'), ('PE', 'Nazca'), ('PE', 'Arequipa'),
  ('PE', 'Moquegua'), ('PE', 'Tacna'), ('PE', 'Cusco'), ('PE', 'Puno'),
  ('CL', 'Arica'),
  ('BO', 'La Paz')
) AS v(iso, nombre)
JOIN pais p ON p.codigo_iso = v.iso;

-- ---------------------------------------------------------------------
-- 3. USUARIOS (auth.users + auth.identities + tablas de negocio)
--    Contraseña 12345678 (hash bcrypt con pgcrypto del esquema "extensions").
--    El viajero lo crea el trigger on_auth_user_created; empresa y administrador
--    llevan app_metadata.rol distinto de VIAJERO y se insertan a mano.
-- ---------------------------------------------------------------------
INSERT INTO auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'administrador@example.com',
   extensions.crypt('12345678', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"],"rol":"ADMIN"}'::jsonb,
   '{"nombres":"Administrador","apellidos":"General"}'::jsonb,
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'empresa@example.com',
   extensions.crypt('12345678', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"],"rol":"EMPRESA"}'::jsonb,
   '{"razon_social":"Transportes Pacífico Sur S.A.C."}'::jsonb,
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-0000-4000-8000-000000000003',
   'authenticated', 'authenticated', 'viajero@example.com',
   extensions.crypt('12345678', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"],"rol":"VIAJERO"}'::jsonb,
   '{"nombres":"Andrea","apellidos":"Torres Salazar"}'::jsonb,
   now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider,
                             last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), u.id::text, u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email,
                          'email_verified', true, 'phone_verified', false),
       'email', now(), now(), now()
FROM auth.users u
WHERE u.email IN ('viajero@example.com', 'empresa@example.com', 'administrador@example.com');

INSERT INTO administrador (id_auth, correo_electronico, nombres, apellidos, fecha_nacimiento)
VALUES ('aaaaaaaa-0000-4000-8000-000000000001', 'administrador@example.com',
        'Administrador', 'General', DATE '1985-03-20');

INSERT INTO empresa (id_auth, correo_electronico, razon_social, ruc, descripcion, telefono,
                     sitio_web, id_administrador)
VALUES ('bbbbbbbb-0000-4000-8000-000000000002', 'empresa@example.com',
        'Transportes Pacífico Sur S.A.C.', '20601234567',
        'Transporte interprovincial de pasajeros en el sur del Perú y rutas internacionales',
        '014445566', 'https://www.pacificosur.example.com',
        (SELECT id_administrador FROM administrador WHERE correo_electronico = 'administrador@example.com'));

-- La fila del viajero ya existe (la creó el trigger); se completan sus datos.
UPDATE viajero
   SET nombres = 'Andrea', apellidos = 'Torres Salazar',
       tipo_documento = 'DNI', numero_documento = '72345678',
       telefono = '987654321', fecha_nacimiento = DATE '1998-05-14'
 WHERE correo_electronico = 'viajero@example.com';

-- ---------------------------------------------------------------------
-- 4. TERMINALES (globales, gestionados por el administrador; datos referenciales)
-- ---------------------------------------------------------------------
INSERT INTO terminal (nombre, id_pais, id_provincia, distrito, direccion, referencia,
                      latitud, longitud, telefono, id_administrador)
SELECT v.nombre, p.id_pais, pr.id_provincia, v.distrito, v.direccion, v.referencia,
       v.lat, v.lon, v.telefono,
       (SELECT id_administrador FROM administrador WHERE correo_electronico = 'administrador@example.com')
FROM (VALUES
  ('Terminal Plaza Norte',               'PE', 'Lima',     'Independencia',  'Av. Alfredo Mendiola 1400',        'Frente al centro comercial Plaza Norte', -12.006000, -77.059000, '016000001'),
  ('Terminal Terrapuerto Yerbateros',    'PE', 'Lima',     'Ate',            'Av. Nicolás Ayllón 2800',          'Cerca a la Vía Expresa',                 -12.041700, -76.987300, '016000002'),
  ('Terminal Terrestre Ica',             'PE', 'Ica',      'Ica',            'Av. Lima 400',                     'Cerca a la Plaza de Armas',              -14.067800, -75.728600, '056000003'),
  ('Terminal Terrestre Nazca',           'PE', 'Nazca',    'Nazca',          'Av. Los Incas 600',                'A dos cuadras de la plaza',              -14.831000, -74.939000, '056000004'),
  ('Terminal Terrestre Arequipa',        'PE', 'Arequipa', 'Jacobo Hunter',  'Av. Arequipa s/n',                 'Junto al Terrapuerto',                   -16.429000, -71.524000, '054000005'),
  ('Terminal Terrestre Moquegua',        'PE', 'Moquegua', 'Moquegua',       'Av. Ejército 700',                 'Cerca al Óvalo de ingreso',              -17.192700, -70.935300, '053000006'),
  ('Terminal Terrestre Tacna',           'PE', 'Tacna',    'Tacna',          'Av. Hipólito Unanue 1100',         'Cerca a la Av. Industrial',              -18.010700, -70.245700, '052000007'),
  ('Terminal Terrestre Cusco',           'PE', 'Cusco',    'Santiago',       'Av. Vía de Evitamiento s/n',       'Cerca a la Av. Pachacútec',              -13.534000, -71.956000, '084000008'),
  ('Terminal Terrestre Puno',            'PE', 'Puno',     'Puno',           'Jr. Primero de Mayo 703',          'Cerca al lago Titicaca',                 -15.841000, -70.016600, '051000009'),
  ('Terminal de Buses La Paz',           'BO', 'La Paz',   'La Paz',         'Plaza Antofagasta s/n',            'Zona Central',                           -16.495500, -68.154000, '+59122000010'),
  ('Terminal Internacional Arica',       'CL', 'Arica',    'Arica',          'Av. Diego Portales 948',           'Cerca a la ruta 5',                      -18.478300, -70.312600, '+56582000011')
) AS v(nombre, iso, prov, distrito, direccion, referencia, lat, lon, telefono)
JOIN pais p       ON p.codigo_iso = v.iso
JOIN provincia pr ON pr.id_pais = p.id_pais AND pr.nombre = v.prov;

-- ---------------------------------------------------------------------
-- 5. CATÁLOGOS DE FLOTA
-- ---------------------------------------------------------------------
INSERT INTO tipo_asiento (nombre, descripcion, angulo_reclinacion_grados) VALUES
  ('Estándar',  'Asiento reclinable básico',                 110),
  ('Semi cama', 'Reclinación parcial con apoyapiés',         140),
  ('Cama',      'Reclinación casi horizontal',               160),
  ('Suite',     'Totalmente horizontal',                     180);

-- Servicios generales (id_empresa NULL) y uno propio de la empresa.
INSERT INTO servicio (id_empresa, nombre, descripcion) VALUES
  (NULL, 'WiFi',                    'Internet inalámbrico a bordo'),
  (NULL, 'Baño a bordo',            'Servicios higiénicos en el bus'),
  (NULL, 'Pantalla individual',     'Entretenimiento en cada asiento'),
  (NULL, 'Aire acondicionado',      'Climatización del bus'),
  (NULL, 'Puerto USB',              'Carga de dispositivos en el asiento'),
  (NULL, 'Frazadas y almohadas',    'Kit de descanso para viajes largos'),
  (NULL, 'Refrigerio',              'Snack y bebida de cortesía');
INSERT INTO servicio (id_empresa, nombre, descripcion)
VALUES ((SELECT id_empresa FROM empresa WHERE correo_electronico = 'empresa@example.com'),
        'Cafetería a bordo', 'Venta de bebidas calientes y snacks durante el viaje');

INSERT INTO caracteristica_zona (nombre, descripcion) VALUES
  ('Embarque preferente',     'Abordaje prioritario'),
  ('Snack de cortesía',       'Incluye snack y bebida'),
  ('Cena a bordo',            'Cena incluida en viajes nocturnos'),
  ('Atención personalizada',  'Azafata exclusiva para la zona');

-- ---------------------------------------------------------------------
-- 6. FLOTA: tipos de bus (plantillas), zonas, asientos, buses
-- ---------------------------------------------------------------------
INSERT INTO tipo_bus (id_empresa, nombre, descripcion)
SELECT e.id_empresa, v.nombre, v.descripcion
FROM empresa e
CROSS JOIN (VALUES
  ('Doble piso VIP + Económico', 'Piso 1: zona VIP (51 asientos en total con el piso 2)'),
  ('Un piso Salón 40',           'Bus de un piso con 40 asientos 2+2')
) AS v(nombre, descripcion)
WHERE e.correo_electronico = 'empresa@example.com';

INSERT INTO zona (id_tipo_bus, nombre, descripcion, tarifa_base_por_km)
SELECT t.id_tipo_bus, v.zona, v.descripcion, v.tarifa
FROM (VALUES
  ('Doble piso VIP + Económico', 'VIP',       'Piso 1: asientos cama, distribución 2+1',          0.1600),
  ('Doble piso VIP + Económico', 'Económica', 'Piso 2: semi cama y estándar, distribución 2+2',   0.0700),
  ('Un piso Salón 40',           'Salón',     'Piso 1: asientos estándar, distribución 2+2',      0.0600)
) AS v(tipo, zona, descripcion, tarifa)
JOIN tipo_bus t ON t.nombre = v.tipo;

INSERT INTO zona_caracteristica (id_zona, id_caracteristica)
SELECT z.id_zona, c.id_caracteristica
FROM (VALUES
  ('VIP', 'Embarque preferente'),
  ('VIP', 'Cena a bordo'),
  ('VIP', 'Atención personalizada'),
  ('Económica', 'Snack de cortesía')
) AS v(zona, caracteristica)
JOIN zona z ON z.nombre = v.zona
JOIN caracteristica_zona c ON c.nombre = v.caracteristica;

INSERT INTO zona_tipo_asiento (id_zona, id_tipo_asiento, tarifa_adicional)
SELECT z.id_zona, ta.id_tipo_asiento, v.adicional
FROM (VALUES
  ('VIP',       'Cama',      15.00),
  ('Económica', 'Semi cama',  8.00),
  ('Económica', 'Estándar',   0.00),
  ('Salón',     'Estándar',   0.00)
) AS v(zona, tipo_asiento, adicional)
JOIN zona z          ON z.nombre = v.zona
JOIN tipo_asiento ta ON ta.nombre = v.tipo_asiento;

-- Código = piso + letra de columna + fila (p. ej. 1A1). fila_mapa/columna_mapa dibujan el plano;
-- la columna 3 queda libre como pasillo.
-- VIP (piso 1): 5 filas, columnas A, B | pasillo | C  -> 15 asientos tipo Cama.
INSERT INTO asiento (id_tipo_bus, id_zona, id_tipo_asiento, codigo, tiene_ventana, fila_mapa, columna_mapa)
SELECT z.id_tipo_bus, z.id_zona, ta.id_tipo_asiento,
       '1' || l.letra || f.n::text, l.letra IN ('A', 'C'), f.n, l.col
FROM zona z
CROSS JOIN generate_series(1, 5) AS f(n)
CROSS JOIN (VALUES ('A', 1), ('B', 2), ('C', 4)) AS l(letra, col)
JOIN tipo_asiento ta ON ta.nombre = 'Cama'
WHERE z.nombre = 'VIP';

-- Económica (piso 2): 9 filas, A, B | pasillo | C, D -> 36 asientos (filas 1-3 semi cama, 4-9 estándar).
INSERT INTO asiento (id_tipo_bus, id_zona, id_tipo_asiento, codigo, tiene_ventana, fila_mapa, columna_mapa)
SELECT z.id_tipo_bus, z.id_zona, ta.id_tipo_asiento,
       '2' || l.letra || f.n::text, l.letra IN ('A', 'D'), f.n, l.col
FROM zona z
CROSS JOIN generate_series(1, 9) AS f(n)
CROSS JOIN (VALUES ('A', 1), ('B', 2), ('C', 4), ('D', 5)) AS l(letra, col)
JOIN tipo_asiento ta ON ta.nombre = CASE WHEN f.n <= 3 THEN 'Semi cama' ELSE 'Estándar' END
WHERE z.nombre = 'Económica';

-- Salón (un piso): 10 filas, A, B | pasillo | C, D -> 40 asientos estándar.
INSERT INTO asiento (id_tipo_bus, id_zona, id_tipo_asiento, codigo, tiene_ventana, fila_mapa, columna_mapa)
SELECT z.id_tipo_bus, z.id_zona, ta.id_tipo_asiento,
       '1' || l.letra || f.n::text, l.letra IN ('A', 'D'), f.n, l.col
FROM zona z
CROSS JOIN generate_series(1, 10) AS f(n)
CROSS JOIN (VALUES ('A', 1), ('B', 2), ('C', 4), ('D', 5)) AS l(letra, col)
JOIN tipo_asiento ta ON ta.nombre = 'Estándar'
WHERE z.nombre = 'Salón';

-- Buses (4 de doble piso y 2 de un piso). La velocidad promedio define los horarios estimados.
INSERT INTO bus (id_empresa, id_tipo_bus, placa, marca, modelo, anio_fabricacion, velocidad_promedio_kmh)
SELECT t.id_empresa, t.id_tipo_bus, v.placa, v.marca, v.modelo, v.anio, v.velocidad
FROM (VALUES
  ('AVF-412', 'Doble piso VIP + Económico', 'Volvo',         'B450R',    2022, 65.00),
  ('BKL-930', 'Doble piso VIP + Económico', 'Scania',        'K410',     2021, 62.00),
  ('CDM-257', 'Doble piso VIP + Económico', 'Mercedes-Benz', 'O-500 RSD',2023, 68.00),
  ('GHT-508', 'Doble piso VIP + Económico', 'Volvo',         'B450R',    2024, 65.00),
  ('D5T-681', 'Un piso Salón 40',           'Marcopolo',     'Paradiso', 2020, 60.00),
  ('F2K-374', 'Un piso Salón 40',           'Hyundai',       'Universe', 2019, 60.00)
) AS v(placa, tipo, marca, modelo, anio, velocidad)
JOIN tipo_bus t ON t.nombre = v.tipo;

INSERT INTO bus_servicio (id_bus, id_servicio)
SELECT b.id_bus, s.id_servicio
FROM bus b
JOIN tipo_bus t ON t.id_tipo_bus = b.id_tipo_bus AND t.nombre = 'Doble piso VIP + Económico'
JOIN servicio s ON s.nombre IN ('WiFi', 'Baño a bordo', 'Pantalla individual', 'Aire acondicionado',
                                'Puerto USB', 'Frazadas y almohadas', 'Cafetería a bordo');

INSERT INTO bus_servicio (id_bus, id_servicio)
SELECT b.id_bus, s.id_servicio
FROM bus b
JOIN tipo_bus t ON t.id_tipo_bus = b.id_tipo_bus AND t.nombre = 'Un piso Salón 40'
JOIN servicio s ON s.nombre IN ('Baño a bordo', 'Aire acondicionado', 'Puerto USB');

-- ---------------------------------------------------------------------
-- 7. CHOFERES (no inician sesión). El chofer 10 queda libre como suplente.
-- ---------------------------------------------------------------------
INSERT INTO chofer (id_empresa, nombres, apellidos, numero_documento, numero_licencia,
                    categoria_licencia, telefono, fecha_nacimiento)
SELECT e.id_empresa, v.nombres, v.apellidos, v.dni, v.licencia, v.categoria, v.telefono, v.nac::date
FROM empresa e
CROSS JOIN (VALUES
  ('Carlos',  'Mendoza Quispe',    '40123451', 'Q40123451', 'A-IIIb', '951000001', '1980-02-11'),
  ('Luis',    'Huamán Rojas',      '41234562', 'Q41234562', 'A-IIIb', '951000002', '1982-07-23'),
  ('Jorge',   'Valdivia Cáceres',  '42345673', 'Q42345673', 'A-IIIc', '951000003', '1979-11-05'),
  ('Miguel',  'Salas Condori',     '43456784', 'Q43456784', 'A-IIIb', '951000004', '1985-01-30'),
  ('Pedro',   'Anccasi Flores',    '44567895', 'Q44567895', 'A-IIIc', '951000005', '1977-09-17'),
  ('Ricardo', 'Paredes Zegarra',   '45678906', 'Q45678906', 'A-IIIb', '951000006', '1983-04-08'),
  ('Víctor',  'Choque Mamani',     '46789017', 'Q46789017', 'A-IIIb', '951000007', '1981-12-14'),
  ('Hugo',    'Ticona Apaza',      '47890128', 'Q47890128', 'A-IIIb', '951000008', '1986-06-02'),
  ('Fredy',   'Quispe Huanca',     '48901239', 'Q48901239', 'A-IIIc', '951000009', '1978-10-26'),
  ('Marco',   'Cárdenas Vega',     '49012340', 'Q49012340', 'A-IIIb', '951000010', '1990-03-19')
) AS v(nombres, apellidos, dni, licencia, categoria, telefono, nac)
WHERE e.correo_electronico = 'empresa@example.com';

-- ---------------------------------------------------------------------
-- 8. RUTAS (de la empresa) Y TRAMOS
-- ---------------------------------------------------------------------
INSERT INTO ruta (id_empresa, nombre, id_terminal_origen, id_terminal_destino)
SELECT e.id_empresa, v.nombre, o.id_terminal, d.id_terminal
FROM empresa e
CROSS JOIN (VALUES
  ('Lima - Arequipa',   'Terminal Plaza Norte',          'Terminal Terrestre Arequipa'),
  ('Arequipa - Lima',   'Terminal Terrestre Arequipa',   'Terminal Plaza Norte'),
  ('Arequipa - Tacna',  'Terminal Terrestre Arequipa',   'Terminal Terrestre Tacna'),
  ('Tacna - Arequipa',  'Terminal Terrestre Tacna',      'Terminal Terrestre Arequipa'),
  ('Tacna - Arica',     'Terminal Terrestre Tacna',      'Terminal Internacional Arica'),
  ('Arica - Tacna',     'Terminal Internacional Arica',  'Terminal Terrestre Tacna'),
  ('Cusco - La Paz',    'Terminal Terrestre Cusco',      'Terminal de Buses La Paz'),
  ('La Paz - Cusco',    'Terminal de Buses La Paz',      'Terminal Terrestre Cusco')
) AS v(nombre, origen, destino)
JOIN terminal o ON o.nombre = v.origen
JOIN terminal d ON d.nombre = v.destino
WHERE e.correo_electronico = 'empresa@example.com';

-- Tramos contiguos 1..n (distancias por carretera aproximadas). Se validan al COMMIT.
INSERT INTO tramo_ruta (id_ruta, posicion, id_terminal_inicio, id_terminal_fin, distancia_km)
SELECT r.id_ruta, v.pos, ti.id_terminal, tf.id_terminal, v.km
FROM (VALUES
  ('Lima - Arequipa', 1, 'Terminal Plaza Norte',         'Terminal Terrestre Ica',          303.00),
  ('Lima - Arequipa', 2, 'Terminal Terrestre Ica',       'Terminal Terrestre Nazca',        140.00),
  ('Lima - Arequipa', 3, 'Terminal Terrestre Nazca',     'Terminal Terrestre Arequipa',     570.00),

  ('Arequipa - Lima', 1, 'Terminal Terrestre Arequipa',  'Terminal Terrestre Nazca',        570.00),
  ('Arequipa - Lima', 2, 'Terminal Terrestre Nazca',     'Terminal Terrestre Ica',          140.00),
  ('Arequipa - Lima', 3, 'Terminal Terrestre Ica',       'Terminal Plaza Norte',            303.00),

  ('Arequipa - Tacna', 1, 'Terminal Terrestre Arequipa', 'Terminal Terrestre Moquegua',     215.00),
  ('Arequipa - Tacna', 2, 'Terminal Terrestre Moquegua', 'Terminal Terrestre Tacna',        155.00),

  ('Tacna - Arequipa', 1, 'Terminal Terrestre Tacna',    'Terminal Terrestre Moquegua',     155.00),
  ('Tacna - Arequipa', 2, 'Terminal Terrestre Moquegua', 'Terminal Terrestre Arequipa',     215.00),

  ('Tacna - Arica',   1, 'Terminal Terrestre Tacna',     'Terminal Internacional Arica',     62.00),
  ('Arica - Tacna',   1, 'Terminal Internacional Arica', 'Terminal Terrestre Tacna',         62.00),

  ('Cusco - La Paz',  1, 'Terminal Terrestre Cusco',     'Terminal Terrestre Puno',         390.00),
  ('Cusco - La Paz',  2, 'Terminal Terrestre Puno',      'Terminal de Buses La Paz',        410.00),

  ('La Paz - Cusco',  1, 'Terminal de Buses La Paz',     'Terminal Terrestre Puno',         410.00),
  ('La Paz - Cusco',  2, 'Terminal Terrestre Puno',      'Terminal Terrestre Cusco',        390.00)
) AS v(ruta, pos, ini, fin, km)
JOIN ruta r      ON r.nombre = v.ruta
JOIN terminal ti ON ti.nombre = v.ini
JOIN terminal tf ON tf.nombre = v.fin;

-- ---------------------------------------------------------------------
-- 9. POLÍTICA DE CANCELACIÓN (reembolso según horas antes de la salida)
-- ---------------------------------------------------------------------
INSERT INTO politica_cancelacion (id_empresa, horas_antes_salida, porcentaje_reembolso)
SELECT e.id_empresa, v.horas, v.pct
FROM empresa e
CROSS JOIN (VALUES (48, 90), (24, 70), (12, 50), (6, 25), (0, 0)) AS v(horas, pct)
WHERE e.correo_electronico = 'empresa@example.com';

-- ---------------------------------------------------------------------
-- 10. PLANES DE VIAJE (uno por ruta). tiempo_parada_horas = espera en cada terminal
--     intermedio y también el descanso del chofer. Vigencia: nov 2026 - may 2027.
-- ---------------------------------------------------------------------
INSERT INTO plan_viaje (id_empresa, id_ruta, nombre, vigencia_inicio, vigencia_fin, tiempo_parada_horas)
SELECT r.id_empresa, r.id_ruta, 'Plan ' || r.nombre,
       TIMESTAMPTZ '2026-11-01 00:00:00+00', TIMESTAMPTZ '2027-06-01 00:00:00+00', v.parada
FROM (VALUES
  ('Lima - Arequipa',  0.50),
  ('Arequipa - Lima',  0.50),
  ('Arequipa - Tacna', 0.25),
  ('Tacna - Arequipa', 0.25),
  ('Tacna - Arica',    0.00),
  ('Arica - Tacna',    0.00),
  ('Cusco - La Paz',   1.00),
  ('La Paz - Cusco',   1.00)
) AS v(ruta, parada)
JOIN ruta r ON r.nombre = v.ruta;

-- ---------------------------------------------------------------------
-- 11. FRECUENCIAS (día de la semana y hora en UTC; 1 = lunes ... 7 = domingo)
--   Lima/Arequipa/Tacna/Cusco = UTC-5, así que 00:00 UTC = 19:00 hora local del día anterior.
--   Lima - Arequipa (sale 19:00 local):
--     Bus AVF-412: lun, mié, vie local (UTC 2,4,6) | BKL-930: mar, jue, sáb (UTC 3,5,7) | CDM-257: dom (UTC 1)
--   Arequipa - Lima (sale 19:00 local, el bus vuelve al día siguiente de llegar):
--     AVF-412: mar, jue, sáb (UTC 3,5,7) | BKL-930: mié, vie, dom (UTC 4,6,1) | CDM-257: lun (UTC 2)
--   Arequipa - Tacna 07:00 local (12:00 UTC) lun, mié, vie; Tacna - Arequipa mar, jue, sáb.
--   Tacna - Arica 08:00 local (13:00 UTC) y Arica - Tacna 13:00 local (18:00 UTC), lun a vie.
--   Cusco - La Paz sale 20:00 local (01:00 UTC del día siguiente): mar y vie local (UTC 3,6);
--   La Paz - Cusco: UTC 4,7.
-- Ningún bus ni chofer se solapa consigo mismo (las exclusiones del DDL lo validan al generar).
-- ---------------------------------------------------------------------
INSERT INTO frecuencia (id_plan, id_empresa, id_dia, hora_salida_utc, id_bus, id_chofer)
SELECT pl.id_plan, pl.id_empresa, d.dia, f.hora::time, b.id_bus, c.id_chofer
FROM (VALUES
  ('Lima - Arequipa',  'AVF-412', 'Q40123451', '00:00', ARRAY[2,4,6]),
  ('Lima - Arequipa',  'BKL-930', 'Q42345673', '00:00', ARRAY[3,5,7]),
  ('Lima - Arequipa',  'CDM-257', 'Q44567895', '00:00', ARRAY[1]),
  ('Arequipa - Lima',  'AVF-412', 'Q41234562', '00:00', ARRAY[3,5,7]),
  ('Arequipa - Lima',  'BKL-930', 'Q43456784', '00:00', ARRAY[4,6,1]),
  ('Arequipa - Lima',  'CDM-257', 'Q45678906', '00:00', ARRAY[2]),
  ('Arequipa - Tacna', 'D5T-681', 'Q46789017', '12:00', ARRAY[1,3,5]),
  ('Tacna - Arequipa', 'D5T-681', 'Q46789017', '12:00', ARRAY[2,4,6]),
  ('Tacna - Arica',    'F2K-374', 'Q47890128', '13:00', ARRAY[1,2,3,4,5]),
  ('Arica - Tacna',    'F2K-374', 'Q47890128', '18:00', ARRAY[1,2,3,4,5]),
  ('Cusco - La Paz',   'GHT-508', 'Q48901239', '01:00', ARRAY[3,6]),
  ('La Paz - Cusco',   'GHT-508', 'Q48901239', '01:00', ARRAY[4,7])
) AS f(ruta, placa, licencia, hora, dias)
CROSS JOIN LATERAL unnest(f.dias) AS d(dia)
JOIN plan_viaje pl ON pl.nombre = 'Plan ' || f.ruta
JOIN bus b         ON b.placa = f.placa
JOIN chofer c      ON c.numero_licencia = f.licencia;

-- ---------------------------------------------------------------------
-- 12. GENERACIÓN DE VIAJES (90 días desde el 10/nov/2026). Estricto: si hubiera solape
--     de bus o chofer, el script falla con un mensaje claro. p_solo_futuros = FALSE para que
--     el rango sea fijo sin depender del reloj del servidor.
-- ---------------------------------------------------------------------
SELECT sp_generar_viajes(DATE '2026-11-10', DATE '2027-02-07', NULL, TRUE, FALSE) AS viajes_generados;

-- ---------------------------------------------------------------------
-- 13. RESERVAS DE EJEMPLO (todas del viajero@example.com), usando viajes futuros
--     Flujo: reserva (hold 10 min) -> pasajeros -> boletos -> pago PAGADO (el trigger
--     pasa la reserva a PAGADA).
--     R1: 2 pasajeros, Lima -> Arequipa en VIP.
--     R2: ida y vuelta Lima -> Nazca -> Lima (dos viajes, sentido IDA y VUELTA).
--     R3: con escala: Lima -> Arequipa y luego Arequipa -> Tacna (otro viaje, otro tipo de bus).
--     R4: Tacna -> Arica, pagada y luego CANCELADA por el viajero (reembolso según política).
--     R5: Cusco -> La Paz (internacional) con un pasajero extranjero con pasaporte.
-- ---------------------------------------------------------------------
DO $$
DECLARE
  v_viajero INT; v_res INT; v_pas1 INT; v_pas2 INT;
  v_v1 INT; v_v2 INT; v_ini TIMESTAMPTZ; v_arr TIMESTAMPTZ; v_monto NUMERIC;
BEGIN
  SELECT id_viajero INTO STRICT v_viajero FROM viajero WHERE correo_electronico = 'viajero@example.com';

  -- ===== R1: Lima -> Arequipa, 2 pasajeros VIP =====
  SELECT v.id_viaje INTO STRICT v_v1
  FROM viaje v
  JOIN frecuencia fr ON fr.id_frecuencia = v.id_frecuencia
  JOIN plan_viaje pl ON pl.id_plan = fr.id_plan
  WHERE pl.nombre = 'Plan Lima - Arequipa' AND v.estado = 'PROGRAMADO'
    AND v.inicio_utc > now() + interval '5 days'
  ORDER BY v.inicio_utc LIMIT 1;

  INSERT INTO reserva (id_viajero, contacto_correo, contacto_telefono)
  VALUES (v_viajero, 'viajero@example.com', '987654321') RETURNING id_reserva INTO v_res;
  INSERT INTO pasajero (id_reserva, id_viajero, tipo_documento, numero_documento, nombres, apellidos,
                        fecha_nacimiento, correo_electronico, telefono)
  VALUES (v_res, v_viajero, 'DNI', '72345678', 'Andrea', 'Torres Salazar', DATE '1998-05-14',
          'viajero@example.com', '987654321') RETURNING id_pasajero INTO v_pas1;
  INSERT INTO pasajero (id_reserva, tipo_documento, numero_documento, nombres, apellidos,
                        fecha_nacimiento, telefono)
  VALUES (v_res, 'DNI', '70123456', 'Luis', 'Torres Salazar', DATE '2001-09-02', '987000111')
  RETURNING id_pasajero INTO v_pas2;
  PERFORM fn_crear_boleto(v_res, v_pas1, v_v1, 1, 4, '1A1');
  PERFORM fn_crear_boleto(v_res, v_pas2, v_v1, 1, 4, '1B1');
  SELECT COALESCE(SUM(precio_total), 0) INTO v_monto FROM boleto WHERE id_reserva = v_res;
  INSERT INTO pago (id_reserva, monto, moneda, metodo_pago, estado, codigo_transaccion, pagado_en)
  VALUES (v_res, v_monto, 'PEN', 'YAPE', 'PAGADO', 'YAPE-20261109-0001', now());

  -- ===== R2: ida y vuelta Lima -> Nazca -> Lima =====
  SELECT v.id_viaje, v.inicio_utc INTO STRICT v_v1, v_ini
  FROM viaje v
  JOIN frecuencia fr ON fr.id_frecuencia = v.id_frecuencia
  JOIN plan_viaje pl ON pl.id_plan = fr.id_plan
  WHERE pl.nombre = 'Plan Lima - Arequipa' AND v.estado = 'PROGRAMADO'
    AND v.inicio_utc > now() + interval '7 days'
  ORDER BY v.inicio_utc LIMIT 1;

  SELECT v.id_viaje INTO STRICT v_v2
  FROM viaje v
  JOIN frecuencia fr ON fr.id_frecuencia = v.id_frecuencia
  JOIN plan_viaje pl ON pl.id_plan = fr.id_plan
  WHERE pl.nombre = 'Plan Arequipa - Lima' AND v.estado = 'PROGRAMADO'
    AND v.inicio_utc > v_ini + interval '3 days'
  ORDER BY v.inicio_utc LIMIT 1;

  INSERT INTO reserva (id_viajero, contacto_correo, contacto_telefono)
  VALUES (v_viajero, 'viajero@example.com', '987654321') RETURNING id_reserva INTO v_res;
  INSERT INTO pasajero (id_reserva, id_viajero, tipo_documento, numero_documento, nombres, apellidos,
                        fecha_nacimiento, correo_electronico, telefono)
  VALUES (v_res, v_viajero, 'DNI', '72345678', 'Andrea', 'Torres Salazar', DATE '1998-05-14',
          'viajero@example.com', '987654321') RETURNING id_pasajero INTO v_pas1;
  -- Lima (pos 1) -> Nazca (pos 3) en la ruta Lima - Arequipa
  PERFORM fn_crear_boleto(v_res, v_pas1, v_v1, 1, 3, '2B5', 1, 'IDA'::sentido_trayecto);
  -- Nazca (pos 2) -> Lima (pos 4) en la ruta Arequipa - Lima
  PERFORM fn_crear_boleto(v_res, v_pas1, v_v2, 2, 4, '2B5', 2, 'VUELTA'::sentido_trayecto);
  SELECT COALESCE(SUM(precio_total), 0) INTO v_monto FROM boleto WHERE id_reserva = v_res;
  INSERT INTO pago (id_reserva, monto, moneda, metodo_pago, estado, codigo_transaccion, pagado_en)
  VALUES (v_res, v_monto, 'PEN', 'TARJETA', 'PAGADO', 'TRX-20261109-0002', now());

  -- ===== R3: con escala Lima -> Arequipa (bus doble piso) + Arequipa -> Tacna (bus un piso) =====
  SELECT v.id_viaje INTO STRICT v_v1
  FROM viaje v
  JOIN frecuencia fr ON fr.id_frecuencia = v.id_frecuencia
  JOIN plan_viaje pl ON pl.id_plan = fr.id_plan
  WHERE pl.nombre = 'Plan Lima - Arequipa' AND v.estado = 'PROGRAMADO'
    AND v.inicio_utc > now() + interval '9 days'
  ORDER BY v.inicio_utc LIMIT 1;
  SELECT llegada_estimada_actual INTO STRICT v_arr
  FROM viaje_parada WHERE id_viaje = v_v1 AND posicion = 4;

  -- primer viaje Arequipa - Tacna que sale al menos 1 hora después de llegar a Arequipa
  SELECT v.id_viaje INTO STRICT v_v2
  FROM viaje v
  JOIN frecuencia fr ON fr.id_frecuencia = v.id_frecuencia
  JOIN plan_viaje pl ON pl.id_plan = fr.id_plan
  JOIN viaje_parada vp ON vp.id_viaje = v.id_viaje AND vp.posicion = 1
  WHERE pl.nombre = 'Plan Arequipa - Tacna' AND v.estado = 'PROGRAMADO'
    AND vp.salida_estimada_actual >= v_arr + interval '1 hour'
  ORDER BY v.inicio_utc LIMIT 1;

  INSERT INTO reserva (id_viajero, contacto_correo, contacto_telefono)
  VALUES (v_viajero, 'viajero@example.com', '987654321') RETURNING id_reserva INTO v_res;
  INSERT INTO pasajero (id_reserva, id_viajero, tipo_documento, numero_documento, nombres, apellidos,
                        fecha_nacimiento, correo_electronico, telefono)
  VALUES (v_res, v_viajero, 'DNI', '72345678', 'Andrea', 'Torres Salazar', DATE '1998-05-14',
          'viajero@example.com', '987654321') RETURNING id_pasajero INTO v_pas1;
  PERFORM fn_crear_boleto(v_res, v_pas1, v_v1, 1, 4, '2C2', 1, 'IDA'::sentido_trayecto);
  PERFORM fn_crear_boleto(v_res, v_pas1, v_v2, 1, 3, '1C4', 2, 'IDA'::sentido_trayecto);
  SELECT COALESCE(SUM(precio_total), 0) INTO v_monto FROM boleto WHERE id_reserva = v_res;
  INSERT INTO pago (id_reserva, monto, moneda, metodo_pago, estado, codigo_transaccion, pagado_en)
  VALUES (v_res, v_monto, 'PEN', 'PLIN', 'PAGADO', 'PLIN-20261109-0003', now());

  -- ===== R4: Tacna -> Arica, pagada y luego cancelada por el viajero =====
  SELECT v.id_viaje INTO STRICT v_v1
  FROM viaje v
  JOIN frecuencia fr ON fr.id_frecuencia = v.id_frecuencia
  JOIN plan_viaje pl ON pl.id_plan = fr.id_plan
  WHERE pl.nombre = 'Plan Tacna - Arica' AND v.estado = 'PROGRAMADO'
    AND v.inicio_utc > now() + interval '3 days'
  ORDER BY v.inicio_utc LIMIT 1;

  INSERT INTO reserva (id_viajero, contacto_correo, contacto_telefono)
  VALUES (v_viajero, 'viajero@example.com', '987654321') RETURNING id_reserva INTO v_res;
  INSERT INTO pasajero (id_reserva, id_viajero, tipo_documento, numero_documento, nombres, apellidos,
                        fecha_nacimiento, correo_electronico, telefono)
  VALUES (v_res, v_viajero, 'DNI', '72345678', 'Andrea', 'Torres Salazar', DATE '1998-05-14',
          'viajero@example.com', '987654321') RETURNING id_pasajero INTO v_pas1;
  PERFORM fn_crear_boleto(v_res, v_pas1, v_v1, 1, 2, '1A1');
  SELECT COALESCE(SUM(precio_total), 0) INTO v_monto FROM boleto WHERE id_reserva = v_res;
  INSERT INTO pago (id_reserva, monto, moneda, metodo_pago, estado, codigo_transaccion, pagado_en)
  VALUES (v_res, v_monto, 'PEN', 'YAPE', 'PAGADO', 'YAPE-20261109-0004', now());
  PERFORM fn_cancelar_reserva(v_res, 'Cambio de planes personales', v_viajero);

  -- ===== R5: Cusco -> La Paz (internacional), un pasajero con pasaporte =====
  SELECT v.id_viaje INTO STRICT v_v1
  FROM viaje v
  JOIN frecuencia fr ON fr.id_frecuencia = v.id_frecuencia
  JOIN plan_viaje pl ON pl.id_plan = fr.id_plan
  WHERE pl.nombre = 'Plan Cusco - La Paz' AND v.estado = 'PROGRAMADO'
    AND v.inicio_utc > now() + interval '12 days'
  ORDER BY v.inicio_utc LIMIT 1;

  INSERT INTO reserva (id_viajero, contacto_correo, contacto_telefono)
  VALUES (v_viajero, 'viajero@example.com', '987654321') RETURNING id_reserva INTO v_res;
  INSERT INTO pasajero (id_reserva, id_viajero, tipo_documento, numero_documento, nombres, apellidos,
                        fecha_nacimiento, correo_electronico, telefono)
  VALUES (v_res, v_viajero, 'DNI', '72345678', 'Andrea', 'Torres Salazar', DATE '1998-05-14',
          'viajero@example.com', '987654321') RETURNING id_pasajero INTO v_pas1;
  INSERT INTO pasajero (id_reserva, tipo_documento, numero_documento, nombres, apellidos,
                        fecha_nacimiento, correo_electronico)
  VALUES (v_res, 'PASAPORTE', 'X1234567', 'Marie', 'Dubois', DATE '1995-01-25', 'marie.dubois@example.com')
  RETURNING id_pasajero INTO v_pas2;
  PERFORM fn_crear_boleto(v_res, v_pas1, v_v1, 1, 3, '1A2');
  PERFORM fn_crear_boleto(v_res, v_pas2, v_v1, 1, 3, '1B2');
  SELECT COALESCE(SUM(precio_total), 0) INTO v_monto FROM boleto WHERE id_reserva = v_res;
  INSERT INTO pago (id_reserva, monto, moneda, metodo_pago, estado, codigo_transaccion, pagado_en)
  VALUES (v_res, v_monto, 'PEN', 'TRANSFERENCIA', 'PAGADO', 'TRF-20261109-0005', now());
END $$;

COMMIT;
