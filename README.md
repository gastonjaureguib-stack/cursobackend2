# Plataforma de Eventos y Reservas para Club Cannábico

API backend desarrollada con **Node.js**, **Express**, **MongoDB**, **Mongoose**, **Passport.js**, **bcrypt**, **jsonwebtoken** y **cookie-parser**, orientada a una plataforma de eventos, actividades e inscripciones para un club cannábico.

Esta sexta pre-entrega de **Backend II** incorpora la entidad central `Event` y su lógica de negocio, completando el CRUD necesario para crear, listar, consultar, actualizar y cancelar eventos.

La aplicación mantiene el sistema de autenticación y autorización desarrollado en entregas anteriores e incorpora:

- entidad `Event` completa;
- asociación de eventos con su organizador;
- lógica de negocio en una capa `services`;
- control de permisos por rol;
- validación de propiedad de eventos mediante middleware;
- estados de eventos;
- filtros de búsqueda;
- paginación;
- ordenamiento;
- validaciones de fechas, capacidad y precio;
- cancelación lógica de eventos.

---

# Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Passport.js
- passport-local
- passport-jwt
- bcrypt
- jsonwebtoken
- cookie-parser
- dotenv
- JavaScript con módulos ESM

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/gastonjaureguib-stack/cursobackend2.git
```

## 2. Ingresar al proyecto

```bash
cd cursobackend2
```

## 3. Instalar dependencias

```bash
npm install
```

---

# Variables de entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

```env
PORT=8080

NODE_ENV=development

MONGO_URL=mongodb://localhost:27017/tu_base_de_datos

JWT_SECRET=tu_clave_secreta

JWT_EXPIRES_IN=1h
```

`MONGO_URL` se utiliza para establecer la conexión con MongoDB mediante Mongoose.

`JWT_SECRET` se utiliza para firmar y verificar los tokens JWT.

`JWT_EXPIRES_IN` permite configurar el tiempo de expiración del token.

El archivo `.env` contiene información sensible y no debe subirse al repositorio.

---

# Ejecución

## Modo desarrollo

```bash
npm run dev
```

## Modo normal

```bash
npm start
```

Por defecto, el servidor se ejecuta en:

```text
http://localhost:8080
```

Al iniciar la aplicación se cargan las variables de entorno, se establece la conexión con MongoDB y posteriormente se levanta el servidor Express.

---

# Arquitectura del proyecto

El proyecto utiliza una arquitectura organizada por capas para separar responsabilidades.

```text
src/
│
├── app.js
├── server.js
│
├── config/
│   ├── db.js
│   └── passport.config.js
│
├── constants/
│   ├── eventStatus.js
│   └── roles.js
│
├── controllers/
│   ├── events.controller.js
│   ├── sessions.controller.js
│   └── users.controller.js
│
├── dao/
│   ├── events.dao.js
│   └── users.dao.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   ├── ownership.middleware.js
│   └── error.middleware.js
│
├── models/
│   ├── Event.js
│   └── User.js
│
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
│
├── routes/
│   ├── events.router.js
│   ├── sessions.router.js
│   └── users.router.js
│
├── services/
│   └── events.service.js
│
└── utils/
    ├── hash.js
    └── jwt.js
```

El flujo principal para eventos es:

```text
Route
  ↓
Middlewares
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
DAO
  ↓
Model
  ↓
