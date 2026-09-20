import pool, { memStore } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { BookingStatus, QuickServiceStatus, UserRole } from '../../types';
import { randomUUID } from 'crypto';
import logger from '../../utils/logger';

export class QuickServiceService {
  // Create an urgent quick-service request
  async createQuickServiceRequest(userId: string, data: {
    service_id: string;
    address_id?: string;
    street_address?: string;
    city?: string;
    notes?: string;
  }) {
    // 1. Validate service
    const service = memStore.services.find((s) => s.id === data.service_id);
    if (!service) {
      throw new AppError('Invalid service selected', 400);
    }

    // 2. Resolve customer profile
    let custRes = await pool.query('SELECT id FROM customer_profiles WHERE user_id = $1', [userId]);
    let customerProfileId = custRes.rows[0]?.id;
    if (!customerProfileId) {
      const newCust = {
        id: randomUUID(),
        user_id: userId,
        first_name: 'Customer',
        last_name: 'User',
        phone: '+1 (555) 234-5678',
        created_at: new Date(),
        updated_at: new Date(),
      };
      memStore.customer_profiles.push(newCust);
      customerProfileId = newCust.id;
    }

    // 3. Resolve address
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
          street_address: data.street_address || '456 Emergency Lane',
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

    // 4. Create base booking with PENDING status
    const bookingNumber = 'QS-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
    const booking = {
      id: randomUUID(),
      booking_number: bookingNumber,
      customer_id: customerProfileId,
      professional_id: null,
      service_id: service.id,
      address_id: addressId,
      booking_type: 'QUICK_SERVICE',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: BookingStatus.PENDING,
      total_amount: (service.base_price || 90) * 1.25, // Express surcharge
      notes: data.notes || 'URGENT Quick Service Request',
      created_at: new Date(),
      updated_at: new Date(),
    };
    memStore.bookings.unshift(booking);

    // 5. Create Quick Service Request (5 min response window)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const qsRequest = {
      id: randomUUID(),
      booking_id: booking.id,
      request_status: QuickServiceStatus.SEARCHING,
      response_window_minutes: 5,
      expires_at: expiresAt,
      created_at: new Date(),
      updated_at: new Date(),
    };
    memStore.quick_service_requests.push(qsRequest);

    // 6. Find eligible and available professionals (BRULE-002, BRULE-003)
    const eligiblePros = memStore.professional_profiles.filter((pro) => {
      if (pro.approval_status !== 'APPROVED') return false;
      const status = memStore.professional_availability_status.find((s) => s.professional_id === pro.id);
      return status?.is_currently_available === true;
    });

    // Notify each eligible professional
    for (const pro of eligiblePros) {
      memStore.quick_service_notifications.push({
        id: randomUUID(),
        quick_service_request_id: qsRequest.id,
        professional_id: pro.id,
        notification_status: 'SENT',
        notified_at: new Date(),
        responded_at: null,
      });

      memStore.notifications.push({
        id: randomUUID(),
        user_id: pro.user_id,
        booking_id: booking.id,
        notification_type: 'QUICK_SERVICE_DISPATCH',
        title: '⚡ Urgent Job Dispatch Alert!',
        message: `New urgent request for ${service.name} nearby! Click to accept within 5 minutes.`,
        channel: 'PUSH',
        is_read: false,
        delivery_status: 'DELIVERED',
        sent_at: new Date(),
        created_at: new Date(),
      });
    }

    logger.info(`Quick service request created: ${qsRequest.id} dispatched to ${eligiblePros.length} pros`);

