-- Create database tables for beautician earnings app

-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily earnings table
CREATE TABLE daily_earnings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    cash_amount DECIMAL(10,2) DEFAULT 0.00,
    card_amount DECIMAL(10,2) DEFAULT 0.00,
    tips_amount DECIMAL(10,2) DEFAULT 0.00,
    clients_count INTEGER DEFAULT 0,
    hours_worked DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT,
    entry_mode VARCHAR(20) DEFAULT 'summary' CHECK (entry_mode IN ('summary', 'detailed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- User settings table for hourly rate and other preferences
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    hourly_rate DECIMAL(8,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_daily_earnings_user_date ON daily_earnings(user_id, date);
CREATE INDEX idx_daily_earnings_user_month ON daily_earnings(user_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date));

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_earnings_updated_at BEFORE UPDATE ON daily_earnings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Client transactions table for detailed earnings tracking
CREATE TABLE client_transactions (
    id SERIAL PRIMARY KEY,
    daily_earnings_id INTEGER REFERENCES daily_earnings(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card')),
    client_order INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional indexes for client transactions
CREATE INDEX idx_client_transactions_daily_earnings ON client_transactions(daily_earnings_id);
CREATE INDEX idx_client_transactions_order ON client_transactions(daily_earnings_id, client_order);

-- Trigger for client_transactions updated_at
CREATE TRIGGER update_client_transactions_updated_at BEFORE UPDATE ON client_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for easy querying of daily earnings with client details
CREATE OR REPLACE VIEW daily_earnings_complete AS
SELECT 
    de.id,
    de.user_id,
    de.date,
    de.entry_mode,
    de.cash_amount,
    de.card_amount,
    de.tips_amount,
    de.clients_count,
    de.hours_worked,
    de.notes,
    de.created_at,
    de.updated_at,
    -- Calculate totals from client transactions for detailed mode
    COALESCE(ct_summary.total_cash_from_clients, 0) as calculated_cash_amount,
    COALESCE(ct_summary.total_card_from_clients, 0) as calculated_card_amount,
    COALESCE(ct_summary.client_count_from_transactions, 0) as calculated_clients_count,
    -- Use original values for summary mode, calculated for detailed mode
    CASE 
        WHEN de.entry_mode = 'detailed' THEN COALESCE(ct_summary.total_cash_from_clients, 0)
        ELSE de.cash_amount
    END as effective_cash_amount,
    CASE 
        WHEN de.entry_mode = 'detailed' THEN COALESCE(ct_summary.total_card_from_clients, 0)
        ELSE de.card_amount
    END as effective_card_amount,
    CASE 
        WHEN de.entry_mode = 'detailed' THEN COALESCE(ct_summary.client_count_from_transactions, 0)
        ELSE de.clients_count
    END as effective_clients_count
FROM daily_earnings de
LEFT JOIN (
    SELECT 
        daily_earnings_id,
        SUM(CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END) as total_cash_from_clients,
        SUM(CASE WHEN payment_method = 'card' THEN amount ELSE 0 END) as total_card_from_clients,
        COUNT(*) as client_count_from_transactions
    FROM client_transactions
    GROUP BY daily_earnings_id
) ct_summary ON de.id = ct_summary.daily_earnings_id;