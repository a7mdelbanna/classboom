# SMTP Configuration Troubleshooting Guide

## 🚨 Current Issue
Email confirmations are not being sent through Resend SMTP despite configuration in Supabase.

## ✅ What's Working
- Application login/signup flow works when email confirmation is disabled
- Resend API key is valid (Edge Function emails work)
- Supabase authentication is functional

## ❌ What's Not Working
- SMTP emails not going through Resend
- Falling back to Supabase's default email service (4/hour limit)
- Resend dashboard shows 0 emails sent via SMTP

## 🔧 Solution Options

### Option 1: Fix SMTP Configuration (Recommended)

1. **Change Port from 465 to 587**
   ```
   Host: smtp.resend.com
   Port: 587 (STARTTLS)
   Username: resend
   Password: [Your API Key]
   ```

2. **Use Resend Test Domain**
   - Change sender to: `noreply@resend.dev`
   - This bypasses domain verification requirements

3. **Verify API Key Permissions**
   - Check at: https://resend.com/api-keys
   - Ensure "sending_access" is enabled
   - Try creating a new API key specifically for SMTP

### Option 2: Temporary Workaround

1. **Keep Email Confirmations Disabled**
   - Quick solution for development
   - Re-enable before production

2. **Use Manual Verification**
   - Create admin tool to verify users
   - Send welcome emails via Edge Function

### Option 3: Alternative Email Providers

If Resend SMTP continues to fail:

1. **SendGrid**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [SendGrid API Key]
   ```

2. **Mailgun**
   ```
   Host: smtp.mailgun.org
   Port: 587
   Username: [Your Mailgun Username]
   Password: [Your Mailgun Password]
   ```

3. **Amazon SES**
   ```
   Host: email-smtp.[region].amazonaws.com
   Port: 587
   Username: [SMTP Username]
   Password: [SMTP Password]
   ```

## 📝 Testing Steps

1. **With Email Confirmation Disabled:**
   - Create new account
   - Login immediately
   - All features work

2. **To Test SMTP (when fixed):**
   - Enable email confirmations
   - Create test account
   - Check Resend dashboard for activity
   - Verify email received

## 🎯 Next Steps

1. **For Development:**
   - Continue with email confirmations disabled
   - Focus on building features
   - Return to SMTP configuration later

2. **For Production:**
   - Must have working email confirmations
   - Consider using a different SMTP provider
   - Or use Supabase's built-in service temporarily

## 📊 Configuration Status

| Setting | Value | Status |
|---------|-------|--------|
| SMTP Enabled | ✅ | Configured |
| Host | smtp.resend.com | ✅ Set |
| Port | 465 | ⚠️ Try 587 |
| Username | resend | ✅ Set |
| Password | API Key | ✅ Set |
| Sender Email | noreply@classboom.vercel.app | ⚠️ Try resend.dev |
| Rate Limit | 100/hour | ✅ Increased |
| Emails Sent | 0 | ❌ Not working |

## 🔍 Debug Information

### Check Supabase Logs
```sql
-- Run in SQL Editor
SELECT * FROM auth.audit_log_entries
WHERE payload->>'type' = 'email'
ORDER BY created_at DESC
LIMIT 10;
```

### Monitor Resend Dashboard
- URL: https://resend.com/emails
- Check "Emails" tab for SMTP activity
- Check "API Keys" for usage

### Test with Different Configuration
1. Port 587 instead of 465
2. Different sender domain
3. New API key
4. Different email provider

---

**Note:** Email confirmation is a critical security feature. Only disable it temporarily for development. Always enable it for production deployments.