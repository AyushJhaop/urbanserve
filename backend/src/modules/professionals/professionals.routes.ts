import { Router } from 'express';
import { professionalsController } from './professionals.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Get professional profile
router.get('/profile', (req, res) => professionalsController.getProfile(req, res));

// Update profile
router.put('/profile', (req, res) => professionalsController.updateProfile(req, res));

// Upload verification documents
router.post('/documents', (req, res) => professionalsController.uploadDocument(req, res));

// Get assigned jobs
router.get('/jobs', (req, res) => professionalsController.getJobs(req, res));

// Get earnings
router.get('/earnings', (req, res) => professionalsController.getEarnings(req, res));

export default router;
