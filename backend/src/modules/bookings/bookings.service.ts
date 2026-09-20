import pool, { memStore } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { BookingStatus, UserRole } from '../../types';
import logger from '../../utils/logger';
import { randomUUID } from 'crypto';

export class BookingsService {
  // Validate allowed status transitions according to BRULE-008
  private isValidTransition(currentStatus: BookingStatus, nextStatus: BookingStatus): boolean {
    const transitions: Record<string, string[]> = {
      [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.PROFESSIONAL_ASSIGNED, BookingStatus.PROFESSIONAL_ON_THE_WAY, BookingStatus.CANCELLED],
      [BookingStatus.PROFESSIONAL_ASSIGNED]: [BookingStatus.PROFESSIONAL_ON_THE_WAY, BookingStatus.CANCELLED],
      [BookingStatus.PROFESSIONAL_ON_THE_WAY]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED, BookingStatus.DISPUTED],
      [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.DISPUTED],
      [BookingStatus.COMPLETED]: [BookingStatus.DISPUTED],
      [BookingStatus.CANCELLED]: [],
      [BookingStatus.DISPUTED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    };

    return (transitions[currentStatus] || []).includes(nextStatus);
  }

  // Create a new booking
  async createBooking(userId: string, data: {
    service_id: string;
    address_id?: string;
    street_address?: string;
    city?: string;
    booking_type: 'SCHEDULED' | 'QUICK_SERVICE';
    scheduled_date?: string;
    scheduled_time?: string;
    notes?: string;
    total_amount?: number;
  }) {
    // 1. Get customer profile
    let custRes = await pool.query('SELECT id FROM customer_profiles WHERE user_id = $1', [userId]);
    let customerProfileId = custRes.rows[0]?.id;

    if (!customerProfileId) {
      // Auto-create customer profile if missing
      const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
      const email = userRes.rows[0]?.email || 'customer@test.com';
      const namePart = email.split('@')[0];
      const newCust = {
        id: randomUUID(),
        user_id: userId,
        first_name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
        last_name: 'User',
        phone: '+1 (555) 000-1122',
        created_at: new Date(),
        updated_at: new Date(),
      };
      memStore.customer_profiles.push(newCust);
      customerProfileId = newCust.id;
    }

    // 2. Validate Service exists (BRULE-001)
    const serviceRes = await pool.query('SELECT * FROM services WHERE id = $1', [data.service_id]);
    const service = serviceRes.rows[0] || memStore.services.find((s) => s.id === data.service_id);
    if (!service) {
      throw new AppError('Invalid service selected', 400);
    }

    // 3. Resolve Address
    let addressId = data.address_id;
    if (!addressId) {
      const userAddr = memStore.addresses.find((a) => a.user_id === userId);
      if (userAddr) {
        addressId = userAddr.id;
      } else {
        const newAddr = {
          id: randomUUID(),
          user_id: userId,
          address_type: 'HOME',
          street_address: data.street_address || '123 Main Street',
          city: data.city || 'Springfield',
          state: 'IL',
          postal_code: '62701',
          country: 'USA',
          latitude: 39.7817,
          longitude: -89.6501,
          is_default: true,
          created_at: new Date(),
          updated_at: new Date(),
        };
        memStore.addresses.push(newAddr);
        addressId = newAddr.id;
      }
    }

    // 4. Auto-assign an eligible professional if scheduled or matching
    const approvedPros = memStore.professional_profiles.filter((p) => p.approval_status === 'APPROVED');
    const assignedPro = approvedPros.length > 0 ? approvedPros[0] : null;

    const bookingAmount = data.total_amount || service.base_price || 499.0;
    const bookingNumber = 'URS-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);

    const newBooking = {
      id: randomUUID(),
      booking_number: bookingNumber,
      customer_id: customerProfileId,
      professional_id: assignedPro ? assignedPro.id : null,
      service_id: service.id,
      address_id: addressId,
      booking_type: data.booking_type || 'SCHEDULED',
      scheduled_date: data.scheduled_date || new Date().toISOString().split('T')[0],
      scheduled_time: data.scheduled_time || '10:00',
      status: assignedPro ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
      total_amount: bookingAmount,
      notes: data.notes || '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    memStore.bookings.unshift(newBooking);

    // Add status history
    memStore.booking_status_history.push({
      id: randomUUID(),
      booking_id: newBooking.id,
      status: newBooking.status,
      changed_by: userId,
      notes: 'Initial booking created',
      created_at: new Date(),
    });

    // Notify customer
    memStore.notifications.push({
      id: randomUUID(),
      user_id: userId,
      booking_id: newBooking.id,
      notification_type: 'BOOKING_CREATED',
      title: 'Booking Confirmed!',
      message: `Your booking for ${service.name} (#${bookingNumber}) has been created successfully.`,
      channel: 'IN_APP',
      is_read: false,
      delivery_status: 'DELIVERED',
      sent_at: new Date(),
      created_at: new Date(),
    });

    logger.info(`Booking created successfully: ${bookingNumber}`);
    return this.enrichBooking(newBooking);
  }

  // Get all bookings with filtering & role scoping
  async getBookings(userId: string, role: UserRole, queryParams: any = {}) {
    let list = [...memStore.bookings];

    if (role === UserRole.CUSTOMER) {
      const cust = memStore.customer_profiles.find((c) => c.user_id === userId);
      const custId = cust ? cust.id : null;
      list = list.filter((b) => b.customer_id === custId);
    } else if (role === UserRole.PROFESSIONAL) {
      const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
      const proId = pro ? pro.id : null;
      list = list.filter((b) => b.professional_id === proId);
    }

    if (queryParams.status) {
      list = list.filter((b) => b.status === queryParams.status);
    }

    return list.map((b) => this.enrichBooking(b));
  }

  // Get single booking by ID
  async getBookingById(bookingId: string, userId: string, role: UserRole) {
    const booking = memStore.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Role-based authorization check
    if (role === UserRole.CUSTOMER) {
      const cust = memStore.customer_profiles.find((c) => c.user_id === userId);
      if (!cust || booking.customer_id !== cust.id) {
        throw new AppError('Unauthorized access to booking', 403);
      }
    } else if (role === UserRole.PROFESSIONAL) {
      const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
      if (!pro || booking.professional_id !== pro.id) {
        throw new AppError('Unauthorized access to booking', 403);
      }
    }

    return this.enrichBooking(booking);
  }

  // Update booking status with state machine validation (BRULE-008)
  async updateBookingStatus(bookingId: string, nextStatus: BookingStatus, userId: string, role: UserRole, notes?: string) {
    const booking = memStore.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const currentStatus = booking.status as BookingStatus;
    if (!this.isValidTransition(currentStatus, nextStatus) && role !== UserRole.ADMIN) {
      throw new AppError(`Invalid state transition from ${currentStatus} to ${nextStatus}`, 409);
    }

    booking.status = nextStatus;
    booking.updated_at = new Date();

    memStore.booking_status_history.push({
      id: randomUUID(),
      booking_id: booking.id,
      status: nextStatus,
      changed_by: userId,
      notes: notes || `Status advanced to ${nextStatus}`,
      created_at: new Date(),
    });

    // If completed, register pro earning if not already registered
    if (nextStatus === BookingStatus.COMPLETED && booking.professional_id) {
      const existingEarning = memStore.professional_earnings.find((e) => e.booking_id === booking.id);
      if (!existingEarning) {
        const platformFee = booking.total_amount * 0.15;
        memStore.professional_earnings.push({
          id: randomUUID(),
          professional_id: booking.professional_id,
          booking_id: booking.id,
          amount: booking.total_amount,
          platform_fee: platformFee,
          net_amount: booking.total_amount - platformFee,
          payout_status: 'COMPLETED',
          payout_date: new Date(),
          created_at: new Date(),
        });
      }

      // Update pro total completed jobs
      const pro = memStore.professional_profiles.find((p) => p.id === booking.professional_id);
      if (pro) {
        pro.total_jobs_completed = (pro.total_jobs_completed || 0) + 1;
      }
    }

    // Trigger customer notification
    const custProfile = memStore.customer_profiles.find((c) => c.id === booking.customer_id);
    if (custProfile) {
      memStore.notifications.push({
        id: randomUUID(),
        user_id: custProfile.user_id,
        booking_id: booking.id,
        notification_type: 'STATUS_CHANGE',
        title: `Booking Update: ${nextStatus.replace(/_/g, ' ')}`,
        message: `Your booking #${booking.booking_number} is now ${nextStatus.replace(/_/g, ' ')}.`,
        channel: 'IN_APP',
        is_read: false,
        delivery_status: 'DELIVERED',
        sent_at: new Date(),
        created_at: new Date(),
      });
    }

    return this.enrichBooking(booking);
  }

  // Cancel booking
  async cancelBooking(bookingId: string, userId: string, role: UserRole, reason?: string) {
    const booking = memStore.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    if (booking.status === BookingStatus.CANCELLED) {
      return this.enrichBooking(booking);
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new AppError('Completed bookings cannot be cancelled. You can raise a dispute if needed.', 400);
    }
    if (booking.status === BookingStatus.IN_PROGRESS) {
      throw new AppError('Service is currently in progress. Please contact support or your assigned professional.', 400);
    }

    // Process automatic refund simulation if payment was completed
    const payment = memStore.payments.find((p) => p.booking_id === booking.id);
    if (payment && payment.payment_status === 'COMPLETED') {
      payment.payment_status = 'REFUNDED';
    }

    return this.updateBookingStatus(bookingId, BookingStatus.CANCELLED, userId, role, reason || 'Cancelled by user');
  }

  // Reschedule booking
  async rescheduleBooking(bookingId: string, userId: string, role: UserRole, date: string, time: string) {
    const booking = memStore.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new AppError('Cannot reschedule completed or cancelled booking', 409);
    }

    booking.scheduled_date = date;
    booking.scheduled_time = time;
    booking.updated_at = new Date();

    memStore.booking_status_history.push({
      id: randomUUID(),
      booking_id: booking.id,
      status: booking.status,
      changed_by: userId,
      notes: `Rescheduled to ${date} at ${time}`,
      created_at: new Date(),
    });

    return this.enrichBooking(booking);
  }

