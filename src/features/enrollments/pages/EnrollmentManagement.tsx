import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';
import { useSearchParams } from 'react-router-dom';
import { EnrollmentService } from '../services/enrollmentService';
import { CoursesService } from '../../courses/services/coursesService';
import { StudentService } from '../../students/services/studentService';
import type { Enrollment, EnrollmentFilters } from '../services/enrollmentService';
import type { SchoolCourse } from '../../courses/services/coursesService';
import type { Student } from '../../students/types/student.types';
import { CustomSelect } from '../../../components/CustomSelect';
import { DatePicker } from '../../../components/DatePicker';
import { EnrollmentModal } from '../components/EnrollmentModal';
import { HiOutlineAcademicCap, HiOutlineCurrencyDollar, HiOutlineUserGroup, HiOutlineClock } from 'react-icons/hi';

export function EnrollmentManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<SchoolCourse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<EnrollmentFilters>({
    status: undefined,
    payment_status: undefined,
    search: ''
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, [filters]);

  // Check URL params on mount
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowModal(true);
      // Clean up the URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Listen for custom event
  useEffect(() => {
    const handleOpenModal = () => setShowModal(true);
    window.addEventListener('openAddEnrollmentModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openAddEnrollmentModal', handleOpenModal);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrollmentsData, coursesData, studentsData, stats] = await Promise.all([
        EnrollmentService.getEnrollments(filters),
        CoursesService.getAllSchoolCourses(),
        StudentService.getStudents(),
        EnrollmentService.getEnrollmentStats()
      ]);
      
      setEnrollments(enrollmentsData);
      setCourses(coursesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load enrollments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnrollment = () => {
    setEditingEnrollment(null);
    setShowModal(true);
  };

  const handleEditEnrollment = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setShowModal(true);
  };

  const handleDeleteEnrollment = async (enrollment: Enrollment) => {
    const studentName = enrollment.student ? 
      `${enrollment.student.first_name} ${enrollment.student.last_name}` : 'this student';
    const courseName = enrollment.course?.name || 'this course';
    
    if (!confirm(`Are you sure you want to delete ${studentName}'s enrollment in ${courseName}?`)) {
      return;
    }

    try {
      await EnrollmentService.deleteEnrollment(enrollment.id);
      showToast('Enrollment deleted successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      showToast('Failed to delete enrollment', 'error');
    }
  };

  const handleModalSave = () => {
    setShowModal(false);
    setEditingEnrollment(null);
    loadData();
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'partial': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'overdue': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'refunded': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const formatPricingModel = (model: string) => {
    return model.charAt(0).toUpperCase() + model.slice(1).replace('_', ' ');
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const paymentStatusOptions = [
    { value: '', label: 'All Payment Statuses' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'refunded', label: 'Refunded' }
  ];

  // Calculate statistics
  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === 'active').length,
    revenue: enrollments.reduce((sum, e) => sum + e.total_paid, 0),
    pending: enrollments.filter(e => e.payment_status === 'pending').length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Enrollment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student course enrollments and subscriptions
          </p>
        </div>
        
        <button
          onClick={handleAddEnrollment}
          className="mt-4 lg:mt-0 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          + New Enrollment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Total Enrollments</div>
            </div>
            <HiOutlineUserGroup className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Active</div>
            </div>
            <HiOutlineAcademicCap className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ${stats.revenue.toFixed(2)}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</div>
            </div>
            <HiOutlineCurrencyDollar className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Pending Payment</div>
            </div>
            <HiOutlineClock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by student or course..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-auto">
            <CustomSelect
              value={filters.status || ''}
              onChange={(value) => setFilters(prev => ({ 
                ...prev, 
                status: value === '' ? undefined : value as any
              }))}
              options={statusOptions}
              placeholder="Status"
            />
            <CustomSelect
              value={filters.payment_status || ''}
              onChange={(value) => setFilters(prev => ({ 
                ...prev, 
                payment_status: value === '' ? undefined : value as any
              }))}
              options={paymentStatusOptions}
              placeholder="Payment Status"
            />
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading enrollments...</span>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No enrollments yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start by enrolling students in courses
            </p>
            <button
              onClick={handleAddEnrollment}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create First Enrollment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {enrollments.map((enrollment) => (
                    <motion.tr
                      key={enrollment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      onClick={() => handleEditEnrollment(enrollment)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {enrollment.student?.avatar_url ? (
                            <img
                              src={enrollment.student.avatar_url}
                              alt=""
                              className="w-8 h-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
                              <span className="text-orange-600 dark:text-orange-400 font-medium text-sm">
                                {enrollment.student?.first_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {enrollment.student?.first_name} {enrollment.student?.last_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {enrollment.student?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {enrollment.course?.name}
                        </div>
                        {enrollment.course?.level && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {enrollment.course.level}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatPricingModel(enrollment.pricing_model)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ${enrollment.price_amount.toFixed(2)}
                          {enrollment.pricing_model === 'package' && enrollment.total_sessions && (
                            <span> ({enrollment.sessions_remaining}/{enrollment.total_sessions} sessions)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getPaymentStatusColor(enrollment.payment_status)}`}>
                          {enrollment.payment_status}
                        </span>
                        {enrollment.balance_due > 0 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ${enrollment.balance_due.toFixed(2)} due
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(enrollment.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEnrollment(enrollment);
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEnrollment(null);
        }}
        onSave={handleModalSave}
        enrollment={editingEnrollment}
        courses={courses}
        students={students}
      />
    </div>
  );
}