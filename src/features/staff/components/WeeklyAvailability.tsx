import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineClock } from 'react-icons/hi';
import { CustomCheckbox } from '../../../components/CustomCheckbox';
import { TimeInput } from '../../../components/TimeInput';
import type { WeeklyAvailability, DayAvailability, TimeSlot } from '../types/staff.types';

interface WeeklyAvailabilityProps {
  availability?: WeeklyAvailability;
  onChange: (availability: WeeklyAvailability) => void;
  readOnly?: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export default function WeeklyAvailability({ 
  availability = {}, 
  onChange, 
  readOnly = false 
}: WeeklyAvailabilityProps) {
  
  const updateDayAvailability = (dayKey: string, dayAvailability: DayAvailability) => {
    const newAvailability = {
      ...availability,
      [dayKey]: dayAvailability
    };
    onChange(newAvailability);
  };

  const addTimeSlot = (dayKey: string) => {
    const currentDay = availability[dayKey] || { available: true, slots: [] };
    const newSlot: TimeSlot = { start: '09:00', end: '17:00' };
    
    const updatedDay: DayAvailability = {
      ...currentDay,
      available: true,
      slots: [...(currentDay.slots || []), newSlot]
    };
    
    updateDayAvailability(dayKey, updatedDay);
  };

  const removeTimeSlot = (dayKey: string, slotIndex: number) => {
    const currentDay = availability[dayKey];
    if (!currentDay || !currentDay.slots) return;
    
    const newSlots = currentDay.slots.filter((_, index) => index !== slotIndex);
    const updatedDay: DayAvailability = {
      ...currentDay,
      slots: newSlots,
      available: newSlots.length > 0
    };
    
    updateDayAvailability(dayKey, updatedDay);
  };

  const updateTimeSlot = (dayKey: string, slotIndex: number, slot: TimeSlot) => {
    const currentDay = availability[dayKey];
    if (!currentDay || !currentDay.slots) return;
    
    const newSlots = currentDay.slots.map((s, index) => 
      index === slotIndex ? slot : s
    );
    
    updateDayAvailability(dayKey, { ...currentDay, slots: newSlots });
  };

  const toggleDayAvailability = (dayKey: string) => {
    const currentDay = availability[dayKey] || { available: false, slots: [] };
    
    if (currentDay.available) {
      // Disable the day
      updateDayAvailability(dayKey, { available: false, slots: [] });
    } else {
      // Enable the day with a default slot
      updateDayAvailability(dayKey, { 
        available: true, 
        slots: [{ start: '09:00', end: '17:00' }] 
      });
    }
  };

  const copyFromPreviousDay = (dayKey: string) => {
    const dayIndex = DAYS.findIndex(d => d.key === dayKey);
    if (dayIndex === 0) return; // Can't copy for Monday
    
    const previousDayKey = DAYS[dayIndex - 1].key;
    const previousDay = availability[previousDayKey];
    
    if (previousDay && previousDay.available && previousDay.slots) {
      updateDayAvailability(dayKey, { 
        available: true, 
        slots: [...previousDay.slots] 
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Weekly Availability
        </h3>
        {!readOnly && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Set your available teaching hours for each day
          </div>
        )}
      </div>

      <div className="space-y-4">
        {DAYS.map((day, dayIndex) => {
          const dayAvailability = availability[day.key] || { available: false, slots: [] };
          const isAvailable = dayAvailability.available;
          const slots = dayAvailability.slots || [];

          return (
            <motion.div
              key={day.key}
              className={`border rounded-lg p-4 ${
                isAvailable 
                  ? 'border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/10' 
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
              }`}
              layout
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <CustomCheckbox
                    id={`available-${day.key}`}
                    checked={isAvailable}
                    onChange={() => !readOnly && toggleDayAvailability(day.key)}
                    disabled={readOnly}
                  />
                  <label 
                    htmlFor={`available-${day.key}`}
                    className={`font-medium ${
                      isAvailable 
                        ? 'text-orange-900 dark:text-orange-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {day.label}
                  </label>
                </div>

                {!readOnly && isAvailable && (
                  <div className="flex space-x-2">
                    {dayIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => copyFromPreviousDay(day.key)}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Copy from {DAYS[dayIndex - 1].label}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => addTimeSlot(day.key)}
                      className="flex items-center text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      <HiOutlinePlus className="h-3 w-3 mr-1" />
                      Add Slot
                    </button>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {isAvailable && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {slots.length === 0 ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No time slots defined. Add a slot to specify available hours.
                      </div>
                    ) : (
                      slots.map((slot, slotIndex) => (
                        <motion.div
                          key={slotIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                        >
                          <HiOutlineClock className="h-4 w-4 text-gray-400" />
                          
                          <div className="flex items-center space-x-2">
                            <TimeInput
                              value={slot.start}
                              onChange={(time) => !readOnly && updateTimeSlot(day.key, slotIndex, { ...slot, start: time })}
                              disabled={readOnly}
                              className="w-20"
                            />
                            <span className="text-gray-500 dark:text-gray-400">to</span>
                            <TimeInput
                              value={slot.end}
                              onChange={(time) => !readOnly && updateTimeSlot(day.key, slotIndex, { ...slot, end: time })}
                              disabled={readOnly}
                              className="w-20"
                            />
                          </div>

                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(day.key, slotIndex)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <HiOutlineTrash className="h-4 w-4" />
                            </button>
                          )}
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {!readOnly && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <HiOutlineClock className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Tips for setting availability:
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc list-inside space-y-1">
                  <li>You can add multiple time slots per day for breaks</li>
                  <li>Use "Copy from previous day" to quickly duplicate schedules</li>
                  <li>Available hours will be used for automatic scheduling</li>
                  <li>You can always adjust specific sessions manually later</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}