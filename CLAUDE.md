# ClassBoom Project State - Claude Memory File

## 🚨 FIRST STEPS WHEN STARTING A NEW SESSION:

1. **Read this entire file** to understand the project
2. **Run**: `npm run claude:startup` for immediate status
3. **Check for MCP tools** (tools starting with `mcp_` or `mcp__`)
4. **The authentication system is now COMPLETE!** 🎉

## ✅ FIXED: Students Disappearing Issue (2025-07-03)

**ROOT CAUSE FOUND:** The app was creating duplicate schools on every auth state change/page refresh!

**The Real Problem:**
- User had **1,845 duplicate schools** created
- Students were scattered across different school IDs
- Each page refresh might select a different (empty) school
- The `getCurrentSchoolId` function was creating new schools instead of finding existing ones

**Fix Applied:**
1. **Updated `getCurrentSchoolId`** to always use the OLDEST school (prevents duplicates)
2. **Migrated all students** to the canonical (oldest) school
3. **Deleted 1,844 duplicate schools** for the affected user
4. **Added logging** to track school selection
5. Migration SQL: `supabase/fix-duplicate-schools.sql`

**To verify the fix:**
- Run the app - students should now be visible!
- Check console: should show "Using existing school" not "Creating school"
- Only 1 school per user should exist

## Project Overview
**ClassBoom** is a revolutionary School Management SaaS platform built with:
- Frontend: React 18, TypeScript, Vite, Tailwind CSS v3, Framer Motion
- Backend: Supabase (PostgreSQL with RLS-based multi-tenancy)
- Authentication: Supabase Auth with email verification
- Routing: React Router v6

## Current Status (Last Updated: 2025-01-03 @ 08:40)

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
   │   ├── ProtectedRoute.tsx      ✅ Route protection
   │   ├── CustomSelect.tsx        ✅ Animated dropdowns
   │   ├── CustomCheckbox.tsx      ✅ Spring animations
   │   ├── TimeInput.tsx           ✅ Custom time picker
   │   ├── Toast.tsx               ✅ Beautiful notifications
   │   └── Confetti.tsx            ✅ Celebration animation
   ├── context/
   │   └── ToastContext.tsx        ✅ Global notifications
   ├── features/
   │   ├── auth/
   │   │   ├── context/
   │   │   │   └── AuthContext.tsx
   │   │   ├── pages/
   │   │   │   ├── LoginPage.tsx      ✅ Animated login
   │   │   │   ├── SignupPage.tsx     ✅ First/last name fields
   │   │   │   ├── SetupWizard.tsx    ✅ 7-step comprehensive wizard
   │   │   │   └── DemoLogin.tsx      ✅ Fallback demo
   │   │   └── index.ts
   │   ├── dashboard/
   │   │   └── pages/
   │   │       └── Dashboard.tsx      ✅ Dynamic terminology & themes
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
   │   ├── database.types.ts         ✅ Supabase types
   │   └── institution.types.ts      ✅ 25+ institution types
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

7. **Student Management System** ⚠️ **CRITICAL ISSUE - See ISSUE_STUDENTS_DISAPPEARING.md**
   - **Modern Card UI**: Beautiful student cards with avatars and hover actions
   - **Modal-Based Forms**: Popup student creation/editing
   - **Enhanced Fields**: 
     - Split first/last names
     - Social media contacts (10+ platforms)
     - Communication preferences
     - Skill levels (dynamic per institution)
     - Interested courses
   - **Tabbed Organization**: Main Info | Emergency | Parent | Medical tabs
   - **Smart Features**:
     - Auto country detection from phone
     - Parent tab shows/hides based on age
     - Institution-specific terminology
   - **Custom Components**:
     - Modern date picker
     - Multi-select with search
     - Custom styled dropdowns
   - ❌ **CRITICAL BUG**: Students disappear after creation (RLS issue)

8. **Setup Wizard System** ✅ **FULLY COMPLETE!**
   - **25+ Institution Types**: Schools, gyms, tutoring centers, etc.
   - **Dynamic Terminology**: Adapts all labels based on business type
   - **Age Group Selection**: Kids/Adults/Both with dynamic form fields
   - **Multi-Location Support**: Centralized/Federated/Independent models
   - **Academic Configuration**: Custom hour durations and session lengths
   - **Financial Setup**: Multi-select pricing models
   - **Operating Hours**: Custom time pickers with availability schedules
   - **Theme Selection**: 10 themes with live preview
   - **Smart Defaults**: Institution-specific presets
   - **Individual Provider Support**: Personalized for tutors/coaches
   - **Confetti Celebration**: On setup completion

