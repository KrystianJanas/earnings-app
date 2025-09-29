const express = require('express');
const { body, validationResult } = require('express-validator');
const CompanyInvitation = require('../models/CompanyInvitation');

const router = express.Router();

// Get user's pending invitations
router.get('/', async (req, res) => {
  try {
    const invitations = await CompanyInvitation.getByUserId(req.user.userId);
    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invitation by token (public endpoint for invitation links)
router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await CompanyInvitation.getByToken(token);
    
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found or expired' });
    }
    
    // Check if already accepted or declined
    if (invitation.accepted_at) {
      return res.status(400).json({ error: 'Invitation already accepted' });
    }
    
    if (invitation.declined_at) {
      return res.status(400).json({ error: 'Invitation already declined' });
    }
    
    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }
    
    res.json({
      id: invitation.id,
      companyName: invitation.company_name,
      companyDescription: invitation.company_description,
      role: invitation.role,
      inviterName: `${invitation.inviter_first_name} ${invitation.inviter_last_name}`,
      inviterEmail: invitation.inviter_email,
      createdAt: invitation.created_at,
      expiresAt: invitation.expires_at
    });
  } catch (error) {
    console.error('Get invitation by token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept invitation
router.post('/accept/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await CompanyInvitation.accept(token, req.user.userId);
    
    res.json({ 
      message: 'Invitation accepted successfully',
      companyId: invitation.company_id 
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('does not match')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Decline invitation
router.post('/decline/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    await CompanyInvitation.decline(token, req.user.userId);
    
    res.json({ message: 'Invitation declined successfully' });
  } catch (error) {
    console.error('Decline invitation error:', error);
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;