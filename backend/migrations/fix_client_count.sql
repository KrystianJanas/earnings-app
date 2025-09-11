-- Fix client count to only count clients with amount > 0
-- This fixes the issue where clients with 0 amount were still counted

DROP VIEW IF EXISTS daily_earnings_complete;

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
        COUNT(CASE WHEN amount > 0 THEN 1 END) as client_count_from_transactions
    FROM client_transactions
    GROUP BY daily_earnings_id
) ct_summary ON de.id = ct_summary.daily_earnings_id;