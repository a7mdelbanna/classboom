# ClassBoom Project State - Claude Memory File

## Project Overview
**ClassBoom** is a revolutionary School Management SaaS platform built with:
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- Backend: Supabase (PostgreSQL with multi-tenant architecture)
- Authentication: Supabase Auth with custom school schemas

## Current Status (Last Updated: 2025-01-02)

### ✅ Completed:
1. **Project Setup**
   - React + TypeScript + Vite initialized
   - All dependencies installed (Supabase, Tailwind, Framer Motion, etc.)
   - Git repository created: https://github.com/a7mdelbanna/classboom

2. **Folder Structure**
   ```
   src/
   ├── components/
   ├── features/
   │   ├── auth/
   │   ├── dashboard/
   │   ├── students/
   │   ├── subscriptions/
   │   ├── scheduling/
   │   ├── communication/
   │   ├── payments/
   │   └── settings/
   ├── lib/
   ├── store/
   ├── styles/
   ├── types/
   └── utils/
   ```

3. **Database Design**
   - Multi-tenant architecture (schema per school)
   - Migration files created in `supabase/`
   - Main setup file: `supabase/setup-classboom.sql`

4. **Supabase Configuration**
   - Project Reference: `hokgyujgsvdfhpfrorsu`
   - URL: `https://hokgyujgsvdfhpfrorsu.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhva2d5dWpnc3ZkZmhwZnJvcnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Nzc0OTIsImV4cCI6MjA2NzA1MzQ5Mn0.hTqKW059EmFC3ZOivtMFA6rRCpXy_KJ67Yx2EKusyyo`
   - Service Role Key: `sbp_208aa30e6b741f0720c09bcc6ee26badd33f2d89`

5. **Styling**
   - Tailwind CSS configured with ClassBoom theme
   - CSS variables for theming in `src/styles/globals.css`
   - ClassBoom color palette (orange primary, blue secondary)

6. **MCP Server Configuration**
   - Created `.mcp.json` in project root
   - Configured with `@supabase/mcp-server-supabase@latest`
   - Project ref: hokgyujgsvdfhpfrorsu
   - **Status**: Requires Claude restart to activate MCP tools
   - See `MCP_SETUP.md` for details

### 🚧 Next Steps (TODO):

1. **Run Database Migrations**
   - Go to: https://supabase.com/dashboard/project/hokgyujgsvdfhpfrorsu/sql/new
   - Run: `supabase/setup-classboom.sql`
   - Verify with: `npm run verify:setup`

2. **Phase 1: Authentication System**
   - [ ] Build login/signup pages with animations
   - [ ] Multi-step trial registration wizard
   - [ ] Email verification flow
   - [ ] Password reset functionality
   - [ ] Theme selector (10 presets)

3. **Phase 2: Dashboard**
   - [ ] Real-time statistics
   - [ ] Quick actions
   - [ ] Recent activity feed
   - [ ] School health metrics

4. **Phase 3: Student Management**
   - [ ] Student profiles
   - [ ] Enrollment system
   - [ ] Parent portal access

## Key Technical Decisions

1. **Multi-tenancy**: PostgreSQL schemas (not RLS rows)
   - Each school gets `school_[uuid]` schema
   - Complete data isolation
   - Dynamic schema switching

2. **Authentication Flow**:
   - School owners create account → automatic schema creation
   - Other users join existing schools via invite
   - Metadata stores school_schema for routing

3. **Design System**:
   - Glassmorphism effects
   - Spring physics animations
   - Skeleton loaders (no spinners)
   - Mobile-first responsive

## Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run verify:setup       # Check database connection
npm run build             # Build for production

# Git
git add -A && git commit -m "feat(classboom): your message"
git push

# Testing Supabase
# Check .env file has correct keys
# Run migrations in Supabase dashboard
```

## Important Files

- `/src/lib/supabase.ts` - Supabase client configuration
- `/src/types/database.types.ts` - TypeScript types
- `/supabase/setup-classboom.sql` - Complete database setup
- `/.env` - Environment variables (not in git)
- `/SUPABASE_SETUP.md` - Database setup instructions

## Architecture Notes

1. **Frontend State Management**:
   - Zustand for global state
   - TanStack Query for server state
   - Optimistic updates everywhere

2. **Component Structure**:
   - Feature-based organization
   - Shared components in `/components`
   - Each feature has own hooks, types, components

3. **API Pattern**:
   - Supabase client per school schema
   - RPC functions for complex operations
   - Realtime subscriptions for live updates

## Branding

- Name: **ClassBoom**
- Tagline: "Education Management That Sparks Joy"
- Colors: Orange (primary), Blue (secondary)
- Logo: Located at `/public/classboom-logo.svg`

## Current Blockers

1. Need to run database migrations in Supabase
2. MCP server needs Claude restart to activate
3. Then can proceed with auth implementation

## Quick Context for Next Session

When you return to this project:
1. Check if database tables exist: `npm run verify:setup`
2. If not, guide user to run migrations
3. Once ready, start with Phase 1: Authentication
4. Use the established patterns and styling

---

This file should be your first read when returning to the ClassBoom project.
Last updated: 2025-01-02