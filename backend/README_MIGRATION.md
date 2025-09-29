# Multiple Payment Methods Migration

## Overview
This migration adds support for multiple payment methods per client transaction while maintaining full backward compatibility with existing data.

## New Payment Methods Added
- Cash (Gotówka) - existing
- Card (Karta) - existing  
- BLIK - new
- Prepaid (Przedpłata) - new
- Transfer (Przelew) - new
- Free (Gratis) - new - for complimentary services that count toward client statistics but not revenue

## Database Changes

### New Tables
- `client_payment_methods` - stores individual payment entries for transactions with multiple payments

### Modified Tables  
- `client_transactions` - added columns:
  - `has_multiple_payments` (BOOLEAN) - indicates if transaction uses new multiple payment structure
  - `total_amount` (DECIMAL) - total amount for multiple payment transactions
  - Updated `payment_method` constraint to include new methods

### New Views
- `client_transactions_with_payments` - unified view combining old and new payment structures
- Updated `daily_earnings_complete` - includes calculations for all payment methods

## Running the Migration

### Option 1: Manual SQL Execution
```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database_name

# Run the migration
\i backend/migrations/add_multiple_payments.sql
```

### Option 2: Using Node.js (if you have a migration runner)
```bash
# Add migration runner code to execute the SQL file
node migrations/run_migration.js add_multiple_payments.sql
```

## Backward Compatibility

### Existing Data
- All existing client transactions continue to work unchanged
- Old transactions are automatically presented in the new format with single payment entries
- No data migration is required - the system handles both formats transparently

### API Compatibility
- Old single payment format: `{ amount: 100, paymentMethod: 'cash' }`
- New multiple payment format: `{ payments: [{ amount: 50, method: 'cash' }, { amount: 50, method: 'card' }] }`
- Both formats are supported simultaneously

### Frontend Compatibility
- Existing transactions display as single payment entries
- Users can add additional payment methods to any transaction
- Switching between single and multiple payments is seamless

## Testing the Migration

### 1. Verify Migration Success
```sql
-- Check new table exists
SELECT * FROM client_payment_methods LIMIT 1;

-- Check new columns exist
SELECT has_multiple_payments, total_amount FROM client_transactions LIMIT 1;

-- Test new view
SELECT * FROM client_transactions_with_payments LIMIT 5;
```

### 2. Test Backward Compatibility
- Load existing earnings data in the app
- Verify old transactions display correctly
- Try editing old transactions - they should convert to new format seamlessly

### 3. Test New Features
- Create a new client entry
- Add multiple payment methods (e.g., 50zł cash + 30zł card + 20zł BLIK)
- Save and reload - verify all payments are preserved
- Check totals are calculated correctly

## Rollback (if needed)
If you need to rollback this migration:

```sql
-- Remove new table
DROP TABLE client_payment_methods;

-- Remove new columns  
ALTER TABLE client_transactions 
    DROP COLUMN has_multiple_payments,
    DROP COLUMN total_amount;

-- Restore old constraint
ALTER TABLE client_transactions DROP CONSTRAINT client_transactions_payment_method_check;
ALTER TABLE client_transactions ADD CONSTRAINT client_transactions_payment_method_check 
    CHECK (payment_method IN ('cash', 'card'));

-- Drop new views
DROP VIEW client_transactions_with_payments;
-- Restore old view (refer to original init.sql)
```

**Note**: Rollback will lose any data entered using the new multiple payment system.