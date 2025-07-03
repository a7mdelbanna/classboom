import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const demoUser = localStorage.getItem('classboom_demo_user');

  useEffect(() => {
    // Redirect based on user role when they first log in
    if (!loading && user && userRole && location.pathname === '/dashboard') {
      if (userRole === 'student' && !location.pathname.startsWith('/student-portal')) {
        navigate('/student-portal', { replace: true });
      } else if (userRole === 'parent' && !location.pathname.startsWith('/parent-portal')) {
        navigate('/parent-portal', { replace: true });
      }
    }
  }, [user, userRole, loading, location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-classboom-primary"></div>
      </div>
    );
  }

  if (!user && !demoUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}