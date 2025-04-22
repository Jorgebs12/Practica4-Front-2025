import Task, { ITask, TaskStatus } from '../models/Task';
import User from '../models/User';
import { AppError } from '../utils/errorHandler';
import { isInMemoryMode, getInMemoryUsers, getInMemoryTasks, setInMemoryTasks } from '../config/database';
import mongoose from 'mongoose';

export const taskController = {
  /**
   * Obtener todas las tareas
   * @returns Lista de todas las tareas
   */
  getAllTasks: async () => {
    if (isInMemoryMode()) {
      const tasks = getInMemoryTasks();
      const users = getInMemoryUsers();
      
      // Simular populate
      const populatedTasks = tasks.map(task => ({
        ...task,
        user: users.find(u => u._id.toString() === task.user.toString()) || task.user
      }));
      
      return { success: true, data: populatedTasks };
    }
    
    const tasks = await Task.find().populate('user', 'name email');
    return { success: true, data: tasks };
  },

  /**
   * Obtener una tarea por su ID
   * @param id ID de la tarea
   * @returns Tarea encontrada
   */
  getTaskById: async (id: string) => {
    if (isInMemoryMode()) {
      const tasks = getInMemoryTasks();
      const users = getInMemoryUsers();
      
      const task = tasks.find(t => t._id.toString() === id);
      
      if (!task) {
        throw AppError.notFound(`Tarea con ID ${id} no encontrada`);
      }
      
      // Simular populate
      const populatedTask = {
        ...task,
        user: users.find(u => u._id.toString() === task.user.toString()) || task.user
      };
      
      return { success: true, data: populatedTask };
    }
    
    const task = await Task.findById(id).populate('user', 'name email');
    
    if (!task) {
      throw AppError.notFound(`Tarea con ID ${id} no encontrada`);
    }
    
    return { success: true, data: task };
  },

  /**
   * Crear una nueva tarea
   * @param taskData Datos de la tarea a crear
   * @returns Tarea creada
   */
  createTask: async (taskData: Partial<ITask>) => {
    if (isInMemoryMode()) {
      const users = getInMemoryUsers();
      const tasks = getInMemoryTasks();
      
      // Verificar que el usuario existe
      const userExists = users.some(u => u._id.toString() === taskData.user?.toString());
      
      if (!userExists) {
        throw AppError.badRequest(`Usuario con ID ${taskData.user} no existe`);
      }
      
      // Asegurarnos de que user sea de tipo ObjectId o string
      const userId = taskData.user as mongoose.Types.ObjectId | string;
      
      const newTask = {
        _id: new mongoose.Types.ObjectId(),
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || TaskStatus.PENDING,
        user: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedTasks = [...tasks, newTask];
      setInMemoryTasks(updatedTasks);
      
      // Simular populate
      const user = users.find(u => u._id.toString() === userId.toString());
      const populatedTask = { ...newTask, user };
      
      return { success: true, data: populatedTask };
    }
    
    // Verificar que el usuario existe
    const userExists = await User.exists({ _id: taskData.user });
    
    if (!userExists) {
      throw AppError.badRequest(`Usuario con ID ${taskData.user} no existe`);
    }
    
    const task = new Task(taskData);
    await task.save();
    
    const populatedTask = await Task.findById(task._id).populate('user', 'name email');
    return { success: true, data: populatedTask };
  },

  /**
   * Actualizar una tarea existente
   * @param id ID de la tarea a actualizar
   * @param taskData Datos actualizados de la tarea
   * @returns Tarea actualizada
   */
  updateTask: async (id: string, taskData: Partial<ITask>) => {
    if (isInMemoryMode()) {
      const tasks = getInMemoryTasks();
      const users = getInMemoryUsers();
      
      const taskIndex = tasks.findIndex(t => t._id.toString() === id);
      
      if (taskIndex === -1) {
        throw AppError.notFound(`Tarea con ID ${id} no encontrada`);
      }
      
      // Si se está actualizando el usuario, verificar que existe
      if (taskData.user) {
        const userExists = users.some(u => u._id.toString() === taskData.user?.toString());
        
        if (!userExists) {
          throw AppError.badRequest(`Usuario con ID ${taskData.user} no existe`);
        }
      }
      
      const updatedTask = {
        ...tasks[taskIndex],
        ...taskData,
        updatedAt: new Date()
      };
      
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      setInMemoryTasks(updatedTasks);
      
      // Simular populate
      const user = users.find(u => u._id.toString() === updatedTask.user.toString());
      const populatedTask = { ...updatedTask, user };
      
      return { success: true, data: populatedTask };
    }
    
    // Si se está actualizando el usuario, verificar que existe
    if (taskData.user) {
      const userExists = await User.exists({ _id: taskData.user });
      
      if (!userExists) {
        throw AppError.badRequest(`Usuario con ID ${taskData.user} no existe`);
      }
    }
    
    const task = await Task.findByIdAndUpdate(
      id,
      taskData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    
    if (!task) {
      throw AppError.notFound(`Tarea con ID ${id} no encontrada`);
    }
    
    return { success: true, data: task };
  },

  /**
   * Cambiar el estado de una tarea
   * @param id ID de la tarea
   * @param status Nuevo estado de la tarea
   * @returns Tarea actualizada
   */
  updateTaskStatus: async (id: string, status: TaskStatus) => {
    if (!Object.values(TaskStatus).includes(status)) {
      throw AppError.badRequest(`Estado '${status}' no válido`);
    }
    
    if (isInMemoryMode()) {
      const tasks = getInMemoryTasks();
      const users = getInMemoryUsers();
      
      const taskIndex = tasks.findIndex(t => t._id.toString() === id);
      
      if (taskIndex === -1) {
        throw AppError.notFound(`Tarea con ID ${id} no encontrada`);
      }
      
      const updatedTask = {
        ...tasks[taskIndex],
        status,
        updatedAt: new Date()
      };
      
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      setInMemoryTasks(updatedTasks);
      
      // Simular populate
      const user = users.find(u => u._id.toString() === updatedTask.user.toString());
      const populatedTask = { ...updatedTask, user };
      
      return { success: true, data: populatedTask };
    }
    
    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    
    if (!task) {
      throw AppError.notFound(`Tarea con ID ${id} no encontrada`);
    }
    
    return { success: true, data: task };
  },

  /**
   * Cambiar el usuario asignado a una tarea
   * @param id ID de la tarea
   * @param userId ID del nuevo usuario
   * @returns Tarea actualizada
   */
  moveTaskToUser: async (id: string, userId: string) => {
    if (isInMemoryMode()) {
      const tasks = getInMemoryTasks();
      const users = getInMemoryUsers();
      
      // Verificar que el usuario existe
      const userExists = users.some(u => u._id.toString() === userId);
      
      if (!userExists) {
        throw AppError.badRequest(`Usuario con ID ${userId} no existe`);
      }
      
      const taskIndex = tasks.findIndex(t => t._id.toString() === id);
      
      if (taskIndex === -1) {
        throw AppError.notFound(`Tarea con ID ${id} no encontrada`);
      }
      
      const updatedTask = {
        ...tasks[taskIndex],
        user: userId,
        updatedAt: new Date()
      };
      
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      setInMemoryTasks(updatedTasks);
      
      // Simular populate
      const user = users.find(u => u._id.toString() === userId);
      const populatedTask = { ...updatedTask, user };
      
      return { success: true, data: populatedTask };
    }
    
    // Verificar que el usuario existe
    const userExists = await User.exists({ _id: userId });
    
    if (!userExists) {
      throw AppError.badRequest(`Usuario con ID ${userId} no existe`);
    }
    
    const task = await Task.findByIdAndUpdate(
      id,
      { user: userId },
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    
    if (!task) {
      throw AppError.notFound(`Tarea con ID ${id} no encontrada`);
    }
    
    return { success: true, data: task };
  },

  /**
   * Eliminar una tarea
   * @param id ID de la tarea a eliminar
   * @returns Mensaje de confirmación
   */
  deleteTask: async (id: string) => {
    if (isInMemoryMode()) {
      const tasks = getInMemoryTasks();
      const taskIndex = tasks.findIndex(t => t._id.toString() === id);
      
      if (taskIndex === -1) {
        throw AppError.notFound(`Tarea con ID ${id} no encontrada`);
      }
      
      setInMemoryTasks(tasks.filter(t => t._id.toString() !== id));
      
      return { 
        success: true, 
        message: `Tarea con ID ${id} eliminada correctamente` 
      };
    }
    
    const task = await Task.findByIdAndDelete(id);
    
    if (!task) {
      throw AppError.notFound(`Tarea con ID ${id} no encontrada`);
    }
    
    return { 
      success: true, 
      message: `Tarea con ID ${id} eliminada correctamente` 
    };
  }
};
