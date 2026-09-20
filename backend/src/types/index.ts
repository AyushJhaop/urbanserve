import { Request } from 'express';

// User Roles
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROFESSIONAL = 'PROFESSIONAL',
  ADMIN = 'ADMIN',
}

// Booking Status
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROFESSIONAL_ASSIGNED = 'PROFESSIONAL_ASSIGNED',
  PROFESSIONAL_ON_THE_WAY = 'PROFESSIONAL_ON_THE_WAY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

// Professional Approval Status
export enum ProfessionalApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

// Quick Service Request Status
export enum QuickServiceStatus {
  SEARCHING = 'SEARCHING',
  PROFESSIONAL_FOUND = 'PROFESSIONAL_FOUND',
  ACCEPTED = 'ACCEPTED',
  NO_PROFESSIONAL_AVAILABLE = 'NO_PROFESSIONAL_AVAILABLE',
  EXPIRED = 'EXPIRED',
}

// Notification Channel
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

// User interface
export interface IUser {
  id: string;
  email: string;
  password_hash: string;
  role_id: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

// Extended Request with authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    roleId: number;
  };
}

// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  roleId: number;
}

// API Response wrapper
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Pagination params
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// Service Filter params
export interface ServiceFilters {
  category_id?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  service_type?: 'SCHEDULED' | 'QUICK' | 'BOTH';
  search?: string;
}

// Booking creation data
export interface CreateBookingData {
  customer_id: string;
  service_id: string;
  address_id: string;
  booking_type: 'SCHEDULED' | 'QUICK_SERVICE';
  scheduled_date?: string;
  scheduled_time?: string;
  notes?: string;
}

// Professional registration data
export interface ProfessionalRegistrationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  bio?: string;
  experience_years?: number;
  service_ids: string[];
}
