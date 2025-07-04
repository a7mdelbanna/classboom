#!/usr/bin/env node

/**
 * Test SMTP Configuration Script
 * 
 * This script tests if the SMTP configuration is working correctly
 * by attempting to send a test email through Supabase's auth system.
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSMTPConfiguration() {
  console.log('🧪 Testing SMTP Configuration...\n');
  
  // Generate a test email
  const testEmail = `test-${Date.now()}@classboom.test`;
  
  try {
    console.log(`📧 Attempting to send auth email to: ${testEmail}`);
    
    // Try to sign up with a test email
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        emailRedirectTo: 'http://localhost:5173',
        data: {
          first_name: 'SMTP',
          last_name: 'Test',
          role: 'school_owner'
        }
      }
    });
    
    if (error) {
      console.error('❌ Auth error:', error.message);
      return;
    }
    
    console.log('✅ Auth request successful!');
    console.log('📨 Check the following:\n');
    console.log('1. Resend Dashboard (https://resend.com/emails)');
    console.log('   - Should show a new email if SMTP is working');
    console.log('   - Check the "Emails" tab for activity\n');
    
    console.log('2. Supabase Auth Logs');
    console.log('   - Dashboard → Authentication → Logs');
    console.log('   - Look for email sending attempts\n');
    
    console.log('3. Rate Limits');
    console.log('   - Current limit should be 100 emails/hour');
    console.log('   - Check if you\'re hitting limits\n');
    
    // Clean up test user
    if (data.user) {
      console.log('🧹 Cleaning up test user...');
      // Note: This requires service role key, so we'll skip for now
      console.log('   (Test user will need manual cleanup)');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the test
testSMTPConfiguration();