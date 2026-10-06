# Plataforma de Eventos y Reservas para Club Cannábico

API backend desarrollada con **Node.js**, **Express**, **MongoDB**, **Mongoose**, **Passport.js**, **bcrypt**, **jsonwebtoken**, **cookie-parser** y **Nodemailer**, orientada a una plataforma de eventos, actividades e inscripciones para un club cannábico.

Esta octava pre-entrega de **Backend II** refactoriza la aplicación utilizando una arquitectura profesional basada en **DAO, Repository, Service y DTO**, manteniendo el comportamiento externo de los endpoints existentes.

La aplicación permite gestionar usuarios, autenticación, eventos e inscripciones mediante tickets, incluyendo:

- registro y login de usuarios;
- autenticación mediante JWT almacenado en cookie;
- autorización mediante roles;
- gestión de eventos;
- control de propiedad de recursos;
- inscripción de usuarios a eventos;
- control de cupos;
- prevención de inscripciones activas duplicadas;
- cancelación lógica de tickets;
- liberación automática de cupos al cancelar;
- consulta de tickets propios;
- consulta de inscripciones de un evento;
- envío de emails de confirmación;
- envío de emails de cancelación;
- DTOs para controlar las respuestas de la API;
- protección de datos sensibles;
- manejo centralizado de errores;
- validación de identificadores ObjectId.

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

MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=tu_usuario_ethereal
MAIL_PASS=tu_password_ethereal
MAIL_FROM=tu_email_ethereal
```

`MONGO_URL` se utiliza para establecer la conexión con MongoDB mediante Mongoose.

`JWT_SECRET` se utiliza para firmar y verificar los tokens JWT.

`JWT_EXPIRES_IN` configura el tiempo de expiración del token.

Las variables `MAIL_*` configuran el transporte SMTP utilizado por Nodemailer.

Para las pruebas de desarrollo se utiliza **Ethereal Email**, permitiendo verificar los emails enviados sin utilizar credenciales reales de una cuenta personal.

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

Por defecto:

```text
http://localhost:8080
```

---

# Arquitectura del proyecto

La aplicación utiliza una arquitectura organizada por capas para separar las responsabilidades de acceso a datos, lógica de negocio y presentación.

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
│   └── tickets.service.js
│
└── utils/
    ├── hash.js
    └── jwt.js
```

---

# Flujo de la arquitectura

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

Para las respuestas que contienen información de las entidades principales se utilizan DTOs:

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

# Responsabilidad de cada capa

## Routes

Definen los endpoints disponibles y aplican los middlewares necesarios.

Las rutas no contienen lógica de acceso a MongoDB.

---

## Controllers

Los controllers coordinan el flujo HTTP.

Sus responsabilidades principales son:

- recibir `request`;
- obtener `params`, `query` y `body`;
- llamar al service correspondiente;
- transformar las respuestas mediante DTO cuando corresponde;
- devolver la respuesta HTTP.

Los controllers no importan modelos de Mongoose ni realizan consultas directas a MongoDB.

La lógica de negocio no se encuentra en los controllers.

---

## Services

Los services concentran la lógica de negocio.

Entre las reglas implementadas se encuentran:

- validación de datos de eventos;
- validación de fechas;
- control de estados;
- filtros y paginación;
- prevención de inscripciones duplicadas;
- control de cupos;
- cálculo de disponibilidad;
- validación de propiedad de tickets;
- cancelación de inscripciones;
- envío de notificaciones por email.

Los services consumen repositories y no importan modelos de Mongoose directamente.

---

## Repositories

Los repositories funcionan como capa intermedia entre los services y los DAO.

Exponen operaciones orientadas al dominio de la aplicación, por ejemplo:

```text
findByEmail
createEvent
updateEvent
findActiveByUserAndEvent
getOccupiedCapacity
updateTicket
```

Los repositories utilizan los DAO correspondientes y no importan modelos de Mongoose directamente.

---

## DAO

Los DAO son responsables del acceso directo a los datos.

Existen DAO para las entidades principales:

