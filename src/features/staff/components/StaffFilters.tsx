import { useState } from 'react';
import { motion } from 'framer-motion';
import { CustomSelect } from '../../../components/CustomSelect';
import type { StaffFilters as StaffFiltersType, Staff } from '../types/staff.types';
import { HiOutlineX, HiOutlineSearch } from 'react-icons/hi';

interface StaffFiltersProps {
  filters: StaffFiltersType;
  onFiltersChange: (filters: StaffFiltersType) => void;
  staffData: Staff[];
}

export function StaffFilters({ filters, onFiltersChange, staffData }: StaffFiltersProps) {
  const [localFilters, setLocalFilters] = useState<StaffFiltersType>(filters);

  // Get unique values from staff data for filter options
  const getUniqueValues = (field: keyof Staff): string[] => {
    const values = staffData
      .map(staff => staff[field])
      .filter((value): value is string => Boolean(value))
      .filter((value, index, array) => array.indexOf(value) === index);
    return values.sort();
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'teacher', label: 'Teachers' },
    { value: 'manager', label: 'Managers' },
    { value: 'admin', label: 'Administrators' },
    { value: 'support', label: 'Support Staff' },
    { value: 'custodian', label: 'Custodians' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'terminated', label: 'Terminated' }
  ];

  const employmentTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'volunteer', label: 'Volunteer' }
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...getUniqueValues('department').map(dept => ({
      value: dept,
      label: dept
    }))
  ];

  const handleFilterChange = (field: keyof StaffFiltersType, value: string) => {
    const newFilters = {
      ...localFilters,
      [field]: value || undefined
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: StaffFiltersType = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value && value !== '');
  const activeFilterCount = Object.values(localFilters).filter(value => value && value !== '').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full text-sm font-medium">
              {activeFilterCount} active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <HiOutlineX className="w-4 h-4" />
            <span className="text-sm">Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Search */}
        <div className="xl:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name, email, or staff code..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role
          </label>
          <CustomSelect
            value={localFilters.role || ''}
            onChange={(value) => handleFilterChange('role', value)}
            options={roleOptions}
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <CustomSelect
            value={localFilters.status || ''}
            onChange={(value) => handleFilterChange('status', value)}
            options={statusOptions}
          />
        </div>

        {/* Employment Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Employment Type
          </label>
          <CustomSelect
            value={localFilters.employment_type || ''}
            onChange={(value) => handleFilterChange('employment_type', value)}
            options={employmentTypeOptions}
          />
        </div>

        {/* Department Filter - Only show if departments exist */}
        {departmentOptions.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <CustomSelect
              value={localFilters.department || ''}
              onChange={(value) => handleFilterChange('department', value)}
              options={departmentOptions}
            />
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {localFilters.search && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                  Search: "{localFilters.search}"
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {localFilters.role && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs">
                  Role: {roleOptions.find(r => r.value === localFilters.role)?.label}
                  <button
                    onClick={() => handleFilterChange('role', '')}
                    className="ml-1 hover:text-green-900 dark:hover:text-green-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {localFilters.status && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                  Status: {statusOptions.find(s => s.value === localFilters.status)?.label}
                  <button
                    onClick={() => handleFilterChange('status', '')}
                    className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {localFilters.employment_type && (
                <span className="inline-flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                  Type: {employmentTypeOptions.find(e => e.value === localFilters.employment_type)?.label}
                  <button
                    onClick={() => handleFilterChange('employment_type', '')}
                    className="ml-1 hover:text-orange-900 dark:hover:text-orange-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {localFilters.department && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                  Department: {localFilters.department}
                  <button
                    onClick={() => handleFilterChange('department', '')}
                    className="ml-1 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}