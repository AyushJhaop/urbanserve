import { Request, Response } from 'express';
import { AuthRequest } from '../../types';
import { reviewsService } from './reviews.service';
import { ApiResponse } from '../../utils/response';

export class ReviewsController {
  async createReview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const review = await reviewsService.createReview(userId, req.body);
      return ApiResponse.created(res, review, 'Thank you for your rating and feedback!');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getReviewsForPro(req: Request, res: Response) {
    try {
      const professionalId = req.params.professionalId as string;
      const reviews = await reviewsService.getReviewsForProfessional(professionalId);
      return ApiResponse.success(res, reviews, 'Reviews retrieved successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

export const reviewsController = new ReviewsController();
