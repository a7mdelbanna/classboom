# ClassBoom Supabase Setup Instructions

## Database Setup

1. **Go to your Supabase Dashboard**
   - Project Reference: `hokgyujgsvdfhpfrorsu`
   - Navigate to the SQL Editor

2. **Run the migrations in order:**
   
   a. First, run `supabase/migrations/001_classboom_core_setup.sql`
      - This creates the multi-tenant architecture
      - Sets up the schools registry
      - Creates subscription plans
      - Implements the schema generation function
   
   b. Then, run `supabase/migrations/002_classboom_auth_setup.sql`
      - Sets up authentication triggers
      - Creates helper functions for user management
      - Implements login/signup flows

3. **Configure Authentication**
   - Go to Authentication → Settings
   - Enable Email authentication
   - Set up email templates with ClassBoom branding
   - Configure redirect URLs:
     - Site URL: `http://localhost:5173`
     - Redirect URLs: `http://localhost:5173/auth/callback`

4. **Get your API keys**
   - Go to Settings → API
   - Copy your project URL and anon key
   - Create a `.env` file in the classboom directory:
   ```
   VITE_CLASSBOOM_SUPABASE_URL=https://hokgyujgsvdfhpfrorsu.supabase.co
   VITE_CLASSBOOM_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Enable Row Level Security (RLS)**
   - The migrations already set up RLS policies
   - Verify they're enabled in the Table Editor

## Testing the Setup

After running the migrations, you can test:

1. **Create a test school:**
   ```sql
   SELECT create_classboom_school_schema('Test School', 'your-user-id');
   ```

2. **Check the schools registry:**
   ```sql
   SELECT * FROM public.schools;
   ```

3. **Verify subscription plans:**
   ```sql
   SELECT * FROM public.subscription_plans;
   ```

## Next Steps

Once the database is set up, you can:
1. Start the development server: `npm run dev`
2. The ClassBoom authentication system will be ready to use
3. New users signing up with a school name will automatically get their own schema