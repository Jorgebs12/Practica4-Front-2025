import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { connectDB } from './config/database';
import { userRoutes } from './routes/userRoutes';
import { taskRoutes } from './routes/taskRoutes';
import { errorMiddleware } from './utils/errorHandler';
import { requestLogger, logger } from './utils/logger';

// Conectar a la base de datos
connectDB().then(() => {
  logger.info('Aplicación inicializada correctamente');
}).catch(err => {
  logger.error('Error al inicializar la aplicación', err);
});

// Crear la aplicación
const app = new Elysia()
  // Configurar middleware para manejo de errores
  .use(errorMiddleware)

  // Configurar CORS
  .use(cors({
    origin: '*', // Permitir solicitudes desde cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))

  // Configurar middleware para logging de peticiones
  .use(app => requestLogger(app))

  // Configurar Swagger para documentación de la API
  .use(swagger({
    documentation: {
      info: {
        title: 'API de Gestión de Tareas',
        version: '1.0.0',
        description: 'API para gestionar tareas y usuarios',
      },
      tags: [
        { name: 'Tareas', description: 'Operaciones relacionadas con tareas' },
        { name: 'Usuarios', description: 'Operaciones relacionadas con usuarios' }
      ],
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          Task: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
              user: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    },
    path: '/api/docs',
    swaggerOptions: {
      persistAuthorization: true
    }
  }))

  // Ruta de bienvenida
  .get('/', () => ({
    message: 'Bienvenido a la API de Gestión de Tareas',
    documentation: 'Visita /api/docs para ver la documentación de la API'
  }))

  // Configurar rutas
  .use(userRoutes)
  .use(taskRoutes)

const port = process.env.PORT || 4100;

// Iniciar el servidor
app.listen(port, () => {
  logger.info(`🚀 Servidor iniciado en http://localhost:${port}`);
  logger.info(`📚 Documentación disponible en http://localhost:${port}/api/docs`);
});
