-- Services Catalog Migration
-- Adds services, price history, and transaction-service linking tables

-- Table: services (service catalog per company)
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_services_company ON services(company_id);
CREATE INDEX IF NOT EXISTS idx_services_company_active ON services(company_id, is_active);

-- Trigger for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_services_updated_at') THEN
        CREATE TRIGGER update_services_updated_at
            BEFORE UPDATE ON services
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Table: service_price_history (tracks price changes)
CREATE TABLE IF NOT EXISTS service_price_history (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    price NUMERIC(10,2) NOT NULL,
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_price_history_service ON service_price_history(service_id, changed_at DESC);

-- Table: client_transaction_services (links services to client transactions)
CREATE TABLE IF NOT EXISTS client_transaction_services (
    id SERIAL PRIMARY KEY,
    client_transaction_id INTEGER NOT NULL REFERENCES client_transactions(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    service_name VARCHAR(255) NOT NULL,
    service_price NUMERIC(10,2) NOT NULL,
    override_price NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cts_transaction ON client_transaction_services(client_transaction_id);
CREATE INDEX IF NOT EXISTS idx_cts_service ON client_transaction_services(service_id);
