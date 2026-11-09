-- =====================================================================
-- RESERBUS — datos de prueba para Supabase (PostgreSQL)
-- Ejecutar DESPUÉS de reserbus_supabase.sql, en el SQL Editor.
--
--  * Es re-ejecutable: borra los datos de las tablas del sistema y los
--    usuarios "seed" de Auth antes de volver a cargarlos.
--  * Crea los usuarios en auth.users (63). SOLO estos 3 pueden iniciar
--    sesión (contraseña 12345678); el resto tiene una clave aleatoria
--    que nadie conoce:
--        viajero@example.com | empresa@example.com | administrador@example.com
--  * NO toca administradores que hayas creado tú (script crear-admin.js).
--  * OJO: borra viajeros y empresas existentes (también los registrados
--    por Google). Úsalo en una BD de desarrollo.
-- =====================================================================
BEGIN;

-- ---------- 0. LIMPIEZA ----------
TRUNCATE boleto, pasajero, reserva, pago, tarifa, viaje, ruta, terminal,
         bus_servicio, asiento, piso, bus, servicio, tipo_de_asiento,
         empresa, viajero
  RESTART IDENTITY CASCADE;
DELETE FROM auth.users WHERE raw_app_meta_data->>'seed' = 'true';

-- ---------- 1. USUARIOS: datos de origen ----------
CREATE TEMP TABLE seed_admin (n INT, correo TEXT, nombres TEXT, apellidos TEXT, fecha_nacimiento DATE);
INSERT INTO seed_admin VALUES
(1,'malomireia@yahoo.com','Felipa','Mulet Batlle',NULL),
(2,'vcifuentes@naranjo.com','Emiliano','Lobo Carnero',NULL),
(3,'amparosantamaria@gmail.com','Nicolás','Cisneros',NULL),
(4,'marinpaulino@hierro.org','Primitiva','Alemany',NULL),
(5,'baenamacarena@hotmail.com','Bernardino Rodolfo','Mena Ruiz',NULL),
(6,'solivares@baron-aliaga.com','Georgina','Vives',NULL),
(7,'verdugoarcelia@valcarcel-perera.org','Agustín','Dalmau Isern',NULL),
(8,'arseniojauregui@jara-sanabria.es','Edgardo Fidel','Báez Briones',NULL),
(9,'xpascual@gmail.com','Raúl','Quintero Cisneros',NULL),
(10,'roldansalud@gmail.com','Melisa','Quiroga Ávila',NULL),
(11,'dafnealmeida@torrents.net','Serafina','Lledó Naranjo',NULL),
(12,'guiomargisbert@gargallo-tirado.es','Nicolasa','Fiol Belda',NULL),
(13,'buenoamparo@yahoo.com','Bibiana','de Bayón',NULL),
(14,'amador19@yahoo.com','Juan','Terrón Casanova',NULL),
(15,'scardenas@hotmail.com','Leyre','Garay Escrivá',NULL),
(16,'csuarez@pablo.es','Encarnación','Gonzalez Santos',NULL),
(17,'ibanroda@hotmail.com','Sergio','Quirós',NULL),
(18,'amaya10@cobo.com','Faustino','Barros',NULL),
(19,'martinnadia@yahoo.com','Aníbal Jaume','Gimenez',NULL),
(20,'ebayon@hotmail.com','Cándido','Torrecilla Valencia',NULL),
(21,'administrador@example.com','Angel','Cruz Ramirez','2001-06-12');

