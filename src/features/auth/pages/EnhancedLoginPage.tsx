import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useTheme } from '../../../context/ThemeContext';
import { validateUserRoleSelection, getDashboardRoute, getUserFriendlyRoleName } from '../utils/roleValidation';
import { RoleHelpText } from '../components/RoleHelpText';
import { 
  HiOutlineAcademicCap, 
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineArrowLeft,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineBriefcase
} from 'react-icons/hi';

type LoginRole = 'school' | 'student' | 'parent' | 'staff';

export function EnhancedLoginPage() {
  const { signIn, signOut, user, userRole, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect authenticated users based on their role
  useEffect(() => {
    if (user && userRole && !authLoading) {
      console.log('EnhancedLoginPage: Redirecting based on role:', userRole);
      const dashboardRoute = getDashboardRoute(userRole);
      navigate(dashboardRoute);
    }
  }, [user, userRole, authLoading, navigate]);

  const roles = [
    {
      id: 'school' as LoginRole,
      title: 'School/Institution',
      description: 'Manage your school, teachers, and students',
      icon: HiOutlineOfficeBuilding,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      id: 'staff' as LoginRole,
      title: 'Staff/Teacher',
      description: 'Access your portal, schedule, and resources',
      icon: HiOutlineBriefcase,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'student' as LoginRole,
      title: 'Student',
      description: 'Access your classes, grades, and schedule',
      icon: HiOutlineAcademicCap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'parent' as LoginRole,
      title: 'Parent/Guardian',
      description: 'View your children\'s progress and communicate with teachers',
      icon: HiOutlineUsers,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  const handleRoleSelect = (role: LoginRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !selectedRole) return;

    setLoading(true);
    try {
      // First, sign in the user
      await signIn(email, password);
      
      // The signIn function in AuthContext will automatically load user metadata
      // We'll let the useEffect handle navigation based on the actual user role
      showToast('Welcome back!', 'success');
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message?.includes('Email not confirmed')) {
        showToast('Please check your email to confirm your account', 'error');
      } else if (error.message?.includes('Invalid login credentials')) {
        showToast('Invalid email or password', 'error');
      } else {
        showToast(error.message || 'Failed to sign in', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a new effect to validate role after login
  useEffect(() => {
    if (user && userRole && selectedRole && !authLoading) {
      // Validate the selected role matches the actual role
      if (!validateUserRoleSelection(selectedRole, userRole)) {
        showToast(
          `Access denied. You are registered as a ${getUserFriendlyRoleName(userRole)}, not a ${selectedRole === 'school' ? 'school administrator' : selectedRole}.`,
          'error'
        );
        signOut(); // Sign them out immediately
        setSelectedRole(null); // Reset role selection
      }
    }
  }, [user, userRole, selectedRole, authLoading, showToast, signOut]);

  const roleContent = {
    school: {
      title: 'School Login',
      subtitle: 'Sign in to manage your institution',
      signupLink: '/signup',
      signupText: 'Create school account',
      forgotText: 'School administrator?'
    },
    staff: {
      title: 'Staff Login',
      subtitle: 'Access your staff portal',
      signupLink: null,
      signupText: 'Contact your school administrator',
      forgotText: 'Staff member access'
    },
    student: {
      title: 'Student Login',
      subtitle: 'Access your student portal',
      signupLink: null,
      signupText: 'Contact your school for access',
      forgotText: 'Student access'
    },
    parent: {
      title: 'Parent Login',
      subtitle: 'View your children\'s progress',
      signupLink: '/parent-signup',
      signupText: 'Create parent account',
      forgotText: 'Parent/Guardian access'
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg
            hover:shadow-xl transition-shadow duration-200"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <HiOutlineSun className="w-6 h-6 text-yellow-500" />
          ) : (
            <HiOutlineMoon className="w-6 h-6 text-gray-700" />
          )}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to ClassBoom
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Select your role to continue
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleRoleSelect(role.id)}
                className={`p-8 rounded-2xl ${role.bgColor} border-2 border-transparent
                  hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200
                  group cursor-pointer`}
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${role.color}
                  flex items-center justify-center mx-auto mb-4 group-hover:scale-110
                  transition-transform duration-200`}>
                  <role.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {role.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {role.description}
                </p>
              </motion.button>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                transition-colors inline-flex items-center space-x-2"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
              <span>Back to home</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentRole = roleContent[selectedRole];
  const roleConfig = roles.find(r => r.id === selectedRole)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg
          hover:shadow-xl transition-shadow duration-200"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <HiOutlineSun className="w-6 h-6 text-yellow-500" />
        ) : (
          <HiOutlineMoon className="w-6 h-6 text-gray-700" />
        )}
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20">
          {/* Role indicator */}
          <button
            onClick={() => setSelectedRole(null)}
            className="mb-6 inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            <span>Change role</span>
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roleConfig.color}
              flex items-center justify-center`}>
              <roleConfig.icon className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            {currentRole.title}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            {currentRole.subtitle}
          </p>

          <RoleHelpText selectedRole={selectedRole} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                  rounded-xl focus:ring-2 focus:ring-classboom-primary focus:border-transparent
                  transition-all duration-200 text-gray-900 dark:text-white"
                placeholder="Enter your email"
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
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                    rounded-xl focus:ring-2 focus:ring-classboom-primary focus:border-transparent
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

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-classboom-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white
                bg-gradient-to-r ${roleConfig.color} shadow-lg
                hover:shadow-xl transition-all duration-200 disabled:opacity-50
                disabled:cursor-not-allowed`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentRole.signupLink ? (
                <>
                  Don't have an account?{' '}
                  <Link
                    to={currentRole.signupLink}
                    className="text-classboom-primary hover:underline font-medium"
                  >
                    {currentRole.signupText}
                  </Link>
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-500">
                  {currentRole.signupText}
                </span>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}