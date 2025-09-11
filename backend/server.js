const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const earningsRoutes = require('./routes/earnings');
const settingsRoutes = require('./routes/settings');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.VITE_API_URL ? process.env.VITE_API_URL.replace(/:\d+$/, `:${process.env.FRONTEND_PORT || 3000}`) : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/earnings', authenticateToken, earningsRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});