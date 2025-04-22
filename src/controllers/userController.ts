import User, { IUser } from '../models/User';
import { AppError, ErrorType } from '../utils/errorHandler';
import { isInMemoryMode, getInMemoryUsers, setInMemoryUsers } from '../config/database';
import mongoose from 'mongoose';

// Funciones de validación
const validateUserData = (userData: Partial<IUser>): void => {
  const errors: string[] = [];
  
  // Validar nombre
  if (!userData.name) {
    errors.push('El nombre es obligatorio');
  } else if (typeof userData.name !== 'string') {
    errors.push('El nombre debe ser una cadena de texto');
  } else {
    if (userData.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    if (userData.name.trim().length > 50) {
      errors.push('El nombre no puede tener más de 50 caracteres');
    }
  }
  
  // Validar email
  if (!userData.email) {
    errors.push('El email es obligatorio');
  } else if (typeof userData.email !== 'string') {
    errors.push('El email debe ser una cadena de texto');
  } else {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('El formato del email no es válido');
    }
  }
  
  // Validar edad (opcional)
  if (userData.age !== undefined) {
    if (typeof userData.age !== 'number') {
      errors.push('La edad debe ser un número');
    } else {
      if (!Number.isInteger(userData.age)) {
        errors.push('La edad debe ser un número entero');
      }
      if (userData.age < 0) {
        errors.push('La edad no puede ser negativa');
      }
      if (userData.age > 120) {
        errors.push('La edad no puede ser mayor a 120 años');
      }
    }
  }
  
  // Validar rol (opcional)
  if (userData.role !== undefined) {
    if (typeof userData.role !== 'string') {
      errors.push('El rol debe ser una cadena de texto');
    } else {
      const validRoles = ['user', 'admin', 'editor'];
      if (!validRoles.includes(userData.role)) {
        errors.push(`El rol '${userData.role}' no es válido. Roles válidos: ${validRoles.join(', ')}`);
      }
    }
  }
  
  // Validar active (opcional)
  if (userData.active !== undefined && typeof userData.active !== 'boolean') {
    errors.push('El campo active debe ser un valor booleano');
  }
  
  // Si hay errores, lanzar excepción
  if (errors.length > 0) {
    throw AppError.validation('Error de validación', errors);
  }
};

export const userController = {
  /**
   * Obtener todos los usuarios
   * @returns Lista de todos los usuarios
   */
  getAllUsers: async () => {
    if (isInMemoryMode()) {
      return { success: true, data: getInMemoryUsers() };
    }
    const users = await User.find();
    return { success: true, data: users };
  },

  /**
   * Obtener un usuario por su ID
   * @param id ID del usuario
   * @returns Usuario encontrado
   */
  getUserById: async (id: string) => {
    if (isInMemoryMode()) {
      const user = getInMemoryUsers().find(u => u._id.toString() === id);
      if (!user) {
        throw AppError.notFound(`Usuario con ID ${id} no encontrado`);
      }
      return { success: true, data: user };
    }
    
    const user = await User.findById(id);
    if (!user) {
      throw AppError.notFound(`Usuario con ID ${id} no encontrado`);
    }
    return { success: true, data: user };
  },


  
  /**
   * Crear un nuevo usuario
   * @param userData Datos del usuario a crear
   * @returns Usuario creado
   */
  createUser: async (userData: Partial<IUser>) => {
    // Validar datos del usuario
    validateUserData(userData);
    
    if (isInMemoryMode()) {
      // Verificar email único
      const existingUser = getInMemoryUsers().find(u => u.email === userData.email);
      if (existingUser) {
        const error: any = new Error('Email ya registrado');
        error.code = 11000;
        error.keyValue = { email: userData.email };
        throw error;
      }
      
      // Crear nuevo usuario con valores por defecto
      const newUser = {
        _id: new mongoose.Types.ObjectId(),
        role: 'user',
        active: true,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const users = [...getInMemoryUsers(), newUser];
      setInMemoryUsers(users);
      return { success: true, data: newUser };
    }
    
    const user = new User(userData);
    await user.save();
    return { success: true, data: user };
  },

  /**
   * Actualizar un usuario existente
   * @param id ID del usuario a actualizar
   * @param userData Datos actualizados del usuario
   * @returns Usuario actualizado
   */
  updateUser: async (id: string, userData: Partial<IUser>) => {
    // Validar datos del usuario si hay datos para actualizar
    if (Object.keys(userData).length > 0) {
      validateUserData(userData);
    }
    
    if (isInMemoryMode()) {
      const users = getInMemoryUsers();
      const userIndex = users.findIndex(u => u._id.toString() === id);
      
      if (userIndex === -1) {
        throw AppError.notFound(`Usuario con ID ${id} no encontrado`);
      }
      
      // Verificar email único si se está actualizando
      if (userData.email) {
        const emailExists = users.some(
          (u, i) => u.email === userData.email && i !== userIndex
        );
        
        if (emailExists) {
          const error: any = new Error('Email ya registrado');
          error.code = 11000;
          error.keyValue = { email: userData.email };
          throw error;
        }
      }
      
      const updatedUser = {
        ...users[userIndex],
        ...userData,
        updatedAt: new Date()
      };
      
      users[userIndex] = updatedUser;
      setInMemoryUsers(users);
      
      return { success: true, data: updatedUser };
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      userData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw AppError.notFound(`Usuario con ID ${id} no encontrado`);
    }
    
    return { success: true, data: user };
  },

  /**
   * Eliminar un usuario
   * @param id ID del usuario a eliminar
   * @returns Mensaje de confirmación
   */
  deleteUser: async (id: string) => {
    if (isInMemoryMode()) {
      const users = getInMemoryUsers();
      const userIndex = users.findIndex(u => u._id.toString() === id);
      
      if (userIndex === -1) {
        throw AppError.notFound(`Usuario con ID ${id} no encontrado`);
      }
      
      const deletedUser = users[userIndex];
      setInMemoryUsers(users.filter(u => u._id.toString() !== id));
      
      return { 
        success: true, 
        message: `Usuario con ID ${id} eliminado correctamente` 
      };
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      throw AppError.notFound(`Usuario con ID ${id} no encontrado`);
    }
    
    return { 
      success: true, 
      message: `Usuario con ID ${id} eliminado correctamente` 
    };
  }
};
