const db = require('../config/database');

class Company {
  static async create({ name, description, address, phone, email, website, ownerId }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Create company
      const companyResult = await client.query(`
        INSERT INTO companies (name, description, address, phone, email, website)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [name, description, address, phone, email, website]);
      
      const company = companyResult.rows[0];
      
      // Add owner to company
      await client.query(`
        INSERT INTO user_companies (user_id, company_id, role)
        VALUES ($1, $2, 'owner')
      `, [ownerId, company.id]);
      
      // Set as user's current company if they don't have one
      await client.query(`
        UPDATE users 
        SET current_company_id = COALESCE(current_company_id, $2),
            last_company_switch = CASE 
              WHEN current_company_id IS NULL THEN CURRENT_TIMESTAMP 
              ELSE last_company_switch 
            END
        WHERE id = $1
      `, [ownerId, company.id]);
      
      await client.query('COMMIT');
      return company;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM companies WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async getByUserId(userId) {
    const result = await db.query(`
      SELECT * FROM user_companies_view WHERE user_id = $1
    `, [userId]);
    return result.rows;
  }

  static async getUserRole(userId, companyId) {
    const result = await db.query(`
      SELECT role, is_active FROM user_companies 
      WHERE user_id = $1 AND company_id = $2
    `, [userId, companyId]);
    return result.rows[0];
  }

  static async switchUserCompany(userId, companyId) {
    // Verify user has access to this company
    const hasAccess = await db.query(`
      SELECT user_can_access_company($1, $2) as has_access
    `, [userId, companyId]);
    
    if (!hasAccess.rows[0].has_access) {
      throw new Error('User does not have access to this company');
    }
    
    // Switch user's current company
    const result = await db.query(`
      UPDATE users 
      SET current_company_id = $2, last_company_switch = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING current_company_id
    `, [userId, companyId]);
    
    return result.rows[0];
  }

  static async getCurrentCompany(userId) {
    const result = await db.query(`
      SELECT get_user_current_company($1) as company_id
    `, [userId]);
    
    const companyId = result.rows[0].company_id;
    if (!companyId) return null;
    
    return await this.getById(companyId);
  }

  static async update(id, { name, description, address, phone, email, website }) {
    const result = await db.query(`
      UPDATE companies 
      SET 
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        address = COALESCE($4, address),
        phone = COALESCE($5, phone),
        email = COALESCE($6, email),
        website = COALESCE($7, website),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, name, description, address, phone, email, website]);
    return result.rows[0];
  }

  static async delete(id) {
    // Check if this would leave any users without companies
    const orphanedUsers = await db.query(`
      SELECT DISTINCT u.id, u.email
      FROM users u
      JOIN user_companies uc ON u.id = uc.user_id
      WHERE uc.company_id = $1 
      AND NOT EXISTS (
        SELECT 1 FROM user_companies uc2 
        WHERE uc2.user_id = u.id 
        AND uc2.company_id != $1 
        AND uc2.is_active = TRUE
      )
    `, [id]);
    
    if (orphanedUsers.rows.length > 0) {
      throw new Error('Cannot delete company - some users would have no companies left');
    }
    
    const result = await db.query('DELETE FROM companies WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getEmployees(companyId) {
    const result = await db.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        uc.role,
        uc.is_active,
        uc.joined_at
      FROM user_companies uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.company_id = $1
      ORDER BY uc.role DESC, u.first_name ASC
    `, [companyId]);
    return result.rows;
  }

  static async addEmployee(companyId, userId, role = 'employee') {
    const result = await db.query(`
      INSERT INTO user_companies (user_id, company_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, company_id) 
      DO UPDATE SET 
        is_active = TRUE,
        role = EXCLUDED.role,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, companyId, role]);
    return result.rows[0];
  }

  static async removeEmployee(companyId, userId) {
    // Check if user is sole owner
    const userRole = await db.query(`
      SELECT role FROM user_companies 
      WHERE user_id = $1 AND company_id = $2
    `, [userId, companyId]);
    
    if (userRole.rows[0]?.role === 'owner') {
      const ownerCount = await db.query(`
        SELECT COUNT(*) as count FROM user_companies 
        WHERE company_id = $1 AND role = 'owner' AND is_active = TRUE
      `, [companyId]);
      
      if (parseInt(ownerCount.rows[0].count) === 1) {
        throw new Error('Cannot remove the sole owner of a company');
      }
    }
    
    const result = await db.query(`
      UPDATE user_companies 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND company_id = $2
      RETURNING *
    `, [userId, companyId]);
    
    // If this was user's current company, switch to another one
    await db.query(`SELECT get_user_current_company($1)`, [userId]);
    
    return result.rows[0];
  }

  static async updateEmployeeRole(companyId, userId, newRole) {
    const result = await db.query(`
      UPDATE user_companies 
      SET role = $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND company_id = $2
      RETURNING *
    `, [userId, companyId, newRole]);
    return result.rows[0];
  }
}

module.exports = Company;