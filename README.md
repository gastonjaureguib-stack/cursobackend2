# Plataforma de Eventos y Reservas para Club Cannábico

API backend desarrollada con **Node.js**, **Express**, **MongoDB**, **Mongoose** y **bcrypt**, orientada a una plataforma de eventos e inscripciones.

Esta segunda pre-entrega corresponde al desarrollo del primer flujo seguro de usuarios del proyecto de **Backend II**, incorporando conexión a MongoDB, arquitectura por capas y registro seguro de usuarios.

El proyecto queda preparado para continuar en próximas etapas con login, JWT, cookies, Passport, roles, autorización, gestión de eventos e inscripciones.

---

# Tecnologías utilizadas

* Node.js
* Express
* MongoDB
* Mongoose
* bcrypt
* dotenv
* JavaScript con módulos ESM

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

Ejemplo:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/tu_base_de_datos
JWT_SECRET=tu_clave_secreta
```

`MONGO_URL` se utiliza para establecer la conexión con MongoDB mediante Mongoose.

`JWT_SECRET` queda configurado para ser utilizado en las próximas etapas del proyecto, cuando se incorpore autenticación mediante JWT.

El archivo `.env` contiene información local o sensible y no debe subirse al repositorio.

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
    └── hash.js
```

El flujo utilizado para el registro de usuarios es:

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

Esta separación permite mantener desacoplada la lógica HTTP, la lógica de negocio y el acceso a datos.

---

# Conexión a MongoDB

La aplicación utiliza **Mongoose** para conectarse a MongoDB.

La conexión se encuentra configurada en:

```text
src/config/db.js
```

La URL de conexión se obtiene desde la variable de entorno:

```text
MONGO_URL
```

Si no es posible establecer la conexión con la base de datos, el servidor no continúa su ejecución.

---

# Registro de usuarios

## Endpoint

```text
POST /api/sessions/register
```

Permite registrar un nuevo usuario de forma segura.

### Campos requeridos

* `first_name`
* `last_name`
* `email`
* `password`

El campo `role` **no se acepta desde el registro público**. Todos los usuarios registrados mediante este endpoint reciben automáticamente el rol `user`.

Los roles admitidos por el modelo son:

* `user`
* `organizer`
* `admin`

---

# Ejemplo de registro

### Request

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

El email se normaliza mediante `trim` y `lowercase` antes de realizar la búsqueda y persistencia.

### Response — 201 Created

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La contraseña nunca se incluye en la respuesta.

---

# Validaciones del registro

El endpoint verifica:

* presencia de `first_name`, `last_name`, `email` y `password`;
* formato válido de email;
* contraseña de al menos 8 caracteres;
* normalización del email;
* inexistencia previa del email en la base de datos;
* asignación segura del rol `user`.

### Campos faltantes

Response `400 Bad Request`:

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

### Email inválido

Response `400 Bad Request`:

```json
{
  "status": "error",
  "message": "Formato de email inválido"
}
```

### Contraseña demasiado corta

Response `400 Bad Request`:

```json
{
  "status": "error",
  "message": "La contraseña debe tener al menos 8 caracteres"
}
```

### Email ya registrado

Response `409 Conflict`:

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

---

# Seguridad de contraseñas

Las contraseñas no se almacenan en texto plano.

Antes de guardar un usuario, la contraseña es procesada utilizando **bcrypt**.

La lógica de hashing se encuentra encapsulada en el helper reutilizable:

```text
src/utils/hash.js
```

Este helper contiene funciones para generar hashes y comparar contraseñas, dejando preparada la aplicación para implementar el login en próximas entregas.

La contraseña, tanto en texto plano como hasheada, nunca se devuelve en la respuesta del endpoint de registro.

---

# Modelo User

El modelo `User` contiene:

* `first_name`
* `last_name`
* `email`
* `password`
* `role`

El campo `role` admite:

```text
user
organizer
admin
```

y su valor por defecto es:

```text
user
```

También se utilizan timestamps de Mongoose para registrar las fechas de creación y actualización.

---

# Events

Representará los eventos, actividades, talleres o reuniones disponibles dentro de la plataforma.

Ruta disponible:

```text
GET /api/events
```

Respuesta actual:

```json
{
  "status": "success",
  "payload": []
}
```

El CRUD completo de eventos será incorporado en próximas etapas.

---

# Sessions

Además del registro, se mantiene la ruta base:

```text
GET /api/sessions
```

Respuesta:

```json
{
  "status": "success",
  "message": "Sessions disponible"
}
```

---

# Health Check

Ruta utilizada para comprobar que el servidor se encuentra activo:

```text
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

# Casos probados

Antes de la entrega se verificaron los siguientes escenarios:

1. Registro exitoso.
2. Campos obligatorios faltantes.
3. Email con formato inválido.
4. Email ya registrado.
5. Contraseña almacenada con hash de bcrypt en MongoDB.
6. Respuesta del endpoint sin el campo `password`.
7. Intento de enviar `role: "admin"` desde el registro público, verificando que el usuario sea creado con `role: "user"`.

---

# Temática del proyecto

El proyecto está orientado a una **plataforma de eventos e inscripciones para un club cannábico**.

En esta segunda etapa se incorporó el primer flujo real y seguro de usuarios.

En futuras entregas se podrán incorporar funcionalidades como:

* login de usuarios;
* JWT y cookies;
* Passport;
* roles y autorización;
* gestión de eventos;
* inscripciones;
* control de cupos;
* notificaciones.

---

# Seguridad

El archivo `.gitignore` excluye:

```text
node_modules/
.env
```

De esta manera, las dependencias instaladas y las variables sensibles no se incluyen en el repositorio público.

Además:

* las contraseñas se almacenan utilizando bcrypt;
* el email se normaliza antes de guardarse;
* se impiden registros duplicados por email;
* el rol no puede ser manipulado desde el registro público;
* la contraseña no se expone en las respuestas de la API.

---

# Scripts disponibles

```json
{
  "start": "node src/server.js",
  "dev": "node --watch src/server.js"
}
```

---

# Autor

**Gastón Jaureguiberry**

Proyecto desarrollado como **Pre-entrega 2 de Backend II en Coderhouse**.
