# 🏙️ UrbanServe - On-Demand Local Service Marketplace Platform

**Version:** 1.0  
**Phase:** Academic Project - Phase 1  
**Project Window:** 01 September 2026 - 30 September 2026

## 📋 Overview

UrbanServe is a comprehensive on-demand local service marketplace platform that connects customers with verified local service professionals. The platform supports standard scheduled bookings and urgent quick-service requests, featuring an AI assistant to enhance the user experience.

### Key Features
- ✅ **Customer Application**: Browse, book, track, pay, and review services
- 👷 **Professional Portal**: Manage jobs, availability, and earnings
- 🎯 **Admin Dashboard**: Control users, professionals, services, and platform operations
- 🚀 **Quick-Service Engine**: Real-time professional matching for urgent requests
- 🤖 **AI Assistant**: Conversational support for discovery, booking, and FAQs
- 💳 **Payment Integration**: Razorpay/Stripe test mode
- 📍 **Location Services**: Azure Maps integration
- 🔔 **Notifications**: Multi-channel (Email/SMS/Push)

## 🏗️ Architecture

**Pattern:** Modular Monolith  
**Frontend:** Next.js 15 + TypeScript + Tailwind CSS + GSAP  
**Backend:** Node.js + Express.js + TypeScript  
**Database:** PostgreSQL  
**Cloud:** Azure (Functions, Blob Storage, OpenAI, Key Vault, Maps)

### Project Structure

```
urban-serve/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utilities and helpers
│   ├── public/              # Static assets
│   └── styles/              # Global styles
│
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication & authorization
│   │   │   ├── users/      # User management
│   │   │   ├── professionals/  # Professional management
│   │   │   ├── services/   # Service catalog
│   │   │   ├── bookings/   # Booking management
│   │   │   ├── quick-service/  # Quick service matching
│   │   │   ├── payments/   # Payment processing
│   │   │   ├── notifications/  # Notification system
│   │   │   ├── reviews/    # Ratings and reviews
│   │   │   ├── ai/         # AI assistant
│   │   │   └── admin/      # Admin operations
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration
│   │   ├── database/       # Database connection
│   │   ├── integrations/   # External service integrations
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   └── dist/               # Compiled JavaScript
│
└── database/               # Database scripts
    ├── schema.sql          # Database schema
    ├── migrations/         # Migration scripts
    └── seeds/              # Seed data
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Azure account (for cloud services)

### Installation

1. **Clone the repository**
```bash
cd /Users/ayushjha/Desktop/urban-serve
```

2. **Set up PostgreSQL Database**

```bash
# Create database
psql -U postgres
CREATE DATABASE urbanserve_db;

# Run schema
psql -U postgres -d urbanserve_db -f database/schema.sql
```

3. **Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Required: DB credentials, JWT secret, Azure credentials

# Start development server
npm run dev
```

Backend will run on: `http://localhost:5000`

4. **Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
touch .env.local

# Add the following to .env.local:
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_PAYMENT_GATEWAY=RAZORPAY
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

## 🗄️ Database Schema

### Core Entities

- **users**: Central authentication and identity
- **roles**: CUSTOMER, PROFESSIONAL, ADMIN
- **customer_profiles**: Customer information
- **professional_profiles**: Professional details and approval status
- **services**: Service catalog
- **service_categories**: Service groupings
- **bookings**: Scheduled and quick-service bookings
- **payments**: Payment transactions
- **reviews**: Customer ratings and feedback
- **notifications**: Multi-channel notifications
- **ai_conversations**: AI assistant conversations
- **disputes**: Conflict resolution

### Booking Lifecycle States

```
PENDING → CONFIRMED → PROFESSIONAL_ASSIGNED → 
PROFESSIONAL_ON_THE_WAY → IN_PROGRESS → COMPLETED

Terminal States: CANCELLED, DISPUTED
```

### Professional Approval Flow

```
PENDING → APPROVED/REJECTED
           ↓
       SUSPENDED (if needed)
```

