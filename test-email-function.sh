#!/bin/bash

echo "Testing ClassBoom Email Function..."
echo ""

# Your Supabase project details
SUPABASE_URL="https://hokgyujgsvdfhpfrorsu.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhva2d5dWpnc3ZkZmhwZnJvcnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Nzc0OTIsImV4cCI6MjA2NzA1MzQ5Mn0.hTqKW059EmFC3ZOivtMFA6rRCpXy_KJ67Yx2EKusyyo"

# Test email data
EMAIL_DATA='{
  "to": "test@example.com",
  "subject": "Test Email from ClassBoom",
  "html": "<h1>Test Email</h1><p>This is a test email from the ClassBoom Edge Function.</p>",
  "text": "Test Email - This is a test email from the ClassBoom Edge Function."
}'

# Send test request
echo "Sending test email..."
echo ""

curl -i -X POST "${SUPABASE_URL}/functions/v1/send-email" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "${EMAIL_DATA}"

echo ""
echo ""
echo "Test complete! Check the response above."