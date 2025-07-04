import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ParentService } from '../../parents/services/parentService';
import { useToast } from '../../../context/ToastContext';
import { 
  HiOutlineUsers,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineAcademicCap
} from 'react-icons/hi';

export function ParentActivation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [parent, setParent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentCode, setStudentCode] = useState('');
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
      const parentData = await ParentService.getParentByToken(token);
      
      if (!parentData) {
        setTokenValid(false);
        showToast('Invalid or expired invitation link', 'error');
      } else if (parentData.account_created_at) {
        setTokenValid(false);
        showToast('This account has already been activated', 'info');
      } else {
        setParent(parentData);
      }
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

    // Validate form
    if (!password || !confirmPassword || !studentCode) {
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

    if (!token) return;

    setSubmitting(true);
    try {
      const result = await ParentService.activateParentAccount(token, password, studentCode);
      
      if (result.success) {
        showToast('Parent account activated successfully! Redirecting to login...', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        showToast(result.error || 'Failed to activate account', 'error');
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

  if (!tokenValid || !parent) {
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
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HiOutlineUsers className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Activate Parent Account
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300">
              Welcome! Set your password to access the parent portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={parent.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                  rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Student Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                    rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-all duration-200 text-gray-900 dark:text-white pr-12"
                  placeholder="Enter your child's student code"
                />
                <HiOutlineAcademicCap className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This was provided in your invitation email
              </p>
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
                    rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent
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
                    rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent
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

            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center">
                <HiOutlineCheckCircle className="w-5 h-5 mr-2" />
                Requirements
              </h3>
              <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                <li className={password.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}>
                  • Password at least 6 characters
                </li>
                <li className={password === confirmPassword && password.length > 0 ? 'text-green-600 dark:text-green-400' : ''}>
                  • Passwords match
                </li>
                <li className={studentCode.length > 0 ? 'text-green-600 dark:text-green-400' : ''}>
                  • Valid student code provided
                </li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl
                font-semibold shadow-lg hover:shadow-xl transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Activating Account...' : 'Activate Parent Account'}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}