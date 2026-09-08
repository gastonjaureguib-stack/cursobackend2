# Plataforma de Eventos y Reservas para Club Cannábico

API backend desarrollada con **Node.js**, **Express**, **MongoDB**, **Mongoose**, **Passport.js**, **bcrypt**, **jsonwebtoken** y **cookie-parser**, orientada a una plataforma de eventos e inscripciones.

Esta cuarta pre-entrega de **Backend II** refactoriza el sistema de autenticación existente incorporando **Passport.js** para centralizar las estrategias de registro, login y usuario actual.

El contrato externo de la API se mantiene respecto de la Pre-entrega anterior: se continúa utilizando JWT y una cookie HttpOnly llamada `currentUser`.

Passport se encarga de organizar la validación de usuarios mediante las estrategias `register`, `login` y `current`, mientras que el controller mantiene la responsabilidad de generar el JWT y configurar la cookie luego de un login exitoso.

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

El proyecto mantiene una estructura organizada por capas y centraliza la autenticación mediante Passport.

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
│   └── sessions.controller.js
│
├── dao/
│   └── users.dao.js
│
├── middlewares/
│   └── error.middleware.js
│
├── models/
│   ├── User.js
│   └── Event.js
│
├── repositories/
│   └── users.repository.js
│
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
│
└── utils/
    ├── hash.js
    └── jwt.js
```

La configuración de las estrategias de autenticación se encuentra centralizada en:

```text
src/config/passport.config.js
```

Passport se inicializa en `app.js` mediante:

```javascript
app.use(passport.initialize());
```

La lógica de las estrategias no se encuentra dentro de `app.js`.

---

# Passport.js

Passport.js se utiliza como middleware de autenticación para organizar las distintas formas de validar usuarios.

En esta entrega se implementaron tres estrategias:

```text
register
login
current
```

Las estrategias `register` y `login` utilizan `passport-local`.

La estrategia `current` utiliza `passport-jwt`.

Passport no reemplaza a bcrypt, JWT ni las cookies.

Cada herramienta mantiene una responsabilidad diferente:

- **bcrypt:** hash y comparación de contraseñas.
- **JWT:** representación de la sesión mediante un token firmado.
- **cookie-parser:** lectura de cookies desde Express.
- **Passport:** organización y ejecución de las estrategias de autenticación.

Las estrategias se utilizan con `session: false`, ya que el proyecto utiliza JWT y no sesiones tradicionales de Passport.

---

# Estrategia register

La estrategia:

```text
register
```

se encarga del registro de nuevos usuarios.

Sus responsabilidades son:

- validar campos obligatorios;
- validar el formato del email;
- validar una contraseña mínima de 8 caracteres;
- normalizar el email;
- verificar que el email no esté registrado;
- generar el hash de la contraseña mediante bcrypt;
- asignar el rol `user`;
- crear el usuario.

El rol no se toma desde el body de la petición. El backend asigna:

```text
role: user
```

Esto evita que un usuario pueda registrarse públicamente como administrador u organizador.

## Endpoint

```text
POST /api/sessions/register
```

## Request

```json
{
  "first_name": "Gaston",
  "last_name": "Jaureguiberry",
  "email": "gaston.passport@test.com",
  "password": "Backend2026"
}
```

## Response — 201 Created

```json
{
  "status": "success",
  "payload": {
    "id": "6aa07a35ab49742f363e7c94",
    "first_name": "Gaston",
    "last_name": "Jaureguiberry",
    "email": "gaston.passport@test.com",
    "role": "user"
  }
}
```

La contraseña nunca se incluye en la respuesta.

## Email duplicado — 409 Conflict

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

---

# Estrategia login

La estrategia:

```text
login
```

se encarga de validar las credenciales del usuario.

El flujo es:

1. recibe email y contraseña;
2. normaliza el email;
3. busca el usuario;
4. compara la contraseña mediante bcrypt;
5. si las credenciales son correctas, Passport deja el usuario disponible en `req.user`;
6. el controller genera el JWT;
7. el controller guarda el JWT en la cookie `currentUser`.

Passport **no genera el JWT**.

La generación del token permanece como responsabilidad del controller.

## Endpoint

```text
POST /api/sessions/login
```

## Request

```json
{
  "email": "gaston.passport@test.com",
  "password": "Backend2026"
}
```

## Response — 200 OK

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

---

# Credenciales inválidas

Por seguridad, el sistema no informa si falló el email o la contraseña.

Ambos casos responden:

```text
401 Unauthorized
```

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

Esto evita revelar si un email se encuentra registrado en el sistema.

---

# JWT

La lógica relacionada con JWT se encuentra en:

```text
src/utils/jwt.js
```

Luego de que Passport valida correctamente las credenciales, el controller genera el JWT.

El token contiene:

```json
{
  "id": "id_del_usuario",
  "email": "usuario@test.com",
  "role": "user"
}
```

La contraseña nunca se incluye dentro del token.

El JWT se firma utilizando:

```text
JWT_SECRET
```

y su expiración se configura mediante:

```text
JWT_EXPIRES_IN
```

Ambos valores se obtienen desde las variables de entorno.

---

# Cookie de autenticación

Luego de un login exitoso, el JWT se almacena en:

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

La opción `httpOnly` evita que la cookie pueda ser accedida directamente desde JavaScript del navegador.

---

# Estrategia current

La estrategia:

```text
current
```

permite identificar al usuario que ya inició sesión.

No utiliza nuevamente email y contraseña.

En su lugar:

1. obtiene el JWT desde la cookie `currentUser`;
2. verifica el token utilizando `JWT_SECRET`;
3. obtiene el `id` almacenado en el payload;
4. busca al usuario en MongoDB;
5. si el usuario existe, Passport lo deja disponible en `req.user`;
6. el controller devuelve únicamente los datos necesarios.

La búsqueda en MongoDB permite comprobar que el usuario asociado al JWT continúa existiendo en el sistema.

## Endpoint

```text
GET /api/sessions/current
```

## Response — 200 OK

```json
{
  "status": "success",
  "payload": {
    "id": "6aa07a35ab49742f363e7c94",
    "email": "gaston.passport@test.com",
    "role": "user"
  }
}
```

La contraseña no se devuelve.

---

# Usuario no autenticado

Si la cookie no existe, el JWT expiró o el token fue manipulado, la petición responde:

```text
401 Unauthorized
```

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

---

# Logout

El logout no utiliza una estrategia de Passport.

Su única responsabilidad es eliminar la cookie `currentUser`.

## Endpoint

```text
POST /api/sessions/logout
```

## Response — 200 OK

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

Después del logout, un nuevo acceso a:

```text
GET /api/sessions/current
```

devuelve:

```text
401 Unauthorized
```

---

# Flujo de autenticación

```text
REGISTER
   ↓
