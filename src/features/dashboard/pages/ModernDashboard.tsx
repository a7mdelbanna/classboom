import { motion } from 'framer-motion';
import { useAuth } from '../../auth/context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { StudentService } from '../../students/services/studentService';
import { ActivityService, type Activity } from '../../../services/activityService';
import { Confetti } from '../../../components/Confetti';
import { Modal } from '../../../components/Modal';
import { AddStudentNew } from '../../students/pages/AddStudentNew';
import { StatsCard } from '../../../components/dashboard/StatsCard';
import { QuickActionCard } from '../../../components/dashboard/QuickActionCard';
import { 
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineCurrencyDollar,
  HiOutlineUserAdd,
  HiOutlineClipboardList,
  HiOutlinePlusCircle,
  HiOutlineDocumentReport
} from 'react-icons/hi';

export function ModernDashboard() {
  const { user, schoolInfo } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const { currentTheme } = useTheme();
  const [terminology, setTerminology] = useState({
    student: 'Student',
    students: 'Students',
    teacher: 'Teacher',
    teachers: 'Teachers',
    class: 'Class',
    classes: 'Classes',
  });
  
  // Check if setup was just completed
  useEffect(() => {
    if (searchParams.get('setup') === 'complete') {
      setShowConfetti(true);
      window.history.replaceState({}, '', '/dashboard');
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCounts();
    loadTheme();
    loadActivities();
  }, []);
  
  const loadTheme = async () => {
    if (schoolInfo?.settings?.terminology) {
      setTerminology(schoolInfo.settings.terminology);
    }
  };

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

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const recentActivities = await ActivityService.getRecentActivities(5);
      setActivities(recentActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const stats = [
    { 
      label: terminology.students, 
      value: loading ? '...' : studentCount.toString(), 
      color: 'from-blue-500 to-blue-600',
      icon: <HiOutlineUserGroup className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      trend: { value: 12, isPositive: true },
      onClick: () => navigate('/students')
    },
    { 
      label: terminology.teachers, 
      value: '0', 
      color: 'from-green-500 to-green-600',
      icon: <HiOutlineAcademicCap className="w-5 h-5 text-green-600 dark:text-green-400" />,
      trend: { value: 5, isPositive: true }
    },
    { 
      label: `Active ${terminology.classes}`, 
      value: '0', 
      color: 'from-purple-500 to-purple-600',
      icon: <HiOutlineClipboardList className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    },
    { 
      label: 'Revenue This Month', 
      value: '$0', 
      color: 'from-orange-500 to-orange-600',
      icon: <HiOutlineCurrencyDollar className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      trend: { value: 8, isPositive: false }
    },
  ];

  const quickActions = [
    { 
      label: `Add ${terminology.student}`, 
      description: 'Register a new student',
      icon: <HiOutlineUserAdd />,
      color: { primary: currentTheme.primary, secondary: '#ff8c5a' },
      action: () => setShowAddStudentModal(true),
      shortcut: '⌘+S'
    },
    { 
      label: `View ${terminology.students}`, 
      description: 'Manage all students',
      icon: <HiOutlineClipboardList />,
      color: { primary: '#3b82f6', secondary: '#60a5fa' },
      action: () => navigate('/students'),
      shortcut: '⌘+1'
    },
    { 
      label: `Create ${terminology.class}`, 
      description: 'Schedule a new class',
      icon: <HiOutlinePlusCircle />,
      color: { primary: '#8b5cf6', secondary: '#a78bfa' },
      action: () => navigate('/classes/new'),
      shortcut: '⌘+C'
    },
    { 
      label: 'View Reports', 
      description: 'Analytics & insights',
      icon: <HiOutlineDocumentReport />,
      color: { primary: '#10b981', secondary: '#34d399' },
      action: () => navigate('/reports'),
      shortcut: '⌘+R'
    },
  ];

  return (
    <div>
      {/* Confetti Animation */}
      {showConfetti && <Confetti primaryColor={currentTheme.primary} secondaryColor={currentTheme.secondary} />}
      
      {/* Welcome Section with Modern Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back{user?.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ''}! 👋
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Here's what's happening at {schoolInfo?.name || 'your institution'} today
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
              <p className="text-2xl font-bold classboom-gradient-text">
                {schoolInfo?.subscription_plan || 'Trial'} Plan
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid with New Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={stat.label}
            {...stat}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Quick Actions with New Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={action.label}
              {...action}
              onClick={action.action}
              delay={0.4 + index * 0.1}
            />
          ))}
        </div>
      </motion.div>

      {/* Recent Activity with Enhanced Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          <button
            onClick={() => loadActivities()}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
        
        {/* Activity Timeline */}
        <div className="space-y-4">
          {loadingActivities ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No recent activity to show
            </p>
          ) : (
            activities.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 
                    flex items-center justify-center text-white text-lg">
                    {ActivityService.getActivityIcon(activity.action_type)}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-medium">{activity.user_name}</span> {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {ActivityService.formatActivityTime(activity.created_at)}
                  </p>
                </div>
                {activity.entity_type && (
                  <div className="flex-shrink-0">
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full capitalize">
                      {activity.entity_type}
                    </span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        <button className="w-full mt-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 
          transition-colors text-center">
          View all activity →
        </button>
      </motion.div>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title={`Add New ${terminology.student}`}
        size="xl"
      >
        <AddStudentNew 
          onSuccess={() => {
            setShowAddStudentModal(false);
            loadCounts();
            loadActivities(); // Refresh activities after adding student
          }}
          onCancel={() => setShowAddStudentModal(false)}
          isModal={true}
        />
      </Modal>
    </div>
  );
}