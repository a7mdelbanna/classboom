import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function executeSql() {
  console.log('🚀 Attempting to create activities table...\n');
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Since we can't run DDL directly, let's create the table using a workaround
  // We'll check if it exists first
  const { data: tableCheck, error: checkError } = await supabase
    .from('activities')
    .select('id')
    .limit(1);
  
  if (!checkError || checkError.code !== '42P01') {
    console.log('✅ Activities table already exists!');
    return;
  }
  
  console.log('❌ Activities table does not exist.');
  console.log('\n📋 Please run the following SQL in your Supabase dashboard:\n');
  
  // Read and display the SQL
  const sqlPath = path.join(__dirname, 'create-activities-table.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('='.repeat(60));
  console.log(sql);
  console.log('='.repeat(60));
  
  // Let me try one more approach - using RPC
  try {
    console.log('\n🔧 Attempting to create table via RPC...');
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sql 
    });
    
    if (error) {
      console.log('RPC method not available:', error.message);
    } else {
      console.log('✅ Table created successfully!');
    }
  } catch (e) {
    console.log('RPC approach failed:', e.message);
  }
}

executeSql();