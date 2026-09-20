import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Create checkout order
router.post('/create-order', (req, res) => paymentsController.createOrder(req, res));

// Verify gateway signature / result
router.post('/verify', (req, res) => paymentsController.verifyPayment(req, res));

// Get payment info for booking
router.get('/booking/:bookingId', (req, res) => paymentsController.getPayment(req, res));

export default router;
