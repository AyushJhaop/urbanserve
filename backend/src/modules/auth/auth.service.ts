import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';
import config from '../../config';
import { UserRole, JWTPayload } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import logger from '../../utils/logger';

export class AuthService {
  // Generate JWT token
  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
  }

  // Generate refresh token
  private generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as any,
    });
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Compare password
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Get role by name
  private async getRoleByName(roleName: string): Promise<number> {
    const result = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
    if (result.rows.length === 0) {
      throw new AppError('Role not found', 404);
    }
    return result.rows[0].id;
  }

  // Register customer
  async registerCustomer(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [
        data.email,
      ]);

      if (existingUser.rows.length > 0) {
        throw new AppError('User with this email already exists', 409);
      }

      // Get customer role ID
      const roleId = await this.getRoleByName('CUSTOMER');

      // Hash password
      const passwordHash = await this.hashPassword(data.password);

      // Create user
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id, email, role_id, created_at',
        [data.email, passwordHash, roleId]
      );

      const user = userResult.rows[0];

      // Create customer profile
      await client.query(
        'INSERT INTO customer_profiles (user_id, first_name, last_name, phone) VALUES ($1, $2, $3, $4)',
        [user.id, data.first_name, data.last_name, data.phone || null]
      );

      await client.query('COMMIT');

      // Generate tokens
      const tokenPayload: JWTPayload = {
        id: user.id,
        email: user.email,
        role: UserRole.CUSTOMER,
        roleId: user.role_id,
      };

      const token = this.generateToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      logger.info(`New customer registered: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: UserRole.CUSTOMER,
          first_name: data.first_name,
          last_name: data.last_name,
        },
        token,
        refreshToken,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Register professional
  async registerProfessional(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    bio?: string;
    experience_years?: number;
  }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [
        data.email,
      ]);

      if (existingUser.rows.length > 0) {
        throw new AppError('User with this email already exists', 409);
      }

      // Get professional role ID
      const roleId = await this.getRoleByName('PROFESSIONAL');

      // Hash password
      const passwordHash = await this.hashPassword(data.password);

      // Create user
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id, email, role_id, created_at',
        [data.email, passwordHash, roleId]
      );

      const user = userResult.rows[0];

      // Create professional profile with PENDING status
      await client.query(
        'INSERT INTO professional_profiles (user_id, first_name, last_name, phone, bio, experience_years, approval_status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          user.id,
          data.first_name,
          data.last_name,
          data.phone,
          data.bio || null,
          data.experience_years || 0,
          'PENDING',
        ]
      );

      // Create availability status entry
      await client.query(
        'INSERT INTO professional_availability_status (professional_id, is_currently_available) VALUES ((SELECT id FROM professional_profiles WHERE user_id = $1), false)',
        [user.id]
      );

      await client.query('COMMIT');

      // Generate tokens
      const tokenPayload: JWTPayload = {
        id: user.id,
        email: user.email,
        role: UserRole.PROFESSIONAL,
        roleId: user.role_id,
      };

      const token = this.generateToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      logger.info(`New professional registered: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: UserRole.PROFESSIONAL,
          first_name: data.first_name,
          last_name: data.last_name,
          approval_status: 'PENDING',
        },
        token,
        refreshToken,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Login
  async login(email: string, password: string) {
    // Get user with role information
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.role_id, u.is_active, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Get additional profile data based on role
    let profileData: any = {};

    if (user.role_name === 'CUSTOMER') {
      const customerProfile = await pool.query(
        'SELECT first_name, last_name, phone FROM customer_profiles WHERE user_id = $1',
        [user.id]
      );
      profileData = customerProfile.rows[0] || {};
    } else if (user.role_name === 'PROFESSIONAL') {
      const professionalProfile = await pool.query(
        'SELECT first_name, last_name, phone, approval_status FROM professional_profiles WHERE user_id = $1',
        [user.id]
      );
      profileData = professionalProfile.rows[0] || {};
    }

    // Generate tokens
    const tokenPayload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role_name as UserRole,
      roleId: user.role_id,
    };

    const token = this.generateToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    logger.info(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role_name,
        ...profileData,
      },
      token,
      refreshToken,
    };
  }

  // Login or Register with Google
  async loginWithGoogle(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    google_id?: string;
  }) {
    const email = (data.email || '').toLowerCase().trim();
    if (!email) {
      throw new AppError('Google email is required', 400);
    }

    // Check if user exists
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.role_id, u.is_active, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    let user: any;
    let roleName: string;
    let firstName = data.first_name || email.split('@')[0];
    let lastName = data.last_name || '';
    let avatarUrl = data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=059669&color=fff`;

    if (result.rows.length > 0) {
      user = result.rows[0];
      roleName = user.role_name;

      if (!user.is_active) {
        throw new AppError('Account is deactivated', 403);
      }

      if (roleName === 'CUSTOMER') {
        const custProf = await pool.query(
          'SELECT first_name, last_name, profile_image_url FROM customer_profiles WHERE user_id = $1',
          [user.id]
        );
        if (custProf.rows.length > 0) {
          firstName = custProf.rows[0].first_name || firstName;
          lastName = custProf.rows[0].last_name || lastName;
          if (custProf.rows[0].profile_image_url) {
            avatarUrl = custProf.rows[0].profile_image_url;
          }
        }
      }
    } else {
      // Create new user with Google credentials
      const roleId = await this.getRoleByName('CUSTOMER');
      const defaultHash = await this.hashPassword('GoogleOAuth2026@UrbanServe');

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const userInsert = await client.query(
          'INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id, email, role_id, created_at',
          [email, defaultHash, roleId]
        );
        user = userInsert.rows[0];
        roleName = 'CUSTOMER';

        await client.query(
          'INSERT INTO customer_profiles (user_id, first_name, last_name, phone) VALUES ($1, $2, $3, $4)',
          [user.id, firstName, lastName, null]
        );
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    const tokenPayload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: roleName as UserRole,
      roleId: user.role_id,
    };

    const token = this.generateToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    logger.info(`User authenticated via Google: ${user.email} (${roleName})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: roleName,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
      },
      token,
      refreshToken,
    };
  }

  // Refresh token
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JWTPayload;

      // Verify user still exists and is active
      const result = await pool.query(
        'SELECT id, email, role_id, is_active FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0 || !result.rows[0].is_active) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new tokens
      const tokenPayload: JWTPayload = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        roleId: decoded.roleId,
      };

      const newToken = this.generateToken(tokenPayload);
      const newRefreshToken = this.generateRefreshToken(tokenPayload);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', 401);
      }
      throw new AppError('Invalid refresh token', 401);
    }
  }

  // Logout (client-side token removal, but we can implement token blacklist if needed)
  async logout(userId: string) {
    logger.info(`User logged out: ${userId}`);
    return { message: 'Logged out successfully' };
  }
}

export default new AuthService();
