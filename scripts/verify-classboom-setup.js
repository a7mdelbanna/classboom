// Verify ClassBoom Setup
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

async function verifySetup() {
  console.log('🔍 Verifying ClassBoom Setup...\n');
  
  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('📋 Environment Variables:');
  console.log('  - Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('  - Supabase Key:', supabaseKey ? `✅ Set (${supabaseKey.substring(0, 10)}...)` : '❌ Missing');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Missing required environment variables!');
    console.log('Please ensure your .env file contains:');
    console.log('  VITE_SUPABASE_URL=your-project-url');
    console.log('  VITE_SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
  }
  
  // Test connection
  console.log('\n🌐 Testing Database Connection...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check if tables exist
    const tables = ['schools', 'subscription_plans'];
    let allTablesExist = true;
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      
      if (error && error.code === '42P01') {
        console.log(`  - Table '${table}':`, '❌ Does not exist');
        allTablesExist = false;
      } else if (error) {
        console.log(`  - Table '${table}':`, `❌ Error: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`  - Table '${table}':`, '✅ Exists');
      }
    }
    
    if (!allTablesExist) {
      console.log('\n⚠️  Some tables are missing!');
      console.log('Please run the SQL migrations in your Supabase dashboard:');
      console.log('  1. Go to SQL Editor in Supabase');
      console.log('  2. Run: supabase/migrations/001_classboom_core_setup.sql');
      console.log('  3. Run: supabase/migrations/002_classboom_auth_setup.sql');
    } else {
      console.log('\n✅ All required tables exist!');
      
      // Check subscription plans
      const { data: plans } = await supabase.from('subscription_plans').select('*');
      console.log(`\n📊 Found ${plans?.length || 0} subscription plans`);
      
      if (plans && plans.length > 0) {
        console.log('Available plans:');
        plans.forEach(plan => {
          console.log(`  - ${plan.name} (${plan.code}): $${plan.price}/${plan.interval}`);
        });
      }
    }
    
    console.log('\n✨ ClassBoom setup verification complete!');
    
  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
  }
}

// Add package.json script support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  verifySetup();
}

export { verifySetup };