# Plataforma de Eventos y Reservas para Club Cannábico

API REST desarrollada como **Entrega Final de Backend II en Coderhouse**.

El proyecto implementa una plataforma para la gestión de eventos, actividades e inscripciones de un club cannábico, aplicando autenticación, autorización por roles, arquitectura por capas, control de cupos, tickets de inscripción, notificaciones por email y protección de información sensible.

La aplicación fue desarrollada con:

- Node.js
- Express
- MongoDB
- Mongoose
- Passport.js
- JWT
- bcrypt
- Nodemailer
- Arquitectura DAO / Repository / Service / Controller
- DTOs

---

# Funcionalidades principales

La API permite:

- registrar usuarios;
- iniciar y cerrar sesión;
- autenticar mediante JWT almacenado en cookie;
- obtener el usuario autenticado;
- manejar roles `user`, `organizer` y `admin`;
- crear y administrar eventos;
- controlar la propiedad de los eventos;
- filtrar, ordenar y paginar eventos;
- inscribir usuarios a eventos;
- controlar la capacidad disponible;
- impedir inscripciones activas duplicadas;
- cancelar inscripciones de forma lógica;
- liberar automáticamente los cupos cancelados;
- consultar tickets propios;
- consultar las inscripciones de un evento;
- enviar emails de confirmación;
- enviar emails de cancelación;
- proteger información sensible mediante DTOs;
- validar identificadores antes de consultar MongoDB;
- manejar errores HTTP de forma centralizada.

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
- Nodemailer
- Ethereal Email
- JavaScript
- ES Modules

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

MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=tu_usuario_ethereal
MAIL_PASS=tu_password_ethereal
MAIL_FROM=tu_email_ethereal
```

## Variables utilizadas

| Variable | Descripción |
|---|---|
| `PORT` | Puerto utilizado por el servidor |
| `NODE_ENV` | Entorno de ejecución |
| `MONGO_URL` | URL de conexión a MongoDB |
| `JWT_SECRET` | Clave utilizada para firmar JWT |
| `JWT_EXPIRES_IN` | Tiempo de expiración del JWT |
| `MAIL_HOST` | Servidor SMTP |
| `MAIL_PORT` | Puerto SMTP |
| `MAIL_USER` | Usuario SMTP |
| `MAIL_PASS` | Contraseña SMTP |
| `MAIL_FROM` | Dirección utilizada como remitente |

Las variables requeridas son validadas durante el inicio de la aplicación.

Si falta una variable obligatoria, el servidor no inicia y devuelve un mensaje indicando qué configuración falta.

El archivo `.env` contiene información sensible y **no debe subirse al repositorio**.

---

# Configuración de email

La aplicación utiliza **Nodemailer**.

Para desarrollo se puede utilizar **Ethereal Email**, lo que permite probar el envío de correos sin utilizar una cuenta personal real.

Las credenciales SMTP se obtienen exclusivamente mediante variables de entorno.

No existen credenciales de correo hardcodeadas en el código fuente.

---

# Ejecución

## Desarrollo

```bash
npm run dev
```

## Ejecución normal

```bash
npm start
```

Por defecto:

```text
http://localhost:8080
```

Para comprobar que el servidor está funcionando:

```http
GET /api/health
```

Respuesta:

```json
{
    "status": "ok",
    "message": "Servidor activo"
}
```

---

# Arquitectura del proyecto

La aplicación utiliza una arquitectura por capas para separar acceso a datos, lógica de negocio y manejo HTTP.

```text
src/
│
├── app.js
├── server.js
│
├── config/
│   ├── db.js
│   ├── mail.config.js
│   └── passport.config.js
│
├── constants/
│   ├── eventStatus.js
│   ├── ticketStatus.js
│   └── roles.js
│
├── controllers/
│   ├── events.controller.js
│   ├── sessions.controller.js
│   ├── tickets.controller.js
│   └── users.controller.js
│
├── dao/
│   ├── events.dao.js
│   ├── tickets.dao.js
│   └── users.dao.js
│
├── dto/
│   ├── event.dto.js
│   ├── ticket.dto.js
│   └── user.dto.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   ├── error.middleware.js
│   └── ownership.middleware.js
│
├── models/
│   ├── Event.js
│   ├── Ticket.js
│   └── User.js
│
├── repositories/
│   ├── events.repository.js
│   ├── tickets.repository.js
│   └── users.repository.js
│
├── routes/
│   ├── events.router.js
│   ├── sessions.router.js
│   ├── tickets.router.js
│   └── users.router.js
│
├── services/
│   ├── events.service.js
│   ├── mail.service.js
│   ├── tickets.service.js
│   └── users.service.js
│
└── utils/
    ├── hash.js
    └── jwt.js
