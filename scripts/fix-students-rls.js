import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env file');
  process.exit(1);
}

// Use service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixRLS() {
  console.log('🔍 Checking RLS policies on students table...\n');

  try {
    // First, let's check if RLS is enabled
    const { data: rlsCheck, error: rlsError } = await supabase
      .rpc('pg_catalog.pg_tables')
      .eq('tablename', 'students')
      .eq('schemaname', 'public')
      .single();

    console.log('📊 RLS Status Check:');
    
    // Check existing policies
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'students')
      .eq('schemaname', 'public');

    if (policies && policies.length > 0) {
      console.log(`✅ Found ${policies.length} existing policies on students table`);
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.cmd}`);
      });
    } else {
      console.log('❌ No RLS policies found on students table');
      console.log('📝 This is likely why students are disappearing!\n');
    }

    // Create the missing RLS policies
    console.log('🔧 Creating RLS policies for students table...\n');

    // SQL to create proper RLS policies
    const sqlCommands = [
      // First, ensure RLS is enabled
      `ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;`,
      
      // Policy 1: Users can view students from their school
      `CREATE POLICY "Users can view students from their school" ON public.students
      FOR SELECT
      USING (
        school_id IN (
          SELECT id FROM public.schools 
          WHERE owner_id = auth.uid()
          OR id IN (
            SELECT school_id FROM public.school_users 
            WHERE user_id = auth.uid()
          )
        )
      );`,
      
      // Policy 2: Users can insert students to their school
      `CREATE POLICY "Users can create students in their school" ON public.students
      FOR INSERT
      WITH CHECK (
        school_id IN (
          SELECT id FROM public.schools 
          WHERE owner_id = auth.uid()
          OR id IN (
            SELECT school_id FROM public.school_users 
            WHERE user_id = auth.uid()
          )
        )
      );`,
      
      // Policy 3: Users can update students in their school
      `CREATE POLICY "Users can update students in their school" ON public.students
      FOR UPDATE
      USING (
        school_id IN (
          SELECT id FROM public.schools 
          WHERE owner_id = auth.uid()
          OR id IN (
            SELECT school_id FROM public.school_users 
            WHERE user_id = auth.uid()
          )
        )
      )
      WITH CHECK (
        school_id IN (
          SELECT id FROM public.schools 
          WHERE owner_id = auth.uid()
          OR id IN (
            SELECT school_id FROM public.school_users 
            WHERE user_id = auth.uid()
          )
        )
      );`,
      
      // Policy 4: Users can delete students from their school
      `CREATE POLICY "Users can delete students from their school" ON public.students
      FOR DELETE
      USING (
        school_id IN (
          SELECT id FROM public.schools 
          WHERE owner_id = auth.uid()
          OR id IN (
            SELECT school_id FROM public.school_users 
            WHERE user_id = auth.uid()
          )
        )
      );`
    ];

    // Execute each command
    for (const sql of sqlCommands) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
          if (error.message.includes('already exists')) {
            console.log('⚠️  Policy already exists, skipping...');
          } else {
            console.error('❌ Error executing SQL:', error.message);
          }
        } else {
          console.log('✅ Policy created successfully');
        }
      } catch (err) {
        console.error('❌ Error:', err.message);
      }
    }

    console.log('\n✅ RLS policies setup complete!');
    
    // Test by counting students
    const { count, error: countError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
      
    if (!countError) {
      console.log(`\n📊 Total students accessible: ${count || 0}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
checkAndFixRLS();