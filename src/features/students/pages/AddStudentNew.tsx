import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { StudentService } from '../services/studentService';
import { CustomSelect } from '../../../components/CustomSelect';
import { CustomCheckbox } from '../../../components/CustomCheckbox';
import { MultiSelect } from '../../../components/MultiSelect';
import { DatePicker } from '../../../components/DatePicker';
import { useToast } from '../../../context/ToastContext';
import { getInstitutionConfig, TERMINOLOGY_CONFIG } from '../../../types/institution.types';
import { getSkillLevels } from '../types/skill-levels.types';
import { COUNTRIES, detectCountryFromPhone } from '../../../utils/countries';
import { CoursesService } from '../../courses/services/coursesService';
import type { 
  Student,
  CreateStudentInput, 
  SocialMediaContacts, 
  CommunicationPreferences,
  EmergencyContact,
  ParentInfo,
  MedicalInfo 
} from '../types/student.types';

type TabType = 'main' | 'emergency' | 'parent' | 'medical';

const socialMediaPlatforms = [
  { key: 'whatsapp', label: 'WhatsApp', icon: '📱', placeholder: '+1234567890' },
  { key: 'instagram', label: 'Instagram', icon: '📷', placeholder: '@username' },
  { key: 'telegram', label: 'Telegram', icon: '✈️', placeholder: '@username' },
  { key: 'vk', label: 'VK', icon: '🔵', placeholder: 'vk.com/username' },
  { key: 'facebook', label: 'Facebook', icon: '📘', placeholder: 'facebook.com/username' },
  { key: 'twitter', label: 'Twitter/X', icon: '🐦', placeholder: '@username' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'linkedin.com/in/username' },
  { key: 'wechat', label: 'WeChat', icon: '💬', placeholder: 'WeChat ID' },
  { key: 'line', label: 'Line', icon: '💚', placeholder: 'Line ID' },
  { key: 'viber', label: 'Viber', icon: '💜', placeholder: 'Viber number' },
];

const communicationMethods = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone Call', icon: '📞' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '📱' },
  { value: 'telegram', label: 'Telegram', icon: '✈️' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'sms', label: 'SMS', icon: '💬' },
];

