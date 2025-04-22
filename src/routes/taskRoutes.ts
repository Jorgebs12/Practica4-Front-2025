import { Elysia, t } from 'elysia';
import { taskController } from '../controllers/taskController';
import { TaskStatus } from '../models/Task';

export const taskRoutes = (app: Elysia) => 
  app.group('/api/tasks', app => app
    /**
     * @openapi
     * /api/tasks:
     *   get:
     *     summary: Obtener todas las tareas
     *     tags:
     *       - Tareas
     *     responses:
     *       200:
     *         description: Lista de tareas obtenida correctamente
     */
    .get('/', async () => await taskController.getAllTasks())
    
    /**
     * @openapi
     * /api/tasks/{id}:
     *   get:
     *     summary: Obtener una tarea por su ID
     *     tags:
     *       - Tareas
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Tarea obtenida correctamente
     *       404:
     *         description: Tarea no encontrada
     */
    .get('/:id', async ({ params: { id } }) => await taskController.getTaskById(id), {
      params: t.Object({
        id: t.String()
      })
    })
    
    /**
     * @openapi
     * /api/tasks:
     *   post:
     *     summary: Crear una nueva tarea
     *     tags:
     *       - Tareas
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - user
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               status:
     *                 type: string
     *                 enum: [pending, in_progress, completed]
     *               user:
     *                 type: string
     *                 description: ID del usuario asignado a la tarea
     *     responses:
     *       201:
     *         description: Tarea creada correctamente
     *       400:
     *         description: Error de validación
     */
    .post('/', async ({ body }) => await taskController.createTask(body), {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        status: t.Optional(t.Enum(TaskStatus)),
        user: t.String()
      })
    })
    
    /**
     * @openapi
     * /api/tasks/{id}:
     *   put:
     *     summary: Actualizar una tarea existente
     *     tags:
     *       - Tareas
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               status:
     *                 type: string
     *                 enum: [pending, in_progress, completed]
     *               user:
     *                 type: string
     *                 description: ID del usuario asignado a la tarea
     *     responses:
     *       200:
     *         description: Tarea actualizada correctamente
     *       404:
     *         description: Tarea no encontrada
     */
    .put('/:id', async ({ params: { id }, body }) => await taskController.updateTask(id, body), {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        status: t.Optional(t.Enum(TaskStatus)),
        user: t.Optional(t.String())
      })
    })
    
    /**
     * @openapi
     * /api/tasks/{id}/status:
     *   patch:
     *     summary: Actualizar el estado de una tarea
     *     tags:
     *       - Tareas
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - status
     *             properties:
     *               status:
     *                 type: string
     *                 enum: [pending, in_progress, completed]
     *     responses:
     *       200:
     *         description: Estado de la tarea actualizado correctamente
     *       404:
     *         description: Tarea no encontrada
     */
    .patch('/:id/status', async ({ params: { id }, body }) => 
      await taskController.updateTaskStatus(id, body.status), {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        status: t.Enum(TaskStatus)
      })
    })
    
    /**
     * @openapi
     * /api/tasks/{id}/move:
     *   patch:
     *     summary: Mover una tarea a otro usuario
     *     tags:
     *       - Tareas
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *             properties:
     *               userId:
     *                 type: string
     *                 description: ID del nuevo usuario asignado
     *     responses:
     *       200:
     *         description: Tarea movida correctamente
     *       404:
     *         description: Tarea o usuario no encontrado
     */
    .patch('/:id/move', async ({ params: { id }, body }) => 
      await taskController.moveTaskToUser(id, body.userId), {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        userId: t.String()
      })
    })
    
    /**
     * @openapi
     * /api/tasks/{id}:
     *   delete:
     *     summary: Eliminar una tarea
     *     tags:
     *       - Tareas
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Tarea eliminada correctamente
     *       404:
     *         description: Tarea no encontrada
     */
    .delete('/:id', async ({ params: { id } }) => await taskController.deleteTask(id), {
      params: t.Object({
        id: t.String()
      })
    })
  );
