import { memStore } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { BookingStatus } from '../../types';
import { randomUUID } from 'crypto';

export class DisputesService {
  // Create a dispute
  async createDispute(userId: string, data: {
    booking_id: string;
    dispute_type: string;
    description: string;
  }) {
    const booking = memStore.bookings.find((b) => b.id === data.booking_id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const dispute = {
      id: randomUUID(),
      booking_id: booking.id,
      raised_by: userId,
      dispute_type: data.dispute_type || 'QUALITY_OF_SERVICE',
      description: data.description,
      status: 'OPEN',
      resolution: null,
      resolved_by: null,
      resolved_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    memStore.disputes.unshift(dispute);

    // Update booking status to DISPUTED if appropriate
    booking.status = BookingStatus.DISPUTED;
    booking.updated_at = new Date();

    memStore.booking_status_history.push({
      id: randomUUID(),
      booking_id: booking.id,
      status: BookingStatus.DISPUTED,
      changed_by: userId,
      notes: `Dispute opened: ${data.description}`,
      created_at: new Date(),
    });

    return this.enrichDispute(dispute);
  }

  // Get disputes (Admin sees all, user sees own)
  async getDisputes(userId: string, isAdmin: boolean) {
    let list = [...memStore.disputes];
    if (!isAdmin) {
      list = list.filter((d) => d.raised_by === userId);
    }
    return list.map((d) => this.enrichDispute(d));
  }

  // Update dispute resolution (Admin only)
  async resolveDispute(disputeId: string, adminUserId: string, data: {
    status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
    resolution: string;
  }) {
    const dispute = memStore.disputes.find((d) => d.id === disputeId);
    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    dispute.status = data.status;
    dispute.resolution = data.resolution;
    dispute.resolved_by = adminUserId;
    dispute.resolved_at = new Date();
    dispute.updated_at = new Date();

    return this.enrichDispute(dispute);
  }

  private enrichDispute(d: any) {
    const booking = memStore.bookings.find((b) => b.id === d.booking_id);
    const svc = booking ? memStore.services.find((s) => s.id === booking.service_id) : null;
    const user = memStore.users.find((u) => u.id === d.raised_by);
    return {
      ...d,
      booking_number: booking?.booking_number || 'N/A',
      service_name: svc?.name || 'Service',
      raised_by_email: user?.email || 'user@urbanserve.com',
    };
  }
}

export const disputesService = new DisputesService();
