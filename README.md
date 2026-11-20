# 🚌 Reserbus

**Reserva de pasajes de bus con varias empresas, al estilo redBus.**

Sistema de reserva de pasajes de bus con **varias empresas de transporte**. El viajero busca un origen y un destino, y Reserbus le arma el recorrido combinando tramos de distintas empresas si hace falta. Los usuarios de prueba son ficticios y no hay pasarela de pago.

| 🔗 | Servicio | URL |
|---|---|---|
| 🖥️ | **Client** | https://cdx-reserbus.vercel.app |
| ⚙️ | **Server (API)** | https://cdx-reserbus-server.vercel.app (solo responde al client) |

---

## 🚌 Qué hace

1. Cada **empresa** define sus **rutas**, que son secuencias ordenadas de **tramos** (terminal origen y terminal destino).
2. La empresa arma **planes**: una ruta, un horario, buses y choferes.
3. El viajero busca, por ejemplo, *Lima a Puno*. La app **no muestra planes completos**, sino las **secciones de los planes que calzan** con la búsqueda, y puede **combinar empresas distintas** con trasbordos.
4. El viajero elige **asientos concretos** y reserva. Esa reserva se llama **viaje**.

Ejemplo de conexión entre empresas:

| Plan | Empresa | Recorrido |
|---|---|---|
| 🔵 Plan A | Andes | TA → TB → TC |
| 🟠 Plan B | Altiplano | TB → TD → TE |

Para ir de **TA a TD**, el resultado es TA → TB con el Plan A y luego TB → TD con el Plan B.

---

## 🧰 Stack

| Capa | Tecnología |
|---|---|
| 🎨 Front | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Formik y Yup, Axios, date-fns, Three.js (React Three Fiber y drei) para la escena 3D, Motion y Lucide |
| ⚙️ Back | Node.js, Express 5, Sequelize |
| 🗃️ Base de datos | PostgreSQL en Supabase (schema `reserbus`) |
| 🔑 Autenticación | Supabase Auth (correo y contraseña, y Google), tokens validados con JWKS usando `jose` |
| ☁️ Despliegue | Vercel (dos proyectos: client y server) |

---

## 🏗️ Arquitectura

```mermaid
flowchart LR
    U(["🧑 Navegador<br/>del usuario"]):::user --> C["🖥️ Client React<br/>Vercel"]:::front
    C -->|"🔑 login"| A["🔐 Supabase Auth"]:::auth
    C -->|"JWT en cada petición"| S["⚙️ Server Express<br/>Vercel"]:::back
    S -->|"valida JWT con JWKS"| A
    S -->|"Sequelize"| D[("🗃️ Postgres<br/>Supabase")]:::db

    classDef user fill:#fef3c7,stroke:#d97706,color:#78350f,stroke-width:2px
    classDef front fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,stroke-width:2px
    classDef auth fill:#dcfce7,stroke:#16a34a,color:#14532d,stroke-width:2px
    classDef back fill:#ede9fe,stroke:#7c3aed,color:#4c1d95,stroke-width:2px
    classDef db fill:#fee2e2,stroke:#dc2626,color:#7f1d1d,stroke-width:2px
```

Puntos clave:

- El correo y la contraseña viven en `auth.users` de Supabase. La base del proyecto solo guarda el **perfil** enlazado por `auth_id`.
- El rol de una cuenta **no se guarda en el token**: se deduce de en qué tabla de perfil existe su `auth_id`.
- El server rechaza cualquier petición que no venga del client.

---

## 👥 Roles y permisos

| Rol | Tabla de perfil | Qué puede hacer |
|---|---|---|
| 🛡️ `ADMIN` | `administrador` | Gestiona empresas, usuarios, países, provincias y servicios. No tiene relación con ninguna empresa. |
| 🏢 `EMPRESA` | `trabajador` (tipo `ADMINISTRATIVO`) | Gestiona la flota, tipos de asiento, tarifas, rutas, planes y tramos programados de **su** empresa. |
| 🧑‍✈️ Chofer | `trabajador` (tipo `CHOFER`) | Se asigna a planes. No tiene panel propio ni acceso a la web (sin correo ni contraseña). |
| 🧳 `VIAJERO` | `viajero` | Busca, reserva, confirma y cancela sus viajes. |

