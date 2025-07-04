import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { StudentService } from '../services/studentService';
import { PortalAccessCard } from '../components/PortalAccessCard';
import { ParentInviteCard } from '../../parents/components/ParentInviteCard';
import type { Student } from '../types/student.types';

export function StudentProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadStudent(id);
    }
  }, [id]);

  const loadStudent = async (studentId: string) => {
    try {
      setLoading(true);
      const data = await StudentService.getStudent(studentId);
      setStudent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load student');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Student['status']) => {
    if (!student) return;
    
    try {
      await StudentService.updateStudentStatus(student.id, newStatus);
      setStudent({ ...student, status: newStatus });
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status: Student['status']) => {
    const styles = {
      active: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      graduated: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      dropped: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Student Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The student you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/students')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/students')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ← Back to Students
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Profile</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/students/${student.id}/edit`)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Student Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                {student.avatar_url ? (
                  <img
                    src={student.avatar_url}
                    alt={student.full_name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-orange-600 dark:text-orange-400 text-3xl font-bold">
                      {student.full_name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{student.full_name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{student.email}</p>
                <div className="mt-3">{getStatusBadge(student.status)}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student Code</label>
                  <p className="text-sm font-mono bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded">{student.student_code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grade Level</label>
                  <p className="text-sm text-gray-900 dark:text-white">{student.grade_level || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <p className="text-sm text-gray-900 dark:text-white">{student.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {student.date_of_birth 
                      ? new Date(student.date_of_birth).toLocaleDateString()
                      : 'Not provided'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enrolled</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(student.enrolled_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Status Change */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Change Status</label>
                <select
                  value={student.status}
                  onChange={(e) => handleStatusChange(e.target.value as Student['status'])}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Details Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Emergency Contact */}
            {student.emergency_contact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">🚨</span>
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <p className="text-sm text-gray-900 dark:text-white">{student.emergency_contact.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Relationship</label>
                    <p className="text-sm text-gray-900 dark:text-white">{student.emergency_contact.relationship}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Phone</label>
                    <p className="text-sm text-gray-900 dark:text-white">{student.emergency_contact.phone}</p>
                  </div>
                  {student.emergency_contact.alternate_phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alternate Phone</label>
                      <p className="text-sm text-gray-900 dark:text-white">{student.emergency_contact.alternate_phone}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Parent Information */}
            {student.parent_info && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">👨‍👩‍👧‍👦</span>
                  Parent Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {student.parent_info.father_name && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Father</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
                          <p className="text-sm text-gray-900 dark:text-white">{student.parent_info.father_name}</p>
                        </div>
                        {student.parent_info.father_phone && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <p className="text-sm text-gray-900 dark:text-white">{student.parent_info.father_phone}</p>
                          </div>
                        )}
                        {student.parent_info.father_email && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <p className="text-sm text-gray-900 dark:text-white">{student.parent_info.father_email}</p>
                          </div>
                        )}
                        {student.parent_info.father_occupation && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Occupation</label>
                            <p className="text-sm text-gray-900 dark:text-white">{student.parent_info.father_occupation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {student.parent_info.mother_name && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Mother</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
                          <p className="text-sm text-gray-900 dark:text-white">{student.parent_info.mother_name}</p>
                        </div>
                        {student.parent_info.mother_phone && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <p className="text-sm text-gray-900 dark:text-white">{student.parent_info.mother_phone}</p>
                          </div>
                        )}
                        {student.parent_info.mother_email && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <p className="text-sm text-gray-900 dark:text-white">{student.parent_info.mother_email}</p>
                          </div>
                        )}
                        {student.parent_info.mother_occupation && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Occupation</label>
                            <p className="text-sm text-gray-900 dark:text-white">{student.parent_info.mother_occupation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Medical Information */}
            {student.medical_info && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">🏥</span>
                  Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.medical_info.blood_type && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Type</label>
                      <p className="text-sm text-gray-900 dark:text-white">{student.medical_info.blood_type}</p>
                    </div>
                  )}
                  {student.medical_info.doctor_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor</label>
                      <p className="text-sm text-gray-900 dark:text-white">{student.medical_info.doctor_name}</p>
                    </div>
                  )}
                  {student.medical_info.allergies && student.medical_info.allergies.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Allergies</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {student.medical_info.allergies.map((allergy, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-xs rounded-full">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {student.medical_info.medications && student.medical_info.medications.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medications</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {student.medical_info.medications.map((medication, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                            {medication}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Notes */}
            {student.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">📝</span>
                  Notes
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{student.notes}</p>
              </motion.div>
            )}

            {/* Portal Access */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <PortalAccessCard 
                student={student} 
                onUpdate={() => loadStudent(student.id)}
              />
            </motion.div>

            {/* Parent Portal Access */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <ParentInviteCard 
                student={student} 
                onUpdate={() => loadStudent(student.id)}
              />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}