CREATE TEMP TABLE seed_empresa (n INT, correo TEXT, razon_social TEXT, ruc TEXT, descripcion TEXT);
INSERT INTO seed_empresa VALUES
(1,'eroca@lopez-iniesta.es','Roda PLC','51655431894','Profound methodical methodology'),
(2,'rocamoranacho@yahoo.com','Vergara-Montoya','61884306140','Integrated 4thgeneration utilization'),
(3,'cloemir@haro.es','Doménech-Mata','51900473271','Phased national moratorium'),
(4,'franciscopepita@hotmail.com','Vigil-Galindo','52664148083','Upgradable mobile projection'),
(5,'jose-manuel38@morcillo-becerra.com','Gonzalo-Ramis','8622500353','Inverse even-keeled array'),
(6,'romulo79@carbajo.es','Abascal Ltd','4824570611','Advanced optimal process improvement'),
(7,'carlos43@yahoo.com','Morillo-Rocha','49442264449','Re-contextualized mission-critical framework'),
(8,'benitezyago@herranz.com','Sabater Ltd','45796169036','Intuitive 4thgeneration complexity'),
(9,'patinofeliciano@yahoo.com','Ayuso and Sons','37235174578','Sharable eco-centric capability'),
(10,'vsuarez@cabezas-vall.es','Plana LLC','28054833682','Quality-focused regional framework'),
(11,'edelmiroballesteros@hotmail.com','Herrera Ltd','90974693426','Automated object-oriented forecast'),
(12,'kterron@velasco.net','Garay-Arco','85951965846','Public-key tangible workforce'),
(13,'piarocha@hotmail.com','Carrión-Nogués','26409728118','Realigned intangible definition'),
(14,'carmelita54@yahoo.com','Sanjuan-Roig','1621443310','Advanced optimal attitude'),
(15,'huria@aparicio-robledo.es','Borrell, Iglesia and Maza','97697496700','Reverse-engineered impactful hub'),
(16,'feliciamacias@gmail.com','Seco, Gilabert and Cabanillas','8003304981','Self-enabling web-enabled matrices'),
(17,'veronica14@ramirez-pelayo.es','Paredes-Bernad','28996882017','Profound user-facing orchestration'),
(18,'jose-mari16@hotmail.com','Bayón and Sons','11967606780','Vision-oriented dedicated algorithm'),
(19,'rocamorasaturnina@yahoo.com','Peralta, Martinez and Sala','91188989185','Advanced fresh-thinking knowledge user'),
(20,'vicentasalinas@albero.es','Puga-Mora','24257701941','Multi-channeled reciprocal intranet'),
(21,'empresa@example.com','Empresa S.A.C.','20100070970','abcde');

CREATE TEMP TABLE seed_viajero (n INT, correo TEXT, nombres TEXT, apellidos TEXT, telefono TEXT, fecha_nacimiento DATE);
INSERT INTO seed_viajero VALUES
(1,'haguirre@palma.org','Rocío','Murillo Vara','+34746 014 967',NULL),
(2,'paz02@colom.es','Jordi Gonzalo','Cuesta Anglada','+34912 98 20 78',NULL),
(3,'isauracarmona@terron.com','Ricardo Matías','Abellán Pedrosa','+34 735 96 39 97',NULL),
(4,'vegaloreto@acuna.es','Ulises','Pedrero Abellán','+34734 825 063',NULL),
(5,'otorrens@yahoo.com','Lorenzo','Porras Jover','+34 748 48 40 75',NULL),
(6,'lbermudez@canizares.es','Andrés Felipe','Viñas Rosselló','+34919 99 57 82',NULL),
(7,'amarilis34@baro.com','Isabel','Girona Ribas','+34949584087',NULL),
(8,'jpeiro@yahoo.com','Azucena','Macias Girón','+34 747 41 95 88',NULL),
(9,'manola63@goni.es','Raúl','Benigno Criado Cases','+34713 448 951',NULL),
(10,'encarnacion46@elorza-diaz.org','Elpidio Franco','Sarabia','+34 935 81 40 53',NULL),
(11,'mreal@olivera.es','Daniel','Bilbao Guardia','+34739 64 91 93',NULL),
(12,'julie69@yahoo.com','Caridad','Cano Cantón','+34 727 240 312',NULL),
(13,'gracianogoni@nebot-barba.com','Vera','Llorens Sedano','+34604 418 271',NULL),
(14,'custodiafiguerola@sandoval.com','Elodia','Mateos','+34979 18 44 99',NULL),
(15,'vidal95@ramirez.com','Adolfo','Mendizábal Murcia','+34 736 32 35 40',NULL),
(16,'brobles@yahoo.com','Melchor','Cózar','+34665 053 123',NULL),
(17,'ciriaco46@gmail.com','Narcisa','Vicens Cortes','+34 730 67 08 35',NULL),
(18,'primitivo50@vera-gaya.com','Cesar','Serra','+34 985 60 43 63',NULL),
(19,'panfilosobrino@aguila.com','Agustina','Álvarez Martínez','+34891865083',NULL),
(20,'tmartin@molins.com','Tristán','Álamo Ruiz','+34 723958732',NULL),
(21,'viajero@example.com','Luisito','Comunica','+51 123456789','1998-04-27');

