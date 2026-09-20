import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiResponse } from '../utils/response';

// Validation middleware
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return ApiResponse.badRequest(res, 'Validation failed', {
      errors: errors.array(),
    });
  };
};

// Rate limiting - will be configured per route
export { rateLimit } from 'express-rate-limit';
