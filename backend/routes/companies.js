const express = require('express');
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const CompanyInvitation = require('../models/CompanyInvitation');
const { requireOwnerRole, requireCompanyAccess } = require('../middleware/auth');

const router = express.Router();

// Get user's companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.getByUserId(req.user.userId);
    res.json(companies);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current company details
router.get('/current', async (req, res) => {
  try {
    if (!req.user.currentCompany) {
      return res.json(null);
    }
    
    const userRole = await Company.getUserRole(req.user.userId, req.user.currentCompany.id);
    
    res.json({
      ...req.user.currentCompany,
      userRole: userRole?.role || null
    });
  } catch (error) {
    console.error('Get current company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Switch current company
router.post('/switch/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    await Company.switchUserCompany(req.user.userId, parseInt(companyId));
    
    res.json({ message: 'Company switched successfully' });
  } catch (error) {
    console.error('Switch company error:', error);
    if (error.message === 'User does not have access to this company') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Create new company
router.post('/', [
  body('name').isString().isLength({ min: 2, max: 255 }).trim(),
  body('description').optional().isString().isLength({ max: 1000 }).trim(),
  body('address').optional().isString().isLength({ max: 500 }).trim(),
  body('phone').optional().isString().isLength({ max: 20 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('website').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, address, phone, email, website } = req.body;
    
    const company = await Company.create({
      name,
      description,
      address,
      phone,
      email,
      website,
      ownerId: req.user.userId
    });

    res.status(201).json(company);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update company (owner only)
router.put('/:id', requireCompanyAccess, requireOwnerRole, [
  body('name').optional().isString().isLength({ min: 2, max: 255 }).trim(),
  body('description').optional().isString().isLength({ max: 1000 }).trim(),
  body('address').optional().isString().isLength({ max: 500 }).trim(),
  body('phone').optional().isString().isLength({ max: 20 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('website').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, address, phone, email, website } = req.body;
    
    // Verify user owns this company
    if (parseInt(id) !== req.user.companyId) {
      return res.status(403).json({ error: 'Can only update current company' });
    }
    
    const company = await Company.update(id, {
      name, description, address, phone, email, website
    });

    res.json(company);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company employees (owner only)
router.get('/:id/employees', requireCompanyAccess, requireOwnerRole, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (parseInt(id) !== req.user.companyId) {
      return res.status(403).json({ error: 'Can only view current company employees' });
    }
    
    const employees = await Company.getEmployees(id);
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove employee (owner only)
router.delete('/:id/employees/:userId', requireCompanyAccess, requireOwnerRole, async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    if (parseInt(id) !== req.user.companyId) {
      return res.status(403).json({ error: 'Can only manage current company employees' });
    }
    
    await Company.removeEmployee(id, userId);
    res.json({ message: 'Employee removed successfully' });
  } catch (error) {
    console.error('Remove employee error:', error);
    if (error.message === 'Cannot remove the sole owner of a company') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update employee role (owner only)
router.put('/:id/employees/:userId/role', requireCompanyAccess, requireOwnerRole, [
  body('role').isIn(['owner', 'employee'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, userId } = req.params;
    const { role } = req.body;
    
    if (parseInt(id) !== req.user.companyId) {
      return res.status(403).json({ error: 'Can only manage current company employees' });
    }
    
    await Company.updateEmployeeRole(id, userId, role);
    res.json({ message: 'Employee role updated successfully' });
  } catch (error) {
    console.error('Update employee role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company invitations (owner only)
router.get('/:id/invitations', requireCompanyAccess, requireOwnerRole, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (parseInt(id) !== req.user.companyId) {
      return res.status(403).json({ error: 'Can only view current company invitations' });
    }
    
    const invitations = await CompanyInvitation.getByCompanyId(id);
    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create invitation (owner only)
router.post('/:id/invitations', requireCompanyAccess, requireOwnerRole, [
  body('email').isEmail().normalizeEmail(),
  body('role').optional().isIn(['owner', 'employee'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { email, role = 'employee' } = req.body;
    
    if (parseInt(id) !== req.user.companyId) {
      return res.status(403).json({ error: 'Can only invite to current company' });
    }
    
    const invitation = await CompanyInvitation.create({
      companyId: id,
      inviterId: req.user.userId,
      invitedEmail: email,
      role
    });

    res.status(201).json(invitation);
  } catch (error) {
    console.error('Create invitation error:', error);
    if (error.message.includes('already exists') || error.message.includes('already a member')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Cancel invitation (owner only)
router.delete('/:id/invitations/:invitationId', requireCompanyAccess, requireOwnerRole, async (req, res) => {
  try {
    const { id, invitationId } = req.params;
    
    if (parseInt(id) !== req.user.companyId) {
      return res.status(403).json({ error: 'Can only manage current company invitations' });
    }
    
    await CompanyInvitation.cancel(invitationId);
    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;