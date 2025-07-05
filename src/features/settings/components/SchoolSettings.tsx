import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { supabase } from '../../../lib/supabase';
import { CustomCheckbox } from '../../../components/CustomCheckbox';
import type { PricingModel, SchoolSettings } from '../../../types/institution.types';
import { HiOutlineCurrencyDollar, HiOutlineInformationCircle } from 'react-icons/hi';

const PRICING_MODELS: Array<{ value: PricingModel; label: string; description: string }> = [
  { 
    value: 'per_session', 
    label: 'Per Session', 
    description: 'Charge for each individual class or session'
  },
  { 
    value: 'monthly', 
    label: 'Monthly Subscription', 
    description: 'Fixed monthly fee for unlimited or specified classes'
  },
  { 
    value: 'quarterly', 
    label: 'Quarterly', 
    description: 'Three-month subscription periods'
  },
  { 
    value: 'semester', 
    label: 'Semester/Term', 
    description: 'Academic term-based pricing (typically 4-6 months)'
  },
  { 
    value: 'annual', 
    label: 'Annual', 
    description: 'Yearly subscription with potential discounts'
  },
  { 
    value: 'package', 
    label: 'Package/Bundle', 
    description: 'Pre-paid packages (e.g., 10 sessions, 20 sessions)'
  },
];

export function SchoolSettings() {
  const { schoolInfo } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedModels, setSelectedModels] = useState<PricingModel[]>([]);

  useEffect(() => {
    // Load current pricing models from school settings
    if (schoolInfo?.settings?.pricing_models) {
      setSelectedModels(schoolInfo.settings.pricing_models);
    } else {
      // Default to all models if none are set
      setSelectedModels(['per_session', 'monthly', 'quarterly', 'semester', 'annual', 'package']);
    }
  }, [schoolInfo]);

  const handlePricingModelToggle = (model: PricingModel) => {
    setSelectedModels(prev => {
      if (prev.includes(model)) {
        // Don't allow removing all pricing models
        if (prev.length === 1) {
          showToast('You must have at least one pricing model enabled', 'error');
          return prev;
        }
        return prev.filter(m => m !== model);
      } else {
        return [...prev, model];
      }
    });
  };

  const handleSave = async () => {
    if (!schoolInfo?.id) return;

    try {
      setLoading(true);

      // Get current settings
      const { data: school } = await supabase
        .from('schools')
        .select('settings')
        .eq('id', schoolInfo.id)
        .single();

      const currentSettings = school?.settings || {};

      // Update with new pricing models
      const updatedSettings: SchoolSettings = {
        ...currentSettings,
        pricing_models: selectedModels
      };

      // Save to database
      const { error } = await supabase
        .from('schools')
        .update({ settings: updatedSettings })
        .eq('id', schoolInfo.id);

      if (error) throw error;

      showToast('Pricing models updated successfully', 'success');
      
      // Refresh the page to reload school info
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating pricing models:', error);
      showToast(error.message || 'Failed to update pricing models', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Pricing Models Section */}
      <div>
        <div className="flex items-center mb-4">
          <HiOutlineCurrencyDollar className="w-6 h-6 text-orange-500 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Pricing Models
          </h3>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Select the pricing models you want to offer. These will appear as options when creating enrollments.
              You must have at least one pricing model enabled.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRICING_MODELS.map((model) => (
            <motion.div
              key={model.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedModels.includes(model.value)
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handlePricingModelToggle(model.value)}
            >
              <div className="flex items-start">
                <CustomCheckbox
                  id={`pricing-${model.value}`}
                  checked={selectedModels.includes(model.value)}
                  onChange={() => handlePricingModelToggle(model.value)}
                  className="mt-1"
                />
                <div className="ml-3">
                  <label htmlFor={`pricing-${model.value}`} className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    {model.label}
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {model.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || selectedModels.length === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              loading || selectedModels.length === 0
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* More school settings sections can be added here */}
    </div>
  );
}