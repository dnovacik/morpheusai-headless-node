import winston from 'winston';
import path from 'path';
import { appDataPathPlatform, isDev } from './constants';

const logFilePath = isDev ? '.' : appDataPathPlatform;

export const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logFilePath, 'error.log'),
      maxFiles: 1,
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logFilePath, 'app.log'),
      maxFiles: 1,
      level: 'info',
    }),
  ],
  exitOnError: false,
});

process.on('uncaughtException', (err) => {
  const message = typeof err === 'string' ? err : err.message;

  logger.error(`${message}\n${err && err.stack || '  No stack trace'}`);
});
