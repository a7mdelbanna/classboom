import { motion } from 'framer-motion';
import { HiOutlineClock, HiOutlineCalendar, HiOutlineChartBar } from 'react-icons/hi';
import WeeklyAvailability from './WeeklyAvailability';
import StaffService from '../services/staffService';
import type { WeeklyAvailability as WeeklyAvailabilityType } from '../types/staff.types';

interface AvailabilityDisplayProps {
  availability?: WeeklyAvailabilityType;
  showSummary?: boolean;
  compact?: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export default function AvailabilityDisplay({ 
  availability = {}, 
  showSummary = true,
  compact = false 
}: AvailabilityDisplayProps) {
  
  // Calculate schedule summary
  const summary = StaffService.getStaffScheduleSummary(availability);

  if (compact) {
    return (
      <div className="space-y-3">
        {showSummary && summary.totalHours > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {summary.totalHours}h • {summary.availableDays} days
            </span>
            {summary.longestDay && (
              <span className="text-gray-500 dark:text-gray-400">
                Longest: {summary.longestDay.hours}h
              </span>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => {
            const dayAvailability = availability[day.key];
            const isAvailable = dayAvailability?.available && dayAvailability.slots && dayAvailability.slots.length > 0;
            
            return (
              <div
                key={day.key}
                className={`text-center p-2 rounded text-xs ${
                  isAvailable 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                <div className="font-medium">{day.short}</div>
                {isAvailable && dayAvailability.slots && (
                  <div className="mt-1 space-y-0.5">
                    {dayAvailability.slots.slice(0, 2).map((slot, index) => (
                      <div key={index} className="text-xs">
                        {slot.start}-{slot.end}
                      </div>
                    ))}
                    {dayAvailability.slots.length > 2 && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        +{dayAvailability.slots.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {showSummary && summary.totalHours > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
          >
            <div className="flex items-center">
              <HiOutlineClock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                Total Hours
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {summary.totalHours}h
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              per week
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
          >
            <div className="flex items-center">
              <HiOutlineCalendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="ml-2 text-sm font-medium text-green-900 dark:text-green-100">
                Available Days
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {summary.availableDays}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {summary.busyDays.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(', ')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4"
          >
            <div className="flex items-center">
              <HiOutlineChartBar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="ml-2 text-sm font-medium text-orange-900 dark:text-orange-100">
                Longest Day
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {summary.longestDay ? `${summary.longestDay.hours}h` : '0h'}
            </p>
            {summary.longestDay && (
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                {summary.longestDay.day.charAt(0).toUpperCase() + summary.longestDay.day.slice(1)}
              </p>
            )}
          </motion.div>
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <HiOutlineCalendar className="h-5 w-5 mr-2" />
            Weekly Schedule
          </h3>
        </div>
        
        <div className="p-6">
          {Object.keys(availability).length === 0 ? (
            <div className="text-center py-8">
              <HiOutlineClock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No availability schedule set
              </p>
            </div>
          ) : (
            <WeeklyAvailability
              availability={availability}
              onChange={() => {}} // Read-only
              readOnly={true}
            />
          )}
        </div>
      </div>

      {/* Daily Breakdown */}
      {summary.totalHours > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Daily Breakdown
            </h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {DAYS.map((day) => {
                const dayAvailability = availability[day.key];
                const isAvailable = dayAvailability?.available && dayAvailability.slots && dayAvailability.slots.length > 0;
                
                if (!isAvailable) return null;
                
                const dayHours = dayAvailability.slots!.reduce((total, slot) => {
                  const start = StaffService['timeToMinutes'](slot.start);
                  const end = StaffService['timeToMinutes'](slot.end);
                  return total + (end - start) / 60;
                }, 0);
                
                return (
                  <div key={day.key} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 dark:text-white w-20">
                        {day.label}
                      </span>
                      <div className="flex space-x-2 ml-4">
                        {dayAvailability.slots!.map((slot, index) => (
                          <span
                            key={index}
                            className="text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                          >
                            {slot.start} - {slot.end}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {Math.round(dayHours * 100) / 100}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}