# Plataforma de Eventos y Reservas para Club Cannábico

API backend desarrollada con **Node.js**, **Express**, **MongoDB**, **Mongoose**, **Passport.js**, **bcrypt**, **jsonwebtoken**, **cookie-parser** y **Nodemailer**, orientada a una plataforma de eventos, actividades e inscripciones para un club cannábico.

Esta séptima pre-entrega de **Backend II** incorpora el flujo completo de inscripciones mediante tickets, incluyendo control de cupos, prevención de inscripciones duplicadas, cancelación lógica y envío de emails de confirmación.

La aplicación mantiene las funcionalidades desarrolladas en entregas anteriores e incorpora:

- entidad `Ticket`;
- relación entre usuarios y eventos mediante referencias `ObjectId`;
- control de cupos;
- prevención de inscripciones activas duplicadas;
- estados de tickets;
- cancelación lógica de inscripciones;
- liberación automática de cupos al cancelar;
- consulta de tickets propios;
- consulta de inscripciones de un evento;
- permisos para organizers y admins;
- envío de email de confirmación mediante Nodemailer;
- SMTP de prueba mediante Ethereal;
- validación de identificadores antes de determinadas consultas a MongoDB.

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

El proyecto utiliza una arquitectura organizada por capas para separar responsabilidades.

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
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   ├── ownership.middleware.js
│   └── error.middleware.js
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

Flujo principal:

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

### Routes

Definen los endpoints y aplican los middlewares correspondientes.

### Controllers

Reciben `request`, extraen los datos necesarios y generan la respuesta HTTP.

La lógica principal de negocio no se encuentra en los controllers.

### Services

Contienen las reglas y validaciones de negocio.

En esta entrega, el control de cupos, duplicados, estados y cancelaciones se realiza en `tickets.service.js`.

### Repositories

Funcionan como abstracción entre los services y el acceso a datos.

### DAO

Realizan las operaciones directas mediante Mongoose.

### Models

Definen los esquemas persistidos en MongoDB.

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

Acceso:

```text
usuario autenticado
```

Ejemplo:

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

será rechazada.

La API devuelve un mensaje indicando que no existen cupos suficientes.

---

# Prevención de inscripciones duplicadas

La aplicación utiliza la regla:

> Un usuario puede tener solamente una inscripción activa por evento.

Antes de crear un ticket se busca una inscripción del mismo usuario para el mismo evento cuyo estado no sea `cancelled`.

Si existe:

```text
400 Bad Request
```

con un mensaje indicando que ya existe una inscripción activa.

Un ticket previamente cancelado no impide realizar una nueva inscripción.

---

# Cancelar una inscripción

## Endpoint

```text
PATCH /api/tickets/:tid/cancel
```

Acceso:

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

y se registra:

```text
cancelledAt: fecha de cancelación
```

Antes de cancelar se valida:

- formato del identificador;
- existencia del ticket;
- propiedad del ticket o rol `admin`;
- que el ticket no se encuentre ya cancelado.

### Liberación del cupo

Al cancelar un ticket no es necesario modificar manualmente la capacidad del evento.

Como los tickets `cancelled` no participan del cálculo de lugares ocupados, sus lugares quedan automáticamente disponibles para nuevas inscripciones.

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

Se incluyen:

```text
title
date
location
```

No se exponen datos sensibles de otros usuarios.

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

para enviar una confirmación después de crear correctamente una inscripción.

La configuración del transporte SMTP se encuentra en:

```text
src/config/mail.config.js
```

La lógica de construcción y envío del correo se encuentra en:

```text
src/services/mail.service.js
```

Para desarrollo se utiliza **Ethereal Email** como servidor SMTP de prueba.

El email de confirmación contiene información de la inscripción, incluyendo:

- nombre del usuario;
- título del evento;
- fecha;
- lugar;
- cantidad reservada;
- código de reserva.

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

A partir de la devolución de la Pre-entrega 6 se incorporó validación del formato de identificadores antes de realizar consultas en los flujos donde fue implementada.

Se utiliza:

```javascript
mongoose.Types.ObjectId.isValid(id)
```

El objetivo es impedir que valores con formato inválido lleguen directamente a operaciones como:

```javascript
Model.findById(id)
```