```

---

# Flujo de arquitectura

El flujo principal de una operación es:

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

Para las respuestas se utilizan DTOs:

```text
MongoDB
  ↓
Model
  ↓
DAO
  ↓
Repository
  ↓
Service
  ↓
Controller
  ↓
DTO
  ↓
Response
```

---

# Responsabilidad de las capas

## Routes

Definen los endpoints y aplican los middlewares necesarios.

Las rutas no contienen lógica de acceso a MongoDB.

## Controllers

Los controllers coordinan el flujo HTTP.

Sus responsabilidades son:

- recibir `request`;
- obtener `params`, `query` y `body`;
- llamar al service correspondiente;
- transformar la respuesta utilizando DTOs;
- devolver la respuesta HTTP.

Los controllers no importan modelos de Mongoose ni realizan consultas directas a MongoDB.

## Services

Los services concentran la lógica de negocio.

Entre las reglas implementadas se encuentran:

- validación de usuarios;
- registro y login;
- validación de eventos;
- control de estados;
- validación de fechas;
- filtros;
- paginación;
- ordenamiento;
- control de campos modificables;
- prevención de inscripciones duplicadas;
- control de cupos;
- cálculo de disponibilidad;
- cancelación lógica;
- permisos relacionados con tickets;
- envío de notificaciones.

Los services consumen repositories o servicios relacionados.

No importan modelos de Mongoose directamente.

## Repositories

Los repositories funcionan como intermediarios entre los services y los DAO.

Exponen operaciones orientadas al dominio, por ejemplo:

```text
findByEmail
findById
createUser
createEvent
updateEvent
findActiveByUserAndEvent
getOccupiedCapacity
updateTicket
```

Los repositories no importan modelos de Mongoose.

## DAO

Los DAO son responsables del acceso directo a MongoDB.

```text
UsersDAO
EventsDAO
TicketsDAO
```

Los modelos de Mongoose son importados directamente únicamente por los DAO.

Los DAO realizan operaciones como:

```text
find
findOne
findById
create
findByIdAndUpdate
countDocuments
aggregate
populate
```

## DTO

Los DTO controlan qué información se devuelve al cliente.

Se implementaron:

```text
UserDTO
EventDTO
TicketDTO
```

Esto permite evitar la exposición directa de documentos completos de MongoDB y proteger información sensible.

---

# Usuarios

El modelo `User` contiene:

| Campo | Tipo | Requerido |
|---|---|:---:|
| `first_name` | String | Sí |
| `last_name` | String | Sí |
| `email` | String | Sí |
| `password` | String | Sí |
| `role` | String | Sí |

El email es único.

Las contraseñas se almacenan utilizando bcrypt.

---

# Roles

Los roles disponibles son:

```text
user
organizer
admin
```

Se encuentran centralizados en:

```text
src/constants/roles.js
```

Las constantes utilizan `Object.freeze()` para evitar modificaciones accidentales durante la ejecución.

El rol por defecto es:

```text
user
```

## Seguridad del registro público

El registro público **no permite elegir el rol**.

Aunque un cliente envíe:

```json
{
    "first_name": "Usuario",
    "last_name": "Prueba",
    "email": "usuario@test.com",
    "password": "Backend123",
    "role": "admin"
}
```

el usuario será creado como:

```text
role: user
```

El rol se asigna desde la lógica interna del servidor.

---

# Usuarios de prueba

Los usuarios pueden crearse utilizando:

```http
POST /api/sessions/register
```

Ejemplo:

```json
{
    "first_name": "Usuario",
    "last_name": "Prueba",
    "email": "usuario@test.com",
    "password": "Backend123"
}
```

El registro público crea siempre usuarios con rol:

```text
user
```

Para probar permisos de `organizer` y `admin` durante desarrollo, primero se debe registrar el usuario normalmente y luego modificar su campo `role` directamente en la base de datos de desarrollo.

Por ejemplo:

```text
user → organizer
```

o:

```text
user → admin
```

Valores válidos:

```text
user
organizer
admin
```

No se incluye un endpoint público para elevar privilegios de usuario.

---

# Autenticación

La autenticación utiliza **Passport.js**.

Estrategias configuradas:

```text
register
login
current
```

`register` y `login` utilizan:

```text
passport-local
```

`current` utiliza:

```text
passport-jwt
```

El JWT se almacena en una cookie:

```text
currentUser
```

configurada como:

```text
httpOnly
```

La contraseña nunca se incluye dentro del JWT.

---

# Registro

## Endpoint

```http
POST /api/sessions/register
```

Ejemplo:

```json
{
    "first_name": "Gastón",
    "last_name": "Jaureguiberry",
    "email": "gaston@test.com",
    "password": "Backend123"
}
```

Respuesta exitosa:

```text
201 Created
```

Ejemplo:

```json
{
    "status": "success",
    "payload": {
        "id": "ObjectId",
        "first_name": "Gastón",
        "last_name": "Jaureguiberry",
        "email": "gaston@test.com",
        "role": "user"
    }
}
```

La respuesta utiliza `UserDTO` y no incluye `password`.

Un email ya registrado devuelve:

```text
409 Conflict
```

---

# Login

## Endpoint

```http
POST /api/sessions/login
```

Body:

```json
{
    "email": "gaston@test.com",
    "password": "Backend123"
}
```

Respuesta:

```text
200 OK
```

```json
{
    "status": "success",
    "message": "Login correcto"
}
```

El servidor genera un JWT y lo almacena en la cookie:

```text
currentUser
```

Credenciales incorrectas producen:

```text
401 Unauthorized
```

---

# Usuario actual

## Endpoint

```http
GET /api/sessions/current
```

Requiere autenticación.

Ejemplo:

```json
{
    "status": "success",
    "payload": {
        "id": "ObjectId",
        "first_name": "Gastón",
        "last_name": "Jaureguiberry",
        "email": "gaston@test.com",
        "role": "user"
    }
}
```

La respuesta no contiene `password`.

---

# Logout

## Endpoint

```http
POST /api/sessions/logout
```

La operación elimina la cookie:

```text
currentUser
```

Después del logout:

```http
GET /api/sessions/current
```

debe devolver:

```text
401 Unauthorized
```

---

# Autenticación y autorización

La API diferencia:

```text
401 Unauthorized
```

de:

```text
403 Forbidden
```

## 401

Se utiliza cuando no existe una autenticación válida.

Ejemplo:

```json
{
    "status": "error",
    "message": "No autenticado"
}
```

## 403

Se utiliza cuando existe autenticación pero el usuario no posee permisos para realizar la operación.

Ejemplo:

```json
{
    "status": "error",
    "message": "No tenés permisos para realizar esta acción"
}
```

---

# Eventos

El modelo `Event` contiene:

| Campo | Tipo | Requerido |
|---|---|:---:|
| `title` | String | Sí |
| `description` | String | Sí |
| `category` | String | Sí |
| `date` | Date | Sí |
| `location` | String | Sí |
| `capacity` | Number | Sí |
| `price` | Number | Sí |
| `status` | String | Sí |
| `organizer` | ObjectId | Sí |

`organizer` referencia a un documento de `User`.

---

# Estados de eventos

Estados disponibles:

```text
draft
published
cancelled
finished
```

Se encuentran centralizados en:

```text
src/constants/eventStatus.js
```

Un evento nuevo comienza como:

```text
draft
```

Para aceptar inscripciones debe estar:

```text
published
```

---

# Reglas de eventos

La lógica de negocio valida que:

- la fecha sea futura;
- `capacity` sea mayor a `0`;
- `price` sea mayor o igual a `0`;
- el estado sea válido;
- un evento cancelado no pueda modificarse;
- un evento cancelado no pueda cambiar nuevamente de estado;
- un evento finalizado o con fecha pasada no pueda publicarse;
- solamente se modifiquen campos permitidos.

Los campos modificables mediante `PUT` son:

```text
title
description
category
date
location
capacity
price
```

El `organizer` no puede modificarse mediante el body.

El `status` posee un endpoint específico.

---

# Crear evento

## Endpoint

```http
POST /api/events
```

Acceso:

```text
organizer
admin
```

Un usuario con rol:

```text
user
```

recibe:

```text
403 Forbidden
```

Ejemplo de body:

```json
{
    "title": "Taller de cultivo",
    "description": "Actividad introductoria",
    "category": "Taller",
    "date": "2027-05-20T19:00:00.000Z",
    "location": "Club",
    "capacity": 30,
    "price": 500
}
```

El organizer se obtiene del usuario autenticado.

---

# Consultar eventos

## Listado

```http
GET /api/events
```

Es público.

## Evento individual

```http
GET /api/events/:id
```

También es público.

Un ObjectId inválido devuelve:

```text
400 Bad Request
```

Un identificador válido correspondiente a un evento inexistente devuelve:

```text
404 Not Found
```

---

# Filtros, paginación y ordenamiento

`GET /api/events` admite filtros combinables.

## Estado

```http
GET /api/events?status=published
```

## Categoría

```http
GET /api/events?category=Taller
```

## Ubicación

```http
GET /api/events?location=Club
```

## Rango de fechas

```http
GET /api/events?dateFrom=2027-01-01&dateTo=2027-12-31
```

## Paginación

```http
GET /api/events?page=2&limit=5
```

## Orden ascendente

```http
GET /api/events?sort=date
```

## Orden descendente

```http
GET /api/events?sort=-date
```

Campos habilitados para ordenar:

```text
date
title
category
price
capacity
createdAt
```

Los filtros pueden combinarse:

```http
GET /api/events?status=published&category=Taller&page=2&limit=5&sort=date
```

---

# Respuesta paginada

Ejemplo:

```json
{
    "status": "success",
    "data": [],
    "page": 2,
    "limit": 5,
    "total": 27,
    "totalPages": 6
}
```

Valores inválidos de `page`, `limit`, fechas o campos de ordenamiento devuelven:

```text
400 Bad Request
```

---

# Modificar evento

## Endpoint

```http
PUT /api/events/:id
```

Acceso:

```text
organizer propietario
admin
```

Un organizer no puede modificar el evento de otro organizer.

Resultado:

```text
403 Forbidden
```

Un admin puede modificar eventos pertenecientes a cualquier organizer.

---

# Cambiar estado de evento

## Endpoint

```http
PATCH /api/events/:id/status
```

Ejemplo:

```json
{
    "status": "published"
}
```

Acceso:

```text
organizer propietario
admin
```

---

# Tickets e inscripciones

El modelo `Ticket` representa la inscripción de un usuario a un evento.

Campos:

| Campo | Tipo | Descripción |
|---|---|---|
| `user` | ObjectId | Usuario |
| `event` | ObjectId | Evento |
| `status` | String | Estado |
| `quantity` | Number | Cantidad de lugares |
| `reservationCode` | String | Código único |
| `createdAt` | Date | Fecha de creación |
| `cancelledAt` | Date / null | Fecha de cancelación |

Los tickets utilizan referencias a usuarios y eventos.

No almacenan objetos completos.

---

# Estados de tickets

Estados disponibles:

```text
confirmed
pending
cancelled
```

Una inscripción creada correctamente utiliza:

```text
confirmed
```

Una inscripción cancelada utiliza:

```text
cancelled
```

Los tickets cancelados permanecen almacenados.

No se eliminan físicamente.

---

# Crear una inscripción

## Endpoint

```http
POST /api/events/:eid/tickets
```

Requiere autenticación.

Body:

```json
{
    "quantity": 2
}
```

Antes de crear el ticket se valida:

1. que `quantity` sea un número entero mayor a `0`;
2. que el evento exista;
3. que el evento se encuentre `published`;
4. que la fecha del evento sea futura;
5. que el usuario no tenga una inscripción activa para ese evento;
6. que existan cupos suficientes.

Si todas las validaciones son correctas:

```text
generar reservationCode
        ↓
