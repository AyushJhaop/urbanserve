import { memStore } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { BookingStatus, PaymentStatus } from '../../types';
import { randomUUID } from 'crypto';
import logger from '../../utils/logger';

export class PaymentsService {
  // Create a payment order/session (Razorpay / Stripe test simulation)
  async createPaymentOrder(userId: string, data: { booking_id: string; gateway?: 'RAZORPAY' | 'STRIPE' }) {
    const booking = memStore.bookings.find((b) => b.id === data.booking_id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const gateway = data.gateway || 'RAZORPAY';
    const amount = booking.total_amount;
    const orderId = (gateway === 'RAZORPAY' ? 'order_' : 'pi_') + randomUUID().substring(0, 16);

    const paymentRecord = {
      id: randomUUID(),
      booking_id: booking.id,
      amount,
      currency: 'INR',
      payment_method: 'UPI',
      payment_gateway: gateway,
      gateway_transaction_id: orderId,
      payment_status: PaymentStatus.PENDING,
      payment_intent_id: orderId,
      paid_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    memStore.payments.push(paymentRecord);

    return {
      order_id: orderId,
      amount,
      currency: 'INR',
      gateway,
      booking_id: booking.id,
      key_id: gateway === 'RAZORPAY' ? 'rzp_test_UrbanServeDemoKey' : 'pk_test_UrbanServeStripeKey',
    };
  }

  // Verify payment outcome (BRULE-007)
  async verifyPayment(userId: string, data: {
    booking_id: string;
    gateway_transaction_id: string;
    payment_status: 'COMPLETED' | 'FAILED';
    payment_signature?: string;
  }) {
    const booking = memStore.bookings.find((b) => b.id === data.booking_id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    let payment = memStore.payments.find((p) => p.booking_id === booking.id);
    if (!payment) {
      payment = {
        id: randomUUID(),
        booking_id: booking.id,
        amount: booking.total_amount,
        currency: 'USD',
        payment_method: 'CARD',
        payment_gateway: 'RAZORPAY',
        gateway_transaction_id: data.gateway_transaction_id,
        payment_status: PaymentStatus.PENDING,
        payment_intent_id: data.gateway_transaction_id,
        paid_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      memStore.payments.push(payment);
    }

    if (data.payment_status === 'COMPLETED') {
      payment.payment_status = PaymentStatus.COMPLETED;
      payment.gateway_transaction_id = data.gateway_transaction_id;
      payment.paid_at = new Date();
      payment.updated_at = new Date();

      // Advance booking to CONFIRMED if pending
      if (booking.status === BookingStatus.PENDING) {
        booking.status = BookingStatus.CONFIRMED;
        booking.updated_at = new Date();

        memStore.booking_status_history.push({
          id: randomUUID(),
          booking_id: booking.id,
          status: BookingStatus.CONFIRMED,
          changed_by: userId,
          notes: `Payment verified via ${payment.payment_gateway} (Txn: ${data.gateway_transaction_id})`,
          created_at: new Date(),
        });
      }

      // Notify customer
      const cust = memStore.customer_profiles.find((c) => c.id === booking.customer_id);
      if (cust) {
        memStore.notifications.push({
          id: randomUUID(),
          user_id: cust.user_id,
          booking_id: booking.id,
          notification_type: 'PAYMENT_CONFIRMED',
          title: '💳 Payment Received!',
          message: `Your payment of $${booking.total_amount.toFixed(2)} for booking #${booking.booking_number} was successfully processed.`,
          channel: 'IN_APP',
          is_read: false,
          delivery_status: 'DELIVERED',
          sent_at: new Date(),
          created_at: new Date(),
        });
      }

      logger.info(`Payment verified for booking ${booking.id}: ${data.gateway_transaction_id}`);
      return { success: true, payment, booking };
    } else {
      payment.payment_status = PaymentStatus.FAILED;
      payment.updated_at = new Date();
      throw new AppError('Payment transaction verification failed', 400);
    }
  }

  // Get payment details for booking
  async getPaymentByBooking(bookingId: string) {
    const payment = memStore.payments.find((p) => p.booking_id === bookingId);
    if (!payment) {
      throw new AppError('No payment record found for this booking', 404);
    }
    return payment;
  }
}

export const paymentsService = new PaymentsService();
