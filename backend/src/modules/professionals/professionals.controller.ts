import { Response } from 'express';
import { AuthRequest } from '../../types';
import { professionalsService } from './professionals.service';
import { ApiResponse } from '../../utils/response';

export class ProfessionalsController {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const profile = await professionalsService.getProfile(userId);
      return ApiResponse.success(res, profile, 'Professional profile retrieved');
    } catch (error: any) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const updated = await professionalsService.updateProfile(userId, req.body);
      return ApiResponse.success(res, updated, 'Profile updated successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async uploadDocument(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const doc = await professionalsService.uploadDocument(userId, req.body);
      return ApiResponse.created(res, doc, 'Document uploaded for verification');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getJobs(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const jobs = await professionalsService.getJobs(userId);
      return ApiResponse.success(res, jobs, 'Jobs retrieved successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getEarnings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const earnings = await professionalsService.getEarnings(userId);
      return ApiResponse.success(res, earnings, 'Earnings breakdown retrieved');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

export const professionalsController = new ProfessionalsController();
