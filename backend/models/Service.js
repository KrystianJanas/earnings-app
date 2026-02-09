const db = require('../config/database');

class Service {
  static async create({ companyId, name, price, userId }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(`
        INSERT INTO services (company_id, name, price)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [companyId, name, price]);

      const service = result.rows[0];

      // Log initial price in history
      await client.query(`
        INSERT INTO service_price_history (service_id, price, changed_by)
        VALUES ($1, $2, $3)
      `, [service.id, price, userId]);

      await client.query('COMMIT');
      return service;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getByCompanyId(companyId, includeInactive = false) {
    const query = includeInactive
      ? 'SELECT * FROM services WHERE company_id = $1 ORDER BY name ASC'
      : 'SELECT * FROM services WHERE company_id = $1 AND is_active = TRUE ORDER BY name ASC';
    const result = await db.query(query, [companyId]);
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM services WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, { name, price, userId }) {
    const existing = await this.getById(id);
    if (!existing) return null;

    // Log price change if price is different
    if (price !== undefined && parseFloat(price) !== parseFloat(existing.price)) {
      await db.query(`
        INSERT INTO service_price_history (service_id, price, changed_by)
        VALUES ($1, $2, $3)
      `, [id, price, userId]);
    }

    const result = await db.query(`
      UPDATE services SET
        name = COALESCE($2, name),
        price = COALESCE($3, price),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, name, price]);

    return result.rows[0];
  }

  static async deactivate(id) {
    const result = await db.query(`
      UPDATE services SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, [id]);
    return result.rows[0];
  }

  static async activate(id) {
    const result = await db.query(`
      UPDATE services SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, [id]);
    return result.rows[0];
  }

  static async search({ companyId, query }) {
    const result = await db.query(`
      SELECT * FROM services
      WHERE company_id = $1 AND is_active = TRUE AND name ILIKE $2
      ORDER BY name ASC
      LIMIT 20
    `, [companyId, `%${query}%`]);
    return result.rows;
  }

  static async getPriceHistory(serviceId) {
    const result = await db.query(`
      SELECT sph.*, u.first_name, u.last_name
      FROM service_price_history sph
      LEFT JOIN users u ON sph.changed_by = u.id
      WHERE sph.service_id = $1
      ORDER BY sph.changed_at DESC
    `, [serviceId]);
    return result.rows;
  }

  static async addToTransaction(clientTransactionId, services, txClient = null) {
    const query = txClient ? txClient.query.bind(txClient) : db.query;

    // Delete existing services for this transaction
    await query('DELETE FROM client_transaction_services WHERE client_transaction_id = $1', [clientTransactionId]);

    for (const svc of services) {
      // Look up current service data
      let serviceName = svc.serviceName;
      let servicePrice = parseFloat(svc.servicePrice || 0);

      if (svc.serviceId && !serviceName) {
        const serviceResult = await query('SELECT name, price FROM services WHERE id = $1', [svc.serviceId]);
        if (serviceResult.rows[0]) {
          serviceName = serviceResult.rows[0].name;
          servicePrice = parseFloat(serviceResult.rows[0].price);
        }
      }

      if (!serviceName) continue;

      const overridePrice = svc.overridePrice != null ? parseFloat(svc.overridePrice) : null;

      await query(`
        INSERT INTO client_transaction_services (client_transaction_id, service_id, service_name, service_price, override_price)
        VALUES ($1, $2, $3, $4, $5)
      `, [clientTransactionId, svc.serviceId || null, serviceName, servicePrice, overridePrice]);
    }
  }

  static async getByTransactionId(clientTransactionId) {
    const result = await db.query(`
      SELECT * FROM client_transaction_services
      WHERE client_transaction_id = $1
      ORDER BY id ASC
    `, [clientTransactionId]);
    return result.rows;
  }
}

module.exports = Service;
