# API de Gestión de Tareas

API RESTful para gestionar tareas y usuarios desarrollada con Bun, TypeScript, Elysia y MongoDB.

## Características

- **Gestión de Tareas**: Crear, editar, mover entre usuarios y actualizar tareas
- **Gestión de Usuarios**: Crear, editar y eliminar usuarios
- **Base de Datos**: MongoDB con Mongoose
- **Documentación**: Swagger UI integrada
- **TypeScript**: Tipado estático para mejor mantenibilidad
- **Manejo de Errores**: Sistema consistente y homogéneo

## Requisitos Previos

- [Bun](https://bun.sh/) (v1.0.0 o superior)
- [MongoDB](https://www.mongodb.com/) (local o remoto)

## Instalación

1. Clona este repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd back-p4
   ```

2. Instala las dependencias:
   ```bash
   bun install
   ```

3. Configura las variables de entorno (opcional):
   - Crea un archivo `.env` en la raíz del proyecto
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/task-management
   ```

## Ejecución

### Desarrollo

```bash
bun dev
```

### Producción

```bash
bun start
```

## Estructura del Proyecto

```
src/
├── config/           # Configuración (base de datos, etc.)
├── controllers/      # Controladores de la API
├── models/           # Modelos de datos (Mongoose)
├── routes/           # Rutas de la API
├── utils/            # Utilidades (manejo de errores, etc.)
└── index.ts          # Punto de entrada de la aplicación
```

## API Endpoints

La documentación completa de la API está disponible en `/api/docs` cuando el servidor está en ejecución.

### Usuarios

- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener un usuario por ID
- `POST /api/users` - Crear un nuevo usuario
- `PUT /api/users/:id` - Actualizar un usuario existente
- `DELETE /api/users/:id` - Eliminar un usuario

### Tareas

- `GET /api/tasks` - Obtener todas las tareas
- `GET /api/tasks/:id` - Obtener una tarea por ID
- `POST /api/tasks` - Crear una nueva tarea
- `PUT /api/tasks/:id` - Actualizar una tarea existente
- `PATCH /api/tasks/:id/status` - Actualizar el estado de una tarea
- `PATCH /api/tasks/:id/move` - Mover una tarea a otro usuario
- `DELETE /api/tasks/:id` - Eliminar una tarea

## Ejemplos de Uso

### Crear un Usuario

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan Pérez", "email": "juan@example.com"}'
```

### Crear una Tarea

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Completar informe", "description": "Terminar el informe trimestral", "user": "user_id_aquí"}'
```

## Licencia

MIT
