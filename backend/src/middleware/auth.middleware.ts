import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserRole, JWTPayload } from '../types';
import { ApiResponse } from '../utils/response';
import config from '../config';
import logger from '../utils/logger';

// Verify JWT token
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return ApiResponse.unauthorized(res, 'Authentication token required');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      roleId: decoded.roleId,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token expired');
    }
    
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid token');
    }

    return ApiResponse.unauthorized(res, 'Authentication failed');
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

// Check if user is customer
export const isCustomer = authorize(UserRole.CUSTOMER);

// Check if user is professional
export const isProfessional = authorize(UserRole.PROFESSIONAL);

// Check if user is admin
export const isAdmin = authorize(UserRole.ADMIN);

// Check if user is either customer or admin
export const isCustomerOrAdmin = authorize(UserRole.CUSTOMER, UserRole.ADMIN);

// Check if user is either professional or admin
export const isProfessionalOrAdmin = authorize(UserRole.PROFESSIONAL, UserRole.ADMIN);
