import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', isVisible, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const colors = {
    info: { bg: 'bg-blue-500', icon: 'ℹ️' },
    success: { bg: 'bg-green-500', icon: '✅' },
    warning: { bg: 'bg-orange-500', icon: '⚠️' },
    error: { bg: 'bg-red-500', icon: '❌' },
  };

  const { bg, icon } = colors[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`${bg} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md`}>
            <span className="text-2xl">{icon}</span>
            <p className="font-medium">{message}</p>
            <button
              onClick={onClose}
              className="ml-4 hover:opacity-70 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}