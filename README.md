# Beautician Earnings Tracker

A modern, mobile-first web application for tracking daily earnings designed specifically for beauticians. Features a sleek dark UI optimized for mobile devices with comprehensive earnings management.

## Features

### 🏠 Dashboard
- Current month earnings overview
- Breakdown by cash/card payments
- Tips tracking (separate from main earnings)
- Real-time data updates

### ➕ Add/Edit Earnings
- Date selection (defaults to today)
- Cash and card payment tracking
- Optional tips recording
- Notes for additional details
- Automatic loading of existing data for editing

### 📊 Monthly Overview
- Navigate between different months
- Complete monthly earnings breakdown
- Daily earnings history
- Payment method statistics

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Protected routes
- Secure password hashing

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Styled Components** - CSS-in-JS styling
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Framer Motion** - Smooth animations
- **React Icons** - Beautiful icons
- **Vite** - Fast build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL** - Reliable database
- **JSON Web Tokens** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd "Paulinka Aplikacja"
\`\`\`

2. Start the application:
\`\`\`bash
docker-compose up -d
\`\`\`

### 🍎 macOS Users - Black Screen Fix

If you experience a black screen when running Vite locally on macOS, this is a common issue. We've implemented comprehensive fixes:

**Quick Start (Recommended):**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

**Alternative options if the above doesn't work:**
\`\`\`bash
npm run dev:host     # Uses 127.0.0.1 explicitly
npm run dev:local    # Uses localhost
npm run dev:clear    # Clears cache and forces rebuild
\`\`\`

**Common Solutions:**
- Use Chrome Incognito mode to bypass HTTPS redirects
- Disable browser extensions (especially ad-blockers)
- Access via \`http://127.0.0.1:3100\` instead of \`http://localhost:3100\`

📖 **Detailed troubleshooting guide:** See \`MACOS_TROUBLESHOOTING.md\`

### Access the Application

- **Frontend**: http://localhost:3100
- **Backend API**: http://localhost:5100
- **Database**: localhost:35432

### Default Credentials
The application requires user registration. Create an account through the registration page.

## Port Configuration

The application uses custom ports to avoid conflicts:
- Frontend: **3100** (instead of 3000)
- Backend: **5100** (instead of 5000/3000)
- Database: **35432** (instead of 5432)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Earnings
- `GET /api/earnings/dashboard` - Current month summary
- `GET /api/earnings/day/:date` - Get earnings for specific date
- `POST /api/earnings/day` - Save/update daily earnings
- `GET /api/earnings/monthly/:year/:month` - Monthly earnings data

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique user email
- `password_hash` - Hashed password
- `first_name`, `last_name` - User name
- `created_at`, `updated_at` - Timestamps

### Daily Earnings Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `date` - Earnings date
- `cash_amount` - Cash payments received
- `card_amount` - Card payments received
- `tips_amount` - Tips received (not included in main earnings)
- `notes` - Optional notes
- `created_at`, `updated_at` - Timestamps

## Development

### Starting in Development Mode

\`\`\`bash
# Build and start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
\`\`\`

### Environment Variables

#### Frontend (.env)
\`\`\`
VITE_API_URL=http://localhost:5100
\`\`\`

#### Backend (.env)
\`\`\`
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres123@database:5432/beautician_app
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5100
FRONTEND_URL=http://localhost:3100
\`\`\`

## Mobile-First Design

The application is optimized for mobile devices with:
- Responsive design that works on all screen sizes
- Touch-friendly interface elements
- Modern dark theme for reduced eye strain
- Intuitive navigation with bottom tab bar
- Fast loading and smooth animations

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Helmet for security headers

## Future Enhancements

- Export functionality (PDF, CSV)
- Data visualization charts
- Backup and restore features
- Multi-language support
- Push notifications
- Offline support with service workers

## Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 3100, 5100, or 35432 are already in use
2. **Database connection**: Ensure PostgreSQL container is running
3. **API connection**: Verify backend container is healthy

### Logs

\`\`\`bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs database
\`\`\`

## License

This project is licensed under the MIT License.