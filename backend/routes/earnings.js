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
        data = await Earnings.getDailyTotal(req.user.companyId, currentDate);
        break;
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
        data = await Earnings.getWeeklyTotal(req.user.companyId, 
          weekStart.toISOString().split('T')[0], 
          weekEnd.toISOString().split('T')[0]
        );
        break;
      case 'prev-month':
        const prevMonth = new Date();
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        data = await Earnings.getMonthlyTotal(req.user.companyId, prevMonth.getFullYear(), prevMonth.getMonth() + 1);
        break;
      case 'year':
        const year = new Date(currentDate).getFullYear();
        data = await Earnings.getYearlyTotal(req.user.companyId, year);
        break;
      case 'all':
        data = await Earnings.getAllTimeTotal(req.user.companyId);
        break;
      default: // 'month'
        data = await Earnings.getCurrentMonthTotal(req.user.companyId);
        break;
    }
    
    // Get user's hourly rate for estimated earnings calculation
    const hourlyRate = await UserSettings.getHourlyRate(req.user.userId, req.user.companyId);
    const totalHours = parseFloat(data.total_hours);
    const estimatedEarnings = hourlyRate * totalHours;

    res.json({
      period,
      data: {
        totalEarnings: parseFloat(data.total_earnings),
        cashAmount: parseFloat(data.total_cash),
        cardAmount: parseFloat(data.total_card),
        blikAmount: parseFloat(data.total_blik || 0),
        prepaidAmount: parseFloat(data.total_prepaid || 0),
        transferAmount: parseFloat(data.total_transfer || 0),
        freeAmount: parseFloat(data.total_free || 0),
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
    const earnings = await Earnings.getByDateWithClients(req.user.userId, req.user.companyId, date);
    
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
        amount: parseFloat(client.amount || 0),
        paymentMethod: client.payment_method,
        clientOrder: client.client_order,
        notes: client.notes || '',
        clientId: client.client_id,
        clientName: client.client_name,
        clientPhone: client.client_phone,
        clientEmail: client.client_email,
        payments: client.payments || (client.payment_method ? 
          [{ amount: parseFloat(client.amount || 0), method: client.payment_method }] : 
          [{ amount: 0, method: 'cash' }]
        )
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
  body('clients.*.paymentMethod').optional().isIn(['cash', 'card', 'blik', 'prepaid', 'transfer', 'free']),
  body('clients.*.payments').optional().isArray(),
  body('clients.*.payments.*.amount').optional().isFloat({ min: 0 }),
  body('clients.*.payments.*.method').optional().isIn(['cash', 'card', 'blik', 'prepaid', 'transfer', 'free']),
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
      // Calculate totals from either new payment structure or legacy structure
      let totalCash = 0;
      let totalCard = 0;
      let validClientsCount = 0;
      
      clients.forEach(client => {
        if (client.payments && client.payments.length > 0) {
          // New multiple payment structure
          const clientTotal = client.payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
          if (clientTotal > 0) {
            validClientsCount++;
            client.payments.forEach(payment => {
              const amount = parseFloat(payment.amount || 0);
              if (payment.method === 'cash') totalCash += amount;
              else if (payment.method === 'card') totalCard += amount;
              // Note: other payment methods (blik, prepaid, transfer, free) are handled separately
            });
          }
        } else if (client.amount && parseFloat(client.amount) > 0) {
          // Legacy single payment structure
          validClientsCount++;
          if (client.paymentMethod === 'cash') {
            totalCash += parseFloat(client.amount);
          } else if (client.paymentMethod === 'card') {
            totalCard += parseFloat(client.amount);
          }
        }
      });
      
      finalCashAmount = totalCash;
      finalCardAmount = totalCard;
      finalClientsCount = validClientsCount;
    }

    const earnings = await Earnings.createOrUpdate({
      userId: req.user.userId,
      companyId: req.user.companyId,
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
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/monthly/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const monthlyTotal = await Earnings.getMonthlyTotal(req.user.companyId, year, month);
    const dailyBreakdown = await Earnings.getMonthlyBreakdown(req.user.companyId, year, month);
    
    // Get user's hourly rate for estimated earnings calculation
    const hourlyRate = await UserSettings.getHourlyRate(req.user.userId, req.user.companyId);
    const totalHours = parseFloat(monthlyTotal.total_hours);
    const estimatedEarnings = hourlyRate * totalHours;

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      total: {
        earnings: parseFloat(monthlyTotal.total_earnings),
        cash: parseFloat(monthlyTotal.total_cash),
        card: parseFloat(monthlyTotal.total_card),
        blik: parseFloat(monthlyTotal.total_blik || 0),
        prepaid: parseFloat(monthlyTotal.total_prepaid || 0),
        transfer: parseFloat(monthlyTotal.total_transfer || 0),
        free: parseFloat(monthlyTotal.total_free || 0),
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