/**
 * Módulo de logging para la aplicación
 * Proporciona funciones para registrar diferentes niveles de mensajes
 */

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Formato de fecha para los logs
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Niveles de log
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  HTTP = 'HTTP',
  DEBUG = 'DEBUG'
}

// Colores por nivel
const levelColors = {
  [LogLevel.ERROR]: colors.red,
  [LogLevel.WARN]: colors.yellow,
  [LogLevel.INFO]: colors.green,
  [LogLevel.HTTP]: colors.cyan,
  [LogLevel.DEBUG]: colors.magenta
};

// Función principal de log
const log = (level: LogLevel, message: string, meta?: any): void => {
  const timestamp = getTimestamp();
  const color = levelColors[level] || colors.reset;
  
  let logMessage = `${color}[${timestamp}] [${level}]${colors.reset} ${message}`;
  
  if (meta) {
    // Si hay metadatos, los formateamos como JSON
    try {
      const metaStr = typeof meta === 'string' ? meta : JSON.stringify(meta, null, 2);
      logMessage += `\n${colors.gray}${metaStr}${colors.reset}`;
    } catch (e) {
      logMessage += `\n${colors.gray}[Metadatos no serializables]${colors.reset}`;
    }
  }
  
  console.log(logMessage);
};

// Middleware para Elysia que registra las peticiones HTTP
import { Elysia } from 'elysia';

// Creamos un plugin simple para Elysia
export const requestLogger = (app: Elysia) => {
  // Usamos un enfoque más simple: solo registramos las peticiones mediante un hook
  return app.use((app) => {
    return app
      .onBeforeHandle(({ request }) => {
        // Registrar la solicitud entrante
        log(LogLevel.HTTP, `${request.method} ${request.url}`);
      })
      .onAfterHandle(({ request, set }) => {
        // Registrar la respuesta exitosa
        const statusCode = set.status || 200;
        const statusColor = Number(statusCode) >= 400 ? colors.red : colors.green;
        log(LogLevel.HTTP, `${request.method} ${request.url} ${statusColor}${statusCode}${colors.reset}`);
      })
      .onError(({ request, error }) => {
        // Registrar errores
        const errorMessage = error instanceof Error ? error.message : String(error);
        log(LogLevel.ERROR, `${request.method} ${request.url} - Error: ${errorMessage}`);
        return error; // Devolver el error para que Elysia lo maneje
      });
  });
};

// Exportar funciones de log individuales
export const logger = {
  error: (message: string, meta?: any) => log(LogLevel.ERROR, message, meta),
  warn: (message: string, meta?: any) => log(LogLevel.WARN, message, meta),
  info: (message: string, meta?: any) => log(LogLevel.INFO, message, meta),
  http: (message: string, meta?: any) => log(LogLevel.HTTP, message, meta),
  debug: (message: string, meta?: any) => log(LogLevel.DEBUG, message, meta)
};

export default logger;
