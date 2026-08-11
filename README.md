# Plataforma de Eventos y Reservas para Club Cannábico

API backend desarrollada con **Node.js**, **Express** y **Mongoose**, orientada a una plataforma de eventos e inscripciones para un club cannábico.

Esta primera pre-entrega corresponde a la base arquitectónica del proyecto de **Backend II**, preparada para crecer en próximas etapas con autenticación, roles, inscripciones, cupos y otras funcionalidades.

---

# Tecnologías utilizadas

- Node.js
- Express
- dotenv
- Mongoose
- JavaScript con módulos ESM

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

## 2. Ingresar al proyecto

```bash
cd cursoback2
```

## 3. Instalar dependencias

```bash
npm install
```

---

# Variables de entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

Variables utilizadas:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/tu_base_de_datos
JWT_SECRET=tu_clave_secreta
```

En esta primera etapa, `MONGO_URL` y `JWT_SECRET` quedan preparados para próximas entregas.

El archivo `.env` no debe subirse al repositorio.

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

---

# Arquitectura del proyecto

El proyecto utiliza una estructura organizada por capas para separar responsabilidades y facilitar su crecimiento.

```text
src/
│
├── app.js
├── server.js
│
├── config/
│
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js
│
├── dao/
│
├── middlewares/
│
├── models/
│   ├── User.js
│   └── Event.js
│
├── repositories/
│
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
│
├── services/
│
└── utils/
```

Las carpetas `config`, `services`, `repositories`, `dao`, `middlewares` y `utils` forman parte de la arquitectura base y serán utilizadas en próximas etapas del proyecto.

---

# Recursos iniciales

## Events

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

En esta primera etapa todavía no existe lógica de persistencia ni CRUD completo.

---

## Sessions

Se creó la estructura inicial para el recurso `sessions`.

Ruta disponible:

```text
GET /api/sessions
```

Respuesta actual:

```json
{
  "status": "success",
  "message": "Sessions disponible"
}
```

La lógica de autenticación será incorporada en próximas entregas.

---

# Health Check

Ruta utilizada para comprobar que el servidor se encuentra activo.

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

# Modelos base

## User

El modelo `User` contiene los campos mínimos:

- `firstName`
- `lastName`
- `email`
- `password`

La autenticación, roles y seguridad de contraseñas serán incorporados posteriormente.

---

## Event

El modelo `Event` contiene:

- `title`
- `description`
- `date`
- `location`
- `capacity`

Este modelo servirá como base para los eventos y actividades de la plataforma.

---

# Temática del proyecto

El proyecto está orientado a una **plataforma de eventos e inscripciones para un club cannábico**.

En esta primera etapa se trabaja únicamente sobre la arquitectura inicial.

En futuras entregas se podrán incorporar funcionalidades como:

- registro y login de usuarios,
- autenticación,
- roles,
- gestión de eventos,
- inscripciones,
- control de cupos,
- notificaciones.

---

# Seguridad

El archivo `.gitignore` excluye:

```text
node_modules/
.env
```

De esta manera, las dependencias instaladas y las variables sensibles no se incluyen en el repositorio público.

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

Proyecto desarrollado como **Pre-entrega 1 de Backend II en Coderhouse**.