## 🔐 Authentication & Authorization

### JWT-based Authentication

The platform uses JSON Web Tokens (JWT) for secure authentication:

- **Access Token**: Short-lived (7 days default)
- **Refresh Token**: Long-lived (30 days default)

### Role-Based Access Control (RBAC)

Three primary roles:

1. **CUSTOMER**: Browse and book services
2. **PROFESSIONAL**: Fulfill service requests
3. **ADMIN**: Platform administration

### API Authentication

Include JWT token in request headers:

```
Authorization: Bearer <your_jwt_token>
```

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
- `POST /auth/register/customer` - Register as customer
- `POST /auth/register/professional` - Register as professional
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (authenticated)
- `GET /auth/me` - Get current user (authenticated)

### Services (Coming Soon)
- `GET /services` - List/search services
- `GET /services/:id` - Get service details
- `GET /categories` - List service categories

### Bookings (Coming Soon)
- `POST /bookings` - Create booking
- `GET /bookings/:id` - Get booking details
- `GET /bookings` - List user bookings
- `PUT /bookings/:id/cancel` - Cancel booking
- `PUT /bookings/:id/reschedule` - Reschedule booking

### Quick Services (Coming Soon)
- `POST /quick-services` - Create quick-service request
- `GET /quick-services/:id` - Get request status
- `POST /quick-services/:id/accept` - Accept request (professional)
- `POST /quick-services/:id/reject` - Reject request (professional)

### Professional (Coming Soon)
- `GET /professionals/profile` - Get professional profile
- `PUT /professionals/profile` - Update profile
- `PUT /professionals/availability` - Update availability
- `GET /professionals/jobs` - View jobs
- `GET /professionals/earnings` - View earnings

### Admin (Coming Soon)
- `GET /admin/users` - Manage users
- `GET /admin/professionals` - View professionals
- `PUT /admin/professionals/:id/approve` - Approve professional
- `PUT /admin/professionals/:id/reject` - Reject professional
- `GET /admin/bookings` - Monitor bookings
- `GET /admin/disputes` - Manage disputes

### AI Assistant (Coming Soon)
- `POST /ai/chat` - Send message to AI
- `GET /ai/conversations` - List conversations

## 🎨 Frontend Development

### Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **GSAP**: Advanced animations
- **Framer Motion**: UI animations
- **Zustand**: State management
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **Axios**: HTTP client

### Color Palette (Custom - No Generic Blue/Purple)

Following the requirement for context-appropriate colors:

