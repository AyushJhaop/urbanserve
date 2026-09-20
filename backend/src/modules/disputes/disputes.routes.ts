import { Router } from 'express';
import { disputesController } from './disputes.controller';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Create dispute
router.post('/', (req, res) => disputesController.createDispute(req, res));

// List disputes
router.get('/', (req, res) => disputesController.getDisputes(req, res));

// Resolve dispute (Admin only)
router.put('/:id/resolve', isAdmin, (req, res) => disputesController.resolveDispute(req, res));

export default router;