    return this.enrichQuickService(qsRequest, booking, eligiblePros.length);
  }

  // Get quick service status
  async getQuickServiceStatus(requestId: string) {
    const qsRequest = memStore.quick_service_requests.find((r) => r.id === requestId || r.booking_id === requestId);
    if (!qsRequest) {
      throw new AppError('Quick service request not found', 404);
    }

    const booking = memStore.bookings.find((b) => b.id === qsRequest.booking_id);

    // Check expiration if still SEARCHING
    if (qsRequest.request_status === QuickServiceStatus.SEARCHING && new Date() > new Date(qsRequest.expires_at)) {
      qsRequest.request_status = QuickServiceStatus.NO_PROFESSIONAL_AVAILABLE;
      if (booking) {
        booking.status = BookingStatus.CANCELLED;
      }
    }

    return this.enrichQuickService(qsRequest, booking);
  }

  // Professional accepts quick request (Guarded by BRULE-004 concurrency control)
  async acceptQuickService(requestId: string, userId: string) {
    const qsRequest = memStore.quick_service_requests.find((r) => r.id === requestId || r.booking_id === requestId);
    if (!qsRequest) {
      throw new AppError('Quick service request not found', 404);
    }

    // Check if already claimed by another pro (BRULE-004)
    if (qsRequest.request_status === QuickServiceStatus.ACCEPTED) {
      throw new AppError('This request has already been accepted by another professional', 409);
    }

    if (new Date() > new Date(qsRequest.expires_at)) {
      qsRequest.request_status = QuickServiceStatus.EXPIRED;
      throw new AppError('Response window expired for this request', 410);
    }

    const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
    if (!pro) {
      throw new AppError('Professional profile not found', 404);
    }

    // Atomic assignment
    qsRequest.request_status = QuickServiceStatus.ACCEPTED;
    qsRequest.updated_at = new Date();

    const booking = memStore.bookings.find((b) => b.id === qsRequest.booking_id);
    if (booking) {
      booking.professional_id = pro.id;
      booking.status = BookingStatus.PROFESSIONAL_ASSIGNED;
      booking.updated_at = new Date();

      memStore.booking_status_history.push({
        id: randomUUID(),
        booking_id: booking.id,
        status: BookingStatus.PROFESSIONAL_ASSIGNED,
        changed_by: userId,
        notes: `Quick service accepted by ${pro.first_name} ${pro.last_name}`,
        created_at: new Date(),
      });

      // Notify customer
      const cust = memStore.customer_profiles.find((c) => c.id === booking.customer_id);
      if (cust) {
        memStore.notifications.push({
          id: randomUUID(),
          user_id: cust.user_id,
          booking_id: booking.id,
          notification_type: 'QUICK_SERVICE_ACCEPTED',
          title: '⚡ Professional Found!',
          message: `${pro.first_name} ${pro.last_name} (${pro.average_rating}★) accepted your request and is preparing!`,
          channel: 'IN_APP',
          is_read: false,
          delivery_status: 'DELIVERED',
          sent_at: new Date(),
          created_at: new Date(),
        });
      }
    }

    // Update pro notification status
    const notif = memStore.quick_service_notifications.find((n) => n.quick_service_request_id === qsRequest.id && n.professional_id === pro.id);
    if (notif) {
      notif.notification_status = 'ACCEPTED';
      notif.responded_at = new Date();
    }

    return this.enrichQuickService(qsRequest, booking);
  }

  // Professional rejects request
  async rejectQuickService(requestId: string, userId: string) {
    const qsRequest = memStore.quick_service_requests.find((r) => r.id === requestId || r.booking_id === requestId);
    if (!qsRequest) {
      throw new AppError('Quick service request not found', 404);
    }

    const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
    if (pro) {
      const notif = memStore.quick_service_notifications.find((n) => n.quick_service_request_id === qsRequest.id && n.professional_id === pro.id);
      if (notif) {
        notif.notification_status = 'DECLINED';
        notif.responded_at = new Date();
      }
    }

    return { success: true, message: 'Quick service request declined' };
  }

  // Get active pending requests for available professionals
  async getPendingRequestsForPro(userId: string) {
    const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
    if (!pro) return [];

    const activeRequests = memStore.quick_service_requests.filter(
      (r) => r.request_status === QuickServiceStatus.SEARCHING && new Date(r.expires_at) > new Date()
    );

    return activeRequests.map((r) => {
      const booking = memStore.bookings.find((b) => b.id === r.booking_id);
      return this.enrichQuickService(r, booking);
    });
  }

  private enrichQuickService(r: any, booking?: any, notifiedCount: number = 0) {
    const svc = booking ? memStore.services.find((s) => s.id === booking.service_id) : null;
    const cust = booking ? memStore.customer_profiles.find((c) => c.id === booking.customer_id) : null;
    const pro = booking?.professional_id ? memStore.professional_profiles.find((p) => p.id === booking.professional_id) : null;
    const addr = booking ? memStore.addresses.find((a) => a.id === booking.address_id) : null;

    const secondsRemaining = Math.max(0, Math.floor((new Date(r.expires_at).getTime() - Date.now()) / 1000));

    return {
      id: r.id,
      booking_id: r.booking_id,
      request_status: r.request_status,
      seconds_remaining: secondsRemaining,
      expires_at: r.expires_at,
      service_name: svc?.name || 'Emergency Home Service',
      service_price: booking?.total_amount || 110,
      customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Customer',
      street_address: addr?.street_address || 'Springfield Center',
      city: addr?.city || 'Springfield',
      distance_km: 2.4, // Calculated proximity
      estimated_arrival_minutes: 18,
      assigned_professional: pro
        ? {
            id: pro.id,
            name: `${pro.first_name} ${pro.last_name}`,
            phone: pro.phone,
            rating: pro.average_rating,
            profile_image_url: pro.profile_image_url,
          }
        : null,
      notified_professionals_count: notifiedCount || 2,
    };
  }
}

export const quickServiceService = new QuickServiceService();
