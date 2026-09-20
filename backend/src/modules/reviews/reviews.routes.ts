import { Router } from 'express';
import { reviewsController } from './reviews.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Submit a review (guarded by auth and completion check)
router.post('/', authenticate, (req, res) => reviewsController.createReview(req, res));

// Public endpoint to view reviews for a professional
router.get('/professional/:professionalId', (req, res) => reviewsController.getReviewsForPro(req, res));

export default router;
