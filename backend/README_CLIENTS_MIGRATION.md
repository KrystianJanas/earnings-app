# Client Management System Migration

## Overview
This migration adds a comprehensive client management system with search functionality, auto-complete, and client history tracking.

## New Features Added
- **Client Database**: Store client information (name, phone, email, notes)
- **Smart Search**: Auto-complete with keyboard navigation
- **Client History**: Track visits, spending, and last visit dates
- **Automatic Client Creation**: New clients are automatically saved when entering transactions
- **Client Statistics**: Total visits and spending per client

## Database Changes

### New Tables
- `clients` - stores client information and statistics
- Adds `client_id` column to `client_transactions` table

### New Functions
- `update_client_stats()` - automatically updates client statistics
- Client search with ranking by relevance

### New Views
- `clients_with_recent_activity` - unified view with recent transaction data

## Running the Migration

### Prerequisites
Make sure you have already run the multiple payments migration (`add_multiple_payments.sql`) first.

### Option 1: Manual SQL Execution
```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database_name

# Run the clients migration
\i backend/migrations/add_clients_table.sql
```

### Option 2: Using Node.js Migration Runner
```bash
# Run the migration
node migrations/run_migration.js add_clients_table.sql
```

## Features Overview

### 1. Client Search & Auto-Complete
- **Search starts after 2 characters**
- **Keyboard navigation** (arrow keys, enter, escape)
- **Click to select** from dropdown
- **Smart ranking**: exact matches first, then by recent activity

### 2. Automatic Client Management
- **Auto-save**: New clients are automatically created when saving transactions
- **Duplicate detection**: Prevents duplicate clients with same name
- **Data enrichment**: Phone and email can be added later

### 3. Client Statistics
- **Total visits**: Automatically incremented with each transaction
- **Total spent**: Running total of all transactions
- **Last visit**: Date of most recent transaction
- **Transaction history**: Full history of all visits and payments

### 4. Search Results Display
- **Client name** prominently displayed
- **Contact info** (phone if available)
- **Visit history** (last visit date, total visits)
- **Recent activity** sorting

## Usage Examples

### Adding a Client Transaction
1. Start typing client name in the search field
2. Select from dropdown or continue typing for new client
3. Add payment methods and amounts
4. Save - client is automatically created/updated

### Searching for Existing Clients
- Type "Anna" → shows all clients with "Anna" in name
- Type "123" → shows clients with "123" in phone number
- Results sorted by exact match, then recent activity

### Client Data Updates
- When selecting an existing client, their info is pre-filled
- Phone/email can be added or updated in future transactions
- Statistics are automatically maintained

## API Endpoints Added

### Client Search
```
GET /api/clients/search?q=search_term
```

### Get All Clients
```
GET /api/clients?limit=50&offset=0
```

### Get Client Details
```
GET /api/clients/:id
```

### Client Transaction History
```
GET /api/clients/:id/transactions?limit=20
```

### Create/Update Client
```
POST /api/clients
PUT /api/clients/:id
```

## Backward Compatibility

### Existing Data
- All existing transactions work unchanged
- No data migration required
- Old transactions without clients display normally

### New vs Old Transactions
- Old transactions: No client info, work as before
- New transactions: Include client data, automatic client creation
- Mixed support: Can have both types in same day

## Testing the Migration

### 1. Verify Migration Success
```sql
-- Check clients table exists
SELECT COUNT(*) FROM clients;

-- Check client_id column exists
SELECT client_id FROM client_transactions LIMIT 1;

-- Test client search view
SELECT * FROM clients_with_recent_activity LIMIT 5;
```

### 2. Test Client Search
- Go to "Dodaj obrót" page
- Start typing in client name field
- Verify dropdown appears after 2 characters
- Test keyboard navigation (arrows, enter, escape)

### 3. Test Client Creation
- Enter new client name
- Add payment amounts
- Save transaction
- Verify client appears in search results
- Check client statistics are updated

### 4. Test Client Selection
- Search for existing client
- Select from dropdown
- Verify name is filled in
- Save and check statistics are updated

## Performance Considerations

### Indexes Added
- `idx_clients_name_search` - for fast name searches
- `idx_clients_phone` - for phone number searches  
- `idx_clients_last_visit` - for activity sorting
- `idx_client_transactions_client_id` - for transaction lookups

### Query Optimization
- Search limited to 10 results by default
- Smart ranking prevents large result sets
- Cached search results for 5 minutes

## Rollback (if needed)

```sql
-- Remove client references from transactions
UPDATE client_transactions SET client_id = NULL;

-- Drop new column
ALTER TABLE client_transactions DROP COLUMN client_id;

-- Drop new tables and functions
DROP VIEW clients_with_recent_activity;
DROP FUNCTION update_client_stats(INTEGER, DATE, DECIMAL);
DROP TABLE clients;
```

**Note**: Rollback will lose all client data and search functionality.

## Future Enhancements

This foundation enables:
- Client profiles with service history
- Appointment scheduling integration
- Client communication features
- Marketing and retention analytics
- Multi-user salon management