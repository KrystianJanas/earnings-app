#!/usr/bin/env node

/**
 * Database initialization script for Beautician Earnings Tracker
 * This script initializes the PostgreSQL database with the required schema
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.error('\nPlease set DATABASE_URL to your PostgreSQL connection string.');
    console.error('Format: postgresql://username:password@host:port/database');
    console.error('\nYou can get a free PostgreSQL database from:');
    console.error('  - Neon: https://neon.tech');
    console.error('  - Supabase: https://supabase.com');
    console.error('  - ElephantSQL: https://www.elephantsql.com');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database successfully');

    // Read and execute init.sql
    console.log('\n📄 Reading init.sql...');
    const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    
    console.log('🔨 Creating tables and schema...');
    await pool.query(initSQL);
    console.log('✅ Database schema created successfully');

    // Check if migrations should be run
    console.log('\n📋 Checking for additional migrations...');
    const migrationsDir = path.join(__dirname, 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();
      
      for (const file of migrationFiles) {
        console.log(`  - Found migration: ${file}`);
      }
      
      if (migrationFiles.length > 0) {
        console.log('\n⚠️  Note: Additional migrations found but not automatically applied.');
        console.log('   Review and apply them manually if needed.');
      }
    }

    console.log('\n✅ Database initialization complete!');
    console.log('\nYou can now start the application with: npm start');
    
  } catch (error) {
    console.error('\n❌ Error initializing database:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 The database server appears to be unreachable.');
      console.error('   Please check your DATABASE_URL and ensure the database is running.');
    } else if (error.code === '42P07') {
      console.log('\n✅ Tables already exist - database appears to be initialized.');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