-- ---------- 2. USUARIOS EN SUPABASE AUTH ----------
CREATE TEMP TABLE seed_auth AS
  SELECT n, correo, 'ADMIN'::TEXT AS rol, gen_random_uuid() AS id,
         jsonb_build_object('nombres', nombres, 'apellidos', apellidos) AS meta
    FROM seed_admin
  UNION ALL
  SELECT n, correo, 'EMPRESA', gen_random_uuid(), '{}'::JSONB FROM seed_empresa
  UNION ALL
  SELECT n, correo, 'VIAJERO', gen_random_uuid(),
         jsonb_build_object('nombres', nombres, 'apellidos', apellidos)
    FROM seed_viajero;

-- Los viajeros NO llevan "rol": así el trigger on_auth_user_created crea su fila en "viajero".
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
SELECT
  '00000000-0000-0000-0000-000000000000', s.id, 'authenticated', 'authenticated', s.correo,
  extensions.crypt(
    CASE WHEN s.correo IN ('viajero@example.com','empresa@example.com','administrador@example.com')
         THEN '12345678' ELSE gen_random_uuid()::TEXT END,
    extensions.gen_salt('bf')),
  now(),
  jsonb_build_object('provider','email','providers',jsonb_build_array('email'),'seed','true')
    || CASE WHEN s.rol = 'VIAJERO' THEN '{}'::JSONB ELSE jsonb_build_object('rol', s.rol) END,
  s.meta, now(), now(),
  '', '', '', '', '', '', '', ''
FROM seed_auth s
ORDER BY s.rol, s.n;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), s.id, s.id::TEXT,
       jsonb_build_object('sub', s.id::TEXT, 'email', s.correo, 'email_verified', true, 'phone_verified', false),
       'email', now(), now(), now()
FROM seed_auth s;

-- ---------- 3. FILAS DE NEGOCIO LIGADAS A LOS USUARIOS ----------
INSERT INTO administrador (id_auth, correo_electronico, nombres, apellidos, fecha_nacimiento)
SELECT a.id, d.correo, d.nombres, d.apellidos, d.fecha_nacimiento
FROM seed_admin d JOIN seed_auth a ON a.correo = d.correo
ORDER BY d.n;

INSERT INTO empresa (id_auth, correo_electronico, razon_social, ruc, descripcion)
SELECT a.id, d.correo, d.razon_social, d.ruc, d.descripcion
FROM seed_empresa d JOIN seed_auth a ON a.correo = d.correo
ORDER BY d.n;

-- La fila de viajero ya la creó el trigger (nombres y apellidos salen del metadata); completamos el resto
UPDATE viajero v
   SET telefono = d.telefono, fecha_nacimiento = d.fecha_nacimiento
  FROM seed_viajero d
 WHERE v.correo_electronico = d.correo;

