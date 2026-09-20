-- UrbanServe Database Schema
-- PostgreSQL Schema following SRS v1.0 data requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL CHECK (name IN ('CUSTOMER', 'PROFESSIONAL', 'ADMIN')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (Core Identity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer Profiles
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Categories
CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id INTEGER REFERENCES service_categories(id) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2),
    estimated_duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    service_type VARCHAR(50) CHECK (service_type IN ('SCHEDULED', 'QUICK', 'BOTH')) DEFAULT 'BOTH',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Professional Profiles
CREATE TABLE professional_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    profile_image_url TEXT,
    bio TEXT,
    experience_years INTEGER,
    approval_status VARCHAR(50) CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')) DEFAULT 'PENDING',
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_jobs_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Professional Services (Many-to-Many)
CREATE TABLE professional_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(professional_id, service_id)
);

-- Professional Documents
CREATE TABLE professional_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_url TEXT NOT NULL,
    verification_status VARCHAR(50) CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')) DEFAULT 'PENDING',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- Addresses
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    address_type VARCHAR(50) CHECK (address_type IN ('HOME', 'WORK', 'OTHER')) DEFAULT 'HOME',
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Professional Availability
CREATE TABLE professional_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Professional Availability Status
CREATE TABLE professional_availability_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    is_currently_available BOOLEAN DEFAULT false,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customer_profiles(id) NOT NULL,
    professional_id UUID REFERENCES professional_profiles(id),
    service_id UUID REFERENCES services(id) NOT NULL,
    address_id UUID REFERENCES addresses(id) NOT NULL,
    booking_type VARCHAR(50) CHECK (booking_type IN ('SCHEDULED', 'QUICK_SERVICE')) NOT NULL,
    scheduled_date DATE,
    scheduled_time TIME,
    status VARCHAR(50) CHECK (status IN (
        'PENDING', 'CONFIRMED', 'PROFESSIONAL_ASSIGNED', 
        'PROFESSIONAL_ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 
        'CANCELLED', 'DISPUTED'
    )) DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Status History
CREATE TABLE booking_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quick Service Requests
CREATE TABLE quick_service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
    request_status VARCHAR(50) CHECK (request_status IN (
        'SEARCHING', 'PROFESSIONAL_FOUND', 'ACCEPTED', 'NO_PROFESSIONAL_AVAILABLE', 'EXPIRED'
    )) DEFAULT 'SEARCHING',
    response_window_minutes INTEGER DEFAULT 5,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quick Service Professional Notifications
CREATE TABLE quick_service_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quick_service_request_id UUID REFERENCES quick_service_requests(id) ON DELETE CASCADE NOT NULL,
    professional_id UUID REFERENCES professional_profiles(id) NOT NULL,
    notification_status VARCHAR(50) CHECK (notification_status IN (
        'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED'
    )) DEFAULT 'SENT',
    notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50) CHECK (payment_gateway IN ('RAZORPAY', 'STRIPE')) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    payment_status VARCHAR(50) CHECK (payment_status IN (
        'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'
    )) DEFAULT 'PENDING',
    payment_intent_id VARCHAR(255),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Professional Earnings
CREATE TABLE professional_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES professional_profiles(id) NOT NULL,
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2) NOT NULL,
    payout_status VARCHAR(50) CHECK (payout_status IN (
        'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
    )) DEFAULT 'PENDING',
    payout_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
    customer_id UUID REFERENCES customer_profiles(id) NOT NULL,
    professional_id UUID REFERENCES professional_profiles(id) NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    raised_by UUID REFERENCES users(id) NOT NULL,
    dispute_type VARCHAR(100),
    description TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN (
        'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'
    )) DEFAULT 'OPEN',
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Files/Documents
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by UUID REFERENCES users(id) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    storage_provider VARCHAR(50) DEFAULT 'AZURE_BLOB',
    entity_type VARCHAR(50),
    entity_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(50) CHECK (channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP')) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    delivery_status VARCHAR(50) CHECK (delivery_status IN (
        'PENDING', 'SENT', 'DELIVERED', 'FAILED'
    )) DEFAULT 'PENDING',
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Conversations
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID DEFAULT uuid_generate_v4(),
    status VARCHAR(50) CHECK (status IN ('ACTIVE', 'ESCALATED', 'CLOSED')) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Messages
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
    sender_type VARCHAR(50) CHECK (sender_type IN ('USER', 'AI', 'SYSTEM')) NOT NULL,
    message_content TEXT NOT NULL,
    intent VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_professional ON bookings(professional_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_professional_approval ON professional_profiles(approval_status);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_reviews_professional ON reviews(professional_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('CUSTOMER', 'Regular customer who books services'),
('PROFESSIONAL', 'Service professional who fulfills bookings'),
('ADMIN', 'Platform administrator with full access');

-- Insert sample service categories
INSERT INTO service_categories (name, description, is_active) VALUES
('Home Cleaning', 'Professional home cleaning services', true),
('Plumbing', 'Plumbing and pipe fitting services', true),
('Electrical', 'Electrical installation and repair', true),
('Carpentry', 'Furniture and woodwork services', true),
('Painting', 'Interior and exterior painting', true),
('Appliance Repair', 'Home appliance repair services', true),
('Pest Control', 'Pest management and prevention', true),
('Gardening', 'Garden maintenance and landscaping', true);
