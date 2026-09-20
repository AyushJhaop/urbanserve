import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Get my notifications
router.get('/', (req, res) => notificationsController.getNotifications(req, res));

// Mark all as read
router.put('/read-all', (req, res) => notificationsController.markAllRead(req, res));

// Mark one as read
router.put('/:id/read', (req, res) => notificationsController.markAsRead(req, res));

export default router;
