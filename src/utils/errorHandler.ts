import { Elysia } from 'elysia';
import mongoose from 'mongoose';

export enum ErrorType {
  VALIDATION = 'ValidationError',
  NOT_FOUND = 'NotFoundError',
  DUPLICATE = 'DuplicateError',
  SERVER = 'ServerError',
  BAD_REQUEST = 'BadRequestError'
}

export interface ApiError {
  type: ErrorType;
  message: string;
  details?: any;
  status: number;
}

export const handleError = (error: any): ApiError => {
  console.error('Error:', error);

  // Errores de validación de Mongoose
  if (error instanceof mongoose.Error.ValidationError) {
    return {
      type: ErrorType.VALIDATION,
      message: 'Error de validación',
      details: Object.values(error.errors).map(err => err.message),
      status: 400
    };
  }

  // Errores de clave duplicada de MongoDB
  if (error.code === 11000) {
    return {
      type: ErrorType.DUPLICATE,
      message: 'Registro duplicado',
      details: error.keyValue,
      status: 409
    };
  }

  // Errores de ID no válido de Mongoose
  if (error instanceof mongoose.Error.CastError) {
    return {
      type: ErrorType.BAD_REQUEST,
      message: 'ID no válido',
      details: error.message,
      status: 400
    };
  }

  // Error personalizado para recursos no encontrados
  if (error.name === ErrorType.NOT_FOUND) {
    return {
      type: ErrorType.NOT_FOUND,
      message: error.message || 'Recurso no encontrado',
      status: 404
    };
  }

  // Error personalizado para solicitudes incorrectas
  if (error.name === ErrorType.BAD_REQUEST) {
    return {
      type: ErrorType.BAD_REQUEST,
      message: error.message || 'Solicitud incorrecta',
      status: 400
    };
  }
  
  // Error personalizado de validación
  if (error.name === ErrorType.VALIDATION) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message || 'Error de validación',
      details: error.details || [],
      status: 400
    };
  }

  // Error de servidor por defecto
  return {
    type: ErrorType.SERVER,
    message: 'Error interno del servidor',
    details: error.message,
    status: 500
  };
};

// Middleware para manejar errores en Elysia
export const errorMiddleware = (app: Elysia) => 
  app.onError(({ code, error, set }) => {
    const apiError = handleError(error);
    set.status = apiError.status;
    
    return {
      success: false,
      error: {
        type: apiError.type,
        message: apiError.message,
        details: apiError.details
      }
    };
  });

// Función para crear errores personalizados
export class AppError extends Error {
  name: ErrorType;
  
  constructor(message: string, name: ErrorType) {
    super(message);
    this.name = name;
  }
  
  static notFound(message = 'Recurso no encontrado'): AppError {
    return new AppError(message, ErrorType.NOT_FOUND);
  }
  
  static badRequest(message = 'Solicitud incorrecta'): AppError {
    return new AppError(message, ErrorType.BAD_REQUEST);
  }
  
  static validation(message = 'Error de validación', details: any[] = []): AppError {
    const error = new AppError(message, ErrorType.VALIDATION);
    (error as any).details = details;
    return error;
  }
}
