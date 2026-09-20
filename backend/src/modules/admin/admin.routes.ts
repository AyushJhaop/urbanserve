import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';

const router = Router();

// All admin routes strictly require authentication and ADMIN role (FR-AUTH-005, NFR-SEC-001)
router.use(authenticate, isAdmin);

// Metrics dashboard
router.get('/analytics', (req, res) => adminController.getAnalytics(req, res));

// User management
router.get('/users', (req, res) => adminController.getUsers(req, res));

// Professional onboarding and approvals
router.get('/professionals', (req, res) => adminController.getProfessionals(req, res));
router.put('/professionals/:id/approve', (req, res) => adminController.approveProfessional(req, res));
router.put('/professionals/:id/reject', (req, res) => adminController.rejectProfessional(req, res));

export default router;
