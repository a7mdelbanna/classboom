import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../features/auth/context/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function RoleProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/login' 
}: RoleProtectedRouteProps) {
  const { user, loading, userRole } = useAuth();
  const location = useLocation();
  const demoUser = localStorage.getItem('classboom_demo_user');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-classboom-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user && !demoUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'school_owner':
        return <Navigate to="/dashboard" replace />;
      case 'student':
        return <Navigate to="/student-portal" replace />;
      case 'parent':
        return <Navigate to="/parent-portal" replace />;
      case 'teacher':
        return <Navigate to="/teacher-portal" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}

// Helper hook to get role-based redirect path
export function useRoleBasedRedirect() {
  const { userRole } = useAuth();
  
  const getRoleBasedPath = (): string => {
    switch (userRole) {
      case 'school_owner':
        return '/dashboard';
      case 'student':
        return '/student-portal';
      case 'parent':
        return '/parent-portal';
      case 'teacher':
        return '/teacher-portal';
      default:
        return '/login';
    }
  };

  return { getRoleBasedPath };
}