```text
UsersDAO
EventsDAO
TicketsDAO
```

Los DAO son los archivos encargados de importar los modelos de Mongoose y ejecutar operaciones como:

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

Esto permite desacoplar el acceso a MongoDB del resto de la aplicación.

---

## DTO

Los DTO (**Data Transfer Object**) controlan la información que la API devuelve al cliente.

Se implementaron:

```text
UserDTO
EventDTO
TicketDTO
```

Su objetivo es evitar exponer directamente documentos completos de MongoDB y controlar qué propiedades forman parte de las respuestas.

Esto es especialmente importante para datos sensibles.

Por ejemplo, `UserDTO` no incluye:

```text
password
```

ni siquiera cuando la contraseña almacenada se encuentra hasheada.

Los DTO también controlan los datos relacionados cuando se utilizan documentos poblados mediante `populate`.

---

## Models

Los models contienen los esquemas de Mongoose utilizados para persistir la información en MongoDB.

Los modelos principales son:

```text
User
Event
Ticket
```

---

# DTO de usuario

`UserDTO` define la representación pública de un usuario.

Puede incluir:

```text
id
first_name
last_name
email
role
```

No incluye:

```text
password
```

De esta forma endpoints como:

```text
POST /api/sessions/register
GET /api/sessions/current
```

no exponen la contraseña del usuario.

---

# DTO de evento

`EventDTO` controla la información devuelta para los eventos.

Incluye información como:

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

Si el organizer se encuentra poblado, el DTO selecciona únicamente la información permitida y evita propagar datos sensibles del usuario relacionado.

---

# DTO de ticket

`TicketDTO` controla la información devuelta para las inscripciones.

Incluye información como:

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

Cuando `user` o `event` contienen documentos relacionados, el DTO selecciona únicamente los campos permitidos.

En ningún caso se expone el password de un usuario relacionado.

---

# Roles

Los roles disponibles se encuentran centralizados en:

```text
src/constants/roles.js
```

Roles:

```text
user
organizer
admin
```

El registro público siempre crea usuarios con:

```text
role: user
```

Un usuario no puede registrarse públicamente como `organizer` o `admin`.

---

# Estados de eventos

Los estados se encuentran centralizados en:

```text
src/constants/eventStatus.js
```

Estados:

```text
draft
published
cancelled
finished
```

Un evento nuevo comienza como:

```text
draft
```

Para aceptar inscripciones debe encontrarse en:

```text
published
```

---

# Modelo Event

La entidad `Event` representa las actividades disponibles en la plataforma.

Campos principales:

| Campo | Tipo | Requerido | Descripción |
|---|---|:---:|---|
| `title` | String | Sí | Título |
| `description` | String | Sí | Descripción |
| `category` | String | Sí | Categoría |
| `date` | Date | Sí | Fecha |
| `location` | String | Sí | Lugar |
| `capacity` | Number | Sí | Capacidad |
| `price` | Number | Sí | Precio |
| `status` | String | Sí | Estado |
| `organizer` | ObjectId | Sí | Organizador |

`organizer` es una referencia al usuario:

```javascript
organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
}
```

No se guarda el objeto completo del usuario dentro del evento.

---

# Modelo Ticket

La entidad `Ticket` representa la inscripción de un usuario a un evento.

Cada ticket relaciona un usuario con un evento utilizando referencias `ObjectId`.

Campos principales:

| Campo | Tipo | Descripción |
|---|---|---|
| `user` | ObjectId | Usuario que realiza la inscripción |
| `event` | ObjectId | Evento al que se inscribe |
| `status` | String | Estado de la inscripción |
| `quantity` | Number | Cantidad de lugares reservados |
| `reservationCode` | String | Código único de reserva |
| `createdAt` | Date | Fecha de creación |
| `cancelledAt` | Date / null | Fecha de cancelación |

No se almacenan objetos completos de usuarios o eventos dentro del ticket.

---

# Estados de tickets

Los estados se encuentran centralizados en:

```text
src/constants/ticketStatus.js
```

Estados disponibles:

```text
confirmed
pending
cancelled
```

Una inscripción creada correctamente queda con:

```text
status: confirmed
```

Un ticket cancelado permanece almacenado en MongoDB con:

```text
status: cancelled
```

y registra:

```text
cancelledAt
```

Los tickets no se eliminan físicamente.

---

# Flujo de inscripción

## Endpoint

```text
POST /api/events/:eid/tickets
```

Requiere autenticación.

Ejemplo de body:

```json
{
    "quantity": 2
}
```

La lógica se procesa en `tickets.service.js`.

Antes de crear el ticket se comprueba:

1. que `quantity` sea un número entero mayor a `0`;
2. que el evento exista;
3. que el evento esté publicado;
4. que la fecha del evento no haya pasado;
5. que el usuario no tenga otra inscripción activa para el mismo evento;
6. que existan cupos suficientes.

Si todas las validaciones son correctas:

```text
se genera reservationCode
        ↓
se crea el Ticket
        ↓
status = confirmed
        ↓
se envía email de confirmación
        ↓
se devuelve TicketDTO
```

Respuesta exitosa:

```text
201 Created
```

---

# Control de cupos

La capacidad máxima está definida por:

```text
event.capacity
```

Para calcular los lugares ocupados se consideran únicamente tickets activos.

Los tickets con:

```text
status: cancelled
```

no ocupan cupo.

El cálculo conceptual es:

```text
cupos disponibles =
capacidad del evento - suma de quantity de tickets activos
```

Ejemplo:

Si un evento tiene capacidad `30` y existen tickets activos que representan `25` lugares:

```text
30 - 25 = 5 cupos disponibles
```

Una solicitud de:

```json
{
    "quantity": 6
}
```

será rechazada porque no existen cupos suficientes.

---

# Prevención de inscripciones duplicadas

La aplicación utiliza la siguiente regla:

> Un usuario puede tener solamente una inscripción activa por evento.

Antes de crear un ticket se busca una inscripción del mismo usuario para el mismo evento cuyo estado no sea `cancelled`.

Si ya existe una inscripción activa, la API responde:

```text
409 Conflict
```

El conflicto se produce porque ya existe un recurso activo que impide crear una nueva inscripción equivalente.

Un ticket previamente cancelado no impide realizar una nueva inscripción.

---

# Cancelar una inscripción

## Endpoint

```text
PATCH /api/tickets/:tid/cancel
```

Acceso permitido:

```text
dueño del ticket
o
admin
```

La cancelación es lógica.

No se utiliza:

```text
DELETE
```

El ticket se actualiza a:

```text
status: cancelled
```

y registra:

```text
cancelledAt: fecha de cancelación
```

Antes de cancelar se valida:

- formato del identificador;
- existencia del ticket;
- propiedad del ticket o rol `admin`;
- que el ticket no se encuentre ya cancelado.

Si un usuario intenta cancelar un ticket que no le pertenece:

```text
403 Forbidden
```

Si el ticket ya se encuentra cancelado:

```text
409 Conflict
```

Después de realizar correctamente la cancelación se envía automáticamente un email notificando al usuario.

---

# Liberación del cupo

Al cancelar un ticket no es necesario modificar manualmente la capacidad del evento.

Como los tickets con:

```text
status: cancelled
```

no participan del cálculo de lugares ocupados, sus lugares quedan automáticamente disponibles para nuevas inscripciones.

---

# Consultar mis tickets

## Endpoint

```text
GET /api/tickets/my-tickets
```

Requiere autenticación.

La consulta utiliza el identificador del usuario autenticado:

```text
req.user._id
```

Por lo tanto, cada usuario recibe únicamente sus propios tickets.

Los datos del evento se obtienen mediante `populate`.

Se incluyen únicamente los datos necesarios:

```text
title
date
location
```

Antes de enviar la respuesta, los tickets son transformados mediante `TicketDTO`.

---

# Consultar inscripciones de un evento

## Endpoint

```text
GET /api/events/:eid/tickets
```

Acceso:

