-- =====================================================================
-- RESERBUS · USERS (DML)
-- Administrador, empresas, trabajadores administrativos, choferes y viajeros.
-- Correr DESPUÉS de schema.sql (las tablas deben existir y estar vacías).
--
--   Con acceso a la web (correo + contraseña 12345678, solo proyecto académico):
--     administrador@reserbus.com
--     trabajador@reserbus.com ... trabajador5@reserbus.com   (uno por empresa)
--     viajero@reserbus.com ... viajero3@reserbus.com
--   Sin acceso a la web (sin correo ni contraseña): empresas y choferes.
--     La empresa es solo una fila en `empresa`.
--     El chofer necesita un auth_id porque trabajador.auth_id es NOT NULL en el DDL; se le crea un
--     usuario de Auth "vacío" (sin correo, sin contraseña) que nadie puede usar para entrar.
--
-- Este script es re-ejecutable: borra de auth.users solo los usuarios que él mismo creó
-- (marca raw_user_meta_data.seed = 'reserbus' o uno de los correos de abajo).
-- =====================================================================
BEGIN;
SET LOCAL search_path TO reserbus, extensions, public;   -- `extensions` = donde Supabase instala pgcrypto

-- ---------------------------------------------------------------------
-- 0. Limpieza de cuentas de seeds anteriores
-- ---------------------------------------------------------------------
DELETE FROM auth.users
 WHERE raw_user_meta_data ->> 'seed' = 'reserbus'
    OR email IN ('administrador@reserbus.com',
                 'trabajador@reserbus.com',  'trabajador2@reserbus.com', 'trabajador3@reserbus.com',
                 'trabajador4@reserbus.com', 'trabajador5@reserbus.com',
                 'viajero@reserbus.com',     'viajero2@reserbus.com',    'viajero3@reserbus.com');

-- ---------------------------------------------------------------------
-- 1. Empresas (no tienen cuenta)
-- ---------------------------------------------------------------------
INSERT INTO empresa (nombre) VALUES
  ('Transportes Andes'),
  ('Expreso Altiplano'),
  ('Norte Express'),
  ('Sierra Central'),
  ('Pacífico Sur');

-- ---------------------------------------------------------------------
-- 2. Cuentas de Supabase Auth
--    clave = nombre interno para enlazar cuenta <-> perfil dentro de este script
-- ---------------------------------------------------------------------
CREATE TEMP TABLE _cuenta (
  clave   TEXT PRIMARY KEY,
  correo  TEXT,                                  -- NULL = cuenta sin acceso (choferes)
  uid     UUID NOT NULL DEFAULT gen_random_uuid()
) ON COMMIT DROP;

INSERT INTO _cuenta (clave, correo) VALUES
  ('admin',    'administrador@reserbus.com'),
  ('trab1',    'trabajador@reserbus.com'),
  ('trab2',    'trabajador2@reserbus.com'),
  ('trab3',    'trabajador3@reserbus.com'),
  ('trab4',    'trabajador4@reserbus.com'),
  ('trab5',    'trabajador5@reserbus.com'),
  ('viajero1', 'viajero@reserbus.com'),
  ('viajero2', 'viajero2@reserbus.com'),
  ('viajero3', 'viajero3@reserbus.com');

-- Choferes: clave interna, empresa, nombres, apellidos
CREATE TEMP TABLE _chofer (clave TEXT PRIMARY KEY, empresa TEXT NOT NULL, nombres TEXT NOT NULL, apellidos TEXT NOT NULL) ON COMMIT DROP;
INSERT INTO _chofer (clave, empresa, nombres, apellidos) VALUES
    ('ch01', 'Transportes Andes', 'Carlos',   'Quispe Huamán'),
    ('ch02', 'Transportes Andes', 'Jorge',    'Mamani Ccori'),
    ('ch03', 'Transportes Andes', 'Luis',     'Ramírez Soto'),
    ('ch04', 'Transportes Andes', 'Pedro',    'Flores Chávez'),
    ('ch05', 'Transportes Andes', 'Walter',   'Condori Apaza'),
    ('ch06', 'Transportes Andes', 'Raúl',     'Medina Paredes'),
    ('ch07', 'Expreso Altiplano', 'Hugo',     'Mamani Quispe'),
    ('ch08', 'Expreso Altiplano', 'Edgar',    'Ccama Yupanqui'),
    ('ch09', 'Expreso Altiplano', 'Víctor',   'Huanca Salas'),
    ('ch10', 'Expreso Altiplano', 'Ronald',   'Tito Mollo'),
    ('ch11', 'Expreso Altiplano', 'Dante',    'Apaza Larico'),
    ('ch12', 'Expreso Altiplano', 'Felipe',   'Cutipa Ramos'),
    ('ch13', 'Norte Express',     'Manuel',   'Vásquez Rojas'),
    ('ch14', 'Norte Express',     'Santos',   'Cruzado Díaz'),
    ('ch15', 'Norte Express',     'Ernesto',  'Bances Silva'),
    ('ch16', 'Norte Express',     'Marco',    'Alarcón Ruiz'),
    ('ch17', 'Sierra Central',    'Alfredo',  'Poma Vilcahuamán'),
    ('ch18', 'Sierra Central',    'Teodoro',  'Rojas Ñahui'),
    ('ch19', 'Sierra Central',    'Nelson',   'Gutiérrez Rivera'),
    ('ch20', 'Sierra Central',    'César',    'Torres Camayo'),
    ('ch21', 'Pacífico Sur',      'Miguel',   'Castillo Vera'),
    ('ch22', 'Pacífico Sur',      'Óscar',    'Paredes Linares'),
    ('ch23', 'Pacífico Sur',      'Franco',   'Zegarra Bedoya'),
    ('ch24', 'Pacífico Sur',      'Julio',    'Delgado Núñez'),
    ('ch25', 'Pacífico Sur',      'Aldo',     'Choque Valdivia'),
    ('ch26', 'Pacífico Sur',      'Renzo',    'Salazar Meza');

