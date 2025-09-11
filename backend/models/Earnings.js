const db = require('../config/database');

class Earnings {
  static async createOrUpdate({ userId, date, cashAmount, cardAmount, tipsAmount, clientsCount, hoursWorked, notes }) {
    const result = await db.query(`
      INSERT INTO daily_earnings (user_id, date, cash_amount, card_amount, tips_amount, clients_count, hours_worked, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id, date)
      DO UPDATE SET
        cash_amount = EXCLUDED.cash_amount,
        card_amount = EXCLUDED.card_amount,
        tips_amount = EXCLUDED.tips_amount,
        clients_count = EXCLUDED.clients_count,
        hours_worked = EXCLUDED.hours_worked,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, date, cashAmount || 0, cardAmount || 0, tipsAmount || 0, clientsCount || 0, hoursWorked || 0, notes]);
    return result.rows[0];
  }

  static async getByDate(userId, date) {
    const result = await db.query(
      'SELECT * FROM daily_earnings WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    return result.rows[0];
  }

  static async getMonthlyTotal(userId, year, month) {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(cash_amount), 0) as total_cash,
        COALESCE(SUM(card_amount), 0) as total_card,
        COALESCE(SUM(tips_amount), 0) as total_tips,
        COALESCE(SUM(clients_count), 0) as total_clients,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(cash_amount + card_amount), 0) as total_earnings
      FROM daily_earnings 
      WHERE user_id = $1 
        AND EXTRACT(YEAR FROM date) = $2 
        AND EXTRACT(MONTH FROM date) = $3
    `, [userId, year, month]);
    return result.rows[0];
  }

  static async getMonthlyBreakdown(userId, year, month) {
    const result = await db.query(`
      SELECT 
        date,
        cash_amount,
        card_amount,
        tips_amount,
        clients_count,
        hours_worked,
        (cash_amount + card_amount) as total_daily,
        notes
      FROM daily_earnings 
      WHERE user_id = $1 
        AND EXTRACT(YEAR FROM date) = $2 
        AND EXTRACT(MONTH FROM date) = $3
      ORDER BY date ASC
    `, [userId, year, month]);
    return result.rows;
  }

  static async getCurrentMonthTotal(userId) {
    const now = new Date();
    return this.getMonthlyTotal(userId, now.getFullYear(), now.getMonth() + 1);
  }

  static async getDailyTotal(userId, date) {
    const result = await db.query(`
      SELECT 
        COALESCE(cash_amount, 0) as total_cash,
        COALESCE(card_amount, 0) as total_card,
        COALESCE(tips_amount, 0) as total_tips,
        COALESCE(clients_count, 0) as total_clients,
        COALESCE(hours_worked, 0) as total_hours,
        COALESCE(cash_amount + card_amount, 0) as total_earnings
      FROM daily_earnings 
      WHERE user_id = $1 AND date = $2
    `, [userId, date]);
    return result.rows[0] || { total_cash: 0, total_card: 0, total_tips: 0, total_clients: 0, total_hours: 0, total_earnings: 0 };
  }

  static async getWeeklyTotal(userId, startDate, endDate) {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(cash_amount), 0) as total_cash,
        COALESCE(SUM(card_amount), 0) as total_card,
        COALESCE(SUM(tips_amount), 0) as total_tips,
        COALESCE(SUM(clients_count), 0) as total_clients,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(cash_amount + card_amount), 0) as total_earnings
      FROM daily_earnings 
      WHERE user_id = $1 AND date >= $2 AND date <= $3
    `, [userId, startDate, endDate]);
    return result.rows[0];
  }

  static async getYearlyTotal(userId, year) {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(cash_amount), 0) as total_cash,
        COALESCE(SUM(card_amount), 0) as total_card,
        COALESCE(SUM(tips_amount), 0) as total_tips,
        COALESCE(SUM(clients_count), 0) as total_clients,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(cash_amount + card_amount), 0) as total_earnings
      FROM daily_earnings 
      WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2
    `, [userId, year]);
    return result.rows[0];
  }

  static async getAllTimeTotal(userId) {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(cash_amount), 0) as total_cash,
        COALESCE(SUM(card_amount), 0) as total_card,
        COALESCE(SUM(tips_amount), 0) as total_tips,
        COALESCE(SUM(clients_count), 0) as total_clients,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(cash_amount + card_amount), 0) as total_earnings
      FROM daily_earnings 
      WHERE user_id = $1
    `, [userId]);
    return result.rows[0];
  }
}

module.exports = Earnings;