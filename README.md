# CursifyNova

Plataforma de cursos en línea con sistema de comentarios y certificaciones.

## Descripción

CursifyNova es una plataforma de aprendizaje en línea que permite a estudiantes acceder a cursos, seguir su progreso y obtener certificaciones. Los instructores pueden crear y gestionar cursos, módulos y lecciones, así como interactuar con los estudiantes a través de un sistema de comentarios.

## Características

- Gestión de usuarios (estudiantes, instructores, administradores)
- Creación y gestión de cursos, módulos y lecciones
- Sistema de comentarios y respuestas en lecciones
- Seguimiento de progreso para estudiantes
- Generación de certificados al completar cursos
- Panel administrativo para instructores
- Sistema de caché con Redis para mejorar el rendimiento
- Almacenamiento optimizado de datos frecuentemente accedidos

## Tecnologías utilizadas

- **Lenguaje:** TypeScript, JavaScript
- **Base de datos:** MongoDB, Redis (Cache)
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Autenticación:** JWT

## Instalación

### Clonar el repositorio

```bash
git clone https://github.com/BetzabeG/cursifyNova-bdIII.git
cd cursifyNova-bdIII
```

### Configuración del servidor (backend)

```bash
cd server

# Instalar dependencias
npm install

# Crear archivo .env para variables de entorno
echo "PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/cursifynova
JWT_SECRET=tu_clave_secreta
JWT_EXPIRE=24h" > .env
```
# Instalar dependencias para Redis (db 12)
```bash
npm install redis @redis/client
npm install --save-dev @types/redis
```

### Configuración del cliente (frontend)

```bash
cd client

# Instalar dependencias
npm install

# Crear archivo .env para variables de entorno
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

## Ejecución

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```