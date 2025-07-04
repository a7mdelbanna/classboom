import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { supabase } from '../../../lib/supabase';
import { 
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineCurrencyDollar,
  HiOutlineBell,
  HiOutlineDocumentText,
  HiOutlineClock
} from 'react-icons/hi';

export function StudentPortalDashboard() {
  const { studentInfo } = useAuth();
  const { showToast } = useToast();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentInfo?.id) {
      loadStudentData();
    }
  }, [studentInfo]);

  const loadStudentData = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentInfo!.id)
        .single();

      if (error) throw error;
      setStudentData(data);
    } catch (error) {
      console.error('Error loading student data:', error);
      showToast('Failed to load your data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      title: 'My Profile',
      description: 'View and update your information',
      icon: HiOutlineUser,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      href: '/student-portal/profile'
    },
    {
      title: 'My Schedule',
      description: 'View your class schedule',
      icon: HiOutlineCalendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      href: '/student-portal/schedule'
    },
    {
      title: 'My Courses',
      description: 'Access course materials',
      icon: HiOutlineAcademicCap,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      href: '/student-portal/courses'
    },
    {
      title: 'Assignments',
      description: 'View and submit assignments',
      icon: HiOutlineClipboardList,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      href: '/student-portal/assignments'
    },
    {
      title: 'Grades',
      description: 'Check your grades',
      icon: HiOutlineDocumentText,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      href: '/student-portal/grades'
    },
    {
      title: 'Payments',
      description: 'View payment history',
      icon: HiOutlineCurrencyDollar,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      href: '/student-portal/payments'
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
                Student Portal
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {studentData?.first_name}!
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
        {/* Student Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-classboom-primary to-classboom-secondary
              flex items-center justify-center text-white font-bold text-2xl">
              {studentData?.first_name?.[0]}{studentData?.last_name?.[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {studentData?.first_name} {studentData?.last_name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Student ID: {studentData?.student_code}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <HiOutlineClock className="w-4 h-4" />
                  <span>Enrolled: {new Date(studentData?.enrolled_at).toLocaleDateString()}</span>
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${studentData?.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                  {studentData?.status}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <motion.a
              key={link.href}
              href={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl ${link.bgColor} border-2 border-transparent
                hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200
                group cursor-pointer`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color}
                flex items-center justify-center mb-4 group-hover:scale-110
                transition-transform duration-200`}>
                <link.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {link.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {link.description}
              </p>
            </motion.a>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No recent activity to show
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}