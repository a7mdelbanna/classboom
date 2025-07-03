import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { CustomSelect } from '../../../components/CustomSelect';
import { CustomCheckbox } from '../../../components/CustomCheckbox';
import { TimeInput } from '../../../components/TimeInput';
import { useToast } from '../../../context/ToastContext';
import {
  INSTITUTION_CATEGORIES,
  TERMINOLOGY_CONFIG,
  getInstitutionConfig,
  type InstitutionType,
  type AgeGroup,
  type LocationModel,
  type Currency,
  type MeetingPlatform,
  type PricingModel,
  type SchoolSettings,
} from '../../../types/institution.types';

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

const steps: WizardStep[] = [
  {
    id: 1,
    title: 'Institution Type',
    description: 'What type of institution are you?',
  },
  {
    id: 2,
    title: 'Basic Configuration',
    description: "Let's set up your institution",
  },
  {
    id: 3,
    title: 'Location & Regional',
    description: 'Where are you located?',
  },
  {
    id: 4,
    title: 'Academic Settings',
    description: 'Configure your academic structure',
  },
  {
    id: 5,
    title: 'Financial Setup',
    description: 'How do you handle payments?',
  },
  {
    id: 6,
    title: 'Features',
    description: 'Select the features you need',
  },
  {
    id: 7,
    title: 'Theme & Branding',
    description: 'Customize your look',
  },
];

const themes = [
  { name: 'Sunrise', primary: '#FF6B35', secondary: '#F7931E' },
  { name: 'Ocean', primary: '#0077BE', secondary: '#00A8E8' },
  { name: 'Forest', primary: '#2A9D8F', secondary: '#264653' },
  { name: 'Lavender', primary: '#9B59B6', secondary: '#8E44AD' },
  { name: 'Cherry', primary: '#E74C3C', secondary: '#C0392B' },
  { name: 'Mint', primary: '#26D0CE', secondary: '#1ABC9C' },
  { name: 'Sunset', primary: '#F39C12', secondary: '#E67E22' },
  { name: 'Midnight', primary: '#34495E', secondary: '#2C3E50' },
  { name: 'Rose', primary: '#E91E63', secondary: '#C2185B' },
  { name: 'Professional', primary: '#2C3E50', secondary: '#3498DB' },
];

const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' },
];

const isIndividualProvider = (type: InstitutionType | null) => {
  return type && ['private_tutor', 'personal_coach', 'music_teacher', 'personal_trainer'].includes(type);
};

