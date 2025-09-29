const db = require('../config/database');
const Client = require('./Client');

class ClientTransaction {
  static async create({ dailyEarningsId, amount, paymentMethod, clientOrder, notes, payments }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      if (payments && payments.length > 1) {
        // New multiple payments structure
        const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
        
        const transactionResult = await client.query(`
          INSERT INTO client_transactions (daily_earnings_id, total_amount, has_multiple_payments, client_order, notes)
          VALUES ($1, $2, TRUE, $3, $4)
          RETURNING *
        `, [dailyEarningsId, totalAmount, clientOrder, notes]);
        
        const transaction = transactionResult.rows[0];
        
        // Insert individual payments
        for (const payment of payments) {
          if (parseFloat(payment.amount || 0) > 0) {
            await client.query(`
              INSERT INTO client_payment_methods (client_transaction_id, amount, payment_method)
              VALUES ($1, $2, $3)
            `, [transaction.id, payment.amount, payment.method]);
          }
        }
        
        await client.query('COMMIT');
        return transaction;
      } else {
        // Legacy single payment structure
        const result = await client.query(`
          INSERT INTO client_transactions (daily_earnings_id, amount, payment_method, client_order, notes, has_multiple_payments)
          VALUES ($1, $2, $3, $4, $5, FALSE)
          RETURNING *
        `, [dailyEarningsId, amount, paymentMethod, clientOrder, notes]);
        
        await client.query('COMMIT');
        return result.rows[0];
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async createMultiple(dailyEarningsId, clients, userId, companyId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // First, delete existing client transactions for this day (this will cascade delete payment methods too)
      await client.query('DELETE FROM client_transactions WHERE daily_earnings_id = $1', [dailyEarningsId]);
      
      // Then insert new ones
      const results = [];
      for (let i = 0; i < clients.length; i++) {
        const clientData = clients[i];
        let clientId = null;
        
        // Handle client data if provided
        if (clientData.clientName && clientData.clientName.trim()) {
          const clientRecord = await Client.findOrCreate({
            userId,
            companyId,
            fullName: clientData.clientName.trim(),
            phone: clientData.clientPhone,
            email: clientData.clientEmail
          });
          clientId = clientRecord.id;
        }
        
        if (clientData.payments && clientData.payments.length > 0) {
          // New multiple payments structure
          const totalAmount = clientData.payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
          
          const transactionResult = await client.query(`
            INSERT INTO client_transactions (daily_earnings_id, client_id, total_amount, has_multiple_payments, client_order, notes)
            VALUES ($1, $2, $3, TRUE, $4, $5)
            RETURNING *
          `, [dailyEarningsId, clientId, totalAmount, i + 1, clientData.notes || null]);
          
          const transaction = transactionResult.rows[0];
          
          // Insert individual payments
          for (const payment of clientData.payments) {
            if (parseFloat(payment.amount || 0) > 0) {
              await client.query(`
                INSERT INTO client_payment_methods (client_transaction_id, amount, payment_method)
                VALUES ($1, $2, $3)
              `, [transaction.id, payment.amount, payment.method]);
            }
          }
          
          // Update client stats if we have a client and actual spending
          if (clientId && totalAmount > 0) {
            const visitDate = await client.query('SELECT date FROM daily_earnings WHERE id = $1', [dailyEarningsId]);
            await Client.updateStats(clientId, visitDate.rows[0].date, totalAmount);
          }
          
          results.push(transaction);
        } else {
          // Legacy single payment structure (backward compatibility)
          const amount = parseFloat(clientData.amount || 0);
          const result = await client.query(`
            INSERT INTO client_transactions (daily_earnings_id, client_id, amount, payment_method, client_order, notes, has_multiple_payments)
            VALUES ($1, $2, $3, $4, $5, $6, FALSE)
            RETURNING *
          `, [dailyEarningsId, clientId, amount, clientData.paymentMethod || 'cash', i + 1, clientData.notes || null]);
          
          // Update client stats if we have a client and actual spending
          if (clientId && amount > 0) {
            const visitDate = await client.query('SELECT date FROM daily_earnings WHERE id = $1', [dailyEarningsId]);
            await Client.updateStats(clientId, visitDate.rows[0].date, amount);
          }
          
          results.push(result.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getByDailyEarningsId(dailyEarningsId) {
    const result = await db.query(`
      SELECT 
        ct.id,
        ct.daily_earnings_id,
        ct.client_id,
        ct.client_order,
        ct.notes,
        ct.created_at,
        ct.updated_at,
        ct.has_multiple_payments,
        -- Client information
        c.full_name as client_name,
        c.phone as client_phone,
        c.email as client_email,
        CASE 
          WHEN ct.has_multiple_payments = TRUE THEN ct.total_amount
          ELSE ct.amount
        END as amount,
        CASE 
          WHEN ct.has_multiple_payments = TRUE THEN NULL
          ELSE ct.payment_method
        END as payment_method,
        CASE 
          WHEN ct.has_multiple_payments = TRUE THEN 
            (SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'amount', cpm.amount,
                'method', cpm.payment_method
              ) ORDER BY cpm.id
            ) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id)
          ELSE 
            JSON_BUILD_ARRAY(
              JSON_BUILD_OBJECT(
                'amount', ct.amount,
                'method', ct.payment_method
              )
            )
        END as payments
      FROM client_transactions ct
      LEFT JOIN clients c ON ct.client_id = c.id
      WHERE ct.daily_earnings_id = $1 
      ORDER BY ct.client_order ASC
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
        -- Handle both new and legacy payment structures
        COALESCE(SUM(CASE 
          WHEN ct.has_multiple_payments = TRUE THEN 
            (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'cash')
          WHEN ct.payment_method = 'cash' THEN ct.amount 
          ELSE 0 
        END), 0) as total_cash,
        COALESCE(SUM(CASE 
          WHEN ct.has_multiple_payments = TRUE THEN 
            (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'card')
          WHEN ct.payment_method = 'card' THEN ct.amount 
          ELSE 0 
        END), 0) as total_card,
        COALESCE(SUM(CASE 
          WHEN ct.has_multiple_payments = TRUE THEN 
            (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'blik')
          WHEN ct.payment_method = 'blik' THEN ct.amount 
          ELSE 0 
        END), 0) as total_blik,
        COALESCE(SUM(CASE 
          WHEN ct.has_multiple_payments = TRUE THEN 
            (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'prepaid')
          WHEN ct.payment_method = 'prepaid' THEN ct.amount 
          ELSE 0 
        END), 0) as total_prepaid,
        COALESCE(SUM(CASE 
          WHEN ct.has_multiple_payments = TRUE THEN 
            (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'transfer')
          WHEN ct.payment_method = 'transfer' THEN ct.amount 
          ELSE 0 
        END), 0) as total_transfer,
        COALESCE(SUM(CASE 
          WHEN ct.has_multiple_payments = TRUE THEN 
            (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'free')
          WHEN ct.payment_method = 'free' THEN ct.amount 
          ELSE 0 
        END), 0) as total_free,
        COALESCE(SUM(CASE 
          WHEN ct.has_multiple_payments = TRUE THEN ct.total_amount
          ELSE ct.amount
        END), 0) as total_amount,
        COUNT(CASE 
          WHEN (ct.has_multiple_payments = TRUE AND ct.total_amount > 0) OR (ct.has_multiple_payments = FALSE AND ct.amount > 0)
          THEN 1 
        END) as client_count
      FROM client_transactions ct
      WHERE ct.daily_earnings_id = $1
    `, [dailyEarningsId]);
    return result.rows[0] || { 
      total_cash: 0, 
      total_card: 0, 
      total_blik: 0, 
      total_prepaid: 0, 
      total_transfer: 0, 
      total_free: 0, 
      total_amount: 0, 
      client_count: 0 
    };
  }
}

module.exports = ClientTransaction;