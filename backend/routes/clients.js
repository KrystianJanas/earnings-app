const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Client = require('../models/Client');

const router = express.Router();

// Search clients
router.get('/search', [
  query('q').isString().isLength({ min: 2, max: 100 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q: query } = req.query;
    const results = await Client.search({ 
      companyId: req.user.companyId, 
      query,
      limit: 10 
    });

    res.json(results);
  } catch (error) {
    console.error('Client search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all clients for user
router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { limit = 50, offset = 0 } = req.query;
    const clients = await Client.getByCompanyId({
      companyId: req.user.companyId,
      limit,
      offset
    });

    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific client
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.getById(id);
    
    if (!client || client.company_id !== req.user.companyId) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new client
router.post('/', [
  body('fullName').isString().isLength({ min: 2, max: 255 }).trim(),
  body('phone').optional({ checkFalsy: true }).isString().isLength({ max: 20 }).trim(),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('notes').optional({ checkFalsy: true }).isString().isLength({ max: 1000 }).trim()
], async (req, res) => {
  try {
    console.log('📥 Creating client, received data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Client validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, phone, email, notes } = req.body;
    
    const client = await Client.findOrCreate({
      userId: req.user.userId,
      companyId: req.user.companyId,
      fullName,
      phone,
      email,
      notes
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Client with this name already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update client
router.put('/:id', [
  body('fullName').optional().isString().isLength({ min: 2, max: 255 }).trim(),
  body('phone').optional().isString().isLength({ max: 20 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('notes').optional().isString().isLength({ max: 1000 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { fullName, phone, email, notes } = req.body;

    // First verify the client belongs to the user
    const existingClient = await Client.getById(id);
    if (!existingClient || existingClient.company_id !== req.user.companyId) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updatedClient = await Client.update(id, {
      fullName,
      phone,
      email,
      notes
    });

    res.json(updatedClient);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First verify the client belongs to the user
    const existingClient = await Client.getById(id);
    if (!existingClient || existingClient.company_id !== req.user.companyId) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await Client.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client transaction history
router.get('/:id/transactions', [
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { limit = 20 } = req.query;

    // First verify the client belongs to the user
    const client = await Client.getById(id);
    if (!client || client.company_id !== req.user.companyId) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const transactions = await Client.getTransactionHistory(id, limit);
    res.json(transactions);
  } catch (error) {
    console.error('Get client transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;