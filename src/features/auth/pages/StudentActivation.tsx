import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { StudentService } from '../../students/services/studentService';
import { useToast } from '../../../context/ToastContext';
import { 
  HiOutlineAcademicCap,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineExclamation
} from 'react-icons/hi';
import type { Student } from '../../students/types/student.types';

export function StudentActivation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setTokenValid(false);
      setLoading(false);
      return;
    }

    try {
      console.log('Validating student token:', token);
      
      // Use the secure function to validate the token (same approach as staff)
      const { data, error } = await supabase.rpc('validate_student_activation_token', {
        p_token: token
      });

      console.log('Student validation result:', { data, error });

      if (error) {
        console.error('Token validation error:', error);
        setTokenValid(false);
        showToast('Failed to validate invitation', 'error');
        return;
      }

      if (!data || !data.success) {
        setTokenValid(false);
        showToast(data?.error || 'Invalid or expired invitation link', 'error');
        return;
      }

      // Set the student info from the validated data
      const studentData: Student = {
        id: data.data.id,
        first_name: data.data.first_name,
        last_name: data.data.last_name,
        email: data.data.email,
        student_code: data.data.student_code,
        grade: data.data.grade,
        school_id: '', // Not needed for activation
        created_at: '', // Not needed for activation
        status: 'active',
        // Add school info for display
        school: {
          name: data.data.school_name
        }
      } as Student;

      setStudent(studentData);
    } catch (error) {
      console.error('Error validating token:', error);
      setTokenValid(false);
      showToast('Error validating invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (!password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (!token || !student) return;

    setSubmitting(true);
    try {
      // Create auth user with student metadata
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: student.email!,
        password,
        options: {
          data: {
            student_id: student.id,
            full_name: `${student.first_name} ${student.last_name}`,
            first_name: student.first_name,
            last_name: student.last_name,
            role: 'student'
          }
        }
      });

      if (signUpError || !authData.user) {
        showToast(signUpError?.message || 'Failed to create account', 'error');
        return;
      }

      // Use RPC function to activate account atomically
      const { data: activateResult, error: activateError } = await supabase
        .rpc('activate_student_account', {
          p_token: token,
          p_user_id: authData.user.id,
          p_student_id: student.id
        });

      if (activateError || !activateResult) {
        console.error('Activation error:', activateError);
        
        // Try to clean up the auth user if activation failed
        await supabase.auth.admin.deleteUser(authData.user.id).catch(console.error);
        
        showToast('Failed to activate account. Please contact support.', 'error');
        return;
      }

      // Success! Add a delay to ensure metadata is propagated
      showToast('Account activated successfully! Redirecting to your portal...', 'success');
      
      // Add a small delay to ensure database updates are propagated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user is immediately authenticated (no email confirmation required)
      if (authData.session) {
        // User is authenticated, redirect to student portal
        console.log('User authenticated after activation:', {
          userId: authData.user.id,
          userMetadata: authData.user.user_metadata,
          session: !!authData.session
        });
        console.log('Redirecting to student portal...');
        navigate('/student-portal');
      } else {
        // Email confirmation required, sign them in manually (same as staff activation)
        console.log('No immediate session, attempting manual sign in');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: student.email!,
          password: password
        });
        
        if (signInError) {
          console.error('Sign in after activation failed:', signInError);
          showToast('Account activated! Please sign in to continue.', 'success');
          navigate('/login');
        } else {
          // Successfully signed in, add another small delay
          console.log('Sign in successful, redirecting to student portal');
          await new Promise(resolve => setTimeout(resolve, 500));
          navigate('/student-portal');
        }
      }

    } catch (error) {
      console.error('Error activating account:', error);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineExclamation className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Invalid Invitation Link
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              This invitation link is invalid, expired, or has already been used.
              Please contact your school administrator for assistance.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl
                font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Go to Login
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HiOutlineAcademicCap className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Activate Your Account
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300">
              Welcome, {student.first_name}! Set your password to access your student portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={student.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                  rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                    rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200 text-gray-900 dark:text-white pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400
                    hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                    rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200 text-gray-900 dark:text-white pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400
                    hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
                <HiOutlineCheckCircle className="w-5 h-5 mr-2" />
                Password Requirements
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li className={password.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}>
                  • At least 6 characters
                </li>
                <li className={password === confirmPassword && password.length > 0 ? 'text-green-600 dark:text-green-400' : ''}>
                  • Passwords match
                </li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl
                font-semibold shadow-lg hover:shadow-xl transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Activating Account...' : 'Activate Account'}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}