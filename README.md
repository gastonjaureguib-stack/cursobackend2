# Plataforma de Eventos y Reservas para Club Cannábico

API backend desarrollada con **Node.js**, **Express**, **MongoDB**, **Mongoose**, **bcrypt**, **jsonwebtoken** y **cookie-parser**, orientada a una plataforma de eventos e inscripciones.

Esta tercera pre-entrega de **Backend II** incorpora autenticación mediante login, JWT, cookies y rutas protegidas sobre la arquitectura desarrollada en las etapas anteriores.

Actualmente la aplicación permite registrar usuarios, iniciar sesión, generar un JWT, almacenar la sesión en una cookie HttpOnly, consultar el usuario autenticado y cerrar sesión.

---

# Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
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

Al iniciar la aplicación se establece primero la conexión con MongoDB y posteriormente se levanta el servidor Express.

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
│   └── db.js
│
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js
│
├── dao/
│   └── users.dao.js
│
├── middlewares/
│   ├── auth.middleware.js
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
├── services/
│   └── sessions.service.js
│
└── utils/
    ├── hash.js
    └── jwt.js
```

Flujo principal:

```text
Route
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

La autenticación de rutas protegidas se realiza mediante un middleware independiente.

---

# Registro de usuarios

## Endpoint

```text
POST /api/sessions/register
```

Permite registrar un nuevo usuario.

### Campos requeridos

- `first_name`
- `last_name`
- `email`
- `password`

El campo `role` no se acepta desde el registro público.

Todos los usuarios registrados mediante este endpoint reciben automáticamente:

```text
role: user
```

### Request

```json
{
  "first_name": "Ana",
  "last_name": "Perez",
  "email": "Ana@Test.com ",
  "password": "Secreta123"
}
```

### Response — 201 Created

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Perez",
    "email": "ana@test.com",
    "role": "user"
  }
}
```

La contraseña nunca se incluye en la respuesta.

---

# Validaciones del registro

El endpoint verifica:

- presencia de los campos obligatorios;
- formato válido del email;
- contraseña de al menos 8 caracteres;
- normalización del email;
- inexistencia previa del email;
- asignación segura del rol `user`.

### Campos faltantes — 400

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

### Email inválido — 400

```json
{
  "status": "error",
  "message": "Formato de email inválido"
}
```

### Contraseña demasiado corta — 400

```json
{
  "status": "error",
  "message": "La contraseña debe tener al menos 8 caracteres"
}
```

### Email ya registrado — 409

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

---

# Login

## Endpoint

```text
POST /api/sessions/login
```

Permite iniciar sesión utilizando email y contraseña.

### Request

```json
{
  "email": "ana@test.com",
  "password": "Secreta123"
}
```

Durante el login:

1. se normaliza el email;
2. se busca el usuario en MongoDB;
3. se compara la contraseña mediante bcrypt;
4. se genera un JWT;
5. el JWT se almacena en una cookie llamada `currentUser`.

### Response — 200 OK

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

---

# Credenciales inválidas

Por seguridad, el sistema no diferencia entre un email inexistente y una contraseña incorrecta.

Ambos casos devuelven:

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

Status:

```text
401 Unauthorized
```

---

# JWT

La lógica relacionada con JWT se encuentra en:

```text
src/utils/jwt.js
```

El token contiene:

```json
{
  "id": "id_del_usuario",
  "email": "usuario@test.com",
  "role": "user"
}
```

La contraseña nunca se incluye en el token.

El JWT se firma utilizando la variable:

```text
JWT_SECRET
```

y su expiración se configura mediante:

```text
JWT_EXPIRES_IN
```

---

# Cookie de autenticación

Luego de un login exitoso, el JWT se guarda en la cookie:

```text
currentUser
```

Configuración utilizada:

```text
httpOnly: true
sameSite: lax
maxAge: 3600000
secure: true solamente en producción
```

La cookie es leída en Express utilizando `cookie-parser`.

---

# Usuario actual

## Endpoint

```text
GET /api/sessions/current
```

Ruta protegida mediante:

```text
src/middlewares/auth.middleware.js
```

El middleware obtiene la cookie, verifica el JWT y guarda el payload en:

```text
req.user
```

### Response — 200 OK

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "email": "ana@test.com",
    "role": "user"
  }
}
```

La contraseña nunca se devuelve.

---

# Usuario no autenticado

Si la petición no contiene una cookie válida, el token fue manipulado o expiró:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

Status:

```text
401 Unauthorized
```

---

# Logout

## Endpoint

```text
POST /api/sessions/logout
```

El endpoint elimina la cookie `currentUser`.

### Response — 200 OK

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

Después del logout, un nuevo acceso a `/api/sessions/current` devuelve `401 Unauthorized`.

---

# Seguridad de contraseñas

Las contraseñas no se almacenan en texto plano.

La lógica se encuentra en:

```text
src/utils/hash.js
```

Se utiliza bcrypt para:

- generar el hash antes de almacenar la contraseña;
- comparar la contraseña recibida durante el login con el hash almacenado.

Las contraseñas no se incluyen en las respuestas de la API ni en el JWT.

---

# Endpoints disponibles

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Comprueba que el servidor esté activo |
| GET | `/api/events` | Devuelve los eventos disponibles |
| GET | `/api/sessions` | Comprueba el módulo de sessions |
| POST | `/api/sessions/register` | Registra un usuario |
| POST | `/api/sessions/login` | Inicia sesión |
| GET | `/api/sessions/current` | Devuelve el usuario autenticado |
| POST | `/api/sessions/logout` | Cierra la sesión |

---

# Casos probados

Antes de la entrega se verificaron los siguientes escenarios:

1. Registro exitoso.
2. Email normalizado.
3. Registro sin devolver la contraseña.
4. Email ya registrado.
5. Contraseña almacenada utilizando bcrypt.
6. Intento de manipular el rol desde el registro.
7. Login exitoso.
8. Login con email inexistente.
9. Login con contraseña incorrecta.
10. Mismo mensaje para email o contraseña incorrectos.
11. Generación del JWT.
12. Creación de la cookie `currentUser`.
13. Cookie configurada como HttpOnly.
14. Acceso a `/current` con token válido.
15. Acceso a `/current` sin cookie.
16. Rechazo de token inválido o manipulado.
17. Logout exitoso.
18. Eliminación de la cookie.
19. Acceso a `/current` luego del logout devuelve `401`.

---

# Flujo de autenticación

```text
REGISTER
   ↓
MongoDB
   ↓
LOGIN
   ↓
bcrypt.compare
   ↓
JWT
   ↓
Cookie currentUser
   ↓
GET /current
   ↓
auth.middleware
   ↓
Usuario autenticado
   ↓
LOGOUT
   ↓
Cookie eliminada
   ↓
GET /current → 401
```

---

# Seguridad

El archivo `.gitignore` excluye:

```text
node_modules/
.env
```

Además:

- las contraseñas se almacenan mediante bcrypt;
- el email se normaliza;
- el rol del registro público se fuerza a `user`;
- las contraseñas no se exponen;
- el JWT no contiene la contraseña;
- `JWT_SECRET` se obtiene desde variables de entorno;
- la autenticación utiliza una cookie HttpOnly;
- el login no revela si un email se encuentra registrado;
- las rutas protegidas verifican la validez del JWT.

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
- Passport;
- gestión completa de eventos;
- inscripciones;
- control de cupos;
- permisos de organizadores y administradores;
- notificaciones.

---

# Autor

**Gastón Jaureguiberry**

Proyecto desarrollado como **Pre-entrega 3 de Backend II en Coderhouse**.