-- ---------- 4. CATÁLOGOS ----------
INSERT INTO tipo_de_asiento (nombre, descripcion) VALUES
('Semi Cama', 'Asiento reclinable hasta 140°, con apoyapiés y mayor comodidad que uno estándar.'),
('Cama', 'Asiento totalmente reclinable hasta 160°–180°, ideal para viajes nocturnos largos.'),
('Cama Premium', 'Asiento extra ancho, reclinación total 180°, con cortinas privadas y servicios adicionales.'),
('Ejecutivo', 'Mayor espacio entre asientos, reclinación media, a veces con pantalla y cargador.'),
('Económico', 'Asiento básico con mínima reclinación, generalmente usado en buses de corta distancia.'),
('Doble Piso - Superior', 'Asiento ubicado en la parte superior del bus, con mejor vista panorámica.'),
('Doble Piso - Inferior', 'Asiento ubicado en la parte inferior, generalmente más cómodo y con menos movimiento.'),
('VIP', 'Asiento exclusivo con reclinación total, servicio personalizado y espacio individual.'),
('Premium Plus', 'Asiento cama de lujo con mantas, alimentación a bordo y entretenimiento.'),
('Convencional', 'Asiento tradicional sin reclinación o con muy poca reclinación, usualmente usado para rutas urbanas.');

INSERT INTO servicio (nombre, descripcion) VALUES
('Wi-Fi', 'Internet gratis durante el viaje.'),
('Cena incluida', 'Cena caliente en viajes nocturnos largos.'),
('Desayuno', 'Desayuno ligero en rutas largas.'),
('Pantalla personal', 'Pantalla táctil con entretenimiento individual.'),
('TV general', 'Pantalla compartida con programación general.'),
('Cargador USB', 'Puerto USB en cada asiento.'),
('Aire acondicionado', 'Climatización en todo el bus.'),
('Baño a bordo', 'Baño disponible durante el viaje.'),
('Asistente a bordo', 'Personal disponible para ayudarte.'),
('Snack a bordo', 'Refrigerio incluido en el viaje.'),
('Manta y almohada', 'Kit de descanso con manta y almohada.'),
('Luz individual', 'Luz de lectura en cada asiento.'),
('Cortina privada', 'Separación para privacidad del pasajero.'),
('Seguridad GPS', 'Monitoreo del bus en tiempo real.'),
('Equipaje de mano', 'Espacio seguro para mochilas o bolsos.'),
('Toma de corriente', 'Enchufe para cargar dispositivos.');

-- ---------- 5. FLOTA ----------
INSERT INTO bus (placa, marca, modelo, id_empresa) VALUES
('AV 3637 VD', 'PLC', 'exercitationem', 19),
('7403 RSC', 'Group', 'ad', 7),
('4875 WSJ', 'LLC', 'dicta', 10),
('9373 LYH', 'Ltd', 'laboriosam', 19),
('4743 WRK', 'Group', 'repellat', 2),
('7265 RGB', 'and Sons', 'suscipit', 19),
('CS 2899 CF', 'Group', 'nostrum', 20),
('9823 VMD', 'Ltd', 'ducimus', 2),
('4707 WSR', 'Ltd', 'fugit', 14),
('2041 SNW', 'PLC', 'quo', 2),
('2552 ZYS', 'PLC', 'dolores', 2),
('AL 6699 ZA', 'Inc', 'culpa', 10),
('Z 3231 GW', 'LLC', 'soluta', 6),
('3348 HPD', 'LLC', 'unde', 7),
('TF 9053 ZH', 'Ltd', 'non', 19),
('L 4337 NH', 'Group', 'alias', 18),
('BA 8471 FN', 'Inc', 'deleniti', 16),
('TF 3959 GB', 'and Sons', 'nemo', 7),
('BI 3458 CH', 'Inc', 'eius', 14),
('0401 PSK', 'PLC', 'facere', 4);

INSERT INTO bus_servicio (id_bus, id_servicio) VALUES
(4, 8),(17, 1),(10, 1),(8, 4),(20, 2),(8, 1),(18, 2),(5, 8),(6, 12),(18, 9),
(4, 6),(1, 5),(1, 6),(16, 6),(17, 4),(9, 1),(8, 11),(12, 7),(14, 8);

