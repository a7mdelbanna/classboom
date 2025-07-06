import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { CustomSelect } from '../../../components/CustomSelect';
import { CustomCheckbox } from '../../../components/CustomCheckbox';
import { useToast } from '../../../context/ToastContext';
import FinancialService from '../services/financialService';
import type { FinancialSettings, FinancialSettingsFormData, LateFeeType } from '../types/financial.types';

interface FinancialSettingsModalProps {
  settings: FinancialSettings;
  onClose: () => void;
  onSave: () => void;
}

export default function FinancialSettingsModal({
  settings,
  onClose,
  onSave
}: FinancialSettingsModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FinancialSettingsFormData>({
    tax_enabled: settings.tax_enabled,
    tax_rate: settings.tax_rate,
    tax_name: settings.tax_name,
    tax_number: settings.tax_number,
    payment_terms_days: settings.payment_terms_days,
    late_payment_fee_enabled: settings.late_payment_fee_enabled,
    late_payment_fee_type: settings.late_payment_fee_type,
    late_payment_fee_amount: settings.late_payment_fee_amount,
    invoice_prefix: settings.invoice_prefix,
    invoice_footer_text: settings.invoice_footer_text,
    refund_policy_text: settings.refund_policy_text,
    partial_refund_allowed: settings.partial_refund_allowed,
    refund_processing_days: settings.refund_processing_days
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate tax settings
    if (formData.tax_enabled && (!formData.tax_rate || formData.tax_rate <= 0)) {
      showToast('Please enter a valid tax rate', 'error');
      return;
    }

    // Validate late fee settings
    if (formData.late_payment_fee_enabled) {
      if (!formData.late_payment_fee_type || !formData.late_payment_fee_amount) {
        showToast('Please configure late payment fee settings', 'error');
        return;
      }
      if (formData.late_payment_fee_type === 'percentage' && formData.late_payment_fee_amount > 100) {
        showToast('Late fee percentage cannot exceed 100%', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      await FinancialService.updateFinancialSettings(formData);
      showToast('Financial settings updated successfully', 'success');
      onSave();
    } catch (error) {
      console.error('Error updating financial settings:', error);
      showToast(
        error instanceof Error ? error.message : 'Error updating financial settings',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const lateFeeTypeOptions: { value: LateFeeType; label: string }[] = [
    { value: 'fixed', label: 'Fixed Amount' },
    { value: 'percentage', label: 'Percentage' }
  ];

  const paymentTermsOptions = [
    { value: 0, label: 'Due Immediately' },
    { value: 7, label: 'Net 7 Days' },
    { value: 14, label: 'Net 14 Days' },
    { value: 30, label: 'Net 30 Days' },
    { value: 45, label: 'Net 45 Days' },
    { value: 60, label: 'Net 60 Days' },
    { value: 90, label: 'Net 90 Days' }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Financial Settings"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tax Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Tax Settings
          </h3>

          <CustomCheckbox
            id="tax_enabled"
            checked={formData.tax_enabled}
            onChange={(checked) => setFormData({ ...formData, tax_enabled: checked })}
            label="Enable tax calculation"
          />

          {formData.tax_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax Name
                </label>
                <input
                  type="text"
                  value={formData.tax_name || ''}
                  onChange={(e) => setFormData({ ...formData, tax_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="VAT, GST, Sales Tax, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tax_rate || ''}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="15.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax Registration Number
                </label>
                <input
                  type="text"
                  value={formData.tax_number || ''}
                  onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your tax registration number"
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Terms */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Payment Terms
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Due
            </label>
            <CustomSelect
              value={formData.payment_terms_days.toString()}
              onChange={(value) => setFormData({ ...formData, payment_terms_days: parseInt(value) })}
              options={paymentTermsOptions.map(opt => ({
                value: opt.value.toString(),
                label: opt.label
              }))}
            />
          </div>

          <CustomCheckbox
            id="late_payment_fee_enabled"
            checked={formData.late_payment_fee_enabled}
            onChange={(checked) => setFormData({ ...formData, late_payment_fee_enabled: checked })}
            label="Charge late payment fees"
          />

          {formData.late_payment_fee_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fee Type
                </label>
                <CustomSelect
                  value={formData.late_payment_fee_type || 'fixed'}
                  onChange={(value) => setFormData({ ...formData, late_payment_fee_type: value as LateFeeType })}
                  options={lateFeeTypeOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fee Amount {formData.late_payment_fee_type === 'percentage' ? '(%)' : ''}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.late_payment_fee_amount || ''}
                  onChange={(e) => setFormData({ ...formData, late_payment_fee_amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={formData.late_payment_fee_type === 'percentage' ? '5.00' : '25.00'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Invoice Settings */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Invoice Settings
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Invoice Prefix
            </label>
            <input
              type="text"
              value={formData.invoice_prefix}
              onChange={(e) => setFormData({ ...formData, invoice_prefix: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="INV"
              maxLength={20}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Invoice numbers will be formatted as {formData.invoice_prefix || 'INV'}-000001
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Invoice Footer Text
            </label>
            <textarea
              value={formData.invoice_footer_text || ''}
              onChange={(e) => setFormData({ ...formData, invoice_footer_text: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Thank you for your business! Payment terms and conditions..."
            />
          </div>
        </div>

        {/* Refund Policy */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Refund Policy
          </h3>

          <CustomCheckbox
            id="partial_refund_allowed"
            checked={formData.partial_refund_allowed}
            onChange={(checked) => setFormData({ ...formData, partial_refund_allowed: checked })}
            label="Allow partial refunds"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Refund Processing Time (days)
            </label>
            <input
              type="number"
              value={formData.refund_processing_days}
              onChange={(e) => setFormData({ ...formData, refund_processing_days: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="7"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Refund Policy Text
            </label>
            <textarea
              value={formData.refund_policy_text || ''}
              onChange={(e) => setFormData({ ...formData, refund_policy_text: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe your refund policy..."
            />
          </div>
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