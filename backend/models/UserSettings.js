const db = require('../config/database');

class UserSettings {
  static async getOrCreate(userId) {
    // Try to get existing settings
    let result = await db.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default settings if none exist
      result = await db.query(
        'INSERT INTO user_settings (user_id, hourly_rate) VALUES ($1, $2) RETURNING *',
        [userId, 0.00]
      );
    }

    return result.rows[0];
  }

  static async update(userId, { hourlyRate }) {
    const result = await db.query(`
      UPDATE user_settings 
      SET hourly_rate = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `, [userId, hourlyRate || 0]);

    if (result.rows.length === 0) {
      // If no settings exist, create them
      return this.getOrCreate(userId);
    }

    return result.rows[0];
  }

  static async getHourlyRate(userId) {
    const settings = await this.getOrCreate(userId);
    return parseFloat(settings.hourly_rate);
  }
}

module.exports = UserSettings;