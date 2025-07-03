import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { StudentService } from '../services/studentService';
import { Modal } from '../../../components/Modal';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../auth/context/AuthContext';
import { getInstitutionConfig, TERMINOLOGY_CONFIG } from '../../../types/institution.types';
import { AddStudentNew } from './AddStudentNew';
import type { Student } from '../types/student.types';

// Avatar generation function
const generateAvatar = (name: string) => {
  const colors = [
    'bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
    'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-red-500'
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return colors[colorIndex];
};

export function StudentListCards() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { schoolInfo } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Get institution terminology
  const institutionType = schoolInfo?.settings?.institution_type || 'public_school';
  const institutionConfig = getInstitutionConfig(institutionType);
  const terminology = institutionConfig?.terminology || TERMINOLOGY_CONFIG.public_school;

  useEffect(() => {
    loadStudents();
  }, [search, statusFilter]);

  // School ID is now stable - no need for debug intervals

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await StudentService.getStudents(search, statusFilter);
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (student: Student) => {
    try {
      await StudentService.deleteStudent(student.id);
      showToast(`${terminology.student} deleted successfully`, 'success');
      loadStudents();
      setDeletingStudent(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete student', 'error');
    }
  };

  const getStatusBadge = (status: Student['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      graduated: 'bg-blue-100 text-blue-800 border-blue-200',
      dropped: 'bg-red-100 text-red-800 border-red-200'
    };

    const icons = {
      active: '✓',
      inactive: '−',
      graduated: '🎓',
      dropped: '✗'
    };

    return (
      <div className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        <span>{icons[status]}</span>
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return '—';
    // Basic formatting for display
    if (phone.startsWith('+1') && phone.length === 12) {
      return `+1 (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
    }
    return phone;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{terminology.students}</h1>
            <p className="text-gray-600 mt-1">Manage your {terminology.students.toLowerCase()} and their information</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add {terminology.student}</span>
          </motion.button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <p className="text-blue-600 text-sm font-medium">Total {terminology.students}</p>
            <p className="text-2xl font-bold text-blue-900">{students.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <p className="text-green-600 text-sm font-medium">Active</p>
            <p className="text-2xl font-bold text-green-900">
              {students.filter(s => s.status === 'active').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <p className="text-purple-600 text-sm font-medium">New This Month</p>
            <p className="text-2xl font-bold text-purple-900">
              {students.filter(s => {
                const enrolledDate = new Date(s.enrolled_at);
                const now = new Date();
                return enrolledDate.getMonth() === now.getMonth() && 
                       enrolledDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <p className="text-orange-600 text-sm font-medium">Total Capacity</p>
            <p className="text-2xl font-bold text-orange-900">∞</p>
          </div>
        </div>
      </div>
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search by name, email, or ${terminology.student.toLowerCase()} code...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : students.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No {terminology.students.toLowerCase()} yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first {terminology.student.toLowerCase()} to ClassBoom</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              Add First {terminology.student}
            </button>
          </motion.div>
        ) : (
          /* Student Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {students.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header with Avatar */}
                  <div className="relative p-6 pb-4">
                    {/* Actions - Always visible on mobile, hover on desktop */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex space-x-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-1 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 md:transform md:group-hover:scale-100 md:scale-90">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingStudent(student);
                          }}
                          className="p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          title="Edit student"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingStudent(student);
                          }}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                          title="Delete student"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      {student.avatar_url ? (
                        <img
                          src={student.avatar_url}
                          alt={`${student.first_name} ${student.last_name}`}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-20 h-20 rounded-full ${generateAvatar(student.first_name || 'U')} flex items-center justify-center`}>
                          <span className="text-2xl font-bold text-white">
                            {(student.first_name?.charAt(0) || 'U').toUpperCase()}
                          </span>
                        </div>
                      )}

                      <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
                        {`${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unnamed'}
                      </h3>
                      
                      <p className="text-sm text-gray-500 font-mono mt-1">{student.student_code}</p>

                      <div className="mt-3">
                        {getStatusBadge(student.status)}
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="px-6 pb-6 space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      {student.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-600 truncate">{student.email}</span>
                        </div>
                      )}
                      
                      {student.phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-gray-600">{formatPhoneNumber(student.phone)}</span>
                        </div>
                      )}

                      {student.skill_level && (
                        <div className="flex items-center space-x-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="text-gray-600">{student.skill_level}</span>
                        </div>
                      )}
                    </div>

                    {/* Enrolled Date */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Enrolled {new Date(student.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-3">
                      <button
                        onClick={() => navigate(`/students/${student.id}`)}
                        className="w-full py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        View Profile →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      {/* Add/Edit Student Modal */}
      <Modal
        isOpen={showAddModal || !!editingStudent}
        onClose={() => {
          setShowAddModal(false);
          setEditingStudent(null);
        }}
        title={editingStudent ? `Edit ${terminology.student}` : `Add New ${terminology.student}`}
        size="xl"
      >
        <AddStudentNew 
          student={editingStudent}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingStudent(null);
            loadStudents();
          }}
          onCancel={() => {
            setShowAddModal(false);
            setEditingStudent(null);
          }}
          isModal={true}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        title={`Delete ${terminology.student}`}
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <strong>{deletingStudent?.first_name} {deletingStudent?.last_name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setDeletingStudent(null)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deletingStudent && handleDelete(deletingStudent)}
              className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}