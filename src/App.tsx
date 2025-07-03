import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { SetupWizard } from './features/auth/pages/SetupWizard';
import { DemoLogin } from './features/auth/pages/DemoLogin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './features/dashboard/pages/Dashboard';
import { StudentListCards } from './features/students/pages/StudentListCards';
import { AddStudentNew } from './features/students/pages/AddStudentNew';
import { StudentProfile } from './features/students/pages/StudentProfile';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
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
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/students" element={
            <ProtectedRoute>
              <StudentListCards />
            </ProtectedRoute>
          } />
          <Route path="/students/new" element={
            <ProtectedRoute>
              <AddStudentNew />
            </ProtectedRoute>
          } />
          <Route path="/students/:id" element={
            <ProtectedRoute>
              <StudentProfile />
            </ProtectedRoute>
          } />
          <Route path="/students/:id/edit" element={
            <ProtectedRoute>
              <AddStudentNew />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;