Las búsquedas y los catálogos de ubicación (países, provincias, terminales, tramos) son de lectura pública para el client; todo lo demás exige token.

---

## 🗄️ Modelo de datos

El DDL completo está en [`server/supabase/schema.sql`](./server/supabase/schema.sql).

### 🗺️ Vista general

```mermaid
erDiagram
    PAIS ||--o{ PROVINCIA : tiene
    PROVINCIA ||--o{ TERMINAL : tiene
    TERMINAL ||--o{ TRAMO : "origen y destino"

    EMPRESA ||--o{ TRABAJADOR : emplea
    EMPRESA ||--o{ TIPO_BUS : define
    TIPO_BUS ||--o{ BUS : "modelo de"
    EMPRESA ||--o{ RUTA : define
    RUTA ||--o{ RUTA_HAS_TRAMO : "ordena"
    TRAMO ||--o{ RUTA_HAS_TRAMO : "forma parte"
    RUTA ||--o{ HORARIO : tiene
    EMPRESA ||--o{ PLAN : arma
    PLAN ||--o{ PLAN_HAS_BUS : usa
    PLAN ||--o{ PLAN_HAS_TRABAJADOR : "asigna choferes"

    PLAN ||--o{ TRAMO_PROGRAMADO : genera
    BUS ||--o{ TRAMO_PROGRAMADO : recorre

    VIAJERO ||--o{ VIAJE : reserva
    VIAJE ||--o{ PASAJERO : incluye
    VIAJE ||--o{ VIAJE_HAS_TRAMO_PROGRAMADO : "patas"
    TRAMO_PROGRAMADO ||--o{ VIAJE_HAS_TRAMO_PROGRAMADO : "se reserva en"
    PASAJERO ||--o{ PASAJE : tiene
    TRAMO_PROGRAMADO ||--o{ PASAJE : "asiento en"
```

### 📋 Tablas por grupo

📍 **Ubicación y red** (globales, compartidas entre empresas para permitir conexiones)

| Tabla | Para qué sirve |
|---|---|
| 🌎 `pais` | Nombre y `desfase_utc_min` (Perú = -300) para convertir UTC a hora local. |
| 🏙️ `provincia` | Pertenece a un país. Permite filtrar "terminales de Arequipa". |
| 🚏 `terminal` | Punto físico. El distrito va dentro de `direccion`, no tiene tabla propia. |
| ➖ `tramo` | Segmento dirigido de terminal origen a terminal destino. |

👤 **Actores** (cada uno enlazado a Supabase Auth por `auth_id`)

| Tabla | Para qué sirve |
|---|---|
| `administrador` | Sysadmin de la plataforma. |
| `empresa` | Empresa de buses. `activa` permite desactivarla sin borrarla. |
| `trabajador` | Pertenece a una empresa. Tipo `CHOFER` o `ADMINISTRATIVO`. |
| `viajero` | Cliente que reserva. |

🚍 **Flota y tarifas** (por empresa)

| Tabla | Para qué sirve |
|---|---|
| `tipo_bus` | Modelo de bus: `filas`, `asientos_por_fila` y total calculado. |
| `tipo_asiento` | Categoría de asiento (ej. "Cama") con `tarifa_extra`. |
| `tipo_bus_has_tipo_asiento` | Qué rangos de filas son de qué tipo de asiento. |
| `tarifa` | `monto_base` por tipo de bus y tramo. |
| `bus` | Bus físico con `placa`. `activo` permite darlo de baja sin perder historial. |
| `servicio`, `bus_has_servicio` | Servicios del bus (wifi, baño, etc.). |

🛣️ **Rutas y planes**