  private enrichBooking(b: any) {
    const svc = memStore.services.find((s) => s.id === b.service_id);
    const cat = svc ? memStore.service_categories.find((c) => c.id === svc.category_id) : null;
    const cust = memStore.customer_profiles.find((c) => c.id === b.customer_id);
    const pro = memStore.professional_profiles.find((p) => p.id === b.professional_id);
    const addr = memStore.addresses.find((a) => a.id === b.address_id);
    const rev = memStore.reviews.find((r) => r.booking_id === b.id);
    const payment = memStore.payments.find((p) => p.booking_id === b.id);

    return {
      ...b,
      service_name: svc?.name || 'Service',
      category_name: cat?.name || 'Home Service',
      estimated_duration_minutes: svc?.estimated_duration_minutes || 60,
      customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Valued Customer',
      customer_phone: cust?.phone || '+1 (555) 012-3456',
      customer_image: cust?.profile_image_url || null,
      professional_name: pro ? `${pro.first_name} ${pro.last_name}` : 'Pending Assignment',
      professional_phone: pro?.phone || null,
      professional_rating: pro?.average_rating || 5.0,
      professional_image: pro?.profile_image_url || null,
      street_address: addr?.street_address || 'Springfield',
      city: addr?.city || 'Springfield',
      postal_code: addr?.postal_code || '62704',
      review: rev || null,
      payment: payment || null,
      history: memStore.booking_status_history.filter((h) => h.booking_id === b.id),
    };
  }
}

export const bookingsService = new BookingsService();