INSERT INTO _cuenta (clave, correo) SELECT clave, NULL FROM _chofer;

-- auth.users: con correo -> cuenta normal confirmada (contraseña 12345678, bcrypt).
--             sin correo -> cuenta "vacía" (sin contraseña) que no puede iniciar sesión.
-- Los 4 campos '' evitan el error de GoTrue "converting NULL to string" al iniciar sesión.
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
SELECT '00000000-0000-0000-0000-000000000000', c.uid, 'authenticated', 'authenticated',
       c.correo,
       CASE WHEN c.correo IS NOT NULL THEN crypt('12345678', gen_salt('bf')) END,
       CASE WHEN c.correo IS NOT NULL THEN now() END,
       CASE WHEN c.correo IS NOT NULL THEN '{"provider":"email","providers":["email"]}'::jsonb ELSE '{}'::jsonb END,
       jsonb_build_object('seed', 'reserbus'),
       now(), now(), '', '', '', ''
  FROM _cuenta c;

-- Identidad de correo (necesaria para poder iniciar sesión con correo + contraseña)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), c.uid, c.uid::text,
       jsonb_build_object('sub', c.uid::text, 'email', c.correo, 'email_verified', true, 'phone_verified', false),
       'email', now(), now(), now()
  FROM _cuenta c
 WHERE c.correo IS NOT NULL;

-- ---------------------------------------------------------------------
-- 3. Perfiles
-- ---------------------------------------------------------------------
INSERT INTO administrador (auth_id, nombres, apellidos)
SELECT uid, 'Administrador', 'Reserbus' FROM _cuenta WHERE clave = 'admin';

-- Un trabajador ADMINISTRATIVO por empresa
INSERT INTO trabajador (auth_id, id_empresa, tipo, nombres, apellidos)
SELECT c.uid, e.id, 'ADMINISTRATIVO', v.nombres, v.apellidos
  FROM (VALUES
    ('trab1', 'Transportes Andes', 'Ana',     'Andía Rivas'),
    ('trab2', 'Expreso Altiplano', 'Alba',    'Aguilar Mendoza'),
    ('trab3', 'Norte Express',     'Nancy',   'Neyra Carranza'),
    ('trab4', 'Sierra Central',    'Silvia',  'Salcedo Lazo'),
    ('trab5', 'Pacífico Sur',      'Patricia','Pinto Cáceres')
  ) AS v (clave, empresa, nombres, apellidos)
  JOIN _cuenta c ON c.clave = v.clave
  JOIN empresa e ON e.nombre = v.empresa;

-- Choferes (trabajador tipo CHOFER, cuenta sin acceso)
INSERT INTO trabajador (auth_id, id_empresa, tipo, nombres, apellidos)
SELECT c.uid, e.id, 'CHOFER', h.nombres, h.apellidos
  FROM _chofer h
  JOIN _cuenta c ON c.clave = h.clave
  JOIN empresa e ON e.nombre = h.empresa
 ORDER BY h.clave;

INSERT INTO viajero (auth_id, nombres, apellidos)
SELECT c.uid, v.nombres, v.apellidos
  FROM (VALUES
    ('viajero1', 'Vera',    'Valdez Prado'),
    ('viajero2', 'Vicente', 'Vargas Lozano'),
    ('viajero3', 'Valeria', 'Vega Montes')
  ) AS v (clave, nombres, apellidos)
  JOIN _cuenta c ON c.clave = v.clave;

COMMIT;
