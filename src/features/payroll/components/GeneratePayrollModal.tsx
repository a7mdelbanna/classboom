import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../../../components/Modal';
import { DatePicker } from '../../../components/DatePicker';
import { CustomCheckbox } from '../../../components/CustomCheckbox';
import { useToast } from '../../../context/ToastContext';
import { PayrollService } from '../services/payrollService';
import type { MinimalStaffInfo } from '../../../types/shared.types';
import type { PayrollFormData } from '../types/payroll.types';
import { 
  HiOutlineCalculator,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar
} from 'react-icons/hi';

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GeneratePayrollModal({ isOpen, onClose, onSuccess }: GeneratePayrollModalProps) {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [eligibleStaff, setEligibleStaff] = useState<MinimalStaffInfo[]>([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<PayrollFormData>>({
    period_start: '',
    period_end: '',
    notes: ''
  });
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Load eligible staff when period dates are selected
  useEffect(() => {
    if (formData.period_start && formData.period_end) {
      loadEligibleStaff();
    }
  }, [formData.period_start, formData.period_end]);

  const loadEligibleStaff = async () => {
    setIsLoadingStaff(true);
    try {
      const staff = await PayrollService.getEligibleStaff(
        formData.period_start!,
        formData.period_end!
      );
      setEligibleStaff(staff);
      // Select all by default
      setSelectedStaffIds(staff.map(s => s.id));
    } catch (error) {
      console.error('Error loading eligible staff:', error);
      showToast('Failed to load eligible staff', 'error');
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.period_start || !formData.period_end) {
      showToast('Please select period dates', 'error');
      return;
    }

    if (selectedStaffIds.length === 0) {
      showToast('Please select at least one staff member', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      await PayrollService.generatePayroll({
        staff_ids: selectedStaffIds,
        period_start: formData.period_start,
        period_end: formData.period_end,
        notes: formData.notes
      });

      showToast('Payroll generated successfully', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error generating payroll:', error);
      showToast('Failed to generate payroll', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStaffIds.length === eligibleStaff.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(eligibleStaff.map(s => s.id));
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const getStaffCompensationInfo = (staff: MinimalStaffInfo) => {
    switch (staff.compensation_model) {
      case 'monthly_salary':
        return `Monthly: ${formatCurrency(staff.base_salary || 0, staff.currency)}`;
      case 'hourly':
        return `Hourly: ${formatCurrency(staff.hourly_rate || 0, staff.currency)}`;
      case 'per_session':
        return `Per Session: ${formatCurrency(staff.session_rate || 0, staff.currency)}`;
      default:
        return 'Volunteer';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Payroll"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Period Selection */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white mb-4">
            <HiOutlineCalendar className="w-5 h-5 text-orange-500" />
            Select Period
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Period Start <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={formData.period_start || ''}
                onChange={(date) => setFormData({ ...formData, period_start: date })}
                placeholder="Start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Period End <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={formData.period_end || ''}
                onChange={(date) => setFormData({ ...formData, period_end: date })}
                placeholder="End date"
              />
            </div>
          </div>
        </div>

        {/* Staff Selection */}
        {formData.period_start && formData.period_end && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white">
                <HiOutlineUserGroup className="w-5 h-5 text-orange-500" />
                Select Staff ({selectedStaffIds.length} selected)
              </h3>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
              >
                {selectedStaffIds.length === eligibleStaff.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {isLoadingStaff ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              </div>
            ) : eligibleStaff.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No eligible staff found for this period
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {eligibleStaff.map((staff) => (
                  <motion.div
                    key={staff.id}
                    whileHover={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                    onClick={() => toggleStaffSelection(staff.id)}
                  >
                    <div className="flex items-center gap-3">
                      <CustomCheckbox
                        checked={selectedStaffIds.includes(staff.id)}
                        onChange={() => toggleStaffSelection(staff.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {staff.first_name} {staff.last_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {staff.staff_code} • {staff.role} • {staff.department || 'No Department'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getStaffCompensationInfo(staff)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {staff.employment_type?.replace('_', ' ')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any notes about this payroll batch..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Summary */}
        {selectedStaffIds.length > 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <HiOutlineCalculator className="w-5 h-5" />
                <p className="font-medium">
                  Payroll will be generated for {selectedStaffIds.length} staff member{selectedStaffIds.length !== 1 ? 's' : ''}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isGenerating || selectedStaffIds.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Generating...
              </>
            ) : (
              <>
                <HiOutlineCalculator className="w-4 h-4" />
                Generate Payroll
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}