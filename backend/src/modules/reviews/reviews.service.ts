import { memStore } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { BookingStatus } from '../../types';
import { randomUUID } from 'crypto';
import logger from '../../utils/logger';

export class ReviewsService {
  // Create review for completed booking (BRULE-005)
  async createReview(userId: string, data: {
    booking_id: string;
    rating: number;
    comment?: string;
  }) {
    const booking = memStore.bookings.find((b) => b.id === data.booking_id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Verify booking is COMPLETED (BRULE-005)
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new AppError('Reviews can only be submitted after the service is marked as completed', 400);
    }

    // Verify rating range (1 - 5)
    const rating = Math.round(Number(data.rating));
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new AppError('Rating must be an integer between 1 and 5', 400);
    }

    // Verify user is customer of this booking
    const cust = memStore.customer_profiles.find((c) => c.user_id === userId);
    if (!cust || booking.customer_id !== cust.id) {
      throw new AppError('Unauthorized: only the booking customer can submit a review', 403);
    }

    if (!booking.professional_id) {
      throw new AppError('No professional assigned to this booking', 400);
    }

    // Check if review already exists
    let review = memStore.reviews.find((r) => r.booking_id === booking.id);
    if (review) {
      review.rating = rating;
      review.comment = data.comment || '';
      review.updated_at = new Date();
    } else {
      review = {
        id: randomUUID(),
        booking_id: booking.id,
        customer_id: cust.id,
        professional_id: booking.professional_id,
        rating,
        comment: data.comment || '',
        is_visible: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      memStore.reviews.push(review);
    }

    // Recalculate professional average rating and total reviews
    const proReviews = memStore.reviews.filter((r) => r.professional_id === booking.professional_id && r.is_visible);
    const avgRating = proReviews.reduce((sum, r) => sum + r.rating, 0) / proReviews.length;

    const pro = memStore.professional_profiles.find((p) => p.id === booking.professional_id);
    if (pro) {
      pro.average_rating = parseFloat(avgRating.toFixed(1));
      pro.total_reviews = proReviews.length;
    }

    logger.info(`Review created for booking ${booking.id} - Rating: ${rating}★`);

    return {
      ...review,
      customer_name: `${cust.first_name} ${cust.last_name}`,
      professional_name: pro ? `${pro.first_name} ${pro.last_name}` : 'Professional',
    };
  }

  // Get reviews for a professional
  async getReviewsForProfessional(professionalId: string) {
    const reviews = memStore.reviews.filter((r) => r.professional_id === professionalId && r.is_visible);
    return reviews.map((r) => {
      const cust = memStore.customer_profiles.find((c) => c.id === r.customer_id);
      return {
        ...r,
        customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Customer',
        customer_image: cust?.profile_image_url || null,
      };
    });
  }
}

export const reviewsService = new ReviewsService();
