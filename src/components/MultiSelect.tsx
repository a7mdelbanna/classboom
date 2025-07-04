import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomCheckbox } from './CustomCheckbox';

interface Option {
  value: string;
  label: string;
  category?: string;
}

interface MultiSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  maxHeight?: string;
  showCategories?: boolean;
}

export function MultiSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select options...", 
  className = "",
  maxHeight = "max-h-60",
  showCategories = false
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  
  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group options by category if needed
  const groupedOptions = showCategories ? 
    filteredOptions.reduce((acc, option) => {
      const category = option.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(option);
      return acc;
    }, {} as Record<string, Option[]>) :
    { 'All': filteredOptions };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleSelectAll = (categoryOptions: Option[]) => {
    const categoryValues = categoryOptions.map(opt => opt.value);
    const allSelected = categoryValues.every(val => value.includes(val));
    
    if (allSelected) {
      // Deselect all in category
      onChange(value.filter(v => !categoryValues.includes(v)));
    } else {
      // Select all in category
      const newValues = [...new Set([...value, ...categoryValues])];
      onChange(newValues);
    }
  };

  const selectedCount = value.length;
  const selectedText = selectedCount === 0 
    ? placeholder 
    : selectedCount === 1 
    ? options.find(opt => opt.value === value[0])?.label || `${selectedCount} selected`
    : `${selectedCount} selected`;

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-left flex items-center justify-between"
      >
        <span className={selectedCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {selectedText}
        </span>
        <div className="flex items-center space-x-2">
          {selectedCount > 0 && (
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 text-xs font-medium px-2 py-1 rounded-full">
              {selectedCount}
            </span>
          )}
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} text-gray-500 dark:text-gray-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${maxHeight} overflow-hidden`}
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options List */}
            <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
              {Object.keys(groupedOptions).length === 0 ? (
                <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No options found
                </div>
              ) : (
                Object.entries(groupedOptions).map(([categoryName, categoryOptions]) => (
                  <div key={categoryName}>
                    {showCategories && Object.keys(groupedOptions).length > 1 && (
                      <div className="sticky top-0 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 border-b border-gray-100 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            {categoryName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectAll(categoryOptions)}
                            className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                          >
                            {categoryOptions.every(opt => value.includes(opt.value)) ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {categoryOptions.map((option) => (
                      <div
                        key={option.value}
                        className="px-3 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer"
                        onClick={() => handleToggle(option.value)}
                      >
                        <CustomCheckbox
                          checked={value.includes(option.value)}
                          onChange={() => handleToggle(option.value)}
                          label={option.label}
                          className="pointer-events-none"
                        />
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Clear All / Select All Actions */}
            {filteredOptions.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  disabled={value.length === 0}
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => onChange(filteredOptions.map(opt => opt.value))}
                  className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                  disabled={value.length === filteredOptions.length}
                >
                  Select All Visible
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}