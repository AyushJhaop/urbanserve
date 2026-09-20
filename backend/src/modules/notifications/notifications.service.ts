import { memStore } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class NotificationsService {
  // Get notifications for user
  async getUserNotifications(userId: string) {
    const notifs = memStore.notifications.filter((n) => n.user_id === userId);
    return notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notif = memStore.notifications.find((n) => n.id === notificationId && n.user_id === userId);
    if (!notif) {
      throw new AppError('Notification not found', 404);
    }

    notif.is_read = true;
    return notif;
  }

  // Mark all as read
  async markAllAsRead(userId: string) {
    memStore.notifications.forEach((n) => {
      if (n.user_id === userId) {
        n.is_read = true;
      }
    });

    return { success: true, message: 'All notifications marked as read' };
  }
}

export const notificationsService = new NotificationsService();
