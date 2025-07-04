import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimeInput({ value, onChange, className = "", placeholder = "00:00" }: TimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h);
      setMinutes(m);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    const h = newHours.padStart(2, '0');
    const m = newMinutes.padStart(2, '0');
    onChange(`${h}:${m}`);
  };

  const generateHours = () => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  };

  const generateMinutes = () => {
    return ['00', '15', '30', '45'];
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors bg-white dark:bg-gray-800 flex items-center space-x-1"
      >
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{value || placeholder}</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 flex space-x-2"
        >
          <div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hour</div>
            <div className="h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded">
              {generateHours().map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    setHours(h);
                    handleTimeChange(h, minutes || '00');
                  }}
                  className={`block w-full px-3 py-1 text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 ${
                    hours === h ? 'bg-orange-100 dark:bg-orange-900/30 font-medium text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Minute</div>
            <div className="h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded">
              {generateMinutes().map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMinutes(m);
                    handleTimeChange(hours || '00', m);
                    setIsOpen(false);
                  }}
                  className={`block w-full px-3 py-1 text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 ${
                    minutes === m ? 'bg-orange-100 dark:bg-orange-900/30 font-medium text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}