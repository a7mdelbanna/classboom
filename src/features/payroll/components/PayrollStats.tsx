import { motion } from 'framer-motion';
import { 
  HiOutlineCurrencyDollar, 
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import type { PayrollSummary } from '../types/payroll.types';

interface PayrollStatsProps {
  summary: PayrollSummary;
  isLoading?: boolean;
}

export function PayrollStats({ summary, isLoading }: PayrollStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: summary.currency
    }).format(amount);
  };

  const stats = [
    {
      id: 'total',
      label: 'Total Payroll',
      value: formatCurrency(summary.total_amount),
      icon: HiOutlineCurrencyDollar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'pending',
      label: 'Pending Approval',
      value: summary.by_status.pending,
      icon: HiOutlineClock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'approved',
      label: 'Approved',
      value: summary.by_status.approved,
      icon: HiOutlineClipboardCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'paid',
      label: 'Paid',
      value: summary.by_status.paid,
      icon: HiOutlineCheckCircle,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              {isLoading && (
                <div className="animate-pulse">
                  <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
              )}
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
              ) : (
                stat.value
              )}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
          
          {/* Gradient decoration */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
        </motion.div>
      ))}
    </div>
  );
}