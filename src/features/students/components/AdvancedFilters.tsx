import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineFilter, HiOutlineX, HiOutlineRefresh } from 'react-icons/hi';
import { CustomSelect } from '../../../components/CustomSelect';
import { MultiSelect } from '../../../components/MultiSelect';
import { DatePicker } from '../../../components/DatePicker';
import { COUNTRIES } from '../../../utils/countries';
import { getSkillLevels } from '../types/skill-levels.types';
import type { InstitutionType } from '../../../types/institution.types';

export interface AdvancedFilterState {
  // Date filters
  enrolledAfter?: string;
  enrolledBefore?: string;
  bornAfter?: string;
  bornBefore?: string;
  
  // Demographic filters
  countries?: string[];
  cities?: string[];
  skillLevels?: string[];
  
  // Course filters
  interestedCourses?: string[];
  
  // Contact filters
  hasEmail?: boolean;
  hasPhone?: boolean;
  hasSocialMedia?: boolean;
  
  // Family filters
  hasParentInfo?: boolean;
  hasEmergencyContact?: boolean;
  
  // Medical filters
  hasMedicalInfo?: boolean;
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterState;
  onFiltersChange: (filters: AdvancedFilterState) => void;
  institutionType: InstitutionType;
  availableCourses: string[];
  availableCities: string[];
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  institutionType, 
  availableCourses,
  availableCities 
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const skillLevels = getSkillLevels(institutionType);
  
  const updateFilter = (key: keyof AdvancedFilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };
  
  const clearAllFilters = () => {
    onFiltersChange({});
  };
  
  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  });
  
  const getFilterCount = () => {
    return Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    }).length;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 relative" style={{ overflow: 'visible' }}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <HiOutlineFilter className="w-5 h-5" />
          <span className="font-medium">Advanced Filters</span>
          {hasActiveFilters && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              {getFilterCount()}
            </span>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors text-sm"
          >
            <HiOutlineRefresh className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'visible' }}
          >
            <div className="p-6 space-y-6 relative" style={{ zIndex: 10 }}>
              
              {/* Date Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Date Ranges</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Enrolled After
                    </label>
                    <DatePicker
                      value={filters.enrolledAfter || ''}
                      onChange={(date) => updateFilter('enrolledAfter', date || undefined)}
                      placeholder="Select date"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Enrolled Before
                    </label>
                    <DatePicker
                      value={filters.enrolledBefore || ''}
                      onChange={(date) => updateFilter('enrolledBefore', date || undefined)}
                      placeholder="Select date"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Born After
                    </label>
                    <DatePicker
                      value={filters.bornAfter || ''}
                      onChange={(date) => updateFilter('bornAfter', date || undefined)}
                      placeholder="Select date"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Born Before
                    </label>
                    <DatePicker
                      value={filters.bornBefore || ''}
                      onChange={(date) => updateFilter('bornBefore', date || undefined)}
                      placeholder="Select date"
                    />
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Demographics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Countries
                    </label>
                    <MultiSelect
                      value={filters.countries || []}
                      onChange={(countries) => updateFilter('countries', countries.length > 0 ? countries : undefined)}
                      options={COUNTRIES.map(country => ({
                        value: country.name,
                        label: `${country.flag} ${country.name}`
                      }))}
                      placeholder="Select countries"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Cities
                    </label>
                    <MultiSelect
                      value={filters.cities || []}
                      onChange={(cities) => updateFilter('cities', cities.length > 0 ? cities : undefined)}
                      options={availableCities.map(city => ({
                        value: city,
                        label: city
                      }))}
                      placeholder="Select cities"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {skillLevels?.name || 'Skill Levels'}
                    </label>
                    <MultiSelect
                      value={filters.skillLevels || []}
                      onChange={(levels) => updateFilter('skillLevels', levels.length > 0 ? levels : undefined)}
                      options={skillLevels?.levels.map(level => ({
                        value: level.value,
                        label: level.label
                      })) || []}
                      placeholder={`Select ${skillLevels?.name || 'levels'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Courses */}
              {availableCourses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Courses</h4>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Interested in Courses
                    </label>
                    <MultiSelect
                      value={filters.interestedCourses || []}
                      onChange={(courses) => updateFilter('interestedCourses', courses.length > 0 ? courses : undefined)}
                      options={availableCourses.map(course => ({
                        value: course,
                        label: course
                      }))}
                      placeholder="Select courses"
                    />
                  </div>
                </div>
              )}

              {/* Contact & Info Toggles */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Contact & Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  
                  {/* Contact Filters */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasEmail === true}
                      onChange={(e) => updateFilter('hasEmail', e.target.checked ? true : undefined)}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Has Email</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasPhone === true}
                      onChange={(e) => updateFilter('hasPhone', e.target.checked ? true : undefined)}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Has Phone</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasSocialMedia === true}
                      onChange={(e) => updateFilter('hasSocialMedia', e.target.checked ? true : undefined)}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Has Social</span>
                  </label>
                  
                  {/* Family Filters */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasParentInfo === true}
                      onChange={(e) => updateFilter('hasParentInfo', e.target.checked ? true : undefined)}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Has Parent Info</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasEmergencyContact === true}
                      onChange={(e) => updateFilter('hasEmergencyContact', e.target.checked ? true : undefined)}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Has Emergency</span>
                  </label>
                  
                  {/* Medical Filters */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasMedicalInfo === true}
                      onChange={(e) => updateFilter('hasMedicalInfo', e.target.checked ? true : undefined)}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Has Medical</span>
                  </label>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Active Filters</h4>
                  <div className="flex flex-wrap gap-2">
                    {/* Date filters */}
                    {filters.enrolledAfter && (
                      <span className="inline-flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm">
                        <span>Enrolled after {filters.enrolledAfter}</span>
                        <button onClick={() => updateFilter('enrolledAfter', undefined)} className="hover:text-orange-600">
                          <HiOutlineX className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    
                    {filters.enrolledBefore && (
                      <span className="inline-flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm">
                        <span>Enrolled before {filters.enrolledBefore}</span>
                        <button onClick={() => updateFilter('enrolledBefore', undefined)} className="hover:text-orange-600">
                          <HiOutlineX className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    
                    {/* Array filters */}
                    {filters.countries?.map(country => (
                      <span key={country} className="inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                        <span>{country}</span>
                        <button 
                          onClick={() => updateFilter('countries', filters.countries?.filter(c => c !== country))} 
                          className="hover:text-blue-600"
                        >
                          <HiOutlineX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    
                    {/* Boolean filters */}
                    {filters.hasEmail && (
                      <span className="inline-flex items-center space-x-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                        <span>Has Email</span>
                        <button onClick={() => updateFilter('hasEmail', undefined)} className="hover:text-green-600">
                          <HiOutlineX className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}