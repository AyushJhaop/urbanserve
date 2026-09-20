import { Router } from 'express';
import { query, param } from 'express-validator';
import servicesController from './services.controller';
import { validate } from '../../middleware/validation.middleware';

const router = Router();

// Validation rules
const serviceIdValidation = [
  param('id').isUUID().withMessage('Valid service ID is required'),
];

const searchValidation = [
  query('q').trim().notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const getServicesValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category_id').optional().isInt().toInt(),
  query('service_type').optional().isIn(['SCHEDULED', 'QUICK', 'BOTH']),
  query('min_price').optional().isFloat({ min: 0 }).toFloat(),
  query('max_price').optional().isFloat({ min: 0 }).toFloat(),
];

// Routes
router.get('/categories', servicesController.getCategories.bind(servicesController));

router.get(
  '/popular',
  [query('limit').optional().isInt({ min: 1, max: 50 }).toInt()],
  servicesController.getPopularServices.bind(servicesController)
);

router.get(
  '/search',
  validate(searchValidation),
  servicesController.searchServices.bind(servicesController)
);

router.get(
  '/',
  validate(getServicesValidation),
  servicesController.getServices.bind(servicesController)
);

router.get(
  '/:id',
  validate(serviceIdValidation),
  servicesController.getServiceById.bind(servicesController)
);

router.get(
  '/:id/professionals',
  validate(serviceIdValidation),
  servicesController.getProfessionalsForService.bind(servicesController)
);

export default router;
