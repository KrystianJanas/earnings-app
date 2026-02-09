const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Service = require('../models/Service');
const { requireOwnerRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/services - list active services for current company (all users)
router.get('/', async (req, res) => {
  try {
    const services = await Service.getByCompanyId(req.user.companyId);
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/services/search?q=xxx - search services
router.get('/search', [
  query('q').isString().isLength({ min: 1, max: 100 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const services = await Service.search({
      companyId: req.user.companyId,
      query: req.query.q
    });
    res.json(services);
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/services - create service (owner only)
router.post('/', requireOwnerRole, [
  body('name').isString().isLength({ min: 1, max: 255 }).trim(),
  body('price').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price } = req.body;
    const service = await Service.create({
      companyId: req.user.companyId,
      name,
      price,
      userId: req.user.userId
    });

    res.status(201).json(service);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Usługa o tej nazwie już istnieje' });
    }
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/services/:id - update service (owner only)
router.put('/:id', requireOwnerRole, [
  body('name').optional().isString().isLength({ min: 1, max: 255 }).trim(),
  body('price').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const existing = await Service.getById(id);
    if (!existing || existing.company_id !== req.user.companyId) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const { name, price } = req.body;
    const service = await Service.update(id, {
      name,
      price,
      userId: req.user.userId
    });

    res.json(service);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Usługa o tej nazwie już istnieje' });
    }
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/services/:id - deactivate service (owner only)
router.delete('/:id', requireOwnerRole, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Service.getById(id);
    if (!existing || existing.company_id !== req.user.companyId) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const service = await Service.deactivate(id);
    res.json({ message: 'Service deactivated', service });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/services/:id/activate - reactivate service (owner only)
router.put('/:id/activate', requireOwnerRole, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Service.getById(id);
    if (!existing || existing.company_id !== req.user.companyId) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const service = await Service.activate(id);
    res.json(service);
  } catch (error) {
    console.error('Activate service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/services/:id/price-history - get price history (owner only)
router.get('/:id/price-history', requireOwnerRole, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Service.getById(id);
    if (!existing || existing.company_id !== req.user.companyId) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const history = await Service.getPriceHistory(id);
    res.json(history);
  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
