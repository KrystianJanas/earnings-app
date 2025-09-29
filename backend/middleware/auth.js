const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    try {
      // Get user's current company
      const currentCompany = await Company.getCurrentCompany(user.userId);
      
      req.user = {
        ...user,
        currentCompany: currentCompany,
        companyId: currentCompany?.id || null
      };
      
      next();
    } catch (error) {
      console.error('Error getting user company:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
};

// Middleware to require company access
const requireCompanyAccess = async (req, res, next) => {
  if (!req.user.companyId) {
    return res.status(403).json({ 
      error: 'No company access. Please join or create a company first.',
      requiresCompanySetup: true 
    });
  }
  next();
};

// Middleware to require owner role
const requireOwnerRole = async (req, res, next) => {
  if (!req.user.companyId) {
    return res.status(403).json({ error: 'No company access' });
  }
  
  try {
    const userRole = await Company.getUserRole(req.user.userId, req.user.companyId);
    if (!userRole || userRole.role !== 'owner') {
      return res.status(403).json({ error: 'Owner role required' });
    }
    next();
  } catch (error) {
    console.error('Error checking user role:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { 
  authenticateToken, 
  requireCompanyAccess, 
  requireOwnerRole 
};