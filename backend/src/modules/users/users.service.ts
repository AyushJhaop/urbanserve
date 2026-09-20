import { memStore } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { randomUUID } from 'crypto';

export class UsersService {
  // Get user profile (customer or professional)
  async getProfile(userId: string) {
    const user = memStore.users.find((u) => u.id === userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const role = memStore.roles.find((r) => r.id === user.role_id);
    const custProfile = memStore.customer_profiles.find((c) => c.user_id === userId);
    const addresses = memStore.addresses.filter((a) => a.user_id === userId);

    return {
      id: user.id,
      email: user.email,
      role: role ? role.name : 'CUSTOMER',
      first_name: custProfile?.first_name || 'User',
      last_name: custProfile?.last_name || '',
      phone: custProfile?.phone || '',
      profile_image_url: custProfile?.profile_image_url || null,
      addresses,
    };
  }

  // Update customer profile
  async updateProfile(userId: string, data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    profile_image_url?: string;
  }) {
    let cust = memStore.customer_profiles.find((c) => c.user_id === userId);
    if (!cust) {
      cust = {
        id: randomUUID(),
        user_id: userId,
        first_name: data.first_name || 'User',
        last_name: data.last_name || '',
        phone: data.phone || '',
        profile_image_url: data.profile_image_url || null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      memStore.customer_profiles.push(cust);
    } else {
      if (data.first_name) cust.first_name = data.first_name;
      if (data.last_name) cust.last_name = data.last_name;
      if (data.phone) cust.phone = data.phone;
      if (data.profile_image_url) cust.profile_image_url = data.profile_image_url;
      cust.updated_at = new Date();
    }

    return this.getProfile(userId);
  }

  // Get user addresses
  async getAddresses(userId: string) {
    return memStore.addresses.filter((a) => a.user_id === userId);
  }

  // Add new address
  async addAddress(userId: string, data: {
    address_type?: string;
    street_address: string;
    city: string;
    state?: string;
    postal_code: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    is_default?: boolean;
  }) {
    // If set as default, reset other addresses
    if (data.is_default) {
      memStore.addresses.forEach((a) => {
        if (a.user_id === userId) a.is_default = false;
      });
    }

    const newAddr = {
      id: randomUUID(),
      user_id: userId,
      address_type: data.address_type || 'HOME',
      street_address: data.street_address,
      city: data.city,
      state: data.state || 'IL',
      postal_code: data.postal_code,
      country: data.country || 'USA',
      latitude: data.latitude || 39.7817,
      longitude: data.longitude || -89.6501,
      is_default: !!data.is_default,
      created_at: new Date(),
      updated_at: new Date(),
    };

    memStore.addresses.push(newAddr);
    return newAddr;
  }
}

export const usersService = new UsersService();
