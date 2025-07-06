import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { StudentService } from '../services/studentService';
import { useToast } from '../../../context/ToastContext';
import type { Student } from '../types/student.types';
import { 
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineCurrencyDollar,
  HiOutlineBell,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker
} from 'react-icons/hi';

export function StudentPortalDashboard() {
  const { user, studentInfo, signOut } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [studentInfo]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Students should ONLY use the RPC function, not the regular getStudent
      // which calls getCurrentSchoolId() (meant for school owners)
      if (user?.id) {
        console.log('Loading student data by user_id via RPC function');
        // Use RPC function to get student with school info
        const studentData = await StudentService.getStudentByUserId(user.id);
        setStudent(studentData);
      } else {
        console.error('No user ID available');
        setStudent(null);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      setStudent(null); // Set to null if there's an error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Logged out successfully', 'success');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      showToast('Error logging out', 'error');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Student Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your student profile could not be loaded. Please contact administration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {student.avatar_url ? (
                  <img 
                    src={student.avatar_url} 
                    alt={student.first_name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <>{student.first_name.charAt(0)}{student.last_name.charAt(0)}</>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome, {student.first_name}!
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-1">
                  Student ID: {student.student_code}
                </p>
                {student.grade && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Grade: {student.grade} • {student.skill_level || 'Not set'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => showToast('Settings coming soon!', 'info')}
                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Settings"
              >
                <HiOutlineCog className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <HiOutlineLogout className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center mb-6">
              <HiOutlineUser className="w-6 h-6 text-blue-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Personal Information
              </h2>
            </div>
            
            <div className="space-y-4">
              {student.email && (
                <div className="flex items-center">
                  <HiOutlineMail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white">{student.email}</p>
                  </div>
                </div>
              )}
              
              {student.phone && (
                <div className="flex items-center">
                  <HiOutlinePhone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-white">{student.phone}</p>
                  </div>
                </div>
              )}
              
              {student.date_of_birth && (
                <div className="flex items-center">
                  <HiOutlineCalendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(student.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {(student.city || student.country) && (
                <div className="flex items-start">
                  <HiOutlineLocationMarker className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-gray-900 dark:text-white">
                      {[student.city, student.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* School Information */}
          {student.school && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center mb-6">
                <HiOutlineAcademicCap className="w-6 h-6 text-orange-500 mr-3" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  School Information
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">School Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {student.school.name}
                  </p>
                </div>
                
                {student.school.phone && (
                  <div className="flex items-center">
                    <HiOutlinePhone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">School Phone</p>
                      <p className="text-gray-900 dark:text-white">{student.school.phone}</p>
                    </div>
                  </div>
                )}
                
                {student.school.email && (
                  <div className="flex items-center">
                    <HiOutlineMail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">School Email</p>
                      <p className="text-gray-900 dark:text-white">{student.school.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center mb-6">
              <HiOutlineClock className="w-6 h-6 text-green-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Quick Stats
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Enrollment Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(student.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Active
                </span>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  For questions about your account, please contact your school administration.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => showToast(`${link.title} coming soon!`, 'info')}
                className={`p-4 ${link.bgColor} rounded-lg hover:opacity-80 transition-all text-left`}
              >
                <link.icon className={`w-8 h-8 bg-gradient-to-br ${link.color} text-white p-1.5 rounded-lg mb-2`} />
                <h3 className="font-semibold text-gray-900 dark:text-white">{link.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{link.description}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}