| Tabla | Para qué sirve |
|---|---|
| `ruta` | Ruta de una empresa. |
| `ruta_has_tramo` | Tramos de la ruta en orden (`posicion`) con `duracion_min`. |
| `horario` | Hora de salida (UTC) del primer tramo de una ruta. |
| `plan` | Ruta + horario de una empresa. `activo` controla si genera tramos programados. |
| `plan_has_bus`, `plan_has_trabajador` | Buses y choferes asignados al plan. |

🎟️ **Operación y reservas**

| Tabla | Para qué sirve |
|---|---|
| ⭐ `tramo_programado` | **Un bus recorriendo un tramo de un plan en una fecha concreta.** Es la arista de la búsqueda, la unidad que se reserva y el lugar de los tiempos estimados y reales. |
| `viaje` | La reserva. Estados: 🟡 `PENDIENTE`, 🟢 `CONFIRMADO`, 🔴 `CANCELADO`, ⚫ `EXPIRADO`. |
| `pasajero` | Persona que viaja. El mismo documento no se repite dentro de un viaje. |
| `viaje_has_tramo_programado` | Las "patas" del viaje, ordenadas. Una conexión tiene varias. |
| `pasaje` | Asiento de un pasajero en un tramo programado: `fila`, `columna`, `codigo_asiento`, `precio`, `vigente`. |

### 💰 Cómo se calcula el precio

```
precio del asiento = tarifa.monto_base (tipo de bus, tramo)  +  tipo_asiento.tarifa_extra
```

Un viaje con varios tramos suma el precio de cada uno, y el valor se **congela** en `pasaje.precio` al reservar.

### 🛡️ Qué garantiza la base de datos

| Regla | Mecanismo |
|---|---|
| Bus, tipo de bus, ruta, plan, tipo de asiento y chofer son siempre de la misma empresa | FKs compuestas con `id_empresa` |
| Solo los trabajadores `CHOFER` se asignan a un plan | Restricción en `plan_has_trabajador` |
| Un tramo programado usa un bus del plan y un tramo de la ruta del plan | FKs compuestas |
| Un asiento no se vende dos veces mientras esté vigente | Índice único parcial |
| Liberar asientos al cancelar o expirar | Trigger que pone `pasaje.vigente = FALSE` |

---

## 🧠 Cómo funciona por dentro

### 🔎 Búsqueda de viajes

`GET /api/busqueda` modela el problema como un grafo con tiempo: los **nodos** son terminales y las **aristas** son tramos programados de la fecha con asientos libres.

```mermaid
flowchart TD
    A(["📍 Origen, destino y fecha"]):::inicio --> B["📅 Cargar tramos programados del día<br/>con asientos libres"]:::paso
    B --> C["🧭 Recorrer el grafo<br/>por menor hora de llegada"]:::paso
    C --> D{"🔁 Cambia de plan<br/>o de bus?"}:::decision
    D -->|"No"| E["✅ Sin espera<br/>ni trasbordo"]:::ok
    D -->|"Sí"| F["⏳ Exigir margen mínimo<br/>de trasbordo (30 min)"]:::aviso
    E --> G["🔢 Máximo 2 a 3 trasbordos"]:::paso
    F --> G
    G --> H(["📊 Ordenar por llegada,<br/>precio o trasbordos"]):::fin

    classDef inicio fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,stroke-width:2px
    classDef paso fill:#f3f4f6,stroke:#6b7280,color:#111827,stroke-width:1.5px
    classDef decision fill:#fef3c7,stroke:#d97706,color:#78350f,stroke-width:2px
    classDef ok fill:#dcfce7,stroke:#16a34a,color:#14532d,stroke-width:2px
    classDef aviso fill:#ffedd5,stroke:#ea580c,color:#7c2d12,stroke-width:2px
    classDef fin fill:#ede9fe,stroke:#7c3aed,color:#4c1d95,stroke-width:2px
```

Parámetros principales:

| Parámetro | Descripción |
|---|---|
| `origen`, `destino` | Id de terminal. También existen `origen_provincia` y `destino_provincia`. |
| `fecha` | Día **local** del terminal de origen (`YYYY-MM-DD`). |
| `pasajeros` | Cantidad de asientos que se necesitan (por defecto 1). |
| `max_trasbordos` | Máximo de trasbordos (por defecto 2). |
| `trasbordo_min` | Margen mínimo en minutos (por defecto 30). |
| `orden` | `llegada`, `precio` o `trasbordos`. |

### ⏱️ Reserva con hold de 10 minutos

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE: Continuar (vence en 10 min)
    PENDIENTE --> CONFIRMADO: Confirmar a tiempo
    PENDIENTE --> CANCELADO: El usuario cancela
    PENDIENTE --> EXPIRADO: Pasan 10 min
    CONFIRMADO --> CANCELADO: El usuario cancela
    CANCELADO --> [*]
    EXPIRADO --> [*]
    CONFIRMADO --> [*]

    classDef amarillo fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef verde fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef rojo fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    classDef gris fill:#e5e7eb,stroke:#4b5563,color:#111827
    class PENDIENTE amarillo
    class CONFIRMADO verde
    class CANCELADO rojo
    class EXPIRADO gris
```

| Estado | Significado |
|---|---|
| 🟡 `PENDIENTE` | Asientos retenidos, esperando confirmación |
| 🟢 `CONFIRMADO` | Reserva firme |
| 🔴 `CANCELADO` | Cancelada por el viajero, asientos liberados |
| ⚫ `EXPIRADO` | Se venció el hold de 10 minutos |

1. Al pulsar **Continuar** se crea el viaje `PENDIENTE` con sus pasajeros, patas y pasajes. El índice único impide que otra persona tome el mismo asiento.
2. Al **confirmar**, el server verifica que siga `PENDIENTE` y que `vence_en` no haya pasado.
3. Al **cancelar** o **expirar**, un trigger libera los asientos.
4. `reserbus.expirar_viajes()` marca como `EXPIRADO` los pendientes vencidos. Se llama antes de consultar disponibilidad o reservar.

### 💺 Disponibilidad de asientos

Un asiento está ocupado en un tramo programado si existe un `pasaje` **vigente** con esa `(fila, columna)`. Como la ocupación es por tramo, el mismo asiento se reutiliza entre tramos distintos: alguien baja en una parada y otra persona sube.

Los asientos no tienen tabla. El código es la fila más la letra de la columna, por ejemplo `12A`. Con 4 asientos por fila las columnas son `A B | C D`.

### 📅 Generación de tramos programados

`services/generacion.js` genera, para cada plan **activo**, cada bus asignado y cada día del horizonte (90 días por defecto), un tramo programado por cada tramo de la ruta.

- La hora de cada tramo es la hora de salida más la suma de las duraciones anteriores (no hay esperas en paradas).
- Es idempotente: no duplica registros existentes.
- No crea tramos que ya salieron.

### 🌱 Datos de prueba (seed)

`npm run seed` deja la base lista para probar. `scripts/seed.js` corre **siempre en este orden** los tres archivos SQL de `server/supabase/`:

```mermaid
flowchart LR
    A["🧱 schema.sql<br/>DROP + tablas vacías"]:::paso --> B["👥 users.sql<br/>cuentas y perfiles"]:::auth --> C["🗓️ catalog.sql<br/>flota, rutas, planes<br/>y tramos programados"]:::back

    classDef paso fill:#fee2e2,stroke:#dc2626,color:#7f1d1d,stroke-width:2px
    classDef auth fill:#dcfce7,stroke:#16a34a,color:#14532d,stroke-width:2px
    classDef back fill:#ede9fe,stroke:#7c3aed,color:#4c1d95,stroke-width:2px