INSERT INTO piso (numero_de_piso, nombre, id_bus) VALUES
(1, 'Piso 1', 3),
(2, 'Piso 2', 3),
(1, 'Piso 1', 7),
(2, NULL, 7),
(1, 'Piso inferior', 12),
(2, 'Piso superior', 12),
(1, 'Piso bajo', 5),
(1, 'Nivel 1', 14),
(2, NULL, 14),
(3, 'Tercer piso', 14);

-- cantidad_pisos coherente con los pisos cargados arriba
UPDATE bus SET cantidad_pisos = 2 WHERE id_bus IN (3, 7, 12);
UPDATE bus SET cantidad_pisos = 3 WHERE id_bus = 14;

-- "estado" ya no existe en asiento (la disponibilidad se calcula por viaje con boleto)
INSERT INTO asiento (ubicacion, tiene_ventana, id_piso, id_tipo_de_asiento) VALUES
('A1', TRUE,  1, 3),
('A2', FALSE, 1, 4),
('B1', TRUE,  1, 2),
('B2', FALSE, 1, 7),
('C1', TRUE,  1, 5),
('C2', FALSE, 1, 6),
('D1', FALSE, 1, 1),
('D2', TRUE,  1, 8),
('E1', TRUE,  1, 9),
('E2', FALSE, 1, 10),
('A1', FALSE, 2, 1),
('A2', TRUE,  2, 2),
('B1', TRUE,  2, 3),
('B2', FALSE, 2, 4),
('C1', FALSE, 2, 5),
('C2', TRUE,  2, 6),
('D1', TRUE,  2, 7),
('D2', FALSE, 2, 8),
('E1', FALSE, 2, 9),
('E2', TRUE,  2, 10),
('A1', TRUE,  3, 3),
('A2', FALSE, 3, 2),
('B1', FALSE, 3, 5),
('B2', TRUE,  3, 6),
('C1', TRUE,  3, 7),
('C2', FALSE, 3, 8),
('D1', TRUE,  3, 9),
('D2', FALSE, 3, 10),
('E1', FALSE, 3, 1),
('E2', TRUE,  3, 4);

