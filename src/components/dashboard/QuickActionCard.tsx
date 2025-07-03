import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';

interface QuickActionCardProps {
  label: string;
  description?: string;
  icon: React.ReactNode;
  color: {
    primary: string;
    secondary: string;
  };
  onClick: () => void;
  shortcut?: string;
  delay?: number;
}

export function QuickActionCard({
  label,
  description,
  icon,
  color,
  onClick,
  shortcut,
  delay = 0
}: QuickActionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative group w-full text-left overflow-hidden"
    >
      {/* Card Background */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700
        transition-all duration-300 group-hover:shadow-2xl">
        
        {/* Gradient Background on Hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.05 }}
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`
          }}
        />

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color.primary}20, transparent)`
            }}
          />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color.secondary}20, transparent)`
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: 10 }}
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4
              transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`
            }}
          >
            <div className="text-white text-2xl">
              {icon}
            </div>
          </motion.div>

          {/* Text */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center justify-between">
            {label}
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              whileHover={{ x: 0, opacity: 1 }}
              className="text-gray-400 dark:text-gray-500"
            >
              <HiArrowRight className="w-5 h-5" />
            </motion.div>
          </h3>
          
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}

          {/* Keyboard Shortcut */}
          {shortcut && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100
              transition-opacity duration-300">
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                rounded text-gray-600 dark:text-gray-400 font-mono">
                {shortcut}
              </kbd>
            </div>
          )}
        </div>

        {/* Ripple Effect Container */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            whileTap={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color.primary}40, transparent)`,
              transformOrigin: 'center'
            }}
          />
        </div>
      </div>
    </motion.button>
  );
}