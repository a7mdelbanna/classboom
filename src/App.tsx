import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { 
  LoginPage,
  EnhancedLoginPage,
  SignupPage,
  SetupWizard,
  DemoLogin,
  StudentActivation,
  ParentActivation,
  StaffActivation
} from './features/auth/pages';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ModernDashboard } from './features/dashboard/pages/ModernDashboard';
import { StudentListCards } from './features/students/pages/StudentListCards';
import { AddStudentNew } from './features/students/pages/AddStudentNew';
import { StudentProfile } from './features/students/pages/StudentProfile';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { CourseManagement } from './features/courses';
import { EnrollmentManagement } from './features/enrollments';
import { StaffManagement } from './features/staff';
import { StudentPortalDashboard } from './features/students/pages/StudentPortalDashboard';
import { ParentPortalDashboard } from './features/parents/pages/ParentPortalDashboard';
import { StaffPortalDashboard } from './features/staff/pages/StaffPortalDashboard';
import { LandingPage } from './features/landing/pages/LandingPage';
import { PayrollManagement, PayrollDetail } from './features/payroll';
import { FinancialManagement } from './features/financial';
import { SessionTestPage } from './features/sessions/pages/SessionTestPage';
import { ResourcesPage } from './features/resources';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<EnhancedLoginPage />} />
          <Route path="/login-legacy" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/demo" element={<DemoLogin />} />
          <Route path="/activate/student/:token" element={<StudentActivation />} />
          <Route path="/activate/parent/:token" element={<ParentActivation />} />
          <Route path="/activate/staff/:token" element={<StaffActivation />} />
          
          {/* Protected Setup Route */}
          <Route path="/signup/trial-wizard" element={
            <ProtectedRoute>
              <SetupWizard />
            </ProtectedRoute>
          } />
          {/* Protected Routes with Dashboard Layout */}
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<ModernDashboard />} />
            
            {/* Student Routes */}
            <Route path="/students" element={<StudentListCards />} />
            <Route path="/students/new" element={<AddStudentNew />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            <Route path="/students/:id/edit" element={<AddStudentNew />} />
            
            {/* Course Management Routes */}
            <Route path="/courses" element={<CourseManagement />} />
            
            {/* Enrollment Management Routes */}
            <Route path="/enrollments" element={<EnrollmentManagement />} />
            
            {/* Staff Management Routes */}
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/staff/reports" element={<div>Staff Reports Page</div>} />
            
            {/* Payroll Management Routes */}
            <Route path="/payroll" element={<PayrollManagement />} />
            <Route path="/payroll/:id" element={<PayrollDetail />} />
            
            {/* Financial Management Routes */}
            <Route path="/financial" element={<FinancialManagement />} />
            
            {/* Sessions Test Route */}
            <Route path="/sessions/test" element={<SessionTestPage />} />
            
            {/* Resources Management Routes */}
            <Route path="/resources" element={<ResourcesPage />} />
            
            {/* Placeholder routes for other sections */}
            <Route path="/classes" element={<div>Classes Page</div>} />
            <Route path="/classes/new" element={<div>Create Class Page</div>} />
            <Route path="/payments" element={<div>Payments Page</div>} />
            <Route path="/analytics" element={<div>Analytics Page</div>} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          {/* Student Portal Routes */}
          <Route path="/student-portal" element={
            <RoleProtectedRoute allowedRoles={['student']}>
              <StudentPortalDashboard />
            </RoleProtectedRoute>
          } />
          
          {/* Parent Portal Routes */}
          <Route path="/parent-portal" element={
            <RoleProtectedRoute allowedRoles={['parent']}>
              <ParentPortalDashboard />
            </RoleProtectedRoute>
          } />
          
          {/* Staff Portal Routes */}
          <Route path="/staff-portal" element={
            <RoleProtectedRoute allowedRoles={['staff']}>
              <StaffPortalDashboard />
            </RoleProtectedRoute>
          } />
          
        </Routes>
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;