```text
organizer propietario del evento
o
admin
```

Un `organizer` puede consultar únicamente las inscripciones correspondientes a sus propios eventos.

Si intenta consultar las inscripciones de un evento perteneciente a otro organizer:

```text
403 Forbidden
```

Un `user` común tampoco puede utilizar este endpoint:

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

para enviar notificaciones relacionadas con las inscripciones.

La configuración SMTP se encuentra en:

```text
src/config/mail.config.js
```

La lógica de construcción y envío de los correos se encuentra en:

```text
src/services/mail.service.js
```

Para desarrollo se utiliza **Ethereal Email** como servidor SMTP de prueba.

---

## Email de confirmación

Después de crear correctamente una inscripción se envía un email de confirmación.

El correo contiene:

- nombre del usuario;
- título del evento;
- fecha;
- lugar;
- cantidad reservada;
- código de reserva.

---

## Email de cancelación

Después de cancelar correctamente una inscripción se envía automáticamente un email de cancelación.

El correo contiene:

- nombre del usuario;
- título del evento;
- fecha;
- lugar;
- cantidad cancelada;
- código de reserva;
- confirmación de que los lugares fueron liberados.

Esta funcionalidad fue incorporada a partir de la devolución recibida en la Pre-entrega 7.

Las credenciales SMTP se obtienen exclusivamente desde variables de entorno:

```text
MAIL_HOST
MAIL_PORT
MAIL_USER
MAIL_PASS
MAIL_FROM
```

No existen credenciales de correo hardcodeadas en el código fuente.

---

# Validación de ObjectId

Se valida el formato de identificadores antes de determinadas consultas para evitar errores inesperados de Mongoose.

Se utiliza:

```javascript
mongoose.Types.ObjectId.isValid(id)
```

El objetivo es impedir que valores con formato inválido lleguen directamente a operaciones como:

```javascript
Model.findById(id)
```

Por ejemplo:

```text
abc123
```

debe producir:

```text
400 Bad Request
```

en lugar de:

```text
500 Internal Server Error
```

La validación se utiliza en los flujos correspondientes de eventos, tickets y control de propiedad.

---

# Autenticación

La aplicación utiliza **Passport.js**.

Estrategias:

```text
register
login
current
```

`register` y `login` utilizan `passport-local`.

`current` utiliza `passport-jwt`.

El JWT se obtiene desde la cookie:

```text
currentUser
```

Las estrategias utilizan:

```javascript
session: false
```

---

# Usuario autenticado

## Endpoint

```text
GET /api/sessions/current
```

Requiere una sesión válida.

La respuesta utiliza `UserDTO`.

Ejemplo:

```json
{
    "status": "success",
    "payload": {
        "id": "ObjectId",
        "first_name": "Nombre",
        "last_name": "Apellido",
        "email": "usuario@email.com",
        "role": "user"
    }
}
```

La respuesta no incluye:

```text
password
```

ni siquiera hasheada.

---

# Autenticación y autorización

La aplicación diferencia correctamente entre:

```text
401 Unauthorized
```

y:

```text
403 Forbidden
```

## 401 Unauthorized

Se utiliza cuando el usuario no posee una sesión válida.

Ejemplo:

```json
{
    "status": "error",
    "message": "No autenticado"
}
```

## 403 Forbidden

Se utiliza cuando el usuario está autenticado pero no posee permisos para realizar la acción.

Ejemplo:

```json
{
    "status": "error",
    "message": "No tenés permisos para realizar esta acción"
}
```

En resumen:

```text
401 → no autenticado
403 → autenticado pero no autorizado
```

---

# Manejo de errores

La aplicación utiliza un middleware centralizado:

```text
src/middlewares/error.middleware.js
```

Los errores de los services incluyen un `statusCode` según el tipo de problema.

La API diferencia los siguientes códigos:

| Código | Significado | Ejemplo |
|---|---|---|
| `400` | Datos inválidos | ObjectId inválido, fecha inválida |
| `401` | No autenticado | Endpoint protegido sin sesión |
| `403` | Sin permisos | Usuario intentando modificar recurso ajeno |
| `404` | No encontrado | Evento o ticket inexistente |
| `409` | Conflicto | Inscripción duplicada |
| `500` | Error interno | Error inesperado del servidor |

