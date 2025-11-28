const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const earningsRoutes = require('./routes/earnings');
const settingsRoutes = require('./routes/settings');
const clientsRoutes = require('./routes/clients');
const companiesRoutes = require('./routes/companies');
const invitationsRoutes = require('./routes/invitations');
const employeesRoutes = require('./routes/employees');
const { authenticateToken, requireCompanyAccess } = require('./middleware/auth');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/companies', authenticateToken, companiesRoutes);
app.use('/api/invitations', authenticateToken, invitationsRoutes);
app.use('/api/earnings', authenticateToken, requireCompanyAccess, earningsRoutes);
app.use('/api/settings', authenticateToken, requireCompanyAccess, settingsRoutes);
app.use('/api/clients', authenticateToken, requireCompanyAccess, clientsRoutes);
app.use('/api/employees', authenticateToken, requireCompanyAccess, employeesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on 0.0.0.0:${PORT}`);
});