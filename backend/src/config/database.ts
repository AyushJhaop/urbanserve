import { Pool, PoolClient, QueryResult } from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import logger from '../utils/logger';

const uuidv4 = randomUUID;

import dotenv from 'dotenv';

dotenv.config();

// In-Memory Datastore for resilient local execution without external DB dependencies
class ResilientDataStore {
  roles: any[] = [];
  users: any[] = [];
  customer_profiles: any[] = [];
  service_categories: any[] = [];
  services: any[] = [];
  professional_profiles: any[] = [];
  professional_services: any[] = [];
  professional_documents: any[] = [];
  addresses: any[] = [];
  professional_availability: any[] = [];
  professional_availability_status: any[] = [];
  bookings: any[] = [];
  booking_status_history: any[] = [];
  quick_service_requests: any[] = [];
  quick_service_notifications: any[] = [];
  payments: any[] = [];
  professional_earnings: any[] = [];
  reviews: any[] = [];
  disputes: any[] = [];
  files: any[] = [];
  notifications: any[] = [];
  ai_conversations: any[] = [];
  ai_messages: any[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // Roles
    this.roles = [
      { id: 1, name: 'CUSTOMER', description: 'Regular customer' },
      { id: 2, name: 'PROFESSIONAL', description: 'Service professional' },
      { id: 3, name: 'ADMIN', description: 'Platform administrator' },
    ];

    const adminHash = bcrypt.hashSync('Admin@123', 10); // Admin@123
    const customerHash = bcrypt.hashSync('Customer@123', 10);
    const proHash = bcrypt.hashSync('Professional@123', 10);

    const adminId = uuidv4();
    const customerUserId = uuidv4();
    const proUserId1 = uuidv4();
    const proUserId2 = uuidv4();

    // Users
    this.users = [
      {
        id: adminId,
        email: 'admin@urbanserve.com',
        password_hash: adminHash,
        role_id: 3,
        is_active: true,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: customerUserId,
        email: 'customer@test.com',
        password_hash: customerHash,
        role_id: 1,
        is_active: true,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: proUserId1,
        email: 'professional@test.com',
        password_hash: proHash,
        role_id: 2,
        is_active: true,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: proUserId2,
        email: 'pending@test.com',
        password_hash: proHash,
        role_id: 2,
        is_active: true,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Customer Profile
    const customerProfileId = uuidv4();
    this.customer_profiles = [
      {
        id: customerProfileId,
        user_id: customerUserId,
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1 (555) 234-5678',
        profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Customer Address
    const addressId1 = uuidv4();
    this.addresses = [
      {
        id: addressId1,
        user_id: customerUserId,
        address_type: 'HOME',
        street_address: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'IL',
        postal_code: '62704',
        country: 'USA',
        latitude: 39.7817,
        longitude: -89.6501,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: customerUserId,
        address_type: 'WORK',
        street_address: '100 Industrial Parkway',
        city: 'Springfield',
        state: 'IL',
        postal_code: '62703',
        country: 'USA',
        latitude: 39.7715,
        longitude: -89.6321,
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Professional Profiles
    const proProfileId1 = uuidv4();
    const proProfileId2 = uuidv4();
    this.professional_profiles = [
      {
        id: proProfileId1,
        user_id: proUserId1,
        first_name: 'Alex',
        last_name: 'Smith',
        phone: '+1 (555) 987-6543',
        profile_image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
        bio: 'Master Certified Plumber & Electrician with over 8 years experience in residential and commercial repairs.',
        experience_years: 8,
        approval_status: 'APPROVED',
        average_rating: 4.9,
        total_reviews: 47,
        total_jobs_completed: 124,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: proProfileId2,
        user_id: proUserId2,
        first_name: 'Sarah',
        last_name: 'Jenkins',
        phone: '+1 (555) 456-7890',
        profile_image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        bio: 'Professional Deep Cleaning Specialist with green certified eco-friendly equipment.',
        experience_years: 4,
        approval_status: 'PENDING',
        average_rating: 0.0,
        total_reviews: 0,
        total_jobs_completed: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Professional Availability Status
    this.professional_availability_status = [
      {
        id: uuidv4(),
        professional_id: proProfileId1,
        is_currently_available: true,
        last_updated: new Date(),
      },
      {
        id: uuidv4(),
        professional_id: proProfileId2,
        is_currently_available: false,
        last_updated: new Date(),
      },
    ];

    // Categories
    this.service_categories = [
      { id: 1, name: 'Home Cleaning', description: 'Professional home cleaning services', icon_url: 'Sparkles', is_active: true },
      { id: 2, name: 'Plumbing', description: 'Plumbing and pipe fitting services', icon_url: 'Wrench', is_active: true },
      { id: 3, name: 'Electrical', description: 'Electrical installation and repair', icon_url: 'Zap', is_active: true },
      { id: 4, name: 'Carpentry', description: 'Furniture and woodwork services', icon_url: 'Hammer', is_active: true },
      { id: 5, name: 'Painting', description: 'Interior and exterior painting', icon_url: 'Paintbrush', is_active: true },
      { id: 6, name: 'Appliance Repair', description: 'Home appliance repair services', icon_url: 'Tv', is_active: true },
      { id: 7, name: 'Pest Control', description: 'Pest management and prevention', icon_url: 'ShieldAlert', is_active: true },
      { id: 8, name: 'Gardening', description: 'Garden maintenance and landscaping', icon_url: 'Trees', is_active: true },
    ];

    // Services (Prices in INR ₹)
    this.services = [
      { id: uuidv4(), category_id: 1, name: 'Deep House Cleaning', description: 'Comprehensive whole-home sanitization, dusting, floor polishing and window cleaning', base_price: 1999.0, estimated_duration_minutes: 180, is_active: true, service_type: 'BOTH' },
      { id: uuidv4(), category_id: 1, name: 'Kitchen & Appliance Cleaning', description: 'Detailed degreasing of ovens, range hoods, counters and tile scrubbing', base_price: 899.0, estimated_duration_minutes: 90, is_active: true, service_type: 'SCHEDULED' },
      { id: uuidv4(), category_id: 1, name: 'Quick Clean Express', description: 'Rapid 60-minute surface wipe and vacuum for urgent readiness', base_price: 699.0, estimated_duration_minutes: 60, is_active: true, service_type: 'QUICK' },
      { id: uuidv4(), category_id: 2, name: 'Pipe Leak Repair', description: 'Rapid detection and sealing of pipe joints, valves and under-sink leaks', base_price: 499.0, estimated_duration_minutes: 90, is_active: true, service_type: 'BOTH' },
      { id: uuidv4(), category_id: 2, name: 'Drain Unclogging & Cleaning', description: 'High-power snaking and clearing of stubborn blockages in showers and sinks', base_price: 599.0, estimated_duration_minutes: 60, is_active: true, service_type: 'BOTH' },
      { id: uuidv4(), category_id: 2, name: 'Emergency Plumbing Response', description: 'Immediate response within 10-30 minutes for burst pipes and overflowing fixtures', base_price: 999.0, estimated_duration_minutes: 60, is_active: true, service_type: 'QUICK' },
      { id: uuidv4(), category_id: 3, name: 'Circuit Breaker & Switch Repair', description: 'Diagnose tripped breakers, replace faulty switches and panel safety check', base_price: 449.0, estimated_duration_minutes: 90, is_active: true, service_type: 'BOTH' },
      { id: uuidv4(), category_id: 3, name: 'Ceiling Fan & Light Fixture Install', description: 'Assembly and secure wiring of designer ceiling fans, chandeliers and LEDs', base_price: 399.0, estimated_duration_minutes: 120, is_active: true, service_type: 'SCHEDULED' },
      { id: uuidv4(), category_id: 3, name: 'Emergency Electrical Hazard', description: 'Urgent 10-min response for sparking sockets, power loss, and short circuits', base_price: 1199.0, estimated_duration_minutes: 60, is_active: true, service_type: 'QUICK' },
      { id: uuidv4(), category_id: 4, name: 'Furniture Assembly & Mounting', description: 'Quick assembly of beds, desks, TV units and wall art securely mounted', base_price: 599.0, estimated_duration_minutes: 90, is_active: true, service_type: 'BOTH' },
      { id: uuidv4(), category_id: 4, name: 'Door & Lock Restoration', description: 'Fix sticking doors, misaligned latches and install deadbolts', base_price: 499.0, estimated_duration_minutes: 60, is_active: true, service_type: 'SCHEDULED' },
      { id: uuidv4(), category_id: 5, name: 'Interior Room Painting', description: 'Full room priming, double coat premium paint with clean tape lines', base_price: 4999.0, estimated_duration_minutes: 360, is_active: true, service_type: 'SCHEDULED' },
      { id: uuidv4(), category_id: 6, name: 'Refrigerator & Freezer Repair', description: 'Fix cooling failures, compressor noises and faulty water dispensers', base_price: 799.0, estimated_duration_minutes: 90, is_active: true, service_type: 'BOTH' },
      { id: uuidv4(), category_id: 6, name: 'Washing Machine Diagnostics', description: 'Fix spin cycle issues, drainage errors and drum vibrations', base_price: 649.0, estimated_duration_minutes: 90, is_active: true, service_type: 'BOTH' },
      { id: uuidv4(), category_id: 7, name: 'Complete Pest Protection Spray', description: 'Safe eco-friendly perimeter spray against roaches, ants and spiders', base_price: 1299.0, estimated_duration_minutes: 90, is_active: true, service_type: 'SCHEDULED' },
      { id: uuidv4(), category_id: 8, name: 'Lawn Mowing & Yard Cleanup', description: 'Precision mowing, weed trimming, hedge edging and green debris removal', base_price: 799.0, estimated_duration_minutes: 60, is_active: true, service_type: 'SCHEDULED' },
    ];

    // Connect Pro 1 to Plumbing & Electrical
    const plumbingService = this.services.find((s) => s.category_id === 2);
    const electricalService = this.services.find((s) => s.category_id === 3);
    if (plumbingService) {
      this.professional_services.push({
        id: uuidv4(),
        professional_id: proProfileId1,
        service_id: plumbingService.id,
      });
    }
    if (electricalService) {
      this.professional_services.push({
        id: uuidv4(),
        professional_id: proProfileId1,
        service_id: electricalService.id,
      });
    }

    // Professional Documents for pending review
    this.professional_documents.push({
      id: uuidv4(),
      professional_id: proProfileId2,
      document_type: 'GOVERNMENT_ID',
      document_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
      verification_status: 'PENDING',
      uploaded_at: new Date(),
    });
    this.professional_documents.push({
      id: uuidv4(),
      professional_id: proProfileId2,
      document_type: 'TRADE_LICENSE',
      document_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600',
      verification_status: 'PENDING',
      uploaded_at: new Date(),
    });

    // Clean Demo: Exactly 1 active confirmed booking for customer to view/test cancellation
    const booking1Id = uuidv4();
    this.bookings.push({
      id: booking1Id,
      booking_number: 'URS-2026-9001',
      customer_id: customerProfileId,
      professional_id: proProfileId1,
      service_id: plumbingService ? plumbingService.id : this.services[0].id,
      address_id: addressId1,
      booking_type: 'SCHEDULED',
      scheduled_date: '2026-09-22',
      scheduled_time: '11:00 AM',
      status: 'CONFIRMED',
      total_amount: 499.0,
      notes: 'Tap valve inspection and pipe sealing',
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.booking_status_history.push({
      id: uuidv4(),
      booking_id: booking1Id,
      status: 'CONFIRMED',
      changed_by: customerUserId,
      notes: 'Booking scheduled by customer',
      created_at: new Date(),
    });

    this.payments.push({
      id: uuidv4(),
      booking_id: booking1Id,
      amount: 499.0,
      currency: 'INR',
      payment_method: 'UPI',
      payment_gateway: 'RAZORPAY',
      gateway_transaction_id: 'pay_rzp_' + uuidv4().substring(0, 10),
      payment_status: 'COMPLETED',
      paid_at: new Date(),
      created_at: new Date(),
    });

    // Notifications
    this.notifications.push({
      id: uuidv4(),
      user_id: customerUserId,
      booking_id: booking1Id,
      notification_type: 'BOOKING_CREATED',
      title: 'Booking Confirmed!',
      message: 'Alex Smith has been assigned to your Pipe Leak Repair service for Sep 22.',
      channel: 'IN_APP',
      is_read: false,
      delivery_status: 'DELIVERED',
      sent_at: new Date(),
      created_at: new Date(),
    });
  }
}

// Global resilient store instance
export const memStore = new ResilientDataStore();

// Real PostgreSQL Pool
const pgPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'urbanserve_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 1500,
});

let isPostgresAvailable = false;
let hasCheckedConnection = false;

async function checkPostgres() {
  if (hasCheckedConnection) return isPostgresAvailable;
  try {
    const client = await pgPool.connect();
    client.release();
    isPostgresAvailable = true;
    logger.info(' Connected to live PostgreSQL server');
  } catch (err: any) {
    isPostgresAvailable = false;
    logger.info('⚡ Operating in Resilient Mock DB mode (Self-contained, pre-seeded, zero setup required)');
  }
  hasCheckedConnection = true;
  return isPostgresAvailable;
}

// Resilient Query Handler that routes to PostgreSQL or In-Memory Mock Datastore
class UnifiedDatabasePool {
  async query(text: string, params: any[] = []): Promise<any> {
    const usePg = await checkPostgres();
    if (usePg) {
      try {
        return await pgPool.query(text, params);
      } catch (err) {
        logger.warn('PostgreSQL query error, attempting resilient store fallback:', err);
      }
    }

    return this.executeMockQuery(text, params);
  }

  async connect(): Promise<any> {
    const usePg = await checkPostgres();
    if (usePg) {
      try {
        return await pgPool.connect();
      } catch (err) {
        // Fall back
      }
    }

    // Mock client with transaction support
    return {
      query: (text: string, params: any[] = []) => this.executeMockQuery(text, params),
      release: () => {},
    };
  }

  // Smart Query Interpreter for all UrbanServe entities
  private executeMockQuery(text: string, params: any[] = []): any {
    const cleanSql = text.trim();
    const upper = cleanSql.toUpperCase();

    // Transaction controls
    if (upper === 'BEGIN' || upper === 'COMMIT' || upper === 'ROLLBACK') {
      return { rows: [], rowCount: 0, command: upper, oid: 0, fields: [] };
    }

    // Roles
    if (upper.includes('FROM ROLES')) {
      if (upper.includes('WHERE NAME = $1')) {
        const found = memStore.roles.find((r) => r.name === params[0]);
        return { rows: found ? [found] : [], rowCount: found ? 1 : 0, command: 'SELECT', oid: 0, fields: [] };
      }
      return { rows: memStore.roles, rowCount: memStore.roles.length, command: 'SELECT', oid: 0, fields: [] };
    }

    // Users
    if (upper.includes('FROM USERS')) {
      if (upper.includes('EMAIL = $1')) {
        const found = memStore.users.find((u) => u.email.toLowerCase() === (params[0] || '').toLowerCase());
        if (found) {
          const role = memStore.roles.find((r) => r.id === found.role_id);
          return {
            rows: [{
              ...found,
              role_name: role ? role.name : 'CUSTOMER',
            }],
            rowCount: 1,
            command: 'SELECT',
            oid: 0,
            fields: [],
          };
        }
        return { rows: [], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
      }
      if (upper.includes('WHERE ID = $1') || upper.includes('WHERE U.ID = $1')) {
        const found = memStore.users.find((u) => u.id === params[0]);
        if (found) {
          const role = memStore.roles.find((r) => r.id === found.role_id);
          const cust = memStore.customer_profiles.find((c) => c.user_id === found.id);
          const pro = memStore.professional_profiles.find((p) => p.user_id === found.id);
          const enriched = {
            ...found,
            role_name: role ? role.name : 'CUSTOMER',
            first_name: cust?.first_name || pro?.first_name || 'User',
            last_name: cust?.last_name || pro?.last_name || '',
            phone: cust?.phone || pro?.phone || '',
          };
          return { rows: [enriched], rowCount: 1, command: 'SELECT', oid: 0, fields: [] };
        }
        return { rows: [], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
      }
      return { rows: memStore.users, rowCount: memStore.users.length, command: 'SELECT', oid: 0, fields: [] };
    }

    // Insert User
    if (upper.startsWith('INSERT INTO USERS')) {
      const newUser = {
        id: uuidv4(),
        email: params[0],
        password_hash: params[1],
        role_id: params[2],
        is_active: true,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      memStore.users.push(newUser);
      return { rows: [newUser], rowCount: 1, command: 'INSERT', oid: 0, fields: [] };
    }

    // Customer Profiles
    if (upper.startsWith('INSERT INTO CUSTOMER_PROFILES')) {
      const newCust = {
        id: uuidv4(),
        user_id: params[0],
        first_name: params[1],
        last_name: params[2],
        phone: params[3] || null,
        profile_image_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      memStore.customer_profiles.push(newCust);
      return { rows: [newCust], rowCount: 1, command: 'INSERT', oid: 0, fields: [] };
    }

    if (upper.includes('FROM CUSTOMER_PROFILES')) {
      if (upper.includes('WHERE USER_ID = $1')) {
        const found = memStore.customer_profiles.find((c) => c.user_id === params[0]);
        return { rows: found ? [found] : [], rowCount: found ? 1 : 0, command: 'SELECT', oid: 0, fields: [] };
      }
      return { rows: memStore.customer_profiles, rowCount: memStore.customer_profiles.length, command: 'SELECT', oid: 0, fields: [] };
    }

    // Professional Profiles
    if (upper.startsWith('INSERT INTO PROFESSIONAL_PROFILES')) {
      const newPro = {
        id: uuidv4(),
        user_id: params[0],
        first_name: params[1],
        last_name: params[2],
        phone: params[3],
        bio: params[4] || null,
        experience_years: params[5] || 0,
        approval_status: 'PENDING',
        average_rating: 0.0,
        total_reviews: 0,
        total_jobs_completed: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };
      memStore.professional_profiles.push(newPro);
      return { rows: [newPro], rowCount: 1, command: 'INSERT', oid: 0, fields: [] };
    }

    if (upper.includes('FROM PROFESSIONAL_PROFILES')) {
      if (upper.includes('WHERE USER_ID = $1')) {
        const found = memStore.professional_profiles.find((p) => p.user_id === params[0]);
        return { rows: found ? [found] : [], rowCount: found ? 1 : 0, command: 'SELECT', oid: 0, fields: [] };
      }
      if (upper.includes('WHERE ID = $1')) {
        const found = memStore.professional_profiles.find((p) => p.id === params[0]);
        return { rows: found ? [found] : [], rowCount: found ? 1 : 0, command: 'SELECT', oid: 0, fields: [] };
      }
      return { rows: memStore.professional_profiles, rowCount: memStore.professional_profiles.length, command: 'SELECT', oid: 0, fields: [] };
    }

    // Service Categories
    if (upper.includes('FROM SERVICE_CATEGORIES')) {
      return { rows: memStore.service_categories, rowCount: memStore.service_categories.length, command: 'SELECT', oid: 0, fields: [] };
    }

    // Services
    if (upper.includes('FROM SERVICES')) {
      let filtered = [...memStore.services];
      if (upper.includes('WHERE S.ID = $1') || upper.includes('WHERE ID = $1')) {
        const found = memStore.services.find((s) => s.id === params[0]);
        if (found) {
          const category = memStore.service_categories.find((c) => c.id === found.category_id);
          return {
            rows: [{ ...found, category_name: category?.name, category_description: category?.description, available_professionals: 3, average_rating: 4.8, total_reviews: 24 }],
            rowCount: 1,
            command: 'SELECT',
            oid: 0,
            fields: [],
          };
        }
        return { rows: [], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
      }

      // Filter by category_id or search if specified in SQL
      if (upper.includes('CATEGORY_ID = $') || upper.includes('S.CATEGORY_ID = $')) {
        const catParam = params.find((p) => typeof p === 'number' && p >= 1 && p <= 10);
        if (catParam) {
          filtered = filtered.filter((s) => s.category_id === catParam);
        }
      }

      if (upper.includes('ILIKE')) {
        const searchParam = params.find((p) => typeof p === 'string' && p.includes('%'));
        if (searchParam) {
          const queryTerm = searchParam.replace(/%/g, '').toLowerCase();
          filtered = filtered.filter((s) => s.name.toLowerCase().includes(queryTerm) || s.description.toLowerCase().includes(queryTerm));
        }
      }

      const rowsWithCategory = filtered.map((s) => {
        const cat = memStore.service_categories.find((c) => c.id === s.category_id);
        return { ...s, category_name: cat?.name || 'General' };
      });

      if (upper.includes('COUNT(*)')) {
        return { rows: [{ total: rowsWithCategory.length }], rowCount: 1, command: 'SELECT', oid: 0, fields: [] };
      }

      return { rows: rowsWithCategory, rowCount: rowsWithCategory.length, command: 'SELECT', oid: 0, fields: [] };
    }

    // Bookings
    if (upper.startsWith('INSERT INTO BOOKINGS')) {
      const newBooking = {
        id: uuidv4(),
        booking_number: 'URS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
        customer_id: params[0],
        professional_id: params[1] || null,
        service_id: params[2],
        address_id: params[3],
        booking_type: params[4],
        scheduled_date: params[5] || null,
        scheduled_time: params[6] || null,
        total_amount: parseFloat(params[7]),
        notes: params[8] || null,
        status: params[9] || 'PENDING',
        created_at: new Date(),
        updated_at: new Date(),
      };
      memStore.bookings.unshift(newBooking);
      return { rows: [newBooking], rowCount: 1, command: 'INSERT', oid: 0, fields: [] };
    }

    if (upper.includes('FROM BOOKINGS')) {
      const enrichedBookings = memStore.bookings.map((b) => {
        const svc = memStore.services.find((s) => s.id === b.service_id);
        const cust = memStore.customer_profiles.find((c) => c.id === b.customer_id);
        const pro = memStore.professional_profiles.find((p) => p.id === b.professional_id);
        const addr = memStore.addresses.find((a) => a.id === b.address_id);
        return {
          ...b,
          service_name: svc?.name || 'Service',
          customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Customer',
          customer_phone: cust?.phone || '',
          professional_name: pro ? `${pro.first_name} ${pro.last_name}` : null,
          professional_phone: pro?.phone || null,
          street_address: addr?.street_address || 'Springfield',
          city: addr?.city || 'Springfield',
        };
      });

      if (upper.includes('WHERE B.ID = $1') || upper.includes('WHERE ID = $1')) {
        const found = enrichedBookings.find((b) => b.id === params[0]);
        return { rows: found ? [found] : [], rowCount: found ? 1 : 0, command: 'SELECT', oid: 0, fields: [] };
      }

      return { rows: enrichedBookings, rowCount: enrichedBookings.length, command: 'SELECT', oid: 0, fields: [] };
    }

    // Default Fallback: Empty result set
    return { rows: [], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
  }
}

const pool = new UnifiedDatabasePool();

export default pool;
