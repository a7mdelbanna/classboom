import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
  onClick?: () => void;
}

export function StatsCard({ 
  label, 
  value, 
  icon, 
  color, 
  trend, 
  delay = 0,
  onClick 
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;

  // Animate counter
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const stepValue = numericValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`
        relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700
        p-6 cursor-pointer group transition-all duration-300
        hover:shadow-2xl
      `}
    >
      {/* Background Gradient */}
      <div 
        className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300
          bg-gradient-to-br ${color}`}
      />

      {/* Decorative Background Element */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10
        bg-gradient-to-br ${color}`} />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={`p-2 rounded-lg bg-gradient-to-br ${color} bg-opacity-10`}>
                {icon}
              </div>
            )}
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</h3>
          </div>
          
          {/* Colored Dot Indicator */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-2 h-2 rounded-full bg-gradient-to-r ${color}`}
          />
        </div>

        {/* Value */}
        <div className="flex items-end justify-between">
          <motion.p 
            key={displayValue}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            {typeof value === 'string' && isNaN(parseInt(value)) ? value : displayValue}
          </motion.p>

          {/* Trend Indicator */}
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className={`flex items-center space-x-1 text-sm font-medium
                ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
              {trend.isPositive ? (
                <HiArrowUp className="w-4 h-4" />
              ) : (
                <HiArrowDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </motion.div>
          )}
        </div>

        {/* Mini Chart Placeholder */}
        <div className="mt-4 h-8 flex items-end space-x-1">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.random() * 100}%` }}
              transition={{ delay: delay + i * 0.1, duration: 0.5 }}
              className={`flex-1 rounded-t bg-gradient-to-t ${color} opacity-20`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}