import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { EmailService } from '../services/emailServiceClient';

export function EmailDebugger() {
  const [log, setLog] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log('📝 Debug:', message);
  };

  const testDirectEdgeFunction = async () => {
    addLog('Testing direct Edge Function call...');
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'ahmedoshkaa@gmail.com',
          subject: `Direct Test - ${new Date().toLocaleTimeString()}`,
          html: '<p>Direct Edge Function test</p>',
          text: 'Direct test'
        }
      });
      
      if (error) {
        addLog(`❌ Edge Function error: ${JSON.stringify(error)}`);
      } else {
        addLog(`✅ Edge Function success: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      addLog(`❌ Exception: ${err.message}`);
    }
  };

  const testEmailService = async () => {
    addLog('Testing EmailService.sendStudentInvitation...');
    
    try {
      const result = await EmailService.sendStudentInvitation('ahmedoshkaa@gmail.com', {
        studentName: 'Test Student',
        schoolName: 'Test School',
        inviterName: 'Test Admin',
        activationLink: 'http://localhost:5173/test',
        expiresIn: '48 hours'
      });
      
      addLog(`✅ EmailService success: ${result}`);
    } catch (err: any) {
      addLog(`❌ EmailService error: ${err.message}`);
    }
  };

  const testResendAPI = async () => {
    addLog('Testing Resend API directly from browser...');
    
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer re_gf9oScbs_EaxNpdVffGKZxbNgWYrNUUkx',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'ClassBoom <onboarding@resend.dev>',
          to: 'ahmedoshkaa@gmail.com',
          subject: `Browser Test - ${new Date().toLocaleTimeString()}`,
          html: '<p>Direct browser test</p>'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addLog(`✅ Resend API success: ${JSON.stringify(data)}`);
      } else {
        addLog(`❌ Resend API error: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      addLog(`❌ Resend API exception: ${err.message}`);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setLog([]);
    
    addLog('Starting comprehensive email tests...');
    
    // Test 1: Direct Edge Function
    await testDirectEdgeFunction();
    
    // Test 2: EmailService
    await testEmailService();
    
    // Test 3: Direct Resend API
    await testResendAPI();
    
    addLog('Tests complete! Check your email and Resend dashboard.');
    setTesting(false);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-md">
      <h3 className="text-lg font-semibold mb-2">Email Debugger</h3>
      
      <button
        onClick={runAllTests}
        disabled={testing}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mb-3"
      >
        {testing ? 'Testing...' : 'Run Email Tests'}
      </button>
      
      <div className="bg-gray-100 dark:bg-gray-900 rounded p-2 h-64 overflow-y-auto">
        <pre className="text-xs whitespace-pre-wrap">
          {log.length > 0 ? log.join('\n') : 'Click "Run Email Tests" to start'}
        </pre>
      </div>
    </div>
  );
}