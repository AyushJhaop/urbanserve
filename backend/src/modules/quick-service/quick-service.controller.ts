import { Response } from 'express';
import { AuthRequest } from '../../types';
import { quickServiceService } from './quick-service.service';
import { ApiResponse } from '../../utils/response';
import logger from '../../utils/logger';

export class QuickServiceController {
  async createRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const request = await quickServiceService.createQuickServiceRequest(userId, req.body);
      return ApiResponse.created(res, request, 'Quick service dispatch initiated');
    } catch (error: any) {
      logger.error('Error creating quick service request:', error);
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getStatus(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const status = await quickServiceService.getQuickServiceStatus(id);
      return ApiResponse.success(res, status, 'Quick service status retrieved');
    } catch (error: any) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  async acceptRequest(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const result = await quickServiceService.acceptQuickService(id, userId);
      return ApiResponse.success(res, result, 'Quick service request accepted successfully!');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async rejectRequest(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const result = await quickServiceService.rejectQuickService(id, userId);
      return ApiResponse.success(res, result, 'Quick service request declined');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getPendingForPro(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const requests = await quickServiceService.getPendingRequestsForPro(userId);
      return ApiResponse.success(res, requests, 'Pending urgent jobs retrieved');
    } catch (error: any) {
      return ApiResponse.serverError(res, error.message);
    }
  }
}

export const quickServiceController = new QuickServiceController();
