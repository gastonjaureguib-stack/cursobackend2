# Plataforma de Eventos y Reservas para Club Cannábico

API backend desarrollada con **Node.js**, **Express**, **MongoDB**, **Mongoose**, **Passport.js**, **bcrypt**, **jsonwebtoken** y **cookie-parser**, orientada a una plataforma de eventos, actividades e inscripciones para un club cannábico.

Esta quinta pre-entrega de **Backend II** incorpora un sistema de **autorización basado en roles**, permitiendo proteger rutas y recursos según los permisos de cada usuario.

El sistema diferencia entre autenticación y autorización:

- **Autenticación:** determina quién es el usuario mediante JWT y una cookie HttpOnly.
- **Autorización:** determina qué acciones puede realizar según su rol.

Los roles disponibles son:

- `user`
- `organizer`
- `admin`

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

El proyecto mantiene una arquitectura organizada por capas.

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
└── utils/
    ├── hash.js
    └── jwt.js
```

La autenticación mediante Passport se encuentra centralizada en:

```text
src/config/passport.config.js
```

La autenticación y autorización de rutas se implementan mediante middlewares reutilizables separados de los routers.

---

# Autenticación con Passport.js

Passport.js se utiliza para organizar las distintas formas de validar usuarios.

Se implementan tres estrategias:

```text
register
login
current
```

Las estrategias `register` y `login` utilizan `passport-local`.

La estrategia `current` utiliza `passport-jwt`.

Las estrategias utilizan:

```javascript
session: false
```

porque el proyecto utiliza JWT y no sesiones tradicionales de Passport.

Cada herramienta mantiene una responsabilidad diferente:

- **bcrypt:** hash y comparación de contraseñas.
- **JWT:** representación de la sesión mediante un token firmado.
- **cookie-parser:** lectura de cookies desde Express.
- **Passport:** organización y ejecución de las estrategias de autenticación.

---

# Registro de usuarios

## Endpoint

```text
POST /api/sessions/register
```

El registro público permite crear nuevos usuarios.

El backend valida:

- campos obligatorios;
- formato del email;
- contraseña mínima de 8 caracteres;
- email no registrado;
- hash de contraseña mediante bcrypt.

Ejemplo:

```json
{
    "first_name": "Gaston",
    "last_name": "Jaureguiberry",
    "email": "gaston@club.com",
    "password": "12345678"
}
```

El registro público **no permite seleccionar el rol**.

Aunque un cliente intente enviar:

```json
{
    "role": "admin"
}
```

el backend asigna siempre:

```text
role: user
```

Esto evita que un usuario pueda registrarse públicamente como `organizer` o `admin`.

---

# Roles

El modelo `User` admite tres roles:

```text
user
organizer
admin
```

El rol por defecto es:

```text
user
```

Cada rol tiene diferentes permisos dentro de la plataforma.

---

# Matriz de permisos

| Acción | user | organizer | admin |
|---|:---:|:---:|:---:|
| Consultar eventos publicados | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar eventos propios | ❌ | ✅ | ✅ |
| Modificar eventos ajenos | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

Esta matriz define las acciones permitidas para cada tipo de usuario.

---

# Middleware de autenticación

La autenticación de rutas privadas se encuentra implementada en:

```text
src/middlewares/auth.middleware.js
```

El middleware `authenticate` utiliza la estrategia Passport `current`.

Su responsabilidad es:

1. obtener el JWT desde la cookie `currentUser`;
2. validar el token;
3. obtener el usuario correspondiente;
4. guardar el usuario en `req.user`;
5. permitir continuar la petición.

Si no existe una sesión válida, responde:

```text
401 Unauthorized
```

Ejemplo:

```json
{
    "status": "error",
    "message": "No autenticado"
}
```

---

# Middleware de autorización

La autorización según roles se encuentra implementada en:

```text
src/middlewares/authorize.middleware.js
```

El middleware recibe los roles permitidos para una ruta.

Ejemplo:

```javascript
authorize('organizer', 'admin')
```

El middleware compara los roles permitidos contra:

```javascript
req.user.role
```

Si el usuario está autenticado pero su rol no tiene permiso para realizar la acción, responde:

```text
403 Forbidden
```

Ejemplo:

```json
{
    "status": "error",
    "message": "No tenés permisos para realizar esta acción"
}
```

---

# Diferencia entre 401 y 403

La API diferencia explícitamente entre errores de autenticación y autorización.

## 401 Unauthorized

Se utiliza cuando **no existe una sesión válida**.

Puede ocurrir cuando:

- no existe la cookie `currentUser`;
- el JWT expiró;
- el JWT es inválido;
- el JWT fue manipulado;
- el usuario asociado al token no existe.

Ejemplo:

```json
{
    "status": "error",
    "message": "No autenticado"
}
```

## 403 Forbidden

Se utiliza cuando el usuario **sí está autenticado**, pero su rol no tiene permisos suficientes para realizar la acción.

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

# Rutas protegidas

## Usuario actual

```text
GET /api/sessions/current
```

Requiere autenticación.

```text
Sin sesión → 401
Con sesión → 200
```

---

## Crear evento

```text
POST /api/events
```

Roles permitidos:

```text
organizer
admin
```

Un usuario con rol `user` recibe:

```text
403 Forbidden
```

Ejemplo de request:

```json
{
    "title": "Taller de cultivo",
    "description": "Actividad educativa para socios del club",
    "date": "2026-10-10T19:00:00.000Z",
    "location": "Salón principal",
    "capacity": 25
}
```

El propietario del evento no se recibe desde el body.

El backend utiliza:

```javascript
organizer: req.user._id
```

De esta forma, el evento queda asociado automáticamente al usuario autenticado que lo creó.

---

# Propiedad de eventos

Cada evento almacena el usuario que lo creó mediante el campo:

```text
organizer
```

Este campo referencia al modelo de usuarios mediante un `ObjectId`.

La modificación se realiza mediante:

```text
PATCH /api/events/:id
```

Los roles permitidos inicialmente son:

```text
organizer
admin
```

Sin embargo, existe además una validación de propiedad del recurso.

## Organizer

Un `organizer` puede modificar únicamente los eventos que él mismo creó.

El sistema compara:

```javascript
event.organizer
```

contra:

```javascript
req.user._id
```

Si intenta modificar un evento perteneciente a otro organizer:

```text
403 Forbidden
```

Ejemplo:

```json
{
    "status": "error",
    "message": "No tenés permisos para modificar este evento"
}
```

## Admin

Un usuario con rol `admin` puede modificar cualquier evento, independientemente de quién lo haya creado.

---

# Campos modificables de un evento

Para evitar modificaciones no autorizadas, el endpoint de actualización solo permite modificar:

```text
title
description
date
location
capacity
```

El campo:

```text
organizer
```

no puede modificarse desde el body de la petición.

Esto evita que un usuario pueda cambiar manualmente la propiedad de un evento.

---

# Ruta administrativa

Se implementó una ruta exclusiva para administradores:

```text
GET /api/users
```

Esta ruta utiliza:

```javascript
authenticate
authorize('admin')
```

Comportamiento:

```text
user      → 403
organizer → 403
admin     → 200
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

