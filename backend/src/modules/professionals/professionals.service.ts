import { memStore } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { randomUUID } from 'crypto';

export class ProfessionalsService {
  // Get professional profile
  async getProfile(userId: string) {
    const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
    if (!pro) {
      throw new AppError('Professional profile not found', 404);
    }

    const avail = memStore.professional_availability_status.find((s) => s.professional_id === pro.id);
    const docs = memStore.professional_documents.filter((d) => d.professional_id === pro.id);
    const services = memStore.professional_services
      .filter((ps) => ps.professional_id === pro.id)
      .map((ps) => memStore.services.find((s) => s.id === ps.service_id))
      .filter(Boolean);

    return {
      ...pro,
      is_currently_available: avail ? avail.is_currently_available : false,
      documents: docs,
      services,
    };
  }

  // Update professional profile
  async updateProfile(userId: string, data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    bio?: string;
    experience_years?: number;
    profile_image_url?: string;
  }) {
    const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
    if (!pro) {
      throw new AppError('Professional profile not found', 404);
    }

    if (data.first_name) pro.first_name = data.first_name;
    if (data.last_name) pro.last_name = data.last_name;
    if (data.phone) pro.phone = data.phone;
    if (data.bio !== undefined) pro.bio = data.bio;
    if (data.experience_years !== undefined) pro.experience_years = data.experience_years;
    if (data.profile_image_url) pro.profile_image_url = data.profile_image_url;
    pro.updated_at = new Date();

    return this.getProfile(userId);
  }

  // Upload verification document
  async uploadDocument(userId: string, data: { document_type: string; document_url: string }) {
    const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
    if (!pro) {
      throw new AppError('Professional profile not found', 404);
    }

    const newDoc = {
      id: randomUUID(),
      professional_id: pro.id,
      document_type: data.document_type || 'ID_VERIFICATION',
      document_url: data.document_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
      verification_status: 'PENDING',
      uploaded_at: new Date(),
    };

    memStore.professional_documents.push(newDoc);
    return newDoc;
  }

  // Get jobs assigned to this professional
  async getJobs(userId: string) {
    const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
    if (!pro) {
      throw new AppError('Professional profile not found', 404);
    }

    const jobs = memStore.bookings.filter((b) => b.professional_id === pro.id);

    return jobs.map((j) => {
      const svc = memStore.services.find((s) => s.id === j.service_id);
      const cust = memStore.customer_profiles.find((c) => c.id === j.customer_id);
      const addr = memStore.addresses.find((a) => a.id === j.address_id);
      return {
        ...j,
        service_name: svc?.name || 'Service',
        customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Customer',
        customer_phone: cust?.phone || '',
        street_address: addr?.street_address || 'Springfield',
        city: addr?.city || 'Springfield',
      };
    });
  }

  // Get earnings & payout history
  async getEarnings(userId: string) {
    const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
    if (!pro) {
      throw new AppError('Professional profile not found', 404);
    }

    const earnings = memStore.professional_earnings.filter((e) => e.professional_id === pro.id);
    const totalEarned = earnings.reduce((acc, e) => acc + (e.net_amount || 0), 0);
    const pendingPayout = earnings.filter((e) => e.payout_status === 'PENDING').reduce((acc, e) => acc + (e.net_amount || 0), 0);

    return {
      total_earned: totalEarned,
      pending_payout: pendingPayout,
      completed_jobs_count: pro.total_jobs_completed || earnings.length,
      average_rating: pro.average_rating || 5.0,
      total_reviews: pro.total_reviews || 0,
      transactions: earnings,
    };
  }
}

export const professionalsService = new ProfessionalsService();