export function SetupWizard() {
  const navigate = useNavigate();
  const { user, schoolInfo } = useAuth();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form Data
  const [institutionType, setInstitutionType] = useState<InstitutionType | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('both');
  const [language, setLanguage] = useState('en');
  const [locationCount, setLocationCount] = useState(1);
  const [locationModel, setLocationModel] = useState<LocationModel>('centralized');
  const [primaryLocation, setPrimaryLocation] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
  });
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [academicYearStart, setAcademicYearStart] = useState(9);
  const [academicHourMinutes, setAcademicHourMinutes] = useState(50);
  const [defaultSessionDuration, setDefaultSessionDuration] = useState(1);
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>('zoom');
  const [defaultMeetingLink, setDefaultMeetingLink] = useState('');
  const [paymentAccount, setPaymentAccount] = useState<{
    name: string;
    type: 'bank' | 'paypal' | 'stripe' | 'other';
  }>({
    name: '',
    type: 'bank',
  });
  const [pricingModels, setPricingModels] = useState<PricingModel[]>(['monthly']);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'student_management',
    'teacher_management',
    'class_scheduling',
    'attendance_tracking',
  ]);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [operatingHours, setOperatingHours] = useState<{
    [key: string]: { open: string; close: string; closed: boolean };
  }>({
    monday: { open: '08:00', close: '17:00', closed: false },
    tuesday: { open: '08:00', close: '17:00', closed: false },
    wednesday: { open: '08:00', close: '17:00', closed: false },
    thursday: { open: '08:00', close: '17:00', closed: false },
    friday: { open: '08:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '13:00', closed: false },
    sunday: { open: '09:00', close: '13:00', closed: true },
  });
  
  // Get institution config
  const institutionConfig = institutionType ? getInstitutionConfig(institutionType) : null;
  const terminology = institutionType ? TERMINOLOGY_CONFIG[institutionType] : null;
  
  useEffect(() => {
    // Auto-detect timezone
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(detected);
  }, []);
  
  // Smart defaults based on institution type
  useEffect(() => {
    if (!institutionType) return;
    
    // Set smart defaults based on institution type
    switch (institutionType) {
      case 'fitness_center':
      case 'yoga_studio':
        setAcademicHourMinutes(60);
        setPricingModels(['monthly']);
        setOperatingHours({
          monday: { open: '06:00', close: '21:00', closed: false },
          tuesday: { open: '06:00', close: '21:00', closed: false },
          wednesday: { open: '06:00', close: '21:00', closed: false },
          thursday: { open: '06:00', close: '21:00', closed: false },
          friday: { open: '06:00', close: '21:00', closed: false },
          saturday: { open: '07:00', close: '18:00', closed: false },
          sunday: { open: '08:00', close: '17:00', closed: false },
        });
        break;
        
      case 'private_tutor':
      case 'personal_coach':
      case 'music_teacher':
      case 'personal_trainer':
        setAcademicHourMinutes(60);
        setPricingModels(['per_session']);
        setLocationCount(1);
        // Set flexible hours for individual providers
        setOperatingHours({
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '14:00', closed: true },
          sunday: { open: '10:00', close: '14:00', closed: true },
        });
        break;
        
      case 'online_school':
        setAcademicHourMinutes(45);
        setMeetingPlatform('zoom');
        break;
        
      case 'language_center':
        setAcademicHourMinutes(50);
        setPricingModels(['package', 'monthly']);
        break;
        
      case 'martial_arts_dojo':
        setAcademicHourMinutes(90);
        setPricingModels(['monthly']);
        break;
        
      case 'daycare_preschool':
        setOperatingHours({
          monday: { open: '07:00', close: '18:00', closed: false },
          tuesday: { open: '07:00', close: '18:00', closed: false },
          wednesday: { open: '07:00', close: '18:00', closed: false },
          thursday: { open: '07:00', close: '18:00', closed: false },
          friday: { open: '07:00', close: '18:00', closed: false },
          saturday: { open: '08:00', close: '13:00', closed: true },
          sunday: { open: '08:00', close: '13:00', closed: true },
        });
        setPricingModels(['monthly']);
        break;
        
      default:
        // Schools default
        setAcademicHourMinutes(50);
        setPricingModel('semester');
    }
  }, [institutionType]);
  
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      completeSetup();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const completeSetup = async () => {
    if (!institutionType || !terminology) return;
    
    setLoading(true);
    setError('');
    
    try {
      const settings: SchoolSettings = {
        institution_type: institutionType,
        age_group: ageGroup,
        language,
        location_count: locationCount,
        location_model: locationCount > 1 ? locationModel : undefined,
        locations: [{
          id: crypto.randomUUID(),
          name: primaryLocation.name || 'Main Location',
          address: institutionConfig?.requiredFields.address ? primaryLocation.address : undefined,
          is_primary: true,
        }],
        timezone,
        currency,
        academic_year_start: academicYearStart,
        academic_hour_minutes: academicHourMinutes,
        default_session_duration: defaultSessionDuration,
        terminology,
        meeting_platform: institutionConfig?.requiredFields.meetingLink ? meetingPlatform : undefined,
        default_meeting_link: defaultMeetingLink || undefined,
        payment_accounts: [{
          id: crypto.randomUUID(),
          name: paymentAccount.name || 'Default Account',
          type: paymentAccount.type,
          is_default: true,
        }],
        pricing_models: pricingModels,
        enabled_features: selectedFeatures,
        theme: {
          name: selectedTheme.name,
          primary: selectedTheme.primary,
          secondary: selectedTheme.secondary,
          font: 'modern',
        },
        operating_hours: institutionConfig?.requiredFields.operatingHours ? operatingHours : undefined,
      };
      
      // Update school settings
      const { error: updateError } = await supabase
        .from('schools')
        .update({ settings })
        .eq('id', schoolInfo?.id);
      
      if (updateError) throw updateError;
      
      // Navigate to dashboard with completion flag
      navigate('/dashboard?setup=complete');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Welcome to ClassBoom!</h1>
            <p className="opacity-90">
              {isIndividualProvider(institutionType)
                ? `Let's set up your ${terminology?.student || 'client'} management platform`
                : `Let's set up your ${terminology?.student || 'student'} management system`}
            </p>
          </div>
          
          <div className="p-6 relative">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step.id <= currentStep
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.id}
                    </motion.div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-2">
                        <div className="h-1 bg-gray-200 rounded">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: step.id < currentStep ? '100%' : '0%' }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-orange-500 rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentStep === 4 && isIndividualProvider(institutionType)
                    ? "Service Settings"
                    : steps[currentStep - 1].title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {currentStep === 2 && isIndividualProvider(institutionType)
                    ? "Let's set up your business profile"
                    : currentStep === 4 && isIndividualProvider(institutionType)
                    ? "Configure your service settings"
                    : currentStep === 5 && isIndividualProvider(institutionType)
                    ? "How do you collect payments?"
                    : steps[currentStep - 1].description}
                </p>
              </div>
            </div>
            
            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                {/* Step 1: Institution Type & Age Group */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Select your institution type:</h3>
                      <div className="space-y-4">
                        {INSTITUTION_CATEGORIES.map((category) => (
                          <div key={category.id}>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              {category.icon} {category.name}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {category.types.map((type) => (
                                <motion.button
                                  key={type.value}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setInstitutionType(type.value)}
                                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                                    institutionType === type.value
                                      ? 'border-orange-500 bg-orange-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="text-2xl mb-1">{type.icon}</div>
                                  <div className="text-sm font-medium">{type.label}</div>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Who do you primarily serve?</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAgeGroup('kids')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            ageGroup === 'kids'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">👶</div>
                          <div className="font-medium">Children</div>
                          <div className="text-sm text-gray-600">Under 18</div>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAgeGroup('adults')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            ageGroup === 'adults'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">👨‍🎓</div>
                          <div className="font-medium">Adults</div>
                          <div className="text-sm text-gray-600">18+</div>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAgeGroup('both')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            ageGroup === 'both'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">👥</div>
                          <div className="font-medium">Both</div>
                          <div className="text-sm text-gray-600">All ages</div>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Basic Configuration */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isIndividualProvider(institutionType) 
                          ? 'Your Business Name' 
                          : `Your ${schoolInfo?.name ? 'Location' : 'School'} Name`}
                      </label>
                      <input
                        type="text"
                        value={primaryLocation.name}
                        onChange={(e) => setPrimaryLocation(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder={
                          isIndividualProvider(institutionType)
                            ? `${user?.user_metadata?.first_name || 'Your'}'s ${terminology?.student || 'Student'} Hub`
                            : `${schoolInfo?.name || 'Main Campus'}`
                        }
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Language
                      </label>
                      <CustomSelect
                        value={language}
                        onChange={(value) => {
                          setLanguage(value);
                          // In a real app, this would trigger UI language change
                          // For now, we'll just show a message
                          if (value !== 'en') {
                            showToast(`Language switching to ${languages.find(l => l.code === value)?.name} will be available soon!`, 'info');
                          }
                        }}
                        options={languages.map(lang => ({ value: lang.code, label: lang.name }))}
                        placeholder="Select language"
                      />
                      <p className="text-xs text-gray-500 mt-1">Translation feature coming soon!</p>
                    </div>
                    
                    {institutionConfig?.features.multiLocation && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          How many locations do you have?
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                          {[1, '2-5', '6-10', '10+'].map((count) => (
                            <motion.button
                              key={count}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const newCount = count === 1 ? 1 : count === '2-5' ? 3 : count === '6-10' ? 8 : 15;
                                setLocationCount(newCount);
                              }}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                (count === 1 && locationCount === 1) ||
                                (count === '2-5' && locationCount >= 2 && locationCount <= 5) ||
                                (count === '6-10' && locationCount >= 6 && locationCount <= 10) ||
                                (count === '10+' && locationCount > 10)
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {count} {count === 1 ? 'location' : 'locations'}
                            </motion.button>
                          ))}
                        </div>
                        
                        {locationCount > 1 && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              How should locations be managed?
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                  type="radio"
                                  value="centralized"
                                  checked={locationModel === 'centralized'}
                                  onChange={(e) => setLocationModel(e.target.value as LocationModel)}
                                  className="mt-1 mr-3"
                                />
                                <div>
                                  <div className="font-medium">Centralized</div>
                                  <div className="text-sm text-gray-600">
                                    All data shared, single view across locations
                                  </div>
                                </div>
                              </label>
                              <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                  type="radio"
                                  value="federated"
                                  checked={locationModel === 'federated'}
                                  onChange={(e) => setLocationModel(e.target.value as LocationModel)}
                                  className="mt-1 mr-3"
                                />
                                <div>
                                  <div className="font-medium">Federated</div>
                                  <div className="text-sm text-gray-600">
                                    Shared {terminology?.students || 'students'}, separate operations
                                  </div>
                                </div>
                              </label>
                              <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                  type="radio"
                                  value="independent"
                                  checked={locationModel === 'independent'}
                                  onChange={(e) => setLocationModel(e.target.value as LocationModel)}
                                  className="mt-1 mr-3"
                                />
                                <div>
                                  <div className="font-medium">Independent</div>
                                  <div className="text-sm text-gray-600">
                                    Completely separate data and operations
                                  </div>
                                </div>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Step 3: Location & Regional */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {institutionConfig?.requiredFields.address && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          {isIndividualProvider(institutionType)
                            ? 'Your Business Address'
                            : 'Primary Location Address'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Street Address
                            </label>
                            <input
                              type="text"
                              value={primaryLocation.address.street}
                              onChange={(e) => setPrimaryLocation(prev => ({
                                ...prev,
                                address: { ...prev.address, street: e.target.value }
                              }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="123 Main Street"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              value={primaryLocation.address.city}
                              onChange={(e) => setPrimaryLocation(prev => ({
                                ...prev,
                                address: { ...prev.address, city: e.target.value }
                              }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State/Province
                            </label>
                            <input
                              type="text"
                              value={primaryLocation.address.state}
                              onChange={(e) => setPrimaryLocation(prev => ({
                                ...prev,
                                address: { ...prev.address, state: e.target.value }
                              }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              value={primaryLocation.address.postal_code}
                              onChange={(e) => setPrimaryLocation(prev => ({
                                ...prev,
                                address: { ...prev.address, postal_code: e.target.value }
                              }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Country
                            </label>
                            <input
                              type="text"
                              value={primaryLocation.address.country}
                              onChange={(e) => setPrimaryLocation(prev => ({
                                ...prev,
                                address: { ...prev.address, country: e.target.value }
                              }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {institutionConfig?.requiredFields.meetingLink && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Online Meeting Setup</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Default Meeting Platform
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {(['zoom', 'google_meet', 'teams', 'custom'] as MeetingPlatform[]).map((platform) => (
                              <motion.button
                                key={platform}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setMeetingPlatform(platform)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  meetingPlatform === platform
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {platform.split('_').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Default Meeting Link Template
                          </label>
                          <input
                            type="url"
                            value={defaultMeetingLink}
                            onChange={(e) => setDefaultMeetingLink(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder={
                              meetingPlatform === 'zoom' ? 'https://zoom.us/j/your-meeting-id' :
                              meetingPlatform === 'google_meet' ? 'https://meet.google.com/your-meeting-code' :
                              meetingPlatform === 'teams' ? 'https://teams.microsoft.com/l/meetup-join/...' :
                              'https://your-meeting-platform.com/...'
                            }
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {meetingPlatform === 'zoom' && 'Example: https://zoom.us/j/123456789'}
                            {meetingPlatform === 'google_meet' && 'Example: https://meet.google.com/abc-defg-hij'}
                            {meetingPlatform === 'teams' && 'Example: Teams meeting link'}
                            {meetingPlatform === 'custom' && 'Enter your custom meeting platform link'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Regional Settings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time Zone
                          </label>
                          <input
                            type="text"
                            value={timezone}
                            readOnly
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                          />
                          <p className="text-xs text-gray-500 mt-1">Auto-detected</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency
                          </label>
                          <CustomSelect
                            value={currency}
                            onChange={(value) => setCurrency(value as Currency)}
                            options={currencies.map(curr => ({ value: curr, label: curr }))}
                            placeholder="Select currency"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Academic Year Starts
                          </label>
                          <CustomSelect
                            value={academicYearStart.toString()}
                            onChange={(value) => setAcademicYearStart(parseInt(value))}
                            options={Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ({
                              value: month.toString(),
                              label: new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
                            }))}
                            placeholder="Select month"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Special message for individual providers */}
                    {isIndividualProvider(institutionType) && institutionConfig?.requiredFields.operatingHours && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-blue-700 text-sm">
                          <strong>Tip:</strong> Set your general availability below. You can always override these hours 
                          for specific {terminology?.students || 'clients'} or block out time for vacations and appointments.
                        </p>
                      </div>
                    )}
                    
                    {institutionConfig?.requiredFields.operatingHours && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          {isIndividualProvider(institutionType)
                            ? 'Your Availability Schedule'
                            : 'Operating Hours'}
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(operatingHours).map(([day, hours]) => (
                            <div key={day} className="flex items-center space-x-4">
                              <div className="w-24 font-medium capitalize">{day}</div>
                              <CustomCheckbox
                                checked={!hours.closed}
                                onChange={(checked) => setOperatingHours(prev => ({
                                  ...prev,
                                  [day]: { ...prev[day], closed: !checked }
                                }))}
                                label={isIndividualProvider(institutionType) ? "Available" : "Open"}
                              />
                              {!hours.closed && (
                                <>
                                  <TimeInput
                                    value={hours.open}
                                    onChange={(value) => setOperatingHours(prev => ({
                                      ...prev,
                                      [day]: { ...prev[day], open: value }
                                    }))}
                                  />
                                  <span>to</span>
                                  <TimeInput
                                    value={hours.close}
                                    onChange={(value) => setOperatingHours(prev => ({
                                      ...prev,
                                      [day]: { ...prev[day], close: value }
                                    }))}
                                  />
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Step 4: Academic Settings */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Academic Hour Duration
                      </label>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {[30, 45, 50, 60, 90].map((minutes) => (
                          <motion.button
                            key={minutes}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setAcademicHourMinutes(minutes)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              academicHourMinutes === minutes
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {minutes} min
                          </motion.button>
                        ))}
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="15"
                            max="180"
                            value={academicHourMinutes}
                            onChange={(e) => setAcademicHourMinutes(parseInt(e.target.value) || 50)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Custom duration (minutes)"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default {terminology?.class || 'Class'} Duration
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 1.5, 2].map((hours) => (
                          <motion.button
                            key={hours}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDefaultSessionDuration(hours)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              defaultSessionDuration === hours
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {hours} {hours === 1 ? 'hour' : 'hours'}
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        = {defaultSessionDuration * academicHourMinutes} minutes per {terminology?.class || 'class'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isIndividualProvider(institutionType)
                            ? `Maximum ${terminology?.students || 'Students'}`
                            : `${terminology?.student || 'Student'} Capacity`}
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder={
                            isIndividualProvider(institutionType)
                              ? "e.g., 30"
                              : "e.g., 500"
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isIndividualProvider(institutionType)
                            ? 'Assistant/Helper Count'
                            : `${terminology?.teacher || 'Teacher'} Count`}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder={
                            isIndividualProvider(institutionType)
                              ? "e.g., 0 (just you)"
                              : "e.g., 25"
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 5: Financial Setup */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Default Payment Account</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Name
                          </label>
                          <input
                            type="text"
                            value={paymentAccount.name}
                            onChange={(e) => setPaymentAccount(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Main Business Account"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Type
                          </label>
                          <div className="grid grid-cols-4 gap-3">
                            {(['bank', 'paypal', 'stripe', 'other'] as const).map((type) => (
                              <motion.button
                                key={type}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setPaymentAccount(prev => ({ ...prev, type }))}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  paymentAccount.type === type
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">How do you charge for your services?</h3>
                      <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'per_session', label: `Per ${terminology?.class || 'Session'}` },
                          { value: 'monthly', label: 'Monthly Subscription' },
                          { value: 'quarterly', label: 'Quarterly' },
                          { value: 'semester', label: 'Semester/Term' },
                          { value: 'annual', label: 'Annual' },
                          { value: 'package', label: 'Package/Bundle' },
                        ].map((model) => (
                          <motion.button
                            key={model.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (pricingModels.includes(model.value as PricingModel)) {
                                setPricingModels(pricingModels.filter(m => m !== model.value));
                              } else {
                                setPricingModels([...pricingModels, model.value as PricingModel]);
                              }
                            }}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              pricingModels.includes(model.value as PricingModel)
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              {pricingModels.includes(model.value as PricingModel) && (
                                <span className="mr-2 text-orange-600">✓</span>
                              )}
                              {model.label}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 6: Features */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Core Features (Always Enabled)</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 border-2 border-orange-500 bg-orange-50 rounded-lg">
                          <div className="font-medium">✓ {terminology?.student || 'Student'} Management</div>
                        </div>
                        <div className="p-4 border-2 border-orange-500 bg-orange-50 rounded-lg">
                          <div className="font-medium">✓ {terminology?.teacher || 'Teacher'} Management</div>
                        </div>
                        <div className="p-4 border-2 border-orange-500 bg-orange-50 rounded-lg">
                          <div className="font-medium">✓ {terminology?.class || 'Class'} Scheduling</div>
                        </div>
                        <div className="p-4 border-2 border-orange-500 bg-orange-50 rounded-lg">
                          <div className="font-medium">✓ Attendance Tracking</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Additional Features</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {institutionConfig?.features.grades && (
                          <div className="p-4 border-2 rounded-lg hover:bg-gray-50">
                            <CustomCheckbox
                              checked={selectedFeatures.includes('grades')}
                              onChange={() => toggleFeature('grades')}
                              label={`${terminology?.grade || 'Grade'} Management`}
                              className="font-medium"
                            />
                          </div>
                        )}
                        
                        {(institutionConfig?.features.parents || ageGroup === 'kids') && (
                          <div className="p-4 border-2 rounded-lg hover:bg-gray-50">
                            <CustomCheckbox
                              checked={selectedFeatures.includes('parent_portal')}
                              onChange={() => toggleFeature('parent_portal')}
                              label={`${terminology?.parent || 'Parent'} Portal`}
                              className="font-medium"
                            />
                          </div>
                        )}
                        
                        {institutionConfig?.features.transportation && (
                          <div className="p-4 border-2 rounded-lg hover:bg-gray-50">
                            <CustomCheckbox
                              checked={selectedFeatures.includes('transportation')}
                              onChange={() => toggleFeature('transportation')}
                              label="Transportation Management"
                              className="font-medium"
                            />
                          </div>
                        )}
                        
                        {institutionConfig?.features.equipment && (
                          <div className="p-4 border-2 rounded-lg hover:bg-gray-50">
                            <CustomCheckbox
                              checked={selectedFeatures.includes('equipment')}
                              onChange={() => toggleFeature('equipment')}
                              label="Equipment Tracking"
                              className="font-medium"
                            />
                          </div>
                        )}
                        
                        <div className="p-4 border-2 rounded-lg hover:bg-gray-50">
                          <CustomCheckbox
                            checked={selectedFeatures.includes('progress_reports')}
                            onChange={() => toggleFeature('progress_reports')}
                            label="Progress Reports"
                            className="font-medium"
                          />
                        </div>
                        
                        {institutionConfig?.features.certificates && (
                          <div className="p-4 border-2 rounded-lg hover:bg-gray-50">
                            <CustomCheckbox
                              checked={selectedFeatures.includes('certificates')}
                              onChange={() => toggleFeature('certificates')}
                              label="Certificates & Achievements"
                              className="font-medium"
                            />
                          </div>
                        )}
                        
                        <div className="p-4 border-2 rounded-lg hover:bg-gray-50">
                          <CustomCheckbox
                            checked={selectedFeatures.includes('waitlist')}
                            onChange={() => toggleFeature('waitlist')}
                            label="Waitlist Management"
                            className="font-medium"
                          />
                        </div>
                        
                        <div className="p-4 border-2 rounded-lg hover:bg-gray-50">
                          <CustomCheckbox
                            checked={selectedFeatures.includes('online_payments')}
                            onChange={() => toggleFeature('online_payments')}
                            label="Online Payments"
                            className="font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 7: Theme & Branding */}
                {currentStep === 7 && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Choose Your Theme</h3>
                      <div className="space-y-3">
                        {themes.map((theme) => (
                          <motion.button
                            key={theme.name}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedTheme(theme)}
                            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                              selectedTheme.name === theme.name
                                ? 'border-gray-800 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex space-x-1">
                              <div
                                className="w-8 h-8 rounded-full"
                                style={{ backgroundColor: theme.primary }}
                              />
                              <div
                                className="w-8 h-8 rounded-full"
                                style={{ backgroundColor: theme.secondary }}
                              />
                            </div>
                            <span className="font-medium">{theme.name}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Live Preview</h3>
                      <div 
                        className="border-2 border-gray-200 rounded-lg p-6 h-[400px] overflow-hidden"
                        style={{ backgroundColor: '#f9fafb' }}
                      >
                        <div className="mb-4">
                          <div 
                            className="h-12 rounded-lg flex items-center px-4 text-white font-semibold"
                            style={{ 
                              background: `linear-gradient(to right, ${selectedTheme.primary}, ${selectedTheme.secondary})` 
                            }}
                          >
                            {schoolInfo?.name || 'Your School'}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-medium mb-2">Welcome back, {user?.user_metadata?.first_name}!</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div 
                                className="p-3 rounded text-white text-center"
                                style={{ backgroundColor: selectedTheme.primary }}
                              >
                                {terminology?.students || 'Students'}
                              </div>
                              <div 
                                className="p-3 rounded text-white text-center"
                                style={{ backgroundColor: selectedTheme.secondary }}
                              >
                                {terminology?.classes || 'Classes'}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            className="w-full py-2 rounded-lg text-white font-medium"
                            style={{ backgroundColor: selectedTheme.primary }}
                          >
                            Add New {terminology?.student || 'Student'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={loading || (currentStep === 1 && !institutionType)}
                className="px-8 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : currentStep === steps.length ? 'Complete Setup' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}