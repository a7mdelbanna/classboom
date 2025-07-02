import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

const steps: WizardStep[] = [
  {
    id: 1,
    title: 'School Information',
    description: 'Tell us about your educational institution'
  },
  {
    id: 2,
    title: 'School Type',
    description: 'What kind of school are you running?'
  },
  {
    id: 3,
    title: 'Size & Capacity',
    description: 'Help us understand your needs'
  },
  {
    id: 4,
    title: 'Choose Your Theme',
    description: 'Personalize your ClassBoom experience'
  }
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
  { name: 'Classic', primary: '#FF6B35', secondary: '#4169E1' }
];

export function TrialWizard() {
  const navigate = useNavigate();
  const { } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    website: '',
    schoolType: '',
    numberOfStudents: '',
    numberOfTeachers: '',
    theme: 'Classic'
  });

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
    navigate('/dashboard');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Welcome to ClassBoom!</h1>
            <p className="opacity-90">Let's set up your school in just a few steps</p>
          </div>

          <div className="p-6">
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
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {steps[currentStep - 1].description}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateFormData('address', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="123 Education Street, City, State 12345"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateFormData('phone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website (optional)
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => updateFormData('website', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="www.yourschool.edu"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      'Elementary School',
                      'Middle School',
                      'High School',
                      'K-12 School',
                      'University',
                      'Language School',
                      'Music School',
                      'Art School',
                      'Sports Academy',
                      'Tutoring Center',
                      'Online School',
                      'Other'
                    ].map((type) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateFormData('schoolType', type)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.schoolType === type
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Students
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['1-50', '51-200', '201-500', '501-1000', '1000+'].map((range) => (
                          <motion.button
                            key={range}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateFormData('numberOfStudents', range)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              formData.numberOfStudents === range
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {range}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Teachers/Staff
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['1-5', '6-20', '21-50', '51-100', '100+'].map((range) => (
                          <motion.button
                            key={range}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateFormData('numberOfTeachers', range)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              formData.numberOfTeachers === range
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {range}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Choose a color theme that represents your school's personality
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {themes.map((theme) => (
                        <motion.button
                          key={theme.name}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateFormData('theme', theme.name)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.theme === theme.name
                              ? 'border-gray-800 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
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
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

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
                className="px-8 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {currentStep === steps.length ? 'Complete Setup' : 'Next'}
              </button>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-gray-600"
        >
          <p>Need help? Contact us at support@classboom.com</p>
        </motion.div>
      </motion.div>
    </div>
  );
}