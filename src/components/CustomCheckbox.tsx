import { motion, AnimatePresence } from 'framer-motion';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function CustomCheckbox({ checked, onChange, label, className = "" }: CustomCheckboxProps) {
  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <motion.div
          animate={{
            backgroundColor: checked ? '#FF6B35' : '#fff',
            borderColor: checked ? '#FF6B35' : '#d1d5db',
          }}
          className="w-5 h-5 border-2 rounded transition-colors"
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-full h-full text-white p-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {label && <span className="ml-3 text-gray-700">{label}</span>}
    </label>
  );
}