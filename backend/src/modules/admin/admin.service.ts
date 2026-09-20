import { memStore } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import logger from '../../utils/logger';

export class AdminService {
  // Get platform analytics
  async getDashboardAnalytics() {
    const totalUsers = memStore.users.length;
    const totalBookings = memStore.bookings.length;
    const completedBookings = memStore.bookings.filter((b) => b.status === 'COMPLETED').length;
    const activeBookings = memStore.bookings.filter((b) => !['COMPLETED', 'CANCELLED'].includes(b.status)).length;
    const totalRevenue = memStore.payments.filter((p) => p.payment_status === 'COMPLETED').reduce((acc, p) => acc + (p.amount || 0), 0);
    const platformEarnings = totalRevenue * 0.15;
    const pendingPros = memStore.professional_profiles.filter((p) => p.approval_status === 'PENDING').length;
    const approvedPros = memStore.professional_profiles.filter((p) => p.approval_status === 'APPROVED').length;
    const openDisputes = memStore.disputes.filter((d) => d.status === 'OPEN').length;

    return {
      metrics: {
        total_users: totalUsers,
        total_bookings: totalBookings,
        active_bookings: activeBookings,
        completed_bookings: completedBookings,
        total_revenue: totalRevenue,
        platform_revenue: platformEarnings,
        pending_professional_approvals: pendingPros,
        active_professionals: approvedPros,
        open_disputes: openDisputes,
      },
      recent_bookings: memStore.bookings.slice(0, 5).map((b) => {
        const svc = memStore.services.find((s) => s.id === b.service_id);
        const cust = memStore.customer_profiles.find((c) => c.id === b.customer_id);
        return {
          id: b.id,
          booking_number: b.booking_number,
          service_name: svc?.name || 'Service',
          customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Customer',
          total_amount: b.total_amount,
          status: b.status,
          created_at: b.created_at,
        };
      }),
    };
  }

  // List all users
  async getUsers() {
    return memStore.users.map((u) => {
      const role = memStore.roles.find((r) => r.id === u.role_id);
      const cust = memStore.customer_profiles.find((c) => c.user_id === u.id);
      const pro = memStore.professional_profiles.find((p) => p.user_id === u.id);
      return {
        id: u.id,
        email: u.email,
        role: role?.name || 'CUSTOMER',
        first_name: cust?.first_name || pro?.first_name || 'User',
        last_name: cust?.last_name || pro?.last_name || '',
        phone: cust?.phone || pro?.phone || '',
        is_active: u.is_active,
        created_at: u.created_at,
      };
    });
  }

  // List professionals with documents for KYC review
  async getProfessionals(statusFilter?: string) {
    let pros = [...memStore.professional_profiles];
    if (statusFilter) {
      pros = pros.filter((p) => p.approval_status === statusFilter);
    }

    return pros.map((p) => {
      const user = memStore.users.find((u) => u.id === p.user_id);
      const docs = memStore.professional_documents.filter((d) => d.professional_id === p.id);
      const avail = memStore.professional_availability_status.find((s) => s.professional_id === p.id);
      return {
        ...p,
        email: user?.email,
        documents: docs,
        is_currently_available: avail?.is_currently_available || false,
      };
    });
  }

  // Approve professional registration (FR-ADM-003, BRULE-002)
  async approveProfessional(proId: string) {
    const pro = memStore.professional_profiles.find((p) => p.id === proId || p.user_id === proId);
    if (!pro) {
      throw new AppError('Professional profile not found', 404);
    }

    pro.approval_status = 'APPROVED';
    pro.updated_at = new Date();

    // Verify documents
    memStore.professional_documents.forEach((d) => {
      if (d.professional_id === pro.id) {
        d.verification_status = 'VERIFIED';
        d.verified_at = new Date();
      }
    });

    // Notify professional
    memStore.notifications.push({
      id: pro.id,
      user_id: pro.user_id,
      notification_type: 'PRO_APPROVED',
      title: '🎉 Professional Account Approved!',
      message: 'Congratulations! Your application has been approved by our admin team. You can now accept service bookings and earn money on UrbanServe.',
      channel: 'IN_APP',
      is_read: false,
      delivery_status: 'DELIVERED',
      sent_at: new Date(),
      created_at: new Date(),
    });

    logger.info(`Professional approved by admin: ${pro.id} (${pro.first_name} ${pro.last_name})`);

    return pro;
  }

  // Reject professional registration (FR-ADM-004)
  async rejectProfessional(proId: string, reason?: string) {
    const pro = memStore.professional_profiles.find((p) => p.id === proId || p.user_id === proId);
    if (!pro) {
      throw new AppError('Professional profile not found', 404);
    }

    pro.approval_status = 'REJECTED';
    pro.updated_at = new Date();

    // Notify professional
    memStore.notifications.push({
      id: pro.id,
      user_id: pro.user_id,
      notification_type: 'PRO_REJECTED',
      title: 'Application Update',
      message: `Your professional application was not approved. Reason: ${reason || 'Missing credentials or verification requirements.'}`,
      channel: 'IN_APP',
      is_read: false,
      delivery_status: 'DELIVERED',
      sent_at: new Date(),
      created_at: new Date(),
    });

    return pro;
  }
}

export const adminService = new AdminService();
