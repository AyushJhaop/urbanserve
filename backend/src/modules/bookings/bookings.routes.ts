import { Router } from 'express';
import { bookingsController } from './bookings.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// List authorized bookings (Customer sees own, Pro sees assigned, Admin sees all)
router.get('/', (req, res) => bookingsController.getBookings(req, res));

// Create booking
router.post('/', (req, res) => bookingsController.createBooking(req, res));

// Get single booking
router.get('/:id', (req, res) => bookingsController.getBookingById(req, res));

// Update booking status
router.put('/:id/status', (req, res) => bookingsController.updateStatus(req, res));

// Cancel booking
router.put('/:id/cancel', (req, res) => bookingsController.cancelBooking(req, res));

// Reschedule booking
router.put('/:id/reschedule', (req, res) => bookingsController.rescheduleBooking(req, res));

export default router;
