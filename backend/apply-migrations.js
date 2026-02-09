#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function applyMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully\n');

    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = [
      'add_companies_system.sql',
      'add_clients_view.sql',
      'add_services_catalog.sql'
    ];

    for (const file of migrationFiles) {
      console.log(`📄 Applying migration: ${file}...`);
      const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      try {
        await pool.query(migrationSQL);
        console.log(`✅ ${file} applied successfully\n`);
      } catch (error) {
        if (error.code === '42P07' || error.code === '42710') {
          console.log(`⚠️  ${file} - Already applied (tables/types exist)\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ All migrations complete!');
    
  } catch (error) {
    console.error('\n❌ Error applying migrations:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigrations();
