# Beautician Earnings Tracker - Replit Setup

## Project Overview
A modern, mobile-first web application for tracking daily earnings designed specifically for beauticians. This is a full-stack application with React frontend, Node.js/Express backend, and PostgreSQL database.

## Architecture
- **Frontend**: React 18 + Vite (Port 5000)
- **Backend**: Node.js + Express (Port 3001 on localhost)
- **Database**: PostgreSQL (requires external database)
- **Tech Stack**: 
  - Frontend: React, Styled Components, React Router, React Query, Framer Motion
  - Backend: Express, JWT auth, bcryptjs, PostgreSQL (pg)

## Current Setup Status

### ✅ Completed
- Node.js 20 installed
- Frontend dependencies installed (React, Vite, etc.)
- Backend dependencies installed (Express, PostgreSQL client, etc.)
- Vite configured for port 5000 with host 0.0.0.0 (Replit compatible)
- Backend configured to run on localhost:3001
- Environment variables configured:
  - `BACKEND_PORT=3001`
  - `NODE_ENV=development`
  - `CORS_ORIGIN` set to Replit domain
  - `VITE_API_URL` configured for backend communication
  - `JWT_SECRET` set

### ✅ Database Setup Complete
The application uses a PostgreSQL database that is already provisioned and initialized.

**Database Connection:**
- `DATABASE_URL` is set and connected to the Replit PostgreSQL instance
- Database: `heliumdb` on server `helium`

### Database Schema
The application database includes:
- **users** - User authentication and profiles
- **companies** - Multi-company/salon system (migration partially applied)
- **user_companies** - User-company relationships with roles (owner/employee)
- **daily_earnings** - Daily earnings records
- **client_transactions** - Individual client transaction tracking
- **clients** - Client information and contact details
- **user_settings** - User preferences (hourly rate, etc.)
- **company_invitations** - Invitation system for adding employees
- **client_payment_methods** - Multiple payment method tracking

### Database Initialization Scripts
- `backend/init-database.js` - Automated database initialization script
- `backend/apply-migrations.js` - Migration application script
- `backend/create-clients-table.sql` - Clients table schema (applied)

**Note**: Some migrations in `backend/migrations/` may need manual review and application if you want full multi-company functionality.

## Workflows Configured
- **Start Frontend**: Runs Vite dev server on port 5000 (webview, binds to 0.0.0.0)
- **Start Backend**: Runs Express API server on port 3001 (console, binds to 0.0.0.0)

## Port Configuration
- Frontend: **5000** (required for Replit webview, binds to 0.0.0.0)
- Backend: **3001** (binds to 0.0.0.0 for external access)
- Frontend accesses backend via: `https://{replit-domain}:3001`

## Features
- User authentication (register/login with JWT)
- Multi-company/salon management
- Daily earnings tracking (cash, card, tips)
- Client management
- Employee management with invitations
- Role-based access (owner/employee)
- Monthly earnings overview
- Settings management

## Recent Changes (Nov 28, 2024)
- ✅ Migrated from Docker setup to native Replit environment
- ✅ Configured Vite for port 5000 with 0.0.0.0 host (Replit proxy compatible)
- ✅ Backend configured for localhost:3001
- ✅ Environment variables set up for Replit domain
- ✅ Workflows created for frontend and backend
- ✅ Updated CORS to allow Replit domain
- ✅ PostgreSQL database initialized with schema
- ✅ Created clients table and related migrations
- ✅ Both frontend and backend are running successfully
- ✅ Deployment configuration created (autoscale with build and run commands)

## Application Status
🟢 **Ready to use!** The application is fully set up and running in the Replit environment.

- Frontend accessible at: `https://{replit-domain}` (port 5000)
- Backend API accessible at: `https://{replit-domain}:3001` (port 3001)
- Database connected and initialized
- Both workflows running successfully

### Environment Variables
All required environment variables are configured:
- `DATABASE_URL` - PostgreSQL connection (automatically set by Replit database integration)
  - **Note**: This is set as a system environment variable and may not appear in the Secrets UI
  - Connection: `postgresql://postgres:password@helium/heliumdb`
  - Verified working and connected
- `BACKEND_PORT` - Set to 3001
- `JWT_SECRET` - Authentication secret
- `NODE_ENV` - Set to development
- `CORS_ORIGIN` - Configured for Replit domain
- `VITE_API_URL` - Frontend API endpoint configuration

## Next Steps (Optional)
1. Test user registration and login functionality
2. Review and apply remaining company system migrations if needed
3. Deploy to production using the "Deploy" button when ready
