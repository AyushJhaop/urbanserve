import pool from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { ServiceFilters, PaginationParams } from '../../types';
import logger from '../../utils/logger';

export class ServicesService {
  // Get all service categories
  async getCategories() {
    const result = await pool.query(
      'SELECT id, name, description, icon_url FROM service_categories WHERE is_active = true ORDER BY name'
    );

    return result.rows;
  }

  // Get all services with optional filters
  async getServices(filters: Partial<ServiceFilters>, pagination: PaginationParams) {
    let query = `
      SELECT 
        s.id, s.name, s.description, s.base_price, s.estimated_duration_minutes,
        s.service_type, sc.name as category_name, sc.id as category_id
      FROM services s
      JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_active = true AND sc.is_active = true
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    // Apply filters
    if (filters.category_id) {
      paramCount++;
      query += ` AND s.category_id = $${paramCount}`;
      params.push(filters.category_id);
    }

    if (filters.service_type) {
      paramCount++;
      query += ` AND (s.service_type = $${paramCount} OR s.service_type = 'BOTH')`;
      params.push(filters.service_type);
    }

    if (filters.min_price !== undefined) {
      paramCount++;
      query += ` AND s.base_price >= $${paramCount}`;
      params.push(filters.min_price);
    }

    if (filters.max_price !== undefined) {
      paramCount++;
      query += ` AND s.base_price <= $${paramCount}`;
      params.push(filters.max_price);
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (s.name ILIKE $${paramCount} OR s.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    // Get total count
    const countQuery = query.replace(
      /SELECT.*FROM/s,
      'SELECT COUNT(*) as total FROM'
    );
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    paramCount++;
    query += ` ORDER BY s.name LIMIT $${paramCount}`;
    params.push(pagination.limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(pagination.offset);

    const result = await pool.query(query, params);

    return {
      services: result.rows,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  // Get service by ID with detailed information
  async getServiceById(serviceId: string) {
    const result = await pool.query(
      `SELECT 
        s.id, s.name, s.description, s.base_price, s.estimated_duration_minutes,
        s.service_type, s.created_at,
        sc.id as category_id, sc.name as category_name, sc.description as category_description,
        COUNT(DISTINCT ps.professional_id) as available_professionals,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as total_reviews
      FROM services s
      JOIN service_categories sc ON s.category_id = sc.id
      LEFT JOIN professional_services ps ON s.id = ps.service_id
      LEFT JOIN professional_profiles pp ON ps.professional_id = pp.id AND pp.approval_status = 'APPROVED'
      LEFT JOIN bookings b ON s.id = b.service_id AND b.status = 'COMPLETED'
      LEFT JOIN reviews r ON b.id = r.booking_id
      WHERE s.id = $1 AND s.is_active = true
      GROUP BY s.id, sc.id`,
      [serviceId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Service not found', 404);
    }

    return result.rows[0];
  }

  // Get professionals offering a specific service
  async getProfessionalsForService(serviceId: string, filters?: { latitude?: number; longitude?: number; radius?: number }) {
    let query = `
      SELECT 
        pp.id, pp.first_name, pp.last_name, pp.bio, pp.experience_years,
        pp.average_rating, pp.total_reviews, pp.total_jobs_completed,
        pas.is_currently_available
      FROM professional_profiles pp
      JOIN professional_services ps ON pp.id = ps.professional_id
      LEFT JOIN professional_availability_status pas ON pp.id = pas.professional_id
      WHERE ps.service_id = $1 
        AND pp.approval_status = 'APPROVED'
        AND pp.user_id IN (SELECT id FROM users WHERE is_active = true)
    `;

    const params: any[] = [serviceId];

    // TODO: Add location-based filtering when location data is available

    query += ' ORDER BY pp.average_rating DESC, pp.total_jobs_completed DESC';

    const result = await pool.query(query, params);

    return result.rows;
  }

  // Search services
  async searchServices(searchTerm: string, pagination: PaginationParams) {
    const query = `
      SELECT 
        s.id, s.name, s.description, s.base_price, s.estimated_duration_minutes,
        s.service_type, sc.name as category_name
      FROM services s
      JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_active = true 
        AND (
          s.name ILIKE $1 
          OR s.description ILIKE $1 
          OR sc.name ILIKE $1
        )
      ORDER BY 
        CASE 
          WHEN s.name ILIKE $1 THEN 1
          WHEN sc.name ILIKE $1 THEN 2
          ELSE 3
        END,
        s.name
      LIMIT $2 OFFSET $3
    `;

    const searchPattern = `%${searchTerm}%`;
    const result = await pool.query(query, [
      searchPattern,
      pagination.limit,
      pagination.offset,
    ]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM services s
      JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_active = true 
        AND (s.name ILIKE $1 OR s.description ILIKE $1 OR sc.name ILIKE $1)
    `;
    const countResult = await pool.query(countQuery, [searchPattern]);
    const total = parseInt(countResult.rows[0].total);

    return {
      services: result.rows,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  // Get popular services
  async getPopularServices(limit: number = 10) {
    const result = await pool.query(
      `SELECT 
        s.id, s.name, s.description, s.base_price, s.service_type,
        sc.name as category_name,
        COUNT(b.id) as booking_count,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM services s
      JOIN service_categories sc ON s.category_id = sc.id
      LEFT JOIN bookings b ON s.id = b.service_id
      LEFT JOIN reviews r ON b.id = r.booking_id
      WHERE s.is_active = true
      GROUP BY s.id, sc.name
      ORDER BY booking_count DESC, average_rating DESC
      LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
}

export default new ServicesService();
