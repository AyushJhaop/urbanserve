import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Profile
router.get('/profile', (req, res) => usersController.getProfile(req, res));
router.put('/profile', (req, res) => usersController.updateProfile(req, res));

// Addresses
router.get('/addresses', (req, res) => usersController.getAddresses(req, res));
router.post('/addresses', (req, res) => usersController.addAddress(req, res));

export default router;
