import { Response } from 'express';
import { AuthRequest, UserRole } from '../../types';
import { disputesService } from './disputes.service';
import { ApiResponse } from '../../utils/response';

export class DisputesController {
  async createDispute(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const dispute = await disputesService.createDispute(userId, req.body);
      return ApiResponse.created(res, dispute, 'Dispute ticket submitted');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getDisputes(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const disputes = await disputesService.getDisputes(userId, isAdmin);
      return ApiResponse.success(res, disputes, 'Disputes retrieved');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async resolveDispute(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const adminUserId = req.user!.id;
      const result = await disputesService.resolveDispute(id, adminUserId, req.body);
      return ApiResponse.success(res, result, 'Dispute resolved successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

export const disputesController = new DisputesController();
