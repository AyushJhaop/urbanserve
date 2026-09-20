import { Response } from 'express';
import { APIResponse } from '../types';

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: any
  ): Response {
    const response: APIResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'Error',
    statusCode: number = 500,
    error?: any
  ): Response {
    const response: APIResponse = {
      success: false,
      message,
      ...(error && { error }),
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message: string = 'Resource created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  static badRequest(res: Response, message: string = 'Bad request', error?: any): Response {
    return this.error(res, message, 400, error);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message: string = 'Resource conflict', error?: any): Response {
    return this.error(res, message, 409, error);
  }

  static serverError(res: Response, message: string = 'Internal server error', error?: any): Response {
    return this.error(res, message, 500, error);
  }
}
