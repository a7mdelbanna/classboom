import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('📦 Applying student/parent authentication migration...\n');

  try {
    // Read migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20240107000000_add_student_parent_auth_columns.sql');
    const migrationSql = readFileSync(migrationPath, 'utf8');
    
    // Split by statement (crude but works for this migration)
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const preview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';
      
      console.log(`[${i + 1}/${statements.length}] Executing: ${preview}`);
      
      // For this we need to use raw SQL execution
      // Since Supabase JS client doesn't support DDL, we'll create the columns via the dashboard
      console.log('  ⚠️  Please run this statement in Supabase SQL Editor');
    }

    console.log('\n⚠️  IMPORTANT: Since we cannot run DDL statements via the JS client,');
    console.log('    please copy the migration file and run it in the Supabase SQL Editor:');
    console.log(`    ${migrationPath}`);
    console.log('\nOr run the check script first to see what columns are missing:');
    console.log('    scripts/check-student-invite-token.sql');

  } catch (error) {
    console.error('Error:', error);
  }
}

applyMigration();