Passport "register"
   ↓
Validación + bcrypt
   ↓
Repository
   ↓
DAO
   ↓
MongoDB
   ↓
req.user
   ↓
201 Created


LOGIN
   ↓
Passport "login"
   ↓
Validación de credenciales
   ↓
bcrypt.compare
   ↓
req.user
   ↓
Controller
   ↓
JWT
   ↓
Cookie currentUser


GET /current
   ↓
Passport "current"
   ↓
Cookie currentUser
   ↓
Validación JWT
   ↓
Repository
   ↓
DAO
   ↓
MongoDB
   ↓
req.user
   ↓
Usuario autenticado


LOGOUT
   ↓
Cookie eliminada
   ↓
GET /current
   ↓
401 Unauthorized
```

---

# Endpoints disponibles

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Comprueba que el servidor esté activo |
| GET | `/api/events` | Devuelve los eventos disponibles |
| GET | `/api/sessions` | Comprueba el módulo de sessions |
| POST | `/api/sessions/register` | Registra un usuario mediante Passport |
| POST | `/api/sessions/login` | Valida credenciales mediante Passport y genera la sesión |
| GET | `/api/sessions/current` | Obtiene el usuario autenticado mediante Passport JWT |
| POST | `/api/sessions/logout` | Elimina la cookie de autenticación |

---

# Casos probados

Antes de la entrega se verificaron los casos solicitados:

1. Registro exitoso.
2. Login exitoso.
3. Creación de la cookie `currentUser`.
4. Cookie configurada como HttpOnly.
5. Acceso a `/current` con JWT válido devuelve `200`.
6. Logout exitoso.
7. Acceso a `/current` después del logout devuelve `401`.
8. Registro con email duplicado devuelve `409`.
9. Login con contraseña incorrecta devuelve `401`.
10. Las credenciales inválidas utilizan un mensaje genérico.
11. Acceso a `/current` sin cookie devuelve `401`.
12. Acceso a `/current` con JWT manipulado devuelve `401`.
13. Las respuestas de autenticación no incluyen la contraseña.
14. El JWT no incluye la contraseña.
15. El registro público asigna automáticamente el rol `user`.

---

# Seguridad

El archivo `.gitignore` excluye:

```text
node_modules/
.env
```

Además:

- las contraseñas se almacenan utilizando bcrypt;
- el email se normaliza;
- el rol del registro público se fuerza a `user`;
- las contraseñas no se exponen en respuestas;
- el JWT no contiene la contraseña;
- `JWT_SECRET` se obtiene desde variables de entorno;
- la autenticación utiliza una cookie HttpOnly;
- el login no revela si el email o la contraseña fueron incorrectos;
- la estrategia `current` verifica la validez del JWT;
- un JWT manipulado o inválido es rechazado.

---

# Preparación para proveedores externos

La configuración de Passport se encuentra centralizada en:

```text
src/config/passport.config.js
```

`app.js` solamente inicializa Passport y no contiene la lógica específica de las estrategias.

Esta organización permite incorporar en el futuro nuevas estrategias de autenticación mediante proveedores externos, por ejemplo:

- GitHub;
- Google.

Para agregar un provider externo se puede incorporar una nueva estrategia dentro de la configuración de Passport sin trasladar la lógica de autenticación a `app.js`.

Las credenciales necesarias para futuros providers deberán almacenarse mediante variables de entorno y nunca incluirse directamente en el código fuente.

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

- autorización según roles;
- protección de rutas sensibles;
- permisos para `user`, `organizer` y `admin`;
- gestión completa de eventos;
- inscripciones;
- control de cupos;
- proveedores externos de autenticación;
- notificaciones.

---

# Autor

**Gastón Jaureguiberry**

Proyecto desarrollado como **Pre-entrega 4 de Backend II en Coderhouse**.