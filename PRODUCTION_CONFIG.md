# Production Configuration Guide

## Environment Variables

### Frontend (.env)
```bash
# For production, use domain WITHOUT /api suffix
VITE_API_URL=https://moje.studiopaulinka.pl
```

### Backend (.env)
```bash
NODE_ENV=production
JWT_SECRET=your-production-secret-key
BACKEND_PORT=3001
```

## Common Issues

### Double /api in URL
❌ **Wrong**: `VITE_API_URL=https://moje.studiopaulinka.pl/api`
✅ **Correct**: `VITE_API_URL=https://moje.studiopaulinka.pl`

The `/api` path is automatically added by the frontend code.

### 502 Bad Gateway
This usually means:
1. Backend is not running
2. Wrong VITE_API_URL configuration
3. Nginx/proxy misconfiguration

## Testing API URLs

To test if your configuration is correct, the final URLs should be:
- Login: `https://moje.studiopaulinka.pl/api/auth/login`
- Register: `https://moje.studiopaulinka.pl/api/auth/register`
- Dashboard: `https://moje.studiopaulinka.pl/api/earnings/dashboard`

## Deployment Checklist

1. ✅ Set `VITE_API_URL` without `/api` suffix
2. ✅ Set production `JWT_SECRET`
3. ✅ Set `NODE_ENV=production`
4. ✅ Configure database connection
5. ✅ Test API endpoints manually