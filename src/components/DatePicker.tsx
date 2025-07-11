import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from './Portal';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  className = ""
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    if (value) {
      setViewDate(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const dropdownHeight = 400; // Approximate height of the calendar dropdown
      const dropdownWidth = 320; // Width of the calendar dropdown (w-80 = 20rem = 320px)

      // Calculate horizontal position to keep dropdown within viewport
      let left = buttonRect.left;
      const rightEdge = left + dropdownWidth;
      const viewportWidth = window.innerWidth;
      
      if (rightEdge > viewportWidth - 20) { // 20px margin from edge
        left = Math.max(20, viewportWidth - dropdownWidth - 20);
      }

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('top');
        setDropdownStyle({
          position: 'fixed',
          left: `${left}px`,
          bottom: `${window.innerHeight - buttonRect.top + 4}px`,
          width: `${dropdownWidth}px`
        });
      } else {
        setDropdownPosition('bottom');
        setDropdownStyle({
          position: 'fixed',
          left: `${left}px`,
          top: `${buttonRect.bottom + 4}px`,
          width: `${dropdownWidth}px`
        });
      }
    }
  }, [isOpen]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const handleDateSelect = (date: Date) => {
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const handleMonthChange = (increment: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + increment, 1));
  };

  const handleYearChange = (increment: number) => {
    setViewDate(new Date(viewDate.getFullYear() + increment, viewDate.getMonth(), 1));
  };

  const selectedDate = parseDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateDisabled = (date: Date) => {
    if (!date) return true;
    const dateStr = formatDate(date);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const formatDisplayDate = (dateString: string) => {
    const date = parseDate(dateString);
    if (!date) return placeholder;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-left flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {formatDisplayDate(value)}
        </span>
        <svg
          className="w-5 h-5 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <Portal>
            <motion.div
              initial={{ opacity: 0, y: dropdownPosition === 'top' ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: dropdownPosition === 'top' ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              style={dropdownStyle}
              className="z-[9999] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4"
            >
            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => handleMonthChange(-1)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {monthNames[viewDate.getMonth()]}
                </span>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleYearChange(-1)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <span className="font-medium text-gray-900 dark:text-white mx-1">
                    {viewDate.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleYearChange(1)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => handleMonthChange(1)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysInWeek.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(viewDate).map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-8" />;
                }

                const dateStr = formatDate(date);
                const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
                const isToday = formatDate(today) === dateStr;
                const isDisabled = isDateDisabled(date);

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => !isDisabled && handleDateSelect(date)}
                    disabled={isDisabled}
                    className={`
                      h-8 rounded-lg text-sm font-medium transition-all duration-200
                      ${isSelected 
                        ? 'bg-orange-500 text-white hover:bg-orange-600' 
                        : isToday
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                        : isDisabled
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Today Button */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  const todayStr = formatDate(today);
                  if (!isDateDisabled(today)) {
                    onChange(todayStr);
                    setIsOpen(false);
                  }
                }}
                className="w-full py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}