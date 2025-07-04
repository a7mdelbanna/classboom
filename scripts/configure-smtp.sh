#!/bin/bash

# Configure Supabase SMTP via Management API
# You need to get your access token from https://supabase.com/dashboard/account/tokens

echo "Configuring Supabase SMTP..."

# IMPORTANT: Replace with your actual access token
SUPABASE_ACCESS_TOKEN="YOUR_ACCESS_TOKEN_HERE"
PROJECT_REF="hokgyujgsvdfhpfrorsu"

curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "external_email_enabled": true,
    "mailer_secure_email_change_enabled": true,
    "mailer_autoconfirm": false,
    "smtp_admin_email": "noreply@classboom.vercel.app",
    "smtp_host": "smtp.resend.com",
    "smtp_port": 587,
    "smtp_user": "resend",
    "smtp_pass": "re_gf9oScbs_EaxNpdVffGKZxbNgWYrNUUkx",
    "smtp_sender_name": "ClassBoom"
  }'

echo ""
echo "SMTP configuration request sent!"
echo "Wait 2-3 minutes for changes to take effect."