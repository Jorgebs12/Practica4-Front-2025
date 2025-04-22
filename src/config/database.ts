import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management';

// Variables para almacenamiento en memoria (solo para demostración)
let inMemoryMode = false;
let inMemoryUsers: any[] = [];
let inMemoryTasks: any[] = [];

export const connectDB = async (): Promise<void> => {
  try {
    // Intentar conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión a MongoDB establecida correctamente');
  } catch (error) {
    console.warn('⚠️ No se pudo conectar a MongoDB. Usando modo en memoria.');
    inMemoryMode = true;
    console.log('✅ Modo en memoria activado correctamente');
  }
};

// Funciones para el modo en memoria
export const isInMemoryMode = (): boolean => inMemoryMode;
export const getInMemoryUsers = (): any[] => inMemoryUsers;
export const getInMemoryTasks = (): any[] => inMemoryTasks;
export const setInMemoryUsers = (users: any[]): void => { inMemoryUsers = users; };
export const setInMemoryTasks = (tasks: any[]): void => { inMemoryTasks = tasks; };
