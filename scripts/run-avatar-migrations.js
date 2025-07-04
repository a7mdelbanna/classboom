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

async function runAvatarMigrations() {
  console.log('🚀 Running avatar migrations...\n');
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check if avatar fields already exist
  console.log('📋 Checking if avatar fields exist...');
  const { data: students, error: checkError } = await supabase
    .from('students')
    .select('avatar_url, avatar_uploaded_at')
    .limit(1);
  
  if (!checkError) {
    console.log('✅ Avatar fields already exist in students table!');
  } else {
    console.log('❌ Avatar fields do not exist.');
    console.log('\n📋 Please run the following SQL files in your Supabase dashboard:\n');
    console.log('1. supabase/add-avatar-fields.sql');
    console.log('2. supabase/create-avatars-bucket.sql');
    
    // Display the SQL content
    const sqlFiles = [
      '../supabase/add-avatar-fields.sql',
      '../supabase/create-avatars-bucket.sql'
    ];
    
    for (const file of sqlFiles) {
      const sqlPath = path.join(__dirname, file);
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('\n' + '='.repeat(60));
        console.log(`File: ${file}`);
        console.log('='.repeat(60));
        console.log(sql);
      }
    }
  }
  
  // Check if avatars bucket exists
  console.log('\n📋 Checking if avatars storage bucket exists...');
  const { data: buckets, error: bucketError } = await supabase
    .storage
    .listBuckets();
  
  if (!bucketError && buckets) {
    const avatarBucket = buckets.find(b => b.name === 'avatars');
    if (avatarBucket) {
      console.log('✅ Avatars storage bucket exists!');
    } else {
      console.log('❌ Avatars storage bucket does not exist.');
      console.log('Please create it using the SQL in supabase/create-avatars-bucket.sql');
    }
  }
}

runAvatarMigrations().catch(console.error);