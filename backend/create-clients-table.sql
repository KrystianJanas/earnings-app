-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, full_name)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_full_name ON clients(full_name);

-- Add trigger for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add client_id column to client_transactions if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client_transactions' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE client_transactions 
        ADD COLUMN client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE;
        
        CREATE INDEX idx_client_transactions_client_id ON client_transactions(client_id);
    END IF;
END $$;

-- Add payment method tracking columns to client_transactions if not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client_transactions' AND column_name = 'has_multiple_payments'
    ) THEN
        ALTER TABLE client_transactions
        ADD COLUMN has_multiple_payments BOOLEAN DEFAULT FALSE,
        ADD COLUMN total_amount DECIMAL(10,2);
    END IF;
END $$;

-- Create client payment methods table for multiple payment tracking
CREATE TABLE IF NOT EXISTS client_payment_methods (
    id SERIAL PRIMARY KEY,
    client_transaction_id INTEGER REFERENCES client_transactions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_payment_methods_transaction ON client_payment_methods(client_transaction_id);