Los errores esperables de negocio no deben convertirse en respuestas `500`.

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

# Endpoints disponibles

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Estado del servidor |
| GET | `/api/events` | Público | Lista eventos |
| GET | `/api/events/:id` | Público | Consulta un evento |
| POST | `/api/events` | organizer / admin | Crea un evento |
| PUT | `/api/events/:id` | organizer dueño / admin | Modifica un evento |
| PATCH | `/api/events/:id/status` | organizer dueño / admin | Cambia estado |
| POST | `/api/events/:eid/tickets` | Autenticado | Crea una inscripción |
| GET | `/api/events/:eid/tickets` | organizer dueño / admin | Consulta inscripciones |
| GET | `/api/tickets/my-tickets` | Autenticado | Consulta tickets propios |
| PATCH | `/api/tickets/:tid/cancel` | dueño / admin | Cancela una inscripción |
| GET | `/api/sessions` | Público | Estado del módulo |
| POST | `/api/sessions/register` | Público | Registro |
| POST | `/api/sessions/login` | Público | Login |
| GET | `/api/sessions/current` | Autenticado | Usuario actual |
| POST | `/api/sessions/logout` | Público | Logout |
| GET | `/api/users` | admin | Lista usuarios |

---

# Casos de prueba de la Pre-entrega 8

Antes de entregar se debe comprobar el flujo completo:

```text
registro
   ↓
login
   ↓
crear evento
   ↓
publicar evento
   ↓
inscribirse
   ↓
consultar mis tickets
   ↓
cancelar inscripción
```

---

## 1. Registro

```text
POST /api/sessions/register
```

Resultado esperado:

```text
201 Created
```

La respuesta utiliza `UserDTO` y no incluye `password`.

---

## 2. Login

```text
POST /api/sessions/login
```

Resultado esperado:

```text
200 OK
```

Se genera el JWT y se almacena en la cookie:

```text
currentUser
```

---

## 3. Usuario actual

```text
GET /api/sessions/current
```

Resultado esperado:

```text
200 OK
```

La respuesta no incluye `password`.

---

## 4. Endpoint protegido sin sesión

Ejemplo:

```text
GET /api/tickets/my-tickets
```

sin autenticación.

Resultado esperado:

```text
401 Unauthorized
```

---

## 5. Usuario sin permisos

Un usuario con rol `user` intenta crear un evento:

```text
POST /api/events
```

Resultado esperado:

```text
403 Forbidden
```

---

## 6. Crear evento

Un `organizer` o `admin` crea un evento válido.

```text
POST /api/events
```

Resultado esperado:

```text
201 Created
```

La respuesta utiliza `EventDTO`.

---

## 7. Inscripción exitosa

```text
POST /api/events/:eid/tickets
```

Con evento publicado, fecha futura y cupo disponible.

Resultado esperado:

```text
201 Created
```

Se crea un ticket:

```text
status: confirmed
```

y se envía email de confirmación mediante Nodemailer.

La respuesta utiliza `TicketDTO`.

---

## 8. Inscripción duplicada

Si el usuario ya posee una inscripción activa para el evento:

```text
409 Conflict
```

---

## 9. Cupo insuficiente

Si:

```text
cupos disponibles < quantity solicitada
```

la inscripción es rechazada.

La API responde con un error de negocio y no con un `500`.

---

## 10. Consultar tickets propios

```text
GET /api/tickets/my-tickets
```

Resultado esperado:

```text
200 OK
```

Los tickets son transformados mediante `TicketDTO`.

Los datos relacionados obtenidos mediante `populate` no exponen información sensible.

---

## 11. Cancelación propia

```text
PATCH /api/tickets/:tid/cancel
```

Resultado esperado:

```text
200 OK
```

El ticket queda:

```text
status: cancelled
cancelledAt: fecha
```