crear Ticket
        ↓
status = confirmed
        ↓
enviar email
        ↓
devolver TicketDTO
```

Respuesta:

```text
201 Created
```

Ejemplo:

```json
{
    "status": "success",
    "message": "Inscripción realizada correctamente",
    "payload": {
        "id": "ObjectId",
        "user": "ObjectId",
        "event": "ObjectId",
        "status": "confirmed",
        "quantity": 2,
        "reservationCode": "UUID",
        "createdAt": "fecha"
    }
}
```

---

# Prevención de inscripciones duplicadas

Regla:

> Un usuario puede tener solamente una inscripción activa por evento.

Si ya existe una inscripción activa:

```text
409 Conflict
```

Ejemplo:

```json
{
    "status": "error",
    "message": "Ya tenés una inscripción activa para este evento"
}
```

Un ticket cancelado no impide crear una nueva inscripción.

---

# Control de cupos

La capacidad total se encuentra en:

```text
event.capacity
```

Los lugares ocupados se calculan sumando:

```text
ticket.quantity
```

de todos los tickets cuyo estado no sea:

```text
cancelled
```

Conceptualmente:

```text
cupos disponibles =
capacidad del evento - lugares ocupados
```

Ejemplo:

```text
capacidad = 30
ocupados = 25

disponibles = 5
```

Una inscripción de:

```json
{
    "quantity": 6
}
```

será rechazada.

La respuesta informa los cupos disponibles.

---

# Cancelar una inscripción

## Endpoint

```http
PATCH /api/tickets/:tid/cancel
```

Puede cancelar:

```text
dueño del ticket
admin
```

La cancelación es lógica.

El ticket pasa a:

```text
status: cancelled
```

y se registra:

```text
cancelledAt
```

No se utiliza `DELETE`.

Antes de cancelar se valida:

- formato del ObjectId;
- existencia del ticket;
- propiedad del ticket o rol admin;
- que el ticket no esté previamente cancelado.

Un usuario intentando cancelar un ticket ajeno recibe:

```text
403 Forbidden
```

Intentar cancelar nuevamente un ticket cancelado devuelve:

```text
409 Conflict
```

---

# Cancelación realizada por admin

Un administrador puede cancelar el ticket de otro usuario.

La autorización utiliza el usuario autenticado para comprobar los permisos.

Sin embargo, la notificación de cancelación se envía al **propietario real del ticket**, no al administrador que realizó la operación.

Esto mantiene separadas:

```text
persona que ejecuta la acción
```

y:

```text
persona propietaria de la inscripción
```

---

# Liberación automática de cupos

Al cancelar una inscripción no se modifica manualmente:

```text
event.capacity
```

Los tickets con:

```text
status: cancelled
```

dejan de participar en el cálculo de lugares ocupados.

Por lo tanto, los lugares quedan automáticamente disponibles para nuevas inscripciones.

Ejemplo:

```text
capacidad: 10

