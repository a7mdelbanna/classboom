import { motion } from 'framer-motion';
import { 
  HiOutlineCurrencyDollar,
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineLibrary
} from 'react-icons/hi';
import type { FinancialSummary, SchoolCurrencySettings } from '../types/financial.types';
import FinancialService from '../services/financialService';

interface FinancialStatsProps {
  summary: FinancialSummary;
  currencySettings: SchoolCurrencySettings | null;
}

export default function FinancialStats({ summary, currencySettings }: FinancialStatsProps) {
  const stats = [
    {
      name: 'Total Revenue',
      value: FinancialService.formatCurrency(
        summary.total_revenue,
        summary.base_currency,
        currencySettings || undefined
      ),
      icon: HiOutlineCurrencyDollar,
      color: 'green',
      subtitle: `in ${summary.base_currency}`
    },
    {
      name: 'Payment Accounts',
      value: summary.total_accounts.toString(),
      icon: HiOutlineCreditCard,
      color: 'blue',
      subtitle: `${summary.active_currencies.length} currencies`
    },
    {
      name: 'Bank Accounts',
      value: summary.accounts_by_type.bank.toString(),
      icon: HiOutlineLibrary,
      color: 'purple',
      subtitle: 'Connected banks'
    },
    {
      name: 'Digital Wallets',
      value: (summary.accounts_by_type.stripe + summary.accounts_by_type.paypal).toString(),
      icon: HiOutlineCash,
      color: 'orange',
      subtitle: 'Stripe & PayPal'
    }
  ];

  const colorClasses = {
    green: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-600 dark:text-green-400'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-600 dark:text-blue-400'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      text: 'text-purple-600 dark:text-purple-400'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      text: 'text-orange-600 dark:text-orange-400'
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const colors = colorClasses[stat.color as keyof typeof colorClasses];
        
        return (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {stat.subtitle}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${colors.bg}`}>
                <stat.icon className={`h-6 w-6 ${colors.icon}`} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}