Sus lugares dejan de contarse como ocupados.

Además, se envía automáticamente un email de cancelación.

---

## 12. Cancelación de ticket ajeno

Un usuario intenta cancelar un ticket perteneciente a otro usuario.

Resultado esperado:

```text
403 Forbidden
```

---

## 13. Ticket ya cancelado

Si se intenta cancelar nuevamente un ticket cancelado:

```text
409 Conflict
```

---

## 14. ObjectId inválido

Ejemplo:

```text
GET /api/events/abc123
```

Resultado esperado:

```text
400 Bad Request
```

y no:

```text
500 Internal Server Error
```

---

## 15. Recurso inexistente

Si el identificador tiene formato válido pero el recurso no existe:

```text
404 Not Found
```

---

# Seguridad

El `.gitignore` excluye:

```text
node_modules/
.env
```

Además:

- las contraseñas se almacenan mediante bcrypt;
- las contraseñas no se exponen mediante los DTO;
- `/current` no devuelve `password`;
- el JWT no contiene la contraseña;
- `JWT_SECRET` se obtiene desde variables de entorno;
- las credenciales SMTP se obtienen desde variables de entorno;
- `.env` no se versiona;
- `.env.example` no contiene credenciales reales;
- el registro público fuerza el rol `user`;
- autenticación y autorización se encuentran separadas;
- las rutas privadas responden `401` sin sesión;
- las acciones no autorizadas responden `403`;
- organizers no pueden operar sobre eventos ajenos;
- los tickets no almacenan objetos completos de usuarios o eventos;
- los tickets cancelados no se eliminan físicamente;
- los tickets cancelados no ocupan cupo;
- un usuario no puede generar una segunda inscripción activa para el mismo evento;
- identificadores inválidos son rechazados con `400` en los flujos validados;
- las credenciales de Ethereal no se encuentran hardcodeadas;
- los modelos de Mongoose son importados directamente únicamente por los DAO;
- los controllers no acceden directamente a MongoDB;
- los services consumen repositories;
- los DTO controlan la información expuesta al cliente.

---

# Scripts disponibles

```json
{
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
}
```

---

# Mejoras incorporadas a partir de devoluciones anteriores

## Validación de ObjectId

A partir de devoluciones anteriores se incorporó validación del formato de los `ObjectId` antes de realizar determinadas consultas.

Se utiliza:

```javascript
mongoose.Types.ObjectId.isValid(id)
```

permitiendo responder:

```text
400 Bad Request
```

cuando el identificador posee un formato inválido, evitando que un `CastError` sea tratado como un error interno.

---

## Notificación de cancelación

La devolución de la Pre-entrega 7 destacó como mejora pendiente incorporar una notificación automática para los casos de cancelación.

En esta entrega se agregó:

```text
cancelación exitosa
        ↓
actualización del Ticket
        ↓
status = cancelled
        ↓
cancelledAt
        ↓
MailService
        ↓
email de cancelación
```

De esta forma, tanto la confirmación como la cancelación de una inscripción generan una notificación automática.

---

# Funcionalidades incorporadas en la Pre-entrega 8

La octava pre-entrega incorpora principalmente un refactor arquitectónico.

Se agregó y consolidó:

- arquitectura formal con DAO;
- repositories para las entidades principales;
- separación entre acceso a datos y lógica de negocio;
- services como capa de reglas de negocio;
- `UserDTO`;
- `EventDTO`;
- `TicketDTO`;
- filtrado de información sensible;
- protección del campo `password`;
- control de datos relacionados obtenidos mediante `populate`;
- manejo centralizado de errores;
- utilización correcta de códigos `400`, `401`, `403`, `404`, `409` y `500`;
- email automático al cancelar una inscripción;
- mantenimiento del comportamiento externo de las rutas existentes.

El objetivo principal de esta entrega es que la API quede desacoplada, organizada y preparada para una entrega final más completa.

---

# Autor

**Gastón Jaureguiberry**

Proyecto desarrollado como **Pre-entrega 8 de Backend II en Coderhouse**.