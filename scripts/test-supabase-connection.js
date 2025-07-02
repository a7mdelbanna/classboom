// Test ClassBoom Supabase Connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hokgyujgsvdfhpfrorsu.supabase.co';
const supabaseKey = 'sbp_208aa30e6b741f0720c09bcc6ee26badd33f2d89';

async function testConnection() {
  console.log('🚀 Testing ClassBoom Supabase Connection...\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Check if we can query the subscription plans
    console.log('📋 Fetching subscription plans...');
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (plansError) {
      console.error('❌ Error fetching plans:', plansError.message);
    } else {
      console.log('✅ Successfully fetched plans:', plans?.length || 0, 'plans found');
    }
    
    // Test 2: Check if we can query schools
    console.log('\n🏫 Fetching schools...');
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*');
    
    if (schoolsError) {
      console.error('❌ Error fetching schools:', schoolsError.message);
    } else {
      console.log('✅ Successfully fetched schools:', schools?.length || 0, 'schools found');
    }
    
    console.log('\n✨ ClassBoom Supabase connection test complete!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();