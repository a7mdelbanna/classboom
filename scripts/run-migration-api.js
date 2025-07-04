import fetch from 'node-fetch';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const projectRef = 'hokgyujgsvdfhpfrorsu';
  const supabaseUrl = `https://${projectRef}.supabase.co`;
  
  // Read the SQL file
  const sqlPath = join(__dirname, 'create-activities-table.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('Attempting to run migration via Supabase API...');
  console.log('SQL Preview:', sql.substring(0, 200) + '...');
  
  // Try using the Edge Function to execute SQL
  const response = await fetch(`${supabaseUrl}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql })
  });
  
  const result = await response.text();
  console.log('Response:', result);
}

runMigration().catch(console.error);