- **Primary**: Warm Terracotta (#E07855) - Represents trust and warmth
- **Secondary**: Fresh Sage (#8FBC8F) - Growth and reliability
- **Accent**: Sunset Orange (#FF8C42) - Energy and action
- **Neutral Dark**: Charcoal (#2C3E50)
- **Neutral Light**: Warm Gray (#F5F5F0)
- **Success**: Moss Green (#6B8E23)
- **Warning**: Amber (#FFA500)
- **Error**: Brick Red (#C84A3F)

### Typography

- **Headings**: Inter (Clean, modern, professional)
- **Body**: Open Sans (Readable, friendly)

### Component Structure (Planned)

```
components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   └── Navigation.tsx
├── customer/
│   ├── ServiceCard.tsx
│   ├── BookingFlow.tsx
│   ├── BookingTracker.tsx
│   └── ReviewForm.tsx
├── professional/
│   ├── Dashboard.tsx
│   ├── JobList.tsx
│   ├── AvailabilityManager.tsx
│   └── EarningsChart.tsx
├── admin/
│   ├── UserManagement.tsx
│   ├── ProfessionalApproval.tsx
│   └── BookingMonitor.tsx
├── shared/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   └── LoadingSpinner.tsx
└── ai/
    └── ChatAssistant.tsx
```

## 🤖 AI Assistant

### Supported Intents

1. **FAQ**: Answer general service questions
2. **Service Discovery**: Identify relevant services from natural language
3. **Recommendations**: Suggest suitable services
4. **Booking Assistance**: Guide through booking process
5. **Quick Service**: Initiate urgent service requests
6. **Status Check**: Retrieve booking status
7. **Cancellation/Reschedule**: Guide through modifications
8. **Escalation**: Route complex issues to human support

### Safety Controls

- API-only data access (no direct database connection)
- Backend validation of all AI-suggested actions
- RBAC enforcement
- Escalation path for unresolved requests

## 💳 Payment Integration

### Supported Gateways (Test Mode)

- **Razorpay**: Default gateway
- **Stripe**: Alternative gateway

### Payment Flow

```
Booking → Payment Gateway → Customer Payment → 
Backend Verification → Transaction Record → 
Booking Update → Notification
```

### Security

- No raw card data storage
- Gateway verification before state updates
- Failed payment handling
- Refund support

## 🚀 Quick Service Matching

### Workflow

```
Customer Request
    ↓
Validate Service + Location
    ↓
Identify Eligible Professionals
(approved, available, service capability, proximity)
    ↓
Notify Matching Professionals
    ↓
Response Window (5 minutes default)
    ↓
Accept / Decline
    ↓
Confirm Professional to Customer
    ↓
Track to Completion
```

### Matching Criteria

- Professional approval status: APPROVED
- Current availability: TRUE
- Service capability match
- Location proximity (configurable radius)
- Professional rating (optional priority)

## 📊 Non-Functional Requirements

| Category | Requirement | Priority |
|----------|-------------|----------|
| Performance | Quick-service matching within seconds | Must |
| Security | Server-side auth & authorization | Must |
| Availability | Core flows available during demo/UAT | Must |
| Usability | First-time user can complete booking | Must |
| Scalability | Modular architecture for future growth | Should |
| Cost | Azure free-tier constraint | Must |
| Maintainability | Clear module separation | Must |
| Reliability | Consistent booking/payment state | Must |

## 🔒 Security

### Best Practices

- ✅ HTTPS for all communication
- ✅ JWT-based authentication
- ✅ Role-based authorization
- ✅ Password hashing (bcrypt)
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Helmet.js security headers
- ✅ Azure Key Vault for secrets
- ✅ No sensitive data in logs

### Data Protection

- Customer data accessible only by owner or admin
- Professional data restricted by role
- Payment data handled by gateway
- File access controlled by ownership

## 📱 Deployment

### Backend (Azure Functions)

```bash
# Build
npm run build

# Deploy to Azure Functions
# (Configuration coming soon)
```

### Frontend (Azure Static Web Apps)

```bash
# Build
npm run build

# Deploy to Azure Static Web Apps
# (Configuration coming soon)
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test
```

### Frontend Testing
```bash
cd frontend
npm run test
```

## 📝 Environment Variables

### Backend (.env)

See `.env.example` for all required variables.

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_PAYMENT_GATEWAY=RAZORPAY
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
NEXT_PUBLIC_AZURE_MAPS_KEY=your_key
```

## 🛠️ Development Workflow

1. Create feature branch from main
2. Develop and test locally
3. Run linters and tests
4. Commit with descriptive messages
5. Create pull request
6. Code review
7. Merge to main
8. Deploy to staging → production

## 📚 References

- [SRS Document](./docs/UrbanServe-SRS.pdf) - v1.0
- [BRD Document](./docs/BRD.pdf) - v1.0
- [SOW Document](./docs/SOW.pdf) - v1.0
- [Architecture Diagrams](./docs/architecture/)

## 👥 Team

- **Project Manager**: Ayush Jha
- **Business Analyst**: Ayush Kumar
- **Scrum Master**: Payal Singhrao
- **Solution Architect**: Shweta Shetty
- **Tech Lead**: Vrutti Patil

## 📄 License

This is an academic project for Phase 1 development.

## 🆘 Support

For issues or questions:
1. Check this README
2. Review SRS documentation
3. Contact project team

---

**Status**: 🚧 In Development - Phase 1  
**Last Updated**: September 20, 2026