### 🚧 Next Steps (TODO):

1. **✅ FIXED: Students Disappearing Issue** (2025-07-03)
   - [x] Debug RLS policies on students table - Found duplicate policies
   - [x] Check authentication token consistency - Added monitoring
   - [x] Verify school_id assignment - Working correctly
   - [x] Applied comprehensive RLS fix - Removed duplicates
   - [x] Added debug logging for future issues

2. **Phase 2B: Student Management Enhancements**
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

## Recent Updates (2025-01-03)

### Morning Session (05:45):
1. **Fixed "null value in column 'schema_name' violates not-null constraint"**
   - Removed UNIQUE constraint on schema_name
   - Made schema_name nullable with default 'public'
   - Updated all insert operations to NOT pass schema_name

2. **Added public.students table**
   - Created with full RLS policies
   - Migration: `supabase/create-public-students-table.sql`
   - Verified with test data (2 students successfully created)

### Afternoon Session (08:40):
1. **Major UI Overhaul**
   - ✅ Converted student list from table to modern cards with avatars
   - ✅ Implemented modal-based student creation/editing
   - ✅ Added edit/delete icons with hover effects
   - ✅ Created custom DatePicker component
   - ✅ Created MultiSelect component with search
   - ✅ Enhanced student form with social media, skills, courses

2. **Server Stability Improvements**
   - ✅ Updated Vite config to prevent crashes
   - ✅ Added global error handlers
   - ✅ Created nodemon auto-restart option

3. **Fixed Multiple Bugs**
   - ✅ Empty date string validation error
   - ✅ School settings null destructuring
   - ✅ Country detection for all phone codes
   - ✅ Parent tab visibility based on age

4. **Critical Issue Discovered**
   - ❌ Students disappear after creation (RLS policy issue)
   - Created `ISSUE_STUDENTS_DISAPPEARING.md` for investigation
   - Attempted fixes in `supabase/simple-students-rls-fix.sql`
   - Issue persists - needs deeper investigation tomorrow

4. **Removed old architecture remnants**
   - Dropped old triggers (on_classboom_user_created)
   - Dropped old functions (create_classboom_school_schema, etc.)
   - Migration: `supabase/drop-old-triggers.sql`

## ✅ System Status: FULLY OPERATIONAL

All features are working correctly:
- User signup/login with email verification
- Automatic school creation on signup
- Complete student management (CRUD)
- Dashboard with live statistics
- Multi-tenant data isolation via RLS

---

**REMEMBER**: ClassBoom is a premium SaaS product. Every interaction should feel delightful! 🚀

## 🎨 UI/UX Requirements (IMPORTANT - Apply to entire app!)
- **NO DEFAULT BROWSER ALERTS**: Always use the custom Toast component from `useToast()` for notifications
- **All dialogs/modals**: Must be custom-styled with animations, never use browser defaults
- **Form controls**: Use custom components (CustomSelect, CustomCheckbox) for consistent styling
- **Animations**: Use Framer Motion for all transitions and interactions
- **Error handling**: Show errors using Toast notifications, not console logs or alerts
- **Dropdowns**: Must have proper z-index to appear above other content

## 🎯 Recent Major Updates (2025-01-03)

1. **Enhanced Setup Wizard**
   - Added 25+ institution types with smart categorization
   - Dynamic terminology system (Student→Member, Teacher→Trainer, etc.)
   - Age group selection affecting form requirements
   - Multi-location architecture support
   - Custom time pickers and form components
   - Personalized flow for individual service providers
   - Theme selection with live preview

2. **Custom UI Components**
   - CustomSelect: Animated dropdown replacement
   - CustomCheckbox: Spring-animated checkboxes
   - TimeInput: Beautiful time picker
   - Toast: Global notification system
   - Confetti: Celebration animations

3. **Individual Provider Support**
   - "Your Business Name" instead of "School Name"
   - "Your Availability Schedule" for working hours
   - Smart placeholders like "[Name]'s Student Hub"
   - Personalized capacity labels
   - Helpful tips and guidance

Last updated: 2025-01-03 @ 05:45 - Setup Wizard Complete with Full Personalization