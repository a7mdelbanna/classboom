#!/bin/bash

echo "🚀 Deploying ClassBoom Edge Functions to Supabase..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/functions/send-email/index.ts" ]; then
    echo "❌ Please run this script from the ClassBoom project root directory"
    exit 1
fi

echo "📦 Deploying send-email Edge Function..."
supabase functions deploy send-email --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
    echo ""
    echo "⚠️  IMPORTANT: Make sure to set the RESEND_API_KEY in your Supabase dashboard:"
    echo ""
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to: Edge Functions → send-email → Secrets"
    echo "3. Add a new secret:"
    echo "   - Name: RESEND_API_KEY"
    echo "   - Value: Your Resend API key from https://resend.com/api-keys"
    echo ""
    echo "4. Click 'Save' to apply the secret"
    echo ""
    echo "🔍 To verify the deployment, check the logs:"
    echo "   supabase functions logs send-email"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi