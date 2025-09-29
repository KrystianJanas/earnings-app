const express = require('express');
const { body, validationResult } = require('express-validator');
const Earnings = require('../models/Earnings');
const UserSettings = require('../models/UserSettings');
const Company = require('../models/Company');
const { requireOwnerRole } = require('../middleware/auth');

const router = express.Router();

// Get employee statistics
router.get('/:userId/stats', requireOwnerRole, async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;
    
    // Verify that the user belongs to the current company
    const userRole = await Company.getUserRole(parseInt(userId), req.user.companyId);
    if (!userRole) {
      return res.status(404).json({ error: 'Employee not found in this company' });
    }

    let data;
    
    switch (period) {
      case 'day':
        const today = new Date().toISOString().split('T')[0];
        data = await Earnings.getUserDailyTotal(parseInt(userId), req.user.companyId, today);
        break;
      case 'week':
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
        data = await Earnings.getUserWeeklyTotal(parseInt(userId), req.user.companyId,
          weekStart.toISOString().split('T')[0], 
          weekEnd.toISOString().split('T')[0]
        );
        break;
      default: // 'month'
        data = await Earnings.getUserCurrentMonthTotal(parseInt(userId), req.user.companyId);
        break;
    }

    // Get employee's hourly rate
    const hourlyRate = await UserSettings.getHourlyRate(parseInt(userId), req.user.companyId);
    const totalHours = parseFloat(data.total_hours || 0);
    const estimatedPayout = hourlyRate * totalHours;
    const totalRevenue = parseFloat(data.total_earnings || 0);

    res.json({
      period,
      totalEarnings: totalRevenue,
      cashAmount: parseFloat(data.total_cash || 0),
      cardAmount: parseFloat(data.total_card || 0),
      blikAmount: parseFloat(data.total_blik || 0),
      prepaidAmount: parseFloat(data.total_prepaid || 0),
      transferAmount: parseFloat(data.total_transfer || 0),
      freeAmount: parseFloat(data.total_free || 0),
      clientsCount: parseInt(data.total_clients || 0),
      hoursWorked: totalHours,
      hourlyRate: hourlyRate,
      estimatedPayout: estimatedPayout,
      profit: Math.max(0, totalRevenue - estimatedPayout)
    });
  } catch (error) {
    console.error('Employee stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee hourly rate
router.put('/:userId/hourly-rate', requireOwnerRole, [
  body('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { hourlyRate } = req.body;
    
    // Verify that the user belongs to the current company
    const userRole = await Company.getUserRole(parseInt(userId), req.user.companyId);
    if (!userRole) {
      return res.status(404).json({ error: 'Employee not found in this company' });
    }

    const settings = await UserSettings.update(parseInt(userId), req.user.companyId, { hourlyRate });

    res.json({
      message: 'Hourly rate updated successfully',
      hourlyRate: parseFloat(settings.hourly_rate)
    });
  } catch (error) {
    console.error('Update hourly rate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;