```

| Archivo | Qué crea |
|---|---|
| 🧱 `schema.sql` | Borra el schema `reserbus` y recrea todas las tablas **vacías**. |
| 👥 `users.sql` | 1 administrador, 5 empresas, 5 trabajadores administrativos, 26 choferes y 3 viajeros. |
| 🗓️ `catalog.sql` | Perú con 10 provincias y 11 terminales, 18 rutas (ida y vuelta), 8 tipos de bus, 45 buses, 40 planes y cerca de 10 mil tramos programados. |

- **Ventana de fechas automática:** los tramos programados van desde el día 1 del mes actual (hora de Perú) hasta 6 meses después. Se recalcula con la fecha del día en que corres el seed, así que siempre hay al menos 6 meses de datos. Por ejemplo, el 19/11/2026 genera de 01/11/2026 a 30/04/2027.
- **Solo plantilla:** no crea viajes, pasajeros ni pasajes, ni salidas que ya pasaron. Las reservas las hacen los usuarios desde la app.
- **UTC:** todo se guarda en UTC. Los horarios del seed se escriben en hora local de Perú y se convierten con `pais.desfase_utc_min` al insertar.
- **Reiniciar:** cada corrida borra todo, incluidas las reservas que se hayan hecho.
- **Cuentas:** `users.sql` inserta las cuentas directo en `auth.users` y `auth.identities`. Los choferes llevan una cuenta de Auth vacía (sin correo ni contraseña) porque `trabajador.auth_id` es obligatorio.
- **Una transacción por archivo:** si un paso falla se deshace y los siguientes no se ejecutan.

---

## 📁 Estructura del repositorio

```
Reserbus/
├── client/                     Front React + TypeScript
│   ├── public/                 Logos e ilustraciones
│   └── src/
│       ├── app/                Rutas principales (App.tsx)
│       ├── components/         Header, escena 3D (Three.js) y componentes de UI compartidos
│       ├── lib/                Cliente de la API, Supabase y estilos compartidos
│       └── features/
│           ├── account/        Perfil del viajero
│           ├── admin/          Panel del administrador
│           ├── auth/           Contexto de sesión, modales, rutas protegidas
│           ├── booking/        Reserva, resumen, mis viajes
│           ├── company/        Panel de la empresa (buses)
│           ├── search/         Home y resultados de búsqueda
│           └── static/         Secciones informativas y 404
└── server/                     API Express
    ├── index.js                Punto de entrada, CORS y bloqueo de acceso directo
    ├── middleware/auth.js      Validación de JWT, perfil y roles
    ├── models/                 Modelos Sequelize (uno por tabla)
    ├── routes/                 Endpoints agrupados por recurso
    ├── services/               Lógica: búsqueda, viajes, generación, usuarios
    ├── lib/                    Utilidades (errores, SQL, cliente Supabase)
    ├── scripts/seed.js         Corre en orden los 3 archivos de supabase/
    └── supabase/               SQL de PostgreSQL: schema.sql, users.sql, catalog.sql
```

---

## 💻 Instalación local

### ✅ Requisitos

- Node.js 20.19 o superior (lo pide Vite 8)
- Un proyecto de Supabase vacío. No hace falta ejecutar ningún SQL a mano: el seed crea las tablas.

### 🪜 Pasos

**1. Configurar el server y cargar los datos**

```bash
cd server
npm install
# crea server/.env con las variables de la sección siguiente
npm run seed        # reinicia la BD: schema + users + catalog (6 meses de salidas desde el día 1 del mes actual)
npm start           # http://localhost:3001
```

El seed se conecta con las variables `DB_*`. Si falla la conexión, usa el puerto `5432` (modo sesión) del pooler de Supabase en lugar del `6543`. Solo necesitas correrlo la primera vez o cuando quieras reiniciar la base.

**2. Configurar el client**

```bash
cd client
npm install
# crea client/.env con las variables de la sección siguiente
npm run dev         # http://localhost:3000
```

El client usa un proxy de Vite que redirige `/api` hacia `http://localhost:3001`, así que en local no necesitas definir `VITE_API_URL`.

### 🧪 Usuarios de prueba (creados por el seed)

Todos usan la contraseña `12345678`.

