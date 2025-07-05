import type { UserRole } from '../context/AuthContext';

/**
 * Maps login selection to actual user roles
 */
export const roleMapping: Record<string, UserRole[]> = {
  school: ['school_owner'],
  staff: ['staff', 'teacher'], // Staff can be either staff or teacher
  student: ['student'],
  parent: ['parent']
};

/**
 * Validates if a user's actual role matches their login selection
 */
export function validateUserRoleSelection(
  selectedRole: string,
  actualRole: UserRole
): boolean {
  if (!actualRole) return false;
  
  const allowedRoles = roleMapping[selectedRole];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(actualRole);
}

/**
 * Gets the appropriate dashboard route for a user role
 */
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'school_owner':
      return '/dashboard';
    case 'staff':
    case 'teacher':
      return '/staff-portal';
    case 'student':
      return '/student-portal';
    case 'parent':
      return '/parent-portal';
    default:
      return '/';
  }
}

/**
 * Gets a user-friendly role name
 */
export function getUserFriendlyRoleName(role: UserRole): string {
  if (!role) return 'user';
  
  switch (role) {
    case 'school_owner':
      return 'school administrator';
    case 'staff':
      return 'staff member';
    case 'teacher':
      return 'teacher';
    case 'student':
      return 'student';
    case 'parent':
      return 'parent';
    default:
      return role;
  }
}