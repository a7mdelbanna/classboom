import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { SetupWizard } from './features/auth/pages/SetupWizard';
import { DemoLogin } from './features/auth/pages/DemoLogin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ModernDashboard } from './features/dashboard/pages/ModernDashboard';
import { StudentListCards } from './features/students/pages/StudentListCards';
import { AddStudentNew } from './features/students/pages/AddStudentNew';
import { StudentProfile } from './features/students/pages/StudentProfile';
import { SettingsPage } from './features/settings/pages/SettingsPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/demo" element={<DemoLogin />} />
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
            
            {/* Placeholder routes for other sections */}
            <Route path="/classes" element={<div>Classes Page</div>} />
            <Route path="/classes/new" element={<div>Create Class Page</div>} />
            <Route path="/payments" element={<div>Payments Page</div>} />
            <Route path="/analytics" element={<div>Analytics Page</div>} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;