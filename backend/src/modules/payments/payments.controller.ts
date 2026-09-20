import { Response } from 'express';
import { AuthRequest } from '../../types';
import { paymentsService } from './payments.service';
import { ApiResponse } from '../../utils/response';

export class PaymentsController {
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const order = await paymentsService.createPaymentOrder(userId, req.body);
      return ApiResponse.created(res, order, 'Payment order created');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async verifyPayment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await paymentsService.verifyPayment(userId, req.body);
      return ApiResponse.success(res, result, 'Payment verified successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getPayment(req: AuthRequest, res: Response) {
    try {
      const bookingId = req.params.bookingId as string;
      const payment = await paymentsService.getPaymentByBooking(bookingId);
      return ApiResponse.success(res, payment, 'Payment record retrieved');
    } catch (error: any) {
      return ApiResponse.notFound(res, error.message);
    }
  }
}

export const paymentsController = new PaymentsController();
