import { Response } from 'express';
import { AuthRequest } from '../../types';
import { notificationsService } from './notifications.service';
import { ApiResponse } from '../../utils/response';

export class NotificationsController {
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const notifs = await notificationsService.getUserNotifications(userId);
      return ApiResponse.success(res, notifs, 'Notifications retrieved');
    } catch (error: any) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const notif = await notificationsService.markAsRead(id, userId);
      return ApiResponse.success(res, notif, 'Notification marked as read');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async markAllRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await notificationsService.markAllAsRead(userId);
      return ApiResponse.success(res, result, 'All notifications marked as read');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

export const notificationsController = new NotificationsController();