const timePreferences = [
  { value: 'morning', label: 'Morning (8AM - 12PM)', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon (12PM - 5PM)', icon: '☀️' },
  { value: 'evening', label: 'Evening (5PM - 9PM)', icon: '🌆' },
  { value: 'anytime', label: 'Anytime', icon: '🕐' },
];

interface AddStudentNewProps {
  student?: Student | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export function AddStudentNew({ student, onSuccess, onCancel, isModal = false }: AddStudentNewProps) {
  const navigate = useNavigate();
  const { user, schoolInfo } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  
  // Get institution config for terminology and skill levels
  const institutionType = schoolInfo?.settings?.institution_type || 'public_school';
  const institutionConfig = getInstitutionConfig(institutionType);
  
  const terminology = institutionConfig?.terminology || TERMINOLOGY_CONFIG.public_school;
  const skillLevels = getSkillLevels(institutionType);


  // Main student info - Initialize with existing data if editing
  const [formData, setFormData] = useState<CreateStudentInput>({
    first_name: student?.first_name || '',
    last_name: student?.last_name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    date_of_birth: student?.date_of_birth || '',
    country: student?.country || '',
    city: student?.city || '',
    skill_level: student?.skill_level || '',
    interested_courses: student?.interested_courses || [],
    notes: student?.notes || ''
  });

  // Social media contacts
  const [socialMedia, setSocialMedia] = useState<SocialMediaContacts>({});

  // Communication preferences
  const [commPrefs, setCommPrefs] = useState<CommunicationPreferences>({
    preferred_method: 'email',
    allow_promotional: true,
    language_preference: 'en',
    time_preference: 'anytime'
  });

  // Secondary info (tabs)
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: '',
    relationship: '',
    phone: '',
    alternate_phone: ''
  });

  const [parentInfo, setParentInfo] = useState<ParentInfo>({});
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({});

  // Load available courses for the school
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const courses = await CoursesService.getSchoolCourses();
        setAvailableCourses(courses);
      } catch (error) {
        console.error('Error loading courses:', error);
        // Fallback to empty array, the CoursesService will handle defaults
        setAvailableCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Auto-detect country from phone number
  useEffect(() => {
    if (formData.phone && formData.phone.startsWith('+') && !formData.country) {
      const detectedCountry = detectCountryFromPhone(formData.phone);
      if (detectedCountry) {
        setFormData(prev => ({ ...prev, country: detectedCountry.code }));
      }
    }
  }, [formData.phone, formData.country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setError('');
    setLoading(true);

    try {
      const studentData: CreateStudentInput = {
        ...formData,
        // Auto-generate full_name from first_name + last_name as fallback
        // The database trigger will handle this, but we can provide it for consistency
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        // Don't send empty date string
        date_of_birth: formData.date_of_birth || undefined,
        social_media: Object.keys(socialMedia).length > 0 ? socialMedia : undefined,
        communication_preferences: commPrefs,
        emergency_contact: emergencyContact.name ? emergencyContact : undefined,
        parent_info: (parentInfo.father_name || parentInfo.mother_name) ? parentInfo : undefined,
        medical_info: (medicalInfo.blood_type || medicalInfo.allergies?.length) ? medicalInfo : undefined
      };

      if (student) {
        // Update existing student
        await StudentService.updateStudent(student.id, studentData);
        showToast(`${terminology.student} updated successfully!`, 'success');
      } else {
        // Create new student
        await StudentService.createStudent(studentData);
        showToast(`${terminology.student} created successfully!`, 'success');
      }
      
      if (onSuccess) {
        onSuccess();
      } else if (!isModal) {
        navigate('/students');
      }
    } catch (err: any) {
      console.error('Error creating/updating student:', err);
      const errorMessage = err.message || 'Failed to save student';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isMainTabValid = formData.first_name && formData.last_name && (formData.email || formData.phone);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      
      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        return 0;
      }
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      
      return Math.max(0, age);
    } catch (error) {
      console.error('Error calculating age:', error);
      return 0;
    }
  };

  const studentAge = calculateAge(formData.date_of_birth || '');
  const ageGroup = schoolInfo?.settings?.age_group || 'both'; // Default to 'both' if not set
  
  // Show parent info based on age group and student age:
  // 1. 'kids' institution: Always show parent info
  // 2. 'both' institution: Show if no date provided OR student is under 18
  // 3. 'adults' institution: Only show if student is under 18 (safety requirement)
  const showParentInfo = ageGroup === 'kids' || 
                        (ageGroup === 'both' && (studentAge < 18 || !formData.date_of_birth)) ||
                        (ageGroup === 'adults' && studentAge < 18 && studentAge > 0);


  const tabs = useMemo(() => [
    { id: 'main' as const, label: 'Main Info', icon: '👤', required: true },
    { id: 'emergency' as const, label: 'Emergency Contact', icon: '🚨', required: false },
    ...(showParentInfo ? [{ id: 'parent' as const, label: `${terminology.parent} Info`, icon: '👨‍👩‍👧‍👦', required: false }] : []),
    { id: 'medical' as const, label: 'Medical Info', icon: '🏥', required: false },
  ], [showParentInfo, terminology.parent]);

  // Switch away from parent tab if it's hidden due to age
  useEffect(() => {
    if (activeTab === 'parent' && !showParentInfo) {
      setActiveTab('main');
    }
  }, [showParentInfo, activeTab]);

  // Force re-render when date of birth changes to update parent tab visibility
  useEffect(() => {
    // This effect will trigger when formData.date_of_birth changes
    // and will cause the component to re-render with updated tabs
  }, [formData.date_of_birth]);

  const content = (
    <>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.required && <span className="text-red-500">*</span>}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6">
              {/* Main Tab */}
              {activeTab === 'main' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="john.smith@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <DatePicker
                          value={formData.date_of_birth || ''}
                          onChange={(date) => setFormData({...formData, date_of_birth: date})}
                          placeholder="Select date of birth"
                          maxDate={new Date().toISOString().split('T')[0]} // Can't be born in the future
                        />
                        {formData.date_of_birth && (
                          <p className="text-xs text-gray-500 mt-1">
                            Age: {studentAge} years
                            {ageGroup === 'both' && (
                              <span className={`ml-2 ${studentAge < 18 ? 'text-orange-600' : 'text-green-600'}`}>
                                {studentAge < 18 ? '(Parent info tab shown)' : '(Parent info tab hidden)'}
                              </span>
                            )}
                            {ageGroup === 'kids' && (
                              <span className="ml-2 text-blue-600">(Parent info always required)</span>
                            )}
                            {ageGroup === 'adults' && studentAge < 18 && (
                              <span className="ml-2 text-orange-600">(Parent info required - under 18)</span>
                            )}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {skillLevels?.name || 'Level'}
                        </label>
                        <CustomSelect
                          value={formData.skill_level || ''}
                          onChange={(value) => setFormData({...formData, skill_level: value})}
                          options={skillLevels?.levels.map(level => ({
                            value: level.value,
                            label: level.label
                          })) || [
                            { value: 'beginner', label: 'Beginner' },
                            { value: 'intermediate', label: 'Intermediate' },
                            { value: 'advanced', label: 'Advanced' }
                          ]}
                          placeholder={`Select ${skillLevels?.name || 'Level'}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <CustomSelect
                          value={formData.country || ''}
                          onChange={(value) => setFormData({...formData, country: value})}
                          options={COUNTRIES.map(country => ({
                            value: country.code,
                            label: `${country.flag} ${country.name}`
                          }))}
                          placeholder="Select Country"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="New York"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Contacts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {socialMediaPlatforms.map((platform) => (
                        <div key={platform.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {platform.icon} {platform.label}
                          </label>
                          <input
                            type="text"
                            value={socialMedia[platform.key as keyof SocialMediaContacts] || ''}
                            onChange={(e) => setSocialMedia({
                              ...socialMedia,
                              [platform.key]: e.target.value
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder={platform.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Communication Preferences */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Communication Method
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {communicationMethods.map((method) => (
                            <CustomCheckbox
                              key={method.value}
                              checked={commPrefs.preferred_method === method.value}
                              onChange={(checked) => {
                                if (checked) {
                                  setCommPrefs({...commPrefs, preferred_method: method.value as any});
                                }
                              }}
                              label={
                                <span className="flex items-center space-x-2">
                                  <span>{method.icon}</span>
                                  <span>{method.label}</span>
                                </span>
                              }
                              variant="radio"
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Best Time to Contact
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {timePreferences.map((time) => (
                            <CustomCheckbox
                              key={time.value}
                              checked={commPrefs.time_preference === time.value}
                              onChange={(checked) => {
                                if (checked) {
                                  setCommPrefs({...commPrefs, time_preference: time.value as any});
                                }
                              }}
                              label={
                                <span className="flex items-center space-x-2">
                                  <span>{time.icon}</span>
                                  <span>{time.label}</span>
                                </span>
                              }
                              variant="radio"
                            />
                          ))}
                        </div>
                      </div>

                      <CustomCheckbox
                        checked={commPrefs.allow_promotional}
                        onChange={(checked) => setCommPrefs({...commPrefs, allow_promotional: checked})}
                        label="Allow promotional and marketing communications"
                      />
                    </div>
                  </div>

                  {/* Interested Courses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interested {terminology.classes}
                    </label>
                    {coursesLoading ? (
                      <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                        <span className="text-gray-500">Loading {terminology.classes.toLowerCase()}...</span>
                      </div>
                    ) : (
                      <MultiSelect
                        value={formData.interested_courses || []}
                        onChange={(courses) => setFormData({...formData, interested_courses: courses})}
                        options={availableCourses.map(course => ({
                          value: course,
                          label: course
                        }))}
                        placeholder={`Select ${terminology.classes.toLowerCase()} the student is interested in`}
                        className="w-full"
                        maxHeight="max-h-48"
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {availableCourses.length === 0 && !coursesLoading
                        ? `No ${terminology.classes.toLowerCase()} configured yet. Set up your ${terminology.classes.toLowerCase()} in school settings.`
                        : `Select from available ${terminology.classes.toLowerCase()} or search to find specific ones`
                      }
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Any additional notes about the student..."
                    />
                  </div>
                </motion.div>
              )}

              {/* Emergency Contact Tab */}
              {activeTab === 'emergency' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-medium text-gray-900">Emergency Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={emergencyContact.name}
                        onChange={(e) => setEmergencyContact({...emergencyContact, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <CustomSelect
                        value={emergencyContact.relationship}
                        onChange={(value) => setEmergencyContact({...emergencyContact, relationship: value})}
                        options={[
                          { value: 'Mother', label: 'Mother' },
                          { value: 'Father', label: 'Father' },
                          { value: 'Guardian', label: 'Guardian' },
                          { value: 'Grandparent', label: 'Grandparent' },
                          { value: 'Sibling', label: 'Sibling' },
                          { value: 'Other', label: 'Other' },
                        ]}
                        placeholder="Select Relationship"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Phone
                      </label>
                      <input
                        type="tel"
                        value={emergencyContact.phone}
                        onChange={(e) => setEmergencyContact({...emergencyContact, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Phone
                      </label>
                      <input
                        type="tel"
                        value={emergencyContact.alternate_phone}
                        onChange={(e) => setEmergencyContact({...emergencyContact, alternate_phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Parent Info Tab */}
              {activeTab === 'parent' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <h3 className="text-lg font-medium text-gray-900">{terminology.parent} Information</h3>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-4">Father's Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={parentInfo.father_name}
                        onChange={(e) => setParentInfo({...parentInfo, father_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Father's name"
                      />
                      <input
                        type="tel"
                        value={parentInfo.father_phone}
                        onChange={(e) => setParentInfo({...parentInfo, father_phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Father's phone"
                      />
                      <input
                        type="email"
                        value={parentInfo.father_email}
                        onChange={(e) => setParentInfo({...parentInfo, father_email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Father's email"
                      />
                      <input
                        type="text"
                        value={parentInfo.father_occupation}
                        onChange={(e) => setParentInfo({...parentInfo, father_occupation: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Father's occupation"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-4">Mother's Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={parentInfo.mother_name}
                        onChange={(e) => setParentInfo({...parentInfo, mother_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Mother's name"
                      />
                      <input
                        type="tel"
                        value={parentInfo.mother_phone}
                        onChange={(e) => setParentInfo({...parentInfo, mother_phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Mother's phone"
                      />
                      <input
                        type="email"
                        value={parentInfo.mother_email}
                        onChange={(e) => setParentInfo({...parentInfo, mother_email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Mother's email"
                      />
                      <input
                        type="text"
                        value={parentInfo.mother_occupation}
                        onChange={(e) => setParentInfo({...parentInfo, mother_occupation: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Mother's occupation"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Medical Info Tab */}
              {activeTab === 'medical' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Type
                      </label>
                      <CustomSelect
                        value={medicalInfo.blood_type || ''}
                        onChange={(value) => setMedicalInfo({...medicalInfo, blood_type: value})}
                        options={[
                          { value: 'A+', label: 'A+' },
                          { value: 'A-', label: 'A-' },
                          { value: 'B+', label: 'B+' },
                          { value: 'B-', label: 'B-' },
                          { value: 'AB+', label: 'AB+' },
                          { value: 'AB-', label: 'AB-' },
                          { value: 'O+', label: 'O+' },
                          { value: 'O-', label: 'O-' },
                        ]}
                        placeholder="Select Blood Type"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doctor's Name
                      </label>
                      <input
                        type="text"
                        value={medicalInfo.doctor_name}
                        onChange={(e) => setMedicalInfo({...medicalInfo, doctor_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Dr. Smith"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={medicalInfo.allergies?.join(', ') || ''}
                      onChange={(e) => setMedicalInfo({
                        ...medicalInfo, 
                        allergies: e.target.value ? e.target.value.split(',').map(a => a.trim()) : []
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Peanuts, Shellfish, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medications (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={medicalInfo.medications?.join(', ') || ''}
                      onChange={(e) => setMedicalInfo({
                        ...medicalInfo, 
                        medications: e.target.value ? e.target.value.split(',').map(m => m.trim()) : []
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Insulin, Inhaler, etc."
                    />
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>

        {/* Submit Button */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !isMainTabValid}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium ml-auto"
          >
            {loading ? (student ? 'Updating...' : 'Creating...') : (student ? `Update ${terminology.student}` : `Create ${terminology.student}`)}
          </button>
        </div>
      </form>
    </>
  );

  // Return content directly for modal mode
  if (isModal) {
    return content;
  }

  // Return full page layout for standalone mode
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/students')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to {terminology.students}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {student ? `Edit ${terminology.student}` : `Add New ${terminology.student}`}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          {content}
        </div>
      </div>
    </div>
  );
}