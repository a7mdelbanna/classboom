import { motion } from 'framer-motion';
import type { ImportResult } from '../types/import.types';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineDownload, HiOutlineRefresh } from 'react-icons/hi';
import { Confetti } from '../../../components/Confetti';

interface ImportResultsProps {
  result: ImportResult;
  onNewImport: () => void;
  terminology: any;
}

export function ImportResults({ result, onNewImport, terminology }: ImportResultsProps) {
  const downloadErrorReport = () => {
    if (result.errors.length === 0) return;
    
    const csv = [
      ['Row', 'Error Message', 'Student Name'],
      ...result.errors.map(error => [
        error.row,
        error.message,
        error.data ? `${error.data.first_name} ${error.data.last_name}` : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import_errors.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const isCompleteSuccess = result.failedRows === 0;

  return (
    <div className="space-y-6">
      {/* Success Confetti */}
      {isCompleteSuccess && <Confetti />}

      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            isCompleteSuccess 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-yellow-100 dark:bg-yellow-900/30'
          }`}
        >
          {isCompleteSuccess ? (
            <HiOutlineCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          ) : (
            <HiOutlineExclamationCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          )}
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {isCompleteSuccess ? 'Import Complete!' : 'Import Completed with Errors'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {isCompleteSuccess 
            ? `All ${terminology.students.toLowerCase()} were imported successfully.`
            : `Some ${terminology.students.toLowerCase()} could not be imported.`
          }
        </p>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
        >
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
            Total Processed
          </p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {result.totalRows}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
        >
          <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
            Successfully Imported
          </p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">
            {result.successfulRows}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4"
        >
          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
            Failed to Import
          </p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-300">
            {result.failedRows}
          </p>
        </motion.div>
      </div>

      {/* Error Details */}
      {result.errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-red-700 dark:text-red-300">
              Import Errors
            </h4>
            <button
              type="button"
              onClick={downloadErrorReport}
              className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <HiOutlineDownload className="w-4 h-4" />
              <span>Download Error Report</span>
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {result.errors.slice(0, 10).map((error, index) => (
              <div key={index} className="text-sm text-red-600 dark:text-red-400">
                Row {error.row}: {error.message}
              </div>
            ))}
            {result.errors.length > 10 && (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ... and {result.errors.length - 10} more errors
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          type="button"
          onClick={onNewImport}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          <HiOutlineRefresh className="w-5 h-5" />
          <span>Import More {terminology.students}</span>
        </button>
      </div>

      {/* Success Tips */}
      {isCompleteSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-green-700 dark:text-green-300">
            <span className="font-medium">What's next?</span> You can now:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-green-600 dark:text-green-400 space-y-1">
            <li>View all imported {terminology.students.toLowerCase()} in the {terminology.students} list</li>
            <li>Send portal invitations to {terminology.students.toLowerCase()} and parents</li>
            <li>Assign {terminology.students.toLowerCase()} to classes</li>
            <li>Import additional {terminology.students.toLowerCase()} if needed</li>
          </ul>
        </div>
      )}
    </div>
  );
}