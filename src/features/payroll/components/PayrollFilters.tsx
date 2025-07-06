import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';
import { CustomSelect } from '../../../components/CustomSelect';
import { DatePicker } from '../../../components/DatePicker';
import type { PayrollFilters as PayrollFiltersType } from '../types/payroll.types';

interface PayrollFiltersProps {
  filters: PayrollFiltersType;
  onFiltersChange: (filters: PayrollFiltersType) => void;
  staffOptions?: Array<{ value: string; label: string }>;
}

export function PayrollFilters({ 
  filters, 
  onFiltersChange,
  staffOptions = []
}: PayrollFiltersProps) {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'processing', label: 'Processing' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineFilter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filter Payroll Records
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              placeholder="Search records..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Staff */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Staff Member
          </label>
          <CustomSelect
            value={filters.staff_id || ''}
            onChange={(value) => onFiltersChange({ ...filters, staff_id: value })}
            options={[
              { value: '', label: 'All Staff' },
              ...staffOptions
            ]}
          />
        </div>

        {/* Status */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <CustomSelect
            value={filters.status || ''}
            onChange={(value) => onFiltersChange({ 
              ...filters, 
              status: value as PayrollFiltersType['status'] || undefined 
            })}
            options={statusOptions}
          />
        </div>

        {/* Period Start */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Period Start
          </label>
          <DatePicker
            value={filters.period_start || ''}
            onChange={(date) => onFiltersChange({ ...filters, period_start: date })}
            placeholder="From date"
          />
        </div>

        {/* Period End */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Period End
          </label>
          <DatePicker
            value={filters.period_end || ''}
            onChange={(date) => onFiltersChange({ ...filters, period_end: date })}
            placeholder="To date"
          />
        </div>
      </div>

      {/* Active filters indicator */}
      {Object.values(filters).some(value => value) && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Active filters:
          </span>
          <button
            onClick={() => onFiltersChange({})}
            className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </motion.div>
  );
}