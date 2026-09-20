import { Response } from 'express';
import { AuthRequest } from '../../types';
import { availabilityService } from './availability.service';
import { ApiResponse } from '../../utils/response';

export class AvailabilityController {
  async getAvailability(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = await availabilityService.getAvailability(userId);
      return ApiResponse.success(res, data, 'Availability settings retrieved');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async toggleAvailability(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { is_currently_available } = req.body;
      const data = await availabilityService.toggleCurrentAvailability(userId, !!is_currently_available);
      return ApiResponse.success(res, data, `Availability set to ${is_currently_available ? 'ONLINE' : 'OFFLINE'}`);
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async updateSchedule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { windows } = req.body;
      const data = await availabilityService.updateWeeklySchedule(userId, windows || []);
      return ApiResponse.success(res, data, 'Weekly schedule updated successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

export const availabilityController = new AvailabilityController();
