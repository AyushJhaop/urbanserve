import { Response } from 'express';
import { AuthRequest } from '../../types';
import { adminService } from './admin.service';
import { ApiResponse } from '../../utils/response';

export class AdminController {
  async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const analytics = await adminService.getDashboardAnalytics();
      return ApiResponse.success(res, analytics, 'Platform metrics retrieved');
    } catch (error: any) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  async getUsers(req: AuthRequest, res: Response) {
    try {
      const users = await adminService.getUsers();
      return ApiResponse.success(res, users, 'Users retrieved');
    } catch (error: any) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  async getProfessionals(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const pros = await adminService.getProfessionals(status as string);
      return ApiResponse.success(res, pros, 'Professionals retrieved');
    } catch (error: any) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  async approveProfessional(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const pro = await adminService.approveProfessional(id);
      return ApiResponse.success(res, pro, 'Professional registration approved successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async rejectProfessional(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const pro = await adminService.rejectProfessional(id, reason);
      return ApiResponse.success(res, pro, 'Professional registration rejected');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

export const adminController = new AdminController();