evitando que un `CastError` termine siendo tratado como un error interno del servidor.

Por ejemplo, un identificador inválido como:

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

La validación se aplica, entre otros puntos implementados, al acceso por identificador utilizado en la lógica de eventos y a la cancelación de tickets.

---

# Autenticación

La aplicación utiliza Passport.js.

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

# Autenticación y autorización

La aplicación diferencia:

```text
401 Unauthorized
```

de:

```text
403 Forbidden
```

### 401

El usuario no posee una sesión válida.

Ejemplo:

```json
{
    "status": "error",
    "message": "No autenticado"
}
```

### 403

El usuario está autenticado, pero no posee permisos para realizar la acción.

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

# Casos de prueba de la Pre-entrega 7

## 1. Inscripción exitosa

```text
POST /api/events/:eid/tickets
```

Con evento publicado, fecha futura y cupo disponible.

Resultado esperado:

```text
201 Created
```

Se crea un ticket `confirmed` y se envía email de confirmación mediante Nodemailer.

---

## 2. Inscripción sin sesión

```text
POST /api/events/:eid/tickets
```

Resultado esperado:

```text
401 Unauthorized
```

---

## 3. Evento inexistente

Resultado esperado:

```text
404 Not Found
```

---

## 4. Evento no disponible

Si el evento se encuentra cancelado, finalizado o no está disponible para inscripciones, la operación es rechazada por las reglas de negocio.

---

## 5. Cupo insuficiente

Si:

```text
cupos disponibles < quantity solicitada
```

la inscripción es rechazada con un mensaje indicando la cantidad disponible.

---

## 6. Inscripción duplicada

Si el usuario ya posee un ticket activo para el evento:

```text
400 Bad Request
```

---

## 7. Cancelación propia

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

y sus lugares dejan de contarse como ocupados.

---

## 8. Cancelación de ticket ajeno como user

Resultado esperado:

```text
403 Forbidden
```

---

## 9. User consultando tickets de un evento

```text
GET /api/events/:eid/tickets
```

Resultado esperado:

```text
403 Forbidden
```

---

## 10. Organizer consultando evento ajeno

```text
GET /api/events/:eid/tickets
```

Resultado esperado:

```text
403 Forbidden
```

---

# Seguridad

El `.gitignore` excluye:

```text
node_modules/
.env
```

Además:

- las contraseñas de usuarios se almacenan mediante bcrypt;
- las contraseñas no se devuelven en los listados;
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
- los identificadores validados son rechazados con `400` cuando su formato no corresponde a un `ObjectId`;
- las credenciales de Ethereal no se encuentran hardcodeadas.

---

# Scripts disponibles

```json
{
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
}
```

---

# Mejoras incorporadas a partir de la devolución de la Pre-entrega 6

La devolución de la entrega anterior destacó como puntos fuertes:

- modelado de `Event`;
- reglas de negocio;
- filtros combinables;
- paginación;
- ordenamiento;
- arquitectura por capas;
- autenticación y autorización;
- control de propiedad de eventos.

También se indicó como mejora necesaria validar el formato de los `ObjectId` antes de realizar consultas para evitar que un identificador inválido genere un `CastError` tratado como `500`.

A partir de esa devolución se incorporó validación mediante:

```javascript
mongoose.Types.ObjectId.isValid(id)
```

permitiendo responder con:

```text
400 Bad Request
```

cuando corresponde.

También se revisó este README para evitar documentar comportamientos que no coincidan con la implementación actual.

---

# Funcionalidades incorporadas en la Pre-entrega 7

La séptima pre-entrega agrega:

- modelo `Ticket`;
- referencias a `User` y `Event`;
- estados de inscripción;
- creación de tickets;
- control de cupos;
- prevención de duplicados activos;
- consulta de tickets propios;
- consulta de inscripciones por evento;
- permisos según propiedad del evento;
- cancelación lógica;
- registro de `cancelledAt`;
- liberación automática de cupos;
- códigos únicos de reserva;
- Nodemailer;
- configuración SMTP mediante variables de entorno;
- emails de confirmación;
- Ethereal para pruebas de correo.

---

# Autor

**Gastón Jaureguiberry**

Proyecto desarrollado como **Pre-entrega 7 de Backend II en Coderhouse**.