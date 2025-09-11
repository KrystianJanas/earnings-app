const express = require('express');
const { body, validationResult } = require('express-validator');
const Earnings = require('../models/Earnings');
const UserSettings = require('../models/UserSettings');

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const { period = 'month', date } = req.query;
    let data;

    const today = new Date().toISOString().split('T')[0];
    const currentDate = date || today;

    switch (period) {
      case 'day':
        data = await Earnings.getDailyTotal(req.user.userId, currentDate);
        break;
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
        data = await Earnings.getWeeklyTotal(req.user.userId, 
          weekStart.toISOString().split('T')[0], 
          weekEnd.toISOString().split('T')[0]
        );
        break;
      case 'prev-month':
        const prevMonth = new Date();
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        data = await Earnings.getMonthlyTotal(req.user.userId, prevMonth.getFullYear(), prevMonth.getMonth() + 1);
        break;
      case 'year':
        const year = new Date(currentDate).getFullYear();
        data = await Earnings.getYearlyTotal(req.user.userId, year);
        break;
      case 'all':
        data = await Earnings.getAllTimeTotal(req.user.userId);
        break;
      default: // 'month'
        data = await Earnings.getCurrentMonthTotal(req.user.userId);
        break;
    }
    
    // Get user's hourly rate for estimated earnings calculation
    const hourlyRate = await UserSettings.getHourlyRate(req.user.userId);
    const totalHours = parseFloat(data.total_hours);
    const estimatedEarnings = hourlyRate * totalHours;

    res.json({
      period,
      data: {
        totalEarnings: parseFloat(data.total_earnings),
        cashAmount: parseFloat(data.total_cash),
        cardAmount: parseFloat(data.total_card),
        tipsAmount: parseFloat(data.total_tips),
        clientsCount: parseInt(data.total_clients),
        hoursWorked: totalHours,
        estimatedEarnings: estimatedEarnings,
        hourlyRate: hourlyRate
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/day/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const earnings = await Earnings.getByDate(req.user.userId, date);
    
    if (!earnings) {
      return res.json({
        date,
        cashAmount: 0,
        cardAmount: 0,
        tipsAmount: 0,
        clientsCount: 0,
        hoursWorked: 0,
        notes: ''
      });
    }

    res.json({
      date: earnings.date,
      cashAmount: parseFloat(earnings.cash_amount),
      cardAmount: parseFloat(earnings.card_amount),
      tipsAmount: parseFloat(earnings.tips_amount),
      clientsCount: parseInt(earnings.clients_count),
      hoursWorked: parseFloat(earnings.hours_worked),
      notes: earnings.notes || ''
    });
  } catch (error) {
    console.error('Get day earnings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/day', [
  body('date').isISO8601().toDate(),
  body('cashAmount').optional().isFloat({ min: 0 }),
  body('cardAmount').optional().isFloat({ min: 0 }),
  body('tipsAmount').optional().isFloat({ min: 0 }),
  body('clientsCount').optional().isInt({ min: 0 }),
  body('hoursWorked').optional().isFloat({ min: 0 }),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, cashAmount, cardAmount, tipsAmount, clientsCount, hoursWorked, notes } = req.body;

    const earnings = await Earnings.createOrUpdate({
      userId: req.user.userId,
      date,
      cashAmount,
      cardAmount,
      tipsAmount,
      clientsCount,
      hoursWorked,
      notes
    });

    res.json({
      message: 'Earnings saved successfully',
      earnings: {
        date: earnings.date,
        cashAmount: parseFloat(earnings.cash_amount),
        cardAmount: parseFloat(earnings.card_amount),
        tipsAmount: parseFloat(earnings.tips_amount),
        clientsCount: parseInt(earnings.clients_count),
        hoursWorked: parseFloat(earnings.hours_worked),
        notes: earnings.notes
      }
    });
  } catch (error) {
    console.error('Save earnings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/monthly/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const monthlyTotal = await Earnings.getMonthlyTotal(req.user.userId, year, month);
    const dailyBreakdown = await Earnings.getMonthlyBreakdown(req.user.userId, year, month);

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      total: {
        earnings: parseFloat(monthlyTotal.total_earnings),
        cash: parseFloat(monthlyTotal.total_cash),
        card: parseFloat(monthlyTotal.total_card),
        tips: parseFloat(monthlyTotal.total_tips),
        clients: parseInt(monthlyTotal.total_clients),
        hours: parseFloat(monthlyTotal.total_hours)
      },
      daily: dailyBreakdown.map(day => ({
        date: day.date,
        cashAmount: parseFloat(day.cash_amount),
        cardAmount: parseFloat(day.card_amount),
        tipsAmount: parseFloat(day.tips_amount),
        clientsCount: parseInt(day.clients_count),
        hoursWorked: parseFloat(day.hours_worked),
        totalDaily: parseFloat(day.total_daily),
        notes: day.notes
      }))
    });
  } catch (error) {
    console.error('Monthly earnings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;