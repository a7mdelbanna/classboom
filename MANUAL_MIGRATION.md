# ClassBoom Database Migration Instructions

Since I cannot directly access your Supabase database to run migrations, please follow these steps:

## Quick Setup (Recommended)

1. **Go to your Supabase SQL Editor**
   - Direct link: https://supabase.com/dashboard/project/hokgyujgsvdfhpfrorsu/sql/new

2. **Copy the entire contents** of `supabase/setup-classboom.sql`

3. **Paste and click "Run"**

The script will:
- ✅ Create all necessary tables
- ✅ Set up multi-tenant architecture
- ✅ Add subscription plans
- ✅ Configure authentication triggers
- ✅ Enable Row Level Security

## What Gets Created

### Public Tables:
- `schools` - Registry of all ClassBoom schools
- `subscription_plans` - Available pricing plans

### Functions:
- `create_classboom_school_schema()` - Creates a new school with isolated schema
- `handle_classboom_signup()` - Manages user registration
- `handle_classboom_login()` - Handles user authentication
- `get_user_school_schema()` - Finds user's school

### Each School Schema Contains:
- `users` - School users (admins, teachers, students, parents)
- `students` - Student profiles
- `courses` - Courses offered
- `subscriptions` - Student subscriptions
- `sessions` - Individual lessons
- `attendance` - Attendance records
- `payments` - Payment records

## Verify Installation

After running the migration, verify it worked:

```bash
npm run verify:setup
```

You should see:
- ✅ Environment variables are set correctly
- ✅ Connection to Supabase works
- ✅ Required tables exist
- ✅ 4 subscription plans loaded

## Next Steps

Once the migration is complete, we can:
1. Build the authentication pages
2. Create the multi-step registration wizard
3. Implement the dashboard

## Troubleshooting

If you get errors:
- **"already exists"** errors are OK - it means the table was already created
- **Permission errors** - Make sure you're using the SQL Editor (has full permissions)
- **Syntax errors** - Try running the script in smaller chunks

Ready to proceed with the authentication UI once the database is set up!