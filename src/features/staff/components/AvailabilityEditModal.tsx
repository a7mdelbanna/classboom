import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClock, HiOutlineCalendar, HiOutlineChartBar } from 'react-icons/hi';
import { Modal } from '../../../components/Modal';
import { useToast } from '../../../context/ToastContext';
import WeeklyAvailability from './WeeklyAvailability';
import StaffService from '../services/staffService';
import type { Staff, WeeklyAvailability as WeeklyAvailabilityType } from '../types/staff.types';

interface AvailabilityEditModalProps {
  staff: Staff;
  onClose: () => void;
  onSave: (updatedStaff: Staff) => void;
}

export default function AvailabilityEditModal({ staff, onClose, onSave }: AvailabilityEditModalProps) {
  const { showToast } = useToast();
  const [availability, setAvailability] = useState<WeeklyAvailabilityType>(
    staff.availability || {}
  );
  const [loading, setLoading] = useState(false);
  
  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedStaff = await StaffService.updateStaffAvailability(staff.id, availability);
      showToast('Availability updated successfully', 'success');
      onSave(updatedStaff);
      onClose();
    } catch (error) {
      console.error('Error updating availability:', error);
      showToast(
        error instanceof Error ? error.message : 'Error updating availability',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate schedule summary
  const summary = StaffService.getStaffScheduleSummary(availability);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Edit Availability - ${staff.full_name}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Staff Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {staff.avatar_url ? (
                <img
                  src={staff.avatar_url}
                  alt={staff.full_name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {staff.first_name.charAt(0)}{staff.last_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {staff.full_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)} • {staff.department || 'No Department'}
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Summary */}
        {summary.totalHours > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <HiOutlineClock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Hours
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {summary.totalHours}h
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <HiOutlineCalendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="ml-2 text-sm font-medium text-green-900 dark:text-green-100">
                  Available Days
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {summary.availableDays}
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
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
            </div>
          </div>
        )}

        {/* Weekly Availability Component */}
        <WeeklyAvailability
          availability={availability}
          onChange={setAvailability}
        />

        {/* Working Hours Constraints */}
        {(staff.min_weekly_hours || staff.max_weekly_hours) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Working Hours Constraints
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {staff.min_weekly_hours && (
                <div>
                  <span className="text-yellow-600 dark:text-yellow-400">Minimum:</span>
                  <span className="ml-2 font-medium text-yellow-800 dark:text-yellow-200">
                    {staff.min_weekly_hours}h/week
                  </span>
                </div>
              )}
              {staff.max_weekly_hours && (
                <div>
                  <span className="text-yellow-600 dark:text-yellow-400">Maximum:</span>
                  <span className="ml-2 font-medium text-yellow-800 dark:text-yellow-200">
                    {staff.max_weekly_hours}h/week
                  </span>
                </div>
              )}
            </div>
            
            {/* Warning if outside constraints */}
            {((staff.min_weekly_hours && summary.totalHours < staff.min_weekly_hours) ||
              (staff.max_weekly_hours && summary.totalHours > staff.max_weekly_hours)) && (
              <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-800/30 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Current availability ({summary.totalHours}h) is outside the 
                  {staff.min_weekly_hours && summary.totalHours < staff.min_weekly_hours && ' minimum'}
                  {staff.max_weekly_hours && summary.totalHours > staff.max_weekly_hours && ' maximum'}
                  {' '}working hours constraint.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <HiOutlineClock className="h-4 w-4 mr-2" />
                Save Availability
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}