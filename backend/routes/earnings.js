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
    const earnings = await Earnings.getByDateWithClients(req.user.userId, date);
    
    if (!earnings) {
      return res.json({
        date,
        entryMode: 'detailed', // Default to detailed for new entries
        cashAmount: 0,
        cardAmount: 0,
        tipsAmount: 0,
        clientsCount: 0,
        hoursWorked: 0,
        notes: '',
        clients: []
      });
    }

    res.json({
      date: earnings.date,
      entryMode: earnings.entry_mode || 'summary',
      cashAmount: parseFloat(earnings.cash_amount || 0),
      cardAmount: parseFloat(earnings.card_amount || 0),
      tipsAmount: parseFloat(earnings.tips_amount || 0),
      clientsCount: parseInt(earnings.clients_count || 0),
      hoursWorked: parseFloat(earnings.hours_worked || 0),
      notes: earnings.notes || '',
      clients: earnings.clients ? earnings.clients.map(client => ({
        id: client.id,
        amount: parseFloat(client.amount),
        paymentMethod: client.payment_method,
        clientOrder: client.client_order,
        notes: client.notes || ''
      })) : []
    });
  } catch (error) {
    console.error('Get day earnings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/day', [
  body('date').isISO8601().toDate(),
  body('entryMode').optional().isIn(['summary', 'detailed']),
  body('cashAmount').optional().isFloat({ min: 0 }),
  body('cardAmount').optional().isFloat({ min: 0 }),
  body('tipsAmount').optional().isFloat({ min: 0 }),
  body('clientsCount').optional().isInt({ min: 0 }),
  body('hoursWorked').optional().isFloat({ min: 0 }),
  body('notes').optional().isString(),
  body('clients').optional().isArray(),
  body('clients.*.amount').optional().isFloat({ min: 0 }),
  body('clients.*.paymentMethod').optional().isIn(['cash', 'card']),
  body('clients.*.notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, entryMode, cashAmount, cardAmount, tipsAmount, clientsCount, hoursWorked, notes, clients } = req.body;

    // For detailed mode, calculate amounts from clients if not provided
    let finalCashAmount = cashAmount;
    let finalCardAmount = cardAmount;
    let finalClientsCount = clientsCount;

    if (entryMode === 'detailed' && clients && clients.length > 0) {
      finalCashAmount = clients.filter(c => c.paymentMethod === 'cash').reduce((sum, c) => sum + c.amount, 0);
      finalCardAmount = clients.filter(c => c.paymentMethod === 'card').reduce((sum, c) => sum + c.amount, 0);
      finalClientsCount = clients.filter(c => parseFloat(c.amount) > 0).length; // Only count clients with amount > 0
    }

    const earnings = await Earnings.createOrUpdate({
      userId: req.user.userId,
      date,
      entryMode: entryMode || 'summary',
      cashAmount: finalCashAmount,
      cardAmount: finalCardAmount,
      tipsAmount,
      clientsCount: finalClientsCount,
      hoursWorked,
      notes,
      clients: clients || []
    });

    res.json({
      message: 'Earnings saved successfully',
      earnings: {
        date: earnings.date,
        entryMode: earnings.entry_mode,
        cashAmount: parseFloat(earnings.cash_amount || 0),
        cardAmount: parseFloat(earnings.card_amount || 0),
        tipsAmount: parseFloat(earnings.tips_amount || 0),
        clientsCount: parseInt(earnings.clients_count || 0),
        hoursWorked: parseFloat(earnings.hours_worked || 0),
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
    
    // Get user's hourly rate for estimated earnings calculation
    const hourlyRate = await UserSettings.getHourlyRate(req.user.userId);
    const totalHours = parseFloat(monthlyTotal.total_hours);
    const estimatedEarnings = hourlyRate * totalHours;

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      total: {
        earnings: parseFloat(monthlyTotal.total_earnings),
        cash: parseFloat(monthlyTotal.total_cash),
        card: parseFloat(monthlyTotal.total_card),
        tips: parseFloat(monthlyTotal.total_tips),
        clients: parseInt(monthlyTotal.total_clients),
        hours: parseFloat(monthlyTotal.total_hours),
        estimatedEarnings: estimatedEarnings,
        hourlyRate: hourlyRate
      },
      daily: dailyBreakdown.map(day => ({
        date: day.date,
        entryMode: day.entry_mode,
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