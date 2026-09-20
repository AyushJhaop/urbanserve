# 🚀 Getting Started with UrbanServe

Complete setup guide to get UrbanServe running on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

## ⚙️ Step-by-Step Setup

### 1. Project Location

The project is already initialized at:
```
/Users/ayushjha/Desktop/urban-serve
```

### 2. PostgreSQL Setup

#### A. Start PostgreSQL Service

**macOS:**
```bash
brew services start postgresql@14
```

**Linux:**
```bash
sudo systemctl start postgresql
```

**Windows:**
PostgreSQL service should start automatically after installation.

#### B. Create Database

Navigate to database directory:
```bash
cd /Users/ayushjha/Desktop/urban-serve/database
```

Run the setup script:
```bash
./setup.sh
```

Or manually:
```bash
# Create database
createdb -U postgres urbanserve_db

# Run schema
psql -U postgres -d urbanserve_db -f schema.sql

# Load seed data
psql -U postgres -d urbanserve_db -f seeds/initial_data.sql
```

#### C. Verify Database

```bash
psql -U postgres -d urbanserve_db -c "\dt"
```

You should see all tables listed (users, roles, services, bookings, etc.).

### 3. Backend Setup

#### A. Navigate to Backend
```bash
cd /Users/ayushjha/Desktop/urban-serve/backend
```

#### B. Install Dependencies
```bash
npm install
```

#### C. Create Environment File
```bash
cp .env.example .env
```

#### D. Configure Environment Variables

Edit `.env` file with your settings:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration (Update these!)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=urbanserve_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration (Generate secure keys!)
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

⚠️ **IMPORTANT**: 
- Replace `your_postgres_password` with your actual PostgreSQL password
- Generate secure JWT secrets (use `openssl rand -base64 32`)

#### E. Create Logs Directory
```bash
mkdir -p logs
```

#### F. Start Backend Server
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 UrbanServe Backend Server running on port 5000
🌍 Environment: development
📍 API Base URL: http://localhost:5000/api/v1
💚 Health check: http://localhost:5000/health
```

#### G. Test Backend

Open a new terminal and test:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "UrbanServe API is running",
  "timestamp": "2026-09-20T...",
  "environment": "development"
}
```

### 4. Frontend Setup

#### A. Navigate to Frontend
```bash
cd /Users/ayushjha/Desktop/urban-serve/frontend
```

#### B. Install Dependencies
```bash
npm install
```

#### C. Create Environment File
```bash
touch .env.local
```

#### D. Configure Frontend Environment

Add to `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_PAYMENT_GATEWAY=RAZORPAY
```

#### E. Start Frontend Server
```bash
npm run dev
```

You should see:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

#### F. Open Browser

Visit: `http://localhost:3000`

## 🧪 Testing the Setup

### 1. Test Health Endpoint

```bash
curl http://localhost:5000/health
```

### 2. Test Categories Endpoint

```bash
curl http://localhost:5000/api/v1/services/categories
```

Expected: List of 8 service categories

### 3. Test Services Endpoint

```bash
curl http://localhost:5000/api/v1/services
```

Expected: List of services with pagination

### 4. Test User Registration

```bash
curl -X POST http://localhost:5000/api/v1/auth/register/customer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@12345",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
  }'
```

Expected: User created with JWT token

### 5. Test Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@urbanserve.com",
    "password": "Admin@123"
  }'
```

Expected: Login successful with JWT token

## 📱 Default Accounts

### Admin Account
- **Email**: admin@urbanserve.com
- **Password**: Admin@123
- **Role**: ADMIN

⚠️ Change these credentials for production use!

## 🛠️ Development Workflow

### Backend Development

1. Backend runs on: `http://localhost:5000`
2. API endpoints: `http://localhost:5000/api/v1/*`
3. Hot reload enabled via nodemon
4. Logs written to `backend/logs/`

### Frontend Development

1. Frontend runs on: `http://localhost:3000`
2. Hot reload enabled
3. Tailwind CSS for styling
4. GSAP for animations

### Database Changes

If you make schema changes:

1. Update `database/schema.sql`
2. Create migration file in `database/migrations/`
3. Drop and recreate database:
```bash
dropdb -U postgres urbanserve_db
./database/setup.sh
```

## 🐛 Common Issues & Solutions

### Issue: "Database connection failed"

**Solution:**
1. Ensure PostgreSQL is running: `pg_isready`
2. Check `.env` database credentials
3. Verify database exists: `psql -U postgres -l | grep urbanserve_db`

### Issue: "Port 5000 already in use"

**Solution:**
1. Find process: `lsof -i :5000`
2. Kill process: `kill -9 <PID>`
3. Or change port in `.env`: `PORT=5001`

### Issue: "Cannot find module"

**Solution:**
```bash
# Backend
cd backend && rm -rf node_modules && npm install

# Frontend
cd frontend && rm -rf node_modules && npm install
```

### Issue: "JWT secret error"

**Solution:**
Generate secure JWT secrets:
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

Add these to `.env` file.

### Issue: "Permission denied: ./setup.sh"

**Solution:**
```bash
chmod +x database/setup.sh
```

## 📂 Project Structure Quick Reference

```
urban-serve/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── modules/  # Feature modules
│   │   ├── config/   # Configuration
│   │   ├── middleware/ # Express middleware
│   │   └── server.ts # Main entry point
│   └── .env          # Environment variables
│
├── frontend/         # Next.js application
│   ├── app/         # App router pages
│   ├── components/  # React components
│   └── .env.local   # Frontend environment
│
└── database/        # PostgreSQL scripts
    ├── schema.sql   # Database schema
    ├── seeds/       # Seed data
    └── setup.sh     # Setup script
```

## 🎯 Next Steps

1. ✅ Verify both backend and frontend are running
2. ✅ Test API endpoints using curl or Postman
3. ✅ Test default admin login
4. 📝 Start building features following the SRS document
5. 🎨 Customize frontend UI with custom colors
6. 🤖 Integrate Azure OpenAI for AI Assistant
7. 💳 Set up payment gateway (Razorpay/Stripe test mode)
8. 📍 Configure Azure Maps for location services

## 📚 Useful Commands

### Backend
```bash
# Development mode (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Frontend
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database
```bash
# Connect to database
psql -U postgres -d urbanserve_db

# List tables
\dt

# Describe table
\d+ users

# Run query
SELECT COUNT(*) FROM users;

# Exit
\q
```

## 🆘 Getting Help

1. Check this guide for common setup issues
2. Review the main README.md
3. Check SRS documentation
4. Review backend logs in `backend/logs/`
5. Check browser console for frontend errors

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database `urbanserve_db` created
- [ ] Schema and seed data loaded
- [ ] Backend server running on port 5000
- [ ] Health endpoint returning success
- [ ] Frontend server running on port 3000
- [ ] Can access frontend in browser
- [ ] API calls working from frontend to backend
- [ ] Can login with admin credentials
- [ ] Services endpoint returning data

Once all items are checked, you're ready to start development! 🎉

---

**Need Help?** Contact the project team or refer to the SRS document for detailed requirements.
