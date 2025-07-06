import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineCurrencyDollar,
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineCog,
  HiOutlinePlus,
  HiOutlineSwitchHorizontal,
  HiOutlineChartBar
} from 'react-icons/hi';
import { useToast } from '../../../context/ToastContext';
import FinancialService from '../services/financialService';
import type { PaymentAccount, Currency, SchoolCurrencySettings, FinancialSettings, FinancialSummary } from '../types/financial.types';
import PaymentAccountList from '../components/PaymentAccountList';
import PaymentAccountModal from '../components/PaymentAccountModal';
import CurrencySettingsModal from '../components/CurrencySettingsModal';
import FinancialSettingsModal from '../components/FinancialSettingsModal';
import FinancialStats from '../components/FinancialStats';

export default function FinancialManagement() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currencySettings, setCurrencySettings] = useState<SchoolCurrencySettings | null>(null);
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  
  // Modal states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'accounts' | 'settings'>('accounts');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        accountsData,
        currenciesData,
        currencySettingsData,
        financialSettingsData,
        summaryData
      ] = await Promise.all([
        FinancialService.getPaymentAccounts(),
        FinancialService.getCurrencies(),
        FinancialService.getSchoolCurrencySettings(),
        FinancialService.getFinancialSettings(),
        FinancialService.getFinancialSummary()
      ]);

      setAccounts(accountsData);
      setCurrencies(currenciesData);
      setCurrencySettings(currencySettingsData);
      setFinancialSettings(financialSettingsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading financial data:', error);
      showToast('Error loading financial data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleUpdateRates = async () => {
    try {
      const result = await FinancialService.updateSchoolExchangeRates();
      if (result.success) {
        showToast('Exchange rates updated successfully', 'success');
      } else {
        showToast('Could not update exchange rates (this is normal in development due to CORS)', 'warning');
      }
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      showToast('Error updating exchange rates', 'error');
    }
  };

  const handleEditAccount = (account: PaymentAccount) => {
    setSelectedAccount(account);
    setShowAccountModal(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this payment account?')) return;
    
    try {
      await FinancialService.deletePaymentAccount(accountId);
      showToast('Payment account deleted successfully', 'success');
      await loadData();
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast('Error deleting payment account', 'error');
    }
  };

  const handleAccountSaved = async () => {
    setShowAccountModal(false);
    setSelectedAccount(null);
    await loadData();
  };

  const handleCurrencySettingsSaved = async () => {
    setShowCurrencyModal(false);
    await loadData();
  };

  const handleFinancialSettingsSaved = async () => {
    setShowFinancialModal(false);
    await loadData();
  };

  const tabs = [
    { id: 'accounts', label: 'Payment Accounts', icon: HiOutlineCreditCard },
    { id: 'settings', label: 'Settings', icon: HiOutlineCog }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage payment accounts, currencies, and financial settings
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <HiOutlineSwitchHorizontal className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Statistics */}
      {summary && <FinancialStats summary={summary} currencySettings={currencySettings} />}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <tab.icon className={`
                -ml-0.5 mr-2 h-5 w-5
                ${activeTab === tab.id
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-gray-400 group-hover:text-gray-500'
                }
              `} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'accounts' ? (
          <div className="space-y-6">
            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAccountModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <HiOutlinePlus className="-ml-1 mr-2 h-5 w-5" />
                Add Payment Account
              </button>
            </div>

            {/* Accounts List */}
            <PaymentAccountList
              accounts={accounts}
              currencies={currencies}
              onEdit={handleEditAccount}
              onDelete={handleDeleteAccount}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Settings Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Currency Settings Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer"
                onClick={() => setShowCurrencyModal(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <HiOutlineCurrencyDollar className="h-8 w-8 text-orange-500" />
                    <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
                      Currency Settings
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Click to edit
                  </span>
                </div>
                {currencySettings && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Base Currency:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {currencySettings.base_currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Accepted Currencies:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {currencySettings.accepted_currencies.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Auto Update Rates:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {currencySettings.auto_update_rates ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Financial Settings Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer"
                onClick={() => setShowFinancialModal(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <HiOutlineCash className="h-8 w-8 text-orange-500" />
                    <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
                      Financial Settings
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Click to edit
                  </span>
                </div>
                {financialSettings && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Tax Enabled:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {financialSettings.tax_enabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Payment Terms:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {financialSettings.payment_terms_days} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Invoice Prefix:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {financialSettings.invoice_prefix}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Exchange Rates Update */}
            {currencySettings?.auto_update_rates && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HiOutlineSwitchHorizontal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Exchange Rate Updates
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Rates are updated {currencySettings.rate_update_frequency}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleUpdateRates}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Update Now
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {showAccountModal && (
        <PaymentAccountModal
          account={selectedAccount}
          currencies={currencies}
          onClose={() => {
            setShowAccountModal(false);
            setSelectedAccount(null);
          }}
          onSave={handleAccountSaved}
        />
      )}

      {showCurrencyModal && currencySettings && (
        <CurrencySettingsModal
          settings={currencySettings}
          currencies={currencies}
          onClose={() => setShowCurrencyModal(false)}
          onSave={handleCurrencySettingsSaved}
        />
      )}

      {showFinancialModal && financialSettings && (
        <FinancialSettingsModal
          settings={financialSettings}
          onClose={() => setShowFinancialModal(false)}
          onSave={handleFinancialSettingsSaved}
        />
      )}
    </div>
  );
}