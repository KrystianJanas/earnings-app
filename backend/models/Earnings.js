const db = require('../config/database');
const ClientTransaction = require('./ClientTransaction');

class Earnings {
  static async createOrUpdate({ userId, companyId, date, cashAmount, cardAmount, tipsAmount, clientsCount, hoursWorked, notes, entryMode = 'summary', clients = [] }) {
    await db.query('BEGIN');
    
    try {
      // Create or update the daily earnings record
      const result = await db.query(`
        INSERT INTO daily_earnings (user_id, company_id, date, cash_amount, card_amount, tips_amount, clients_count, hours_worked, notes, entry_mode)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id, date)
        DO UPDATE SET
          company_id = EXCLUDED.company_id,
          cash_amount = EXCLUDED.cash_amount,
          card_amount = EXCLUDED.card_amount,
          tips_amount = EXCLUDED.tips_amount,
          clients_count = EXCLUDED.clients_count,
          hours_worked = EXCLUDED.hours_worked,
          notes = EXCLUDED.notes,
          entry_mode = EXCLUDED.entry_mode,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [userId, companyId, date, cashAmount || 0, cardAmount || 0, tipsAmount || 0, clientsCount || 0, hoursWorked || 0, notes, entryMode]);
      
      const dailyEarnings = result.rows[0];
      
      // If detailed mode, handle client transactions (if tables exist)
      if (entryMode === 'detailed' && clients && clients.length > 0) {
        try {
          await ClientTransaction.createMultiple(dailyEarnings.id, clients, userId, companyId);
        } catch (error) {
          console.warn('ClientTransaction tables not found, skipping detailed client data:', error.message);
          // Continue without client transaction details
        }
      } else if (entryMode === 'summary') {
        // If switching to summary mode, clean up any existing client transactions
        try {
          await ClientTransaction.deleteByDailyEarningsId(dailyEarnings.id);
        } catch (error) {
          console.warn('ClientTransaction tables not found, skipping cleanup:', error.message);
          // Continue without cleanup
        }
      }
      
      await db.query('COMMIT');
      return dailyEarnings;
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  static async getByDate(userId, companyId, date) {
    const result = await db.query(
      'SELECT * FROM daily_earnings WHERE user_id = $1 AND company_id = $2 AND date = $3',
      [userId, companyId, date]
    );
    return result.rows[0];
  }

  static async getByDateWithClients(userId, companyId, date) {
    const dailyEarnings = await this.getByDate(userId, companyId, date);
    if (!dailyEarnings) return null;
    
    // If detailed mode, get client transactions
    if (dailyEarnings.entry_mode === 'detailed') {
      const clients = await ClientTransaction.getByDailyEarningsId(dailyEarnings.id);
      return { ...dailyEarnings, clients };
    }
    
    return { ...dailyEarnings, clients: [] };
  }

  static async getMonthlyTotal(companyId, year, month) {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(effective_cash_amount), 0) as total_cash,
        COALESCE(SUM(effective_card_amount), 0) as total_card,
        COALESCE(SUM(effective_blik_amount), 0) as total_blik,
        COALESCE(SUM(effective_prepaid_amount), 0) as total_prepaid,
        COALESCE(SUM(effective_transfer_amount), 0) as total_transfer,
        COALESCE(SUM(effective_free_amount), 0) as total_free,
        COALESCE(SUM(tips_amount), 0) as total_tips,
        COALESCE(SUM(effective_clients_count), 0) as total_clients,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(effective_cash_amount + effective_card_amount + effective_blik_amount + effective_prepaid_amount + effective_transfer_amount), 0) as total_earnings
      FROM daily_earnings_complete 
      WHERE company_id = $1 
        AND EXTRACT(YEAR FROM date) = $2 
        AND EXTRACT(MONTH FROM date) = $3
    `, [companyId, year, month]);
    return result.rows[0];
  }

  static async getMonthlyBreakdown(companyId, year, month) {
    const result = await db.query(`
      SELECT 
        date,
        entry_mode,
        effective_cash_amount as cash_amount,
        effective_card_amount as card_amount,
        tips_amount,
        effective_clients_count as clients_count,
        hours_worked,
        (effective_cash_amount + effective_card_amount) as total_daily,
        notes
      FROM daily_earnings_complete 
      WHERE company_id = $1 
        AND EXTRACT(YEAR FROM date) = $2 
        AND EXTRACT(MONTH FROM date) = $3
      ORDER BY date ASC
    `, [companyId, year, month]);
    return result.rows;
  }

  static async getCurrentMonthTotal(companyId) {
    const now = new Date();
    return this.getMonthlyTotal(companyId, now.getFullYear(), now.getMonth() + 1);
  }

  static async getDailyTotal(companyId, date) {
    const result = await db.query(`
      SELECT 
        COALESCE(effective_cash_amount, 0) as total_cash,
        COALESCE(effective_card_amount, 0) as total_card,
        COALESCE(effective_blik_amount, 0) as total_blik,
        COALESCE(effective_prepaid_amount, 0) as total_prepaid,
        COALESCE(effective_transfer_amount, 0) as total_transfer,
        COALESCE(effective_free_amount, 0) as total_free,
        COALESCE(tips_amount, 0) as total_tips,
        COALESCE(effective_clients_count, 0) as total_clients,
        COALESCE(hours_worked, 0) as total_hours,
        COALESCE(effective_cash_amount + effective_card_amount + effective_blik_amount + effective_prepaid_amount + effective_transfer_amount, 0) as total_earnings
      FROM daily_earnings_complete 
      WHERE company_id = $1 AND date = $2
    `, [companyId, date]);
    return result.rows[0] || { total_cash: 0, total_card: 0, total_blik: 0, total_prepaid: 0, total_transfer: 0, total_free: 0, total_tips: 0, total_clients: 0, total_hours: 0, total_earnings: 0 };
  }

  static async getWeeklyTotal(companyId, startDate, endDate) {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(effective_cash_amount), 0) as total_cash,
        COALESCE(SUM(effective_card_amount), 0) as total_card,
        COALESCE(SUM(effective_blik_amount), 0) as total_blik,
        COALESCE(SUM(effective_prepaid_amount), 0) as total_prepaid,
        COALESCE(SUM(effective_transfer_amount), 0) as total_transfer,
        COALESCE(SUM(effective_free_amount), 0) as total_free,
        COALESCE(SUM(tips_amount), 0) as total_tips,
        COALESCE(SUM(effective_clients_count), 0) as total_clients,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(effective_cash_amount + effective_card_amount + effective_blik_amount + effective_prepaid_amount + effective_transfer_amount), 0) as total_earnings
      FROM daily_earnings_complete 
      WHERE company_id = $1 AND date >= $2 AND date <= $3
    `, [companyId, startDate, endDate]);
    return result.rows[0];
  }

  static async getYearlyTotal(companyId, year) {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(effective_cash_amount), 0) as total_cash,
        COALESCE(SUM(effective_card_amount), 0) as total_card,
        COALESCE(SUM(effective_blik_amount), 0) as total_blik,
        COALESCE(SUM(effective_prepaid_amount), 0) as total_prepaid,
        COALESCE(SUM(effective_transfer_amount), 0) as total_transfer,
        COALESCE(SUM(effective_free_amount), 0) as total_free,
        COALESCE(SUM(tips_amount), 0) as total_tips,
        COALESCE(SUM(effective_clients_count), 0) as total_clients,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(effective_cash_amount + effective_card_amount + effective_blik_amount + effective_prepaid_amount + effective_transfer_amount), 0) as total_earnings
      FROM daily_earnings_complete 
      WHERE company_id = $1 AND EXTRACT(YEAR FROM date) = $2
    `, [companyId, year]);
    return result.rows[0];
  }

  static async getAllTimeTotal(companyId) {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(effective_cash_amount), 0) as total_cash,
        COALESCE(SUM(effective_card_amount), 0) as total_card,
        COALESCE(SUM(effective_blik_amount), 0) as total_blik,
        COALESCE(SUM(effective_prepaid_amount), 0) as total_prepaid,
        COALESCE(SUM(effective_transfer_amount), 0) as total_transfer,
        COALESCE(SUM(effective_free_amount), 0) as total_free,
        COALESCE(SUM(tips_amount), 0) as total_tips,
        COALESCE(SUM(effective_clients_count), 0) as total_clients,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(effective_cash_amount + effective_card_amount + effective_blik_amount + effective_prepaid_amount + effective_transfer_amount), 0) as total_earnings
      FROM daily_earnings_complete 
      WHERE company_id = $1
    `, [companyId]);
    return result.rows[0];
  }

  // User-specific methods for employee statistics
  static async getUserDailyTotal(userId, companyId, date) {
    const result = await db.query(`
      SELECT 
        COALESCE(effective_cash_amount, 0) as total_cash,
        COALESCE(effective_card_amount, 0) as total_card,
        COALESCE(effective_blik_amount, 0) as total_blik,
        COALESCE(effective_prepaid_amount, 0) as total_prepaid,
        COALESCE(effective_transfer_amount, 0) as total_transfer,
        COALESCE(effective_free_amount, 0) as total_free,
        COALESCE(tips_amount, 0) as total_tips,
        COALESCE(effective_clients_count, 0) as total_clients,
        COALESCE(hours_worked, 0) as total_hours,
        COALESCE(effective_cash_amount + effective_card_amount + effective_blik_amount + effective_prepaid_amount + effective_transfer_amount, 0) as total_earnings
      FROM daily_earnings_complete 
      WHERE user_id = $1 AND company_id = $2 AND date = $3
    `, [userId, companyId, date]);
    return result.rows[0] || { total_cash: 0, total_card: 0, total_blik: 0, total_prepaid: 0, total_transfer: 0, total_free: 0, total_tips: 0, total_clients: 0, total_hours: 0, total_earnings: 0 };
  }

  static async getUserWeeklyTotal(userId, companyId, startDate, endDate) {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(effective_cash_amount), 0) as total_cash,
        COALESCE(SUM(effective_card_amount), 0) as total_card,
        COALESCE(SUM(effective_blik_amount), 0) as total_blik,
        COALESCE(SUM(effective_prepaid_amount), 0) as total_prepaid,
        COALESCE(SUM(effective_transfer_amount), 0) as total_transfer,
        COALESCE(SUM(effective_free_amount), 0) as total_free,
        COALESCE(SUM(tips_amount), 0) as total_tips,
        COALESCE(SUM(effective_clients_count), 0) as total_clients,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(effective_cash_amount + effective_card_amount + effective_blik_amount + effective_prepaid_amount + effective_transfer_amount), 0) as total_earnings
      FROM daily_earnings_complete 
      WHERE user_id = $1 AND company_id = $2 AND date >= $3 AND date <= $4
    `, [userId, companyId, startDate, endDate]);
    return result.rows[0];
  }

  static async getUserCurrentMonthTotal(userId, companyId) {
    const now = new Date();
    return this.getUserMonthlyTotal(userId, companyId, now.getFullYear(), now.getMonth() + 1);
  }

  static async getUserMonthlyTotal(userId, companyId, year, month) {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(effective_cash_amount), 0) as total_cash,
        COALESCE(SUM(effective_card_amount), 0) as total_card,
        COALESCE(SUM(effective_blik_amount), 0) as total_blik,
        COALESCE(SUM(effective_prepaid_amount), 0) as total_prepaid,
        COALESCE(SUM(effective_transfer_amount), 0) as total_transfer,
        COALESCE(SUM(effective_free_amount), 0) as total_free,
        COALESCE(SUM(tips_amount), 0) as total_tips,
        COALESCE(SUM(effective_clients_count), 0) as total_clients,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(effective_cash_amount + effective_card_amount + effective_blik_amount + effective_prepaid_amount + effective_transfer_amount), 0) as total_earnings
      FROM daily_earnings_complete 
      WHERE user_id = $1 AND company_id = $2 
        AND EXTRACT(YEAR FROM date) = $3 
        AND EXTRACT(MONTH FROM date) = $4
    `, [userId, companyId, year, month]);
    return result.rows[0];
  }
}

module.exports = Earnings;