-- ---------- 6. RUTAS Y VIAJES ----------
INSERT INTO terminal (nombre, pais, ciudad, direccion, latitud, longitud, id_empresa) VALUES
('La Coruña', 'Perú', 'Navarra', 'Vial de Edelmiro Sans 6 Álava, 53353', -9.213791, -70.991871, 1),
('Melilla', 'Perú', 'Baleares', 'Via de Aránzazu Jordá 89 Puerta 6  Vizcaya, 83110', -7.59683, -71.300538, 8),
('Segovia', 'Perú', 'Toledo', 'Cuesta de Bienvenida Bellido 82 Puerta 1  Lugo, 91124', -9.210214, -74.510704, 11),
('Málaga', 'Perú', 'Toledo', 'Pasaje Noemí Paredes 94 Puerta 6  Cuenca, 84696', -11.982053, -71.143711, 7),
('Santa Cruz de Tenerife', 'Perú', 'Almería', 'Calle Porfirio Trillo 44 Las Palmas, 61247', -10.741621, -70.238168, 4),
('Lleida', 'Perú', 'Pontevedra', 'Paseo de Godofredo Calderón 2 Huesca, 68720', -11.863947, -70.822127, 13),
('Cádiz', 'Perú', 'León', 'Alameda de Estela Arjona 278 Lleida, 04565', -6.002528, -72.528391, 2),
('Málaga', 'Perú', 'Almería', 'Vial Gregorio Ureña 61 Tarragona, 02017', -11.391014, -70.596834, 7),
('Salamanca', 'Perú', 'Soria', 'Paseo Custodia Barral 28 Puerta 4  Málaga, 49356', -9.474718, -74.501569, 16),
('Asturias', 'Perú', 'Albacete', 'Glorieta Vilma Escalona 42 Piso 2  Baleares, 38185', -9.044541, -73.239213, 14),
('Valencia', 'Perú', 'Tarragona', 'Via Débora Carrión 986 Piso 5  Navarra, 12524', -8.892374, -73.694285, 3),
('Huesca', 'Perú', 'Jaén', 'Cañada Bárbara Bou 75 Apt. 18  Palencia, 21649', -8.750938, -74.611143, 13),
('Huelva', 'Perú', 'Valencia', 'Rambla Jafet Girón 71 Puerta 3  Cantabria, 38214', -8.282571, -70.802398, 4),
('Valladolid', 'Perú', 'Salamanca', 'Urbanización Maxi Contreras 32 Lleida, 17572', -6.388551, -72.249354, 15),
('Badajoz', 'Perú', 'Cantabria', 'Camino de Leire Mendizábal 25 Las Palmas, 37118', -8.985129, -74.026768, 8),
('Sevilla', 'Perú', 'Pontevedra', 'Vial Iker Solera 230 Santa Cruz de Tenerife, 56433', -8.38763, -73.672302, 19),
('Cádiz', 'Perú', 'Huelva', 'Glorieta Carolina Sanabria 8 La Rioja, 85887', -8.064506, -74.543317, 17),
('Valladolid', 'Perú', 'Cantabria', 'Calle Omar Vera 43 Lleida, 62415', -7.112777, -76.568846, 17),
('Cantabria', 'Perú', 'Baleares', 'Callejón de Judith Suarez 21 Santa Cruz de Tenerife, 14147', -7.493481, -75.96327, 14),
('La Coruña', 'Perú', 'Valencia', 'Avenida de Juana Vallejo 46 Puerta 5  Tarragona, 90279', -11.454009, -71.395785, 10),
('Lima Central', 'Perú', 'Lima', 'Av. Javier Prado Este 999, San Isidro', -12.092136, -77.033779, 5),
('Arequipa Norte', 'Perú', 'Arequipa', 'Calle Santa Catalina 321, Cercado', -16.398804, -71.537451, 9),
('Cusco Sur', 'Perú', 'Cusco', 'Av. Huayruropata 1205, Wanchaq', -13.522640, -71.967339, 6),
('Tumbes Terminal', 'Perú', 'Tumbes', 'Av. Tumbes Norte 300, Zarumilla', -3.566883, -80.451533, 12);

INSERT INTO ruta (distancia_de_recorrido, id_terminal_origen, id_terminal_destino, id_empresa) VALUES
(504.6, 20, 15, 11),
(495.81, 13, 16, 12),
(891.54, 18, 9, 2),
(411.55, 13, 18, 2),
(715.39, 5, 9, 13),
(363.29, 2, 4, 8),
(170.53, 7, 8, 20),
(699.78, 13, 4, 6),
(968.99, 17, 18, 14),
(476.11, 20, 8, 12),
(190.12, 13, 12, 18),
(471.05, 3, 19, 3),
(338.49, 8, 9, 7),
(262.29, 15, 1, 17),
(822.28, 16, 1, 20),
(784.8, 11, 13, 2),
(603.46, 18, 9, 20),
(924.44, 13, 14, 7),
(836.36, 13, 1, 19),
(213.6, 2, 12, 9);

INSERT INTO viaje (estado, instante_abordaje, instante_partida, instante_llegada, id_ruta, id_bus, id_empresa) VALUES
('FINALIZADO','2025-03-21 03:27:35','2025-03-21 04:27:35','2025-03-21 12:27:35',10,6,9),
('RETRASADO','2025-02-06 18:07:35',NULL,NULL,10,17,10),
('RETRASADO','2025-03-06 03:48:09',NULL,NULL,15,1,6),
('CANCELADO','2025-02-19 06:08:50',NULL,NULL,4,19,2),
('CANCELADO','2025-06-12 08:38:56',NULL,NULL,19,20,5),
('PROGRAMADO','2025-05-24 01:51:41',NULL,NULL,8,9,18),
('FINALIZADO','2025-02-20 11:37:24','2025-02-20 12:37:24','2025-02-20 17:37:24',6,3,11),
('CANCELADO','2025-03-21 04:42:47',NULL,NULL,20,18,6),
('FINALIZADO','2025-03-01 10:20:01','2025-03-01 11:20:01','2025-03-01 19:20:01',10,6,16),
('RETRASADO','2025-05-30 20:19:54',NULL,NULL,11,4,1),
('PROGRAMADO','2025-03-14 11:52:59',NULL,NULL,8,8,17),
('RETRASADO','2025-04-15 21:50:42',NULL,NULL,12,15,8),
('CANCELADO','2025-05-01 16:42:18',NULL,NULL,11,5,13),
('RETRASADO','2025-01-08 21:35:16',NULL,NULL,4,8,9),
('CANCELADO','2025-05-11 08:35:21',NULL,NULL,6,5,10);