ticket confirmado:
quantity: 10

disponibles: 0

        ↓ cancelar ticket

ticket:
status: cancelled

        ↓

disponibles: 10
```

Después de cancelar, otro usuario puede utilizar esos lugares.

---

# Consultar mis tickets

## Endpoint

```http
GET /api/tickets/my-tickets
```

Requiere autenticación.

La búsqueda utiliza el identificador del usuario autenticado.

Cada usuario recibe únicamente sus propios tickets.

La información básica del evento se obtiene mediante `populate`:

```text
title
date
location
```

La respuesta se transforma utilizando `TicketDTO`.

---

# Consultar inscripciones de un evento

## Endpoint

```http
GET /api/events/:eid/tickets
```

Acceso:

```text
organizer propietario
admin
```

Un organizer solamente puede consultar tickets pertenecientes a sus propios eventos.

Un organizer intentando consultar el evento de otro organizer recibe:

```text
403 Forbidden
```

Un `user` tampoco posee permisos:

```text
403 Forbidden
```

Un `admin` puede consultar las inscripciones de cualquier evento.

---

# Notificaciones por email

La aplicación utiliza:

```text
Nodemailer
```

La configuración se encuentra en:

```text
src/config/mail.config.js
```

La lógica de envío se encuentra en:

```text
src/services/mail.service.js
```

---

# Email de confirmación

Después de crear correctamente un ticket se envía una notificación al usuario.

Incluye:

- nombre;
- evento;
- fecha;
- lugar;
- cantidad;
- código de reserva.

---

# Email de cancelación

Después de cancelar correctamente un ticket se envía una notificación al propietario de la inscripción.

Incluye:

- nombre;
- evento;
- fecha;
- lugar;
- cantidad;
- código de reserva;
- confirmación de liberación de los lugares.

Las credenciales SMTP provienen exclusivamente de variables de entorno.

---

# DTOs

## UserDTO

Puede devolver:

```text
id
first_name
last_name
email
role
```

Nunca devuelve:

```text
password
```

## EventDTO

Controla campos como:

```text
id
title
description
category
date
location
capacity
price
status
organizer
createdAt
updatedAt
```

## TicketDTO

Controla:

```text
id
user
event
status
quantity
reservationCode
createdAt
cancelledAt
```

Cuando existen documentos relacionados poblados, el DTO selecciona únicamente la información permitida.

---

# Validación de ObjectId

Antes de determinadas consultas se valida el formato utilizando:

```javascript
mongoose.Types.ObjectId.isValid(id)
```

Por ejemplo:

```http
GET /api/events/abc123
```

devuelve:

```text
400 Bad Request
```

en lugar de permitir que un `CastError` termine como:

```text
500 Internal Server Error
```

También se valida el identificador de tickets durante la cancelación.

---

# Manejo centralizado de errores

La aplicación utiliza:

```text
src/middlewares/error.middleware.js
```

Los errores de negocio incluyen un `statusCode`.

Códigos utilizados:

| Código | Significado | Ejemplo |
|---|---|---|
| `400` | Datos inválidos | ObjectId o fecha inválida |
| `401` | No autenticado | Endpoint protegido sin sesión |
| `403` | Sin permisos | Recurso perteneciente a otro usuario |
| `404` | No encontrado | Evento o ticket inexistente |
| `409` | Conflicto | Inscripción duplicada |
| `500` | Error interno | Error inesperado |

Los errores inesperados de infraestructura son enviados al middleware central y no se convierten artificialmente en errores de validación.

---

# Permisos principales

| Acción | user | organizer | admin |
|---|:---:|:---:|:---:|
| Listar eventos | ✅ | ✅ | ✅ |
| Consultar evento | ✅ | ✅ | ✅ |
| Crear evento | ❌ | ✅ | ✅ |
| Modificar evento propio | ❌ | ✅ | ✅ |
| Modificar evento ajeno | ❌ | ❌ | ✅ |
| Cambiar estado propio | ❌ | ✅ | ✅ |
| Inscribirse a evento | ✅ | ✅ | ✅ |
| Consultar tickets propios | ✅ | ✅ | ✅ |
| Cancelar ticket propio | ✅ | ✅ | ✅ |
| Cancelar ticket ajeno | ❌ | ❌ | ✅ |
| Consultar tickets de evento propio | ❌ | ✅ | ✅ |
| Consultar tickets de evento ajeno | ❌ | ❌ | ✅ |

---

# Endpoints

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Estado del servidor |
| POST | `/api/sessions/register` | Público | Registrar usuario |
| POST | `/api/sessions/login` | Público | Iniciar sesión |
| GET | `/api/sessions/current` | Autenticado | Usuario actual |
| POST | `/api/sessions/logout` | Público | Cerrar sesión |
| GET | `/api/users` | admin | Listar usuarios |
| GET | `/api/events` | Público | Listar eventos |
| GET | `/api/events/:id` | Público | Consultar evento |
| POST | `/api/events` | organizer / admin | Crear evento |
| PUT | `/api/events/:id` | organizer dueño / admin | Modificar evento |
| PATCH | `/api/events/:id/status` | organizer dueño / admin | Cambiar estado |
| POST | `/api/events/:eid/tickets` | Autenticado | Crear inscripción |
| GET | `/api/events/:eid/tickets` | organizer dueño / admin | Consultar inscripciones |
| GET | `/api/tickets/my-tickets` | Autenticado | Consultar tickets propios |
| PATCH | `/api/tickets/:tid/cancel` | dueño / admin | Cancelar inscripción |

También existe:

```http
GET /api/sessions
```

como endpoint público de estado del módulo de sesiones.

---

# Flujo completo de autenticación

```text
POST /api/sessions/register
        ↓
