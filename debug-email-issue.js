// Debug script to test the email flow step by step

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hokgyujgsvdfhpfrorsu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhva2d5dWpnc3ZkZmhwZnJvcnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Nzc0OTIsImV4cCI6MjA2NzA1MzQ5Mn0.hTqKW059EmFC3ZOivtMFA6rRCpXy_KJ67Yx2EKusyyo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDirectEdgeFunction() {
  console.log('=== Testing Direct Edge Function Call ===');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'ahmedoshkaa@gmail.com',
        subject: 'Debug Test ' + new Date().toLocaleTimeString(),
        html: '<p>This is a debug test sent at ' + new Date().toLocaleTimeString() + '</p>',
        text: 'Debug test'
      }
    });
    
    console.log('Direct call result:', { data, error });
    return { success: !error, data, error };
  } catch (err) {
    console.error('Direct call exception:', err);
    return { success: false, error: err.message };
  }
}

async function checkEdgeFunctionHealth() {
  console.log('\n=== Checking Edge Function Health ===');
  
  try {
    // Try to call the function with minimal data
    const response = await fetch('https://hokgyujgsvdfhpfrorsu.supabase.co/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Health Check',
        html: '<p>Health check</p>',
        text: 'Health check'
      })
    });
    
    const result = await response.text();
    console.log('Raw response:', {
      status: response.status,
      statusText: response.statusText,
      body: result
    });
    
    return response.ok;
  } catch (err) {
    console.error('Health check failed:', err);
    return false;
  }
}

// Run all tests
async function runDiagnostics() {
  console.log('Starting email diagnostics...\n');
  
  // Test 1: Direct Edge Function call
  const directTest = await testDirectEdgeFunction();
  console.log('Direct test passed:', directTest.success);
  
  // Test 2: Health check
  const healthCheck = await checkEdgeFunctionHealth();
  console.log('Health check passed:', healthCheck);
  
  console.log('\n=== Diagnostics Complete ===');
  console.log('If the direct test succeeded, check your email and Resend dashboard.');
  console.log('If it failed, check the error messages above.');
}

// Export for use in browser console
window.runEmailDiagnostics = runDiagnostics;
console.log('Run window.runEmailDiagnostics() to test email system');