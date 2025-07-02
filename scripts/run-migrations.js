// Run ClassBoom Database Migrations
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use service role key for admin access
const supabaseUrl = 'https://hokgyujgsvdfhpfrorsu.supabase.co';
const supabaseServiceKey = 'sbp_208aa30e6b741f0720c09bcc6ee26badd33f2d89';

async function runMigrations() {
  console.log('🚀 Running ClassBoom Database Migrations...\n');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, '..', 'supabase', 'setup-classboom.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Loaded migration file: setup-classboom.sql');
    console.log('⚙️  Executing SQL statements...\n');
    
    // Split SQL into individual statements (basic split on semicolons)
    // Note: This is simplified - in production you'd use a proper SQL parser
    const statements = sql
      .split(/;\s*$/gm)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === ';') {
        continue;
      }
      
      // Extract a description from the statement
      const firstLine = statement.split('\n')[0];
      const description = firstLine.length > 50 
        ? firstLine.substring(0, 50) + '...' 
        : firstLine;
      
      try {
        // Execute via RPC call to run raw SQL
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) throw error;
        
        console.log(`✅ [${i + 1}/${statements.length}] ${description}`);
        successCount++;
      } catch (error) {
        console.error(`❌ [${i + 1}/${statements.length}] Failed: ${description}`);
        console.error(`   Error: ${error.message}`);
        errorCount++;
        
        // Continue with other statements even if one fails
        // Some might fail if tables already exist, etc.
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    
    // Verify the setup
    console.log('\n🔍 Verifying ClassBoom setup...');
    
    // Check if tables exist
    const { data: schools } = await supabase.from('schools').select('count');
    const { data: plans } = await supabase.from('subscription_plans').select('*');
    
    if (schools !== null) {
      console.log('✅ Schools table exists');
    }
    
    if (plans && plans.length > 0) {
      console.log(`✅ Subscription plans loaded: ${plans.length} plans`);
      plans.forEach(plan => {
        console.log(`   - ${plan.name}: $${plan.price}/${plan.interval}`);
      });
    }
    
    console.log('\n✨ ClassBoom database migration complete!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations();
}