# Email Configuration Guide

## 🎯 Unified Email System

ClassBoom uses **Resend** as the email provider for ALL emails (auth + invitations) to ensure:
- ✅ Consistent branding across all communications
- ✅ Better deliverability and reputation management  
- ✅ Single dashboard for email analytics
- ✅ Professional appearance with custom domain

## 📧 Email Types

### 1. **Authentication Emails** (via Supabase + Resend SMTP)
- Email verification for new school signups
- Password reset emails
- Email change confirmations

### 2. **Invitation Emails** (via Edge Function + Resend API)
- Student portal invitations
- Parent portal invitations
- Welcome emails after activation

## ⚙️ Configuration Setup

### Environment Variables (.env)
```bash
# App Configuration
VITE_APP_URL=https://classboom.vercel.app

# Email Configuration
VITE_EMAIL_FROM_ADDRESS=noreply@classboom.vercel.app
VITE_EMAIL_FROM_NAME=ClassBoom
VITE_EMAIL_SUPPORT_ADDRESS=support@classboom.vercel.app

# Resend API
VITE_RESEND_API_KEY=re_your_api_key_here
```

### Supabase SMTP Settings
**Path:** Supabase Dashboard → Settings → Authentication → SMTP Settings

```
Enable custom SMTP: ✅
Sender name: ClassBoom
Sender email: noreply@classboom.vercel.app
Host: smtp.resend.com
Port: 465
Username: resend
Password: [Your Resend API Key]
```

### Rate Limits
**Path:** Supabase Dashboard → Settings → Authentication → Rate Limits
- **Recommended:** 100 emails/hour (adjust based on needs)

## 🔄 Changing Domains/Environments

When moving from staging to production or changing domains:

### 1. Update Environment Variables
```bash
# Production Example
VITE_APP_URL=https://app.classboom.com
VITE_EMAIL_FROM_ADDRESS=noreply@classboom.com
VITE_EMAIL_SUPPORT_ADDRESS=support@classboom.com
```

### 2. Update Supabase SMTP Settings
- Change sender email to match new domain
- Update any custom email templates if needed

### 3. DNS Configuration (for custom domain)
Add these DNS records for your domain:

**For Resend:**
```
TXT record: resend._domainkey.yourdomain.com
Value: [Provided by Resend]

CNAME record: em.yourdomain.com  
Value: [Provided by Resend]
```

**For better deliverability:**
```
TXT record (SPF): yourdomain.com
Value: v=spf1 include:_spf.resend.com ~all

TXT record (DMARC): _dmarc.yourdomain.com
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

## 📁 File Structure

```
src/
├── config/
│   └── email.config.ts          # Centralized email configuration
├── services/
│   └── emailServiceClient.ts    # Email sending service
└── supabase/functions/
    └── send-email/
        └── index.ts              # Edge Function for Resend
```

## 🧪 Testing

### Local Development
1. Use localhost URLs in development `.env`
2. Test with real email addresses (add to Supabase team if needed)
3. Check Resend dashboard for delivery status

### Production Testing
1. Update all environment variables
2. Test complete signup flow
3. Test student/parent invitation flow
4. Monitor deliverability in Resend dashboard

## 🔧 Troubleshooting

### Common Issues

**Emails not sending:**
1. Check Resend API key is valid
2. Verify SMTP settings in Supabase
3. Check rate limits aren't exceeded
4. Review Resend dashboard logs

**Emails going to spam:**
1. Verify SPF/DKIM/DMARC records
2. Use consistent sender identity
3. Avoid promotional content in auth emails
4. Monitor sender reputation

**Wrong activation URLs:**
1. Check `VITE_APP_URL` environment variable
2. Ensure it matches deployed domain
3. Verify Edge Function deployment

### Debug Commands
```bash
# Check environment variables
npm run dev # Then check browser console

# Test Edge Function
npx supabase functions invoke send-email --body '{"to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'

# Check Supabase logs
npx supabase logs --project-ref your-project-ref
```

## 📊 Monitoring

### Resend Dashboard
- Email delivery rates
- Bounce/complaint rates  
- API usage statistics

### Supabase Logs
- Authentication email attempts
- Edge Function invocations
- Error logs for debugging

## 🚀 Production Checklist

- [ ] Custom domain configured with proper DNS records
- [ ] Resend DKIM/SPF/DMARC verified
- [ ] Environment variables updated for production
- [ ] Supabase SMTP settings updated
- [ ] Rate limits adjusted for expected volume
- [ ] Email templates tested with production URLs
- [ ] Monitoring and alerting configured

---

## 📞 Support

For email delivery issues:
- Check Resend dashboard first
- Review Supabase auth logs
- Verify DNS configuration
- Contact support with specific error messages

Last updated: 2025-07-04