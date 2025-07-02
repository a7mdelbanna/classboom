import { motion } from 'framer-motion';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { StudentService } from '../../students/services/studentService';

export function Dashboard() {
  const { user, schoolInfo, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const count = await StudentService.getStudentCount();
      setStudentCount(count);
    } catch (error) {
      console.error('Error loading counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const stats = [
    { label: 'Students', value: loading ? '...' : studentCount.toString(), color: 'from-blue-500 to-blue-600' },
    { label: 'Teachers', value: '0', color: 'from-green-500 to-green-600' },
    { label: 'Active Classes', value: '0', color: 'from-purple-500 to-purple-600' },
    { label: 'Today\'s Sessions', value: '0', color: 'from-orange-500 to-orange-600' },
  ];

  const quickActions = [
    { label: 'Add Student', icon: '👨‍🎓', path: '/students/new' },
    { label: 'View Students', icon: '📋', path: '/students' },
    { label: 'Create Class', icon: '📚', path: '/classes/new' },
    { label: 'View Reports', icon: '📊', path: '/reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ClassBoom</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
          </h2>
          <p className="text-gray-600">
            {schoolInfo?.name || 'Your School'} • {schoolInfo?.subscription_plan || 'Trial'} Plan
            {schoolInfo?.trial_ends_at && (
              <span className="ml-2 text-orange-600">
                (Trial ends {new Date(schoolInfo.trial_ends_at).toLocaleDateString()})
              </span>
            )}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
              >
                <span className="text-3xl mb-2">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity yet.</p>
            <p className="text-sm mt-2">Start by adding students or creating classes!</p>
          </div>
        </motion.div>

        {/* Trial Notice for new users */}
        {userRole === 'school_owner' && schoolInfo?.subscription_plan === 'trial' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"
          >
            <h4 className="font-semibold text-orange-900 mb-2">🎉 Welcome to your ClassBoom trial!</h4>
            <p className="text-orange-800 text-sm">
              You have 14 days to explore all features. Need help getting started? 
              <button className="ml-2 text-orange-600 font-semibold hover:text-orange-700">
                Take a tour
              </button>
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}