import { Router } from 'express';
import { body } from 'express-validator';
import authController from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';

const router = Router();

// Validation rules
const registerCustomerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
];

const registerProfessionalValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('phone').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('bio').optional().isString(),
  body('experience_years').optional().isInt({ min: 0 }),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshTokenValidation = [
  body('refresh_token').notEmpty().withMessage('Refresh token is required'),
];

// Routes
router.post(
  '/register/customer',
  validate(registerCustomerValidation),
  authController.registerCustomer.bind(authController)
);

router.post(
  '/register/professional',
  validate(registerProfessionalValidation),
  authController.registerProfessional.bind(authController)
);

router.post('/login', validate(loginValidation), authController.login.bind(authController));

router.post('/google', authController.googleAuth.bind(authController));

router.post(
  '/refresh',
  validate(refreshTokenValidation),
  authController.refreshToken.bind(authController)
);

router.post('/logout', authenticate, authController.logout.bind(authController));

router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;