usuario creado como user
        ↓
POST /api/sessions/login
        ↓
JWT generado
        ↓
cookie currentUser
        ↓
GET /api/sessions/current
        ↓
UserDTO
        ↓
POST /api/sessions/logout
        ↓
cookie eliminada
        ↓
GET /api/sessions/current
        ↓
401 Unauthorized
```

---

# Flujo completo de inscripción

```text
organizer crea evento
        ↓
evento = draft
        ↓
organizer publica evento
        ↓
evento = published
        ↓
usuario autenticado solicita inscripción
        ↓
validar evento
        ↓
validar duplicados
        ↓
calcular cupos
        ↓
crear Ticket
        ↓
status = confirmed
        ↓
generar reservationCode
        ↓
email de confirmación
        ↓
usuario consulta sus tickets
        ↓
usuario cancela
        ↓
status = cancelled
        ↓
cancelledAt
        ↓
email de cancelación
        ↓
cupos nuevamente disponibles
```

---

# Pruebas recomendadas para la Entrega Final

Antes de entregar se recomienda verificar el siguiente circuito completo.

## 1. Registro

```http
POST /api/sessions/register
```

Esperado:

```text
201 Created
```

Comprobar:

```text
role = user
password no aparece
```

---

## 2. Login

```http
POST /api/sessions/login
```

Esperado:

```text
200 OK
```

Comprobar que Postman almacene:

```text
currentUser
```

---

## 3. Current

```http
GET /api/sessions/current
```

Esperado:

```text
200 OK
```

La respuesta no debe contener `password`.

---

## 4. Logout

```http
POST /api/sessions/logout
```

Luego:

```http
GET /api/sessions/current
```

Esperado:

```text
401 Unauthorized
```

---

## 5. User intentando crear evento

Autenticarse como:

```text
user
```

Ejecutar:

```http
POST /api/events
```

Esperado:

```text
403 Forbidden
```

---

## 6. Organizer crea evento

Autenticarse como:

```text
organizer
```

Ejecutar:

```http
POST /api/events
```

Esperado:

```text
201 Created
```

---

## 7. Publicar evento

```http
PATCH /api/events/:id/status
```

Body:

```json
{
    "status": "published"
}
```

Esperado:

```text
200 OK
```

---

## 8. Inscripción exitosa

Autenticarse como `user`.

```http
POST /api/events/:eid/tickets
```

Body:

```json
{
    "quantity": 1
}
```

Esperado:

```text
201 Created
```

Comprobar:

```text
status = confirmed
reservationCode generado
email enviado
```

---

## 9. Inscripción duplicada

Repetir la inscripción anterior.

Esperado:

```text
409 Conflict
```

---

## 10. Capacidad insuficiente

Solicitar más lugares que los disponibles.

Esperado:

```text
409 Conflict
```

El mensaje debe indicar que no existen cupos suficientes.

---

## 11. Consultar tickets propios

```http
GET /api/tickets/my-tickets
```

Esperado:

```text
200 OK
```

Comprobar:

- únicamente tickets del usuario autenticado;
- datos básicos del evento;
- ausencia de información sensible.

---

## 12. Cancelar inscripción

```http
PATCH /api/tickets/:tid/cancel
```

Esperado:

```text
200 OK
```

Comprobar:

```text
status = cancelled
cancelledAt != null
```

También debe enviarse el email de cancelación.

---

## 13. Reutilizar cupo liberado

Después de cancelar una inscripción, realizar una nueva inscripción utilizando los lugares liberados.

Esperado:

```text
201 Created
```

Esto demuestra que los tickets cancelados no ocupan capacidad.

---

## 14. Organizer intentando modificar evento ajeno

Utilizar dos usuarios con rol:

```text
organizer
```

El segundo organizer intenta:

```http
PUT /api/events/:id
```

sobre un evento creado por el primero.

Esperado:

```text
403 Forbidden
```

---

## 15. Admin modificando evento ajeno

Autenticarse como:

```text
admin
```

Modificar un evento creado por un organizer.

Esperado:

```text
200 OK
```

---

## 16. ObjectId inválido

```http
GET /api/events/abc123
```

Esperado:

```text
400 Bad Request
```

No debe producir:

```text
500 Internal Server Error
```

---

## 17. Evento inexistente

Utilizar un ObjectId válido que no corresponda a ningún evento.

Esperado:

```text
404 Not Found
```

---

## 18. Paginación

```http
GET /api/events?status=published&page=2&limit=5
```

Comprobar estructura:

```json
{
    "status": "success",
    "data": [],
    "page": 2,
    "limit": 5,
    "total": 0,
    "totalPages": 0
}
```

Los valores dependerán de los registros existentes en la base de datos.

---

# Seguridad

La aplicación implementa las siguientes medidas:

- contraseñas almacenadas mediante bcrypt;
- JWT almacenado en cookie `httpOnly`;
- JWT sin contraseña;
- `UserDTO` sin password;
- `/current` sin password;
- roles centralizados;
- registro público limitado al rol `user`;
- autorización separada de autenticación;
- rutas privadas protegidas;
- ownership de eventos;
- cancelación de tickets limitada a dueño/admin;
- validación de ObjectId;
- variables sensibles almacenadas en `.env`;
- `.env` excluido de Git;
- `.env.example` sin credenciales reales;
- credenciales SMTP no hardcodeadas;
- modelos de Mongoose importados directamente únicamente desde DAO;
- controllers sin acceso directo a MongoDB;
- services como capa de lógica de negocio;
- repositories como abstracción del acceso a datos;
- DTOs para controlar la información expuesta;
- cancelación lógica de tickets;
- prevención de inscripciones activas duplicadas.

---

# `.gitignore`

El repositorio debe excluir al menos:

```gitignore
node_modules/
.env
```

El archivo:

```text
.env.example
```

sí debe formar parte del repositorio.

---

# Scripts

```json
{
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
}
```

---

# Mejoras incorporadas durante el desarrollo

Durante las diferentes etapas del proyecto se incorporaron mejoras derivadas de pruebas y devoluciones.

## Validación de ObjectId

Los identificadores son validados antes de determinadas consultas para impedir que un identificador mal formado genere un `CastError` tratado como error interno.

Resultado:

```text
ObjectId inválido
        ↓
