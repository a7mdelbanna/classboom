import { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import { CustomSelect } from '../../../components/CustomSelect';
import { MultiSelect } from '../../../components/MultiSelect';
import { CustomCheckbox } from '../../../components/CustomCheckbox';
import { useToast } from '../../../context/ToastContext';
import FinancialService from '../services/financialService';
import type { SchoolCurrencySettings, SchoolCurrencySettingsFormData, Currency, CurrencyDisplay, RateUpdateFrequency } from '../types/financial.types';

interface CurrencySettingsModalProps {
  settings: SchoolCurrencySettings;
  currencies: Currency[];
  onClose: () => void;
  onSave: () => void;
}

export default function CurrencySettingsModal({
  settings,
  currencies,
  onClose,
  onSave
}: CurrencySettingsModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SchoolCurrencySettingsFormData>({
    base_currency: settings.base_currency,
    accepted_currencies: settings.accepted_currencies,
    currency_display: settings.currency_display,
    decimal_separator: settings.decimal_separator,
    thousand_separator: settings.thousand_separator,
    auto_update_rates: settings.auto_update_rates,
    rate_update_frequency: settings.rate_update_frequency
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.base_currency) {
      showToast('Please select a base currency', 'error');
      return;
    }

    if (formData.accepted_currencies.length === 0) {
      showToast('Please select at least one accepted currency', 'error');
      return;
    }

    // Ensure base currency is in accepted currencies
    if (!formData.accepted_currencies.includes(formData.base_currency)) {
      formData.accepted_currencies.push(formData.base_currency);
    }

    setLoading(true);
    try {
      await FinancialService.updateSchoolCurrencySettings(formData);
      showToast('Currency settings updated successfully', 'success');
      
      // Update exchange rates if auto-update is enabled
      if (formData.auto_update_rates) {
        const rateResult = await FinancialService.updateSchoolExchangeRates();
        if (rateResult.success) {
          showToast('Exchange rates updated', 'success');
        } else {
          showToast('Currency settings saved, but exchange rates could not be updated (this is normal in development)', 'warning');
        }
      }
      
      onSave();
    } catch (error) {
      console.error('Error updating currency settings:', error);
      showToast(
        error instanceof Error ? error.message : 'Error updating currency settings',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const displayOptions: { value: CurrencyDisplay; label: string }[] = [
    { value: 'symbol', label: 'Symbol only ($)' },
    { value: 'code', label: 'Code only (USD)' },
    { value: 'both', label: 'Both ($ USD)' }
  ];

  const frequencyOptions: { value: RateUpdateFrequency; label: string }[] = [
    { value: 'realtime', label: 'Real-time' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'manual', label: 'Manual only' }
  ];

  const separatorOptions = [
    { value: '.', label: 'Period (.)' },
    { value: ',', label: 'Comma (,)' }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Currency Settings"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Base Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Base Currency *
          </label>
          <CustomSelect
            value={formData.base_currency}
            onChange={(value) => setFormData({ ...formData, base_currency: value })}
            options={currencies.map(c => ({
              value: c.code,
              label: `${c.name} (${c.symbol})`
            }))}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your primary currency for financial reporting
          </p>
        </div>

        {/* Accepted Currencies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Accepted Currencies *
          </label>
          <MultiSelect
            value={formData.accepted_currencies}
            onChange={(values) => setFormData({ ...formData, accepted_currencies: values })}
            options={currencies.map(c => ({
              value: c.code,
              label: `${c.name} (${c.symbol})`
            }))}
            placeholder="Select currencies you accept"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Currencies you accept for payments
          </p>
        </div>

        {/* Display Settings */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Display Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency Display
              </label>
              <CustomSelect
                value={formData.currency_display}
                onChange={(value) => setFormData({ ...formData, currency_display: value as CurrencyDisplay })}
                options={displayOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Decimal Separator
              </label>
              <CustomSelect
                value={formData.decimal_separator}
                onChange={(value) => setFormData({ ...formData, decimal_separator: value })}
                options={separatorOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thousand Separator
              </label>
              <CustomSelect
                value={formData.thousand_separator}
                onChange={(value) => setFormData({ ...formData, thousand_separator: value })}
                options={separatorOptions.reverse()}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formData.currency_display === 'symbol' && '$'}
              {formData.thousand_separator === ',' ? '1,234' : '1.234'}
              {formData.decimal_separator}56
              {formData.currency_display === 'code' && ' USD'}
              {formData.currency_display === 'both' && ' USD'}
            </p>
          </div>
        </div>

        {/* Exchange Rate Settings */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Exchange Rate Settings
          </h3>

          <CustomCheckbox
            id="auto_update_rates"
            checked={formData.auto_update_rates}
            onChange={(checked) => setFormData({ ...formData, auto_update_rates: checked })}
            label="Automatically update exchange rates"
          />

          {formData.auto_update_rates && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Update Frequency
              </label>
              <CustomSelect
                value={formData.rate_update_frequency}
                onChange={(value) => setFormData({ ...formData, rate_update_frequency: value as RateUpdateFrequency })}
                options={frequencyOptions}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                How often to fetch latest exchange rates from Frankfurter API
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </Modal>
  );
}