import { useAuth } from '../features/auth/context/AuthContext';

/**
 * Hook for checking staff permissions
 * @returns Object with permission checking functions
 */
export function useStaffPermissions() {
  const { staffInfo, userRole } = useAuth();

  // Check if user is staff
  const isStaff = userRole === 'staff' && staffInfo !== null;

  // Check specific permission
  const hasPermission = (permission: keyof NonNullable<typeof staffInfo>['permissions']) => {
    if (!isStaff || !staffInfo?.permissions) return false;
    return staffInfo.permissions[permission] === true;
  };

  // Check if user has any of the provided permissions
  const hasAnyPermission = (permissions: Array<keyof NonNullable<typeof staffInfo>['permissions']>) => {
    if (!isStaff || !staffInfo?.permissions) return false;
    return permissions.some(permission => staffInfo.permissions![permission] === true);
  };

  // Check if user has all of the provided permissions
  const hasAllPermissions = (permissions: Array<keyof NonNullable<typeof staffInfo>['permissions']>) => {
    if (!isStaff || !staffInfo?.permissions) return false;
    return permissions.every(permission => staffInfo.permissions![permission] === true);
  };

  // Check if user has a specific role
  const hasRole = (role: NonNullable<typeof staffInfo>['role']) => {
    if (!isStaff || !staffInfo) return false;
    return staffInfo.role === role;
  };

  // Check if user has any of the provided roles
  const hasAnyRole = (roles: Array<NonNullable<typeof staffInfo>['role']>) => {
    if (!isStaff || !staffInfo) return false;
    return roles.includes(staffInfo.role);
  };

  // Get staff role
  const getRole = () => {
    return staffInfo?.role || null;
  };

  // Get all permissions
  const getPermissions = () => {
    return staffInfo?.permissions || null;
  };

  return {
    isStaff,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    getRole,
    getPermissions,
    // Convenience methods for common permissions
    canViewAllStudents: hasPermission('can_view_all_students'),
    canEditStudents: hasPermission('can_edit_students'),
    canManageEnrollments: hasPermission('can_manage_enrollments'),
    canMarkAttendance: hasPermission('can_mark_attendance'),
    canViewFinances: hasPermission('can_view_finances'),
    canManageStaff: hasPermission('can_manage_staff'),
    canSendAnnouncements: hasPermission('can_send_announcements'),
  };
}