import { Elysia, t } from 'elysia';
import { userController } from '../controllers/userController';

export const userRoutes = (app: Elysia) => 
  app.group('/api/users', app => app
    /**
     * @openapi
     * /api/users:
     *   get:
     *     summary: Obtener todos los usuarios
     *     tags:
     *       - Usuarios
     *     responses:
     *       200:
     *         description: Lista de usuarios obtenida correctamente
     */
    .get('/', async () => await userController.getAllUsers())
    
    /**
     * @openapi
     * /api/users/{id}:
     *   get:
     *     summary: Obtener un usuario por su ID
     *     tags:
     *       - Usuarios
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Usuario obtenido correctamente
     *       404:
     *         description: Usuario no encontrado
     */
    .get('/:id', async ({ params: { id } }) => await userController.getUserById(id), {
      params: t.Object({
        id: t.String()
      })
    })
    
    /**
     * @openapi
     * /api/users:
     *   post:
     *     summary: Crear un nuevo usuario
     *     tags:
     *       - Usuarios
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - email
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *     responses:
     *       201:
     *         description: Usuario creado correctamente
     *       400:
     *         description: Error de validación
     */
    .post('/', async ({ body }) => await userController.createUser(body), {
      body: t.Object({
        name: t.String(),
        email: t.String()
      })
    })
    
    /**
     * @openapi
     * /api/users/{id}:
     *   put:
     *     summary: Actualizar un usuario existente
     *     tags:
     *       - Usuarios
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
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *     responses:
     *       200:
     *         description: Usuario actualizado correctamente
     *       404:
     *         description: Usuario no encontrado
     */
    .put('/:id', async ({ params: { id }, body }) => await userController.updateUser(id, body), {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        name: t.Optional(t.String()),
        email: t.Optional(t.String())
      })
    })
    
    /**
     * @openapi
     * /api/users/{id}:
     *   delete:
     *     summary: Eliminar un usuario
     *     tags:
     *       - Usuarios
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Usuario eliminado correctamente
     *       404:
     *         description: Usuario no encontrado
     */
    .delete('/:id', async ({ params: { id } }) => await userController.deleteUser(id), {
      params: t.Object({
        id: t.String()
      })
    })
  );
