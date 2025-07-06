import { motion } from 'framer-motion';
import { 
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlinePrinter,
  HiOutlineTrash
} from 'react-icons/hi';
import type { Payroll } from '../types/payroll.types';

interface PayrollCardProps {
  payroll: Payroll;
  onClick: () => void;
  onApprove?: () => void;
  onMarkAsPaid?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
}

export function PayrollCard({ 
  payroll, 
  onClick, 
  onApprove,
  onMarkAsPaid,
  onDelete,
  onPrint
}: PayrollCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: payroll.currency
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = () => {
    switch (payroll.payment_status) {
      case 'pending':
        return {
          icon: HiOutlineClock,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          label: 'Pending'
        };
      case 'approved':
        return {
          icon: HiOutlineCheckCircle,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          label: 'Approved'
        };
      case 'processing':
        return {
          icon: HiOutlineClock,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/20',
          label: 'Processing'
        };
      case 'paid':
        return {
          icon: HiOutlineCheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          label: 'Paid'
        };
      case 'cancelled':
        return {
          icon: HiOutlineXCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          label: 'Cancelled'
        };
      default:
        return {
          icon: HiOutlineClock,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {payroll.staff?.first_name} {payroll.staff?.last_name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {payroll.staff?.staff_code} • {payroll.staff?.role}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${statusConfig.bgColor}`}>
            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
            <span className={`text-sm font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Period */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <HiOutlineCalendar className="w-4 h-4" />
          <span>
            {formatDate(payroll.period_start)} - {formatDate(payroll.period_end)}
          </span>
        </div>

        {/* Amount Details */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Base</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(payroll.base_amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gross</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(payroll.gross_amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Net</p>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(payroll.net_amount)}
            </p>
          </div>
        </div>

        {/* Work Details */}
        {(payroll.hours_worked || payroll.sessions_taught) && (
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            {payroll.hours_worked && (
              <span>{payroll.hours_worked} hours</span>
            )}
            {payroll.sessions_taught && (
              <span>{payroll.sessions_taught} sessions</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HiOutlineEye className="w-4 h-4" />
            View
          </button>

          {payroll.payment_status === 'pending' && onApprove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprove();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
              Approve
            </button>
          )}

          {payroll.payment_status === 'approved' && onMarkAsPaid && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsPaid();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <HiOutlineCurrencyDollar className="w-4 h-4" />
              Mark as Paid
            </button>
          )}

          {onPrint && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrint();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <HiOutlinePrinter className="w-4 h-4" />
            </button>
          )}

          {payroll.payment_status === 'pending' && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}