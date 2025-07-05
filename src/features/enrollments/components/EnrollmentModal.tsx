import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';
import { EnrollmentService } from '../services/enrollmentService';
import type { Enrollment, EnrollmentFormData } from '../services/enrollmentService';
import type { SchoolCourse } from '../../courses/services/coursesService';
import type { Student } from '../../students/types/student.types';
import { CustomSelect } from '../../../components/CustomSelect';
import { DatePicker } from '../../../components/DatePicker';
import { useAuth } from '../../auth/context/AuthContext';
import type { PricingModel } from '../../../types/institution.types';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  enrollment?: Enrollment | null;
  courses: SchoolCourse[];
  students: Student[];
}

export function EnrollmentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  enrollment, 
  courses,
  students 
}: EnrollmentModalProps) {
  const { showToast } = useToast();
  const { schoolInfo } = useAuth();
  
  const [formData, setFormData] = useState<EnrollmentFormData>({
    student_id: '',
    course_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'pending',
    pricing_model: 'monthly' as PricingModel,
    price_amount: 0,
    currency: schoolInfo?.settings?.currency || 'USD',
    total_sessions: undefined,
    payment_status: 'pending',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  // Get available pricing models from school settings
  const availablePricingModels = schoolInfo?.settings?.pricing_models || ['per_session', 'monthly'];

  useEffect(() => {
    if (enrollment) {
      setFormData({
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        start_date: enrollment.start_date,
        end_date: enrollment.end_date || '',
        status: enrollment.status,
        pricing_model: enrollment.pricing_model,
        price_amount: enrollment.price_amount,
        currency: enrollment.currency,
        total_sessions: enrollment.total_sessions,
        payment_status: enrollment.payment_status,
        notes: enrollment.notes || ''
      });
    } else {
      // Reset form for new enrollment
      setFormData({
        student_id: '',
        course_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'pending',
        pricing_model: availablePricingModels[0] as PricingModel,
        price_amount: 0,
        currency: schoolInfo?.settings?.currency || 'USD',
        total_sessions: undefined,
        payment_status: 'pending',
        notes: ''
      });
    }
  }, [enrollment, isOpen, availablePricingModels, schoolInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.course_id) {
      showToast('Please select both student and course', 'error');
      return;
    }

    if (formData.pricing_model === 'package' && !formData.total_sessions) {
      showToast('Please specify total sessions for package pricing', 'error');
      return;
    }

    try {
      setSaving(true);
      
      if (enrollment) {
        await EnrollmentService.updateEnrollment(enrollment.id, formData);
        showToast('Enrollment updated successfully', 'success');
      } else {
        await EnrollmentService.createEnrollment(formData);
        showToast('Enrollment created successfully', 'success');
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving enrollment:', error);
      showToast(error.message || 'Failed to save enrollment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof EnrollmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Filter out already enrolled students for new enrollments
  const availableStudents = enrollment ? students : students.filter(student => {
    // In a real app, you'd check if student is already enrolled in this course
    return true;
  });

  // Filter active courses only
  const activeCourses = courses.filter(course => course.is_active);

  const studentOptions = [
    { value: '', label: 'Select Student' },
    ...availableStudents.map(student => ({
      value: student.id,
      label: `${student.first_name} ${student.last_name}${student.student_id ? ` (${student.student_id})` : ''}`
    }))
  ];

  const courseOptions = [
    { value: '', label: 'Select Course' },
    ...activeCourses.map(course => ({
      value: course.id,
      label: course.name + (course.level ? ` - ${course.level}` : '')
    }))
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const pricingModelOptions = availablePricingModels.map(model => ({
    value: model,
    label: model.charAt(0).toUpperCase() + model.slice(1).replace('_', ' ')
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10000]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {enrollment ? 'Edit Enrollment' : 'New Enrollment'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student and Course Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Student *
                    </label>
                    <CustomSelect
                      value={formData.student_id}
                      onChange={(value) => handleInputChange('student_id', value)}
                      options={studentOptions}
                      placeholder="Select student"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course *
                    </label>
                    <CustomSelect
                      value={formData.course_id}
                      onChange={(value) => handleInputChange('course_id', value)}
                      options={courseOptions}
                      placeholder="Select course"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <DatePicker
                      value={formData.start_date}
                      onChange={(date) => handleInputChange('start_date', date)}
                      placeholder="Select start date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <DatePicker
                      value={formData.end_date}
                      onChange={(date) => handleInputChange('end_date', date)}
                      placeholder="Select end date (optional)"
                      minDate={formData.start_date}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enrollment Status
                    </label>
                    <CustomSelect
                      value={formData.status || 'pending'}
                      onChange={(value) => handleInputChange('status', value)}
                      options={statusOptions}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Status
                    </label>
                    <CustomSelect
                      value={formData.payment_status || 'pending'}
                      onChange={(value) => handleInputChange('payment_status', value)}
                      options={paymentStatusOptions}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Pricing Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pricing Model *
                      </label>
                      <CustomSelect
                        value={formData.pricing_model}
                        onChange={(value) => {
                          handleInputChange('pricing_model', value);
                          // Clear total_sessions if not package
                          if (value !== 'package') {
                            handleInputChange('total_sessions', undefined);
                          }
                        }}
                        options={pricingModelOptions}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price Amount *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          {formData.currency}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price_amount || ''}
                          onChange={(e) => handleInputChange('price_amount', parseFloat(e.target.value) || 0)}
                          className="w-full pl-14 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Package Sessions */}
                  {formData.pricing_model === 'package' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Sessions in Package *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.total_sessions || ''}
                        onChange={(e) => handleInputChange('total_sessions', parseInt(e.target.value) || undefined)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., 10"
                        required={formData.pricing_model === 'package'}
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Additional notes about this enrollment..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : enrollment ? 'Update Enrollment' : 'Create Enrollment'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}