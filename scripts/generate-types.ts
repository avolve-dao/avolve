/**
 * TypeScript Types Generator for Avolve Database
 * 
 * This script generates TypeScript types from the Supabase database schema.
 * It uses the Supabase CLI to generate the types and saves them to the specified file.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  outputDir: path.resolve(__dirname, '../types'),
  outputFile: 'supabase.ts',
  projectRef: process.env.SUPABASE_PROJECT_REF || '',
  schema: 'public',
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Generate types
try {
  console.log('Generating TypeScript types from Supabase schema...');
  
  if (!CONFIG.projectRef) {
    console.error('Error: SUPABASE_PROJECT_REF environment variable is not set.');
    console.log('Please set it by running:');
    console.log('export SUPABASE_PROJECT_REF=your-project-ref');
    process.exit(1);
  }

  const command = `supabase gen types typescript --project-ref ${CONFIG.projectRef} --schema ${CONFIG.schema}`;
  const output = execSync(command).toString();
  
  // Save to file
  const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
  fs.writeFileSync(outputPath, output);
  
  console.log(`TypeScript types generated successfully at: ${outputPath}`);
} catch (error) {
  console.error('Error generating TypeScript types:');
  console.error(error);
  process.exit(1);
}
