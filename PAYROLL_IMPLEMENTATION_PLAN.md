# Payroll Implementation Plan - Clean Architecture

## 1. Module Structure (Complete Separation)

```
src/features/payroll/
├── index.ts                    # Public exports
├── types/
│   └── payroll.types.ts       # Payroll-specific types only
├── services/
│   └── payrollService.ts      # Payroll business logic
├── components/
│   ├── PayrollStats.tsx       # Statistics cards
│   ├── PayrollFilters.tsx     # Filter controls
│   ├── PayrollList.tsx        # List/table view
│   ├── PayrollCard.tsx        # Individual payroll record
│   └── GeneratePayrollModal.tsx # Payroll generation wizard
└── pages/
    ├── PayrollManagement.tsx  # Main payroll page
    └── PayrollDetail.tsx      # Individual payroll view
```

## 2. Type Isolation Strategy

### Step 1: Create Minimal Shared Interfaces
Create a new shared types file for cross-feature interfaces:

```typescript
// src/types/shared.types.ts
export interface MinimalStaffInfo {
  id: string;
  first_name: string;
  last_name: string;
  staff_code: string;
  role: string;
  compensation_model?: string;
  base_salary?: number;
  hourly_rate?: number;
  session_rate?: number;
  currency: string;
}
```

### Step 2: Remove Payroll Types from Staff Module
- Move all Payroll interfaces from staff.types.ts to payroll.types.ts
- Remove payroll methods from staffService.ts
- Keep staff module focused only on staff management

### Step 3: Payroll Types with Minimal Dependencies
```typescript
// payroll.types.ts
import type { MinimalStaffInfo } from '../../../types/shared.types';

export interface Payroll {
  id: string;
  school_id: string;
  staff_id: string;
  // ... payroll fields
  staff?: MinimalStaffInfo; // Minimal interface, not full Staff
}
```

## 3. Implementation Steps (Incremental)

### Phase 1: Basic Setup ✅
1. Create payroll folder structure
2. Move Payroll types from staff.types.ts
3. Create minimal shared interfaces
4. Test that staff module still works

### Phase 2: Service Layer ✅
1. Create PayrollService with no staff imports
2. Use Supabase joins to get staff data when needed
3. Implement core CRUD operations
4. Test service methods independently

### Phase 3: UI Components ✅
1. Build PayrollStats component
2. Create PayrollList with filters
3. Add GeneratePayrollModal
4. Test each component in isolation

### Phase 4: Integration ✅
1. Add routes to App.tsx
2. Add menu item to Sidebar.tsx
3. Test full flow end-to-end
4. Monitor for any module resolution errors

## 4. Key Architecture Decisions

### ✅ DO:
- Keep payroll as a completely independent module
- Use database joins instead of importing types
- Create minimal shared interfaces when absolutely needed
- Test incrementally after each step
- Use lazy loading for payroll routes

### ❌ DON'T:
- Import Staff type into payroll module
- Add payroll methods to StaffService
- Create circular imports between modules
- Mix concerns between features

## 5. Database Query Strategy

Instead of importing Staff types, use database joins:

```typescript
// In PayrollService
const { data: payroll } = await supabase
  .from('payroll')
  .select(`
    *,
    staff:staff_id (
      id,
      first_name,
      last_name,
      staff_code,
      role,
      compensation_model,
      base_salary,
      hourly_rate,
      session_rate,
      currency
    )
  `)
  .eq('school_id', schoolId);
```

## 6. Testing Strategy

1. **Unit Tests**: Test payroll service methods independently
2. **Integration Tests**: Test database queries work correctly
3. **Module Boundary Tests**: Ensure no circular dependencies
4. **Build Tests**: Run build after each major step

## 7. Rollback Plan

If issues occur:
1. Git stash changes immediately
2. Identify which phase caused the issue
3. Revert to last working state
4. Adjust strategy based on error
5. Try alternative approach

## 8. Success Criteria

- ✅ No module resolution errors
- ✅ Clean build with no warnings
- ✅ Payroll feature works independently
- ✅ Staff feature continues to work
- ✅ No circular dependencies
- ✅ Clear module boundaries