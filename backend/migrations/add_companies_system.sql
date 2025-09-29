-- Migration to add multi-company/salon system with user roles
-- This enables salon owners to manage multiple businesses and invite employees

-- Create companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('owner', 'employee');

-- Create user-company relationships table
CREATE TABLE user_companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_id)
);

-- Add current company selection to users table
ALTER TABLE users 
    ADD COLUMN current_company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    ADD COLUMN last_company_switch TIMESTAMP;

-- Create company invitations table
CREATE TABLE company_invitations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    inviter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invited_email VARCHAR(255) NOT NULL,
    invited_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Set when user registers
    role user_role NOT NULL DEFAULT 'employee',
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    declined_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX idx_user_companies_company_id ON user_companies(company_id);
CREATE INDEX idx_user_companies_active ON user_companies(user_id, is_active);
CREATE INDEX idx_users_current_company ON users(current_company_id);
CREATE INDEX idx_company_invitations_email ON company_invitations(invited_email);
CREATE INDEX idx_company_invitations_token ON company_invitations(invitation_token);
CREATE INDEX idx_company_invitations_user ON company_invitations(invited_user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_companies_updated_at BEFORE UPDATE ON user_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_invitations_updated_at BEFORE UPDATE ON company_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add company_id to existing tables to scope data by company
ALTER TABLE daily_earnings 
    ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE clients 
    ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE user_settings 
    ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE;

-- Update existing constraints to include company scope
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_user_id_full_name_key;
ALTER TABLE clients ADD CONSTRAINT clients_company_name_unique 
    UNIQUE(company_id, full_name);

ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_key;
ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_company_unique 
    UNIQUE(user_id, company_id);

-- Add indexes for company-scoped data
CREATE INDEX idx_daily_earnings_company ON daily_earnings(company_id, date);
CREATE INDEX idx_clients_company ON clients(company_id, full_name);
CREATE INDEX idx_user_settings_company ON user_settings(company_id);

-- Create view for user's companies with role info
CREATE OR REPLACE VIEW user_companies_view AS
SELECT 
    uc.user_id,
    uc.company_id,
    c.name as company_name,
    c.description as company_description,
    uc.role,
    uc.is_active,
    uc.joined_at,
    -- Count of total employees in company
    (SELECT COUNT(*) FROM user_companies uc2 WHERE uc2.company_id = uc.company_id AND uc2.is_active = TRUE) as total_employees,
    -- Check if user is the only owner
    (SELECT COUNT(*) FROM user_companies uc3 WHERE uc3.company_id = uc.company_id AND uc3.role = 'owner' AND uc3.is_active = TRUE) = 1 
        AND uc.role = 'owner' as is_sole_owner
FROM user_companies uc
JOIN companies c ON uc.company_id = c.id
WHERE uc.is_active = TRUE
ORDER BY uc.role DESC, c.name ASC;

-- Function to check if user can access company data
CREATE OR REPLACE FUNCTION user_can_access_company(user_id_param INTEGER, company_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN DEFAULT FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM user_companies 
        WHERE user_id = user_id_param 
        AND company_id = company_id_param 
        AND is_active = TRUE
    ) INTO has_access;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current company or first available company
CREATE OR REPLACE FUNCTION get_user_current_company(user_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_company INTEGER;
    first_company INTEGER;
BEGIN
    -- Try to get user's currently selected company
    SELECT current_company_id INTO current_company
    FROM users 
    WHERE id = user_id_param;
    
    -- If current company is set and user still has access, return it
    IF current_company IS NOT NULL THEN
        IF user_can_access_company(user_id_param, current_company) THEN
            RETURN current_company;
        END IF;
    END IF;
    
    -- Otherwise, get user's first available company (owners first)
    SELECT company_id INTO first_company
    FROM user_companies 
    WHERE user_id = user_id_param AND is_active = TRUE
    ORDER BY role DESC, joined_at ASC
    LIMIT 1;
    
    -- Update user's current company if found
    IF first_company IS NOT NULL THEN
        UPDATE users 
        SET current_company_id = first_company, last_company_switch = CURRENT_TIMESTAMP
        WHERE id = user_id_param;
    END IF;
    
    RETURN first_company;
END;
$$ LANGUAGE plpgsql;

-- Create default company "Studio Estetic" and assign existing user as owner
INSERT INTO companies (name, description) 
VALUES ('Studio Estetic', 'Salon kosmetyczny')
ON CONFLICT DO NOTHING;

-- Get the company ID and first user ID
DO $$
DECLARE
    studio_company_id INTEGER;
    first_user_id INTEGER;
BEGIN
    -- Get Studio Estetic company ID
    SELECT id INTO studio_company_id FROM companies WHERE name = 'Studio Estetic';
    
    -- Get first user (should be Paulina)
    SELECT id INTO first_user_id FROM users ORDER BY id LIMIT 1;
    
    -- Make first user owner of Studio Estetic
    IF first_user_id IS NOT NULL AND studio_company_id IS NOT NULL THEN
        INSERT INTO user_companies (user_id, company_id, role)
        VALUES (first_user_id, studio_company_id, 'owner')
        ON CONFLICT (user_id, company_id) 
        DO UPDATE SET role = 'owner', is_active = TRUE;
        
        -- Set as user's current company
        UPDATE users 
        SET current_company_id = studio_company_id, last_company_switch = CURRENT_TIMESTAMP
        WHERE id = first_user_id;
        
        -- Update existing data to belong to this company
        UPDATE daily_earnings SET company_id = studio_company_id WHERE user_id = first_user_id;
        UPDATE clients SET company_id = studio_company_id WHERE user_id = first_user_id;
        UPDATE user_settings SET company_id = studio_company_id WHERE user_id = first_user_id;
    END IF;
END $$;