import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../../../components/Modal';
import { CustomSelect } from '../../../components/CustomSelect';
import { CustomCheckbox } from '../../../components/CustomCheckbox';
import { useToast } from '../../../context/ToastContext';
import FinancialService from '../services/financialService';
import type { PaymentAccount, PaymentAccountFormData, Currency, AccountType } from '../types/financial.types';

interface PaymentAccountModalProps {
  account: PaymentAccount | null;
  currencies: Currency[];
  onClose: () => void;
  onSave: () => void;
}

export default function PaymentAccountModal({
  account,
  currencies,
  onClose,
  onSave
}: PaymentAccountModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PaymentAccountFormData>({
    account_name: '',
    account_type: 'bank',
    currency: 'USD',
    is_default: false,
    is_active: true
  });

  useEffect(() => {
    if (account) {
      setFormData({
        account_name: account.account_name,
        account_type: account.account_type,
        account_number: account.account_number || undefined,
        bank_name: account.bank_name || undefined,
        swift_code: account.swift_code || undefined,
        iban: account.iban || undefined,
        routing_number: account.routing_number || undefined,
        currency: account.currency,
        is_default: account.is_default,
        is_active: account.is_active,
        stripe_account_id: account.stripe_account_id || undefined,
        paypal_email: account.paypal_email || undefined,
        description: account.description || undefined,
        notes: account.notes || undefined
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_name) {
      showToast('Please enter an account name', 'error');
      return;
    }

    // Validate required fields based on account type
    if (formData.account_type === 'bank') {
      if (!formData.bank_name || !formData.account_number) {
        showToast('Bank name and account number are required for bank accounts', 'error');
        return;
      }
    } else if (formData.account_type === 'stripe' && !formData.stripe_account_id) {
      showToast('Stripe account ID is required for Stripe accounts', 'error');
      return;
    } else if (formData.account_type === 'paypal' && !formData.paypal_email) {
      showToast('PayPal email is required for PayPal accounts', 'error');
      return;
    }

    setLoading(true);
    try {
      if (account) {
        await FinancialService.updatePaymentAccount(account.id, formData);
        showToast('Payment account updated successfully', 'success');
      } else {
        await FinancialService.createPaymentAccount(formData);
        showToast('Payment account created successfully', 'success');
      }
      onSave();
    } catch (error) {
      console.error('Error saving payment account:', error);
      showToast(
        error instanceof Error ? error.message : 'Error saving payment account',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const accountTypes: { value: AccountType; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Account' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'other', label: 'Other' }
  ];

  const renderAccountFields = () => {
    switch (formData.account_type) {
      case 'bank':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.bank_name || ''}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter bank name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={formData.account_number || ''}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter account number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SWIFT Code
                </label>
                <input
                  type="text"
                  value={formData.swift_code || ''}
                  onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="SWIFT/BIC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IBAN
                </label>
                <input
                  type="text"
                  value={formData.iban || ''}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="International Bank Account Number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={formData.routing_number || ''}
                  onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ABA/ACH routing"
                />
              </div>
            </div>
          </>
        );

      case 'stripe':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stripe Account ID *
            </label>
            <input
              type="text"
              value={formData.stripe_account_id || ''}
              onChange={(e) => setFormData({ ...formData, stripe_account_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="acct_1234567890"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your Stripe Connect account ID
            </p>
          </div>
        );

      case 'paypal':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PayPal Email *
            </label>
            <input
              type="email"
              value={formData.paypal_email || ''}
              onChange={(e) => setFormData({ ...formData, paypal_email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="your@email.com"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Email associated with your PayPal business account
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={account ? 'Edit Payment Account' : 'Add Payment Account'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Main Business Account"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Type *
              </label>
              <CustomSelect
                value={formData.account_type}
                onChange={(value) => setFormData({ ...formData, account_type: value as AccountType })}
                options={accountTypes}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency *
            </label>
            <CustomSelect
              value={formData.currency}
              onChange={(value) => setFormData({ ...formData, currency: value })}
              options={currencies.map(c => ({
                value: c.code,
                label: `${c.name} (${c.symbol})`
              }))}
            />
          </div>
        </div>

        {/* Account Type Specific Fields */}
        {renderAccountFields()}

        {/* Additional Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Brief description of this account"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Additional notes or information"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
          <CustomCheckbox
            id="is_default"
            checked={formData.is_default}
            onChange={(checked) => setFormData({ ...formData, is_default: checked })}
            label="Set as default for this currency"
          />
          
          <CustomCheckbox
            id="is_active"
            checked={formData.is_active}
            onChange={(checked) => setFormData({ ...formData, is_active: checked })}
            label="Account is active"
          />
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
            {loading ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}