import { memStore } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { randomUUID } from 'crypto';

export class AvailabilityService {
  // Get professional availability
  async getAvailability(userId: string) {
    const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
    if (!pro) {
      throw new AppError('Professional profile not found', 404);
    }

    let status = memStore.professional_availability_status.find((s) => s.professional_id === pro.id);
    if (!status) {
      status = {
        id: randomUUID(),
        professional_id: pro.id,
        is_currently_available: false,
        last_updated: new Date(),
      };
      memStore.professional_availability_status.push(status);
    }

    const weeklySchedule = memStore.professional_availability.filter((a) => a.professional_id === pro.id);

    return {
      is_currently_available: status.is_currently_available,
      last_updated: status.last_updated,
      schedule: weeklySchedule.length > 0 ? weeklySchedule : this.getDefaultWeeklySchedule(pro.id),
    };
  }

  // Toggle real-time availability (used for quick-service radar)
  async toggleCurrentAvailability(userId: string, isAvailable: boolean) {
    const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
    if (!pro) {
      throw new AppError('Professional profile not found', 404);
    }

    let status = memStore.professional_availability_status.find((s) => s.professional_id === pro.id);
    if (!status) {
      status = {
        id: randomUUID(),
        professional_id: pro.id,
        is_currently_available: isAvailable,
        last_updated: new Date(),
      };
      memStore.professional_availability_status.push(status);
    } else {
      status.is_currently_available = isAvailable;
      status.last_updated = new Date();
    }

    return {
      is_currently_available: status.is_currently_available,
      last_updated: status.last_updated,
    };
  }

  // Update weekly schedule windows
  async updateWeeklySchedule(userId: string, windows: Array<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }>) {
    const pro = memStore.professional_profiles.find((p) => p.user_id === userId);
    if (!pro) {
      throw new AppError('Professional profile not found', 404);
    }

    // Remove old windows
    memStore.professional_availability = memStore.professional_availability.filter((a) => a.professional_id !== pro.id);

    // Insert new
    for (const w of windows) {
      memStore.professional_availability.push({
        id: randomUUID(),
        professional_id: pro.id,
        day_of_week: w.day_of_week,
        start_time: w.start_time,
        end_time: w.end_time,
        is_available: w.is_available ?? true,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return this.getAvailability(userId);
  }

  private getDefaultWeeklySchedule(proId: string) {
    const defaultDays = [1, 2, 3, 4, 5]; // Mon - Fri
    return defaultDays.map((day) => ({
      id: randomUUID(),
      professional_id: proId,
      day_of_week: day,
      start_time: '09:00',
      end_time: '18:00',
      is_available: true,
    }));
  }
}

export const availabilityService = new AvailabilityService();