MongoDB
```

Cada capa mantiene una responsabilidad específica.

### Routes

Definen los endpoints y aplican los middlewares correspondientes.

### Controllers

Manejan `request` y `response`.

No contienen la lógica principal de negocio.

### Services

Contienen las reglas y validaciones de negocio de los eventos.

### Repositories

Funcionan como abstracción entre la lógica de negocio y el acceso a datos.

### DAO

Realizan las operaciones directas mediante Mongoose.

### Models

Definen los esquemas persistidos en MongoDB.

---

# Constantes

Los nombres de roles se encuentran centralizados en:

```text
src/constants/roles.js
```

Roles disponibles:

```text
user
organizer
admin
```

Los estados de eventos se encuentran centralizados en:

```text
src/constants/eventStatus.js
```

Estados disponibles:

```text
draft
published
cancelled
finished
```

Esto evita utilizar strings repetidos en diferentes partes de la aplicación.

---

# Modelo Event

La entidad `Event` representa las actividades organizadas dentro de la plataforma.

Campos principales:

| Campo | Tipo | Requerido | Descripción |
|---|---|:---:|---|
| `title` | String | Sí | Título del evento |
| `description` | String | Sí | Descripción |
| `category` | String | Sí | Categoría |
| `date` | Date | Sí | Fecha del evento |
| `location` | String | Sí | Lugar |
| `capacity` | Number | Sí | Capacidad disponible |
| `price` | Number | Sí | Precio |
| `status` | String | Sí | Estado |
| `organizer` | ObjectId | Sí | Usuario organizador |

El campo `organizer` es una referencia al modelo de usuarios:

```javascript
organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
}
```

Por lo tanto, no se guarda el objeto completo del usuario dentro del evento.

---

# Estados de eventos

Los estados permitidos son:

```text
draft
published
cancelled
finished
```

Al crear un evento, su estado inicial es:

```text
draft
```

Los estados tienen las siguientes finalidades:

- `draft`: evento creado pero todavía no publicado;
- `published`: evento publicado;
- `cancelled`: evento cancelado;
- `finished`: evento finalizado.

Un evento cancelado no se elimina físicamente de MongoDB.

La cancelación se representa mediante:

```text
status: cancelled
```

---

# Reglas de negocio

La lógica de negocio de eventos se encuentra centralizada en:

```text
src/services/events.service.js
```

Entre las principales reglas implementadas se encuentran:

- no se permite crear un evento con fecha pasada;
- `capacity` debe ser mayor a `0`;
- `price` debe ser mayor o igual a `0`;
- un evento cancelado no puede modificarse;
- un evento cancelado no puede cambiar nuevamente de estado;
- no se puede publicar un evento finalizado;
- no se puede publicar un evento cuya fecha ya haya pasado;
- solamente se aceptan estados definidos por la aplicación;
- el organizador se obtiene automáticamente del usuario autenticado;
- el organizador de un evento no puede modificarse desde el body.

---

# Autenticación con Passport.js

Passport.js organiza las distintas formas de validar usuarios.

Se implementan tres estrategias:

```text
register
login
current
```

Las estrategias `register` y `login` utilizan `passport-local`.

La estrategia `current` utiliza `passport-jwt`.

El proyecto utiliza JWT, por lo que las estrategias trabajan con:

```javascript
session: false
```

Cada herramienta mantiene una responsabilidad diferente:

- **bcrypt:** hash y comparación de contraseñas;
- **JWT:** representación de la sesión mediante un token firmado;
- **cookie-parser:** lectura de cookies;
- **Passport:** organización y ejecución de las estrategias de autenticación.

---

# Registro de usuarios

## Endpoint

```text
POST /api/sessions/register
```

El registro público permite crear nuevos usuarios.

Ejemplo:

```json
{
    "first_name": "Gaston",
    "last_name": "Jaureguiberry",
    "email": "gaston@club.com",
    "password": "12345678"
}
```

El registro público no permite seleccionar libremente el rol.

Aunque un cliente intente enviar:

```json
{
    "role": "admin"
}
```

el backend asigna:

```text
role: user
```

Esto evita que un usuario pueda registrarse públicamente como `organizer` o `admin`.

---

# Roles

El sistema admite tres roles:

```text
user
organizer
admin
```

El rol por defecto es:

```text
user
```

## Matriz de permisos

| Acción | user | organizer | admin |
|---|:---:|:---:|:---:|
| Listar eventos | ✅ | ✅ | ✅ |
| Consultar evento por ID | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar evento propio | ❌ | ✅ | ✅ |
| Modificar evento ajeno | ❌ | ❌ | ✅ |
| Cambiar estado propio | ❌ | ✅ | ✅ |
| Cambiar estado ajeno | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

---

# Autenticación y autorización

La aplicación diferencia explícitamente autenticación de autorización.

## 401 Unauthorized

Se utiliza cuando no existe una sesión válida.

Puede ocurrir cuando:

- no existe la cookie `currentUser`;
- el JWT expiró;
- el JWT es inválido;
- el usuario asociado al token no existe.

Ejemplo:

```json
{
    "status": "error",
    "message": "No autenticado"
}
```

## 403 Forbidden

Se utiliza cuando el usuario está autenticado pero no tiene permisos suficientes.

Ejemplo:

```json
{
    "status": "error",
    "message": "No tenés permisos para realizar esta acción"
}
```

En resumen:

```text
401 → no está autenticado
403 → está autenticado, pero no está autorizado
```

---

# Middleware de ownership

La validación de propiedad de los eventos se encuentra separada de los controllers mediante:

```text
src/middlewares/ownership.middleware.js
```

Este middleware verifica si el usuario puede operar sobre un evento específico.

## Organizer

Un `organizer` solamente puede modificar o cambiar el estado de eventos creados por él mismo.

Se compara:

```javascript
event.organizer
```

contra:

```javascript
req.user._id
```

Si intenta modificar un evento ajeno:

```text
403 Forbidden
```

## Admin

Un `admin` puede modificar o cambiar el estado de cualquier evento independientemente de quién sea su propietario.

---

# Crear evento

## Endpoint

```text
POST /api/events
```

Acceso:

```text
organizer
admin
```

Ejemplo:

```json
{
    "title": "Taller de cultivo responsable",
    "description": "Actividad educativa para socios sobre técnicas de cultivo y buenas prácticas.",
    "category": "taller",
    "date": "2026-11-20T19:00:00.000Z",
    "location": "Sala de talleres del club",
    "capacity": 30,
    "price": 450
}
```

El cliente no envía el propietario del evento.

El backend asigna:

```javascript
organizer: req.user._id
```

El evento se crea inicialmente como:

```text
status: draft
```

Respuesta exitosa:

```text
201 Created
```

---

# Listar eventos

## Endpoint

```text
GET /api/events
```

Es una ruta pública.

El listado soporta:

- filtros;
- rango de fechas;
- paginación;
- ordenamiento.

## Filtros disponibles

### Estado

```text
GET /api/events?status=published
```

### Categoría

```text
GET /api/events?category=taller
```

### Ubicación

```text
GET /api/events?location=Sala%20principal
```

### Rango de fechas

```text
GET /api/events?dateFrom=2026-10-01&dateTo=2026-12-31
```

Los filtros pueden combinarse:

```text
GET /api/events?status=published&category=taller
```

---

# Paginación

El listado utiliza:

```text
page
limit
```

Ejemplo:

```text
GET /api/events?page=2&limit=5
```

La respuesta contiene:

```json
{
    "status": "success",
    "data": [],
    "page": 2,
    "limit": 5,
    "total": 12,
    "totalPages": 3
}
```

De esta forma, la API no devuelve necesariamente todos los eventos en una única petición.

---

# Ordenamiento

El parámetro:

```text
sort
```

permite ordenar los resultados.

Ejemplo por fecha:

```text
GET /api/events?sort=date
```

Orden descendente:

```text
GET /api/events?sort=-date
```

Campos admitidos para ordenamiento:

```text
date
title
category
price
capacity
createdAt
```

También puede combinarse con filtros y paginación:

```text
GET /api/events?status=published&category=taller&page=2&limit=5&sort=date
```

---

# Consultar evento por ID

## Endpoint

```text
GET /api/events/:id
```

Acceso público.

Ejemplo:

```text
GET /api/events/68abc123...
```

Si el evento existe:

```text
200 OK
```

Si no existe:

```text
404 Not Found
```

Respuesta:

```json
{
    "status": "error",
    "message": "Evento no encontrado"
}
```

También se validan identificadores que no tengan un formato válido de `ObjectId`.

---

# Actualizar evento

## Endpoint

```text
PUT /api/events/:id
```

Acceso:

```text
dueño del evento
admin
```

Campos modificables:

```text
title
description
category
date
location
capacity
price
```

No se permite modificar directamente:

```text
organizer
status
```

`organizer` representa la propiedad del recurso y no puede cambiarse mediante el body.

`status` posee un endpoint específico.

Un evento con estado:

```text
cancelled
```

no puede modificarse.

---

# Cambiar estado de un evento

## Endpoint

```text
PATCH /api/events/:id/status
```

Acceso:

```text
dueño del evento
admin
```

Ejemplo para publicar:

```json
{
    "status": "published"
}
```

Ejemplo para cancelar:

```json
{
    "status": "cancelled"
}
```

Los únicos estados permitidos son:

```text
draft
published
cancelled
finished
```

Una vez que un evento se encuentra cancelado, no se permite volver a cambiar su estado.

---

# Cancelación de eventos

Los eventos no se eliminan físicamente.

Por este motivo no se implementa:

```text
DELETE /api/events/:id
```

Cancelar un evento significa modificar su estado:

```json
{
    "status": "cancelled"
}
```

mediante:

```text
PATCH /api/events/:id/status
```

Esto permite conservar el historial del recurso dentro de la base de datos.

---

# Ruta administrativa

Existe una ruta exclusiva para administradores:

```text
GET /api/users
```

Comportamiento:

```text
user       → 403
organizer  → 403
admin      → 200
sin sesión → 401
```

La respuesta no incluye las contraseñas de los usuarios.

---

# Login

## Endpoint

```text
POST /api/sessions/login
```

Ejemplo:

```json
{
    "email": "gaston@club.com",
    "password": "12345678"
}
```

Si las credenciales son correctas:

1. Passport deja el usuario disponible en `req.user`;
2. el controller genera el JWT;
3. el JWT se almacena en la cookie `currentUser`.

Respuesta:

```text
200 OK
```

Credenciales inválidas:

```text
401 Unauthorized
```

---

# Usuario actual

## Endpoint

```text
GET /api/sessions/current
```

Requiere autenticación.

```text
Sin sesión → 401
Con sesión → 200
```

---

# JWT

La lógica relacionada con JWT se encuentra en:

```text
src/utils/jwt.js
```

El JWT representa la sesión del usuario.

La contraseña nunca se incluye dentro del token.

El token se firma utilizando:

```text
JWT_SECRET
```

y su expiración se configura mediante:

```text
JWT_EXPIRES_IN
```

---

# Cookie de autenticación

Después de un login exitoso, el JWT se almacena en una cookie llamada:

```text
currentUser
```

La cookie utiliza:

```text
httpOnly: true
sameSite: lax
maxAge: 3600000
secure: true solamente en producción
```

La opción `httpOnly` evita que la cookie pueda ser accedida directamente mediante JavaScript del navegador.

---

# Logout

## Endpoint

```text
POST /api/sessions/logout
```

El logout elimina la cookie:

```text
currentUser
```

Después del logout, intentar acceder a una ruta privada devuelve:

```text
401 Unauthorized
```

---

# Endpoints disponibles

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Comprueba el estado del servidor |
| GET | `/api/events` | Público | Lista eventos con filtros, paginación y ordenamiento |
| GET | `/api/events/:id` | Público | Consulta un evento |
| POST | `/api/events` | organizer / admin | Crea un evento |
| PUT | `/api/events/:id` | dueño / admin | Modifica un evento |
| PATCH | `/api/events/:id/status` | dueño / admin | Cambia el estado de un evento |
| GET | `/api/sessions` | Público | Comprueba el módulo de sesiones |
| POST | `/api/sessions/register` | Público | Registra un usuario |
| POST | `/api/sessions/login` | Público | Inicia sesión |
| GET | `/api/sessions/current` | Autenticado | Obtiene el usuario actual |
| POST | `/api/sessions/logout` | Público | Cierra la sesión |
| GET | `/api/users` | admin | Devuelve los usuarios |

---

# Casos de prueba de la Pre-entrega 6

## 1. User intentando crear evento

```text
POST /api/events
role: user
```

Resultado esperado:

```text
403 Forbidden
```

## 2. Crear evento con fecha pasada

```text
POST /api/events
role: organizer
```

Resultado esperado:

```text
400 Bad Request
```

## 3. Crear evento con capacity 0

```json
{
    "capacity": 0
}
```

Resultado esperado:

```text
400 Bad Request
```

## 4. Organizer modificando evento propio

```text
PUT /api/events/:id
```

Resultado esperado:

```text
200 OK
```

## 5. Organizer modificando evento ajeno

```text
PUT /api/events/:id
```

Resultado esperado:

```text
403 Forbidden
```

## 6. Admin modificando evento ajeno

```text
PUT /api/events/:id
role: admin
```

Resultado esperado:

```text
200 OK
```

## 7. Cambiar estado de evento cancelado

Una vez que el evento posee:

```text
status: cancelled
```

un nuevo cambio de estado debe ser rechazado.

Resultado esperado:

```text
400 Bad Request
```

## 8. Listado con filtros y paginación

```text
GET /api/events?status=published&category=taller&page=2&limit=5
```

La respuesta debe incluir:

```text
data
page
limit
total
totalPages
```

## 9. Consultar evento inexistente

```text
GET /api/events/:id
```

Resultado esperado:

```text
404 Not Found
```

---

# Seguridad

El archivo `.gitignore` excluye:

```text
node_modules/
.env
```

Además:

- las contraseñas se almacenan utilizando bcrypt;
- las contraseñas no se devuelven en las respuestas;
- el JWT no contiene la contraseña;
- `JWT_SECRET` se obtiene desde variables de entorno;
- el registro público fuerza el rol `user`;
- los nombres de roles se encuentran centralizados;
- los estados de eventos se encuentran centralizados;
- autenticación y autorización están separadas;
- las rutas privadas responden `401` cuando no existe sesión;
- las acciones sin permisos responden `403`;
- los organizers no pueden modificar eventos ajenos;
- la propiedad del evento se valida mediante middleware;
- `organizer` no puede modificarse desde el body;
- el estado no puede modificarse mediante la actualización general;
- los eventos cancelados no se eliminan físicamente;
- la cookie de autenticación utiliza `httpOnly`.

---

# Scripts disponibles

```json
{
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
}
```

---

# Mejoras incorporadas respecto a la Pre-entrega 5

A partir de la devolución de la entrega anterior se realizaron las siguientes mejoras:

- centralización de los roles en `src/constants/roles.js`;
- extracción de la validación de ownership a `ownership.middleware.js`;
- eliminación de strings de roles repetidos en modelos y rutas;
- incorporación de una capa `services` para separar la lógica de negocio de controllers y acceso a datos;
- centralización de estados de eventos;
- ampliación de la entidad `Event`;
- filtros, paginación y ordenamiento.

De esta forma se mantiene una separación más clara de responsabilidades.

---

# Próximas funcionalidades

El proyecto queda preparado para continuar incorporando:

- inscripciones y reservas a eventos;
- tickets;
- control de cupos;
- cancelación de inscripciones;
- notificaciones;
- administración de actividades del club.

---

# Autor

**Gastón Jaureguiberry**

Proyecto desarrollado como **Pre-entrega 6 de Backend II en Coderhouse**.