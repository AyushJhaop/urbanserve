# UrbanServe Database

PostgreSQL database schema and setup scripts for UrbanServe platform.

## Quick Setup

### Prerequisites
- PostgreSQL 14 or higher installed
- psql command-line tool

### Setup Instructions

1. **Automatic Setup** (Recommended)
```bash
./setup.sh
```

2. **Manual Setup**
```bash
# Create database
createdb -U postgres urbanserve_db

# Run schema
psql -U postgres -d urbanserve_db -f schema.sql

# Load seed data
psql -U postgres -d urbanserve_db -f seeds/initial_data.sql
```

### Environment Variables

If using non-default PostgreSQL configuration, set these environment variables before running setup:

```bash
export DB_USER=your_postgres_user
export DB_HOST=localhost
export DB_PORT=5432
```

## Database Schema

### Core Tables

- **users** - Central authentication and user management
- **roles** - CUSTOMER, PROFESSIONAL, ADMIN
- **customer_profiles** - Customer information and preferences
- **professional_profiles** - Professional details, approval status, ratings
- **services** - Service catalog
- **service_categories** - Service groupings
- **bookings** - All booking transactions
- **payments** - Payment records
- **reviews** - Customer ratings and feedback

### Relationships

```
users (1) → (1) customer_profiles
users (1) → (1) professional_profiles
professional_profiles (N) → (M) services (via professional_services)
services (N) → (1) service_categories
bookings (N) → (1) customer_profiles
bookings (N) → (1) professional_profiles
bookings (N) → (1) services
bookings (1) → (1) payments
bookings (1) → (0..1) reviews
```

## Sample Data

The seed script includes:

- 3 roles (Customer, Professional, Admin)
- 8 service categories
- ~30 sample services
- 1 admin account

### Default Admin Account

- **Email**: admin@urbanserve.com
- **Password**: Admin@123

⚠️ **Change this password in production!**

## Backup & Restore

### Backup
```bash
pg_dump -U postgres urbanserve_db > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql -U postgres -d urbanserve_db < backup_20260920.sql
```

## Migrations

Future schema changes should be added to `migrations/` directory with timestamp prefixes:

```
migrations/
├── 20260920_001_initial_schema.sql
├── 20260925_002_add_indexes.sql
└── 20260930_003_add_notifications.sql
```

## Connection String

```
postgresql://username:password@localhost:5432/urbanserve_db
```

## Useful Queries

### Check database size
```sql
SELECT pg_size_pretty(pg_database_size('urbanserve_db'));
```

### List all tables
```sql
\dt
```

### View table structure
```sql
\d+ table_name
```

### Count records
```sql
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'services', COUNT(*) FROM services;
```
