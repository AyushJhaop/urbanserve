import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ApiResponse } from '../utils/response';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  // Default to 500 server error
  return ApiResponse.serverError(res, 'Something went wrong');
};

export const notFoundHandler = (req: Request, res: Response): Response => {
  return ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
};
