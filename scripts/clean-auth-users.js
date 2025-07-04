import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// We need service role key for auth operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAuthUsers() {
  console.log('🧹 Cleaning auth users...\n');

  try {
    // Get current user first
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    console.log('Current user:', currentUser?.email || 'Not logged in');

    // List all users using the admin API
    console.log('\n📊 Fetching user list...');
    
    // Note: This requires service role key, with anon key we can only see our own user
    // For now, let's just sign out the current user
    
    if (currentUser) {
      console.log('\nSigning out current user...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('✓ Signed out successfully');
      }
    }

    console.log('\n✅ Auth cleanup completed!');
    console.log('\nNote: To delete all auth users, you need to:');
    console.log('1. Go to Supabase Dashboard > Authentication > Users');
    console.log('2. Select and delete users manually');
    console.log('3. Or use the service role key (not anon key) for programmatic deletion');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanAuthUsers();