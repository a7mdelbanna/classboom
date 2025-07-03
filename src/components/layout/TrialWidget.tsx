import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { HiX, HiSparkles, HiArrowRight } from 'react-icons/hi';

export function TrialWidget() {
  const { schoolInfo } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => {
    // Check if user has minimized before
    return localStorage.getItem('trialWidgetMinimized') === 'true';
  });

  if (!schoolInfo?.trial_ends_at || isMinimized) return null;

  const trialEndDate = new Date(schoolInfo.trial_ends_at);
  const now = new Date();
  const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = 14; // Assuming 14-day trial
  const percentageUsed = ((totalDays - daysLeft) / totalDays) * 100;
  
  // Determine urgency color
  const getColor = () => {
    if (daysLeft <= 3) return { primary: '#ef4444', secondary: '#dc2626' }; // red
    if (daysLeft <= 7) return { primary: '#f59e0b', secondary: '#d97706' }; // amber
    return { primary: '#10b981', secondary: '#059669' }; // green
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentageUsed / 100) * circumference;

  const handleMinimize = () => {
    setIsMinimized(true);
    localStorage.setItem('trialWidgetMinimized', 'true');
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.div
        animate={{ width: isExpanded ? 320 : 120 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className="relative p-4">
          {/* Close Button */}
          <button
            onClick={handleMinimize}
            className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <HiX className="w-4 h-4 text-gray-400" />
          </button>

          {/* Collapsed View */}
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsExpanded(true)}
                className="cursor-pointer"
              >
                {/* Progress Ring */}
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-24 h-24 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="48"
                      cy="48"
                      r="45"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="48"
                      cy="48"
                      r="45"
                      stroke={colors.primary}
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  </svg>
                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                      {daysLeft}
                    </span>
                    <span className="text-xs text-gray-500">days</span>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-600 mt-2">Trial ends soon</p>
              </motion.div>
            ) : (
              /* Expanded View */
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '20' }}>
                      <HiSparkles className="w-6 h-6" style={{ color: colors.primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Trial Period</h3>
                      <p className="text-sm text-gray-500">{daysLeft} days remaining</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <HiX className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trial Progress</span>
                    <span className="font-medium" style={{ color: colors.primary }}>
                      {totalDays - daysLeft} of {totalDays} days
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentageUsed}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
                    />
                  </div>
                </div>

                {/* Features Usage */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Features Used:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">Student Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <span className="text-gray-400">Class Scheduling</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <span className="text-gray-400">Payment Processing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <span className="text-gray-400">Analytics</span>
                    </div>
                  </div>
                </div>

                {/* Upgrade Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/upgrade')}
                  className="w-full py-3 px-4 rounded-xl text-white font-medium
                    flex items-center justify-center space-x-2 transition-all duration-200
                    shadow-lg hover:shadow-xl"
                  style={{ 
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` 
                  }}
                >
                  <span>Upgrade Now</span>
                  <HiArrowRight className="w-4 h-4" />
                </motion.button>

                {/* Motivational Message */}
                {daysLeft <= 3 && (
                  <p className="text-xs text-center text-gray-600">
                    Don't lose access to your data! Upgrade today.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}