import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';
import { StaffService } from '../services/staffService';
import { CustomSelect } from '../../../components/CustomSelect';
import { DatePicker } from '../../../components/DatePicker';
import type { Staff, StaffFormData, StaffRole, EmploymentType, CompensationModel } from '../types/staff.types';
import { HiOutlineX, HiOutlineUser, HiOutlineBriefcase, HiOutlineCurrencyDollar, HiOutlineIdentification } from 'react-icons/hi';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  staff?: Staff | null;
}

export function StaffModal({ isOpen, onClose, onSave, staff }: StaffModalProps) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const [formData, setFormData] = useState<StaffFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'teacher',
    department: '',
    employment_type: 'full_time',
    hire_date: new Date().toISOString().split('T')[0],
    contract_end_date: '',
    compensation_model: 'monthly_salary',
    base_salary: 0,
    hourly_rate: 0,
    session_rate: 0,
    currency: 'USD',
    specializations: [],
    max_weekly_hours: 40,
    min_weekly_hours: 0,
    date_of_birth: '',
    gender: '',
    nationality: '',
    national_id: '',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    },
    emergency_contact: {
      name: '',
      relationship: '',
      phone: '',
      alternate_phone: '',
      email: ''
    },
    notes: ''
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: HiOutlineUser },
    { id: 'employment', label: 'Employment', icon: HiOutlineBriefcase },
    { id: 'compensation', label: 'Compensation', icon: HiOutlineCurrencyDollar },
    { id: 'personal', label: 'Personal', icon: HiOutlineIdentification }
  ];

  useEffect(() => {
    if (staff) {
      setFormData({
        first_name: staff.first_name,
        last_name: staff.last_name,
        email: staff.email,
        phone: staff.phone || '',
        role: staff.role,
        department: staff.department || '',
        employment_type: staff.employment_type || 'full_time',
        hire_date: staff.hire_date,
        contract_end_date: staff.contract_end_date || '',
        compensation_model: staff.compensation_model || 'monthly_salary',
        base_salary: staff.base_salary || 0,
        hourly_rate: staff.hourly_rate || 0,
        session_rate: staff.session_rate || 0,
        currency: staff.currency || 'USD',
        specializations: staff.specializations || [],
        max_weekly_hours: staff.max_weekly_hours || 40,
        min_weekly_hours: staff.min_weekly_hours || 0,
        date_of_birth: staff.date_of_birth || '',
        gender: staff.gender || '',
        nationality: staff.nationality || '',
        national_id: staff.national_id || '',
        address: staff.address || {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: ''
        },
        emergency_contact: staff.emergency_contact || {
          name: '',
          relationship: '',
          phone: '',
          alternate_phone: '',
          email: ''
        },
        notes: staff.notes || ''
      });
    } else {
      // Reset form for new staff
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'teacher',
        department: '',
        employment_type: 'full_time',
        hire_date: new Date().toISOString().split('T')[0],
        contract_end_date: '',
        compensation_model: 'monthly_salary',
        base_salary: 0,
        hourly_rate: 0,
        session_rate: 0,
        currency: 'USD',
        specializations: [],
        max_weekly_hours: 40,
        min_weekly_hours: 0,
        date_of_birth: '',
        gender: '',
        nationality: '',
        national_id: '',
        address: {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: ''
        },
        emergency_contact: {
          name: '',
          relationship: '',
          phone: '',
          alternate_phone: '',
          email: ''
        },
        notes: ''
      });
    }
    setActiveTab(0);
  }, [staff, isOpen]);

  const handleInputChange = (field: keyof StaffFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: keyof StaffFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Clean form data to convert empty strings to null
      const cleanedFormData = {
        ...formData,
        phone: formData.phone || null,
        department: formData.department || null,
        hire_date: formData.hire_date || null,
        contract_end_date: formData.contract_end_date || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        nationality: formData.nationality || null,
        national_id: formData.national_id || null,
        notes: formData.notes || null
      };
      
      if (staff) {
        await StaffService.updateStaff(staff.id, cleanedFormData);
        showToast('Staff member updated successfully', 'success');
      } else {
        await StaffService.createStaff(cleanedFormData);
        showToast('Staff member added successfully', 'success');
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving staff:', error);
      showToast(error.message || 'Failed to save staff member', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const roleOptions = [
    { value: 'teacher', label: '👨‍🏫 Teacher' },
    { value: 'manager', label: '👩‍💼 Manager' },
    { value: 'admin', label: '⚙️ Admin' },
    { value: 'support', label: '🛠️ Support' },
    { value: 'custodian', label: '🧹 Custodian' }
  ];

  const employmentTypeOptions = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'volunteer', label: 'Volunteer' }
  ];

  const compensationModelOptions = [
    { value: 'monthly_salary', label: 'Monthly Salary' },
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'per_session', label: 'Per Session' },
    { value: 'volunteer', label: 'Volunteer (Unpaid)' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' }
  ];

  const genderOptions = [
    { value: '', label: 'Prefer not to say' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non_binary', label: 'Non-binary' },
    { value: 'other', label: 'Other' }
  ];

  const relationshipOptions = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10000]"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === index
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-200px)]">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Basic Info Tab */}
              {activeTab === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role *
                      </label>
                      <CustomSelect
                        value={formData.role}
                        onChange={(value) => handleInputChange('role', value)}
                        options={roleOptions}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., Mathematics, Science, Administration"
                      />
                    </div>
                  </div>

                  {formData.role === 'teacher' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Specializations
                      </label>
                      <input
                        type="text"
                        value={formData.specializations?.join(', ') || ''}
                        onChange={(e) => handleInputChange('specializations', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Math, Physics, Chemistry (comma separated)"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Employment Tab */}
              {activeTab === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Employment Type *
                      </label>
                      <CustomSelect
                        value={formData.employment_type}
                        onChange={(value) => handleInputChange('employment_type', value)}
                        options={employmentTypeOptions}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hire Date *
                      </label>
                      <DatePicker
                        value={formData.hire_date}
                        onChange={(value) => handleInputChange('hire_date', value)}
                      />
                    </div>
                  </div>

                  {(formData.employment_type === 'contract' || formData.employment_type === 'part_time') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contract End Date
                      </label>
                      <DatePicker
                        value={formData.contract_end_date}
                        onChange={(value) => handleInputChange('contract_end_date', value)}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Min Weekly Hours
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="168"
                        value={formData.min_weekly_hours}
                        onChange={(e) => handleInputChange('min_weekly_hours', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Weekly Hours
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="168"
                        value={formData.max_weekly_hours}
                        onChange={(e) => handleInputChange('max_weekly_hours', parseInt(e.target.value) || 40)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Compensation Tab */}
              {activeTab === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Compensation Model *
                      </label>
                      <CustomSelect
                        value={formData.compensation_model}
                        onChange={(value) => handleInputChange('compensation_model', value)}
                        options={compensationModelOptions}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Currency
                      </label>
                      <CustomSelect
                        value={formData.currency}
                        onChange={(value) => handleInputChange('currency', value)}
                        options={currencyOptions}
                      />
                    </div>
                  </div>

                  {formData.compensation_model !== 'volunteer' && (
                    <div className="space-y-4">
                      {formData.compensation_model === 'monthly_salary' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Monthly Salary *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={formData.base_salary}
                            onChange={(e) => handleInputChange('base_salary', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      )}

                      {formData.compensation_model === 'hourly' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Hourly Rate *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={formData.hourly_rate}
                            onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      )}

                      {formData.compensation_model === 'per_session' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rate per Session *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={formData.session_rate}
                            onChange={(e) => handleInputChange('session_rate', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Personal Tab */}
              {activeTab === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date of Birth
                      </label>
                      <DatePicker
                        value={formData.date_of_birth}
                        onChange={(value) => handleInputChange('date_of_birth', value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Gender
                      </label>
                      <CustomSelect
                        value={formData.gender}
                        onChange={(value) => handleInputChange('gender', value)}
                        options={genderOptions}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      National ID
                    </label>
                    <input
                      type="text"
                      value={formData.national_id}
                      onChange={(e) => handleInputChange('national_id', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={formData.address?.street || ''}
                          onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={formData.address?.city || ''}
                            onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={formData.address?.state || ''}
                            onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={formData.address?.postal_code || ''}
                            onChange={(e) => handleNestedChange('address', 'postal_code', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            value={formData.address?.country || ''}
                            onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Emergency Contact</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={formData.emergency_contact?.name || ''}
                            onChange={(e) => handleNestedChange('emergency_contact', 'name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Relationship
                          </label>
                          <CustomSelect
                            value={formData.emergency_contact?.relationship || ''}
                            onChange={(value) => handleNestedChange('emergency_contact', 'relationship', value)}
                            options={relationshipOptions}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.emergency_contact?.phone || ''}
                            onChange={(e) => handleNestedChange('emergency_contact', 'phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Alternate Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.emergency_contact?.alternate_phone || ''}
                            onChange={(e) => handleNestedChange('emergency_contact', 'alternate_phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.emergency_contact?.email || ''}
                            onChange={(e) => handleNestedChange('emergency_contact', 'email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Additional notes about this staff member..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                {activeTab > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab - 1)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                
                {activeTab < tabs.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab + 1)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      saving
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {saving ? 'Saving...' : staff ? 'Update Staff' : 'Add Staff'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}