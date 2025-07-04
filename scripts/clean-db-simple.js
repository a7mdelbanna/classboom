import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  const tables = [
    'parent_student_relationships',
    'payments',
    'invoices', 
    'grades',
    'activities',
    'attendance',
    'enrollment',
    'classes',
    'students',
    'parent_accounts',
    'parents',
    'schools'
  ];

  for (const table of tables) {
    try {
      console.log(`Deleting from ${table}...`);
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible ID)
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error.message);
      } else {
        console.log(`✓ Cleared ${table}`);
      }
    } catch (err) {
      console.error(`Failed on ${table}:`, err);
    }
  }

  // Count remaining records
  console.log('\n📊 Checking remaining records:');
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`${table}: ${count || 0} records`);
      }
    } catch (err) {
      console.error(`Count failed for ${table}`);
    }
  }

  console.log('\n✅ Database cleanup completed!');
}

cleanDatabase();