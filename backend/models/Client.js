const db = require('../config/database');

class Client {
  static async create({ userId, companyId, fullName, phone, email, notes }) {
    const result = await db.query(`
      INSERT INTO clients (user_id, company_id, full_name, phone, email, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, companyId, fullName, phone || null, email || null, notes || null]);
    return result.rows[0];
  }

  static async findOrCreate({ userId, companyId, fullName, phone, email, notes }) {
    // First try to find existing client by name within the company
    let existingClient = await db.query(`
      SELECT * FROM clients 
      WHERE company_id = $1 AND full_name ILIKE $2
      LIMIT 1
    `, [companyId, fullName]);

    if (existingClient.rows.length > 0) {
      // Update existing client with new info if provided
      const client = existingClient.rows[0];
      const updatedClient = await db.query(`
        UPDATE clients
        SET
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          notes = COALESCE($4, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [client.id, phone || null, email || null, notes || null]);
      return updatedClient.rows[0];
    } else {
      // Create new client
      return await this.create({ userId, companyId, fullName, phone, email, notes });
    }
  }

  static async search({ companyId, query, limit = 10 }) {
    const searchTerm = `%${query}%`;
    
    // Try the view first, fall back to base table if needed
    try {
      const result = await db.query(`
        SELECT 
          id,
          full_name,
          phone,
          email,
          last_visit_date,
          total_visits,
          total_spent
        FROM clients_with_recent_activity
        WHERE company_id = $1 
          AND (
            full_name ILIKE $2 
            OR phone ILIKE $2
            OR email ILIKE $2
          )
        ORDER BY 
          -- Prioritize exact name matches
          CASE WHEN full_name ILIKE $2 THEN 1 ELSE 2 END,
          -- Then by recent activity
          last_activity_date DESC NULLS LAST,
          -- Then by total visits
          total_visits DESC
        LIMIT $3
      `, [companyId, searchTerm, limit]);
      return result.rows;
    } catch (error) {
      console.warn('View clients_with_recent_activity not found or missing columns, using base table:', error.message);
      
      // Fallback to base clients table
      const result = await db.query(`
        SELECT 
          id,
          full_name,
          phone,
          email,
          created_at,
          0 as total_visits,
          0.00 as total_spent,
          NULL as last_visit_date
        FROM clients
        WHERE company_id = $1 
          AND (
            full_name ILIKE $2 
            OR phone ILIKE $2
            OR email ILIKE $2
          )
        ORDER BY 
          -- Prioritize exact name matches
          CASE WHEN full_name ILIKE $2 THEN 1 ELSE 2 END,
          created_at DESC
        LIMIT $3
      `, [companyId, searchTerm, limit]);
      return result.rows;
    }
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT * FROM clients WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getByCompanyId({ companyId, limit = 50, offset = 0 }) {
    const result = await db.query(`
      SELECT 
        id,
        full_name,
        phone,
        email,
        last_visit_date,
        total_visits,
        total_spent,
        created_at
      FROM clients_with_recent_activity
      WHERE company_id = $1
      ORDER BY last_activity_date DESC NULLS LAST
      LIMIT $2 OFFSET $3
    `, [companyId, limit, offset]);
    return result.rows;
  }

  static async update(id, { fullName, phone, email, notes }) {
    // Konwertuj puste stringi na null, aby można było czyścić pola
    const phoneValue = phone === '' ? null : (phone || null);
    const emailValue = email === '' ? null : (email || null);
    const notesValue = notes === '' ? null : (notes || null);

    const result = await db.query(`
      UPDATE clients
      SET
        full_name = COALESCE($2, full_name),
        phone = $3,
        email = $4,
        notes = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, fullName, phoneValue, emailValue, notesValue]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async updateStats(clientId, visitDate, amountSpent) {
    try {
      await db.query(`
        UPDATE clients 
        SET 
          last_visit_date = GREATEST(COALESCE(last_visit_date, $2::date), $2::date),
          total_visits = COALESCE(total_visits, 0) + 1,
          total_spent = COALESCE(total_spent, 0) + $3::numeric,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [clientId, visitDate, amountSpent]);
    } catch (error) {
      console.warn('Could not update client stats:', error.message);
    }
  }

  // Get client transaction history
  static async getTransactionHistory(clientId, limit = 20) {
    const result = await db.query(`
      SELECT 
        de.date,
        CASE 
          WHEN ct.has_multiple_payments = TRUE THEN ct.total_amount
          ELSE ct.amount
        END as amount,
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
        END as payments,
        ct.notes
      FROM client_transactions ct
      JOIN daily_earnings de ON ct.daily_earnings_id = de.id
      WHERE ct.client_id = $1
      ORDER BY de.date DESC
      LIMIT $2
    `, [clientId, limit]);
    return result.rows;
  }
}

module.exports = Client;