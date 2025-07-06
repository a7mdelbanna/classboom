import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';
import { PayrollService } from '../services/payrollService';
import { PayrollStats } from '../components/PayrollStats';
import { PayrollFilters } from '../components/PayrollFilters';
import { PayrollCard } from '../components/PayrollCard';
import { GeneratePayrollModal } from '../components/GeneratePayrollModal';
import { Modal } from '../../../components/Modal';
import type { Payroll, PayrollFilters as PayrollFiltersType, PayrollSummary } from '../types/payroll.types';
import { 
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineDownload,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar
} from 'react-icons/hi';

export function PayrollManagement() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [payrollRecords, setPayrollRecords] = useState<Payroll[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Payroll[]>([]);
  const [summary, setSummary] = useState<PayrollSummary>({
    total_records: 0,
    total_amount: 0,
    by_status: {
      pending: 0,
      approved: 0,
      processing: 0,
      paid: 0,
      cancelled: 0
    },
    by_department: {},
    average_amount: 0,
    currency: 'USD'
  });
  const [filters, setFilters] = useState<PayrollFiltersType>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [staffOptions, setStaffOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    loadPayrollData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payrollRecords, filters]);

  const loadPayrollData = async () => {
    setIsLoading(true);
    try {
      const [records, summaryData] = await Promise.all([
        PayrollService.getPayrollRecords(),
        PayrollService.getPayrollSummary()
      ]);
      
      setPayrollRecords(records);
      setSummary(summaryData);
      
      // Create staff options for filter
      const uniqueStaff = Array.from(
        new Map(
          records
            .filter(r => r.staff)
            .map(r => [r.staff!.id, r.staff!])
        ).values()
      );
      
      setStaffOptions(
        uniqueStaff.map(staff => ({
          value: staff.id,
          label: `${staff.first_name} ${staff.last_name} (${staff.staff_code})`
        }))
      );
    } catch (error) {
      console.error('Error loading payroll data:', error);
      showToast('Failed to load payroll data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payrollRecords];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(record =>
        record.staff?.first_name.toLowerCase().includes(searchLower) ||
        record.staff?.last_name.toLowerCase().includes(searchLower) ||
        record.staff?.staff_code.toLowerCase().includes(searchLower)
      );
    }

    if (filters.staff_id) {
      filtered = filtered.filter(record => record.staff_id === filters.staff_id);
    }

    if (filters.status) {
      filtered = filtered.filter(record => record.payment_status === filters.status);
    }

    if (filters.period_start) {
      filtered = filtered.filter(record => 
        new Date(record.period_start) >= new Date(filters.period_start!)
      );
    }

    if (filters.period_end) {
      filtered = filtered.filter(record => 
        new Date(record.period_end) <= new Date(filters.period_end!)
      );
    }

    setFilteredRecords(filtered);
  };

  const handleApprove = async (payroll: Payroll) => {
    try {
      await PayrollService.updatePayrollStatus(payroll.id, 'approved');
      showToast('Payroll approved successfully', 'success');
      loadPayrollData();
    } catch (error) {
      console.error('Error approving payroll:', error);
      showToast('Failed to approve payroll', 'error');
    }
  };

  const handleMarkAsPaid = async (payroll: Payroll) => {
    try {
      await PayrollService.updatePayrollStatus(payroll.id, 'paid', {
        payment_date: new Date().toISOString(),
        payment_method: 'bank_transfer' // This should be configurable
      });
      showToast('Payroll marked as paid', 'success');
      loadPayrollData();
    } catch (error) {
      console.error('Error marking payroll as paid:', error);
      showToast('Failed to update payroll status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedPayroll) return;

    try {
      await PayrollService.deletePayroll(selectedPayroll.id);
      showToast('Payroll record deleted', 'success');
      setShowDeleteModal(false);
      setSelectedPayroll(null);
      loadPayrollData();
    } catch (error) {
      console.error('Error deleting payroll:', error);
      showToast('Failed to delete payroll', 'error');
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    showToast('Export feature coming soon', 'info');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Payroll Management
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={loadPayrollData}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <HiOutlineRefresh className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Export"
            >
              <HiOutlineDownload className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              <HiOutlinePlus className="w-5 h-5" />
              Generate Payroll
            </button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage staff compensation, approve payments, and track payroll history
        </p>
      </motion.div>

      {/* Stats */}
      <PayrollStats summary={summary} isLoading={isLoading} />

      {/* Filters */}
      <PayrollFilters
        filters={filters}
        onFiltersChange={setFilters}
        staffOptions={staffOptions}
      />

      {/* Payroll Records */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <HiOutlineCurrencyDollar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Payroll Records Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {Object.keys(filters).length > 0
                ? 'Try adjusting your filters'
                : 'Generate your first payroll to get started'}
            </p>
            {Object.keys(filters).length === 0 && (
              <button
                onClick={() => setShowGenerateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              >
                <HiOutlinePlus className="w-5 h-5" />
                Generate First Payroll
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((payroll, index) => (
              <motion.div
                key={payroll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PayrollCard
                  payroll={payroll}
                  onClick={() => navigate(`/payroll/${payroll.id}`)}
                  onApprove={() => handleApprove(payroll)}
                  onMarkAsPaid={() => handleMarkAsPaid(payroll)}
                  onDelete={() => {
                    setSelectedPayroll(payroll);
                    setShowDeleteModal(true);
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Payroll Modal */}
      <GeneratePayrollModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSuccess={loadPayrollData}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPayroll(null);
        }}
        title="Delete Payroll Record"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this payroll record? This action cannot be undone.
          </p>
          {selectedPayroll && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedPayroll.staff?.first_name} {selectedPayroll.staff?.last_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Period: {new Date(selectedPayroll.period_start).toLocaleDateString()} - 
                {new Date(selectedPayroll.period_end).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Amount: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: selectedPayroll.currency
                }).format(selectedPayroll.net_amount)}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedPayroll(null);
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}