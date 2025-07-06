import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';
import { PayrollService } from '../services/payrollService';
import type { Payroll } from '../types/payroll.types';
import { 
  HiOutlineArrowLeft,
  HiOutlinePrinter,
  HiOutlineDownload,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineCheckCircle
} from 'react-icons/hi';

export function PayrollDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPayrollDetail();
    }
  }, [id]);

  const loadPayrollDetail = async () => {
    setIsLoading(true);
    try {
      const record = await PayrollService.getPayrollRecord(id!);
      if (record) {
        setPayroll(record);
      } else {
        showToast('Payroll record not found', 'error');
        navigate('/payroll');
      }
    } catch (error) {
      console.error('Error loading payroll detail:', error);
      showToast('Failed to load payroll details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!payroll) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: payroll.currency
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = () => {
    if (!payroll) return null;
    
    switch (payroll.payment_status) {
      case 'pending':
        return {
          icon: HiOutlineClock,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          label: 'Pending Approval'
        };
      case 'approved':
        return {
          icon: HiOutlineCheckCircle,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          label: 'Approved'
        };
      case 'paid':
        return {
          icon: HiOutlineCheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          label: 'Paid'
        };
      default:
        return {
          icon: HiOutlineClock,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          label: payroll.payment_status
        };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    showToast('Export feature coming soon', 'info');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!payroll) {
    return null;
  }

  const statusConfig = getStatusConfig();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/payroll')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back to Payroll
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Print"
            >
              <HiOutlinePrinter className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Export"
            >
              <HiOutlineDownload className="w-5 h-5" />
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Payroll Details
        </h1>
        {statusConfig && (
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
            <statusConfig.icon className={`w-4 h-4 ${statusConfig.color}`} />
            <span className={`text-sm font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Staff & Period Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Staff Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <HiOutlineUser className="w-5 h-5 text-orange-500" />
              Staff Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {payroll.staff?.first_name} {payroll.staff?.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Staff Code</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {payroll.staff?.staff_code}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {payroll.staff?.role}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {payroll.staff?.department || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Employment Type</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {payroll.staff?.employment_type?.replace('_', ' ') || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Compensation Model</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {payroll.staff?.compensation_model?.replace('_', ' ') || 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Period & Work Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <HiOutlineCalendar className="w-5 h-5 text-orange-500" />
              Period & Work Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Period Start</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(payroll.period_start)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Period End</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(payroll.period_end)}
                </p>
              </div>
              {payroll.hours_worked && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hours Worked</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payroll.hours_worked} hours
                  </p>
                </div>
              )}
              {payroll.sessions_taught && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sessions Taught</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payroll.sessions_taught} sessions
                  </p>
                </div>
              )}
              {payroll.overtime_hours && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overtime Hours</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payroll.overtime_hours} hours
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Payment Details */}
        <div className="space-y-6">
          {/* Compensation Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <HiOutlineCurrencyDollar className="w-5 h-5 text-orange-500" />
              Compensation Breakdown
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Base Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(payroll.base_amount)}
                </span>
              </div>
              {payroll.overtime_amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Overtime</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(payroll.overtime_amount)}
                  </span>
                </div>
              )}
              {payroll.bonuses && payroll.bonuses.length > 0 && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bonuses</p>
                    {payroll.bonuses.map((bonus, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{bonus.description || bonus.type}</span>
                        <span className="text-green-600 dark:text-green-400">
                          +{formatCurrency(bonus.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {payroll.deductions && payroll.deductions.length > 0 && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deductions</p>
                    {payroll.deductions.map((deduction, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{deduction.description || deduction.type}</span>
                        <span className="text-red-600 dark:text-red-400">
                          -{formatCurrency(deduction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gross Amount</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(payroll.gross_amount)}
                  </span>
                </div>
              </div>
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Net Amount</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(payroll.net_amount)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Workflow Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <HiOutlineBriefcase className="w-5 h-5 text-orange-500" />
              Workflow Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Submitted</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDateTime(payroll.submitted_at)}
                </p>
              </div>
              {payroll.approved_at && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Approved</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(payroll.approved_at)}
                  </p>
                </div>
              )}
              {payroll.paid_at && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Paid</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(payroll.paid_at)}
                  </p>
                </div>
              )}
              {payroll.payment_method && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Payment Method</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {payroll.payment_method.replace('_', ' ')}
                  </p>
                </div>
              )}
              {payroll.payment_reference && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Reference</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payroll.payment_reference}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Notes */}
      {payroll.notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Notes
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {payroll.notes}
          </p>
        </motion.div>
      )}
    </div>
  );
}