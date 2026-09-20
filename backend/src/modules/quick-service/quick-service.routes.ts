import { Router } from 'express';
import { quickServiceController } from './quick-service.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Create quick service request
router.post('/', (req, res) => quickServiceController.createRequest(req, res));

// Get pending quick requests for professional radar
router.get('/pending', (req, res) => quickServiceController.getPendingForPro(req, res));

// Get status
router.get('/:id', (req, res) => quickServiceController.getStatus(req, res));

// Accept request
router.post('/:id/accept', (req, res) => quickServiceController.acceptRequest(req, res));

// Reject request
router.post('/:id/reject', (req, res) => quickServiceController.rejectRequest(req, res));

export default router;
