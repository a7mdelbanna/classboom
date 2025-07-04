import { motion } from 'framer-motion';

interface ImportProgressProps {
  total: number;
  current: number;
}

export function ImportProgress({ total, current }: ImportProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Importing Students...
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please wait while we import your data. This may take a few minutes.
        </p>
      </div>

      {/* Circular Progress */}
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            className="text-orange-500"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              strokeDasharray: 352,
              strokeDashoffset: 352 - (352 * percentage) / 100,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.span
              key={percentage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {percentage}%
            </motion.span>
          </div>
        </div>
      </div>

      {/* Progress Details */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Processing {current} of {total} students
        </p>
        
        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-orange-500 rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md">
        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
          💡 Tip: Large imports may take several minutes. Please keep this window open until the import is complete.
        </p>
      </div>
    </div>
  );
}