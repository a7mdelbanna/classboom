# How to Get Your ClassBoom Supabase Keys

## Getting the Correct Keys

1. **Go to your Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/hokgyujgsvdfhpfrorsu

2. **Navigate to Settings → API**
   - You'll see several keys listed

3. **Get the Required Keys:**
   
   ### For Frontend (.env file):
   - **Project URL**: `https://hokgyujgsvdfhpfrorsu.supabase.co`
   - **Anon Key**: This is the public key that starts with `eyJ...`
     - This is safe to use in frontend code
     - Copy this and replace the current value in `.env`

   ### For Backend/Admin (keep secure):
   - **Service Role Key**: The key you provided (`sbp_208aa30e6b741f0720c09bcc6ee26badd33f2d89`)
     - This should NEVER be exposed in frontend code
     - Only use in secure server-side environments

## Update Your .env File

Replace the contents of your `.env` file with:

```env
# ClassBoom Environment Variables

# Supabase Configuration
VITE_CLASSBOOM_SUPABASE_URL=https://hokgyujgsvdfhpfrorsu.supabase.co
VITE_CLASSBOOM_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE  # <-- Replace this!

# Service Role Key (DO NOT commit this to git!)
SUPABASE_SERVICE_ROLE_KEY=sbp_208aa30e6b741f0720c09bcc6ee26badd33f2d89

# ClassBoom API Configuration
VITE_CLASSBOOM_API_URL=http://localhost:3000

# ClassBoom Features
VITE_CLASSBOOM_ENABLE_ANALYTICS=true
VITE_CLASSBOOM_ENABLE_WHATSAPP=false
VITE_CLASSBOOM_ENABLE_PAYMENTS=true

# Development
VITE_CLASSBOOM_DEBUG=false
```

## Verify Your Setup

After updating the keys, run:

```bash
npm run verify:setup
```

This will check:
- ✅ Environment variables are set correctly
- ✅ Connection to Supabase works
- ✅ Required tables exist
- ✅ Subscription plans are loaded

## Security Notes

- **Anon Key**: Safe for frontend, has RLS policies applied
- **Service Role Key**: Bypasses RLS, only for backend/admin tasks
- Never commit `.env` file to git (it's already in `.gitignore`)