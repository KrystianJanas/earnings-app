-- Migration: Add clients_with_recent_activity view
-- This view provides clients with their statistics

-- Create the view for clients with their recent activity and stats
CREATE OR REPLACE VIEW clients_with_recent_activity AS
SELECT
  c.id,
  c.user_id,
  c.company_id,
  c.full_name,
  c.phone,
  c.email,
  c.notes,
  c.created_at,
  c.updated_at,
  -- Count total visits
  COUNT(DISTINCT ct.id) as total_visits,
  -- Sum total amount spent
  COALESCE(SUM(
    CASE
      WHEN ct.has_multiple_payments = TRUE THEN ct.total_amount
      ELSE ct.amount
    END
  ), 0) as total_spent,
  -- Get last visit date
  MAX(de.date) as last_visit_date,
  -- Get last activity date (for sorting)
  GREATEST(MAX(de.date), c.updated_at) as last_activity_date
FROM clients c
LEFT JOIN client_transactions ct ON c.id = ct.client_id
LEFT JOIN daily_earnings de ON ct.daily_earnings_id = de.id
GROUP BY c.id, c.user_id, c.company_id, c.full_name, c.phone, c.email, c.notes, c.created_at, c.updated_at;

-- Grant permissions
GRANT SELECT ON clients_with_recent_activity TO PUBLIC;
