-- UrbanServe Initial Seed Data
-- Sample data for testing and development

-- Insert sample services for each category
DO $$
DECLARE
    cat_cleaning_id INT;
    cat_plumbing_id INT;
    cat_electrical_id INT;
    cat_carpentry_id INT;
    cat_painting_id INT;
    cat_appliance_id INT;
    cat_pest_id INT;
    cat_gardening_id INT;
BEGIN
    -- Get category IDs
    SELECT id INTO cat_cleaning_id FROM service_categories WHERE name = 'Home Cleaning';
    SELECT id INTO cat_plumbing_id FROM service_categories WHERE name = 'Plumbing';
    SELECT id INTO cat_electrical_id FROM service_categories WHERE name = 'Electrical';
    SELECT id INTO cat_carpentry_id FROM service_categories WHERE name = 'Carpentry';
    SELECT id INTO cat_painting_id FROM service_categories WHERE name = 'Painting';
    SELECT id INTO cat_appliance_id FROM service_categories WHERE name = 'Appliance Repair';
    SELECT id INTO cat_pest_id FROM service_categories WHERE name = 'Pest Control';
    SELECT id INTO cat_gardening_id FROM service_categories WHERE name = 'Gardening';

    -- Home Cleaning Services
    INSERT INTO services (category_id, name, description, base_price, estimated_duration_minutes, service_type) VALUES
    (cat_cleaning_id, 'Deep House Cleaning', 'Comprehensive cleaning of entire house including dusting, mopping, and sanitizing', 120.00, 180, 'BOTH'),
    (cat_cleaning_id, 'Kitchen Cleaning', 'Detailed kitchen cleaning including appliances, counters, and floors', 60.00, 90, 'SCHEDULED'),
    (cat_cleaning_id, 'Bathroom Cleaning', 'Complete bathroom sanitization and deep cleaning', 45.00, 60, 'SCHEDULED'),
    (cat_cleaning_id, 'Quick Clean', 'Fast cleaning service for urgent needs', 80.00, 60, 'QUICK');

    -- Plumbing Services
    INSERT INTO services (category_id, name, description, base_price, estimated_duration_minutes, service_type) VALUES
    (cat_plumbing_id, 'Pipe Repair', 'Fix leaking or damaged pipes', 90.00, 120, 'BOTH'),
    (cat_plumbing_id, 'Drain Cleaning', 'Clear clogged drains and pipes', 70.00, 90, 'BOTH'),
    (cat_plumbing_id, 'Toilet Repair', 'Fix running or clogged toilets', 65.00, 60, 'BOTH'),
    (cat_plumbing_id, 'Water Heater Service', 'Installation and repair of water heaters', 150.00, 180, 'SCHEDULED'),
    (cat_plumbing_id, 'Emergency Plumbing', 'Urgent plumbing repairs', 120.00, 90, 'QUICK');

    -- Electrical Services
    INSERT INTO services (category_id, name, description, base_price, estimated_duration_minutes, service_type) VALUES
    (cat_electrical_id, 'Light Fixture Installation', 'Install ceiling lights, chandeliers, and fixtures', 80.00, 90, 'SCHEDULED'),
    (cat_electrical_id, 'Outlet Repair', 'Fix non-working electrical outlets', 60.00, 60, 'BOTH'),
    (cat_electrical_id, 'Ceiling Fan Installation', 'Install and balance ceiling fans', 95.00, 120, 'SCHEDULED'),
    (cat_electrical_id, 'Circuit Breaker Repair', 'Fix tripping circuit breakers', 110.00, 90, 'BOTH'),
    (cat_electrical_id, 'Emergency Electrical', 'Urgent electrical repairs for safety issues', 130.00, 90, 'QUICK');

    -- Carpentry Services
    INSERT INTO services (category_id, name, description, base_price, estimated_duration_minutes, service_type) VALUES
    (cat_carpentry_id, 'Furniture Assembly', 'Assemble flat-pack furniture', 70.00, 120, 'BOTH'),
    (cat_carpentry_id, 'Cabinet Installation', 'Install kitchen or bathroom cabinets', 180.00, 240, 'SCHEDULED'),
    (cat_carpentry_id, 'Door Repair', 'Fix squeaky or damaged doors', 65.00, 90, 'SCHEDULED'),
    (cat_carpentry_id, 'Custom Shelving', 'Build and install custom shelves', 150.00, 180, 'SCHEDULED');

    -- Painting Services
    INSERT INTO services (category_id, name, description, base_price, estimated_duration_minutes, service_type) VALUES
    (cat_painting_id, 'Interior Room Painting', 'Paint one room including prep work', 200.00, 480, 'SCHEDULED'),
    (cat_painting_id, 'Exterior House Painting', 'Paint exterior walls and trim', 500.00, 960, 'SCHEDULED'),
    (cat_painting_id, 'Cabinet Painting', 'Refinish kitchen or bathroom cabinets', 250.00, 360, 'SCHEDULED'),
    (cat_painting_id, 'Touch-up Painting', 'Small repairs and touch-ups', 80.00, 120, 'BOTH');

    -- Appliance Repair Services
    INSERT INTO services (category_id, name, description, base_price, estimated_duration_minutes, service_type) VALUES
    (cat_appliance_id, 'Refrigerator Repair', 'Fix cooling issues, leaks, and more', 120.00, 120, 'BOTH'),
    (cat_appliance_id, 'Washing Machine Repair', 'Repair washing machine problems', 100.00, 90, 'BOTH'),
    (cat_appliance_id, 'Dishwasher Repair', 'Fix dishwasher drainage and cleaning issues', 95.00, 90, 'SCHEDULED'),
    (cat_appliance_id, 'Oven/Stove Repair', 'Repair heating and electrical issues', 110.00, 120, 'SCHEDULED');

    -- Pest Control Services
    INSERT INTO services (category_id, name, description, base_price, estimated_duration_minutes, service_type) VALUES
    (cat_pest_id, 'General Pest Control', 'Treatment for common household pests', 130.00, 90, 'SCHEDULED'),
    (cat_pest_id, 'Termite Treatment', 'Specialized termite inspection and treatment', 250.00, 180, 'SCHEDULED'),
    (cat_pest_id, 'Rodent Control', 'Mouse and rat removal and prevention', 150.00, 120, 'BOTH'),
    (cat_pest_id, 'Emergency Pest Removal', 'Urgent pest removal service', 180.00, 60, 'QUICK');

    -- Gardening Services
    INSERT INTO services (category_id, name, description, base_price, estimated_duration_minutes, service_type) VALUES
    (cat_gardening_id, 'Lawn Mowing', 'Regular lawn cutting and edging', 60.00, 60, 'SCHEDULED'),
    (cat_gardening_id, 'Garden Maintenance', 'Weeding, pruning, and plant care', 90.00, 120, 'SCHEDULED'),
    (cat_gardening_id, 'Landscaping Design', 'Design and implement new landscape', 300.00, 480, 'SCHEDULED'),
    (cat_gardening_id, 'Tree Trimming', 'Prune and shape trees safely', 120.00, 180, 'SCHEDULED');

END $$;

-- Create sample admin user
-- Password: Admin@123
INSERT INTO users (email, password_hash, role_id, is_active, is_verified) VALUES
('admin@urbanserve.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5K5c7/3N5i.vC', 
 (SELECT id FROM roles WHERE name = 'ADMIN'), true, true);

-- Note: For testing purposes, you can create test accounts:
-- Customer: customer@test.com / Customer@123
-- Professional: professional@test.com / Professional@123
-- Admin: admin@urbanserve.com / Admin@123

COMMENT ON TABLE services IS 'Seeded with sample services across all categories';
COMMENT ON TABLE users IS 'Includes default admin account: admin@urbanserve.com';
