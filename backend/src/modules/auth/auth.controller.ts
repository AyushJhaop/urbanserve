import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { ApiResponse } from '../../utils/response';
import authService from './auth.service';
import logger from '../../utils/logger';

export class AuthController {
  // Register customer
  async registerCustomer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, first_name, last_name, phone } = req.body;

      const result = await authService.registerCustomer({
        email,
        password,
        first_name,
        last_name,
        phone,
      });

      return ApiResponse.created(res, result, 'Customer registered successfully');
    } catch (error) {
      next(error);
    }
  }

  // Register professional
  async registerProfessional(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, first_name, last_name, phone, bio, experience_years } = req.body;

      const result = await authService.registerProfessional({
        email,
        password,
        first_name,
        last_name,
        phone,
        bio,
        experience_years,
      });

      return ApiResponse.created(
        res,
        result,
        'Professional registered successfully. Pending admin approval.'
      );
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      return ApiResponse.success(res, result, 'Logged in successfully');
    } catch (error) {
      next(error);
    }
  }

  // Google Authentication
  async googleAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, first_name, last_name, avatar_url, google_id } = req.body;

      const result = await authService.loginWithGoogle({
        email,
        first_name,
        last_name,
        avatar_url,
        google_id,
      });

      return ApiResponse.success(res, result, 'Signed in with Google successfully');
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refresh_token } = req.body;

      const result = await authService.refreshToken(refresh_token);

      return ApiResponse.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const result = await authService.logout(userId);

      return ApiResponse.success(res, result, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      return ApiResponse.success(res, req.user, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
