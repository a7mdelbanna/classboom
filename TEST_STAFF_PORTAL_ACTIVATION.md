# Staff Portal Activation Flow - Test Guide

## ✅ What's Been Implemented

### 1. **Staff Portal Invitation System**
- Send invitation emails via Resend API
- Professional HTML email templates
- 48-hour expiration with visual countdown
- Resend functionality for expired invitations

### 2. **Staff Activation Page** (`/activate/staff/:token`)
- Token validation with expiration check
- Password setup form with confirmation
- Account creation in Supabase Auth
- Links staff record to auth user
- Sends welcome email upon activation

### 3. **Staff Portal Dashboard** (`/staff-portal`)
- Protected route (requires staff role)
- Displays personal information
- Shows employment details
- Compensation information
- Quick action buttons
- Responsive design with dark mode support

## 🧪 Testing Steps

### Step 1: Send Staff Invitation
1. Navigate to `/staff` in your app
2. Select a staff member without portal access
3. Click the "Send Portal Invitation" button (link icon)
4. Check the console for success message
5. Verify email delivery in recipient's inbox

### Step 2: Test Activation Flow
1. Click the activation link in the email
2. You'll be redirected to `/activate/staff/:token`
3. Verify staff information is displayed correctly
4. Enter a password (min 8 characters)
5. Confirm the password
6. Click "Activate My Account"

### Step 3: Access Staff Portal
1. After activation, you'll be redirected to `/staff-portal`
2. Verify the dashboard displays:
   - Personal information
   - Employment details
   - Compensation data
   - Quick action buttons
3. Test sign out functionality

## 🔍 What to Verify

### Database Changes
After activation, check that:
- `staff.user_id` is populated with the auth user ID
- `staff.portal_access_enabled` is set to `true`
- `staff.account_created_at` has a timestamp
- `staff.invite_token` is cleared (set to null)

### Authentication
- Staff can log in with their email and password
- They're redirected to staff portal after login
- Role-based routing prevents access to admin areas

### Email Flow
- Invitation email is received
- Welcome email is sent after activation
- Links work correctly

## 🐛 Troubleshooting

### "Invalid or expired invitation link"
- Token doesn't exist in database
- Token has already been used
- Invitation is older than 48 hours

### "Failed to activate account"
- Email already exists in Supabase Auth
- Password requirements not met
- Database update failed

### Can't access staff portal
- User role not set to 'staff' in auth metadata
- Not logged in
- RLS policies blocking access

## 📝 SQL to Check Status

```sql
-- Check staff invitation status
SELECT 
  first_name,
  last_name,
  email,
  invite_token IS NOT NULL as has_token,
  invite_sent_at,
  portal_access_enabled,
  user_id IS NOT NULL as has_user,
  can_login
FROM staff
WHERE email = 'staff_email@example.com';

-- Check auth user
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'staff_id' as staff_id
FROM auth.users
WHERE email = 'staff_email@example.com';
```

## ✨ Next Steps

1. **Implement missing dashboard features**:
   - View schedule/classes
   - Update availability
   - View payroll history
   - Edit profile information

2. **Add more portal pages**:
   - `/staff-portal/schedule`
   - `/staff-portal/payroll`
   - `/staff-portal/profile`
   - `/staff-portal/settings`

3. **Enhance security**:
   - Two-factor authentication
   - Password reset functionality
   - Session management