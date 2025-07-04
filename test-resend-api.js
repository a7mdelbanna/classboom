#!/usr/bin/env node

/**
 * Test Resend API directly
 */

const RESEND_API_KEY = 're_gf9oScbs_EaxNpdVffGKZxbNgWYrNUUkx';

async function testResendAPI() {
  console.log('🧪 Testing Resend API directly...\n');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ClassBoom <noreply@classboom.vercel.app>',
        to: 'test@example.com',
        subject: 'Test Email from Node.js',
        html: '<p>This is a test email sent directly via Resend API.</p>'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!', data);
    } else {
      console.log('❌ Error:', response.status, data);
    }
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

// Test with onboarding@resend.dev (pre-verified domain)
async function testWithResendDomain() {
  console.log('\n🧪 Testing with Resend\'s verified domain...\n');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ClassBoom <onboarding@resend.dev>',
        to: 'ahmedoshkaa@gmail.com',
        subject: 'Test Email from ClassBoom',
        html: '<p>This is a test email sent via Resend\'s verified domain.</p>'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success with resend.dev!', data);
      console.log('📧 Check your email inbox (and spam folder)');
    } else {
      console.log('❌ Error:', response.status, data);
    }
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

// Run tests
testResendAPI().then(() => testWithResendDomain());