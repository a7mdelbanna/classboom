import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClock, HiOutlinePencil, HiOutlineCalendar } from 'react-icons/hi';
import AvailabilityDisplay from './AvailabilityDisplay';
import AvailabilityEditModal from './AvailabilityEditModal';
import type { Staff } from '../types/staff.types';

interface StaffAvailabilityCardProps {
  staff: Staff;
  onAvailabilityUpdate?: (updatedStaff: Staff) => void;
  allowEdit?: boolean;
}

export default function StaffAvailabilityCard({ 
  staff, 
  onAvailabilityUpdate,
  allowEdit = true 
}: StaffAvailabilityCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  
  const handleEditAvailability = () => {
    setShowEditModal(true);
  };

  const handleAvailabilitySave = (updatedStaff: Staff) => {
    if (onAvailabilityUpdate) {
      onAvailabilityUpdate(updatedStaff);
    }
  };

  const hasAvailability = staff.availability && Object.keys(staff.availability).length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HiOutlineCalendar className="h-5 w-5 text-orange-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                My Availability
              </h2>
            </div>
            {allowEdit && (
              <button
                onClick={handleEditAvailability}
                className="flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                <HiOutlinePencil className="h-4 w-4 mr-1" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {hasAvailability ? (
            <AvailabilityDisplay
              availability={staff.availability}
              showSummary={true}
              compact={false}
            />
          ) : (
            <div className="text-center py-8">
              <HiOutlineClock className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Schedule Set
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Set your weekly availability to help with scheduling.
              </p>
              {allowEdit && (
                <button
                  onClick={handleEditAvailability}
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  <HiOutlineClock className="h-4 w-4 mr-2" />
                  Set Availability
                </button>
              )}
            </div>
          )}
        </div>

        {/* Working Hours Constraints */}
        {(staff.min_weekly_hours || staff.max_weekly_hours) && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Working Hours Policy
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {staff.min_weekly_hours && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Minimum:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {staff.min_weekly_hours}h/week
                  </span>
                </div>
              )}
              {staff.max_weekly_hours && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Maximum:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {staff.max_weekly_hours}h/week
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      {showEditModal && (
        <AvailabilityEditModal
          staff={staff}
          onClose={() => setShowEditModal(false)}
          onSave={handleAvailabilitySave}
        />
      )}
    </>
  );
}