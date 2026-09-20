import apiClient from './client';

export interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  estimated_duration_minutes: number;
  service_type: 'SCHEDULED' | 'QUICK' | 'BOTH';
  category_name: string;
  category_id: number;
}

export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
}

export interface ServicesResponse {
  success: boolean;
  message: string;
  data: Service[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Get all service categories
export const getCategories = async (): Promise<ServiceCategory[]> => {
  const response = await apiClient.get('/services/categories');
  return response.data.data;
};

// Get all services with filters
export const getServices = async (params?: {
  page?: number;
  limit?: number;
  category_id?: number;
  service_type?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
}): Promise<ServicesResponse> => {
  const response = await apiClient.get('/services', { params });
  return response.data;
};

// Get service by ID
export const getServiceById = async (id: string): Promise<Service> => {
  const response = await apiClient.get(`/services/${id}`);
  return response.data.data;
};

// Get popular services
export const getPopularServices = async (limit: number = 10): Promise<Service[]> => {
  const response = await apiClient.get('/services/popular', { params: { limit } });
  return response.data.data;
};

// Search services
export const searchServices = async (query: string, page: number = 1): Promise<ServicesResponse> => {
  const response = await apiClient.get('/services/search', {
    params: { q: query, page },
  });
  return response.data;
};
