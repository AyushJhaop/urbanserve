import { Router } from 'express';
import { availabilityController } from './availability.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Get current availability and schedule
router.get('/', (req, res) => availabilityController.getAvailability(req, res));

// Toggle live availability on/off
router.put('/toggle', (req, res) => availabilityController.toggleAvailability(req, res));

// Update weekly availability windows
router.put('/schedule', (req, res) => availabilityController.updateSchedule(req, res));

export default router;
