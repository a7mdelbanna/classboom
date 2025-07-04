import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Read the SQL file
    const cleanDbSql = fs.readFileSync(join(__dirname, 'clean-database.sql'), 'utf8');
    
    // Split by semicolon and filter out empty statements
    const statements = cleanDbSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.includes('SELECT') && statement.includes('UNION')) {
        // This is the verification query, run it and show results
        console.log('📊 Checking table counts...');
        const { data, error } = await supabase.rpc('sql', { query: statement });
        if (error) {
          console.error('Error:', error.message);
        } else {
          console.table(data);
        }
      } else {
        // Regular statement
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('sql', { query: statement });
        if (error) {
          console.error('Error:', error.message);
        }
      }
    }

    console.log('\n✅ Database cleanup completed!');
    
    // Run verification
    console.log('\n🔍 Running schema verification...\n');
    const verifySql = fs.readFileSync(join(__dirname, 'verify-schema.sql'), 'utf8');
    const verifyStatements = verifySql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of verifyStatements) {
      if (statement.includes('SELECT') && !statement.includes('DO $$')) {
        const { data, error } = await supabase.rpc('sql', { query: statement });
        if (error) {
          console.error('Verification error:', error.message);
        } else if (data && data.length > 0) {
          console.table(data);
        }
      }
    }

  } catch (error) {
    console.error('Failed to clean database:', error);
  }
}

cleanDatabase();