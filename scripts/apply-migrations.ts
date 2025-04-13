/**
 * Migration Application Script for Avolve Database
 * 
 * This script applies migrations to the Supabase database using the MCP server.
 * It reads migration files from the migrations directory and applies them in order.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Configuration
const CONFIG = {
  migrationsDir: path.resolve(__dirname, '../supabase/migrations'),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  projectId: process.env.SUPABASE_PROJECT_ID || '',
};

// Validate configuration
if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey || !CONFIG.projectId) {
  console.error('Error: Missing environment variables.');
  console.log('Please set the following environment variables:');
  console.log('- SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  console.log('- SUPABASE_PROJECT_ID');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// Get list of migration files
async function getMigrationFiles(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(CONFIG.migrationsDir, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      // Filter for SQL files and sort by name
      const migrationFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort();

      resolve(migrationFiles);
    });
  });
}

// Apply a migration
async function applyMigration(fileName: string): Promise<void> {
  const filePath = path.join(CONFIG.migrationsDir, fileName);
  const migrationName = fileName.replace('.sql', '');
  
  console.log(`Applying migration: ${migrationName}`);
  
  try {
    // Read migration file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Apply migration using Supabase
    const { error } = await supabase.rpc('apply_migration', {
      name: migrationName,
      project_id: CONFIG.projectId,
      query: sql,
    });
    
    if (error) {
      throw error;
    }
    
    console.log(`Migration ${migrationName} applied successfully.`);
  } catch (error) {
    console.error(`Error applying migration ${migrationName}:`, error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('Starting migration application...');
    
    // Get migration files
    const migrationFiles = await getMigrationFiles();
    console.log(`Found ${migrationFiles.length} migration files.`);
    
    // Apply migrations in order
    for (const file of migrationFiles) {
      await applyMigration(file);
    }
    
    console.log('All migrations applied successfully.');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

// Run the main function
main();