400 Bad Request
```

en lugar de:

```text
500 Internal Server Error
```

## Notificación de cancelación

Además del email de confirmación de inscripción, se incorporó una notificación automática cuando una inscripción es cancelada.

```text
cancelación
     ↓
Ticket = cancelled
     ↓
cancelledAt
     ↓
MailService
     ↓
email al propietario del ticket
```

## Arquitectura por capas

La aplicación evolucionó hacia una separación formal:

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
DAO
   ↓
Model
```

Esto permite mantener separadas:

- coordinación HTTP;
- reglas de negocio;
- abstracción de persistencia;
- acceso directo a MongoDB.

## DTOs

Se incorporaron:

```text
UserDTO
EventDTO
TicketDTO
```

para controlar explícitamente la información expuesta por la API.

## UsersService

La lógica de registro, validación de usuarios y login se encuentra centralizada en:

```text
src/services/users.service.js
```

Passport utiliza este service en lugar de acceder directamente al repository.

## Ownership

La validación de propiedad de eventos utiliza `EventsService`, manteniendo el acceso a datos dentro del flujo definido por la arquitectura.

## Configuración

Las variables necesarias para ejecutar la aplicación son validadas durante el arranque.

La aplicación no inicia si falta configuración obligatoria.

---

# Criterios cubiertos por el proyecto

La Entrega Final incluye:

```text
Autenticación con Passport      ✅
JWT mediante cookie             ✅
Registro seguro                 ✅
Login                           ✅
Current                         ✅
Logout                          ✅
Roles                           ✅
401 / 403                       ✅
CRUD de eventos                 ✅
Ownership                       ✅
Filtros                         ✅
Paginación                      ✅
Ordenamiento                    ✅
Validaciones de negocio         ✅
Tickets                         ✅
Control de cupos                ✅
Prevención de duplicados        ✅
Cancelación lógica              ✅
Liberación de cupos             ✅
Emails                          ✅
DAO                             ✅
Repository                      ✅
Service                         ✅
DTO                             ✅
Error handler centralizado      ✅
Variables de entorno            ✅
Protección de información       ✅
```

---

# Autor

**Gastón Jaureguiberry**

Proyecto desarrollado como **Entrega Final de Backend II en Coderhouse**.