| Rol | Correo |
|---|---|
| 🛡️ Administrador | `administrador@reserbus.com` |
| 🏢 Trabajador de Transportes Andes | `trabajador@reserbus.com` |
| 🏢 Trabajador de Expreso Altiplano, Norte Express, Sierra Central y Pacífico Sur | `trabajador2@reserbus.com` a `trabajador5@reserbus.com` (en ese orden) |
| 🧳 Viajero | `viajero@reserbus.com`, `viajero2@reserbus.com` y `viajero3@reserbus.com` |

Las empresas y los choferes existen en la base pero no tienen cuenta de acceso (no tienen correo ni contraseña).

---

## 🔐 Variables de entorno

### ⚙️ Server (`server/.env`)

| Variable | Descripción |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexión a Postgres de Supabase. |
| `DB_SSL` | Ponla en `false` solo si usas una base local sin SSL. |
| `SUPABASE_URL` | URL del proyecto de Supabase. |
| `SUPABASE_SECRET_KEY` | Llave secreta para administrar usuarios. **Solo en el server.** |
| `SUPABASE_JWKS_URL` | Llaves públicas para validar tokens. Normalmente `https://TU-PROYECTO.supabase.co/auth/v1/.well-known/jwks.json`. |
| `CLIENT_ORIGINS` | Dominios permitidos separados por coma. En producción: `https://cdx-reserbus.vercel.app`. |
| `PORT` | Puerto local (por defecto 3001). |
| `TRASBORDO_MIN_MIN` | Margen mínimo de trasbordo en minutos (por defecto 30). |
| `SEED_DESDE`, `SEED_MESES` | Opcionales, solo para el seed. Fuerzan el primer día de la ventana (`YYYY-MM-DD`) y su duración en meses (por defecto, el día 1 del mes actual y 6 meses). |

### 🖥️ Client (`client/.env`)

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Llave pública de Supabase. |
| `VITE_API_URL` | URL del server en producción. En local se deja vacía. |

Los archivos `.env` no se suben al repositorio.

---

## 📜 Scripts disponibles

Todos se ejecutan desde `server/`, salvo los del client.

| Comando | Qué hace |
|---|---|
| `npm start` | Levanta la API con nodemon. |
| `npm run seed` | Reinicia la base en orden: `schema.sql`, `users.sql` y `catalog.sql` (carpeta `server/supabase/`). Se puede repetir. No crea reservas. |
| `npm run seed:empty` | Solo el paso 1: deja las tablas vacías. |
| `npm run seed -- schema users` | Corre solo los pasos indicados (`schema`, `users`, `catalog`), siempre en su orden. |
| `npm run dev` (client) | Servidor de desarrollo de Vite. |
| `npm run build` (client) | Revisa tipos y genera el build de producción. |
| `npm run preview` (client) | Sirve el build de producción en local. |

---

## 📐 Reglas de diseño

Decisiones acordadas que conviene respetar al modificar el proyecto.

| Regla | Detalle |
|---|---|
| Sin esperas en paradas | La llegada a un terminal es también la salida del siguiente tramo. |
| Tiempos en UTC | `TIMESTAMPTZ` siempre. La hora local se obtiene con `pais.desfase_utc_min`. |
| Estimado y real | `tramo_programado` guarda `salida_estimada`, `llegada_estimada`, `salida_real` y `llegada_real`. |
| Buses de 1 piso | Pasillo al medio y el mismo número de asientos a cada lado. |
| Sin tabla de asientos | El asiento es `(fila, columna)`. |
| Precios por empresa | `tipo_asiento` y `tarifa` pertenecen a cada empresa. |
| Cobro por tipo de bus | Varios buses pueden compartir ruta y horario con distinto plan y precio. |
| Hold de 10 minutos | Mientras el usuario completa la reserva. |
| Precio congelado | Se guarda en `pasaje.precio` al reservar. |
| Seed sin reservas | Los datos de prueba solo dejan la plantilla (catálogo y tramos programados). No hay viajes, pasajes ni salidas pasadas. |