# Beautician Earnings Tracker - Replit Setup

## Project Overview
A modern, mobile-first web application for tracking daily earnings designed specifically for beauticians and salon owners. Features a beautiful light theme with warm purple/pink accents (#7C3AED, #EC4899) suitable for the beauty/wellness industry.

## Architecture
- **Frontend**: React 18 + Vite (Port 5000)
- **Backend**: Node.js + Express (Port 3001 on localhost)
- **Database**: PostgreSQL (Replit integrated)
- **Tech Stack**: 
  - Frontend: React, Styled Components, React Router, React Query, Framer Motion
  - Backend: Express, JWT auth, bcryptjs, PostgreSQL (pg)

## UI Design System (Updated January 2026)
### Theme Colors
- **Background**: #FAFAFA (light gray)
- **Cards**: #FFFFFF (white)
- **Primary**: #7C3AED (purple)
- **Secondary**: #EC4899 (pink)
- **Success**: #10B981 (green)
- **Error**: #EF4444 (red)
- **Text Primary**: #1F2937
- **Text Secondary**: #6B7280
- **Text Muted**: #9CA3AF

### Design Tokens
- Border radius: sm (6px), md (10px), lg (14px), xl (18px), 2xl (24px)
- Shadows: card, cardHover, button, buttonHover
- Gradients: primary (purple to pink), hero (soft pastel background)

### Updated Components
All pages have been redesigned with the new light theme:
- Login/Register - Gradient hero background, white card, gradient button
- Dashboard - Clean stat cards with colored icons, gradient main stat
- Monthly Overview - Month selector grid, payment methods cards
- AddEarnings - Form cards with clean inputs, payment method buttons
- Clients - Client cards with stats, modal forms
- Employees - Employee cards with hourly rate inputs, stats sections
- Settings - Section cards with form inputs
- Sidebar - Clean navigation with company selector
- Navigation - Bottom mobile navigation

## Current Setup Status

### ✅ Completed
- Node.js 20 installed
- Frontend dependencies installed (React, Vite, etc.)
- Backend dependencies installed (Express, PostgreSQL client, etc.)
- Vite configured for port 5000 with host 0.0.0.0 (Replit compatible)
- Backend configured to run on localhost:3001
- Environment variables configured
- Complete UI redesign with modern light theme

### ✅ Database Setup Complete
The application uses a PostgreSQL database that is already provisioned and initialized.

**Database Connection:**
- `DATABASE_URL` is set and connected to the Replit PostgreSQL instance
- Database: `heliumdb` on server `helium`

**Sample Data Loaded:**
- 2 users (testerkont@gmail.com, paulinaw1121@gmail.com)
- 3 companies/salons
- 14 clients
- 73 earnings records
- 177 transactions

### Database Schema
The application database includes:
- **users** - User authentication and profiles
- **companies** - Multi-company/salon system
- **user_companies** - User-company relationships with roles (owner/employee)
- **daily_earnings** - Daily earnings records
- **client_transactions** - Individual client transaction tracking
- **clients** - Client information and contact details
- **user_settings** - User preferences (hourly rate, etc.)
- **company_invitations** - Invitation system for adding employees
- **client_payment_methods** - Multiple payment method tracking

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
- Daily earnings tracking (cash, card, BLIK, prepaid, transfer, tips)
- Client management with search
- Employee management with invitations
- Role-based access (owner/employee)
- Monthly earnings overview
- Settings management
- Polish language UI throughout

## Recent Changes (January 25, 2026)
### Complete UI Redesign
- ✅ Migrated from dark theme to modern light theme
- ✅ Updated theme.js with new color palette and design tokens
- ✅ Redesigned Login.jsx with gradient hero background
- ✅ Redesigned Register.jsx with matching style
- ✅ Updated Dashboard.jsx with new stat cards and layout
- ✅ Modernized Monthly.jsx with clean month selector
- ✅ Redesigned Settings.jsx with section cards
- ✅ Updated AddEarnings.jsx with improved form layout
- ✅ Redesigned Clients.jsx with client cards and modals
- ✅ Updated Employees.jsx with employee cards and stats
- ✅ Modernized Sidebar.jsx with company selector
- ✅ Updated Navigation.jsx (bottom mobile nav)
- ✅ Fixed styled-components transient props ($prefix) to avoid DOM warnings
- ✅ Updated ClientEntry.jsx component with new styling

### Technical Improvements
- Used transient props ($prop) in styled-components for proper prop forwarding
- Consistent spacing and border radius throughout
- Improved accessibility with better color contrast
- Responsive design maintained for mobile and desktop

## Application Status
🟢 **Ready to use!** The application is fully set up and running in the Replit environment.

- Frontend accessible at: `https://{replit-domain}` (port 5000)
- Backend API accessible at: `https://{replit-domain}:3001` (port 3001)
- Database connected and initialized with sample data
- Both workflows running successfully

### Environment Variables
All required environment variables are configured:
- `DATABASE_URL` - PostgreSQL connection (automatically set by Replit database integration)
- `BACKEND_PORT` - Set to 3001
- `JWT_SECRET` - Authentication secret
- `NODE_ENV` - Set to development
- `CORS_ORIGIN` - Configured for Replit domain
- `VITE_API_URL` - Frontend API endpoint configuration

## User Preferences
- Polish language UI maintained throughout the application
- Light theme with warm purple/pink accents for beauty industry aesthetic
- Mobile-first responsive design

## Next Steps (Optional)
1. Test user registration and login functionality
2. Add more client management features
3. Implement employee statistics dashboard
4. Deploy to production using the "Deploy" button when ready
