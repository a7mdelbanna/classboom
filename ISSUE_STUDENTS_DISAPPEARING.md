# 🚨 CRITICAL ISSUE: Students Disappearing After Creation

**Issue Created**: 2025-01-03
**Priority**: CRITICAL
**Status**: UNRESOLVED

## Problem Description
Students are successfully created and appear in the UI for a few seconds, then disappear. This happens consistently:
1. Create a new student → Success message appears
2. Student shows up in the cards view
3. After 2-5 seconds → Student disappears from view
4. No error messages in console

## Current Investigation Results

### What We've Checked:
1. ✅ **Database Creation**: Students ARE being created in the database
2. ✅ **Form Validation**: All required fields are properly handled
3. ✅ **Empty String Handling**: Fixed date_of_birth and other nullable fields
4. ✅ **School Settings**: Fixed null settings destructuring error
5. ❌ **RLS Policies**: Created policies but issue persists

### What We've Tried:
1. **Created RLS Policies** (`supabase/simple-students-rls-fix.sql`)
   - Policies for SELECT, INSERT, UPDATE, DELETE
   - Based on school ownership
   - Result: Issue still occurs

2. **Fixed StudentService**:
   - Clean empty strings → null conversion
   - Proper school_id assignment
   - Result: Students create successfully but still disappear

3. **Enhanced Error Handling**:
   - Global error handlers
   - Better async error catching
   - Result: No errors caught, silent disappearance

## Possible Causes to Investigate

### 1. **Realtime Subscription Issues**
- Supabase realtime might be removing rows due to RLS
- Check if realtime subscriptions are conflicting with RLS

### 2. **Authentication Token Expiry**
- Token might be expiring causing RLS to fail
- Check auth.uid() consistency

### 3. **School_ID Mismatch**
- Students might be created with wrong school_id
- Verify school_id is consistent between create and fetch

### 4. **Database Triggers**
- Check if any database triggers are deleting rows
- Look for cleanup functions or constraints

### 5. **Caching Issues**
- Frontend might be caching old empty state
- Check React Query or state management

## Tomorrow's Action Plan

### Step 1: Database Investigation
```sql
-- Check if students actually exist in DB
SELECT id, school_id, first_name, created_at 
FROM public.students 
ORDER BY created_at DESC;

-- Check school ownership
SELECT s.id, s.first_name, s.school_id, sch.owner_id
FROM public.students s
JOIN public.schools sch ON s.school_id = sch.id
WHERE sch.owner_id = auth.uid();

-- Check for any delete triggers
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'students';
```

### Step 2: Add Comprehensive Logging
```typescript
// In StudentService.ts
static async createStudent(data) {
  console.log('[CREATE] Starting with school_id:', schoolId);
  console.log('[CREATE] User auth:', await supabase.auth.getUser());
  // ... create logic
  console.log('[CREATE] Result:', result);
}

static async getStudents() {
  console.log('[FETCH] Current auth:', await supabase.auth.getUser());
  console.log('[FETCH] School ID:', schoolId);
  // ... fetch logic
  console.log('[FETCH] Results:', data);
}
```

### Step 3: Test Different Scenarios
1. Create student with service role key (bypass RLS)
2. Check if issue occurs in different browsers
3. Test with fresh user account
4. Disable realtime subscriptions temporarily

### Step 4: Implement Workaround
If issue persists, implement temporary workaround:
- Store students in local state
- Sync with database periodically
- Show warning to users

## Code to Add for Debugging

### 1. In `StudentListCards.tsx`:
```typescript
useEffect(() => {
  const checkStudents = setInterval(async () => {
    console.log('[INTERVAL] Checking students...');
    const { data, error } = await supabase
      .from('students')
      .select('id, first_name')
      .eq('school_id', schoolId);
    console.log('[INTERVAL] Direct query result:', data, error);
  }, 5000);
  
  return () => clearInterval(checkStudents);
}, []);
```

### 2. In `supabase.ts`:
```typescript
// Add request logger
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[AUTH] State changed:', event, session?.user?.id);
});
```

## Related Files
- `/src/features/students/services/studentService.ts`
- `/src/features/students/pages/StudentListCards.tsx`
- `/src/lib/supabase.ts`
- `/supabase/simple-students-rls-fix.sql`

## Next Session Checklist
- [ ] Run diagnostic queries in Supabase
- [ ] Add comprehensive logging
- [ ] Test with service role key
- [ ] Check for database triggers/functions
- [ ] Implement proper fix or workaround
- [ ] Document root cause