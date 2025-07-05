import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnrollmentService } from '../services/enrollmentService';
import type { Enrollment } from '../services/enrollmentService';
import { HiOutlineAcademicCap, HiOutlineClock, HiOutlineCurrencyDollar } from 'react-icons/hi';

interface StudentEnrollmentsProps {
  studentId: string;
  onEnrollClick?: (enrollment: Enrollment) => void;
}

export function StudentEnrollments({ studentId, onEnrollClick }: StudentEnrollmentsProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, [studentId]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await EnrollmentService.getStudentEnrollments(studentId);
      setEnrollments(data);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'suspended': return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const formatPricingModel = (model: string) => {
    return model.charAt(0).toUpperCase() + model.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading enrollments...</span>
        </div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Course Enrollments
        </h3>
        <div className="text-center py-8">
          <HiOutlineAcademicCap className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            No course enrollments yet
          </p>
        </div>
      </div>
    );
  }

  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const otherEnrollments = enrollments.filter(e => e.status !== 'active');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Course Enrollments ({enrollments.length})
      </h3>

      <div className="space-y-4">
        {activeEnrollments.length > 0 && (
          <>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Enrollments
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {activeEnrollments.map((enrollment) => (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => onEnrollClick?.(enrollment)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {enrollment.course?.name}
                        </h5>
                        {enrollment.course?.level && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {enrollment.course.level}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <HiOutlineClock className="w-4 h-4 mr-1" />
                        Started: {new Date(enrollment.start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <HiOutlineCurrencyDollar className="w-4 h-4 mr-1" />
                        {formatPricingModel(enrollment.pricing_model)} - ${enrollment.price_amount}
                      </div>
                      {enrollment.pricing_model === 'package' && enrollment.total_sessions && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <HiOutlineAcademicCap className="w-4 h-4 mr-1" />
                          Sessions: {enrollment.sessions_remaining}/{enrollment.total_sessions}
                        </div>
                      )}
                    </div>

                    {enrollment.balance_due > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          Balance Due: ${enrollment.balance_due.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {otherEnrollments.length > 0 && (
          <>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-6">
              Other Enrollments
            </h4>
            <div className="space-y-2">
              {otherEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => onEnrollClick?.(enrollment)}
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {enrollment.course?.name}
                    </span>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ({new Date(enrollment.start_date).toLocaleDateString()})
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(enrollment.status)}`}>
                    {enrollment.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}