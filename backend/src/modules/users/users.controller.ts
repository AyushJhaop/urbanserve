import { Response } from 'express';
import { AuthRequest } from '../../types';
import { usersService } from './users.service';
import { ApiResponse } from '../../utils/response';

export class UsersController {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const profile = await usersService.getProfile(userId);
      return ApiResponse.success(res, profile, 'Profile retrieved');
    } catch (error: any) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const profile = await usersService.updateProfile(userId, req.body);
      return ApiResponse.success(res, profile, 'Profile updated successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAddresses(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const addresses = await usersService.getAddresses(userId);
      return ApiResponse.success(res, addresses, 'Addresses retrieved');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async addAddress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const address = await usersService.addAddress(userId, req.body);
      return ApiResponse.created(res, address, 'Address added successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

export const usersController = new UsersController();
