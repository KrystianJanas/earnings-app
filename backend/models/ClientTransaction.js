const db = require('../config/database');

class ClientTransaction {
  static async create({ dailyEarningsId, amount, paymentMethod, clientOrder, notes }) {
    const result = await db.query(`
      INSERT INTO client_transactions (daily_earnings_id, amount, payment_method, client_order, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [dailyEarningsId, amount, paymentMethod, clientOrder, notes]);
    return result.rows[0];
  }

  static async createMultiple(dailyEarningsId, clients) {
    const client = await db.query('BEGIN');
    
    try {
      // First, delete existing client transactions for this day
      await db.query('DELETE FROM client_transactions WHERE daily_earnings_id = $1', [dailyEarningsId]);
      
      // Then insert new ones
      const results = [];
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        const result = await db.query(`
          INSERT INTO client_transactions (daily_earnings_id, amount, payment_method, client_order, notes)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [dailyEarningsId, client.amount, client.paymentMethod, i + 1, client.notes || null]);
        results.push(result.rows[0]);
      }
      
      await db.query('COMMIT');
      return results;
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  static async getByDailyEarningsId(dailyEarningsId) {
    const result = await db.query(`
      SELECT * FROM client_transactions 
      WHERE daily_earnings_id = $1 
      ORDER BY client_order ASC
    `, [dailyEarningsId]);
    return result.rows;
  }

  static async update(id, { amount, paymentMethod, notes }) {
    const result = await db.query(`
      UPDATE client_transactions 
      SET amount = $2, payment_method = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, amount, paymentMethod, notes]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM client_transactions WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async deleteByDailyEarningsId(dailyEarningsId) {
    const result = await db.query('DELETE FROM client_transactions WHERE daily_earnings_id = $1', [dailyEarningsId]);
    return result.rowCount;
  }

  // Get summary statistics for a day from client transactions
  static async getDailySummary(dailyEarningsId) {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END), 0) as total_cash,
        COALESCE(SUM(CASE WHEN payment_method = 'card' THEN amount ELSE 0 END), 0) as total_card,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(*) as client_count
      FROM client_transactions
      WHERE daily_earnings_id = $1
    `, [dailyEarningsId]);
    return result.rows[0] || { total_cash: 0, total_card: 0, total_amount: 0, client_count: 0 };
  }
}

module.exports = ClientTransaction;