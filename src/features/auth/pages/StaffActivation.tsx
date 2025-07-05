import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { EmailService } from '../../../services/emailServiceClient';
import { useToast } from '../../../context/ToastContext';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';

interface StaffInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department?: string;
  school_name: string;
}

export function StaffActivation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Get default permissions based on staff role
  const getDefaultPermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          can_view_all_students: true,
          can_edit_students: true,
          can_manage_enrollments: true,
          can_mark_attendance: true,
          can_view_finances: true,
          can_manage_staff: true,
          can_send_announcements: true
        };
      case 'manager':
        return {
          can_view_all_students: true,
          can_edit_students: true,
          can_manage_enrollments: true,
          can_mark_attendance: true,
          can_view_finances: true,
          can_manage_staff: false,
          can_send_announcements: true
        };
      case 'teacher':
        return {
          can_view_all_students: false,
          can_edit_students: false,
          can_manage_enrollments: false,
          can_mark_attendance: true,
          can_view_finances: false,
          can_manage_staff: false,
          can_send_announcements: false
        };
      case 'support':
        return {
          can_view_all_students: true,
          can_edit_students: false,
          can_manage_enrollments: false,
          can_mark_attendance: false,
          can_view_finances: false,
          can_manage_staff: false,
          can_send_announcements: false
        };
      default:
        return {
          can_view_all_students: false,
          can_edit_students: false,
          can_manage_enrollments: false,
          can_mark_attendance: false,
          can_view_finances: false,
          can_manage_staff: false,
          can_send_announcements: false
        };
    }
  };

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      
      console.log('Validating token:', token);
      
      // Use the secure function to validate the token
      const { data, error } = await supabase.rpc('validate_staff_activation_token', {
        p_token: token
      });

      console.log('Validation result:', { data, error });

      if (error) {
        console.error('Token validation error:', error);
        setError('Failed to validate invitation');
        return;
      }

      if (!data || !data.success) {
        setError(data?.error || 'Invalid or expired invitation link');
        return;
      }

      // Set the staff info from the validated data
      setStaffInfo({
        id: data.data.id,
        first_name: data.data.first_name,
        last_name: data.data.last_name,
        email: data.data.email,
        role: data.data.role,
        department: data.data.department,
        school_name: data.data.school_name
      });
    } catch (error: any) {
      console.error('Error validating token:', error);
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staffInfo) return;
    
    // Validate passwords
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setActivating(true);
      setError('');

      // Create authentication user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: staffInfo.email,
        password: password,
        options: {
          data: {
            first_name: staffInfo.first_name,
            last_name: staffInfo.last_name,
            role: 'staff',
            staff_id: staffInfo.id,
            staff_role: staffInfo.role // Store the specific staff role
          }
        }
      });

      if (authError) throw authError;

      // Get default permissions based on role
      const defaultPermissions = getDefaultPermissions(staffInfo.role);

      // Use the activate function to avoid race conditions
      const { data: activationResult, error: updateError } = await supabase
        .rpc('activate_staff_account', {
          p_staff_id: staffInfo.id,
          p_user_id: authData.user?.id,
          p_permissions: defaultPermissions
        });

      if (updateError) throw updateError;
      
      // Check if activation was successful
      if (!activationResult?.success) {
        throw new Error(activationResult?.error || 'Failed to activate staff account');
      }

      // Send welcome email
      await EmailService.sendWelcomeEmail(
        staffInfo.email,
        `${staffInfo.first_name} ${staffInfo.last_name}`,
        staffInfo.school_name,
        'staff'
      );

      showToast('Your staff account has been activated successfully!', 'success');
      
      // Add a small delay to ensure database updates are propagated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user is immediately authenticated (no email confirmation required)
      if (authData.session) {
        // User is authenticated, redirect to staff portal
        console.log('User authenticated, redirecting to staff portal');
        navigate('/staff-portal');
      } else {
        // Email confirmation required, sign them in manually
        console.log('No immediate session, attempting manual sign in');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: staffInfo.email,
          password: password
        });
        
        if (signInError) {
          console.error('Sign in after activation failed:', signInError);
          showToast('Account activated! Please sign in to continue.', 'success');
          navigate('/login');
        } else {
          // Successfully signed in, add another small delay
          console.log('Sign in successful, redirecting to staff portal');
          await new Promise(resolve => setTimeout(resolve, 500));
          navigate('/staff-portal');
        }
      }
    } catch (error: any) {
      console.error('Error activating account:', error);
      setError(error.message || 'Failed to activate account');
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Validating invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
        >
          <HiOutlineExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Activation Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <HiOutlineCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Activate Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to {staffInfo?.school_name}!
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-6">
          <div className="text-sm">
            <p className="text-gray-800 dark:text-gray-200 font-medium">
              {staffInfo?.first_name} {staffInfo?.last_name}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {staffInfo?.role.charAt(0).toUpperCase() + staffInfo?.role.slice(1)}
              {staffInfo?.department && ` • ${staffInfo.department}`}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {staffInfo?.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleActivation} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Create Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                placeholder="Enter a secure password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                placeholder="Confirm your password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={activating}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors ${
              activating
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {activating ? 'Activating Account...' : 'Activate My Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By activating your account, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}