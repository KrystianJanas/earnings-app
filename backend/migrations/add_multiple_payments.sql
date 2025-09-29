-- Migration to support multiple payment methods per client
-- This adds a new table for multiple payments while maintaining backward compatibility

-- Create new payment methods table for client transactions
CREATE TABLE client_payment_methods (
    id SERIAL PRIMARY KEY,
    client_transaction_id INTEGER REFERENCES client_transactions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'blik', 'prepaid', 'transfer', 'free')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_client_payment_methods_transaction ON client_payment_methods(client_transaction_id);
CREATE INDEX idx_client_payment_methods_method ON client_payment_methods(payment_method);

-- Add trigger for updated_at
CREATE TRIGGER update_client_payment_methods_updated_at BEFORE UPDATE ON client_payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Extend client_transactions table to support the new structure
-- We keep existing columns for backward compatibility but add new ones
ALTER TABLE client_transactions 
    ADD COLUMN has_multiple_payments BOOLEAN DEFAULT FALSE,
    ADD COLUMN total_amount DECIMAL(10,2) DEFAULT NULL;

-- Update payment_method constraint to include new methods
ALTER TABLE client_transactions DROP CONSTRAINT client_transactions_payment_method_check;
ALTER TABLE client_transactions ADD CONSTRAINT client_transactions_payment_method_check 
    CHECK (payment_method IN ('cash', 'card', 'blik', 'prepaid', 'transfer', 'free'));

-- Create a view that combines both old and new payment structures
CREATE OR REPLACE VIEW client_transactions_with_payments AS
SELECT 
    ct.id,
    ct.daily_earnings_id,
    ct.client_order,
    ct.notes,
    ct.created_at,
    ct.updated_at,
    CASE 
        WHEN ct.has_multiple_payments = TRUE THEN ct.total_amount
        ELSE ct.amount
    END as total_amount,
    CASE 
        WHEN ct.has_multiple_payments = TRUE THEN 
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'amount', cpm.amount,
                    'method', cpm.payment_method
                ) ORDER BY cpm.id
            )
        ELSE 
            JSON_BUILD_ARRAY(
                JSON_BUILD_OBJECT(
                    'amount', ct.amount,
                    'method', ct.payment_method
                )
            )
    END as payments
FROM client_transactions ct
LEFT JOIN client_payment_methods cpm ON ct.id = cpm.client_transaction_id AND ct.has_multiple_payments = TRUE
GROUP BY ct.id, ct.daily_earnings_id, ct.client_order, ct.notes, ct.created_at, ct.updated_at, ct.amount, ct.payment_method, ct.has_multiple_payments, ct.total_amount;

-- Update the daily_earnings_complete view to handle new payment structure
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
    -- Calculate totals from all payment methods
    COALESCE(ct_summary.total_cash, 0) as calculated_cash_amount,
    COALESCE(ct_summary.total_card, 0) as calculated_card_amount,
    COALESCE(ct_summary.total_blik, 0) as calculated_blik_amount,
    COALESCE(ct_summary.total_prepaid, 0) as calculated_prepaid_amount,
    COALESCE(ct_summary.total_transfer, 0) as calculated_transfer_amount,
    COALESCE(ct_summary.total_free, 0) as calculated_free_amount,
    COALESCE(ct_summary.client_count_from_transactions, 0) as calculated_clients_count,
    -- Use original values for summary mode, calculated for detailed mode
    CASE 
        WHEN de.entry_mode = 'detailed' THEN COALESCE(ct_summary.total_cash, 0)
        ELSE de.cash_amount
    END as effective_cash_amount,
    CASE 
        WHEN de.entry_mode = 'detailed' THEN COALESCE(ct_summary.total_card, 0)
        ELSE de.card_amount
    END as effective_card_amount,
    CASE 
        WHEN de.entry_mode = 'detailed' THEN COALESCE(ct_summary.client_count_from_transactions, 0)
        ELSE de.clients_count
    END as effective_clients_count,
    -- New payment method totals
    COALESCE(ct_summary.total_blik, 0) as effective_blik_amount,
    COALESCE(ct_summary.total_prepaid, 0) as effective_prepaid_amount,
    COALESCE(ct_summary.total_transfer, 0) as effective_transfer_amount,
    COALESCE(ct_summary.total_free, 0) as effective_free_amount
FROM daily_earnings de
LEFT JOIN (
    SELECT 
        ct.daily_earnings_id,
        -- Calculate totals for each payment method
        SUM(CASE 
            WHEN ct.has_multiple_payments = TRUE THEN 
                (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'cash')
            WHEN ct.payment_method = 'cash' THEN ct.amount 
            ELSE 0 
        END) as total_cash,
        SUM(CASE 
            WHEN ct.has_multiple_payments = TRUE THEN 
                (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'card')
            WHEN ct.payment_method = 'card' THEN ct.amount 
            ELSE 0 
        END) as total_card,
        SUM(CASE 
            WHEN ct.has_multiple_payments = TRUE THEN 
                (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'blik')
            WHEN ct.payment_method = 'blik' THEN ct.amount 
            ELSE 0 
        END) as total_blik,
        SUM(CASE 
            WHEN ct.has_multiple_payments = TRUE THEN 
                (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'prepaid')
            WHEN ct.payment_method = 'prepaid' THEN ct.amount 
            ELSE 0 
        END) as total_prepaid,
        SUM(CASE 
            WHEN ct.has_multiple_payments = TRUE THEN 
                (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'transfer')
            WHEN ct.payment_method = 'transfer' THEN ct.amount 
            ELSE 0 
        END) as total_transfer,
        SUM(CASE 
            WHEN ct.has_multiple_payments = TRUE THEN 
                (SELECT COALESCE(SUM(cpm.amount), 0) FROM client_payment_methods cpm WHERE cpm.client_transaction_id = ct.id AND cpm.payment_method = 'free')
            WHEN ct.payment_method = 'free' THEN ct.amount 
            ELSE 0 
        END) as total_free,
        COUNT(CASE 
            WHEN (ct.has_multiple_payments = TRUE AND ct.total_amount > 0) OR (ct.has_multiple_payments = FALSE AND ct.amount > 0)
            THEN 1 
        END) as client_count_from_transactions
    FROM client_transactions ct
    GROUP BY ct.daily_earnings_id
) ct_summary ON de.id = ct_summary.daily_earnings_id;