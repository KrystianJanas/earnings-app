const db = require('../config/database');

class UserSettings {
  static async getOrCreate(userId, companyId) {
    // Try to get existing settings
    let result = await db.query(
      'SELECT * FROM user_settings WHERE user_id = $1 AND company_id = $2',
      [userId, companyId]
    );

    if (result.rows.length === 0) {
      // Create default settings if none exist
      result = await db.query(
        'INSERT INTO user_settings (user_id, company_id, hourly_rate) VALUES ($1, $2, $3) RETURNING *',
        [userId, companyId, 0.00]
      );
    }

    return result.rows[0];
  }

  static async update(userId, companyId, { hourlyRate }) {
    const result = await db.query(`
      UPDATE user_settings 
      SET hourly_rate = $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND company_id = $2
      RETURNING *
    `, [userId, companyId, hourlyRate || 0]);

    if (result.rows.length === 0) {
      // If no settings exist, create them
      return this.getOrCreate(userId, companyId);
    }

    return result.rows[0];
  }

  static async getHourlyRate(userId, companyId) {
    const settings = await this.getOrCreate(userId, companyId);
    return parseFloat(settings.hourly_rate);
  }
}

module.exports = UserSettings;