INSERT INTO tarifa (precio, detalle, id_viaje, id_tipo_de_asiento) VALUES
(190.25, 'sapiente', 9, 4),
(78.63, 'eveniet', 8, 8),
(81.71, 'perspiciatis', 2, 9),
(123.85, 'minus', 12, 5),
(26.66, 'facere', 8, 4),
(87.61, 'aliquid', 11, 8),
(154.09, 'ut', 6, 9),
(120.3, 'doloremque', 3, 5),
(115.46, 'eveniet', 5, 5),
(62.69, 'culpa', 2, 5),
(77.86, 'saepe', 10, 7),
(32.67, 'tempora', 7, 7),
(49.8, 'eum', 5, 5),
(76.78, 'aut', 5, 8),
(165.96, 'at', 2, 9),
(120.04, 'autem', 9, 3),
(146.47, 'nam', 9, 4),
(30.57, 'voluptate', 12, 4),
(81.03, 'voluptatem', 7, 6),
(93.77, 'debitis', 11, 8);

-- ---------- 7. PAGOS, RESERVAS, PASAJEROS Y BOLETOS ----------
INSERT INTO pago (monto, estado, metodo_pago, moneda) VALUES
(70.01, 'PENDIENTE', 'TARJETA', 'PEN'),
(68.03, 'PENDIENTE', 'TARJETA', 'PEN'),
(29.41, 'PENDIENTE', 'TRANSFERENCIA', 'PEN'),
(38.06, 'PENDIENTE', 'TRANSFERENCIA', 'PEN'),
(41.29, 'RECHAZADO', 'TRANSFERENCIA', 'PEN'),
(92.95, 'RECHAZADO', 'TARJETA', 'PEN'),
(78.2, 'PENDIENTE', 'TRANSFERENCIA', 'USD'),
(21.97, 'PAGADO', 'TARJETA', 'USD'),
(30.44, 'PENDIENTE', 'TARJETA', 'USD'),
(62.58, 'RECHAZADO', 'TARJETA', 'PEN'),
(76.09, 'PAGADO', 'TRANSFERENCIA', 'PEN'),
(13.11, 'PENDIENTE', 'TRANSFERENCIA', 'PEN'),
(14.05, 'PENDIENTE', 'TARJETA', 'PEN'),
(66.89, 'PAGADO', 'TARJETA', 'PEN'),
(37.79, 'PAGADO', 'TRANSFERENCIA', 'PEN'),
(75.68, 'PAGADO', 'TARJETA', 'PEN'),
(47.13, 'PENDIENTE', 'TRANSFERENCIA', 'PEN'),
(47.9, 'PENDIENTE', 'TRANSFERENCIA', 'USD'),
(82.61, 'PENDIENTE', 'TRANSFERENCIA', 'USD'),
(51.17, 'RECHAZADO', 'TRANSFERENCIA', 'USD');

INSERT INTO reserva (estado, id_viajero, id_viaje_ida, id_viaje_vuelta, id_pago) VALUES
('PAGADA', 4, 1, 9, 2),
('COMPLETADA', 2, 6, NULL, 1),
('CANCELADA', 9, 3, NULL, 4),
('PAGO_PENDIENTE', 1, 5, NULL, NULL),
('COMPLETADA', 8, 7, 1, 3),
('PAGADA', 10, 14, NULL, 6),
('CANCELADA', 5, 8, NULL, 5),
('PAGADA', 7, 11, 6, 9),
('COMPLETADA', 3, 10, NULL, 8),
('PAGO_PENDIENTE', 6, 2, NULL, NULL);

