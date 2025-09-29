const db = require('../config/database');
const crypto = require('crypto');

class CompanyInvitation {
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static async create({ companyId, inviterId, invitedEmail, role = 'employee' }) {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    
    // Check if invitation already exists and is active
    const existingInvitation = await db.query(`
      SELECT * FROM company_invitations 
      WHERE company_id = $1 AND invited_email = $2 
      AND accepted_at IS NULL AND declined_at IS NULL 
      AND expires_at > CURRENT_TIMESTAMP
    `, [companyId, invitedEmail]);
    
    if (existingInvitation.rows.length > 0) {
      throw new Error('Active invitation already exists for this email');
    }
    
    // Check if user is already in the company
    const existingMember = await db.query(`
      SELECT uc.* FROM user_companies uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.company_id = $1 AND u.email = $2 AND uc.is_active = TRUE
    `, [companyId, invitedEmail]);
    
    if (existingMember.rows.length > 0) {
      throw new Error('User is already a member of this company');
    }
    
    const result = await db.query(`
      INSERT INTO company_invitations 
      (company_id, inviter_id, invited_email, role, invitation_token, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [companyId, inviterId, invitedEmail, role, token, expiresAt]);
    
    return result.rows[0];
  }

  static async getByToken(token) {
    const result = await db.query(`
      SELECT 
        ci.*,
        c.name as company_name,
        c.description as company_description,
        u.first_name as inviter_first_name,
        u.last_name as inviter_last_name,
        u.email as inviter_email
      FROM company_invitations ci
      JOIN companies c ON ci.company_id = c.id
      JOIN users u ON ci.inviter_id = u.id
      WHERE ci.invitation_token = $1
    `, [token]);
    return result.rows[0];
  }

  static async getByUserId(userId) {
    const result = await db.query(`
      SELECT 
        ci.*,
        c.name as company_name,
        c.description as company_description,
        u.first_name as inviter_first_name,
        u.last_name as inviter_last_name
      FROM company_invitations ci
      JOIN companies c ON ci.company_id = c.id
      JOIN users u ON ci.inviter_id = u.id
      WHERE ci.invited_user_id = $1 
      AND ci.accepted_at IS NULL 
      AND ci.declined_at IS NULL 
      AND ci.expires_at > CURRENT_TIMESTAMP
      ORDER BY ci.created_at DESC
    `, [userId]);
    return result.rows;
  }

  static async getByEmail(email) {
    const result = await db.query(`
      SELECT 
        ci.*,
        c.name as company_name,
        c.description as company_description,
        u.first_name as inviter_first_name,
        u.last_name as inviter_last_name
      FROM company_invitations ci
      JOIN companies c ON ci.company_id = c.id
      JOIN users u ON ci.inviter_id = u.id
      WHERE ci.invited_email = $1 
      AND ci.accepted_at IS NULL 
      AND ci.declined_at IS NULL 
      AND ci.expires_at > CURRENT_TIMESTAMP
      ORDER BY ci.created_at DESC
    `, [email]);
    return result.rows;
  }

  static async getByCompanyId(companyId) {
    const result = await db.query(`
      SELECT 
        ci.*,
        u.first_name as inviter_first_name,
        u.last_name as inviter_last_name,
        iu.first_name as invited_user_first_name,
        iu.last_name as invited_user_last_name
      FROM company_invitations ci
      JOIN users u ON ci.inviter_id = u.id
      LEFT JOIN users iu ON ci.invited_user_id = iu.id
      WHERE ci.company_id = $1
      ORDER BY ci.created_at DESC
    `, [companyId]);
    return result.rows;
  }

  static async linkToUser(invitationId, userId) {
    const result = await db.query(`
      UPDATE company_invitations 
      SET invited_user_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [invitationId, userId]);
    return result.rows[0];
  }

  static async accept(token, userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get invitation details
      const invitation = await client.query(`
        SELECT * FROM company_invitations 
        WHERE invitation_token = $1 
        AND accepted_at IS NULL 
        AND declined_at IS NULL 
        AND expires_at > CURRENT_TIMESTAMP
      `, [token]);
      
      if (invitation.rows.length === 0) {
        throw new Error('Invalid or expired invitation');
      }
      
      const inv = invitation.rows[0];
      
      // Verify user email matches invitation
      const user = await client.query('SELECT email FROM users WHERE id = $1', [userId]);
      if (user.rows[0].email !== inv.invited_email) {
        throw new Error('Email does not match invitation');
      }
      
      // Check if user is already in company
      const existingMember = await client.query(`
        SELECT * FROM user_companies 
        WHERE user_id = $1 AND company_id = $2
      `, [userId, inv.company_id]);
      
      if (existingMember.rows.length > 0) {
        // Reactivate if exists
        await client.query(`
          UPDATE user_companies 
          SET is_active = TRUE, role = $3, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1 AND company_id = $2
        `, [userId, inv.company_id, inv.role]);
      } else {
        // Add user to company
        await client.query(`
          INSERT INTO user_companies (user_id, company_id, role)
          VALUES ($1, $2, $3)
        `, [userId, inv.company_id, inv.role]);
      }
      
      // Mark invitation as accepted
      await client.query(`
        UPDATE company_invitations 
        SET accepted_at = CURRENT_TIMESTAMP, invited_user_id = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [inv.id, userId]);
      
      // Set as user's current company if they don't have one
      await client.query(`
        UPDATE users 
        SET current_company_id = COALESCE(current_company_id, $2),
            last_company_switch = CASE 
              WHEN current_company_id IS NULL THEN CURRENT_TIMESTAMP 
              ELSE last_company_switch 
            END
        WHERE id = $1
      `, [userId, inv.company_id]);
      
      await client.query('COMMIT');
      return inv;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async decline(token, userId) {
    const result = await db.query(`
      UPDATE company_invitations 
      SET declined_at = CURRENT_TIMESTAMP, invited_user_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE invitation_token = $1 
      AND accepted_at IS NULL 
      AND declined_at IS NULL 
      AND expires_at > CURRENT_TIMESTAMP
      RETURNING *
    `, [token, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('Invalid or expired invitation');
    }
    
    return result.rows[0];
  }

  static async cancel(invitationId) {
    const result = await db.query(`
      UPDATE company_invitations 
      SET declined_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      AND accepted_at IS NULL 
      AND declined_at IS NULL
      RETURNING *
    `, [invitationId]);
    
    return result.rows[0];
  }

  static async cleanup() {
    // Delete expired invitations older than 30 days
    const result = await db.query(`
      DELETE FROM company_invitations 
      WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
      RETURNING COUNT(*)
    `);
    
    return result.rows[0];
  }
}

module.exports = CompanyInvitation;