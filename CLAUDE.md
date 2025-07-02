# ClassBoom Project State - Claude Memory File

## 🚨 FIRST STEPS WHEN STARTING A NEW SESSION:

1. **Read this entire file** to understand the project
2. **Run**: `npm run claude:startup` for immediate status
3. **Check for MCP tools** (tools starting with `mcp_` or `mcp__`)
4. **The authentication system is now COMPLETE!** 🎉

## Project Overview
**ClassBoom** is a revolutionary School Management SaaS platform built with:
- Frontend: React 18, TypeScript, Vite, Tailwind CSS v3, Framer Motion
- Backend: Supabase (PostgreSQL with RLS-based multi-tenancy)
- Authentication: Supabase Auth with email verification
- Routing: React Router v6

## Current Status (Last Updated: 2025-01-03 @ 02:30)

### ✅ Completed Features:

1. **Project Setup & Configuration**
   - React + TypeScript + Vite initialized
   - All dependencies installed and configured
   - Git repository: https://github.com/a7mdelbanna/classboom
   - Environment variables configured (.env)
   - Fixed all PostCSS/Tailwind configuration issues

2. **Complete Folder Structure**
   ```
   src/
   ├── components/
   │   └── ProtectedRoute.tsx
   ├── features/
   │   ├── auth/
   │   │   ├── context/
   │   │   │   └── AuthContext.tsx
   │   │   ├── pages/
   │   │   │   ├── LoginPage.tsx      ✅ Animated login
   │   │   │   ├── SignupPage.tsx     ✅ Dual-path signup
   │   │   │   ├── TrialWizard.tsx    ✅ 4-step wizard
   │   │   │   └── DemoLogin.tsx      ✅ Fallback demo
   │   │   └── index.ts
   │   ├── dashboard/
   │   │   └── pages/
   │   │       └── Dashboard.tsx      ✅ Professional dashboard
   │   ├── students/
   │   │   ├── pages/
   │   │   │   ├── StudentList.tsx      ✅ List with search/filter
   │   │   │   ├── AddStudent.tsx       ✅ 4-step wizard form
   │   │   │   └── StudentProfile.tsx   ✅ Detailed view
   │   │   ├── services/
   │   │   │   └── studentService.ts    ✅ CRUD operations
   │   │   ├── types/
   │   │   │   └── student.types.ts     ✅ TypeScript interfaces
   │   │   └── index.ts
   │   ├── scheduling/
   │   ├── payments/
   │   └── settings/
   ├── lib/
   │   └── supabase.ts               ✅ Configured client
   ├── styles/
   │   └── globals.css               ✅ Tailwind + theme
   ├── types/
   │   └── database.types.ts         ✅ TypeScript types
   └── App.tsx                       ✅ Router setup
   ```

3. **Database Architecture** ✅
   - RLS-based multi-tenancy in public schema
   - All migrations applied successfully
   - Core tables: `public.schools`, `public.students` with RLS policies
   - Automatic school creation on signup
   - Row-level security ensures complete data isolation
   - Fixed schema_name constraints (removed UNIQUE, made nullable with default)

4. **Authentication System** ✅
   - **Email Signup**: With verification requirement
   - **Secure Login**: Session management with Supabase
   - **Protected Routes**: Automatic redirect for unauthenticated users
   - **Auth Context**: Complete state management
   - **School Creation**: Automatic school record creation with RLS isolation
   - **User Roles**: admin, teacher, student, parent

5. **UI/UX Implementation** ✅
   - Beautiful animated pages with Framer Motion
   - Glassmorphism effects throughout
   - Responsive design (mobile-first)
   - Orange/Blue color scheme
   - Spring physics animations
   - Professional dashboard with stats cards

6. **Working Features**
   - User registration with email verification
   - Login/logout functionality
   - Dashboard with user info display and real student counts
   - Statistics cards with live data
   - Quick action buttons
   - Sign out functionality

7. **Student Management System** ✅
   - **RLS-Protected Database**: Multi-tenant via Row-Level Security policies
   - **Student List**: Paginated table with search and status filtering
   - **Add Student**: 4-step wizard (Basic Info → Emergency Contact → Parent Info → Medical Info)
   - **Student Profiles**: Detailed view with all information sections
   - **Status Management**: Active, Inactive, Graduated, Dropped status tracking
   - **Auto-generation**: Student codes with school prefix
   - **Data Relationships**: Emergency contacts, parent info, medical records
   - **Search & Filter**: Real-time search by name, email, or student code
   - **Dashboard Integration**: Live student count display
   - **Bulletproof Security**: Triple-layer school creation fallback system

### 🚧 Next Steps (TODO):

1. **Phase 2B: Student Management Enhancements**
   - [ ] Parent account linking and portal access
   - [ ] Bulk import functionality (CSV/Excel)
   - [ ] Student photo upload and management
   - [ ] Advanced filtering (by grade, enrollment date, etc.)

