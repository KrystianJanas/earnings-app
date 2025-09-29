const express = require('express');
const { body, validationResult } = require('express-validator');
const UserSettings = require('../models/UserSettings');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const settings = await UserSettings.getOrCreate(req.user.userId, req.user.companyId);
    
    res.json({
      hourlyRate: parseFloat(settings.hourly_rate)
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/', [
  body('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hourlyRate } = req.body;

    const settings = await UserSettings.update(req.user.userId, req.user.companyId, { hourlyRate });

    res.json({
      message: 'Settings updated successfully',
      settings: {
        hourlyRate: parseFloat(settings.hourly_rate)
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;