import { Response } from 'express';
import { AuthRequest, BookingStatus, UserRole } from '../../types';
import { bookingsService } from './bookings.service';
import { ApiResponse } from '../../utils/response';
import logger from '../../utils/logger';

export class BookingsController {
  // Create booking
  async createBooking(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const booking = await bookingsService.createBooking(userId, req.body);
      return ApiResponse.created(res, booking, 'Booking created successfully');
    } catch (error: any) {
      logger.error('Error creating booking:', error);
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Get list of bookings
  async getBookings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role as UserRole;
      const bookings = await bookingsService.getBookings(userId, role, req.query);
      return ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching bookings:', error);
      return ApiResponse.serverError(res, error.message);
    }
  }

  // Get booking details
  async getBookingById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const role = req.user!.role as UserRole;
      const booking = await bookingsService.getBookingById(id, userId, role);
      return ApiResponse.success(res, booking, 'Booking details retrieved');
    } catch (error: any) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  // Update status (guarded by state machine)
  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { status, notes } = req.body;
      const userId = req.user!.id;
      const role = req.user!.role as UserRole;
      const updated = await bookingsService.updateBookingStatus(id, status as BookingStatus, userId, role, notes);
      return ApiResponse.success(res, updated, 'Booking status updated');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Cancel booking
  async cancelBooking(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const userId = req.user!.id;
      const role = req.user!.role as UserRole;
      const cancelled = await bookingsService.cancelBooking(id, userId, role, reason);
      return ApiResponse.success(res, cancelled, 'Booking cancelled successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Reschedule booking
  async rescheduleBooking(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { scheduled_date, scheduled_time } = req.body;
      const userId = req.user!.id;
      const role = req.user!.role as UserRole;
      const rescheduled = await bookingsService.rescheduleBooking(id, userId, role, scheduled_date, scheduled_time);
      return ApiResponse.success(res, rescheduled, 'Booking rescheduled successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

export const bookingsController = new BookingsController();
