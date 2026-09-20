import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCustomerData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      first_name?: string;
      last_name?: string;
    };
    token: string;
    refreshToken: string;
  };
}

// Register as customer
export const registerCustomer = async (data: RegisterCustomerData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register/customer', data);
  return response.data;
};

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Get current user
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data.data;
};
