import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/context/AuthContext';
import { 
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
  HiOutlineBell,
  HiOutlineChatAlt2,
  HiOutlineChartBar,
  HiOutlineEye
} from 'react-icons/hi';

interface ChildData {
  id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  school_id: string;
  status: string;
  enrolled_at: string;
  skill_level?: string;
}

export function ParentPortalDashboard() {
  const { parentInfo } = useAuth();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (parentInfo?.children) {
      setChildren(parentInfo.children as ChildData[]);
      if (parentInfo.children.length > 0 && !selectedChild) {
        setSelectedChild(parentInfo.children[0].id);
      }
      setLoading(false);
    }
  }, [parentInfo]);

  const currentChild = children.find(c => c.id === selectedChild);

  const parentActions = [
    {
      title: 'View Schedule',
      description: 'Check class schedules',
      icon: HiOutlineCalendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      href: '/parent-portal/schedule'
    },
    {
      title: 'View Grades',
      description: 'Monitor academic progress',
      icon: HiOutlineDocumentText,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      href: '/parent-portal/grades'
    },
    {
      title: 'Attendance',
      description: 'Track attendance records',
      icon: HiOutlineChartBar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      href: '/parent-portal/attendance'
    },
    {
      title: 'Payments',
      description: 'View fees and payments',
      icon: HiOutlineCurrencyDollar,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      href: '/parent-portal/payments'
    },
    {
      title: 'Messages',
      description: 'Communicate with teachers',
      icon: HiOutlineChatAlt2,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      href: '/parent-portal/messages'
    },
    {
      title: 'Progress Reports',
      description: 'Detailed progress analysis',
      icon: HiOutlineAcademicCap,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      href: '/parent-portal/reports'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-classboom-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Parent Portal
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {parentInfo?.first_name}!
              </p>
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <HiOutlineBell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Child Selector */}
        {children.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Child
            </label>
            <div className="flex space-x-4">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${selectedChild === child.id
                      ? 'bg-classboom-primary text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {child.first_name} {child.last_name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Selected Child Info */}
        {currentChild && (
          <motion.div
            key={currentChild.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-classboom-primary to-classboom-secondary
                  flex items-center justify-center text-white font-bold text-xl">
                  {currentChild.first_name[0]}{currentChild.last_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {currentChild.first_name} {currentChild.last_name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Student ID: {currentChild.student_code}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium
                    ${currentChild.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                    {currentChild.status}
                  </span>
                </div>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700
                rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <HiOutlineEye className="w-5 h-5" />
                <span>View Full Profile</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parentActions.map((action, index) => (
            <motion.a
              key={action.href}
              href={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl ${action.bgColor} border-2 border-transparent
                hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200
                group cursor-pointer`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color}
                flex items-center justify-center mb-4 group-hover:scale-110
                transition-transform duration-200`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </motion.a>
          ))}
        </div>

        {/* Recent Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Updates
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No recent updates to show
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}