2. **Phase 3: Class Management**
   - [ ] Course creation and management
   - [ ] Teacher assignment system
   - [ ] Class schedules and templates
   - [ ] Capacity management
   - [ ] Subject categorization

2. **Phase 3: Class Management**
   - [ ] Course creation and management
   - [ ] Teacher assignment system
   - [ ] Class schedules and templates
   - [ ] Capacity management
   - [ ] Subject categorization

3. **Phase 4: Scheduling System**
   - [ ] Calendar component integration
   - [ ] Session scheduling interface
   - [ ] Recurring sessions support
   - [ ] Conflict detection
   - [ ] Automated reminders

4. **Phase 5: Payments & Billing**
   - [ ] Stripe integration
   - [ ] Subscription management
   - [ ] Invoice generation
   - [ ] Payment history
   - [ ] Financial reports

## Key Technical Decisions

1. **Multi-tenancy**: Row-Level Security (RLS) based
   - All schools share public schema with RLS policies
   - Complete data isolation via `school_id` filtering
   - Supabase-compatible architecture
   - schema_name column defaults to 'public' (no UNIQUE constraint)

2. **Authentication Flow**:
   - Email verification required (Supabase setting)
   - School owners create account → automatic school record creation
   - StudentService handles school creation with multiple fallback layers
   - schema_name is NOT passed during school creation (uses default)

3. **Tech Stack Choices**:
   - Tailwind CSS v3 (downgraded from v4 for stability)
   - React Router v6 for routing
   - Framer Motion for animations
   - Supabase for backend (no custom API needed)

## Common Commands

```bash
# Development
npm run dev                # Start dev server (http://localhost:5173)
npm run build             # Build for production
npm run verify:setup      # Check database connection

# Status checks
npm run claude:startup    # Quick project status
npm run claude:status     # Detailed status

# Git workflow
git add -A
git commit -m "feat(classboom): your message"
git push
```

## Important Configuration

### Environment Variables (.env)
```
VITE_SUPABASE_URL=https://hokgyujgsvdfhpfrorsu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Supabase Settings
- **Email Confirmations**: ENABLED (required)
- **Auth Providers**: Email/Password
- **Project URL**: https://hokgyujgsvdfhpfrorsu.supabase.co

## Current Development Status

### 🎉 What's Working:
1. **Complete Authentication Flow**
   - Signup → Email Verification → Login → Dashboard
   - School creation with RLS-based data isolation
   - Session persistence and logout

2. **Beautiful UI**
   - Animated login/signup pages
   - Professional dashboard
   - Responsive design
   - Smooth transitions

3. **Database**
   - Multi-tenant architecture active
   - School isolation working
   - User management ready

### 📋 Immediate Next Actions:

1. **Test Current System**:
   ```bash
   npm run dev
   ```
   Visit http://localhost:5173 and create a test school account

2. **Start Student Management**:
   - Create `/src/features/students/pages/StudentList.tsx`
   - Create `/src/features/students/pages/AddStudent.tsx`
   - Add routes to App.tsx
   - Use RLS-protected student table in public schema

3. **Connect Dashboard Data**:
   - Wire up real student/teacher counts
   - Implement recent activity tracking
   - Make quick actions functional

## Architecture Notes

1. **State Management**:
   - Auth state in Context API
   - Plan to add Zustand for global state
   - React Query for server state (future)

2. **Component Patterns**:
   - Feature-based folder structure
   - Shared components in `/components`
   - Each feature self-contained

3. **Database Access**:
   - Supabase client in `/lib/supabase.ts`
   - RLS-based filtering with automatic school_id injection
   - Simple CRUD operations with built-in security

## Troubleshooting

### Common Issues:
1. **"Email invalid" error**: Enable email confirmations in Supabase
2. **Connection refused**: Run `npm run dev` in project directory
3. **MCP not working**: Restart Claude after .mcp.json changes

### Quick Fixes:
- PostCSS errors: We use Tailwind v3, not v4
- Route not found: Check App.tsx for route definitions
- Auth errors: Check Supabase dashboard for settings

## Recent Fixes (2025-01-03)

1. **Fixed "null value in column 'schema_name' violates not-null constraint"**
   - Removed UNIQUE constraint on schema_name
   - Made schema_name nullable with default 'public'
   - Updated all insert operations to NOT pass schema_name
   - Created migration: `supabase/fix-schema-name-constraint.sql`

2. **Added public.students table**
   - Created with full RLS policies
   - Migration: `supabase/create-public-students-table.sql`

3. **Updated all code to RLS architecture**
   - No more custom schemas or RPC calls
   - Direct Supabase queries with RLS protection
   - Triple-layer school creation fallback

---

**REMEMBER**: ClassBoom is a premium SaaS product. Every interaction should feel delightful! 🚀
Last updated: 2025-01-03 @ 02:30 - Fixed schema_name constraint errors