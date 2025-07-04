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

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStudentUpdate() {
  console.log('🔍 Debugging student update issue...\n');

  try {
    // 1. First, let's get a student to test with
    const { data: students, error: fetchError } = await supabase
      .from('students')
      .select('id, email, first_name, last_name, school_id, invite_token, can_login')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching students:', fetchError);
      return;
    }

    if (!students || students.length === 0) {
      console.log('No students found in database');
      return;
    }

    const student = students[0];
    console.log('📋 Found student:', {
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      email: student.email,
      current_invite_token: student.invite_token,
      can_login: student.can_login
    });

    // 2. Try to update the student with a test token
    const testToken = 'test_' + Date.now();
    console.log('\n🔧 Attempting to update with test token:', testToken);

    const { data: updateData, error: updateError } = await supabase
      .from('students')
      .update({
        invite_token: testToken,
        invite_sent_at: new Date().toISOString(),
        can_login: true
      })
      .eq('id', student.id)
      .select();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('Error details:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
    } else {
      console.log('✅ Update successful:', updateData);
    }

    // 3. Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('students')
      .select('invite_token, invite_sent_at, can_login')
      .eq('id', student.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('\n✅ Verification result:', verifyData);
      if (verifyData.invite_token === testToken) {
        console.log('✅ Token was successfully saved!');
      } else {
        console.log('❌ Token was NOT saved. Current token:', verifyData.invite_token);
      }
    }

    // 4. Check if we're authenticated
    const { data: { user } } = await supabase.auth.getUser();
    console.log('\n👤 Current user:', user ? user.email : 'Not authenticated');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

debugStudentUpdate();