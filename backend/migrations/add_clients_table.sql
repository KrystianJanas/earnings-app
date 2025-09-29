-- Migration to add clients table for storing client information
-- This allows for client search, auto-complete, and history tracking

-- Create clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    notes TEXT,
    last_visit_date DATE,
    total_visits INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, full_name) -- Prevent duplicate names per user
);

-- Add indexes for fast search
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name_search ON clients(user_id, full_name);
CREATE INDEX idx_clients_phone ON clients(user_id, phone);
CREATE INDEX idx_clients_last_visit ON clients(user_id, last_visit_date DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add client_id to client_transactions table
ALTER TABLE client_transactions 
    ADD COLUMN client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL;

-- Add index for client transactions lookup
CREATE INDEX idx_client_transactions_client_id ON client_transactions(client_id);

-- Create a function to update client statistics
CREATE OR REPLACE FUNCTION update_client_stats(client_id_param INTEGER, visit_date DATE, amount_spent DECIMAL(10,2))
RETURNS VOID AS $$
BEGIN
    UPDATE clients 
    SET 
        last_visit_date = GREATEST(last_visit_date, visit_date),
        total_visits = total_visits + 1,
        total_spent = total_spent + amount_spent,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = client_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a view for client search with recent activity
CREATE OR REPLACE VIEW clients_with_recent_activity AS
SELECT 
    c.id,
    c.user_id,
    c.full_name,
    c.phone,
    c.email,
    c.notes,
    c.last_visit_date,
    c.total_visits,
    c.total_spent,
    c.created_at,
    c.updated_at,
    -- Recent transaction info for better search results
    COALESCE(recent.last_transaction_date, c.last_visit_date) as last_activity_date,
    recent.last_transaction_amount
FROM clients c
LEFT JOIN (
    SELECT 
        ct.client_id,
        MAX(de.date) as last_transaction_date,
        (SELECT 
            CASE 
                WHEN ct2.has_multiple_payments = TRUE THEN ct2.total_amount
                ELSE ct2.amount
            END
         FROM client_transactions ct2 
         JOIN daily_earnings de2 ON ct2.daily_earnings_id = de2.id
         WHERE ct2.client_id = ct.client_id 
         ORDER BY de2.date DESC 
         LIMIT 1
        ) as last_transaction_amount
    FROM client_transactions ct
    JOIN daily_earnings de ON ct.daily_earnings_id = de.id
    WHERE ct.client_id IS NOT NULL
    GROUP BY ct.client_id
) recent ON c.id = recent.client_id
ORDER BY COALESCE(recent.last_transaction_date, c.last_visit_date) DESC NULLS LAST;