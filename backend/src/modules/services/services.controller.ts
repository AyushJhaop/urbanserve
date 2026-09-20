import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/response';
import servicesService from './services.service';
import { PaginationParams } from '../../types';

export class ServicesController {
  // Get all categories
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await servicesService.getCategories();
      return ApiResponse.success(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get all services with filters
  async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const pagination: PaginationParams = {
        page,
        limit,
        offset: (page - 1) * limit,
      };

      const filters = {
        category_id: req.query.category_id ? parseInt(req.query.category_id as string) : undefined,
        service_type: req.query.service_type as 'SCHEDULED' | 'QUICK' | undefined,
        min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
        search: req.query.search as string | undefined,
      };

      const result = await servicesService.getServices(filters, pagination);

      return ApiResponse.success(res, result.services, 'Services retrieved successfully', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get service by ID
  async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const service = await servicesService.getServiceById(id);
      return ApiResponse.success(res, service, 'Service retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get professionals for a service
  async getProfessionalsForService(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const professionals = await servicesService.getProfessionalsForService(id);
      return ApiResponse.success(
        res,
        professionals,
        'Professionals retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // Search services
  async searchServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return ApiResponse.badRequest(res, 'Search query is required');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const pagination: PaginationParams = {
        page,
        limit,
        offset: (page - 1) * limit,
      };

      const result = await servicesService.searchServices(q, pagination);

      return ApiResponse.success(res, result.services, 'Search completed successfully', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get popular services
  async getPopularServices(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const services = await servicesService.getPopularServices(limit);
      return ApiResponse.success(res, services, 'Popular services retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ServicesController();
