#!/bin/bash

echo "🚀 ClassBoom Email Function Deployment Script"
echo "============================================"
echo ""
echo "This script will help you deploy the email sending function to Supabase."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Installing via Homebrew..."
    brew install supabase/tap/supabase
else
    echo "✅ Supabase CLI is already installed"
fi

echo ""
echo "📋 Next steps:"
echo ""
echo "1. First, you need to login to Supabase:"
echo "   Run: supabase login"
echo ""
echo "2. Link your project:"
echo "   Run: supabase link --project-ref hokgyujgsvdfhpfrorsu"
echo ""
echo "3. Set the Resend API key as a secret:"
echo "   Run: supabase secrets set RESEND_API_KEY=re_gf9oScbs_EaxNpdVffGKZxbNgWYrNUUkx"
echo ""
echo "4. Deploy the email function:"
echo "   Run: supabase functions deploy send-email --no-verify-jwt"
echo ""
echo "5. Test the deployment:"
echo "   The function will be available at:"
echo "   https://hokgyujgsvdfhpfrorsu.supabase.co/functions/v1/send-email"
echo ""
echo "📝 Note: After deployment, emails will be sent automatically when users"
echo "    send invitations in ClassBoom!"
echo ""
echo "🔧 If you encounter any issues:"
echo "   - Make sure you're logged into Supabase Dashboard"
echo "   - Check that your project is active"
echo "   - Verify the Resend API key is correct"
echo ""
echo "Would you like to run these commands now? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "Starting deployment process..."
    echo ""
    
    # Step 1: Login
    echo "Step 1: Logging in to Supabase..."
    supabase login
    
    # Step 2: Link project
    echo ""
    echo "Step 2: Linking to your project..."
    supabase link --project-ref hokgyujgsvdfhpfrorsu
    
    # Step 3: Set secret
    echo ""
    echo "Step 3: Setting Resend API key..."
    supabase secrets set RESEND_API_KEY=re_gf9oScbs_EaxNpdVffGKZxbNgWYrNUUkx
    
    # Step 4: Deploy function
    echo ""
    echo "Step 4: Deploying the email function..."
    supabase functions deploy send-email --no-verify-jwt
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "Your email function is now live at:"
    echo "https://hokgyujgsvdfhpfrorsu.supabase.co/functions/v1/send-email"
    echo ""
    echo "🎉 ClassBoom will now send real emails when invitations are sent!"
else
    echo ""
    echo "No problem! You can run the commands manually when ready."
fi