-- Ahora pasajero es solo la persona; el asiento y la tarifa van en boleto
INSERT INTO pasajero (tipo_documento, numero_documento, nombres, apellidos, correo_electronico, telefono, id_reserva) VALUES
('DNI', '78451236', 'Juan Carlos', 'Pérez López', 'juan.perez@mail.com', '987654321', 1),
('PASAPORTE', 'PA1234567', 'María Elena', 'Gómez Fernández', 'maria.gomez@mail.com', NULL, 1),
('CEDULA', 'CE987654', 'Carlos Andrés', 'Martínez Rojas', NULL, '912345678', 2),
('DNI', '87654321', 'Ana Patricia', 'Silva Mendoza', 'ana.silva@mail.com', '934567890', 3),
('CARNET_EXTRANJERIA', 'CX456789', 'Luis Miguel', 'Torres Vargas', 'luis.torres@mail.com', NULL, 4),
('DNI', '76543210', 'Sofía Alejandra', 'Díaz Castro', NULL, '945678901', 5),
('PASAPORTE', 'PA7654321', 'Pedro Antonio', 'Ruiz Sánchez', 'pedro.ruiz@mail.com', '956789012', 5),
('DNI', '65432109', 'Laura Isabel', 'Hernández García', 'laura.hernandez@mail.com', '967890123', 6),
('CEDULA', 'CE123456', 'Jorge Eduardo', 'Flores Ramírez', NULL, NULL, 7),
('DNI', '54321098', 'Carmen Rosa', 'Vega Ortiz', 'carmen.vega@mail.com', '978901234', 8),
('CARNET_EXTRANJERIA', 'CX321654', 'Ricardo Alfonso', 'Morales Pinto', 'ricardo.morales@mail.com', '989012345', 8),
('DNI', '43210987', 'Daniela Fernanda', 'Castillo Ríos', NULL, '990123456', 9),
('PASAPORTE', 'PA9876543', 'Oscar Manuel', 'Jiménez León', 'oscar.jimenez@mail.com', NULL, 10),
('DNI', '32109876', 'Patricia Lucía', 'Navarro Campos', 'patricia.navarro@mail.com', '901234567', 10),
('OTRO', 'OT123456', 'Fernando José', 'Salas Guerrero', 'fernando.salas@mail.com', '912345670', 10);

-- (id_pasajero, id_viaje, id_asiento, id_tarifa): el viaje sale de la tarifa original
INSERT INTO boleto (id_pasajero, id_viaje, id_asiento, id_tarifa) VALUES
(1,  9,  1, 16),
(2,  8,  3,  2),
(3,  6,  7,  7),
(4,  2, 12,  3),
(5,  5, 15, 13),
(6,  7, 18, 12),
(7, 10,  5, 11),
(8,  2, 22, 15),
(9, 11, 17,  6),
(10, 3, 27,  8),
(11, 7,  9, 19),
(12, 5, 30,  9),
(13, 2,  4, 10),
(14, 5, 10, 14),
(15, 11, 20, 20);

COMMIT;

-- ---------- Verificación (debe dar: 21 / 21 / 21 / 63 / 20 / 15) ----------
SELECT 'administrador (seed)' AS tabla, count(*) FROM administrador a JOIN auth.users u ON u.id = a.id_auth WHERE u.raw_app_meta_data->>'seed' = 'true'
UNION ALL SELECT 'empresa', count(*) FROM empresa
UNION ALL SELECT 'viajero', count(*) FROM viajero
UNION ALL SELECT 'auth.users (seed)', count(*) FROM auth.users WHERE raw_app_meta_data->>'seed' = 'true'
UNION ALL SELECT 'bus', count(*) FROM bus
UNION ALL SELECT 'boleto', count(*) FROM boleto;