Passport valida las credenciales mediante la estrategia `login`.

Si son correctas:

1. Passport deja el usuario disponible en `req.user`;
2. el controller genera el JWT;
3. el JWT se almacena en la cookie `currentUser`.

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

Las credenciales inválidas responden:

```text
401 Unauthorized
```

```json
{
    "status": "error",
    "message": "Credenciales inválidas"
}
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

Respuesta:

```json
{
    "status": "success",
    "message": "Sesión cerrada"
}
```

Después del logout, intentar acceder a una ruta privada devuelve:

```text
401 Unauthorized
```

---

# Flujo de autenticación y autorización

```text
REQUEST
   ↓
authenticate
   ↓
Passport "current"
   ↓
Cookie currentUser
   ↓
Validación JWT
   ↓
Usuario en MongoDB
   ↓
req.user
   ↓
¿Existe usuario autenticado?
   │
   ├── NO → 401 Unauthorized
   │
   └── SÍ
        ↓
   authorize(...)
        ↓
   ¿El rol está permitido?
        │
        ├── NO → 403 Forbidden
        │
        └── SÍ
             ↓
         Controller
             ↓
         Acción permitida
```

---

# Endpoints disponibles

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Comprueba que el servidor esté activo |
| GET | `/api/events` | Público | Devuelve los eventos disponibles |
| POST | `/api/events` | organizer / admin | Crea un evento |
| PATCH | `/api/events/:id` | organizer / admin | Modifica un evento respetando propiedad |
| GET | `/api/sessions` | Público | Comprueba el módulo de sesiones |
| POST | `/api/sessions/register` | Público | Registra un usuario |
| POST | `/api/sessions/login` | Público | Inicia sesión |
| GET | `/api/sessions/current` | Autenticado | Obtiene el usuario actual |
| POST | `/api/sessions/logout` | Público | Elimina la cookie de autenticación |
| GET | `/api/users` | admin | Devuelve todos los usuarios |

---

# Casos probados

Antes de la entrega se verificaron los casos principales de autenticación y autorización.

## 1. User intentando crear evento

```text
POST /api/events
role: user
```

Resultado:

```text
403 Forbidden
```

---

## 2. Organizer creando evento

```text
POST /api/events
role: organizer
```

Resultado:

```text
201 Created
```

El evento queda asociado al organizer autenticado.

---

## 3. Organizer accediendo a ruta administrativa

```text
GET /api/users
role: organizer
```

Resultado:

```text
403 Forbidden
```

---

## 4. Admin accediendo a ruta administrativa

```text
GET /api/users
role: admin
```

Resultado:

```text
200 OK
```

---

## 5. Ruta privada sin cookie

```text
GET /api/sessions/current
```

sin cookie `currentUser`.

Resultado:

```text
401 Unauthorized
```

---

## 6. Organizer intentando modificar evento ajeno

```text
PATCH /api/events/:id
role: organizer
```

sobre un evento creado por otro organizer.

Resultado:

```text
403 Forbidden
```

---

## Pruebas adicionales

También se verificó:

- organizer modificando su propio evento → `200 OK`;
- admin modificando un evento creado por otro usuario → `200 OK`;
- registro público asignando automáticamente `role: user`;
- registro público sin posibilidad de crear `admin` u `organizer`;
- login exitoso → `200 OK`;
- credenciales inválidas → `401 Unauthorized`;
- logout exitoso;
- acceso a `/current` sin sesión → `401 Unauthorized`;
- las respuestas administrativas no exponen contraseñas.

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
- los roles permitidos se validan mediante middleware;
- la autenticación y autorización están separadas;
- las rutas privadas responden `401` cuando no existe sesión;
- las rutas sin permisos responden `403`;
- los organizers no pueden modificar eventos ajenos;
- el organizer de un evento no puede modificarse desde el body;
- la ruta administrativa no devuelve passwords;
- la autenticación utiliza una cookie HttpOnly.

---

# Scripts disponibles

```json
{
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
}
```

---

# Próximas funcionalidades

El proyecto queda preparado para continuar incorporando:

- inscripciones y reservas a eventos;
- control de cupos;
- cancelación de reservas;
- administración de actividades del club;
- validaciones adicionales;
- proveedores externos de autenticación;
- notificaciones.

---

# Autor

**Gastón Jaureguiberry**

Proyecto desarrollado como **Pre-entrega 5 de Backend II en Coderhouse**.